import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

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
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const nowIso = new Date().toISOString();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: nowIso })
      .eq("is_read", false);

    if (error) {
      // Schema cache fallback
      const { error: fbErr } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);

      if (fbErr) {
        return NextResponse.json({ success: false, error: fbErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "All admin notifications marked as read" });
  } catch (err: any) {
    console.error("POST /api/admin/notifications/read-all exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
