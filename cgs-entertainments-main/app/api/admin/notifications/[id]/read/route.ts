import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

export async function PATCH(
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const nowIso = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: nowIso })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      // Fallback if read_at column fails
      const { data: fbUpdated, error: fbErr } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .select()
        .single();

      if (fbErr) {
        return NextResponse.json({ success: false, error: fbErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, notification: fbUpdated });
    }

    return NextResponse.json({ success: true, notification: updated });
  } catch (err: any) {
    console.error("PATCH /api/admin/notifications/[id]/read exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
