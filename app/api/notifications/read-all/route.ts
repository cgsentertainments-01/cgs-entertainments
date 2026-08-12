import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabaseServer = await createClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "Database service unavailable" }, { status: 500 });
    }

    const userEmail = user.email ? user.email.toLowerCase() : "";

    // 1. Fetch matching participant IDs for this user
    let matchingParticipantIds: string[] = [];
    if (userEmail) {
      const { data: parts } = await supabaseAdmin
        .from("participants")
        .select("id")
        .ilike("email", userEmail);
      if (parts) {
        matchingParticipantIds = parts.map((p) => p.id);
      }
    }

    // 2. Mark all as read for user_id or matching participant_ids
    if (matchingParticipantIds.length > 0) {
      await supabaseAdmin
        .from("notifications")
        .update({ is_read: true })
        .in("participant_id", matchingParticipantIds);
    }

    await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);

    return NextResponse.json({ success: true, message: "All notifications marked as read" });
  } catch (err: any) {
    console.error("POST /api/notifications/read-all exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
