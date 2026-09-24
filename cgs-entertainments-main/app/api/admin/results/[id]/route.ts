import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const { id: resultId } = await params;
    if (!resultId) {
      return NextResponse.json({ success: false, error: "Result ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Supabase connection unavailable" }, { status: 500 });
    }

    const body = await request.json();
    const {
      result_type,
      position,
      score,
      notes,
      event_id,
      participant_id,
      category_id,
      registration_id,
      notify = false,
    } = body;

    const validTypes = ["winner", "runner_up", "finalist", "special_mention", "qualified", "eliminated", "participant", "pending"];
    if (result_type && !validTypes.includes(result_type)) {
      return NextResponse.json(
        { success: false, error: `Invalid result_type '${result_type}'. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updateData: any = {
      updated_at: now,
      selected_at: now,
      selected_by: authCheck.admin?.id || null,
    };

    if (result_type !== undefined) updateData.result_type = result_type;
    if (position !== undefined && position !== null) updateData.position = Number(position);
    if (score !== undefined) updateData.score = score !== null && score !== "" ? Number(score) : null;
    if (notes !== undefined) updateData.notes = notes;
    if (event_id !== undefined) updateData.event_id = event_id;
    if (participant_id !== undefined) updateData.participant_id = participant_id;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (registration_id !== undefined) updateData.registration_id = registration_id;
    if (notify !== undefined) updateData.notify_sent = Boolean(notify);

    let updatedResult: any = null;

    // 1. Try updating event_results table
    const { data: dbUpdated, error: updateErr } = await supabase
      .from("event_results")
      .update(updateData)
      .eq("id", resultId)
      .select()
      .single();

    if (!updateErr && dbUpdated) {
      updatedResult = dbUpdated;
    } else {
      console.warn("PUT /api/admin/results/[id]: event_results update notice, using registration notes fallback:", updateErr?.message);
    }

    // 2. Also update registrations notes fallback if event_id & participant_id exist
    const targetEventId = event_id || updatedResult?.event_id;
    const targetParticipantId = participant_id || updatedResult?.participant_id;

    if (targetEventId && targetParticipantId) {
      const { data: reg } = await supabase
        .from("registrations")
        .select("id, notes")
        .eq("event_id", targetEventId)
        .eq("participant_id", targetParticipantId)
        .maybeSingle();

      if (reg) {
        let notesObj: any = {};
        if (reg.notes) {
          try {
            notesObj = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes;
          } catch {}
        }

        notesObj.result = {
          ...(notesObj.result || {}),
          id: resultId,
          event_id: targetEventId,
          participant_id: targetParticipantId,
          category_id: category_id || notesObj.result?.category_id || null,
          registration_id: reg.id,
          result_type: result_type || notesObj.result?.result_type || "pending",
          position: position !== undefined ? Number(position) : (notesObj.result?.position ?? 99),
          score: score !== undefined ? (score !== null && score !== "" ? Number(score) : null) : (notesObj.result?.score ?? null),
          notes: notes !== undefined ? notes : (notesObj.result?.notes || null),
          updated_at: now,
        };

        await supabase
          .from("registrations")
          .update({ notes: JSON.stringify(notesObj), updated_at: now })
          .eq("id", reg.id);

        if (!updatedResult) {
          updatedResult = notesObj.result;
        }
      }
    }

    if (!updatedResult) {
      updatedResult = {
        id: resultId,
        ...updateData,
      };
    }

    return NextResponse.json({
      success: true,
      message: "Result updated successfully",
      result: updatedResult,
    });
  } catch (err: any) {
    console.error("PUT /api/admin/results/[id] exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update result record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const { id: resultId } = await params;
    if (!resultId) {
      return NextResponse.json({ success: false, error: "Result ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Supabase connection unavailable" }, { status: 500 });
    }

    // 1. First fetch target item if needed to clean fallback
    const { data: targetItem } = await supabase
      .from("event_results")
      .select("id, event_id, participant_id")
      .eq("id", resultId)
      .maybeSingle();

    // 2. Delete from event_results table
    const { error: deleteErr } = await supabase
      .from("event_results")
      .delete()
      .eq("id", resultId);

    if (deleteErr) {
      console.warn("DELETE /api/admin/results/[id]: event_results delete notice:", deleteErr.message);
    }

    // 3. Clean up registration notes fallback if matching registration found
    if (targetItem?.event_id && targetItem?.participant_id) {
      const { data: reg } = await supabase
        .from("registrations")
        .select("id, notes")
        .eq("event_id", targetItem.event_id)
        .eq("participant_id", targetItem.participant_id)
        .maybeSingle();

      if (reg?.notes) {
        try {
          let notesObj = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes;
          if (notesObj.result) {
            delete notesObj.result;
            await supabase
              .from("registrations")
              .update({ notes: JSON.stringify(notesObj), updated_at: new Date().toISOString() })
              .eq("id", reg.id);
          }
        } catch {}
      }
    } else {
      // Fallback: search registrations with result.id = resultId or fallback-registrationId
      const regIdClean = resultId.replace(/^fallback-/, "").replace(/^res-/, "");
      const { data: reg } = await supabase
        .from("registrations")
        .select("id, notes")
        .eq("id", regIdClean)
        .maybeSingle();

      if (reg?.notes) {
        try {
          let notesObj = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes;
          if (notesObj.result) {
            delete notesObj.result;
            await supabase
              .from("registrations")
              .update({ notes: JSON.stringify(notesObj), updated_at: new Date().toISOString() })
              .eq("id", reg.id);
          }
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      message: "Result deleted successfully",
      id: resultId,
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/results/[id] exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete result record" },
      { status: 500 }
    );
  }
}
