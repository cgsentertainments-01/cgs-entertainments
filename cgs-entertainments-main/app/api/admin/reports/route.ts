import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Authenticate Admin User on API level
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized admin access" },
        { status: authCheck.status || 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "all"; // all, today, 7d, 30d, 90d, this_year, custom
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");
    const eventIdFilter = searchParams.get("eventId") || "all";
    const categoryIdFilter = searchParams.get("categoryId") || "all";
    const groupBy = searchParams.get("groupBy") || "daily"; // daily, weekly, monthly

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database client unavailable" },
        { status: 500 }
      );
    }

    // -------------------------------------------------------------------------
    // Compute Filter Dates
    // -------------------------------------------------------------------------
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (dateRange === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (dateRange === "7d") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === "30d") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 30);
    } else if (dateRange === "90d") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 90);
    } else if (dateRange === "this_year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (dateRange === "custom" && customStart) {
      startDate = new Date(customStart);
      if (customEnd) {
        endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    // -------------------------------------------------------------------------
    // 1. Query Event Categories (for category mapping & filter options)
    // -------------------------------------------------------------------------
    const { data: categoriesData } = await supabase
      .from("event_categories")
      .select("id, name, slug, description")
      .order("name", { ascending: true });

    const categories = categoriesData || [];
    const categoryMap = new Map<string, { name: string; slug: string }>();
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { name: cat.name, slug: cat.slug });
    });

    // -------------------------------------------------------------------------
    // 2. Query Events
    // -------------------------------------------------------------------------
    let eventsQuery = supabase
      .from("events")
      .select("id, title, slug, category_id, event_date, status, is_published, current_participants, max_participants, created_at");

    if (categoryIdFilter !== "all") {
      eventsQuery = eventsQuery.eq("category_id", categoryIdFilter);
    }
    if (eventIdFilter !== "all") {
      eventsQuery = eventsQuery.eq("id", eventIdFilter);
    }

    const { data: eventsData, error: eventsErr } = await eventsQuery.order("created_at", { ascending: false });
    if (eventsErr) {
      console.warn("GET /api/admin/reports events query warning:", eventsErr.message);
    }

    const allEvents = eventsData || [];
    const eventMap = new Map<string, any>();
    allEvents.forEach((evt) => eventMap.set(evt.id, evt));

    // Filter events by date range if applicable
    const filteredEvents = allEvents.filter((evt) => {
      const created = evt.created_at ? new Date(evt.created_at) : null;
      const evtDate = evt.event_date ? new Date(evt.event_date) : null;
      const checkDate = evtDate || created;
      if (!checkDate) return true;
      if (startDate && checkDate < startDate) return false;
      if (endDate && checkDate > endDate) return false;
      return true;
    });

    // -------------------------------------------------------------------------
    // 3. Query Registrations
    // -------------------------------------------------------------------------
    let regQuery = supabase
      .from("registrations")
      .select("id, registration_number, event_id, participant_id, category_id, registration_status, payment_status, amount, registration_date, created_at");

    if (eventIdFilter !== "all") {
      regQuery = regQuery.eq("event_id", eventIdFilter);
    }
    if (categoryIdFilter !== "all") {
      regQuery = regQuery.eq("category_id", categoryIdFilter);
    }

    const { data: regData, error: regErr } = await regQuery.order("created_at", { ascending: false });
    if (regErr) {
      console.warn("GET /api/admin/reports registrations query warning:", regErr.message);
    }

    const allRegistrations = regData || [];

    // Apply date range filter to registrations
    const filteredRegistrations = allRegistrations.filter((reg) => {
      const regDate = reg.registration_date || reg.created_at ? new Date(reg.registration_date || reg.created_at) : null;
      if (!regDate) return true;
      if (startDate && regDate < startDate) return false;
      if (endDate && regDate > endDate) return false;
      return true;
    });

    // -------------------------------------------------------------------------
    // 4. Query Certificates
    // -------------------------------------------------------------------------
    let certQuery = supabase
      .from("certificates")
      .select("id, certificate_number, registration_id, participant_id, event_id, certificate_type, status, issued_at, created_at");

    if (eventIdFilter !== "all") {
      certQuery = certQuery.eq("event_id", eventIdFilter);
    }

    const { data: certData, error: certErr } = await certQuery.order("created_at", { ascending: false });
    if (certErr) {
      console.warn("GET /api/admin/reports certificates query warning:", certErr.message);
    }

    const allCertificates = certData || [];
    const filteredCertificates = allCertificates.filter((cert) => {
      const certDate = cert.issued_at || cert.created_at ? new Date(cert.issued_at || cert.created_at) : null;
      if (!certDate) return true;
      if (startDate && certDate < startDate) return false;
      if (endDate && certDate > endDate) return false;
      return true;
    });

    // Certs lookup set by registration_id
    const issuedRegIdSet = new Set<string>();
    let revokedCertCount = 0;
    filteredCertificates.forEach((c) => {
      const statusLower = (c.status || "").toLowerCase();
      if (statusLower === "revoked") {
        revokedCertCount++;
      } else {
        if (c.registration_id) issuedRegIdSet.add(c.registration_id);
      }
    });

    // -------------------------------------------------------------------------
    // 5. Compute Overview Metrics
    // -------------------------------------------------------------------------
    const totalEventsCount = filteredEvents.length;
    const totalRegistrationsCount = filteredRegistrations.length;

    const uniqueParticipantsSet = new Set<string>();
    let attendedCount = 0;
    let eligibleCertCount = 0;

    filteredRegistrations.forEach((reg) => {
      if (reg.participant_id) {
        uniqueParticipantsSet.add(reg.participant_id);
      }

      const regStatus = (reg.registration_status || "").toLowerCase();
      const payStatus = (reg.payment_status || "").toLowerCase();

      // Attended criterion: confirmed or completed, or paid, or issued certificate
      const isAttended =
        regStatus === "confirmed" ||
        regStatus === "completed" ||
        payStatus === "paid" ||
        issuedRegIdSet.has(reg.id);

      if (isAttended) {
        attendedCount++;
        eligibleCertCount++;
      }
    });

    const totalParticipantsCount = uniqueParticipantsSet.size;
    const attendanceRatePct = totalRegistrationsCount > 0
      ? Math.round((attendedCount / totalRegistrationsCount) * 1000) / 10
      : 0;

    const certificatesIssuedCount = issuedRegIdSet.size;
    const certificatesPendingCount = Math.max(0, eligibleCertCount - certificatesIssuedCount);

    // Overview Stats Array
    const overviewCards = {
      totalEvents: totalEventsCount,
      totalRegistrations: totalRegistrationsCount,
      totalParticipants: totalParticipantsCount,
      attendanceRate: attendanceRatePct,
      certificatesIssued: certificatesIssuedCount,
      certificatesPending: certificatesPendingCount,
      certificatesRevoked: revokedCertCount,
    };

    // -------------------------------------------------------------------------
    // 6. Registration Trend Analytics (Daily / Weekly / Monthly)
    // -------------------------------------------------------------------------
    const trendMap = new Map<string, { label: string; registrationCount: number; participantSet: Set<string> }>();

    filteredRegistrations.forEach((reg) => {
      const d = reg.registration_date || reg.created_at ? new Date(reg.registration_date || reg.created_at) : new Date();
      let key = "";
      let label = "";

      if (groupBy === "monthly") {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        label = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      } else if (groupBy === "weekly") {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(d.setDate(diff));
        key = weekStart.toISOString().split("T")[0];
        label = `Week of ${weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
      } else {
        key = d.toISOString().split("T")[0];
        label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      }

      if (!trendMap.has(key)) {
        trendMap.set(key, { label, registrationCount: 0, participantSet: new Set() });
      }
      const entry = trendMap.get(key)!;
      entry.registrationCount += 1;
      if (reg.participant_id) entry.participantSet.add(reg.participant_id);
    });

    const sortedKeys = Array.from(trendMap.keys()).sort();
    const registrationTrend = sortedKeys.map((key) => {
      const item = trendMap.get(key)!;
      return {
        key,
        label: item.label,
        registrations: item.registrationCount,
        participants: item.participantSet.size,
      };
    });

    // -------------------------------------------------------------------------
    // 7. Event Performance Breakdown
    // -------------------------------------------------------------------------
    const eventStatsMap = new Map<string, {
      id: string;
      title: string;
      categoryName: string;
      eventDate: string | null;
      registrations: number;
      attended: number;
      certificates: number;
      status: string;
    }>();

    filteredEvents.forEach((evt) => {
      const catInfo = categoryMap.get(evt.category_id);
      eventStatsMap.set(evt.id, {
        id: evt.id,
        title: evt.title,
        categoryName: catInfo?.name || "General",
        eventDate: evt.event_date,
        registrations: 0,
        attended: 0,
        certificates: 0,
        status: computeEventStatus(evt),
      });
    });

    filteredRegistrations.forEach((reg) => {
      if (eventStatsMap.has(reg.event_id)) {
        const stats = eventStatsMap.get(reg.event_id)!;
        stats.registrations += 1;
        const regStatus = (reg.registration_status || "").toLowerCase();
        const payStatus = (reg.payment_status || "").toLowerCase();
        if (regStatus === "confirmed" || regStatus === "completed" || payStatus === "paid" || issuedRegIdSet.has(reg.id)) {
          stats.attended += 1;
        }
      }
    });

    filteredCertificates.forEach((cert) => {
      if (eventStatsMap.has(cert.event_id) && cert.status !== "revoked") {
        const stats = eventStatsMap.get(cert.event_id)!;
        stats.certificates += 1;
      }
    });

    const eventPerformance = Array.from(eventStatsMap.values()).map((evt) => ({
      ...evt,
      attendanceRate: evt.registrations > 0 ? Math.round((evt.attended / evt.registrations) * 100) : 0,
    }));

    eventPerformance.sort((a, b) => b.registrations - a.registrations);

    // -------------------------------------------------------------------------
    // 8. Category Performance Breakdown
    // -------------------------------------------------------------------------
    const catStatsMap = new Map<string, {
      id: string;
      name: string;
      eventsCount: number;
      registrations: number;
      participantSet: Set<string>;
      attended: number;
    }>();

    categories.forEach((cat) => {
      catStatsMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        eventsCount: 0,
        registrations: 0,
        participantSet: new Set(),
        attended: 0,
      });
    });

    filteredEvents.forEach((evt) => {
      if (catStatsMap.has(evt.category_id)) {
        catStatsMap.get(evt.category_id)!.eventsCount += 1;
      } else {
        const catName = categoryMap.get(evt.category_id)?.name || "Uncategorized";
        catStatsMap.set(evt.category_id, {
          id: evt.category_id,
          name: catName,
          eventsCount: 1,
          registrations: 0,
          participantSet: new Set(),
          attended: 0,
        });
      }
    });

    filteredRegistrations.forEach((reg) => {
      let catId = reg.category_id;
      if (!catId && reg.event_id && eventMap.has(reg.event_id)) {
        catId = eventMap.get(reg.event_id).category_id;
      }
      if (catId && catStatsMap.has(catId)) {
        const stats = catStatsMap.get(catId)!;
        stats.registrations += 1;
        if (reg.participant_id) stats.participantSet.add(reg.participant_id);
        const regStatus = (reg.registration_status || "").toLowerCase();
        const payStatus = (reg.payment_status || "").toLowerCase();
        if (regStatus === "confirmed" || regStatus === "completed" || payStatus === "paid") {
          stats.attended += 1;
        }
      }
    });

    const categoryPerformance = Array.from(catStatsMap.values())
      .filter((c) => c.eventsCount > 0 || c.registrations > 0)
      .map((c) => ({
        id: c.id,
        name: c.name,
        eventsCount: c.eventsCount,
        registrations: c.registrations,
        participants: c.participantSet.size,
        attended: c.attended,
        percentage: totalRegistrationsCount > 0 ? Math.round((c.registrations / totalRegistrationsCount) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.registrations - a.registrations);

    // -------------------------------------------------------------------------
    // 9. Attendance Report Breakdown
    // -------------------------------------------------------------------------
    const absentCount = Math.max(0, totalRegistrationsCount - attendedCount);
    const attendanceReport = {
      registered: totalRegistrationsCount,
      attended: attendedCount,
      absent: absentCount,
      attendanceRate: attendanceRatePct,
    };

    // -------------------------------------------------------------------------
    // 10. Certificate Report & Event-Wise Breakdown
    // -------------------------------------------------------------------------
    const certificateReport = {
      eligible: eligibleCertCount,
      issued: certificatesIssuedCount,
      pending: certificatesPendingCount,
      revoked: revokedCertCount,
      eventBreakdown: eventPerformance.map((evt) => ({
        eventId: evt.id,
        eventTitle: evt.title,
        eligible: evt.attended,
        issued: evt.certificates,
        pending: Math.max(0, evt.attended - evt.certificates),
      })),
    };

    // -------------------------------------------------------------------------
    // 11. Top Performing Events (Top 5)
    // -------------------------------------------------------------------------
    const topPerformingEvents = eventPerformance.slice(0, 5).map((evt, idx) => ({
      rank: idx + 1,
      id: evt.id,
      title: evt.title,
      categoryName: evt.categoryName,
      registrations: evt.registrations,
      attendanceRate: evt.attendanceRate,
      certificatesIssued: evt.certificates,
    }));

    // -------------------------------------------------------------------------
    // 12. Recent Audit Activity Timeline
    // -------------------------------------------------------------------------
    const activityItems: Array<{
      id: string;
      title: string;
      subtitle: string;
      timestamp: Date;
      type: "event_created" | "registration" | "certificate" | "event_completed";
    }> = [];

    filteredEvents.slice(0, 4).forEach((evt) => {
      const dt = evt.created_at ? new Date(evt.created_at) : new Date();
      activityItems.push({
        id: `act-evt-${evt.id}`,
        title: "New Event Created",
        subtitle: `Event "${evt.title}" was published to platform`,
        timestamp: dt,
        type: "event_created",
      });
    });

    filteredRegistrations.slice(0, 5).forEach((reg) => {
      const dt = reg.registration_date || reg.created_at ? new Date(reg.registration_date || reg.created_at) : new Date();
      const evtTitle = eventMap.get(reg.event_id)?.title || "Event";
      activityItems.push({
        id: `act-reg-${reg.id}`,
        title: "New Participant Registered",
        subtitle: `Registered for "${evtTitle}" (${reg.registration_number || "REG"})`,
        timestamp: dt,
        type: "registration",
      });
    });

    filteredCertificates.slice(0, 4).forEach((cert) => {
      const dt = cert.issued_at || cert.created_at ? new Date(cert.issued_at || cert.created_at) : new Date();
      const evtTitle = eventMap.get(cert.event_id)?.title || "Event";
      activityItems.push({
        id: `act-cert-${cert.id}`,
        title: "Certificate Issued",
        subtitle: `Certificate issued for "${evtTitle}"`,
        timestamp: dt,
        type: "certificate",
      });
    });

    activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const recentActivity = activityItems.slice(0, 8).map((act) => ({
      id: act.id,
      title: act.title,
      subtitle: act.subtitle,
      timeAgo: formatTimeAgo(act.timestamp),
      type: act.type,
    }));

    // -------------------------------------------------------------------------
    // Response Payload
    // -------------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      filters: {
        categories: categories.map((c) => ({ id: c.id, name: c.name })),
        events: allEvents.map((e) => ({ id: e.id, title: e.title })),
      },
      overview: overviewCards,
      registrationOverview: {
        groupBy,
        data: registrationTrend,
      },
      eventPerformance,
      categoryPerformance,
      attendanceReport,
      certificateReport,
      topPerformingEvents,
      recentActivity,
    });
  } catch (err: any) {
    console.error("GET /api/admin/reports exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to calculate report metrics" },
      { status: 500 }
    );
  }
}

function computeEventStatus(evt: any): string {
  const statusLower = (evt.status || "").toLowerCase();
  if (statusLower === "draft") return "Draft";
  if (statusLower === "completed" || statusLower === "cancelled") {
    return statusLower === "completed" ? "Completed" : "Cancelled";
  }
  const now = new Date();
  const evtDate = evt.event_date ? new Date(evt.event_date) : null;
  if (evtDate && evtDate < now) return "Completed";
  if (statusLower === "ongoing") return "Ongoing";
  return "Upcoming";
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
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
