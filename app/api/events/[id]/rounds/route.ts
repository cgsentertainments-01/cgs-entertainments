import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEventIdentifier, isValidUUID } from "@/services/event.service";

// In-memory fallback cache in case Supabase schema cache is pending table creation
const roundsMemoryStore: Record<string, any[]> = {};
const roundPartsMemoryStore: Record<string, any[]> = {};

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

  try {
    let realEventId = cleanEventId;

    if (supabase && !isValidUUID(cleanEventId)) {
      const { data: evt } = await supabase.from("events").select("id").eq("slug", cleanEventId).maybeSingle();
      if (evt) realEventId = evt.id;
    }

    if (supabase) {
      // 1. Fetch rounds from DB
      const { data: rounds, error } = await supabase
        .from("competition_rounds")
        .select("*")
        .eq("event_id", realEventId)
        .order("round_number", { ascending: true });

      if (!error && rounds) {
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
    }

    // Fallback to memory store if DB table not yet created
    const memRounds = roundsMemoryStore[realEventId] || roundsMemoryStore[rawEventId] || [];
    return NextResponse.json({ success: true, rounds: memRounds });
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

  try {
    const body = await request.json();
    const { name, round_number, status = "upcoming", round_date, fee = 0, description, rounds: bulkRounds } = body;

    let realEventId = cleanEventId;
    if (supabase && !isValidUUID(cleanEventId)) {
      const { data: evt } = await supabase.from("events").select("id").eq("slug", cleanEventId).maybeSingle();
      if (evt) realEventId = evt.id;
    }

    // Single Round Creation / Update
    if (!bulkRounds) {
      if (!name || typeof round_number !== "number") {
        return NextResponse.json({ success: false, error: "Round name and round_number are required." }, { status: 400 });
      }

      if (supabase) {
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

        if (error) {
          console.warn("DB Upsert failed in POST rounds, falling back to memory store:", error.message);
        } else {
          // If Round 1 is active, auto-seed confirmed registrations into Round 1
          if (inserted && inserted.round_number === 1) {
            await autoSeedRoundOneParticipants(supabase, realEventId, inserted.id);
          }
          return NextResponse.json({ success: true, round: inserted });
        }
      }

      // Memory store fallback
      if (!roundsMemoryStore[realEventId]) roundsMemoryStore[realEventId] = [];
      const existingIdx = roundsMemoryStore[realEventId].findIndex((r) => r.round_number === round_number);
      const newRound = {
        id: `rnd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        event_id: realEventId,
        name: name.trim(),
        round_number,
        status,
        round_date: round_date || null,
        fee: fee || 0,
        description: description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participant_count: 0,
      };

      if (existingIdx >= 0) {
        roundsMemoryStore[realEventId][existingIdx] = { ...roundsMemoryStore[realEventId][existingIdx], ...newRound };
      } else {
        roundsMemoryStore[realEventId].push(newRound);
      }
      roundsMemoryStore[realEventId].sort((a, b) => a.round_number - b.round_number);

      return NextResponse.json({ success: true, round: newRound });
    }

    // Bulk Round Setup / Reorder
    if (Array.isArray(bulkRounds)) {
      if (supabase) {
        const prepareRounds = bulkRounds.map((r: any, idx: number) => ({
          ...(r.id && isValidUUID(r.id) ? { id: r.id } : {}),
          event_id: realEventId,
          name: r.name,
          round_number: r.round_number || idx + 1,
          status: r.status || "upcoming",
          round_date: r.round_date ? new Date(r.round_date).toISOString() : null,
          fee: r.fee || 0,
          description: r.description || null,
          updated_at: new Date().toISOString(),
        }));

        const { data: savedRounds, error } = await supabase
          .from("competition_rounds")
          .upsert(prepareRounds, { onConflict: "event_id,round_number" })
          .select("*");

        if (!error && savedRounds) {
          const round1 = savedRounds.find((r) => r.round_number === 1);
          if (round1) {
            await autoSeedRoundOneParticipants(supabase, realEventId, round1.id);
          }
          return NextResponse.json({ success: true, rounds: savedRounds });
        }
      }

      // Memory fallback
      roundsMemoryStore[realEventId] = bulkRounds.map((r: any, idx: number) => ({
        id: r.id || `rnd_${Date.now()}_${idx}`,
        event_id: realEventId,
        name: r.name,
        round_number: r.round_number || idx + 1,
        status: r.status || "upcoming",
        round_date: r.round_date || null,
        fee: r.fee || 0,
        description: r.description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participant_count: 0,
      }));

      return NextResponse.json({ success: true, rounds: roundsMemoryStore[realEventId] });
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
