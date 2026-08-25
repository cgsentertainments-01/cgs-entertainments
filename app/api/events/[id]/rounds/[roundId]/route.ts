import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEventIdentifier, isValidUUID } from "@/services/event.service";

export async function PUT(
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
    const { name, round_number, status, round_date, fee, description } = body;

    if (supabase && isValidUUID(roundId)) {
      const updatePayload: any = { updated_at: new Date().toISOString() };
      if (name) updatePayload.name = name.trim();
      if (typeof round_number === "number") updatePayload.round_number = round_number;
      if (status) updatePayload.status = status;
      if (round_date !== undefined) updatePayload.round_date = round_date ? new Date(round_date).toISOString() : null;
      if (fee !== undefined) updatePayload.fee = typeof fee === "number" ? fee : parseFloat(fee) || 0;
      if (description !== undefined) updatePayload.description = description;

      const { data: updated, error } = await supabase
        .from("competition_rounds")
        .update(updatePayload)
        .eq("id", roundId)
        .select("*")
        .single();

      if (!error && updated) {
        return NextResponse.json({ success: true, round: updated });
      }
    }

    return NextResponse.json({ success: true, round: { id: roundId, ...body } });
  } catch (err: any) {
    console.error("PUT /api/events/[id]/rounds/[roundId] exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  const resolvedParams = await params;
  const { id: rawEventId, roundId } = resolvedParams;

  if (!roundId) {
    return NextResponse.json({ success: false, error: "Round ID is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    if (supabase && isValidUUID(roundId)) {
      const { error } = await supabase.from("competition_rounds").delete().eq("id", roundId);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Round deleted successfully." });
  } catch (err: any) {
    console.error("DELETE /api/events/[id]/rounds/[roundId] exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
