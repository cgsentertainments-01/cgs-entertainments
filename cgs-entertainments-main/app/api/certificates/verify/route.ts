import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatResultLabel, CertificateSnapshotData } from "@/lib/certificate";

/**
 * GET /api/certificates/verify?query={certNumberOrToken}
 * Public Certificate Verification API.
 * Uses Immutable Certificate Snapshot Data.
 * Strictly omits sensitive PII (phone, email, address, Aadhaar/ID proof, payment).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || searchParams.get("token") || searchParams.get("number");

    if (!query || !query.trim()) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: "Please enter a Certificate Number or Verification Token to verify.",
      }, { status: 400 });
    }

    const cleanQuery = query.trim();

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, valid: false, error: "Database service unavailable" }, { status: 500 });
    }

    // Query DB by certificate_number or verification_token
    let { data: cert, error: certErr } = await supabase
      .from("certificates")
      .select("*")
      .or(`certificate_number.eq.${cleanQuery},verification_token.eq.${cleanQuery}`)
      .maybeSingle();

    if (certErr || !cert) {
      // Case-insensitive fallback lookup
      const { data: fallbackCert } = await supabase
        .from("certificates")
        .select("*")
        .ilike("certificate_number", cleanQuery)
        .maybeSingle();

      if (fallbackCert) {
        cert = fallbackCert;
      } else {
        return NextResponse.json({
          success: true,
          valid: false,
          message: `No official credential record matches '${cleanQuery}'.`,
        });
      }
    }

    // Parse Immutable Certificate Snapshot
    let snapshot: CertificateSnapshotData | null = null;
    if (cert.snapshot_data) {
      try {
        snapshot = typeof cert.snapshot_data === "string" ? JSON.parse(cert.snapshot_data) : cert.snapshot_data;
      } catch {}
    }

    // Fallback relational lookup if snapshot missing
    let participantName = snapshot?.participant_name || "Participant";
    let participantNumber = snapshot?.participant_number || cert.participant_id;
    let eventTitle = snapshot?.event_title || "CGS Event";
    let eventDate = snapshot?.event_date || null;
    let venue = snapshot?.venue || null;

    if (!snapshot) {
      const { data: participant } = await supabase.from("participants").select("full_name, participant_number").eq("id", cert.participant_id).maybeSingle();
      const { data: eventData } = await supabase.from("events").select("title, event_date, venue, city").eq("id", cert.event_id).maybeSingle();
      if (participant) {
        participantName = participant.full_name;
        participantNumber = participant.participant_number;
      }
      if (eventData) {
        eventTitle = eventData.title;
        eventDate = eventData.event_date;
        venue = eventData.venue || eventData.city;
      }
    }

    const resultMeta = formatResultLabel(snapshot?.result_label || cert.certificate_type);

    return NextResponse.json({
      success: true,
      valid: cert.status === "issued",
      status_label: cert.status === "issued" ? "VERIFIED & VALID" : cert.status === "revoked" ? "REVOKED / SUPERSEDED" : cert.status.toUpperCase(),
      verification: {
        status: cert.status === "issued" ? "VERIFIED & VALID" : "REVOKED",
        certificate_number: cert.certificate_number,
        verification_token: cert.verification_token,
        participant_name: participantName,
        participant_number: participantNumber,
        event_title: eventTitle,
        event_date: eventDate,
        venue: venue,
        category_name: snapshot?.category_name || "General",
        participation_type: snapshot?.participation_type || "Solo",
        certificate_type: cert.certificate_type,
        result_badge: resultMeta.badge,
        result_label: resultMeta.label,
        issued_at: cert.issued_at || cert.created_at,
        revoke_reason: cert.status === "revoked" ? cert.revoke_reason || "Revoked by administrator" : null,
      },
    });
  } catch (err: any) {
    console.error("GET /api/certificates/verify exception:", err);
    return NextResponse.json({ success: false, valid: false, error: err.message }, { status: 500 });
  }
}
