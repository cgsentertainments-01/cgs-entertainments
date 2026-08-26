import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";
import { createAdminNotification } from "@/lib/notifications";
import {
  checkCertificateEligibility,
  generateCertificateNumber,
  generateVerificationToken,
  renderCertificateHTMLFromSnapshot,
  encodeCertificatePayload,
  extractCertificateSnapshot,
  CertificateSnapshotData,
  formatResultLabel,
  createAuditHistoryItem,
  formatCertificateTypeLabel,
} from "@/lib/certificate";

const BUCKET_NAME = "certificates";
const REGISTRY_FILE_PATH = "templates/templates_registry.json";

async function getStoredTemplatesFromStorage(supabase: any) {
  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(REGISTRY_FILE_PATH);
    if (error || !data) return [];
    const text = await data.text();
    return JSON.parse(text) || [];
  } catch {
    return [];
  }
}

/**
 * GET /api/certificates
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase client unavailable", certificates: [], eligibleRegistrations: [], templates: [], counters: {} },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventIdParam = searchParams.get("eventId") || searchParams.get("event_id");

    // 1. Fetch generated certificates
    let certQuery = supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });

    if (eventIdParam && eventIdParam !== "all") {
      certQuery = certQuery.eq("event_id", eventIdParam);
    }

    const { data: rawCerts, error: certErr } = await certQuery;

    if (certErr) {
      console.error("GET /api/certificates DB error:", certErr.message);
      return NextResponse.json({ success: false, error: certErr.message, certificates: [], eligibleRegistrations: [], templates: [], counters: {} }, { status: 500 });
    }

    const certificatesList = rawCerts || [];

    // 2. Fetch registrations (Source of truth)
    let regQuery = supabase
      .from("registrations")
      .select("id, registration_number, event_id, participant_id, category_id, dance_style_id, registration_status, payment_status, amount, notes, created_at")
      .order("created_at", { ascending: false });

    if (eventIdParam && eventIdParam !== "all") {
      regQuery = regQuery.eq("event_id", eventIdParam);
    }

    const { data: rawRegs } = await regQuery;

    const regsList = rawRegs || [];
    const regsMap: Record<string, any> = {};
    regsList.forEach((r) => {
      regsMap[r.id] = r;
    });

    // 3. Fetch linked participants
    const participantIds = Array.from(new Set(regsList.map((r) => r.participant_id).filter(Boolean)));
    let participantsMap: Record<string, any> = {};
    if (participantIds.length > 0) {
      const { data: parts } = await supabase
        .from("participants")
        .select("id, participant_number, full_name, email, phone, city, state, profile_photo")
        .in("id", participantIds);
      (parts || []).forEach((p) => {
        participantsMap[p.id] = p;
      });
    }

    // 4. Fetch linked events
    const eventIds = Array.from(new Set(regsList.map((r) => r.event_id).filter(Boolean)));
    let eventsMap: Record<string, any> = {};
    if (eventIds.length > 0) {
      const { data: evts } = await supabase
        .from("events")
        .select("id, title, event_date, venue, city")
        .in("id", eventIds);
      (evts || []).forEach((e) => {
        eventsMap[e.id] = e;
      });
    }

    // 5. Fetch linked categories / competitions
    const categoryIds = Array.from(new Set(regsList.map((r) => r.category_id).filter(Boolean)));
    let categoriesMap: Record<string, any> = {};
    if (categoryIds.length > 0) {
      const { data: cats } = await supabase
        .from("event_categories")
        .select("id, name")
        .in("id", categoryIds);
      (cats || []).forEach((c) => {
        categoriesMap[c.id] = c;
      });
    }

    // 6. Fetch competition rounds
    let roundsMap: Record<string, any> = {};
    try {
      const { data: dbRounds } = await supabase.from("competition_rounds").select("id, name, round_number, event_id");
      (dbRounds || []).forEach((rd) => {
        roundsMap[rd.id] = rd;
      });
    } catch {}

    // 7. Fetch assigned results
    let resultsMap: Record<string, any> = {};
    if (participantIds.length > 0) {
      try {
        const { data: resList } = await supabase
          .from("event_results")
          .select("*")
          .in("participant_id", participantIds);
        (resList || []).forEach((r) => {
          resultsMap[`${r.event_id}_${r.participant_id}`] = r;
        });
      } catch {}
    }

    // 8. Fetch active templates
    let templatesList: any[] = [];
    try {
      const { data: dbTpls } = await supabase
        .from("certificate_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (dbTpls && dbTpls.length > 0) {
        templatesList = dbTpls;
      } else {
        templatesList = await getStoredTemplatesFromStorage(supabase);
      }
    } catch {
      templatesList = await getStoredTemplatesFromStorage(supabase);
    }

    // Build valid generated certificates array
    const validGeneratedCertificates: any[] = [];
    certificatesList.forEach((c) => {
      const reg = regsMap[c.registration_id];
      const participant = c.participant_id ? participantsMap[c.participant_id] : reg ? participantsMap[reg.participant_id] : null;
      const event = c.event_id ? eventsMap[c.event_id] : reg ? eventsMap[reg.event_id] : null;
      const category = reg ? categoriesMap[reg.category_id] : null;
      const round = c.round_id ? roundsMap[c.round_id] : null;

      let snapshotData = extractCertificateSnapshot(c.certificate_url);

      const assignedResult = reg && participant ? resultsMap[`${reg.event_id}_${reg.participant_id}`] : null;
      const currentResultType = assignedResult?.result_type || c.certificate_type;
      const resultMismatch = assignedResult && assignedResult.result_type.toLowerCase() !== c.certificate_type.toLowerCase();

      // Ensure history array exists
      let historyLogs = c.history || snapshotData?.history_logs || [];
      if (!Array.isArray(historyLogs) || historyLogs.length === 0) {
        historyLogs = [
          createAuditHistoryItem("created", "Certificate Created", "Initial record created in database"),
          createAuditHistoryItem("issued", "Certificate Issued", `Issued on ${c.issued_at ? new Date(c.issued_at).toLocaleDateString("en-IN") : "Creation"}`),
        ];
        if (c.status === "revoked") {
          historyLogs.push(createAuditHistoryItem("revoked", "Certificate Revoked", c.revoke_reason || "Revoked by admin"));
        }
      }

      validGeneratedCertificates.push({
        ...c,
        participant_name: snapshotData?.participant_name || participant?.full_name || "Unknown Participant",
        participant_number: snapshotData?.participant_number || participant?.participant_number || "CGS-P-000000",
        participant_email: participant?.email || "",
        registration_number: reg?.registration_number || `REG-${c.registration_id.substring(0, 6)}`,
        event_title: snapshotData?.event_title || event?.title || "CGS Event",
        event_date: snapshotData?.event_date || event?.event_date || null,
        venue: snapshotData?.venue || event?.venue || null,
        category_name: snapshotData?.category_name || category?.name || "General",
        competition_name: snapshotData?.competition_name || category?.name || "General",
        round_name: snapshotData?.round_name || round?.name || "Final",
        participation_type: snapshotData?.participation_type || "Solo",
        result_type: assignedResult?.result_type || c.certificate_type,
        certificate_type_label: formatCertificateTypeLabel(c.certificate_type),
        result_mismatch: Boolean(resultMismatch),
        current_eligible_type: currentResultType,
        history: historyLogs,
        snapshot_data: snapshotData,
      });
    });

    // Build eligible registrations list for pending certificates tab
    const eligibleRegistrations: any[] = [];
    regsList.forEach((reg) => {
      const alreadyHasIssuedCert = validGeneratedCertificates.some(
        (c) => c.registration_id === reg.id && c.status === "issued"
      );

      const participant = participantsMap[reg.participant_id];
      if (!participant) return;

      const event = eventsMap[reg.event_id];
      const category = categoriesMap[reg.category_id];

      let parsedNotes: any = {};
      if (reg.notes) {
        try {
          parsedNotes = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes;
        } catch {}
      }

      const assignedResult =
        resultsMap[`${reg.event_id}_${reg.participant_id}`] ||
        parsedNotes.result || { result_type: "pending" };

      const resultType = assignedResult.result_type || "pending";
      const eligibility = checkCertificateEligibility(resultType);

      eligibleRegistrations.push({
        registration_id: reg.id,
        registration_number: reg.registration_number,
        participant_id: reg.participant_id,
        participant_name: participant.full_name,
        participant_number: participant.participant_number || `CGS-P-${participant.id.substring(0, 6)}`,
        participant_email: participant.email,
        event_id: reg.event_id,
        event_title: event?.title || "CGS Event",
        event_date: event?.event_date || null,
        venue: event?.venue || null,
        category_id: reg.category_id,
        category_name: category?.name || "General",
        competition_name: category?.name || "General",
        participation_type: (reg as any).participation_type || parsedNotes.participationType || parsedNotes.participation_type || parsedNotes.compType || "Solo",
        result_type: resultType,
        position: assignedResult.position !== undefined && assignedResult.position !== null ? Number(assignedResult.position) : null,
        score: assignedResult.score !== undefined && assignedResult.score !== null ? Number(assignedResult.score) : null,
        is_eligible: eligibility.eligible,
        already_has_cert: alreadyHasIssuedCert,
        certificate_type: eligibility.certificateType,
        eligibility_reason: eligibility.reason || null,
      });
    });

    // Extract unique options for filters
    const filterOptions = {
      events: Array.from(new Set(Object.values(eventsMap).map((e: any) => e.title))),
      competitions: Array.from(new Set(Object.values(categoriesMap).map((c: any) => c.name))),
      certificate_types: ["winner", "runner_up", "finalist", "appreciation", "participation", "achievement", "custom"],
      statuses: ["issued", "pending", "draft", "revoked"],
    };

    // Compute summary dashboard metrics:
    // Total Certificates: All certificates in DB
    // Issued: status === 'issued'
    // Pending: eligible registrations awaiting issue
    // Draft: status === 'draft'
    // Revoked: status === 'revoked'
    const issuedCount = validGeneratedCertificates.filter((c) => c.status === "issued").length;
    const draftCount = validGeneratedCertificates.filter((c) => c.status === "draft").length;
    const revokedCount = validGeneratedCertificates.filter((c) => c.status === "revoked").length;
    const pendingCount = eligibleRegistrations.filter((r) => r.is_eligible && !r.already_has_cert).length;
    const totalCertificates = validGeneratedCertificates.length + pendingCount;

    const counters = {
      total_certificates: totalCertificates,
      total_generated: issuedCount,
      issued: issuedCount,
      pending: pendingCount,
      draft: draftCount,
      revoked: revokedCount,
      revoked_count: revokedCount,
      eligible_awaiting: pendingCount,
      winner: validGeneratedCertificates.filter((c) => c.status === "issued" && c.certificate_type === "winner").length,
      runner_up: validGeneratedCertificates.filter((c) => c.status === "issued" && (c.certificate_type === "runner_up" || c.certificate_type === "runner-up")).length,
      finalist: validGeneratedCertificates.filter((c) => c.status === "issued" && (c.certificate_type === "finalist" || c.certificate_type === "merit")).length,
      appreciation: validGeneratedCertificates.filter((c) => c.status === "issued" && (c.certificate_type === "appreciation" || c.certificate_type === "special_mention")).length,
      participation: validGeneratedCertificates.filter((c) => c.status === "issued" && c.certificate_type === "participation").length,
      achievement: validGeneratedCertificates.filter((c) => c.status === "issued" && c.certificate_type === "achievement").length,
    };

    return NextResponse.json({
      success: true,
      certificates: validGeneratedCertificates,
      eligibleRegistrations,
      templates: templatesList,
      filterOptions,
      counters,
    });
  } catch (err: any) {
    console.error("GET /api/certificates exception:", err);
    return NextResponse.json({ success: false, error: err.message, certificates: [], eligibleRegistrations: [], templates: [], counters: {} }, { status: 500 });
  }
}

/**
 * POST /api/certificates
 * Single or Bulk Certificate Issuance with Duplicate Checks & History Logging
 */
export async function POST(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error || "Unauthorized admin access" }, { status: 401 });
    }

    const body = await request.json();
    const {
      registration_ids = [], // Array for bulk issue
      registration_id = null, // Single issue fallback
      round_id = null,
      round_name = null,
      template_id = null,
      background_url = null,
      certificate_type_override = null,
      participant_display_name = null,
      certificate_title = null,
      subtitle = null,
      authorized_signatory = null,
      custom_issue_date = null,
      custom_notes = null,
      allow_participation = true,
      text_elements = null,
      force_duplicate = false,
    } = body;

    const idsToProcess: string[] = Array.isArray(registration_ids) && registration_ids.length > 0
      ? registration_ids
      : registration_id
      ? [registration_id]
      : [];

    if (idsToProcess.length === 0) {
      return NextResponse.json({ success: false, error: "At least one registration_id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Supabase client unavailable" }, { status: 500 });
    }

    // Process each registration
    const createdCertificates: any[] = [];
    const duplicatesSkipped: any[] = [];

    for (const regId of idsToProcess) {
      // 1. Validate Registration
      const { data: registration } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", regId)
        .maybeSingle();

      if (!registration) continue;

      // 2. Validate Participant
      const { data: participant } = await supabase
        .from("participants")
        .select("*")
        .eq("id", registration.participant_id)
        .maybeSingle();

      if (!participant) continue;

      // 3. Validate Event
      const { data: eventData } = await supabase
        .from("events")
        .select("id, title, event_date, venue, city")
        .eq("id", registration.event_id)
        .maybeSingle();

      if (!eventData) continue;

      // 4. Check for existing active certificate (DUPLICATE PREVENTION)
      const { data: existingCert } = await supabase
        .from("certificates")
        .select("*")
        .eq("registration_id", regId)
        .eq("status", "issued")
        .maybeSingle();

      if (existingCert && !force_duplicate) {
        if (idsToProcess.length === 1) {
          // Single item mode: Return 409 Conflict with view existing details
          return NextResponse.json(
            {
              success: false,
              already_issued: true,
              error: "Certificate already issued for this registration.",
              existingCertificate: existingCert,
            },
            { status: 409 }
          );
        } else {
          // Bulk mode: Skip duplicate
          duplicatesSkipped.push({
            registration_id: regId,
            participant_name: participant.full_name,
            existing_cert_number: existingCert.certificate_number,
          });
          continue;
        }
      }

      // 5. Fetch assigned result from Participant Registry
      let assignedResultType = "pending";
      try {
        const { data: dbResult } = await supabase
          .from("event_results")
          .select("result_type")
          .eq("event_id", registration.event_id)
          .eq("participant_id", registration.participant_id)
          .maybeSingle();
        if (dbResult?.result_type) {
          assignedResultType = dbResult.result_type;
        }
      } catch {}

      if (assignedResultType === "pending" && registration.notes) {
        try {
          const parsed = typeof registration.notes === "string" ? JSON.parse(registration.notes) : registration.notes;
          if (parsed?.result?.result_type) {
            assignedResultType = parsed.result.result_type;
          }
        } catch {}
      }

      // If override provided, use it
      const targetCertType = certificate_type_override || assignedResultType;

      // 6. Validate Eligibility
      const eligibility = checkCertificateEligibility(targetCertType, allow_participation);
      if (!eligibility.eligible || !eligibility.certificateType) {
        if (idsToProcess.length === 1) {
          return NextResponse.json(
            { success: false, error: eligibility.reason || `Result status '${targetCertType}' is not eligible for certificate generation.` },
            { status: 400 }
          );
        }
        continue;
      }

      // 7. Resolve Selected Template Image
      let resolvedBackgroundUrl = background_url || null;
      let resolvedTemplateName = null;

      if (template_id) {
        try {
          const { data: tplRecord } = await supabase
            .from("certificate_templates")
            .select("*")
            .eq("id", template_id)
            .maybeSingle();

          if (tplRecord) {
            resolvedBackgroundUrl = tplRecord.background_url || resolvedBackgroundUrl;
            resolvedTemplateName = tplRecord.name || null;
          } else {
            const storageList = await getStoredTemplatesFromStorage(supabase);
            const found = storageList.find((t: any) => t.id === template_id);
            if (found) {
              resolvedBackgroundUrl = found.background_url || resolvedBackgroundUrl;
              resolvedTemplateName = found.name || null;
            }
          }
        } catch {}
      }

      // 8. Category & Competition details
      let categoryName = "General";
      let compType = registration.participation_type || "Solo";
      if (registration.notes) {
        try {
          const parsed = typeof registration.notes === "string" ? JSON.parse(registration.notes) : registration.notes;
          if (parsed.participationType || parsed.participation_type || parsed.compType) {
            compType = parsed.participationType || parsed.participation_type || parsed.compType;
          }
        } catch {}
      }
      if (registration.category_id) {
        const { data: cat } = await supabase.from("event_categories").select("name").eq("id", registration.category_id).maybeSingle();
        if (cat?.name) categoryName = cat.name;
      }

      const certNumber = generateCertificateNumber();
      const verificationToken = generateVerificationToken();
      const issueDateStr = custom_issue_date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      const resultMeta = formatResultLabel(assignedResultType);

      // Build Initial History Audit Logs
      const initialHistory: any[] = [
        createAuditHistoryItem("created", "Certificate Record Created", `Created for ${participant.full_name}`),
        createAuditHistoryItem("issued", "Certificate Issued", `Issued on ${issueDateStr}`),
      ];

      // 9. Create Immutable Snapshot Data
      const snapshot: CertificateSnapshotData = {
        participant_name: (participant_display_name || participant.full_name).trim(),
        participant_number: participant.participant_number || `CGS-P-${participant.id.substring(0, 6)}`,
        event_title: eventData.title,
        event_date: eventData.event_date,
        venue: eventData.venue || eventData.city,
        category_name: categoryName,
        competition_name: categoryName,
        round_name: round_name || "Final Round",
        participation_type: compType,
        result_label: resultMeta.label,
        result_badge: resultMeta.badge,
        certificate_title: certificate_title || eligibility.title,
        subtitle: subtitle || "Official Verified Credential",
        authorized_signatory: authorized_signatory || "CGS Management",
        signatory_title: "Event Director",
        organization_name: "CGS Entertainments",
        certificate_number: certNumber,
        verification_token: verificationToken,
        issue_date: issueDateStr,
        template_id: template_id || null,
        template_name: resolvedTemplateName,
        background_url: resolvedBackgroundUrl,
        custom_notes: custom_notes || null,
        history_logs: initialHistory,
        text_elements: Array.isArray(text_elements) && text_elements.length > 0 ? text_elements : undefined,
      };

      const certHTML = renderCertificateHTMLFromSnapshot(snapshot);
      const certPayloadUrl = encodeCertificatePayload(snapshot, certHTML);

      const certPayload: any = {
        certificate_number: certNumber,
        registration_id: registration.id,
        participant_id: registration.participant_id,
        event_id: registration.event_id,
        round_id: round_id || null,
        template_id: template_id || null,
        certificate_type: eligibility.certificateType,
        certificate_url: certPayloadUrl,
        verification_token: verificationToken,
        status: "issued",
        history: initialHistory,
        issued_at: new Date().toISOString(),
      };

      // Insert DB record
      const { data: insertedCert, error: insertErr } = await supabase
        .from("certificates")
        .insert([certPayload])
        .select()
        .single();

      if (insertErr || !insertedCert) {
        console.error("POST /api/certificates insert error:", insertErr?.message);
        continue;
      }

      createdCertificates.push({
        ...insertedCert,
        snapshot_data: snapshot,
      });

      // User notification
      try {
        await supabase.from("notifications").insert([
          {
            title: `🏆 Certificate Issued: ${snapshot.certificate_title}`,
            message: `Your official verified certificate (${certNumber}) for ${eventData.title} is now available in your profile!`,
            notification_type: "result",
            reference_type: "certificate",
            reference_id: insertedCert.id,
            link_url: `/profile#cert-${insertedCert.id}`,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch {}

      // Admin System Notification
      await createAdminNotification({
        title: "Certificate Issued",
        message: `Certificate (${certNumber}) issued for ${snapshot.participant_name} in ${eventData.title}`,
        type: "certificate",
        entityType: "certificate",
        entityId: insertedCert.id,
        linkUrl: "/admin/certificates",
        deduplicateKey: `cert_issued_${insertedCert.id}`,
        metadata: {
          certificate_number: certNumber,
          participant_name: snapshot.participant_name,
          event_title: eventData.title,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully issued ${createdCertificates.length} certificate(s).`,
      issued_count: createdCertificates.length,
      skipped_duplicates_count: duplicatesSkipped.length,
      certificates: createdCertificates,
      skipped_duplicates: duplicatesSkipped,
    });
  } catch (err: any) {
    console.error("POST /api/certificates exception:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to issue certificates" }, { status: 500 });
  }
}
