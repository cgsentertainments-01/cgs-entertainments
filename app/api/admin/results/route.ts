import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";
import { checkCertificateEligibility, formatResultLabel } from "@/lib/certificate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_RESULT_TYPES = [
  "winner",
  "first_place",
  "second_place",
  "third_place",
  "runner_up",
  "finalist",
  "special_mention",
  "qualified",
  "eliminated",
  "participant",
  "disqualified",
  "pending",
];

async function resolveStorageSignedUrl(supabase: any, rawPathOrUrl: string | null): Promise<string | null> {
  if (!rawPathOrUrl || typeof rawPathOrUrl !== "string") return null;
  const trimmed = rawPathOrUrl.trim();
  if (!trimmed) return null;

  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be") || trimmed.includes("vimeo.com")) {
    return trimmed;
  }
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  let cleanPath = trimmed;
  let bucket = "dance-videos";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const storageMatch = trimmed.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/);
    if (storageMatch) {
      bucket = storageMatch[1];
      cleanPath = storageMatch[2].split("?")[0];
    } else {
      return trimmed;
    }
  }

  cleanPath = cleanPath.replace(/^\/+/, "");
  if (cleanPath.startsWith("dance-videos/")) {
    bucket = "dance-videos";
    cleanPath = cleanPath.replace(/^dance-videos\//, "");
  } else if (cleanPath.startsWith("participant-documents/")) {
    bucket = "participant-documents";
    cleanPath = cleanPath.replace(/^participant-documents\//, "");
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(cleanPath, 86400);
    if (!error && data?.signedUrl) return data.signedUrl;

    const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
    return pubData?.publicUrl || trimmed;
  } catch (e) {
    return trimmed;
  }
}

export async function GET(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized admin access", results: [], events: [], categories: [] },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase connection unavailable", results: [], events: [], categories: [] },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    let eventIdParam = searchParams.get("eventId") || searchParams.get("event_id") || "all";
    const categoryIdParam = searchParams.get("categoryId") || searchParams.get("category_id") || "all";
    const regTypeParam = searchParams.get("regType") || "all"; // solo, duo, group
    const statusParam = searchParams.get("status") || "all";
    const searchParam = (searchParams.get("search") || "").trim().toLowerCase();

    // 1. Fetch all events for dropdown selection
    const { data: eventsData } = await supabase
      .from("events")
      .select("id, title, slug, event_date, venue, city, category_id, status")
      .order("title", { ascending: true });

    const eventsMap: Record<string, any> = {};
    (eventsData || []).forEach((e) => {
      eventsMap[e.id] = e;
    });

    // If eventIdParam is 'all' or empty, pick the first event in the system so admin immediately sees all roster participants
    if ((eventIdParam === "all" || !eventIdParam) && eventsData && eventsData.length > 0) {
      eventIdParam = eventsData[0].id;
    }

    // 2. Fetch all categories
    const { data: categoriesData } = await supabase
      .from("event_categories")
      .select("id, name, slug")
      .order("name", { ascending: true });

    const categoriesMap: Record<string, any> = {};
    (categoriesData || []).forEach((c) => {
      categoriesMap[c.id] = c;
    });

    // 3. Fetch registrations for the selected event (or all events if still 'all')
    let regQuery = supabase
      .from("registrations")
      .select("id, registration_number, event_id, participant_id, category_id, dance_style_id, registration_status, payment_status, amount, notes, created_at")
      .order("created_at", { ascending: false });

    if (eventIdParam !== "all") {
      regQuery = regQuery.eq("event_id", eventIdParam);
    }

    const { data: registrationsData, error: regErr } = await regQuery;

    if (regErr) {
      console.error("GET /api/admin/results reg error:", regErr);
      return NextResponse.json({
        success: false,
        error: regErr.message,
        results: [],
        events: eventsData || [],
        categories: categoriesData || [],
        selectedEventId: eventIdParam,
      }, { status: 500 });
    }

    // Participant IDs set
    const participantIdsSet = new Set<string>();
    (registrationsData || []).forEach((r) => {
      if (r.participant_id) participantIdsSet.add(r.participant_id);
    });

    const participantIds = Array.from(participantIdsSet);

    // 4. Fetch participants profile data
    const participantsMap: Record<string, any> = {};
    if (participantIds.length > 0) {
      const { data: participantsData } = await supabase
        .from("participants")
        .select("id, participant_number, full_name, email, phone, date_of_birth, gender, city, state, profile_photo, video_path, video_url")
        .in("id", participantIds);

      (participantsData || []).forEach((p) => {
        participantsMap[p.id] = p;
      });
    }

    // 5. Query event_results table for the selected event
    let resultsQuery = supabase
      .from("event_results")
      .select("id, event_id, participant_id, registration_id, category_id, result_type, position, score, notes, is_published, selected_by, selected_at, notify_sent, created_at, updated_at");

    if (eventIdParam !== "all") {
      resultsQuery = resultsQuery.eq("event_id", eventIdParam);
    }

    const { data: dbResults } = await resultsQuery;

    const resultsByRegistrationOrKey: Record<string, any> = {};
    (dbResults || []).forEach((r) => {
      if (r.registration_id) {
        resultsByRegistrationOrKey[r.registration_id] = r;
      }
      const key = `${r.event_id}_${r.participant_id}`;
      resultsByRegistrationOrKey[key] = r;
    });

    // 5b. Query certificates table for issued credentials
    const regIdsList = (registrationsData || []).map((r) => r.id);
    const certsMap: Record<string, any> = {};
    if (regIdsList.length > 0) {
      const { data: certsData } = await supabase
        .from("certificates")
        .select("id, registration_id, certificate_number, status, certificate_type")
        .in("registration_id", regIdsList);
      (certsData || []).forEach((c) => {
        if (c.status === "issued" || c.status === "generated") {
          certsMap[c.registration_id] = c;
        }
      });
    }

    // 6. Build Master Roster Items for EVERY registration belonging to the selected event
    const rosterItems = await Promise.all(
      (registrationsData || []).map(async (reg) => {
        const p = participantsMap[reg.participant_id] || {
          id: reg.participant_id,
          full_name: "Participant",
          email: "",
          phone: "",
        };
        const evt = eventsMap[reg.event_id] || {};
        const cat = reg.category_id ? categoriesMap[reg.category_id] : (evt.category_id ? categoriesMap[evt.category_id] : null);

        let parsedNotes: any = {};
        if (reg.notes) {
          try {
            parsedNotes = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes;
          } catch {}
        }

        // Determine Registration Type & Team info
        let regType: "solo" | "duo" | "group" = "solo";
        const rawCompType = (reg as any).participation_type || parsedNotes.participationType || parsedNotes.participation_type || parsedNotes.compType || "";
        const rawCompLower = String(rawCompType).toLowerCase();

        if (rawCompLower.includes("duo") || rawCompLower.includes("pair")) {
          regType = "duo";
        } else if (rawCompLower.includes("group") || rawCompLower.includes("crew") || rawCompLower.includes("team")) {
          regType = "group";
        }

        const teamName = (reg as any).team_name || parsedNotes.teamInfo?.teamName || parsedNotes.teamName || null;
        const membersList = parsedNotes.members || parsedNotes.teamInfo?.members || parsedNotes.teamMembers || [];

        // Build member summary string
        let memberSummary = "";
        if (regType === "solo") {
          memberSummary = p.full_name;
        } else if (regType === "duo") {
          const partnerName = parsedNotes.partnerName || (membersList[0]?.name || membersList[0]?.full_name || null);
          memberSummary = partnerName ? `${p.full_name} & ${partnerName}` : (teamName || p.full_name);
        } else {
          memberSummary = teamName || `${p.full_name} (Group)`;
        }

        // Resolve existing result
        const key = `${reg.event_id}_${reg.participant_id}`;
        const dbRes = resultsByRegistrationOrKey[reg.id] || resultsByRegistrationOrKey[key] || parsedNotes.result;

        const hasResult = Boolean(dbRes && dbRes.result_type && dbRes.result_type !== "pending");
        const resultType = dbRes?.result_type || "pending";
        const position = dbRes?.position !== undefined && dbRes?.position !== null ? Number(dbRes.position) : null;
        const score = dbRes?.score !== undefined && dbRes?.score !== null ? Number(dbRes.score) : null;
        const resultNotes = dbRes?.notes || "";
        const isPublished = Boolean(dbRes?.is_published);

        // Resolve video media link
        const docUrlsObj = { ...(parsedNotes.docUrls || {}), ...(parsedNotes.documentUrls || {}) };
        const rawVideoRef = p.video_path || p.video_url || docUrlsObj.video || parsedNotes.videoUrl || null;
        const signedVideoUrl = await resolveStorageSignedUrl(supabase, rawVideoRef);

        // Certification Eligibility Calculation
        const eligibility = checkCertificateEligibility(resultType);
        const existingCert = certsMap[reg.id];

        let certEligibilityStatus: "issued" | "eligible" | "ineligible" = "ineligible";
        if (existingCert) {
          certEligibilityStatus = "issued";
        } else if (eligibility.eligible) {
          certEligibilityStatus = "eligible";
        }

        return {
          registration_id: reg.id,
          registration_number: reg.registration_number || `REG-${reg.id.substring(0, 8)}`,
          event_id: reg.event_id,
          event_title: evt.title || "Event",
          participant_id: p.id,
          participant_number: p.participant_number || `PAR-${p.id.substring(0, 8)}`,
          full_name: p.full_name,
          email: p.email || "",
          phone: p.phone || "",
          city: p.city || "",
          state: p.state || "",
          category_id: reg.category_id || evt.category_id || null,
          category_name: cat?.name || "General",

          // Registration type & team details
          reg_type: regType,
          team_name: teamName,
          member_summary: memberSummary,
          members: membersList,
          dance_style: parsedNotes.danceStyle || null,
          age_cat: parsedNotes.ageCat || null,

          // Media links
          video_url: signedVideoUrl || rawVideoRef,
          doc_urls: docUrlsObj,

          // Existing Result fields
          result_id: dbRes?.id || null,
          has_result: hasResult,
          result_type: resultType,
          position: position,
          score: score,
          notes: resultNotes,
          is_published: isPublished,
          updated_at: dbRes?.updated_at || reg.created_at,

          // Certification Integration
          certification_eligibility: {
            eligible: eligibility.eligible,
            certificate_type: eligibility.certificateType,
            status: certEligibilityStatus,
            certificate_number: existingCert?.certificate_number || null,
            reason: eligibility.reason || null,
          },
        };
      })
    );

    // Apply Client filters
    let filteredRoster = rosterItems;

    if (categoryIdParam !== "all") {
      filteredRoster = filteredRoster.filter((r) => r.category_id === categoryIdParam);
    }

    if (regTypeParam !== "all") {
      filteredRoster = filteredRoster.filter((r) => r.reg_type === regTypeParam);
    }

    if (statusParam !== "all") {
      filteredRoster = filteredRoster.filter((r) => r.result_type === statusParam);
    }

    if (searchParam) {
      filteredRoster = filteredRoster.filter((r) =>
        r.full_name.toLowerCase().includes(searchParam) ||
        r.phone.includes(searchParam) ||
        r.email.toLowerCase().includes(searchParam) ||
        (r.team_name && r.team_name.toLowerCase().includes(searchParam)) ||
        (r.member_summary && r.member_summary.toLowerCase().includes(searchParam)) ||
        r.registration_number.toLowerCase().includes(searchParam)
      );
    }

    // Sort by position ascending if available, otherwise by creation
    filteredRoster.sort((a, b) => {
      const posA = a.position !== null ? a.position : 999;
      const posB = b.position !== null ? b.position : 999;
      return posA - posB;
    });

    return NextResponse.json({
      success: true,
      results: filteredRoster,
      events: eventsData || [],
      categories: categoriesData || [],
      selectedEventId: eventIdParam,
    });
  } catch (err: any) {
    console.error("GET /api/admin/results exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch results", results: [], events: [], categories: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase connection unavailable" },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Check for Batch Updates
    const updatesList = Array.isArray(body.updates) ? body.updates : [body];

    const now = new Date().toISOString();
    const savedResults: any[] = [];
    let errorCount = 0;

    for (const item of updatesList) {
      const {
        event_id,
        participant_id,
        registration_id = null,
        category_id = null,
        result_type = "pending",
        position = null,
        score = null,
        notes = null,
        is_published = false,
        notify = false,
      } = item;

      if (!event_id || !participant_id) {
        errorCount++;
        continue;
      }

      if (result_type && !VALID_RESULT_TYPES.includes(result_type)) {
        console.warn(`Invalid result_type '${result_type}', skipping or defaulting to pending`);
      }

      const payload: any = {
        event_id,
        participant_id,
        registration_id: registration_id || null,
        category_id: category_id || null,
        result_type,
        position: position !== undefined && position !== null && position !== "" ? Number(position) : 99,
        score: score !== undefined && score !== null && score !== "" ? Number(score) : null,
        is_published: Boolean(is_published),
        notes: notes || null,
        selected_by: authCheck.admin?.id || null,
        selected_at: now,
        notify_sent: Boolean(notify),
        updated_at: now,
      };

      let savedRecord: any = null;

      // 1. Upsert into event_results table
      const { data: dbSaved, error: saveErr } = await supabase
        .from("event_results")
        .upsert(payload, { onConflict: "event_id,participant_id" })
        .select()
        .single();

      if (!saveErr && dbSaved) {
        savedRecord = dbSaved;
      } else {
        console.warn("POST /api/admin/results item notice:", saveErr?.message);
      }

      // 2. Dual-sync with registrations notes fallback
      let regQuery = supabase
        .from("registrations")
        .select("id, notes")
        .eq("event_id", event_id)
        .eq("participant_id", participant_id);

      if (registration_id) {
        regQuery = regQuery.eq("id", registration_id);
      }

      const { data: matchingReg } = await regQuery.maybeSingle();

      if (matchingReg) {
        let notesObj: any = {};
        if (matchingReg.notes) {
          try {
            notesObj = typeof matchingReg.notes === "string" ? JSON.parse(matchingReg.notes) : matchingReg.notes;
          } catch {}
        }

        const resObj = {
          id: savedRecord?.id || `res-${matchingReg.id}`,
          event_id,
          participant_id,
          registration_id: matchingReg.id,
          category_id: category_id || null,
          result_type,
          position: payload.position,
          score: payload.score,
          is_published: payload.is_published,
          notes: payload.notes,
          selected_at: now,
          updated_at: now,
        };

        notesObj.result = resObj;

        await supabase
          .from("registrations")
          .update({ notes: JSON.stringify(notesObj), updated_at: now })
          .eq("id", matchingReg.id);

        if (!savedRecord) {
          savedRecord = resObj;
        }
      }

      // 3. Notification Dispatch for Participant
      if (savedRecord && (is_published || notify) && !savedRecord.notify_sent && result_type !== "pending") {
        try {
          const resultMeta = formatResultLabel(result_type);
          await supabase.from("notifications").insert([
            {
              participant_id: participant_id,
              event_id: event_id,
              title: "🏆 Competition Result Published",
              message: `Your competition result has been published: ${resultMeta.badge}! Check your result and certification eligibility.`,
              notification_type: "result",
              reference_type: "event_result",
              reference_id: savedRecord.id,
              link_url: `/profile#result-${savedRecord.id}`,
              is_read: false,
              created_at: now,
            },
          ]);

          await supabase
            .from("event_results")
            .update({ notify_sent: true, updated_at: now })
            .eq("id", savedRecord.id);
        } catch (notifErr) {
          console.error("Failed to send participant result notification:", notifErr);
        }
      }

      if (savedRecord) {
        savedResults.push(savedRecord);
      }
    }

    if (savedResults.length === 0 && errorCount > 0) {
      return NextResponse.json(
        { success: false, error: "Failed to save results. Missing required event_id or participant_id." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${savedResults.length} result(s) to Supabase`,
      results: savedResults,
    });
  } catch (err: any) {
    console.error("POST /api/admin/results exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process result creation" },
      { status: 500 }
    );
  }
}
