import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized admin access" },
        { status: authCheck.status || 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") || "7d"; // "7d" or "30d"
    const daysCount = rangeParam === "30d" ? 30 : 7;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database client unavailable" },
        { status: 500 }
      );
    }

    // 1. Fetch Events
    const { data: eventsData, error: eventsErr } = await supabase
      .from("events")
      .select("id, title, slug, event_date, status, is_published, banner_image, thumbnail_image, venue, city, current_participants, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (eventsErr) {
      console.warn("GET /api/admin/dashboard events query warning:", eventsErr.message);
    }

    const events = eventsData || [];
    const now = new Date();

    let totalEvents = events.length;
    let activeEvents = 0;
    let upcomingEventsCount = 0;
    let completedEventsCount = 0;
    let draftEventsCount = 0;

    events.forEach((evt) => {
      const evtDate = evt.event_date ? new Date(evt.event_date) : null;
      const statusLower = (evt.status || "").toLowerCase();

      if (statusLower === "draft") {
        draftEventsCount++;
      } else if (statusLower === "completed" || (evtDate && evtDate < now && statusLower !== "ongoing")) {
        completedEventsCount++;
      } else {
        if (evt.is_published || statusLower === "published" || statusLower === "registration_open" || statusLower === "ongoing") {
          activeEvents++;
        }
        if (statusLower === "published" || statusLower === "registration_open" || (evtDate && evtDate >= now)) {
          upcomingEventsCount++;
        }
      }
    });

    // 2. Fetch Registrations
    const { data: registrationsData, error: regErr } = await supabase
      .from("registrations")
      .select("id, registration_number, event_id, participant_id, registration_status, payment_status, amount, registration_date, created_at")
      .order("created_at", { ascending: false });

    if (regErr) {
      console.warn("GET /api/admin/dashboard registrations query warning:", regErr.message);
    }

    const registrations = registrationsData || [];
    let totalRegistrations = registrations.length;
    let confirmedRegistrations = 0;
    let pendingRegistrations = 0;
    let totalRevenue = 0;
    const uniqueParticipantSet = new Set<string>();

    registrations.forEach((reg) => {
      if (reg.participant_id) {
        uniqueParticipantSet.add(reg.participant_id);
      }
      const regStatus = (reg.registration_status || "").toLowerCase();
      const payStatus = (reg.payment_status || "").toLowerCase();

      if (regStatus === "confirmed" || payStatus === "paid") {
        confirmedRegistrations++;
      } else if (regStatus === "pending" || regStatus === "payment_pending" || payStatus === "pending") {
        pendingRegistrations++;
      }

      if (payStatus === "paid" || regStatus === "confirmed") {
        const amt = Number(reg.amount || 0);
        if (!isNaN(amt)) {
          totalRevenue += amt;
        }
      }
    });

    // 3. Fetch Participants Master Registry Count
    const { count: participantsDbCount } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true });

    const totalUniqueParticipants = Math.max(
      uniqueParticipantSet.size,
      participantsDbCount || 0
    );

    // 4. Fetch Banners
    const { data: bannersData, error: banErr } = await supabase
      .from("banners")
      .select("id, title, subtitle, image_url, mobile_image_url, link_url, button_text, banner_type, display_order, is_active, start_date, end_date, created_at")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (banErr) {
      console.warn("GET /api/admin/dashboard banners query warning:", banErr.message);
    }

    const banners = bannersData || [];
    let totalBanners = banners.length;
    let activeBanners = 0;
    let scheduledBanners = 0;

    const heroBanners = banners.filter((b) => {
      if (b.is_active) activeBanners++;
      if (b.start_date && new Date(b.start_date) > now) scheduledBanners++;
      return b.is_active;
    });

    // 5. Fetch Event Categories
    const { count: categoriesCount } = await supabase
      .from("event_categories")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    const totalCategories = categoriesCount || 0;

    // 6. Map Events details for registrations to enrich recent activities & upcoming lists
    const eventMap = new Map<string, any>();
    events.forEach((e) => eventMap.set(e.id, e));

    // Upcoming Events List
    const upcomingEventsList = events
      .filter((e) => {
        const d = e.event_date ? new Date(e.event_date) : null;
        const statusLower = (e.status || "").toLowerCase();
        return (d && d >= now) || statusLower === "published" || statusLower === "registration_open" || statusLower === "ongoing";
      })
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        event_date: e.event_date,
        location: e.venue && e.city ? `${e.venue}, ${e.city}` : e.city || e.venue || "TBA",
        status: e.status || "published",
        image: e.banner_image || e.thumbnail_image || "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=400&q=80",
        current_participants: e.current_participants || 0,
      }));

    // Recent Events List
    const recentEventsList = events.slice(0, 5).map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      event_date: e.event_date,
      location: e.venue && e.city ? `${e.venue}, ${e.city}` : e.city || e.venue || "TBA",
      status: e.status || "published",
      image: e.banner_image || e.thumbnail_image || "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=400&q=80",
      created_at: e.created_at,
    }));

    // 7. Recent Activity Audit Log (Merged from recent registrations & events & banners)
    const activities: Array<{
      id: string;
      title: string;
      time: string;
      type: "registration" | "event" | "banner";
      timestamp: Date;
    }> = [];

    // Add recent registrations
    registrations.slice(0, 5).forEach((reg) => {
      const evt = eventMap.get(reg.event_id);
      const evtName = evt?.title ? `"${evt.title}"` : `Reg #${reg.registration_number || reg.id.slice(0, 8)}`;
      const regTime = reg.created_at || reg.registration_date ? new Date(reg.created_at || reg.registration_date) : new Date();
      activities.push({
        id: `reg-${reg.id}`,
        title: `New registration recorded for ${evtName}`,
        time: formatRelativeTime(regTime),
        type: "registration",
        timestamp: regTime,
      });
    });

    // Add recent events
    events.slice(0, 4).forEach((evt) => {
      const evtTime = evt.created_at ? new Date(evt.created_at) : new Date();
      activities.push({
        id: `evt-${evt.id}`,
        title: `New event "${evt.title}" published`,
        time: formatRelativeTime(evtTime),
        type: "event",
        timestamp: evtTime,
      });
    });

    // Add recent banners
    banners.slice(0, 3).forEach((ban) => {
      const banTime = ban.created_at ? new Date(ban.created_at) : new Date();
      activities.push({
        id: `ban-${ban.id}`,
        title: `Banner "${ban.title}" updated`,
        time: formatRelativeTime(banTime),
        type: "banner",
        timestamp: banTime,
      });
    });

    // Sort combined activities descending by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const recentActivities = activities.slice(0, 6).map((a) => ({
      id: a.id,
      title: a.title,
      time: a.time,
      type: a.type,
    }));

    // 8. Dynamic Chart: Registration Trend (Daily breakdown for last N days)
    const registrationTrend: Array<{ date: string; fullDate: string; count: number }> = [];
    const dateCountsMap = new Map<string, number>();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
      dateCountsMap.set(dateKey, 0);
    }

    registrations.forEach((reg) => {
      const rawDate = reg.registration_date || reg.created_at;
      if (rawDate) {
        const key = new Date(rawDate).toISOString().split("T")[0];
        if (dateCountsMap.has(key)) {
          dateCountsMap.set(key, (dateCountsMap.get(key) || 0) + 1);
        }
      }
    });

    dateCountsMap.forEach((count, key) => {
      const d = new Date(key);
      const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      registrationTrend.push({
        date: label,
        fullDate: key,
        count: count,
      });
    });

    // 9. Dynamic Chart: Events By Status Breakdown
    const statusCounts = {
      upcoming: upcomingEventsCount,
      ongoing: events.filter((e) => (e.status || "").toLowerCase() === "ongoing").length,
      completed: completedEventsCount,
      draft: draftEventsCount,
    };

    const eventsByStatus = [
      { name: "Upcoming", count: statusCounts.upcoming, color: "#3B82F6" },
      { name: "Ongoing", count: statusCounts.ongoing, color: "#EC4899" },
      { name: "Completed", count: statusCounts.completed, color: "#06B6D4" },
      { name: "Draft", count: statusCounts.draft, color: "#F59E0B" },
    ];

    return NextResponse.json({
      success: true,
      stats: {
        events: {
          total: totalEvents,
          active: activeEvents,
          upcoming: upcomingEventsCount,
          completed: completedEventsCount,
          draft: draftEventsCount,
        },
        participants: {
          totalRegistrations: totalRegistrations,
          confirmedRegistrations: confirmedRegistrations,
          pendingRegistrations: pendingRegistrations,
          uniqueParticipants: totalUniqueParticipants,
        },
        revenue: {
          total: totalRevenue,
        },
        banners: {
          total: totalBanners,
          active: activeBanners,
          scheduled: scheduledBanners,
        },
        categories: {
          total: totalCategories,
        },
      },
      heroBanners,
      upcomingEvents: upcomingEventsList,
      recentEvents: recentEventsList,
      recentActivities,
      charts: {
        registrationTrend,
        eventsByStatus,
      },
    });
  } catch (err: any) {
    console.error("GET /api/admin/dashboard exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to compute dashboard metrics" },
      { status: 500 }
    );
  }
}

// Relative time formatter helper
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
