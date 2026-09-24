"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Calendar,
  Filter,
  RefreshCw,
  Award,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Globe,
  AlertCircle,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

import { ReportStatCard } from "@/components/admin/reports/ReportStatCard";
import { RegistrationChart, RegistrationTrendItem } from "@/components/admin/reports/RegistrationChart";
import { EventPerformanceTable, EventPerformanceItem } from "@/components/admin/reports/EventPerformanceTable";
import { CategoryAnalytics, CategoryPerformanceItem } from "@/components/admin/reports/CategoryAnalytics";
import { AttendanceReport, AttendanceReportData } from "@/components/admin/reports/AttendanceReport";
import { CertificateReport, CertificateReportData } from "@/components/admin/reports/CertificateReport";
import { TopPerformingEvents, TopEventItem } from "@/components/admin/reports/TopPerformingEvents";
import { RecentActivity, RecentActivityItem } from "@/components/admin/reports/RecentActivity";
import { ExportReport } from "@/components/admin/reports/ExportReport";

export default function AdminReportsPage() {
  // Filter States
  const [dateRange, setDateRange] = useState<string>("all");
  const [eventIdFilter, setEventIdFilter] = useState<string>("all");
  const [categoryIdFilter, setCategoryIdFilter] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<"daily" | "weekly" | "monthly">("daily");

  // Data States
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Available options from API
  const [eventsList, setEventsList] = useState<Array<{ id: string; title: string }>>([]);
  const [categoriesList, setCategoriesList] = useState<Array<{ id: string; name: string }>>([]);

  // Report Metrics
  const [overview, setOverview] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalParticipants: 0,
    attendanceRate: 0,
    certificatesIssued: 0,
    certificatesPending: 0,
    certificatesRevoked: 0,
  });

  const [registrationTrend, setRegistrationTrend] = useState<RegistrationTrendItem[]>([]);
  const [eventPerformance, setEventPerformance] = useState<EventPerformanceItem[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformanceItem[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceReportData>({
    registered: 0,
    attended: 0,
    absent: 0,
    attendanceRate: 0,
  });
  const [certificateData, setCertificateData] = useState<CertificateReportData>({
    eligible: 0,
    issued: 0,
    pending: 0,
    revoked: 0,
    eventBreakdown: [],
  });
  const [topEvents, setTopEvents] = useState<TopEventItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);

  // Fetch Report Data from API
  const fetchReportData = useCallback(async (isRefreshCall = false) => {
    if (isRefreshCall) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("dateRange", dateRange);
      params.set("eventId", eventIdFilter);
      params.set("categoryId", categoryIdFilter);
      params.set("groupBy", groupBy);

      const res = await fetch(`/api/admin/reports?${params.toString()}`, {
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch report data from server");
      }

      // Populate Filter Options
      if (json.filters) {
        if (json.filters.events) setEventsList(json.filters.events);
        if (json.filters.categories) setCategoriesList(json.filters.categories);
      }

      // Populate Analytics States
      if (json.overview) setOverview(json.overview);
      if (json.registrationOverview?.data) setRegistrationTrend(json.registrationOverview.data);
      if (json.eventPerformance) setEventPerformance(json.eventPerformance);
      if (json.categoryPerformance) setCategoryPerformance(json.categoryPerformance);
      if (json.attendanceReport) setAttendanceData(json.attendanceReport);
      if (json.certificateReport) setCertificateData(json.certificateReport);
      if (json.topPerformingEvents) setTopEvents(json.topPerformingEvents);
      if (json.recentActivity) setRecentActivities(json.recentActivity);
    } catch (err: any) {
      console.error("Error fetching admin reports:", err);
      setError(err.message || "An unexpected error occurred while generating reports.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, eventIdFilter, categoryIdFilter, groupBy]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // CSV Export Logic
  const handleExportCSV = () => {
    const activeDateLabel = getDateRangeLabel(dateRange);
    const selectedEvent = eventsList.find((e) => e.id === eventIdFilter)?.title || "All Events";
    const selectedCategory = categoriesList.find((c) => c.id === categoryIdFilter)?.name || "All Categories";

    let csv = `CGS ENTERTAINMENTS - EXECUTIVE REPORTS & ANALYTICS\n`;
    csv += `Generated At,${new Date().toLocaleString("en-IN")}\n`;
    csv += `Date Range,${activeDateLabel}\n`;
    csv += `Event Filter,${selectedEvent}\n`;
    csv += `Category Filter,${selectedCategory}\n\n`;

    csv += `--- OVERVIEW METRICS ---\n`;
    csv += `Total Events,Total Registrations,Total Participants,Attendance Rate (%),Certificates Issued,Certificates Pending\n`;
    csv += `${overview.totalEvents},${overview.totalRegistrations},${overview.totalParticipants},${overview.attendanceRate}%,${overview.certificatesIssued},${overview.certificatesPending}\n\n`;

    csv += `--- EVENT PERFORMANCE ---\n`;
    csv += `Event Title,Category,Date,Registrations,Attended,Attendance Rate (%),Certificates Issued,Status\n`;
    eventPerformance.forEach((e) => {
      const d = e.eventDate ? new Date(e.eventDate).toLocaleDateString("en-IN") : "TBA";
      csv += `"${e.title.replace(/"/g, '""')}","${e.categoryName}",${d},${e.registrations},${e.attended},${e.attendanceRate}%,${e.certificates},"${e.status}"\n`;
    });
    csv += `\n`;

    csv += `--- CATEGORY PERFORMANCE ---\n`;
    csv += `Category Name,Events Count,Registrations,Participants,Attended,Share (%)\n`;
    categoryPerformance.forEach((c) => {
      csv += `"${c.name}",${c.eventsCount},${c.registrations},${c.participants},${c.attended},${c.percentage}%\n`;
    });
    csv += `\n`;

    csv += `--- CERTIFICATE STATUS BREAKDOWN ---\n`;
    csv += `Event Title,Eligible,Issued,Pending\n`;
    certificateData.eventBreakdown.forEach((cb) => {
      csv += `"${cb.eventTitle.replace(/"/g, '""')}",${cb.eligible},${cb.issued},${cb.pending}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cgs_admin_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export (Triggers clean print mode)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }} className="admin-reports-container">
      {/* --------------------------------------------------------------------- */}
      {/* Page Header & Filter Toolbar */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 12 }}>
              <BarChart3 size={32} color="#7C3AED" /> Reports &amp; Analytics
            </h1>
            <p style={{ fontSize: 14.5, color: "#64748B", margin: 0, fontWeight: 500, maxWidth: 680 }}>
              Monitor event performance, registrations, participation, attendance, and certificate activity from one place.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchReportData(true)}
              disabled={refreshing || loading}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                background: "#ffffff",
                border: "1.5px solid #E2E8F0",
                color: "#334155",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
              }}
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} color="#7C3AED" />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            {/* Export Dropdown Component */}
            <ExportReport
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              dateRangeLabel={getDateRangeLabel(dateRange)}
            />
          </div>
        </div>

        {/* Global Filter Bar */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            border: "1.5px solid #E2E8F0",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
          }}
          className="no-print"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7C3AED", fontWeight: 800, fontSize: 13.5 }}>
            <Filter size={18} /> Filters:
          </div>

          {/* Date Range Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B" }}>Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1.5px solid #CBD5E1",
                fontSize: 13,
                fontWeight: 700,
                color: "#0F172A",
                background: "#F8FAFC",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="this_year">This Year (2026)</option>
            </select>
          </div>

          {/* Event Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B" }}>Event:</label>
            <select
              value={eventIdFilter}
              onChange={(e) => setEventIdFilter(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1.5px solid #CBD5E1",
                fontSize: 13,
                fontWeight: 700,
                color: "#0F172A",
                background: "#F8FAFC",
                outline: "none",
                maxWidth: 220,
                cursor: "pointer",
              }}
            >
              <option value="all">All Events</option>
              {eventsList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B" }}>Category:</label>
            <select
              value={categoryIdFilter}
              onChange={(e) => setCategoryIdFilter(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1.5px solid #CBD5E1",
                fontSize: 13,
                fontWeight: 700,
                color: "#0F172A",
                background: "#F8FAFC",
                outline: "none",
                maxWidth: 200,
                cursor: "pointer",
              }}
            >
              <option value="all">All Categories</option>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters helper button */}
          {(dateRange !== "all" || eventIdFilter !== "all" || categoryIdFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setDateRange("all");
                setEventIdFilter("all");
                setCategoryIdFilter("all");
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: "#FEE2E2",
                color: "#DC2626",
                border: "none",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1.5px solid #FCA5A5",
            borderRadius: 16,
            padding: "16px 20px",
            color: "#991B1B",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={20} color="#DC2626" />
            <span style={{ fontSize: 14, fontWeight: 700 }}>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchReportData()}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: "#DC2626",
              color: "#ffffff",
              border: "none",
              fontSize: 12.5,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 1. Overview Cards (6 Cards) */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
        <ReportStatCard
          label="Total Events"
          value={overview.totalEvents}
          icon={Calendar}
          iconColor="#7C3AED"
          iconBg="#F3E8FF"
          indicatorText="Created in DB"
          indicatorType="purple"
          loading={loading}
        />
        <ReportStatCard
          label="Total Registrations"
          value={overview.totalRegistrations}
          icon={TrendingUp}
          iconColor="#2563EB"
          iconBg="#EFF6FF"
          indicatorText="Across Events"
          indicatorType="positive"
          loading={loading}
        />
        <ReportStatCard
          label="Total Participants"
          value={overview.totalParticipants}
          icon={Users}
          iconColor="#06B6D4"
          iconBg="#ECFEFF"
          indicatorText="Unique Registrants"
          indicatorType="neutral"
          loading={loading}
        />
        <ReportStatCard
          label="Attendance Rate"
          value={`${overview.attendanceRate}%`}
          icon={CheckCircle2}
          iconColor="#16A34A"
          iconBg="#DCFCE7"
          indicatorText="Confirmed Turnout"
          indicatorType="positive"
          loading={loading}
        />
        <ReportStatCard
          label="Certificates Issued"
          value={overview.certificatesIssued}
          icon={Award}
          iconColor="#D97706"
          iconBg="#FEF3C7"
          indicatorText="Verified Issued"
          indicatorType="positive"
          loading={loading}
        />
        <ReportStatCard
          label="Certificates Pending"
          value={overview.certificatesPending}
          icon={Clock}
          iconColor="#EA580C"
          iconBg="#FFEDD5"
          indicatorText="Eligible to Issue"
          indicatorType="neutral"
          loading={loading}
        />
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. Registration Overview Chart */}
      {/* --------------------------------------------------------------------- */}
      <RegistrationChart
        data={registrationTrend}
        groupBy={groupBy}
        onGroupByChange={(mode) => setGroupBy(mode)}
        loading={loading}
      />

      {/* --------------------------------------------------------------------- */}
      {/* 3. Event Performance Table */}
      {/* --------------------------------------------------------------------- */}
      <EventPerformanceTable events={eventPerformance} loading={loading} />

      {/* --------------------------------------------------------------------- */}
      {/* 4 & 5. Grid Row: Category Analytics & Attendance Report */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        <CategoryAnalytics categories={categoryPerformance} loading={loading} />
        <AttendanceReport data={attendanceData} loading={loading} />
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 6. Certificate Report (Summary + Event Breakdown) */}
      {/* --------------------------------------------------------------------- */}
      <CertificateReport data={certificateData} loading={loading} />

      {/* --------------------------------------------------------------------- */}
      {/* 7 & 8. Grid Row: Top Performing Events & Recent Activity */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        <TopPerformingEvents events={topEvents} loading={loading} />
        <RecentActivity activities={recentActivities} loading={loading} />
      </div>

      {/* PDF Print Stylesheet */}
      <style>{`
        @media print {
          .no-print, nav, aside, header {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .admin-reports-container {
            padding: 0 !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Helper to display clean human-readable date range labels
function getDateRangeLabel(range: string): string {
  switch (range) {
    case "today":
      return "Today";
    case "7d":
      return "Last 7 Days";
    case "30d":
      return "Last 30 Days";
    case "90d":
      return "Last 90 Days";
    case "this_year":
      return "This Year (2026)";
    default:
      return "All Time";
  }
}
