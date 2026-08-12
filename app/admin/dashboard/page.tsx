"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Users,
  IndianRupee,
  Image as ImageIcon,
  Plus,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Award,
  BarChart3,
  TrendingUp,
  Zap,
  RefreshCw,
  AlertTriangle,
  FolderTree,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";

interface DashboardData {
  stats: {
    events: {
      total: number;
      active: number;
      upcoming: number;
      completed: number;
      draft: number;
    };
    participants: {
      totalRegistrations: number;
      confirmedRegistrations: number;
      pendingRegistrations: number;
      uniqueParticipants: number;
    };
    revenue: {
      total: number;
    };
    banners: {
      total: number;
      active: number;
      scheduled: number;
    };
    categories: {
      total: number;
    };
  };
  heroBanners: Array<{
    id: string;
    title: string;
    subtitle?: string;
    image_url: string;
    link_url?: string;
    button_text?: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    slug: string;
    event_date: string;
    location: string;
    status: string;
    image: string;
    current_participants: number;
  }>;
  recentEvents: Array<{
    id: string;
    title: string;
    slug: string;
    event_date: string;
    location: string;
    status: string;
    image: string;
    created_at: string;
  }>;
  recentActivities: Array<{
    id: string;
    title: string;
    time: string;
    type: "registration" | "event" | "banner";
  }>;
  charts: {
    registrationTrend: Array<{
      date: string;
      fullDate: string;
      count: number;
    }>;
    eventsByStatus: Array<{
      name: string;
      count: number;
      color: string;
    }>;
  };
}

export default function AdminDashboardPage() {
  const { user, adminProfile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const adminDisplayName =
    adminProfile?.name || user?.user_metadata?.full_name || user?.email || "Admin";

  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await fetch(`/api/admin/dashboard?range=${timeRange}`);
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to load dashboard data from database.");
      }

      setData(result);
    } catch (err: any) {
      console.error("Dashboard data fetch error:", err);
      setError(err.message || "Unable to load dashboard statistics. Please check database connectivity.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Safe formatting helpers
  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount || 0);
    } catch {
      return `₹${amount || 0}`;
    }
  };

  const formatDateLabel = (dateStr?: string) => {
    if (!dateStr) return "Date TBA";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* ── HEADER ROW ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#F3E8FF", borderRadius: 8, fontSize: 11.5, fontWeight: 800, color: "#6D28D9", marginBottom: 6 }}>
            <Zap size={13} fill="#6D28D9" /> REAL-TIME ADMIN SYSTEM
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.5 }}>
            Welcome back, {adminDisplayName}! 👋
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Live metrics aggregated directly from your application database.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            style={{
              padding: "11px 18px",
              borderRadius: 14,
              background: "#ffffff",
              border: "1.5px solid #E2E8F0",
              color: "#334155",
              fontSize: 13.5,
              fontWeight: 800,
              cursor: loading || refreshing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              transition: "all 0.2s",
            }}
            className="top-btn-hover"
          >
            <RefreshCw size={16} color="#6D28D9" className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>

          <Link
            href="/"
            style={{
              padding: "11px 18px",
              borderRadius: 14,
              background: "#ffffff",
              border: "1.5px solid #E2E8F0",
              color: "#334155",
              fontSize: 13.5,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              textDecoration: "none",
            }}
            className="top-btn-hover"
          >
            <ExternalLink size={16} color="#64748B" />
            View Website
          </Link>

          <Link
            href="/admin/events"
            style={{
              padding: "11px 22px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
              color: "#ffffff",
              fontSize: 13.5,
              fontWeight: 800,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
            }}
            className="purple-btn-hover"
          >
            <Plus size={18} />
            Add New Event
          </Link>
        </div>
      </div>

      {/* ── ERROR STATE (NO FALLBACK TO MOCK DATA) ── */}
      {error && (
        <div
          style={{
            padding: "20px 24px",
            background: "#FEF2F2",
            border: "1.5px solid #FCA5A5",
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={24} color="#DC2626" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#991B1B" }}>
                Unable to load dashboard statistics
              </div>
              <div style={{ fontSize: 13, color: "#B91C1C", marginTop: 2 }}>{error}</div>
            </div>
          </div>
          <button
            onClick={() => fetchDashboardData()}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              background: "#DC2626",
              color: "#ffffff",
              border: "none",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* ── 4 STAT CARDS GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        {/* Card 1: Total Events */}
        <Link
          href="/admin/events"
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "22px 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: 18,
            textDecoration: "none",
          }}
          className="admin-card-hover"
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(109, 40, 217, 0.15)",
            }}
            className="icon-box-hover"
          >
            <Calendar size={28} color="#6D28D9" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#64748B", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Total Events
            </div>
            {loading ? (
              <div className="skeleton-pulse" style={{ height: 32, width: 80, borderRadius: 8, margin: "4px 0" }} />
            ) : (
              <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", lineHeight: 1.1 }}>
                {data?.stats.events.total ?? 0}
              </div>
            )}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#6D28D9", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6D28D9" }} />
              {loading ? "Loading..." : `${data?.stats.events.upcoming ?? 0} Upcoming • ${data?.stats.events.active ?? 0} Active`}
            </div>
          </div>
        </Link>

        {/* Card 2: Total Registrations / Participants */}
        <Link
          href="/admin/participants"
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "22px 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: 18,
            textDecoration: "none",
          }}
          className="admin-card-hover"
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(22, 163, 74, 0.15)",
            }}
            className="icon-box-hover"
          >
            <Users size={28} color="#16A34A" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#64748B", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Total Registrations
            </div>
            {loading ? (
              <div className="skeleton-pulse" style={{ height: 32, width: 80, borderRadius: 8, margin: "4px 0" }} />
            ) : (
              <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", lineHeight: 1.1 }}>
                {data?.stats.participants.totalRegistrations ?? 0}
              </div>
            )}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <TrendingUp size={13} color="#16A34A" />
              {loading ? "Loading..." : `${data?.stats.participants.uniqueParticipants ?? 0} Unique Participants`}
            </div>
          </div>
        </Link>

        {/* Card 3: Total Revenue */}
        <Link
          href="/admin/payments"
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "22px 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: 18,
            textDecoration: "none",
          }}
          className="admin-card-hover"
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.15)",
            }}
            className="icon-box-hover"
          >
            <IndianRupee size={28} color="#D97706" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#64748B", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Total Revenue
            </div>
            {loading ? (
              <div className="skeleton-pulse" style={{ height: 32, width: 110, borderRadius: 8, margin: "4px 0" }} />
            ) : (
              <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", lineHeight: 1.1 }}>
                {formatCurrency(data?.stats.revenue.total ?? 0)}
              </div>
            )}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#D97706", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D97706" }} />
              {loading ? "Loading..." : `${data?.stats.participants.confirmedRegistrations ?? 0} Paid Registrations`}
            </div>
          </div>
        </Link>

        {/* Card 4: Active Banners */}
        <Link
          href="/admin/banners"
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "22px 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: 18,
            textDecoration: "none",
          }}
          className="admin-card-hover"
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.15)",
            }}
            className="icon-box-hover"
          >
            <ImageIcon size={28} color="#0284C7" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#64748B", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Active Banners
            </div>
            {loading ? (
              <div className="skeleton-pulse" style={{ height: 32, width: 60, borderRadius: 8, margin: "4px 0" }} />
            ) : (
              <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", lineHeight: 1.1 }}>
                {data?.stats.banners.active ?? 0}
              </div>
            )}
            <div style={{ fontSize: 12, fontWeight: 800, color: "#0284C7", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0284C7" }} />
              {loading ? "Loading..." : `Of ${data?.stats.banners.total ?? 0} Total Banners`}
            </div>
          </div>
        </Link>
      </div>

      {/* ── HERO BANNER SLIDER (REAL DATABASE BANNERS) ── */}
      {loading ? (
        <div className="skeleton-pulse" style={{ width: "100%", height: 220, borderRadius: 24 }} />
      ) : data?.heroBanners && data.heroBanners.length > 0 ? (
        <div
          style={{
            position: "relative",
            borderRadius: 24,
            overflow: "hidden",
            minHeight: 220,
            background: "#090314",
            boxShadow: "0 16px 40px rgba(9, 3, 20, 0.3)",
          }}
          className="hero-banner-hover"
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${data.heroBanners[activeBannerIndex]?.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.35)",
              transition: "all 0.5s ease",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(9,3,20,0.94) 0%, rgba(9,3,20,0.45) 60%, rgba(9,3,20,0.85) 100%)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 10,
              padding: "40px 48px",
              color: "#ffffff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              maxWidth: 680,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 20,
                background: "rgba(244, 114, 182, 0.18)",
                border: "1px solid rgba(244, 114, 182, 0.35)",
                color: "#F472B6",
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: 1,
                marginBottom: 12,
                width: "fit-content",
              }}
            >
              <Sparkles size={13} /> ACTIVE HERO BANNER #{activeBannerIndex + 1}
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, margin: "0 0 8px", color: "#ffffff", textTransform: "uppercase", lineHeight: 1.2 }}>
              {data.heroBanners[activeBannerIndex]?.title}
            </h2>
            {data.heroBanners[activeBannerIndex]?.subtitle && (
              <p style={{ fontSize: 14, color: "#CBD5E1", margin: "0 0 20px", lineHeight: 1.5, fontWeight: 500 }}>
                {data.heroBanners[activeBannerIndex]?.subtitle}
              </p>
            )}

            <Link
              href={data.heroBanners[activeBannerIndex]?.link_url || "/admin/banners"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 22px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                color: "#ffffff",
                fontSize: 13.5,
                fontWeight: 800,
                textDecoration: "none",
                width: "fit-content",
                boxShadow: "0 6px 20px rgba(124, 58, 237, 0.5)",
              }}
              className="hero-btn-hover"
            >
              {data.heroBanners[activeBannerIndex]?.button_text || "Manage Banners →"}
            </Link>
          </div>

          {/* Carousel Navigation Dots */}
          {data.heroBanners.length > 1 && (
            <div style={{ position: "absolute", right: 32, bottom: 24, zIndex: 20, display: "flex", gap: 8 }}>
              {data.heroBanners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveBannerIndex(idx)}
                  style={{
                    width: idx === activeBannerIndex ? 28 : 10,
                    height: 10,
                    borderRadius: 5,
                    background: idx === activeBannerIndex ? "#ffffff" : "rgba(255,255,255,0.4)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Empty State for Banners */
        <div
          style={{
            borderRadius: 24,
            padding: "36px",
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.2)",
          }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(124, 58, 237, 0.3)", borderRadius: 8, fontSize: 11.5, fontWeight: 800, color: "#C4B5FD", marginBottom: 8 }}>
              <ImageIcon size={14} /> HERO SLIDER PROMOTION
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#ffffff" }}>
              No Active Promotional Banners
            </h3>
            <p style={{ fontSize: 13.5, color: "#94A3B8", margin: 0, maxWidth: 540 }}>
              Promote upcoming championships and talent events on your website homepage by uploading dynamic banner slides.
            </p>
          </div>

          <Link
            href="/admin/banners"
            style={{
              padding: "11px 22px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              color: "#ffffff",
              fontSize: 13.5,
              fontWeight: 800,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
            }}
          >
            <Plus size={16} /> Create First Banner
          </Link>
        </div>
      )}

      {/* ── MIDDLE ROW (3 COLUMNS) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.1fr", gap: 20 }} className="dashboard-mid-grid">
        {/* Col 1: Registration Trend Line Chart */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          className="admin-card-hover"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                Registration Trend
              </h3>
              <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                Actual daily registration counts
              </div>
            </div>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as "7d" | "30d")}
              style={{
                padding: "6px 12px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                color: "#475569",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {loading ? (
            <div className="skeleton-pulse" style={{ width: "100%", height: 200, borderRadius: 16 }} />
          ) : (
            <RenderDynamicLineChart trendData={data?.charts?.registrationTrend || []} />
          )}
        </div>

        {/* Col 2: Events by Status Donut Chart */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          className="admin-card-hover"
        >
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Events by Status
            </h3>
            <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
              Database status breakdown
            </div>
          </div>

          {loading ? (
            <div className="skeleton-pulse" style={{ width: "100%", height: 180, borderRadius: 16 }} />
          ) : (
            <RenderDynamicDonutChart statusData={data?.charts?.eventsByStatus || []} totalEvents={data?.stats?.events?.total || 0} />
          )}
        </div>

        {/* Col 3: Upcoming Events */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
          }}
          className="admin-card-hover"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Upcoming Events
            </h3>
            <Link href="/admin/events" style={{ fontSize: 12.5, fontWeight: 800, color: "#6D28D9", textDecoration: "none" }}>
              View All
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton-pulse" style={{ height: 50, borderRadius: 12 }} />
              ))}
            </div>
          ) : data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.upcomingEvents.map((evt) => (
                <Link
                  key={evt.id}
                  href={`/admin/events`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 14,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  className="list-item-hover"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img
                      src={evt.image}
                      alt={evt.title}
                      style={{ width: 42, height: 42, borderRadius: 12, objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>
                        {evt.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                        📅 {formatDateLabel(evt.event_date)} • 📍 {evt.location}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#1D4ED8",
                      background: "#EFF6FF",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {evt.status.replace("_", " ").toUpperCase()}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#94A3B8" }}>
              <Calendar size={32} color="#CBD5E1" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#64748B" }}>No Upcoming Events</div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                Events scheduled for future dates will appear here.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW (2 COLUMNS) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }} className="dashboard-bot-grid">
        {/* Recent Activity */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          }}
          className="admin-card-hover"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Recent Audit Activity
            </h3>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: "#6D28D9" }}>
              Real-time Database Log
            </span>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="skeleton-pulse" style={{ height: 44, borderRadius: 12 }} />
              ))}
            </div>
          ) : data?.recentActivities && data.recentActivities.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.recentActivities.map((act) => {
                let icon = Calendar;
                let iconBg = "#F3E8FF";
                let iconColor = "#6D28D9";

                if (act.type === "registration") {
                  icon = Users;
                  iconBg = "#DCFCE7";
                  iconColor = "#16A34A";
                } else if (act.type === "banner") {
                  icon = ImageIcon;
                  iconBg = "#FEF3C7";
                  iconColor = "#D97706";
                }

                const IconComponent = icon;

                return (
                  <div
                    key={act.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                      padding: "8px 12px",
                      borderRadius: 14,
                      transition: "all 0.2s",
                    }}
                    className="list-item-hover"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          background: iconBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconComponent size={18} color={iconColor} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
                        {act.title}
                      </span>
                    </div>

                    <span style={{ fontSize: 11.5, color: "#94A3B8", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {act.time}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#94A3B8" }}>
              <Clock size={32} color="#CBD5E1" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#64748B" }}>No Recent Activity</div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                Activities will populate as admins manage events and users register.
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          }}
          className="admin-card-hover"
        >
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 18px" }}>
            Quick Admin Actions
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Link
              href="/admin/events"
              style={{
                padding: "18px",
                borderRadius: 18,
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
                }}
                className="action-icon-box"
              >
                <Plus size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Add Event</div>
                <div style={{ fontSize: 11.5, color: "#64748B" }}>Create event</div>
              </div>
            </Link>

            <Link
              href="/admin/participants"
              style={{
                padding: "18px",
                borderRadius: 18,
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #16A34A, #15803D)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
                }}
                className="action-icon-box"
              >
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Participants</div>
                <div style={{ fontSize: 11.5, color: "#64748B" }}>Manage records</div>
              </div>
            </Link>

            <Link
              href="/admin/banners"
              style={{
                padding: "18px",
                borderRadius: 18,
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #0284C7, #0369A1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
                }}
                className="action-icon-box"
              >
                <ImageIcon size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Banners</div>
                <div style={{ fontSize: 11.5, color: "#64748B" }}>Edit sliders</div>
              </div>
            </Link>

            <Link
              href="/admin/reports"
              style={{
                padding: "18px",
                borderRadius: 18,
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #D97706, #B45309)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(217, 119, 6, 0.25)",
                }}
                className="action-icon-box"
              >
                <BarChart3 size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Reports</div>
                <div style={{ fontSize: 11.5, color: "#64748B" }}>Analytics exports</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .skeleton-pulse {
          background: #E2E8F0;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .admin-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(109, 40, 217, 0.12) !important;
          border-color: #C4B5FD !important;
        }
        .admin-card-hover:hover .icon-box-hover {
          transform: scale(1.08) rotate(4deg);
        }
        .hero-banner-hover:hover {
          transform: scale(1.005);
          box-shadow: 0 20px 50px rgba(9, 3, 20, 0.4) !important;
        }
        .hero-btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(124, 58, 237, 0.6) !important;
        }
        .top-btn-hover:hover {
          border-color: #7C3AED !important;
          color: #7C3AED !important;
          transform: translateY(-2px);
        }
        .purple-btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(124, 58, 237, 0.5) !important;
        }
        .quick-action-card:hover {
          border-color: #7C3AED !important;
          background: #FAF5FF !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.12) !important;
        }
        .quick-action-card:hover .action-icon-box {
          transform: scale(1.1) rotate(6deg);
        }
        .list-item-hover:hover {
          background: #FAF5FF !important;
          transform: translateX(3px);
        }
        @media (max-width: 1100px) {
          .dashboard-mid-grid { grid-template-columns: 1fr !important; }
          .dashboard-bot-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// Helper Component: Dynamic SVG Line Chart for Registration Trend
function RenderDynamicLineChart({ trendData }: { trendData: Array<{ date: string; fullDate: string; count: number }> }) {
  if (!trendData || trendData.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 13 }}>
        No registration data recorded for this timeframe.
      </div>
    );
  }

  const maxCount = Math.max(...trendData.map((d) => d.count), 5);
  const width = 400;
  const height = 160;
  const paddingY = 20;

  const points = trendData.map((item, index) => {
    const x = (index / Math.max(trendData.length - 1, 1)) * (width - 40) + 20;
    const y = height - paddingY - (item.count / maxCount) * (height - 2 * paddingY);
    return { x, y, count: item.count, label: item.date };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, point, i) => `${acc} ${i === 0 ? "M" : "L"} ${point.x} ${point.y}`, "")
    : `M 20 ${height / 2} L 380 ${height / 2}`;

  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    : "";

  return (
    <div style={{ width: "100%", height: 210, position: "relative" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id="purpleGradDynamic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        <line x1="0" y1="30" x2={width} y2="30" stroke="#F1F5F9" strokeWidth="1" />
        <line x1="0" y1="75" x2={width} y2="75" stroke="#F1F5F9" strokeWidth="1" />
        <line x1="0" y1="120" x2={width} y2="120" stroke="#F1F5F9" strokeWidth="1" />
        <line x1="0" y1={height} x2={width} y2={height} stroke="#E2E8F0" strokeWidth="1" />

        {/* Gradient fill */}
        {areaD && <path d={areaD} fill="url(#purpleGradDynamic)" />}

        {/* Path line */}
        {pathD && <path d={pathD} fill="none" stroke="#7C3AED" strokeWidth="3.5" strokeLinecap="round" />}

        {/* Interactive Data dots */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="5"
              fill="#7C3AED"
              stroke="#ffffff"
              strokeWidth="2"
              style={{ transition: "all 0.2s", cursor: "pointer" }}
            />
            {/* Show value badge over dot if count > 0 */}
            {pt.count > 0 && (
              <text
                x={pt.x}
                y={pt.y - 9}
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fill="#6D28D9"
              >
                {pt.count}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* X Axis Date Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>
        {trendData.slice(0, 7).map((item, idx) => (
          <span key={idx}>{item.date}</span>
        ))}
      </div>
    </div>
  );
}

// Helper Component: Dynamic SVG Donut Chart for Events Status
function RenderDynamicDonutChart({
  statusData,
  totalEvents,
}: {
  statusData: Array<{ name: string; count: number; color: string }>;
  totalEvents: number;
}) {
  const sumCounts = statusData.reduce((acc, curr) => acc + curr.count, 0);

  if (sumCounts === 0 || totalEvents === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8" }}>
        <FolderTree size={32} color="#CBD5E1" style={{ marginBottom: 8 }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>No Events Recorded</div>
        <div style={{ fontSize: 11.5, color: "#94A3B8" }}>Status distribution will calculate automatically.</div>
      </div>
    );
  }

  const radius = 15.915;
  const circumference = 2 * Math.PI * radius; // 100
  let cumulativeOffset = 0;

  const slices = statusData.map((item) => {
    const percentage = sumCounts > 0 ? (item.count / sumCounts) * 100 : 0;
    const strokeDasharray = `${percentage} ${100 - percentage}`;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += percentage;

    return {
      ...item,
      percentage: Math.round(percentage),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
      {/* SVG Donut */}
      <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
        <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
          {slices.map((slice, i) => (
            <circle
              key={i}
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="4.8"
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
            />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", lineHeight: 1 }}>
            {totalEvents}
          </span>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
            Total
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {slices.map((slice, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#334155" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: slice.color, flexShrink: 0 }} />
            <span>
              {slice.name}: <strong>{slice.count} ({slice.percentage}%)</strong>
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 1100px) {
          .dashboard-mid-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
