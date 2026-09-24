import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEventIdentifier, isValidUUID } from "@/services/event.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  const resolvedParams = await params;
  const { id: rawEventId, roundId } = resolvedParams;
  const cleanEventId = normalizeEventIdentifier(rawEventId);

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") || "all";
  const searchParam = (searchParams.get("search") || "").trim().toLowerCase();

  const supabase = getSupabaseAdmin();

  try {
    let realEventId = cleanEventId;
    if (supabase && !isValidUUID(cleanEventId)) {
      const { data: evt } = await supabase.from("events").select("id").eq("slug", cleanEventId).maybeSingle();
      if (evt) realEventId = evt.id;
    }

    if (supabase && isValidUUID(roundId)) {
      // 1. Fetch round metadata to check round_number
      const { data: roundData } = await supabase
        .from("competition_rounds")
        .select("id, event_id, name, round_number, status")
        .eq("id", roundId)
        .maybeSingle();

      // 2. Query round participants
      let { data: roundParts, error } = await supabase
        .from("competition_round_participants")
        .select(`
          id, round_id, registration_id, status, result_notes, promoted_at, created_at,
          registrations (
            id, registration_number, event_id, participant_id, registration_status, amount, notes,
            participation_type, team_name, team_leader, team_contact, participant_count, additional_participants, document_urls,
            participants (
              id, participant_number, full_name, email, phone, city, state, profile_photo, video_url, video_path
            )
          )
        `)
        .eq("round_id", roundId)
        .order("created_at", { ascending: true });

      // If this is Round 1 (or any round) and no participants are in round_participants yet, auto-seed confirmed registrations
      if ((!roundParts || roundParts.length === 0) && roundData && roundData.round_number === 1) {
        console.log(`Auto-seeding confirmed registrations into Round 1 (round_id="${roundId}")...`);
        const { data: regs } = await supabase
          .from("registrations")
          .select("id")
          .eq("event_id", realEventId)
          .neq("registration_status", "cancelled")
          .neq("registration_status", "rejected");

        if (regs && regs.length > 0) {
          const inserts = regs.map((r: any) => ({
            round_id: roundId,
            registration_id: r.id,
            status: "pending",
          }));
          await supabase.from("competition_round_participants").upsert(inserts, { onConflict: "round_id,registration_id" });

          // Re-fetch
          const refetched = await supabase
            .from("competition_round_participants")
            .select(`
              id, round_id, registration_id, status, result_notes, promoted_at, created_at,
              registrations (
                id, registration_number, event_id, participant_id, registration_status, amount, notes,
                participation_type, team_name, team_leader, team_contact, participant_count, additional_participants, document_urls,
                participants (
                  id, participant_number, full_name, email, phone, city, state, profile_photo, video_url, video_path
                )
              )
            `)
            .eq("round_id", roundId)
            .order("created_at", { ascending: true });

          roundParts = refetched.data;
        }
      }

      // Format response items
      const formatted = (roundParts || []).map((rp: any) => {
        const reg = rp.registrations || {};
        const part = reg.participants || {};

        let parsedNotes: any = {};
        if (reg.notes) {
          try {
            parsedNotes = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes;
          } catch {
            parsedNotes = {};
          }
        }

        const participationType =
          reg.participation_type ||
          parsedNotes.participationType ||
          parsedNotes.compType ||
          "Solo";

        const teamName =
          reg.team_name ||
          parsedNotes.teamInfo?.teamName ||
          parsedNotes.teamName ||
          null;

        const videoUrl =
          part.video_url ||
          part.video_path ||
          parsedNotes.videoUrl ||
          parsedNotes.videoPath ||
          null;

        return {
          id: rp.id,
          round_id: rp.round_id,
          registration_id: rp.registration_id,
          status: rp.status || "pending",
          result_notes: rp.result_notes || null,
          promoted_at: rp.promoted_at || rp.created_at,

          registration_number: reg.registration_number || "CGS-REG-000000",
          participant_id: part.id || reg.participant_id,
          participant_number: part.participant_number || "CGS-P-000000",
          full_name: part.full_name || "Participant",
          email: part.email || "",
          phone: part.phone || "",
          profile_photo: part.profile_photo || null,
          participation_type: participationType,
          team_name: teamName,
          team_leader: reg.team_leader || parsedNotes.teamInfo?.teamLeader || null,
          team_contact: reg.team_contact || parsedNotes.teamInfo?.teamContact || null,
          participant_count: reg.participant_count || parsedNotes.numParticipants || 1,
          additional_participants: reg.additional_participants || parsedNotes.additionalParticipants || [],
          video_url: videoUrl,
        };
      });

      // Filter by status and search
      let filtered = formatted;
      if (statusParam && statusParam !== "all") {
        filtered = filtered.filter((p: any) => String(p.status).toLowerCase() === statusParam.toLowerCase());
      }

      if (searchParam) {
        filtered = filtered.filter((p: any) => {
          return (
            p.full_name?.toLowerCase().includes(searchParam) ||
            p.registration_number?.toLowerCase().includes(searchParam) ||
            p.participant_number?.toLowerCase().includes(searchParam) ||
            p.email?.toLowerCase().includes(searchParam) ||
            p.phone?.toLowerCase().includes(searchParam) ||
            p.team_name?.toLowerCase().includes(searchParam)
          );
        });
      }

      return NextResponse.json({ success: true, round: roundData, participants: filtered });
    }

    // Fallback response for memory/mock testing
    return NextResponse.json({ success: true, round: { id: roundId, name: "Round 1" }, participants: [] });
  } catch (err: any) {
    console.error("GET /api/events/[id]/rounds/[roundId]/participants exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  const resolvedParams = await params;
  const { id: rawEventId, roundId } = resolvedParams;
  const cleanEventId = normalizeEventIdentifier(rawEventId);

  const supabase = getSupabaseAdmin();

  try {
    const body = await request.json();
    const { round_participant_id, registration_id, status, result_notes, notify = true } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required." }, { status: 400 });
    }

    let realEventId = cleanEventId;
    if (supabase && !isValidUUID(cleanEventId)) {
      const { data: evt } = await supabase.from("events").select("id").eq("slug", cleanEventId).maybeSingle();
      if (evt) realEventId = evt.id;
    }

    if (supabase && isValidUUID(roundId)) {
      let targetRpId = round_participant_id;

      if (!targetRpId && registration_id) {
        const { data: existingRp } = await supabase
          .from("competition_round_participants")
          .select("id")
          .eq("round_id", roundId)
          .eq("registration_id", registration_id)
          .maybeSingle();

        if (existingRp) {
          targetRpId = existingRp.id;
        }
      }

      if (targetRpId && isValidUUID(targetRpId)) {
        const { data: updatedRp, error } = await supabase
          .from("competition_round_participants")
          .update({
            status,
            result_notes: result_notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetRpId)
          .select(`
            *,
            registrations (
              id, registration_number, event_id, participant_id,
              participants ( id, full_name, email, phone )
            )
          `)
          .single();

        if (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // If status is winner / runner_up / finalist, sync with event_results table
        const reg = updatedRp.registrations;
        if (reg && (status === "winner" || status === "runner_up" || status === "finalist")) {
          try {
            await supabase.from("event_results").upsert(
              {
                event_id: realEventId,
                participant_id: reg.participant_id,
                registration_id: reg.id,
                result_type: status,
                position: status === "winner" ? 1 : status === "runner_up" ? 2 : 3,
                notes: result_notes || `Awarded in competition round.`,
                selected_at: new Date().toISOString(),
              },
              { onConflict: "event_id,participant_id" }
            );
          } catch (syncErr) {
            console.warn("Notice syncing winner result with event_results:", syncErr);
          }
        }

        // Send notification if enabled
        if (notify && reg?.participants) {
          const part = reg.participants;
          try {
            await supabase.from("notifications").insert({
              participant_id: part.id,
              event_id: realEventId,
              title: `Round Update: Status set to ${status.toUpperCase()}`,
              message: `Your status for the current round has been updated to: ${status.toUpperCase()}${
                result_notes ? ` (${result_notes})` : ""
              }`,
              notification_type: "result",
              link_url: `/my-events/${realEventId}`,
            });
          } catch (notifErr) {
            console.warn("Notice sending status notification:", notifErr);
          }
        }

        return NextResponse.json({ success: true, participant: updatedRp });
      }
    }

    return NextResponse.json({ success: true, updated: { roundId, registration_id, status } });
  } catch (err: any) {
    console.error("PUT /api/events/[id]/rounds/[roundId]/participants exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
