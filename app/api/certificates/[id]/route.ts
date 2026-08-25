import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";
import {
  checkCertificateEligibility,
  renderCertificateHTMLFromSnapshot,
  encodeCertificatePayload,
  extractCertificateSnapshot,
  CertificateSnapshotData,
  formatResultLabel,
  generateCertificateNumber,
  generateVerificationToken,
  createAuditHistoryItem,
} from "@/lib/certificate";

/**
 * GET /api/certificates/[id]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Certificate ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Supabase client unavailable" }, { status: 500 });
    }

    const { data: cert, error: certErr } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (certErr || !cert) {
      return NextResponse.json({ success: false, error: "Certificate record not found" }, { status: 404 });
    }

    const snapshot = extractCertificateSnapshot(cert.certificate_url);

    // Fetch participant & registration details
    const { data: reg } = await supabase.from("registrations").select("*").eq("id", cert.registration_id).maybeSingle();
    const { data: participant } = await supabase.from("participants").select("*").eq("id", cert.participant_id).maybeSingle();
    const { data: eventData } = await supabase.from("events").select("*").eq("id", cert.event_id).maybeSingle();
    const { data: catData } = reg?.category_id ? await supabase.from("event_categories").select("name").eq("id", reg.category_id).maybeSingle() : { data: null };

    // Fetch round if present
    let roundName = "Final Round";
    if (cert.round_id) {
      const { data: roundData } = await supabase.from("competition_rounds").select("name").eq("id", cert.round_id).maybeSingle();
      if (roundData?.name) roundName = roundData.name;
    }

    // Build history if missing
    let historyLogs = cert.history || snapshot?.history_logs || [];
    if (!Array.isArray(historyLogs) || historyLogs.length === 0) {
      historyLogs = [
        createAuditHistoryItem("created", "Certificate Record Created", `Created on ${new Date(cert.created_at).toLocaleDateString("en-IN")}`),
        createAuditHistoryItem("issued", "Certificate Issued", `Issued on ${cert.issued_at ? new Date(cert.issued_at).toLocaleDateString("en-IN") : "Creation"}`),
      ];
      if (cert.status === "revoked") {
        historyLogs.push(createAuditHistoryItem("revoked", "Certificate Revoked", cert.revoke_reason || "Revoked by admin"));
      }
    }

    return NextResponse.json({
      success: true,
      certificate: {
        ...cert,
        history: historyLogs,
        snapshot_data: snapshot,
        participant_name: snapshot?.participant_name || participant?.full_name || "Participant",
        participant_number: snapshot?.participant_number || participant?.participant_number || cert.participant_id,
        participant_email: participant?.email || "",
        registration_number: reg?.registration_number || "",
        event_title: snapshot?.event_title || eventData?.title || "CGS Event",
        competition_name: snapshot?.competition_name || catData?.name || "General",
        category_name: snapshot?.category_name || catData?.name || "General",
        round_name: snapshot?.round_name || roundName,
        participation_type: snapshot?.participation_type || "Solo",
        result_type: cert.certificate_type,
      },
    });
  } catch (err: any) {
    console.error("GET /api/certificates/[id] exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/certificates/[id]
 * Reissue or Revoke an existing certificate with mandatory reason tracking & history audit trail.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error || "Unauthorized admin access" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Certificate ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const {
      reissue_reason = "Reissued by admin",
      participant_display_name = null,
      certificate_title = null,
      authorized_signatory = null,
      custom_issue_date = null,
      action_type = "reissue", // 'reissue' | 'revoke' | 'update_status'
      new_status = null,
    } = body;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Supabase client unavailable" }, { status: 500 });
    }

    // 1. Fetch existing certificate
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!existingCert) {
      return NextResponse.json({ success: false, error: "Certificate record not found" }, { status: 404 });
    }

    let currentHistory: any[] = existingCert.history || [];
    if (!Array.isArray(currentHistory)) currentHistory = [];

    // REVOCATION WORKFLOW
    if (action_type === "revoke") {
      const revokeReasonText = reissue_reason || "Revoked by administrator";
      const revokeHistoryItem = createAuditHistoryItem("revoked", "Certificate Revoked", revokeReasonText);
      const updatedHistory = [...currentHistory, revokeHistoryItem];

      const { data: revokedCert, error: revErr } = await supabase
        .from("certificates")
        .update({
          status: "revoked",
          revoke_reason: revokeReasonText,
          history: updatedHistory,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (revErr) {
        return NextResponse.json({ success: false, error: revErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Certificate ${existingCert.certificate_number} has been revoked.`,
        certificate: {
          ...revokedCert,
          history: updatedHistory,
        },
      });
    }

    // STATUS UPDATE WORKFLOW (Draft / Pending / Issued)
    if (action_type === "update_status" && new_status) {
      const statusHistoryItem = createAuditHistoryItem("updated", `Status Updated to ${new_status.toUpperCase()}`, `Updated by admin to ${new_status}`);
      const updatedHistory = [...currentHistory, statusHistoryItem];

      const { data: updatedCert, error: upErr } = await supabase
        .from("certificates")
        .update({
          status: new_status,
          history: updatedHistory,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (upErr) {
        return NextResponse.json({ success: false, error: upErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Certificate status updated to ${new_status}.`,
        certificate: {
          ...updatedCert,
          history: updatedHistory,
        },
      });
    }

    // REISSUE WORKFLOW
    // 2. Fetch registration, participant, and event
    const { data: registration } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", existingCert.registration_id)
      .maybeSingle();

    if (!registration) {
      return NextResponse.json({ success: false, error: "Associated registration no longer exists" }, { status: 404 });
    }

    const { data: participant } = await supabase
      .from("participants")
      .select("*")
      .eq("id", registration.participant_id)
      .maybeSingle();

    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .eq("id", registration.event_id)
      .maybeSingle();

    // 3. Fetch assigned result from Participant Registry
    let latestResultType = "pending";
    try {
      const { data: dbResult } = await supabase
        .from("event_results")
        .select("result_type")
        .eq("event_id", registration.event_id)
        .eq("participant_id", registration.participant_id)
        .maybeSingle();
      if (dbResult?.result_type) {
        latestResultType = dbResult.result_type;
      }
    } catch {}

    if (latestResultType === "pending" && registration.notes) {
      try {
        const parsed = typeof registration.notes === "string" ? JSON.parse(registration.notes) : registration.notes;
        if (parsed?.result?.result_type) {
          latestResultType = parsed.result.result_type;
        }
      } catch {}
    }

    const eligibility = checkCertificateEligibility(latestResultType);
    if (!eligibility.eligible || !eligibility.certificateType) {
      return NextResponse.json(
        { success: false, error: `Current result '${latestResultType}' is ineligible for certificate.` },
        { status: 400 }
      );
    }

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

    // Mark previous certificate as revoked/superseded
    const revokeOldHistoryItem = createAuditHistoryItem("revoked", "Certificate Superseded", `Reissued as new certificate. Reason: ${reissue_reason}`);
    const updatedOldHistory = [...currentHistory, revokeOldHistoryItem];

    await supabase
      .from("certificates")
      .update({
        status: "revoked",
        revoke_reason: `Reissued as new version. Reason: ${reissue_reason}`,
        history: updatedOldHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Create new certificate version
    const newCertNumber = generateCertificateNumber();
    const newVerificationToken = generateVerificationToken();
    const newIssueDateStr = custom_issue_date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const resultMeta = formatResultLabel(latestResultType);

    const existingSnapshot = extractCertificateSnapshot(existingCert.certificate_url);

    const newHistory: any[] = [
      createAuditHistoryItem("created", "Certificate Reissued", `Reissued from ${existingCert.certificate_number}. Reason: ${reissue_reason}`),
      createAuditHistoryItem("issued", "New Certificate Version Issued", `Issued on ${newIssueDateStr}`),
    ];

    const newSnapshot: CertificateSnapshotData = {
      participant_name: (participant_display_name || existingSnapshot?.participant_name || participant?.full_name || "Participant").trim(),
      participant_number: participant?.participant_number || `CGS-P-${registration.participant_id.substring(0, 6)}`,
      event_title: eventData?.title || "CGS Event",
      event_date: eventData?.event_date || null,
      venue: eventData?.venue || eventData?.city || null,
      category_name: categoryName,
      competition_name: categoryName,
      round_name: "Final Round",
      participation_type: compType,
      result_label: resultMeta.label,
      result_badge: resultMeta.badge,
      certificate_title: certificate_title || eligibility.title,
      subtitle: "Official Verified Credential",
      authorized_signatory: authorized_signatory || "CGS Management",
      signatory_title: "Event Director",
      organization_name: "CGS Entertainments",
      certificate_number: newCertNumber,
      verification_token: newVerificationToken,
      issue_date: newIssueDateStr,
      template_id: existingCert.template_id || null,
      background_url: existingSnapshot?.background_url || null,
      custom_notes: `Reissued from ${existingCert.certificate_number}. Reason: ${reissue_reason}`,
      revoke_reason: reissue_reason,
      reissued_from_id: existingCert.id,
      history_logs: newHistory,
      text_elements: existingSnapshot?.text_elements,
    };

    const newCertHTML = renderCertificateHTMLFromSnapshot(newSnapshot);
    const newCertPayloadUrl = encodeCertificatePayload(newSnapshot, newCertHTML);

    const newCertPayload: any = {
      certificate_number: newCertNumber,
      registration_id: registration.id,
      participant_id: registration.participant_id,
      event_id: registration.event_id,
      round_id: existingCert.round_id || null,
      template_id: existingCert.template_id || null,
      certificate_type: eligibility.certificateType,
      certificate_url: newCertPayloadUrl,
      verification_token: newVerificationToken,
      status: "issued",
      history: newHistory,
      reissued_from_id: existingCert.id,
      issued_at: new Date().toISOString(),
    };

    const { data: insertedNewCert, error: insertErr } = await supabase
      .from("certificates")
      .insert([newCertPayload])
      .select()
      .single();

    if (insertErr || !insertedNewCert) {
      return NextResponse.json({ success: false, error: insertErr?.message || "Failed to issue new certificate version" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Certificate ${newCertNumber} reissued successfully (reason: '${reissue_reason}'). Previous cert ${existingCert.certificate_number} marked superseded.`,
      certificate: {
        ...insertedNewCert,
        history: newHistory,
        snapshot_data: newSnapshot,
      },
    });
  } catch (err: any) {
    console.error("PUT /api/certificates/[id] exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/certificates/[id]
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error || "Unauthorized admin access" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Certificate ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Supabase client unavailable" }, { status: 500 });
    }

    const { error: deleteErr } = await supabase.from("certificates").delete().eq("id", id);
    if (deleteErr) {
      return NextResponse.json({ success: false, error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Certificate record deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/certificates/[id] exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
