import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEventIdentifier, isValidUUID } from "@/services/event.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const rawEventId = resolvedParams.id;
  const cleanEventId = normalizeEventIdentifier(rawEventId);

  if (!cleanEventId) {
    return NextResponse.json({ success: false, error: "Event ID is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Database client unavailable." }, { status: 500 });
  }

  try {
    let realEventId = cleanEventId;

    if (!isValidUUID(cleanEventId)) {
      const { data: evt, error: evtErr } = await supabase
        .from("events")
        .select("id")
        .eq("slug", cleanEventId)
        .maybeSingle();
      if (evtErr) {
        return NextResponse.json({ success: false, error: evtErr.message }, { status: 500 });
      }
      if (evt) realEventId = evt.id;
    }

    // 1. Fetch rounds from DB competition_rounds table
    const { data: rounds, error } = await supabase
      .from("competition_rounds")
      .select("*")
      .eq("event_id", realEventId)
      .order("round_number", { ascending: true });

    if (!error && rounds && rounds.length > 0) {
      // 2. Fetch counts per round
      const roundsWithCounts = await Promise.all(
        rounds.map(async (r) => {
          const { count } = await supabase
            .from("competition_round_participants")
            .select("id", { count: "exact", head: true })
            .eq("round_id", r.id);
          return {
            ...r,
            participant_count: count || 0,
          };
        })
      );

      return NextResponse.json({ success: true, rounds: roundsWithCounts });
    }

    // 2. If competition_rounds table is empty or not yet created, fetch persistent rounds from events.form_config in Supabase
    const { data: evtRow, error: evtRowErr } = await supabase
      .from("events")
      .select("form_config")
      .eq("id", realEventId)
      .maybeSingle();

    if (!evtRowErr && evtRow?.form_config?.competitionRounds) {
      const configRounds = evtRow.form_config.competitionRounds;
      if (Array.isArray(configRounds) && configRounds.length > 0) {
        return NextResponse.json({ success: true, rounds: configRounds });
      }
    }

    if (error && error.code !== "PGRST205") {
      console.error("Supabase fetch rounds error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rounds: [] });
  } catch (err: any) {
    console.error("GET /api/events/[id]/rounds exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const rawEventId = resolvedParams.id;
  const cleanEventId = normalizeEventIdentifier(rawEventId);

  if (!cleanEventId) {
    return NextResponse.json({ success: false, error: "Event ID is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Database client unavailable." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, round_number, status = "upcoming", round_date, fee = 0, description, rounds: bulkRounds } = body;

    let realEventId = cleanEventId;
    if (!isValidUUID(cleanEventId)) {
      const { data: evt, error: evtErr } = await supabase
        .from("events")
        .select("id")
        .eq("slug", cleanEventId)
        .maybeSingle();
      if (evtErr) {
        return NextResponse.json({ success: false, error: evtErr.message }, { status: 500 });
      }
      if (evt) realEventId = evt.id;
    }

    // Single Round Creation / Update
    if (!bulkRounds) {
      if (!name || typeof round_number !== "number") {
        return NextResponse.json({ success: false, error: "Round name and round_number are required." }, { status: 400 });
      }

      const payload = {
        event_id: realEventId,
        name: name.trim(),
        round_number,
        status,
        round_date: round_date ? new Date(round_date).toISOString() : null,
        fee: typeof fee === "number" ? fee : parseFloat(fee) || 0,
        description: description || null,
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error } = await supabase
        .from("competition_rounds")
        .upsert(payload, { onConflict: "event_id,round_number" })
        .select("*")
        .single();

      if (error && error.code !== "PGRST205") {
        console.error("DB Upsert failed in POST rounds:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      // Also persist to events.form_config in Supabase
      const { data: evtRow } = await supabase
        .from("events")
        .select("form_config")
        .eq("id", realEventId)
        .maybeSingle();

      if (evtRow) {
        const existingRounds = Array.isArray(evtRow.form_config?.competitionRounds) ? [...evtRow.form_config.competitionRounds] : [];
        const existingIdx = existingRounds.findIndex((r: any) => r.round_number === round_number);
        if (existingIdx >= 0) {
          existingRounds[existingIdx] = { ...existingRounds[existingIdx], ...payload };
        } else {
          existingRounds.push(payload);
        }
        existingRounds.sort((a: any, b: any) => a.round_number - b.round_number);

        const updatedConfig = {
          ...(evtRow.form_config || {}),
          competitionRounds: existingRounds,
        };
        await supabase.from("events").update({ form_config: updatedConfig }).eq("id", realEventId);
      }

      // If Round 1 is active, auto-seed confirmed registrations into Round 1
      if (inserted && inserted.round_number === 1) {
        await autoSeedRoundOneParticipants(supabase, realEventId, inserted.id);
      }
      return NextResponse.json({ success: true, round: inserted || payload });
    }

    // Bulk Round Setup / Reorder
    if (Array.isArray(bulkRounds)) {
      const prepareRounds = bulkRounds.map((r: any, idx: number) => ({
        ...(r.id && isValidUUID(r.id) ? { id: r.id } : {}),
        event_id: realEventId,
        name: r.name,
        round_number: r.round_number || idx + 1,
        status: r.status || "upcoming",
        round_date: r.round_date ? new Date(r.round_date).toISOString() : null,
        fee: typeof r.fee === "number" ? r.fee : parseFloat(r.fee) || 0,
        description: r.description || null,
        updated_at: new Date().toISOString(),
      }));

      // 1. Try to upsert into competition_rounds table
      let savedRounds: any[] | null = null;
      const { data: dbRounds, error: roundsDbErr } = await supabase
        .from("competition_rounds")
        .upsert(prepareRounds, { onConflict: "event_id,round_number" })
        .select("*");

      if (roundsDbErr) {
        if (roundsDbErr.code !== "PGRST205") {
          console.error("Bulk rounds upsert failed:", roundsDbErr);
          return NextResponse.json({ success: false, error: roundsDbErr.message }, { status: 500 });
        }
      } else {
        savedRounds = dbRounds;
        // Prune any previous rounds that were removed (round_number > bulkRounds.length)
        if (bulkRounds.length > 0) {
          await supabase
            .from("competition_rounds")
            .delete()
            .eq("event_id", realEventId)
            .gt("round_number", bulkRounds.length);
        }
      }

      // 2. Always persist rounds in events.form_config in Supabase for durability
      const { data: evtRow } = await supabase
        .from("events")
        .select("form_config")
        .eq("id", realEventId)
        .maybeSingle();

      if (evtRow) {
        const updatedConfig = {
          ...(evtRow.form_config || {}),
          competitionRounds: prepareRounds,
        };
        await supabase
          .from("events")
          .update({ form_config: updatedConfig })
          .eq("id", realEventId);
      }

      if (savedRounds) {
        const round1 = savedRounds.find((r) => r.round_number === 1);
        if (round1) {
          await autoSeedRoundOneParticipants(supabase, realEventId, round1.id);
        }
      }

      return NextResponse.json({
        success: true,
        rounds: savedRounds || prepareRounds,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/events/[id]/rounds exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

async function autoSeedRoundOneParticipants(supabase: any, eventId: string, roundId: string) {
  try {
    // Fetch all confirmed registrations for this event
    const { data: regs } = await supabase
      .from("registrations")
      .select("id")
      .eq("event_id", eventId)
      .neq("registration_status", "cancelled")
      .neq("registration_status", "rejected");

    if (regs && regs.length > 0) {
      const inserts = regs.map((reg: any) => ({
        round_id: roundId,
        registration_id: reg.id,
        status: "pending",
      }));
      await supabase.from("competition_round_participants").upsert(inserts, { onConflict: "round_id,registration_id" });
    }
  } catch (e) {
    console.warn("Notice auto seeding round one participants:", e);
  }
}
