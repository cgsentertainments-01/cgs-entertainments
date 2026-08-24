import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

async function resolveStorageSignedUrl(supabase: any, rawPathOrUrl: string | null): Promise<string | null> {
  if (!rawPathOrUrl || typeof rawPathOrUrl !== "string") return null;
  const trimmed = rawPathOrUrl.trim();
  if (!trimmed) return null;

  // External video links (YouTube, Vimeo, external HTTPS links not matching Supabase storage object paths)
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be") || trimmed.includes("vimeo.com")) {
    return trimmed;
  }

  // If it's a data URL or blob URL
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  let cleanPath = trimmed;
  let bucket = "dance-videos";

  // Check if trimmed starts with http/https
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // Check if it's a Supabase storage URL
    const storageMatch = trimmed.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/);
    if (storageMatch) {
      bucket = storageMatch[1];
      cleanPath = storageMatch[2].split("?")[0];
    } else {
      // General external URL
      return trimmed;
    }
  }

  // Clean leading slashes and bucket prefix
  cleanPath = cleanPath.replace(/^\/+/, "");
  if (cleanPath.startsWith("dance-videos/")) {
    bucket = "dance-videos";
    cleanPath = cleanPath.replace(/^dance-videos\//, "");
  } else if (cleanPath.startsWith("participant-documents/")) {
    bucket = "participant-documents";
    cleanPath = cleanPath.replace(/^participant-documents\//, "");
  }

  try {
    // Generate 24 hour signed URL for admin viewing
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(cleanPath, 86400);
    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }

    // Fallback to public URL if signed URL generation fails
    const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
    return pubData?.publicUrl || trimmed;
  } catch (e) {
    console.warn(`[RESOLVE VIDEO URL] Error signing path '${cleanPath}':`, e);
    return trimmed;
  }
}

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

    const { searchParams } = new URL(request.url);
    const pageParam = parseInt(searchParams.get("page") || "0", 10);
    const limitParam = parseInt(searchParams.get("limit") || "0", 10);
    const searchVal = (searchParams.get("search") || "").trim().toLowerCase();

    // 1. Fetch all events for filter dropdowns
    const { data: allEventsData } = await supabase
      .from("events")
      .select("id, title, slug, event_date, venue, city")
      .order("title", { ascending: true });

    const eventsMap: Record<string, any> = {};
    (allEventsData || []).forEach((e) => {
      eventsMap[e.id] = e;
    });

    // 2. Fetch registrations (Authoritative source for Participant Registry entries)
    let regQuery = supabase
      .from("registrations")
      .select("id, registration_number, event_id, participant_id, category_id, dance_style_id, registration_status, payment_status, registration_date, amount, notes, document_urls, created_at")
      .order("created_at", { ascending: false });

    const { data: registrations, error: regErr } = await regQuery;

    if (regErr) {
      console.warn("GET /api/participants DB warning:", regErr.message);
      return NextResponse.json({ success: true, participants: [], events: allEventsData || [], warning: regErr.message });
    }

    // If 0 registrations exist in the database, return empty array immediately
    if (!registrations || registrations.length === 0) {
      return NextResponse.json({
        success: true,
        participants: [],
        events: allEventsData || [],
        total: 0,
        page: pageParam || 1,
        totalPages: 0,
      });
    }

    // 3. Fetch linked participant profile records for active registrations
    const participantIds = Array.from(new Set(registrations.map((r) => r.participant_id).filter(Boolean)));
    let participantsMap: Record<string, any> = {};
    if (participantIds.length > 0) {
      const { data: participants } = await supabase
        .from("participants")
        .select("id, participant_number, full_name, email, phone, date_of_birth, gender, city, state, profile_photo, video_path, video_url, created_at")
        .in("id", participantIds);
      
      (participants || []).forEach((p) => {
        participantsMap[p.id] = p;
      });
    }

    // 4. Fetch linked categories
    const categoryIds = Array.from(new Set(registrations.map((r) => r.category_id).filter(Boolean)));
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

    // 5. Fetch Event Results for registered participants
    let resultsMap: Record<string, any> = {};
    if (participantIds.length > 0) {
      const { data: resultsList } = await supabase
        .from("event_results")
        .select("id, event_id, participant_id, result_type, rank, score, certificate_url, remarks, created_at")
        .in("participant_id", participantIds);

      (resultsList || []).forEach((r) => {
        resultsMap[`${r.event_id}_${r.participant_id}`] = r;
      });
    }

    // 6. Fetch participant documents for audition media
    const docsByParticipantId: Record<string, Record<string, string>> = {};
    if (participantIds.length > 0) {
      const { data: docs } = await supabase
        .from("participant_documents")
        .select("id, participant_id, document_type, document_url, file_name")
        .in("participant_id", participantIds);

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
    }

    // 7. Build Registration-based participant items (1 entry per event registration)
    const registrationItems = await Promise.all(
      registrations.map(async (reg) => {
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

        const docUrlsObj = reg.document_urls || parsedNotes.docUrls || {};
        const docVideo =
          pDocs["dance_video"] ||
          pDocs["video"] ||
          docUrlsObj.danceVideo ||
          docUrlsObj.dance_video ||
          docUrlsObj.video ||
          parsedNotes.videoUrl ||
          parsedNotes.videoPath ||
          null;

        const rawVideoRef = p.video_path || p.video_url || docVideo || null;
        const signedVideoUrl = await resolveStorageSignedUrl(supabase, rawVideoRef);

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
          video_url: signedVideoUrl || rawVideoRef,
          video_signed_url: signedVideoUrl || rawVideoRef,
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
      })
    );

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
