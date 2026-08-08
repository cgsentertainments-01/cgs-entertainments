"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  IndianRupee,
  Image as ImageIcon,
  ArrowRight,
  Plus,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Award,
  BarChart3,
  Clock,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const heroBanners = [
    {
      title: "DANCE TO EXPRESS, COMPETE TO IMPRESS!",
      subtitle: "India's Biggest Dance Competitions Managed with Passion by CGS Entertainments.",
      btnText: "Explore Events →",
      btnHref: "/admin/events",
      bgImage: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1400&q=80",
    },
    {
      title: "SOUTH INDIA MODELING & FASHION SHOW 2026",
      subtitle: "Register participants, review judges scores & issue verified certificates.",
      btnText: "Manage Registrations →",
      btnHref: "/admin/participants",
      bgImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80",
    },
  ];

  const upcomingEventsList = [
    {
      id: "1",
      title: "National Dance Championship 2026",
      dates: "20 - 22 May 2026",
      location: "Hyderabad, Telangana",
      status: "On Going",
      statusColor: "#15803D",
      statusBg: "#DCFCE7",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "2",
      title: "Elite Modeling Show",
      dates: "10 - 11 June 2026",
      location: "Bangalore, Karnataka",
      status: "Upcoming",
      statusColor: "#1D4ED8",
      statusBg: "#EFF6FF",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "3",
      title: "Acting Excellence Awards",
      dates: "18 - 19 June 2026",
      location: "Chennai, Tamil Nadu",
      status: "Upcoming",
      statusColor: "#1D4ED8",
      statusBg: "#EFF6FF",
      image: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "4",
      title: "Voice of India 2026",
      dates: "30 June - 01 July 2026",
      location: "Mumbai, Maharashtra",
      status: "Upcoming",
      statusColor: "#1D4ED8",
      statusBg: "#EFF6FF",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=80",
    },
  ];

  const recentActivities = [
    {
      id: "1",
      title: 'New event "Contemporary Dance Fest" created',
      time: "2 mins ago",
      icon: Calendar,
      iconBg: "#F3E8FF",
      iconColor: "#6D28D9",
    },
    {
      id: "2",
      title: 'Participants added in "Hip-Hop Battle 2026"',
      time: "15 mins ago",
      icon: Users,
      iconBg: "#DCFCE7",
      iconColor: "#16A34A",
    },
    {
      id: "3",
      title: 'Banner "Dance Championship 2026" updated',
      time: "1 hour ago",
      icon: ImageIcon,
      iconBg: "#FEF3C7",
      iconColor: "#D97706",
    },
    {
      id: "4",
      title: "Certificate issued to Dance Crew X",
      time: "2 hours ago",
      icon: Award,
      iconBg: "#E0F2FE",
      iconColor: "#0284C7",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* ── HEADER ROW ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#F3E8FF", borderRadius: 8, fontSize: 11.5, fontWeight: 800, color: "#6D28D9", marginBottom: 6 }}>
            <Zap size={13} fill="#6D28D9" /> LIVE CONTROL ROOM
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.5 }}>
            Welcome back, Admin CGS! 👋
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Here&apos;s what&apos;s happening with your events today.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => window.open("/", "_blank")}
            style={{
              padding: "11px 20px",
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
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            className="top-btn-hover"
          >
            <ExternalLink size={16} color="#64748B" />
            View Website
          </button>

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
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            className="purple-btn-hover"
          >
            <Plus size={18} />
            Add New Event
          </Link>
        </div>
      </div>

      {/* ── 4 STAT CARDS GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        {/* Card 1: Total Events */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "22px 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: 18,
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            cursor: "pointer",
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
              transition: "transform 0.3s ease",
            }}
            className="icon-box-hover"
          >
            <Calendar size={28} color="#6D28D9" />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#64748B", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Total Events
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", lineHeight: 1.1 }}>24</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#6D28D9", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6D28D9" }} />
              8 Upcoming
            </div>
          </div>
        </div>

        {/* Card 2: Total Participants */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "22px 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: 18,
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            cursor: "pointer",
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
              transition: "transform 0.3s ease",
            }}
            className="icon-box-hover"
          >
            <Users size={28} color="#16A34A" />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#64748B", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Total Participants
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", lineHeight: 1.1 }}>987</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <TrendingUp size={13} color="#16A34A" />
              +96 this week
            </div>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "22px 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: 18,
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            cursor: "pointer",
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
              transition: "transform 0.3s ease",
            }}
            className="icon-box-hover"
          >
            <IndianRupee size={28} color="#D97706" />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#64748B", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Total Revenue
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", lineHeight: 1.1 }}>₹3,45,680</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <TrendingUp size={13} color="#16A34A" />
              +18.6% this week
            </div>
          </div>
        </div>

        {/* Card 4: Active Banners */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "22px 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: 18,
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            cursor: "pointer",
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
              transition: "transform 0.3s ease",
            }}
            className="icon-box-hover"
          >
            <ImageIcon size={28} color="#0284C7" />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#64748B", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Active Banners
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", lineHeight: 1.1 }}>6</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#D97706", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D97706" }} />
              2 Expiring Soon
            </div>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER SLIDER ── */}
      <div
        style={{
          position: "relative",
          borderRadius: 24,
          overflow: "hidden",
          minHeight: 220,
          background: "#090314",
          boxShadow: "0 16px 40px rgba(9, 3, 20, 0.3)",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        className="hero-banner-hover"
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${heroBanners[activeBannerIndex].bgImage})`,
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
            padding: "44px 52px",
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
            <Sparkles size={13} /> CGS FEATURED CHAMPIONSHIP
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, margin: "0 0 10px", color: "#ffffff", textTransform: "uppercase", lineHeight: 1.2 }}>
            {heroBanners[activeBannerIndex].title}
          </h2>
          <p style={{ fontSize: 14.5, color: "#CBD5E1", margin: "0 0 24px", lineHeight: 1.6, fontWeight: 500 }}>
            {heroBanners[activeBannerIndex].subtitle}
          </p>

          <Link
            href={heroBanners[activeBannerIndex].btnHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 24px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 800,
              textDecoration: "none",
              width: "fit-content",
              boxShadow: "0 6px 20px rgba(124, 58, 237, 0.5)",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            className="hero-btn-hover"
          >
            {heroBanners[activeBannerIndex].btnText}
          </Link>
        </div>

        {/* Carousel Dots */}
        <div style={{ position: "absolute", right: 32, bottom: 24, zIndex: 20, display: "flex", gap: 8 }}>
          {heroBanners.map((_, idx) => (
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
      </div>

      {/* ── MIDDLE ROW (3 COLUMNS) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.1fr", gap: 20 }} className="dashboard-mid-grid">
        {/* Col 1: Events Overview Line Chart */}
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
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className="admin-card-hover"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Events Overview
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                color: "#475569",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              className="select-box-hover"
            >
              <span>Last 7 Days</span>
              <ChevronDown size={14} color="#94A3B8" />
            </div>
          </div>

          {/* Custom SVG Line Chart */}
          <div style={{ width: "100%", height: 200, position: "relative" }}>
            <svg viewBox="0 0 400 180" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="400" y2="40" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="160" x2="400" y2="160" stroke="#E2E8F0" strokeWidth="1" />

              {/* Gradient Fill */}
              <path
                d="M 20 135 C 70 80, 110 50, 150 25 C 200 70, 240 85, 290 110 C 340 90, 370 70, 385 60 L 385 160 L 20 160 Z"
                fill="url(#purpleGrad)"
              />

              {/* Line */}
              <path
                d="M 20 135 C 70 80, 110 50, 150 25 C 200 70, 240 85, 290 110 C 340 90, 370 70, 385 60"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Data Points */}
              {[[20, 135], [80, 85], [150, 25], [210, 75], [270, 95], [330, 110], [385, 60]].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="5.5"
                  fill="#7C3AED"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  style={{ transition: "transform 0.2s, r 0.2s", cursor: "pointer" }}
                  className="chart-dot-hover"
                />
              ))}
            </svg>
          </div>

          {/* X Axis Labels */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11.5, fontWeight: 700, color: "#94A3B8" }}>
            <span>15 May</span>
            <span>16 May</span>
            <span>17 May</span>
            <span>18 May</span>
            <span>19 May</span>
            <span>20 May</span>
            <span>21 May</span>
          </div>
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
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className="admin-card-hover"
        >
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 16px" }}>
            Events by Status
          </h3>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
            {/* Custom Donut Chart */}
            <div style={{ position: "relative", width: 145, height: 145, flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                {/* Upcoming (Blue - 33%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="4.8" strokeDasharray="33 67" strokeDashoffset="0" />
                {/* Ongoing (Pink - 25%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EC4899" strokeWidth="4.8" strokeDasharray="25 75" strokeDashoffset="-33" />
                {/* Completed (Cyan - 29%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06B6D4" strokeWidth="4.8" strokeDasharray="29 71" strokeDashoffset="-58" />
                {/* Cancelled (Yellow - 13%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="4.8" strokeDasharray="13 87" strokeDashoffset="-87" />
              </svg>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700, color: "#334155" }} className="legend-hover">
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3B82F6" }} />
                <span>Upcoming: <strong>8 (33%)</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700, color: "#334155" }} className="legend-hover">
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#EC4899" }} />
                <span>Ongoing: <strong>6 (25%)</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700, color: "#334155" }} className="legend-hover">
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#06B6D4" }} />
                <span>Completed: <strong>7 (29%)</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700, color: "#334155" }} className="legend-hover">
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
                <span>Cancelled: <strong>3 (13%)</strong></span>
              </div>
            </div>
          </div>
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
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
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

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcomingEventsList.map((evt) => (
              <div
                key={evt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 14,
                  transition: "all 0.2s",
                }}
                className="list-item-hover"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={evt.image}
                    alt={evt.title}
                    style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>
                      {evt.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                      📅 {evt.dates} • 📍 {evt.location.split(",")[0]}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 800,
                    color: evt.statusColor,
                    background: evt.statusBg,
                    whiteSpace: "nowrap",
                  }}
                >
                  {evt.status}
                </span>
              </div>
            ))}
          </div>
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
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className="admin-card-hover"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Recent Activity
            </h3>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: "#6D28D9", cursor: "pointer" }}>
              View All
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {recentActivities.map((act) => {
              const Icon = act.icon;
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
                        background: act.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color={act.iconColor} />
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
        </div>

        {/* Quick Actions */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid #E2E8F0",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className="admin-card-hover"
        >
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 18px" }}>
            Quick Actions
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
                transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
                  transition: "transform 0.25s ease",
                }}
                className="action-icon-box"
              >
                <Plus size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Add New Event</div>
                <div style={{ fontSize: 11.5, color: "#64748B" }}>Create a new event</div>
              </div>
            </Link>

            <Link
              href="/admin/banner"
              style={{
                padding: "18px",
                borderRadius: 18,
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 14,
                transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
                  transition: "transform 0.25s ease",
                }}
                className="action-icon-box"
              >
                <ImageIcon size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Manage Banners</div>
                <div style={{ fontSize: 11.5, color: "#64748B" }}>Add or edit banners</div>
              </div>
            </Link>

            <Link
              href="/admin/certificates"
              style={{
                padding: "18px",
                borderRadius: 18,
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 14,
                transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
                  transition: "transform 0.25s ease",
                }}
                className="action-icon-box"
              >
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Certificates</div>
                <div style={{ fontSize: 11.5, color: "#64748B" }}>Create certificates</div>
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
                transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
                  transition: "transform 0.25s ease",
                }}
                className="action-icon-box"
              >
                <BarChart3 size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>View Reports</div>
                <div style={{ fontSize: 11.5, color: "#64748B" }}>Analytics reports</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
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
        .legend-hover:hover {
          transform: translateX(3px);
          cursor: pointer;
        }
        .chart-dot-hover:hover {
          r: 8 !important;
          fill: #6D28D9 !important;
        }
        @media (max-width: 1100px) {
          .dashboard-mid-grid { grid-template-columns: 1fr !important; }
          .dashboard-bot-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
