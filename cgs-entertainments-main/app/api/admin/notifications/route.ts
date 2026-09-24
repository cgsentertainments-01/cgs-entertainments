import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

export async function GET(request: Request) {
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
      return NextResponse.json(
        { success: false, error: "Database connection unavailable", notifications: [], unreadCount: 0 },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const status = searchParams.get("status") || "all";
    const typeFilter = searchParams.get("type") || "all";
    const eventIdParam = searchParams.get("eventId") || searchParams.get("event_id");

    // 1. Unread count query
    let unreadCount = 0;
    try {
      let countQuery = supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (eventIdParam && eventIdParam !== "all") {
        countQuery = countQuery.or(`entity_id.eq.${eventIdParam},reference_id.eq.${eventIdParam}`);
      }

      const { count, error: countErr } = await countQuery;

      if (!countErr && count !== null) {
        unreadCount = count;
      }
    } catch (e) {
      console.warn("Notice getting unread count:", e);
    }

    // 2. Main notifications query with pagination
    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (eventIdParam && eventIdParam !== "all") {
      query = query.or(`entity_id.eq.${eventIdParam},reference_id.eq.${eventIdParam}`);
    }

    if (status === "unread") {
      query = query.eq("is_read", false);
    } else if (status === "read") {
      query = query.eq("is_read", true);
    }

    if (typeFilter && typeFilter !== "all") {
      query = query.eq("notification_type", typeFilter);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: notifications, count: totalCount, error } = await query;

    if (error) {
      console.error("GET /api/admin/notifications error:", error.message);
      return NextResponse.json({ success: false, error: error.message, notifications: [], unreadCount: 0 }, { status: 500 });
    }

    // Format fields cleanly
    const formatted = (notifications || []).map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      notification_type: n.notification_type || "system",
      type: n.notification_type || "system",
      entity_type: n.entity_type || n.reference_type || null,
      entity_id: n.entity_id || n.reference_id || null,
      link_url: n.link_url || null,
      is_read: Boolean(n.is_read),
      created_at: n.created_at,
      read_at: n.read_at || null,
      admin_id: n.admin_id || n.recipient_id || null,
    }));

    return NextResponse.json({
      success: true,
      notifications: formatted,
      unreadCount,
      total: totalCount || formatted.length,
      page,
      limit,
    });
  } catch (err: any) {
    console.error("GET /api/admin/notifications exception:", err);
    return NextResponse.json({ success: false, error: err.message, notifications: [], unreadCount: 0 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, message, type = "system", entity_type, entity_id, link_url, deduplicate_key } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "title and message are required" }, { status: 400 });
    }

    const { createAdminNotification } = await import("@/lib/notifications");
    const result = await createAdminNotification({
      title,
      message,
      type,
      entityType: entity_type,
      entityId: entity_id,
      linkUrl: link_url,
      deduplicateKey: deduplicate_key,
    });

    if (!result) {
      return NextResponse.json({ success: false, error: "Failed to insert notification" }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: result });
  } catch (err: any) {
    console.error("POST /api/admin/notifications exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
