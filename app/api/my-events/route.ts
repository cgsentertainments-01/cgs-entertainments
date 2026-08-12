import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabaseServer = await createClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, myEvents: [] });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, myEvents: [] });
    }

    const userEmail = user.email ? user.email.toLowerCase() : "";

    // 1. Fetch matching participants for this email
    const { data: participants } = await supabaseAdmin
      .from("participants")
      .select("*")
      .ilike("email", userEmail);

    if (!participants || participants.length === 0) {
      return NextResponse.json({ success: true, myEvents: [] });
    }

    const participantIds = participants.map((p) => p.id);

    // 2. Fetch registrations for these participants
    const { data: registrations } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .in("participant_id", participantIds);

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({ success: true, myEvents: [] });
    }

    const eventIds = Array.from(new Set(registrations.map((r) => r.event_id).filter(Boolean)));

    // 3. Fetch Events
    const { data: eventsList } = await supabaseAdmin
      .from("events")
      .select("*")
      .in("id", eventIds);

    const eventsMap: Record<string, any> = {};
    (eventsList || []).forEach((evt) => {
      eventsMap[evt.id] = evt;
    });

    // 4. Fetch Event Results
    const { data: resultsList } = await supabaseAdmin
      .from("event_results")
      .select("*")
      .in("participant_id", participantIds);

    const resultsMap: Record<string, any> = {};
    (resultsList || []).forEach((res) => {
      resultsMap[`${res.event_id}_${res.participant_id}`] = res;
    });

    // 5. Combine data into MyEvents structure
    const myEvents = registrations.map((reg) => {
      const evt = eventsMap[reg.event_id] || {};
      const res = resultsMap[`${reg.event_id}_${reg.participant_id}`] || null;
      const part = participants.find((p) => p.id === reg.participant_id) || {};

      let parsedNotes: any = {};
      if (reg.notes) {
        try {
          parsedNotes = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes;
        } catch {
          parsedNotes = {};
        }
      }

      return {
        registration_id: reg.id,
        registration_number: reg.registration_number,
        registration_status: reg.registration_status || "confirmed",
        payment_status: reg.payment_status || "paid",
        amount: reg.amount,
        registration_date: reg.registration_date || reg.created_at,
        participant_id: reg.participant_id,
        participant_name: part.full_name,
        participant_number: part.participant_number,
        video_url: part.video_url || part.video_path || parsedNotes.videoUrl || null,

        event_id: reg.event_id,
        event_title: evt.title || "CGS Talent Event",
        event_slug: evt.slug || reg.event_id,
        event_date: evt.event_date || evt.date,
        venue: evt.venue || evt.location || "Venue TBA",
        city: evt.city || "Hyderabad",
        status: evt.status || "completed",

        // Assigned Result Data
        result: res
          ? {
              id: res.id,
              result_type: res.result_type,
              position: res.position,
              selected_at: res.selected_at,
              notes: res.notes,
            }
          : {
              result_type: "pending",
              position: 99,
              selected_at: null,
              notes: null,
            },
      };
    });

    return NextResponse.json({ success: true, myEvents });
  } catch (err: any) {
    console.error("GET /api/my-events exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
