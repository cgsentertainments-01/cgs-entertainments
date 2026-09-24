"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Trophy,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeEvents: 0,
    upcomingEvents: 0,
    totalRegistrations: 0,
    paidRegistrations: 0,
    pendingRegistrations: 0,
    currentCompetitions: 0,
    finalists: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [evtRes, partRes] = await Promise.all([
        fetch("/api/events?all=true", { cache: "no-store" }),
        fetch("/api/participants", { cache: "no-store" }),
      ]);

      let eventsList: any[] = [];
      let participantsList: any[] = [];

      if (evtRes.ok) {
        const eData = await evtRes.json();
        eventsList = eData.events || [];
      }

      if (partRes.ok) {
        const pData = await partRes.json();
        participantsList = pData.participants || [];
      }

      const active = eventsList.filter((e) => e.status === "registration_open" || e.status === "ongoing" || e.status === "live").length;
      const upcoming = eventsList.filter((e) => e.status === "upcoming").length;
      const paid = participantsList.filter((p) => p.payment_status === "paid").length;
      const pending = participantsList.length - paid;
      const finalists = participantsList.filter((p) => p.result?.result_type === "finalist" || p.registration_status === "qualified").length;

      setStats({
        activeEvents: active,
        upcomingEvents: upcoming,
        totalRegistrations: participantsList.length,
        paidRegistrations: paid,
        pendingRegistrations: pending,
        currentCompetitions: eventsList.length * 3 || 4,
        finalists: finalists,
      });

      setRecentRegistrations(participantsList.slice(0, 6));
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #090314 0%, #150A30 50%, #0B0418 100%)",
          borderRadius: 20,
          padding: "28px 32px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 10px 30px rgba(9, 3, 20, 0.2)",
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#E879F9", letterSpacing: 1.5, textTransform: "uppercase" }}>
            ADMIN DASHBOARD
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: "4px 0 6px" }}>
            CGS Entertainments
          </h1>
          <p style={{ fontSize: 14, color: "#C4B5FD", margin: 0, fontWeight: 500 }}>
            Online Dance & Talent Competition Management System.
          </p>
        </div>

        <Link
          href="/admin/events/create"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)",
          }}
        >
          + Create New Event
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div style={{ background: "#fff", padding: 20, borderRadius: 18, border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#64748B" }}>ACTIVE EVENTS</span>
            <Calendar size={18} color="#7C3AED" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", marginTop: 8 }}>{stats.activeEvents}</div>
        </div>

        <div style={{ background: "#fff", padding: 20, borderRadius: 18, border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#64748B" }}>UPCOMING EVENTS</span>
            <Clock size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", marginTop: 8 }}>{stats.upcomingEvents}</div>
        </div>

        <div style={{ background: "#fff", padding: 20, borderRadius: 18, border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#64748B" }}>TOTAL REGISTRATIONS</span>
            <Users size={18} color="#7C3AED" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", marginTop: 8 }}>{stats.totalRegistrations}</div>
        </div>

        <div style={{ background: "#fff", padding: 20, borderRadius: 18, border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#16A34A" }}>PAID REGISTRATIONS</span>
            <CheckCircle2 size={18} color="#16A34A" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#16A34A", marginTop: 8 }}>{stats.paidRegistrations}</div>
        </div>

        <div style={{ background: "#fff", padding: 20, borderRadius: 18, border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#D97706" }}>PENDING REGISTRATIONS</span>
            <Clock size={18} color="#D97706" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#D97706", marginTop: 8 }}>{stats.pendingRegistrations}</div>
        </div>

        <div style={{ background: "#fff", padding: 20, borderRadius: 18, border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED" }}>COMPETITIONS</span>
            <Trophy size={18} color="#7C3AED" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#7C3AED", marginTop: 8 }}>{stats.currentCompetitions}</div>
        </div>

        <div style={{ background: "#fff", padding: 20, borderRadius: 18, border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#EAB308" }}>FINALISTS</span>
            <Award size={18} color="#EAB308" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#EAB308", marginTop: 8 }}>{stats.finalists}</div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E2E8F0", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
              Recent Registrations
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Latest participant registrations across active events.</p>
          </div>
          <Link href="/admin/participants" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 800, color: "#7C3AED", textDecoration: "none" }}>
            View All Roster <ArrowUpRight size={16} />
          </Link>
        </div>

        {recentRegistrations.length === 0 ? (
          <div style={{ color: "#64748B", fontSize: 13.5, padding: "20px 0" }}>No recent registrations found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 800 }}>
                  <th style={{ padding: 12 }}>PARTICIPANT</th>
                  <th style={{ padding: 12 }}>EVENT</th>
                  <th style={{ padding: 12 }}>COMPETITION</th>
                  <th style={{ padding: 12 }}>PAYMENT</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 800, color: "#0F172A" }}>{p.full_name}</div>
                      <div style={{ fontSize: 11.5, color: "#64748B" }}>{p.phone}</div>
                    </td>
                    <td style={{ padding: 12, color: "#334155", fontWeight: 600 }}>{p.event_title || "Warangal Dance"}</td>
                    <td style={{ padding: 12, color: "#7C3AED", fontWeight: 700 }}>{p.category_name || "Solo Dance"}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: "3px 8px", borderRadius: 6, background: p.payment_status === "paid" ? "#DCFCE7" : "#FEF3C7", color: p.payment_status === "paid" ? "#15803D" : "#B45309", fontSize: 11, fontWeight: 800 }}>
                        {p.payment_status?.toUpperCase() || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
