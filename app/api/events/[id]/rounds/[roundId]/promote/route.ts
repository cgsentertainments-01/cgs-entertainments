import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEventIdentifier, isValidUUID } from "@/services/event.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  const resolvedParams = await params;
  const { id: rawEventId, roundId } = resolvedParams;
  const cleanEventId = normalizeEventIdentifier(rawEventId);

  if (!cleanEventId || !roundId) {
    return NextResponse.json({ success: false, error: "Event ID and Round ID are required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    const body = await request.json();
    const { registration_ids, target_round_id } = body;

    if (!Array.isArray(registration_ids) || registration_ids.length === 0) {
      return NextResponse.json({ success: false, error: "Please select at least one participant to promote." }, { status: 400 });
    }

    let realEventId = cleanEventId;
    if (supabase && !isValidUUID(cleanEventId)) {
      const { data: evt } = await supabase.from("events").select("id").eq("slug", cleanEventId).maybeSingle();
      if (evt) realEventId = evt.id;
    }

    if (supabase && isValidUUID(roundId)) {
      // 1. Fetch current round info
      const { data: currentRound, error: currErr } = await supabase
        .from("competition_rounds")
        .select("*")
        .eq("id", roundId)
        .single();

      if (currErr || !currentRound) {
        return NextResponse.json({ success: false, error: "Current round not found." }, { status: 404 });
      }

      // 2. Resolve Target Next Round
      let targetRound: any = null;
      if (target_round_id && isValidUUID(target_round_id)) {
        const { data: tr } = await supabase
          .from("competition_rounds")
          .select("*")
          .eq("id", target_round_id)
          .single();
        targetRound = tr;
      } else {
        // Find next round by round_number sequence
        const { data: tr } = await supabase
          .from("competition_rounds")
          .select("*")
          .eq("event_id", realEventId)
          .eq("round_number", currentRound.round_number + 1)
          .maybeSingle();
        targetRound = tr;
      }

      if (!targetRound) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot promote: Next round after "${currentRound.name}" (Round ${currentRound.round_number + 1}) is not configured yet. Please add the next round first.`,
          },
          { status: 400 }
        );
      }

      // 3. Verify selected registrations belong to this event
      const { data: validRegs } = await supabase
        .from("registrations")
        .select(`
          id, registration_number, event_id, participant_id, participation_type, team_name,
          participants ( id, full_name, email )
        `)
        .in("id", registration_ids)
        .eq("event_id", realEventId);

      if (!validRegs || validRegs.length === 0) {
        return NextResponse.json(
          { success: false, error: "None of the selected registrations belong to this event." },
          { status: 400 }
        );
      }

      const validRegIds = validRegs.map((r: any) => r.id);

      // 4. Update current round status to 'qualified' for promoted participants
      await supabase
        .from("competition_round_participants")
        .update({
          status: "qualified",
          updated_at: new Date().toISOString(),
        })
        .eq("round_id", roundId)
        .in("registration_id", validRegIds);

      // 5. Check which participants are already in the target round to prevent duplicates
      const { data: existingTargetParts } = await supabase
        .from("competition_round_participants")
        .select("registration_id")
        .eq("round_id", targetRound.id)
        .in("registration_id", validRegIds);

      const alreadyInTargetIds = new Set((existingTargetParts || []).map((e: any) => e.registration_id));

      const newPromotionsToInsert: any[] = [];
      let skippedCount = 0;

      for (const reg of validRegs) {
        if (alreadyInTargetIds.has(reg.id)) {
          skippedCount++;
        } else {
          newPromotionsToInsert.push({
            round_id: targetRound.id,
            registration_id: reg.id,
            status: "pending",
            promoted_at: new Date().toISOString(),
          });
        }
      }

      // 6. Insert into target round
      let promotedCount = 0;
      if (newPromotionsToInsert.length > 0) {
        const { data: inserted, error: insertErr } = await supabase
          .from("competition_round_participants")
          .insert(newPromotionsToInsert)
          .select("id");

        if (insertErr) {
          console.error("Bulk promotion insert error:", insertErr.message);
          return NextResponse.json({ success: false, error: `Promotion failed: ${insertErr.message}` }, { status: 500 });
        }
        promotedCount = inserted ? inserted.length : newPromotionsToInsert.length;
      }

      // 7. Send notifications to promoted participants
      for (const reg of (validRegs as any[])) {
        if (!alreadyInTargetIds.has(reg.id) && reg.participants) {
          const part = Array.isArray(reg.participants) ? reg.participants[0] : reg.participants;
          if (part && part.id) {
            try {
              await supabase.from("notifications").insert({
                participant_id: part.id,
                event_id: realEventId,
                title: `🎉 Promoted to ${targetRound.name}!`,
                message: `Congratulations ${part.full_name || "Participant"}! You have been promoted to ${targetRound.name}. Keep up the great work!`,
                notification_type: "result",
                link_url: `/my-events/${realEventId}`,
              });
            } catch (notifErr) {
              console.warn("Notice sending promotion notification:", notifErr);
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        promoted_count: promotedCount,
        skipped_count: skippedCount,
        target_round_name: targetRound.name,
        target_round_id: targetRound.id,
        message: `Successfully promoted ${promotedCount} participant(s) to ${targetRound.name}.${
          skippedCount > 0 ? ` (${skippedCount} already in ${targetRound.name})` : ""
        }`,
      });
    }

    return NextResponse.json({
      success: true,
      promoted_count: registration_ids.length,
      skipped_count: 0,
      target_round_name: "Next Round",
      message: `Successfully promoted ${registration_ids.length} participant(s) to Next Round.`,
    });
  } catch (err: any) {
    console.error("POST /api/events/[id]/rounds/[roundId]/promote exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
