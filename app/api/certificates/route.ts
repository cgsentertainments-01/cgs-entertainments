import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";
import {
  checkCertificateEligibility,
  generateCertificateNumber,
  generateVerificationToken,
  renderCertificateHTMLFromSnapshot,
  encodeCertificatePayload,
  extractCertificateSnapshot,
  CertificateSnapshotData,
  formatResultLabel,
} from "@/lib/certificate";

const BUCKET_NAME = "certificates";
const REGISTRY_FILE_PATH = "templates/templates_registry.json";

// Helper for storage registry fallback
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

    // 1. Fetch generated certificates
    const { data: rawCerts, error: certErr } = await supabase
      .from("certificates")
      .select("id, certificate_number, registration_id, participant_id, event_id, certificate_type, certificate_url, verification_token, issued_at, status, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (certErr) {
      console.error("GET /api/certificates DB error:", certErr.message);
      return NextResponse.json({ success: false, error: certErr.message, certificates: [], eligibleRegistrations: [], templates: [], counters: {} }, { status: 500 });
    }

    const certificatesList = rawCerts || [];

    // 2. Fetch registrations (Source of truth)
    const { data: rawRegs } = await supabase
      .from("registrations")
      .select("id, registration_number, event_id, participant_id, category_id, dance_style_id, registration_status, payment_status, amount, notes, created_at")
      .order("created_at", { ascending: false });

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

    // 5. Fetch linked categories
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

    // 6. Fetch assigned results
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

    // 7. Fetch active templates
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

      let snapshotData = extractCertificateSnapshot(c.certificate_url);

      const assignedResult = reg && participant ? resultsMap[`${reg.event_id}_${reg.participant_id}`] : null;
      const currentResultType = assignedResult?.result_type || c.certificate_type;
      const resultMismatch = assignedResult && assignedResult.result_type.toLowerCase() !== c.certificate_type.toLowerCase();

      validGeneratedCertificates.push({
        ...c,
        participant_name: snapshotData?.participant_name || participant?.full_name || "Unknown Participant",
        participant_number: snapshotData?.participant_number || participant?.participant_number || "CGS-P-000000",
        participant_email: participant?.email || "",
        event_title: snapshotData?.event_title || event?.title || "CGS Event",
        event_date: snapshotData?.event_date || event?.event_date || null,
        venue: snapshotData?.venue || event?.venue || null,
        category_name: snapshotData?.category_name || category?.name || "General",
        comp_type: snapshotData?.participation_type || "Solo",
        result_type: c.certificate_type,
        result_mismatch: Boolean(resultMismatch),
        current_eligible_type: currentResultType,
        snapshot_data: snapshotData,
      });
    });

    // Build eligible registrations list
    const eligibleRegistrations: any[] = [];
    regsList.forEach((reg) => {
      const alreadyHasIssuedCert = validGeneratedCertificates.some(
        (c) => c.registration_id === reg.id && c.status === "issued"
      );

      if (alreadyHasIssuedCert) return;

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
        category_name: category?.name || parsedNotes.compType || "General",
        comp_type: parsedNotes.compType || "Solo",
        result_type: resultType,
        is_eligible: eligibility.eligible,
        certificate_type: eligibility.certificateType,
        eligibility_reason: eligibility.reason || null,
      });
    });

    // Compute live counters
    const counters = {
      total_generated: validGeneratedCertificates.filter((c) => c.status === "issued").length,
      revoked_count: validGeneratedCertificates.filter((c) => c.status === "revoked").length,
      eligible_awaiting: eligibleRegistrations.filter((r) => r.is_eligible).length,
      ineligible_pending: eligibleRegistrations.filter((r) => !r.is_eligible).length,
      winner: validGeneratedCertificates.filter((c) => c.status === "issued" && c.certificate_type === "winner").length,
      runner_up: validGeneratedCertificates.filter((c) => c.status === "issued" && c.certificate_type === "runner_up").length,
      merit: validGeneratedCertificates.filter((c) => c.status === "issued" && c.certificate_type === "merit").length,
      appreciation: validGeneratedCertificates.filter((c) => c.status === "issued" && c.certificate_type === "appreciation").length,
      participation: validGeneratedCertificates.filter((c) => c.status === "issued" && c.certificate_type === "participation").length,
    };

    return NextResponse.json({
      success: true,
      certificates: validGeneratedCertificates,
      eligibleRegistrations,
      templates: templatesList,
      counters,
    });
  } catch (err: any) {
    console.error("GET /api/certificates exception:", err);
    return NextResponse.json({ success: false, error: err.message, certificates: [], eligibleRegistrations: [], templates: [], counters: {} }, { status: 500 });
  }
}

/**
 * POST /api/certificates
 */
export async function POST(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error || "Unauthorized admin access" }, { status: 401 });
    }

    const body = await request.json();
    const {
      registration_id,
      template_id = null,
      background_url = null,
      participant_display_name = null,
      certificate_title = null,
      subtitle = null,
      authorized_signatory = null,
      custom_issue_date = null,
      custom_notes = null,
      allow_participation = true,
      text_elements = null,
    } = body;

    if (!registration_id) {
      return NextResponse.json({ success: false, error: "registration_id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Supabase client unavailable" }, { status: 500 });
    }

    // 1. Validate Registration
    const { data: registration, error: regErr } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", registration_id)
      .maybeSingle();

    if (regErr || !registration) {
      return NextResponse.json({ success: false, error: "Registration record does not exist." }, { status: 404 });
    }

    // 2. Validate Participant
    const { data: participant } = await supabase
      .from("participants")
      .select("*")
      .eq("id", registration.participant_id)
      .maybeSingle();

    if (!participant) {
      return NextResponse.json({ success: false, error: "Participant record does not exist." }, { status: 404 });
    }

    // 3. Validate Event
    const { data: eventData } = await supabase
      .from("events")
      .select("id, title, event_date, venue, city")
      .eq("id", registration.event_id)
      .maybeSingle();

    if (!eventData) {
      return NextResponse.json({ success: false, error: "Event record does not exist." }, { status: 404 });
    }

    // 4. Fetch assigned result from Participant Registry
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

    // 5. Validate Eligibility
    const eligibility = checkCertificateEligibility(assignedResultType, allow_participation);
    if (!eligibility.eligible || !eligibility.certificateType) {
      return NextResponse.json(
        { success: false, error: eligibility.reason || `Result status '${assignedResultType}' is not eligible for certificate generation.` },
        { status: 400 }
      );
    }

    // 6. Duplicate Check
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("registration_id", registration_id)
      .eq("status", "issued")
      .maybeSingle();

    if (existingCert) {
      return NextResponse.json(
        {
          success: false,
          error: "Certificate already issued for this registration.",
          existingCertificate: existingCert,
        },
        { status: 409 }
      );
    }

    // 7. FETCH & VERIFY EXACT SELECTED TEMPLATE IMAGE FROM SUPABASE
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
          // Fallback check storage registry
          const storageList = await getStoredTemplatesFromStorage(supabase);
          const found = storageList.find((t: any) => t.id === template_id);
          if (found) {
            resolvedBackgroundUrl = found.background_url || resolvedBackgroundUrl;
            resolvedTemplateName = found.name || null;
          }
        }
      } catch (err) {
        console.warn("Template fetch note:", err);
      }
    }

    // 8. Category & Participation details
    let categoryName = "General";
    let compType = "Solo";
    if (registration.notes) {
      try {
        const parsed = typeof registration.notes === "string" ? JSON.parse(registration.notes) : registration.notes;
        if (parsed.compType) compType = parsed.compType;
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

    // 9. Create Immutable Snapshot Data with PRESERVED SELECTED TEMPLATE IMAGE
    const snapshot: CertificateSnapshotData = {
      participant_name: (participant_display_name || participant.full_name).trim(),
      participant_number: participant.participant_number || `CGS-P-${participant.id.substring(0, 6)}`,
      event_title: eventData.title,
      event_date: eventData.event_date,
      venue: eventData.venue || eventData.city,
      category_name: categoryName,
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
      text_elements: Array.isArray(text_elements) && text_elements.length > 0 ? text_elements : undefined,
    };

    // Render HTML & Encode Payload into certificate_url
    const certHTML = renderCertificateHTMLFromSnapshot(snapshot);
    const certPayloadUrl = encodeCertificatePayload(snapshot, certHTML);

    const certPayload: any = {
      certificate_number: certNumber,
      registration_id: registration.id,
      participant_id: registration.participant_id,
      event_id: registration.event_id,
      certificate_type: eligibility.certificateType,
      certificate_url: certPayloadUrl,
      verification_token: verificationToken,
      status: "issued",
      issued_at: new Date().toISOString(),
    };

    // 10. Save Certificate Record in Supabase DB
    const { data: insertedCert, error: insertErr } = await supabase
      .from("certificates")
      .insert([certPayload])
      .select()
      .single();

    if (insertErr || !insertedCert) {
      console.error("POST /api/certificates insert error:", insertErr?.message);
      return NextResponse.json(
        { success: false, error: insertErr?.message || "Failed to save certificate to database." },
        { status: 500 }
      );
    }

    // 11. Create User Notification for Certificate Availability
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
    } catch (notifErr) {
      console.warn("Notification insert note:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Certificate issued successfully",
      certificate: {
        ...insertedCert,
        snapshot_data: snapshot,
      },
    });
  } catch (err: any) {
    console.error("POST /api/certificates exception:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to issue certificate" }, { status: 500 });
  }
}
