import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient, verifyAdminApi } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabaseServer = await createClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0 });
    }

    let matchingParticipantIds: string[] = [];
    if (user?.email) {
      const { data: parts } = await supabaseAdmin
        .from("participants")
        .select("id")
        .ilike("email", user.email.toLowerCase());
      if (parts) {
        matchingParticipantIds = parts.map((p) => p.id);
      }
    }

    const { data: allNotifs, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.warn("GET /api/notifications query warning:", error.message);
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0, warning: error.message });
    }

    // Filter notifications relevant to logged in user / participant
    const userNotifs = (allNotifs || []).filter((n) => {
      if (!user && matchingParticipantIds.length === 0) return true; // Dev preview
      if (n.user_id && user?.id && n.user_id === user.id) return true;
      if (n.reference_id && matchingParticipantIds.includes(n.reference_id)) return true;
      if (n.participant_id && matchingParticipantIds.includes(n.participant_id)) return true;
      return false;
    });

    const unreadCount = userNotifs.filter((n) => !n.is_read).length;

    return NextResponse.json({
      success: true,
      notifications: userNotifs,
      unreadCount,
    });
  } catch (err: any) {
    console.error("GET /api/notifications exception:", err);
    return NextResponse.json({ success: false, error: err.message, notifications: [], unreadCount: 0 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error || "Unauthorized admin access" }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, participant_id, event_id, title, message, notification_type = "system", link_url } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "title and message are required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "Database service unavailable" }, { status: 500 });
    }

    const payload: any = {
      title,
      message,
      notification_type,
      reference_type: "admin_notification",
      reference_id: participant_id || user_id || null,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabaseAdmin
      .from("notifications")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: inserted });
  } catch (err: any) {
    console.error("POST /api/notifications exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
