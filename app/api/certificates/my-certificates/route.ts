import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { extractCertificateSnapshot, formatResultLabel } from "@/lib/certificate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/certificates/my-certificates
 * Retrieves all issued certificates belonging to the authenticated user via email/participant/registration relationships.
 */
export async function GET(request: Request) {
  try {
    const supabaseServer = await createClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in.", certificates: [] }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "Database connection unavailable.", certificates: [] }, { status: 500 });
    }

    const userEmail = user.email.trim().toLowerCase();

    // Step 1: Find participant records by email or auth user_id
    const { data: participants, error: partErr } = await supabaseAdmin
      .from("participants")
      .select("id, full_name, email, participant_number")
      .ilike("email", userEmail);

    if (partErr) {
      console.error("[PROFILE CERTIFICATES] Error fetching participants:", partErr.message);
    }

    const matchingParticipantIds = (participants || []).map((p) => p.id);

    // Step 2: Find registrations linked to participant IDs or user email/id
    let registrationIds: string[] = [];
    if (matchingParticipantIds.length > 0) {
      const { data: regs } = await supabaseAdmin
        .from("registrations")
        .select("id, participant_id")
        .in("participant_id", matchingParticipantIds);

      if (regs) {
        registrationIds = regs.map((r) => r.id);
      }
    }

    // Step 3: Fetch issued certificates where registration_id or participant_id matches
    let rawCertificates: any[] = [];
    if (registrationIds.length > 0 || matchingParticipantIds.length > 0) {
      let query = supabaseAdmin
        .from("certificates")
        .select("*")
        .eq("status", "issued")
        .order("issued_at", { ascending: false });

      if (registrationIds.length > 0 && matchingParticipantIds.length > 0) {
        query = query.or(`registration_id.in.(${registrationIds.join(",")}),participant_id.in.(${matchingParticipantIds.join(",")})`);
      } else if (registrationIds.length > 0) {
        query = query.in("registration_id", registrationIds);
      } else {
        query = query.in("participant_id", matchingParticipantIds);
      }

      const { data: certs, error: certErr } = await query;

      if (certErr) {
        console.error("[PROFILE CERTIFICATES] DB Error fetching certificates:", certErr.message);
      } else {
        rawCertificates = certs || [];
      }
    }

    // Step 4: Enrich certificate records with Event & Category details
    const eventIds = Array.from(new Set(rawCertificates.map((c) => c.event_id).filter(Boolean)));
    let eventsMap: Record<string, any> = {};
    if (eventIds.length > 0) {
      const { data: evts } = await supabaseAdmin.from("events").select("id, title, event_date, venue, city").in("id", eventIds);
      (evts || []).forEach((e) => {
        eventsMap[e.id] = e;
      });
    }

    const formattedCertificates = rawCertificates.map((c) => {
      const snapshot = extractCertificateSnapshot(c.certificate_url);
      const event = eventsMap[c.event_id];
      const resultMeta = formatResultLabel(c.certificate_type);

      return {
        id: c.id,
        certificate_number: c.certificate_number,
        registration_id: c.registration_id,
        participant_id: c.participant_id,
        event_id: c.event_id,
        certificate_type: c.certificate_type,
        status: c.status,
        issued_at: c.issued_at,
        verification_token: c.verification_token,
        certificate_url: c.certificate_url,
        
        // Extracted & Fallback Data
        certificate_title: snapshot?.certificate_title || `Certificate of ${c.certificate_type.toUpperCase()}`,
        participant_name: snapshot?.participant_name || "Participant",
        participant_number: snapshot?.participant_number || "CGS-P-000000",
        event_title: snapshot?.event_title || event?.title || "CGS Event",
        event_date: snapshot?.event_date || event?.event_date || null,
        venue: snapshot?.venue || event?.venue || null,
        category_name: snapshot?.category_name || "General",
        participation_type: snapshot?.participation_type || "Solo",
        result_label: resultMeta.label,
        result_badge: resultMeta.badge,
        issue_date_str: snapshot?.issue_date || new Date(c.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        authorized_signatory: snapshot?.authorized_signatory || "CGS Management",
        organization_name: snapshot?.organization_name || "CGS Entertainments",
        snapshot_data: snapshot,
      };
    });

    console.log("[PROFILE CERTIFICATES]", {
      userId: user.id,
      userEmail: userEmail,
      matchingParticipantIds,
      registrationIds,
      certificateCount: formattedCertificates.length,
    });

    return NextResponse.json({
      success: true,
      certificates: formattedCertificates,
    });
  } catch (err: any) {
    console.error("[PROFILE CERTIFICATES] Exception:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch user certificates", certificates: [] }, { status: 500 });
  }
}
