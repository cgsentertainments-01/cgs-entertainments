import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized admin access", participants: [], events: [] },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: true, participants: [], events: [] });
    }

    // 1. Fetch participants list
    const { data: participants, error: partErr } = await supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: false });

    if (partErr) {
      console.warn("GET /api/participants DB warning:", partErr.message);
      return NextResponse.json({ success: true, participants: [], events: [], warning: partErr.message });
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json({ success: true, participants: [], events: [] });
    }

    const participantsMap: Record<string, any> = {};
    participants.forEach((p) => {
      participantsMap[p.id] = p;
    });

    const participantIds = participants.map((p) => p.id);

    // 2. Fetch registrations for all participants
    const { data: registrations } = await supabase
      .from("registrations")
      .select("*")
      .in("participant_id", participantIds)
      .order("created_at", { ascending: false });

    // 3. Fetch events & categories
    const { data: allEventsData } = await supabase
      .from("events")
      .select("id, title, slug, event_date, venue, city")
      .order("title", { ascending: true });

    const eventsMap: Record<string, any> = {};
    (allEventsData || []).forEach((e) => {
      eventsMap[e.id] = e;
    });

    const categoryIds = Array.from(new Set((registrations || []).map((r) => r.category_id).filter(Boolean)));
    let categoriesMap: Record<string, any> = {};
    if (categoryIds.length > 0) {
      const { data: catData } = await supabase
        .from("event_categories")
        .select("id, name, slug")
        .in("id", categoryIds);
      if (catData) {
        catData.forEach((c) => {
          categoriesMap[c.id] = c;
        });
      }
    }

    // 4. Fetch Event Results for participants
    const { data: resultsList } = await supabase
      .from("event_results")
      .select("*")
      .in("participant_id", participantIds);

    const resultsMap: Record<string, any> = {};
    (resultsList || []).forEach((r) => {
      resultsMap[`${r.event_id}_${r.participant_id}`] = r;
    });

    // 5. Fetch participant documents for audition media
    const { data: docs } = await supabase
      .from("participant_documents")
      .select("*")
      .in("participant_id", participantIds);

    const docsByParticipantId: Record<string, Record<string, string>> = {};
    if (docs) {
      docs.forEach((doc) => {
        if (doc.participant_id && doc.document_url) {
          if (!docsByParticipantId[doc.participant_id]) {
            docsByParticipantId[doc.participant_id] = {};
          }
          docsByParticipantId[doc.participant_id][doc.document_type] = doc.document_url;
        }
      });
    }

    const BUCKET_NAME = "dance-videos";

    // 6. Build Registration-based participant items (1 entry per event registration)
    let registrationItems: any[] = [];

    if (registrations && registrations.length > 0) {
      registrationItems = registrations.map((reg) => {
        const p = participantsMap[reg.participant_id] || {
          id: reg.participant_id,
          full_name: "Participant",
          email: "",
          phone: "",
        };
        const evt = eventsMap[reg.event_id] || null;
        const cat = reg.category_id ? categoriesMap[reg.category_id] : null;
        const pDocs = docsByParticipantId[p.id] || {};

        let parsedNotes: any = {};
        if (reg.notes) {
          try {
            parsedNotes = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes;
          } catch {
            parsedNotes = {};
          }
        }

        const rawVideoRef =
          p.video_path ||
          p.video_url ||
          pDocs["dance_video"] ||
          parsedNotes.videoUrl ||
          parsedNotes.videoPath ||
          null;

        const rawIdProofRef = pDocs["id_proof"] || parsedNotes.idProofPath || parsedNotes.aadhaarFile || null;

        // Fetch result object (either from event_results table or parsed from notes)
        const assignedResult =
          resultsMap[`${reg.event_id}_${reg.participant_id}`] ||
          parsedNotes.result || {
            result_type: "pending",
            position: 99,
            selected_at: null,
            notes: null,
          };

        return {
          id: `${reg.id}`,
          registration_id: reg.id,
          registration_number: reg.registration_number || `REG-${reg.id.substring(0, 8)}`,
          registration_status: reg.registration_status || "confirmed",
          payment_status: reg.payment_status || "paid",
          registration_amount: reg.amount || 0,
          registration_date: reg.registration_date || reg.created_at,
          created_at: reg.created_at || p.created_at,

          participant_id: p.id,
          participant_number: p.participant_number || `PAR-${p.id.substring(0, 8)}`,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          date_of_birth: p.date_of_birth || null,
          gender: p.gender || null,
          address: p.address || null,
          city: p.city || null,
          state: p.state || null,
          pincode: p.pincode || null,

          event_id: reg.event_id,
          event_title: evt?.title || "CGS Talent Event",
          event_slug: evt?.slug || reg.event_id,
          event_date: evt?.event_date || null,
          event_location: evt?.venue || evt?.city || null,
          category_name: cat?.name || parsedNotes.compType || "General",

          video_path: rawVideoRef,
          video_url: rawVideoRef,
          video_signed_url: rawVideoRef,
          id_proof_url: rawIdProofRef,

          // Assigned Result
          result: {
            id: assignedResult.id || null,
            result_type: assignedResult.result_type || "pending",
            position: assignedResult.position || 99,
            selected_at: assignedResult.selected_at || null,
            notes: assignedResult.notes || null,
          },

          details: {
            parentName: parsedNotes.parentName || null,
            whatsapp: parsedNotes.whatsapp || p.phone,
            age: parsedNotes.age || null,
            compType: parsedNotes.compType || "Solo",
            ageCat: parsedNotes.ageCat || null,
            danceStyle: parsedNotes.danceStyle || null,
            teamName: parsedNotes.teamName || null,
            numParticipants: parsedNotes.numParticipants || "1",
            songTitle: parsedNotes.songTitle || null,
            duration: parsedNotes.duration || null,
            academy: parsedNotes.academy || null,
            awards: parsedNotes.awards || null,
            emergencyName: p.emergency_contact_name || parsedNotes.emergencyName || null,
            emergencyRelation: p.emergency_contact_relation || parsedNotes.emergencyRelation || null,
            emergencyMobile: p.emergency_contact_phone || parsedNotes.emergencyMobile || null,
            agreeCorrect: parsedNotes.agreeCorrect !== undefined ? Boolean(parsedNotes.agreeCorrect) : true,
            agreeRules: parsedNotes.agreeRules !== undefined ? Boolean(parsedNotes.agreeRules) : true,
            signature: parsedNotes.signature || p.full_name,
            signatureDate: parsedNotes.signatureDate || (reg.created_at ? new Date(reg.created_at).toLocaleDateString("en-IN") : null),
          },
        };
      });
    } else {
      // Fallback if no registrations exist yet
      registrationItems = participants.map((p) => {
        const rawVideoRef = p.video_path || p.video_url || null;
        return {
          id: p.id,
          participant_id: p.id,
          registration_id: p.id,
          participant_number: p.participant_number || `PAR-${p.id.substring(0, 8)}`,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          event_id: p.event_id || null,
          event_title: "Event Registration",
          category_name: "General",
          created_at: p.created_at,
          video_path: rawVideoRef,
          video_url: rawVideoRef,
          video_signed_url: rawVideoRef,
          result: { result_type: "pending", position: 99 },
          details: {},
        };
      });
    }

    return NextResponse.json({
      success: true,
      participants: registrationItems,
      events: allEventsData || [],
    });
  } catch (err: any) {
    console.error("GET /api/participants exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch participants", participants: [], events: [] },
      { status: 200 }
    );
  }
}
