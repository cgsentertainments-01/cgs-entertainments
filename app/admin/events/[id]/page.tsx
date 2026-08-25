"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Settings,
  Layers,
  FileText,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Eye,
  Award,
  Filter,
  Plus,
} from "lucide-react";
import { CompetitionRoundsManager } from "@/components/admin/CompetitionRoundsManager";
import { EventForm } from "@/components/events/EventForm";

interface EventData {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  venue: string;
  city: string;
  location: string;
  status: string;
  is_published: boolean;
  banner_url?: string;
  banner_image?: string;
  img?: string;
  form_config?: any;
}

export default function AdminManageEventPage() {
  const routeParams = useParams();
  const eventId = (routeParams?.id as string) || "";
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "overview" | "registration" | "competitions" | "rounds" | "participants" | "results" | "settings"
  >("overview");

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [stats, setStats] = useState({
    totalRegs: 0,
    paidRegs: 0,
    pendingRegs: 0,
    qualified: 0,
    finalists: 0,
    winners: 0,
    currentRound: "Round 1 / Auditions",
  });
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);

  const fetchEventWorkspace = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [evtRes, partsRes] = await Promise.all([
        fetch(`/api/events/${encodeURIComponent(eventId)}`),
        fetch(`/api/participants?eventId=${encodeURIComponent(eventId)}`),
      ]);

      if (evtRes.ok) {
        const eData = await evtRes.json();
        const evt = eData.event || eData;
        setEventData({
          id: evt.id || eventId,
          slug: evt.slug || eventId,
          title: evt.title || "Event Details",
          category: evt.category || "Dance",
          date: evt.date || evt.event_date || "TBA 2026",
          venue: evt.venue || "Venue TBA",
          city: evt.city || "Hyderabad",
          location: evt.location || (evt.venue && evt.city ? `${evt.venue}, ${evt.city}` : "Hyderabad"),
          status: evt.status || "registration_open",
          is_published: evt.is_published !== undefined ? Boolean(evt.is_published) : true,
          banner_url: evt.banner_url || evt.banner_image || evt.img || "",
          form_config: evt.form_config || {},
        });
      }

      if (partsRes.ok) {
        const pData = await partsRes.json();
        const pList = pData.participants || [];
        setParticipants(pList);

        const paid = pList.filter((p: any) => p.payment_status === "paid").length;
        const pending = pList.length - paid;
        const qualified = pList.filter((p: any) => p.registration_status === "qualified" || p.result?.result_type === "qualified").length;
        const finalists = pList.filter((p: any) => p.result?.result_type === "finalist").length;
        const winners = pList.filter((p: any) => p.result?.result_type === "winner").length;

        setStats({
          totalRegs: pList.length,
          paidRegs: paid,
          pendingRegs: pending,
          qualified: qualified,
          finalists: finalists,
          winners: winners,
          currentRound: "Round 1 / Auditions",
        });
      }
    } catch (err) {
      console.error("Error fetching event workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventWorkspace();
  }, [eventId]);

  const getStatusBadge = (status: string, isPublished: boolean) => {
    if (!isPublished) return { label: "DRAFT", bg: "#F1F5F9", color: "#64748B" };
    switch (status?.toLowerCase()) {
      case "registration_open":
      case "open":
        return { label: "REGISTRATION OPEN", bg: "#EFF6FF", color: "#2563EB" };
      case "ongoing":
      case "live":
        return { label: "LIVE", bg: "#DCFCE7", color: "#16A34A" };
      case "upcoming":
        return { label: "UPCOMING", bg: "#F3E8FF", color: "#7C3AED" };
      default:
        return { label: (status || "DRAFT").toUpperCase(), bg: "#F8FAFC", color: "#475569" };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B", fontWeight: 600 }}>
        Loading event workspace...
      </div>
    );
  }

  const badge = getStatusBadge(eventData?.status || "", eventData?.is_published ?? true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Back Link */}
      <Link
        href="/admin/events"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#64748B", textDecoration: "none" }}
      >
        <ArrowLeft size={16} /> Back to Events
      </Link>

      {/* Header Workspace Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #E2E8F0",
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {eventData?.banner_url ? (
            <img
              src={eventData.banner_url}
              alt={eventData.title}
              style={{ width: 64, height: 64, borderRadius: 14, objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 14, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trophy size={28} color="#7C3AED" />
            </div>
          )}

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                {eventData?.title}
              </h1>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 900 }}>
                {badge.label}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "#64748B", fontWeight: 600 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={14} color="#7C3AED" /> {eventData?.date}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={14} color="#64748B" /> {eventData?.location}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          style={{ padding: "10px 18px", borderRadius: 12, background: "#F1F5F9", color: "#334155", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <Settings size={16} /> Edit Event
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ background: "#fff", padding: "6px 12px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", gap: 6, overflowX: "auto" }}>
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "registration", label: "Registration", icon: FileText },
          { id: "competitions", label: "Competitions", icon: Trophy },
          { id: "rounds", label: "Rounds", icon: Clock },
          { id: "participants", label: "Participants", icon: Users },
          { id: "results", label: "Results", icon: Award },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: isActive ? 800 : 600,
                color: isActive ? "#ffffff" : "#475569",
                background: isActive ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" : "transparent",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.18s ease",
              }}
            >
              <Icon size={16} color={isActive ? "#ffffff" : "#64748B"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Summary KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 13, color: "#64748B", fontWeight: 700 }}>Registrations</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", marginTop: 4 }}>{stats.totalRegs}</div>
            </div>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 13, color: "#16A34A", fontWeight: 700 }}>Paid</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#16A34A", marginTop: 4 }}>{stats.paidRegs}</div>
            </div>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 13, color: "#D97706", fontWeight: 700 }}>Pending</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#D97706", marginTop: 4 }}>{stats.pendingRegs}</div>
            </div>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 13, color: "#2563EB", fontWeight: 700 }}>Qualified</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#2563EB", marginTop: 4 }}>{stats.qualified}</div>
            </div>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 13, color: "#7C3AED", fontWeight: 700 }}>Finalists</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#7C3AED", marginTop: 4 }}>{stats.finalists}</div>
            </div>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 13, color: "#EAB308", fontWeight: 700 }}>Winners</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#EAB308", marginTop: 4 }}>{stats.winners}</div>
            </div>
          </div>

          {/* Recent Activity Roster */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 16px" }}>Recent Registrations</h3>
            {participants.length === 0 ? (
              <div style={{ color: "#64748B", fontSize: 13.5 }}>No registrations recorded yet for this event.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {participants.slice(0, 5).map((p: any) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{p.full_name}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>{p.email} • {p.phone}</div>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: 6, background: p.payment_status === "paid" ? "#DCFCE7" : "#FEF3C7", color: p.payment_status === "paid" ? "#15803D" : "#B45309", fontSize: 11, fontWeight: 800 }}>
                      {p.payment_status?.toUpperCase() || "PENDING"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. REGISTRATION */}
      {activeTab === "registration" && (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 8px" }}>Registration Rules & Form Configuration</h3>
          <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 0 16px" }}>View form schema and dynamic submission settings configured for this event.</p>
          <pre style={{ background: "#F8FAFC", padding: 16, borderRadius: 12, fontSize: 12, color: "#334155", overflowX: "auto" }}>
            {JSON.stringify(eventData?.form_config || {}, null, 2)}
          </pre>
        </div>
      )}

      {/* TAB CONTENT: 3. COMPETITIONS */}
      {activeTab === "competitions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 16px" }}>Event Competitions & Categories</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {["Solo Dance", "Duo Dance", "Group Dance", "Best Photo"].map((catName) => {
                const count = participants.filter((p) => p.category_name?.toLowerCase().includes(catName.toLowerCase()) || catName.includes("Solo")).length;
                return (
                  <div key={catName} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>{catName}</div>
                      <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{count} registrations</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("participants")}
                      style={{ marginTop: 16, padding: "8px 14px", borderRadius: 8, background: "#7C3AED", color: "#fff", border: "none", fontSize: 12.5, fontWeight: 800, cursor: "pointer", alignSelf: "flex-start" }}
                    >
                      Manage
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. ROUNDS */}
      {activeTab === "rounds" && (
        <CompetitionRoundsManager eventId={eventId} eventTitle={eventData?.title} />
      )}

      {/* TAB CONTENT: 5. PARTICIPANTS */}
      {activeTab === "participants" && (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>Event Roster ({participants.length})</h3>
            <Link href={`/admin/participants?eventId=${encodeURIComponent(eventId)}`} style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED", textDecoration: "none" }}>
              Open Full Participant Roster →
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 800 }}>
                  <th style={{ padding: 12 }}>Participant</th>
                  <th style={{ padding: 12 }}>Contact</th>
                  <th style={{ padding: 12 }}>Category</th>
                  <th style={{ padding: 12 }}>Payment</th>
                  <th style={{ padding: 12 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: 12, fontWeight: 700, color: "#0F172A" }}>{p.full_name}</td>
                    <td style={{ padding: 12, color: "#64748B" }}>{p.phone}</td>
                    <td style={{ padding: 12, color: "#334155" }}>{p.category_name || "Solo Dance"}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: "3px 8px", borderRadius: 6, background: p.payment_status === "paid" ? "#DCFCE7" : "#FEF3C7", color: p.payment_status === "paid" ? "#15803D" : "#B45309", fontSize: 11, fontWeight: 800 }}>
                        {p.payment_status?.toUpperCase() || "UNPAID"}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: "3px 8px", borderRadius: 6, background: "#EFF6FF", color: "#2563EB", fontSize: 11, fontWeight: 800 }}>
                        {p.registration_status?.toUpperCase() || "CONFIRMED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. RESULTS */}
      {activeTab === "results" && (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 16px" }}>Event Winners & Results Leaderboard</h3>
          <Link href={`/admin/results?eventId=${encodeURIComponent(eventId)}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, background: "#7C3AED", color: "#fff", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>
            <Award size={16} /> Open Event Results Manager
          </Link>
        </div>
      )}

      {/* TAB CONTENT: 7. SETTINGS */}
      {activeTab === "settings" && (
        <EventForm mode="edit" eventId={eventId} />
      )}
    </div>
  );
}
