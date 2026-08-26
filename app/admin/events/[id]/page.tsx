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
  Trash2,
  Bell,
  CreditCard,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { CompetitionRoundsManager } from "@/components/admin/CompetitionRoundsManager";
import { EventForm } from "@/components/events/EventForm";
import { getEventLifecycleStatus } from "@/lib/event-lifecycle";

interface EventData {
  id: string;
  slug: string;
  title: string;
  short_description?: string;
  description?: string;
  category: string;
  date: string;
  event_date?: string;
  registration_start_date?: string;
  registration_deadline?: string;
  venue: string;
  city: string;
  location: string;
  status: string;
  is_published: boolean;
  registrationFee?: number | string;
  registration_fee?: number;
  banner_url?: string;
  banner_image?: string;
  img?: string;
  form_config?: any;
  participation_categories?: any;
  dance_styles?: any;
  required_documents?: any;
  rules_regulations?: string;
  terms_conditions?: string;
  rawItem?: any;
}

export default function AdminManageEventPage() {
  const routeParams = useParams();
  const eventId = (routeParams?.id as string) || "";
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "overview" | "registration" | "participants" | "payments" | "results" | "certificates" | "notifications" | "rounds" | "settings"
  >("overview");

  // Event State - Reset when eventId changes
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalRegs: 0,
    paidRegs: 0,
    pendingRegs: 0,
    totalRevenue: 0,
    qualified: 0,
    finalists: 0,
    winners: 0,
  });

  const fetchEventWorkspace = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      setErrorMessage(null);

      // Reset state for new eventId to prevent stale data leaking from another event
      setEventData(null);
      setParticipants([]);
      setPayments([]);
      setResults([]);
      setCertificates([]);
      setNotifications([]);

      const [evtRes, partsRes, regsRes, resultsRes, certsRes, notifsRes] = await Promise.all([
        fetch(`/api/events/${encodeURIComponent(eventId)}`, { cache: "no-store" }),
        fetch(`/api/participants?eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" }),
        fetch(`/api/registrations?eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" }),
        fetch(`/api/admin/results?eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" }),
        fetch(`/api/certificates?eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" }),
        fetch(`/api/admin/notifications?eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" }),
      ]);

      if (evtRes.ok) {
        const eData = await evtRes.json();
        const evt = eData.event || eData;
        setEventData({
          id: String(evt.id || eventId),
          slug: evt.slug || eventId,
          title: evt.title || "Event Details",
          short_description: evt.short_description || "",
          description: evt.description || "",
          category: evt.category || "Dance",
          date: evt.date || evt.event_date || "TBA 2026",
          event_date: evt.event_date || evt.date,
          registration_start_date: evt.registration_start_date,
          registration_deadline: evt.registration_deadline,
          venue: evt.venue || "Venue TBA",
          city: evt.city || "Hyderabad",
          location: evt.location || (evt.venue && evt.city ? `${evt.venue}, ${evt.city}` : "Hyderabad"),
          status: evt.status || "registration_open",
          is_published: evt.is_published !== undefined ? Boolean(evt.is_published) : true,
          registrationFee: evt.registrationFee || evt.registration_fee || 0,
          banner_url: evt.banner_url || evt.banner_image || evt.img || "",
          form_config: evt.form_config || {},
          participation_categories: evt.participation_categories || ["Solo", "Duo", "Group"],
          dance_styles: evt.dance_styles || [],
          required_documents: evt.required_documents || [],
          rules_regulations: evt.rules_regulations || "",
          terms_conditions: evt.terms_conditions || "",
          rawItem: evt,
        });
      } else {
        setErrorMessage("Event not found or failed to load event details.");
      }

      let pList: any[] = [];
      if (partsRes.ok) {
        const pData = await partsRes.json();
        pList = pData.participants || [];
        setParticipants(pList);
      }

      let rList: any[] = [];
      if (regsRes.ok) {
        const rData = await regsRes.json();
        rList = rData.registrations || [];
        setPayments(rList);
      }

      if (resultsRes.ok) {
        const resData = await resultsRes.json();
        setResults(resData.results || []);
      }

      if (certsRes.ok) {
        const certData = await certsRes.json();
        setCertificates(certData.certificates || []);
      }

      if (notifsRes.ok) {
        const notifData = await notifsRes.json();
        setNotifications(notifData.notifications || []);
      }

      // Compute KPI Stats for this selected event ONLY
      const paid = pList.filter((p: any) => (p.payment_status || "").toLowerCase() === "paid").length;
      const pending = pList.length - paid;
      const totalRev = rList.reduce((acc: number, r: any) => {
        return (r.payment_status || "").toLowerCase() === "paid" ? acc + Number(r.amount || 0) : acc;
      }, 0);
      const qualified = pList.filter((p: any) => p.registration_status === "qualified" || p.result?.result_type === "qualified").length;
      const finalists = pList.filter((p: any) => p.result?.result_type === "finalist").length;
      const winners = pList.filter((p: any) => p.result?.result_type === "winner" || p.result?.result_type === "first_place").length;

      setStats({
        totalRegs: pList.length,
        paidRegs: paid,
        pendingRegs: pending,
        totalRevenue: totalRev,
        qualified: qualified,
        finalists: finalists,
        winners: winners,
      });

    } catch (err: any) {
      console.error("Error fetching event workspace:", err);
      setErrorMessage("Network error while loading event workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventWorkspace();
  }, [eventId]);

  const handleDeleteEvent = async () => {
    if (!eventData) return;
    if (!confirm(`Are you sure you want to delete event "${eventData.title}"? This action cannot be undone.`)) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        alert("Event deleted successfully.");
        router.push("/admin/events");
      } else if (data.hasRegistrations) {
        if (
          confirm(
            `${data.error}\n\nWould you like to FORCE delete this event along with all its associated registrations, payments, results, and certificates?`
          )
        ) {
          const forceRes = await fetch(`/api/events/${encodeURIComponent(eventId)}?force=true`, { method: "DELETE" });
          const forceData = await forceRes.json();
          if (forceRes.ok && forceData.success) {
            alert("Event and all associated records deleted permanently.");
            router.push("/admin/events");
          } else {
            alert(forceData.error || "Unable to delete event.");
          }
        }
      } else {
        alert(data.error || "Unable to delete event.");
      }
    } catch (err: any) {
      alert(err.message || "Unable to delete event.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "#64748B", fontWeight: 700 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🎭</div>
        <div>Loading event workspace...</div>
      </div>
    );
  }

  if (errorMessage || !eventData) {
    return (
      <div style={{ padding: 40, background: "#FEF2F2", borderRadius: 16, border: "1px solid #FCA5A5", color: "#DC2626" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>Event Loading Error</h3>
        <p style={{ margin: "0 0 16px", fontSize: 14 }}>{errorMessage || "Event not found."}</p>
        <Link href="/admin/events" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#DC2626", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          <ArrowLeft size={16} /> Return to Events
        </Link>
      </div>
    );
  }

  const lc = getEventLifecycleStatus(eventData.rawItem || eventData);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Back Link */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link
          href="/admin/events"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#64748B", textDecoration: "none" }}
        >
          <ArrowLeft size={16} /> Back to Events List
        </Link>
        
        <button
          type="button"
          onClick={fetchEventWorkspace}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#fff", fontSize: 12.5, fontWeight: 700, color: "#334155", cursor: "pointer" }}
        >
          <RefreshCw size={14} color="#7C3AED" /> Refresh Workspace Data
        </button>
      </div>

      {/* Selected Event Header Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #E2E8F0",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {eventData.banner_url ? (
              <img
                src={eventData.banner_url}
                alt={eventData.title}
                style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", border: "1px solid #E2E8F0" }}
              />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: 16, background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trophy size={36} color="#ffffff" />
              </div>
            )}

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: "#7C3AED", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {eventData.category}
                </span>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: lc.badgeBg, color: lc.badgeColor, border: `1px solid ${lc.badgeBorder}`, fontSize: 11, fontWeight: 900 }}>
                  {lc.label}
                </span>
                <span style={{ padding: "3px 8px", borderRadius: 6, background: eventData.is_published ? "#DCFCE7" : "#F1F5F9", color: eventData.is_published ? "#15803D" : "#475569", fontSize: 11, fontWeight: 800 }}>
                  {eventData.is_published ? "PUBLISHED" : "DRAFT"}
                </span>
              </div>
              
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.4 }}>
                {eventData.title}
              </h1>

              {eventData.short_description && (
                <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 0 8px", fontWeight: 500 }}>
                  {eventData.short_description}
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", fontSize: 13, color: "#475569", fontWeight: 600 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={15} color="#7C3AED" />
                  <span>Event Date: <strong>{eventData.date}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={15} color="#64748B" />
                  <span>{eventData.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                color: "#ffffff",
                border: "none",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 10px rgba(124, 58, 237, 0.3)",
              }}
            >
              <Settings size={16} /> Edit Event
            </button>

            <button
              type="button"
              onClick={handleDeleteEvent}
              disabled={deleting}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                background: "#FEE2E2",
                color: "#DC2626",
                border: "1px solid #FCA5A5",
                fontWeight: 800,
                fontSize: 13,
                cursor: deleting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* Detailed Event Meta Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            background: "#F8FAFC",
            padding: 16,
            borderRadius: 14,
            border: "1px solid #F1F5F9",
            fontSize: 12.5,
          }}
        >
          <div>
            <div style={{ color: "#64748B", fontWeight: 600 }}>Registration Window</div>
            <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
              {eventData.registration_start_date
                ? new Date(eventData.registration_start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "Opens Immediately"}{" "}
              →{" "}
              {eventData.registration_deadline
                ? new Date(eventData.registration_deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "Open until event"}
            </div>
          </div>

          <div>
            <div style={{ color: "#64748B", fontWeight: 600 }}>Registration Fee</div>
            <div style={{ fontWeight: 800, color: "#7C3AED", marginTop: 2 }}>
              {typeof eventData.registrationFee === "number" ? `₹${eventData.registrationFee}` : `₹${eventData.registrationFee || 0}`}
            </div>
          </div>

          <div>
            <div style={{ color: "#64748B", fontWeight: 600 }}>Total Registrations</div>
            <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
              {stats.totalRegs} participants registered
            </div>
          </div>

          <div>
            <div style={{ color: "#64748B", fontWeight: 600 }}>Event ID (UUID)</div>
            <div style={{ fontWeight: 700, color: "#334155", marginTop: 2, fontFamily: "monospace", fontSize: 11.5 }}>
              {eventData.id}
            </div>
          </div>
        </div>
      </div>

      {/* Event Tabs Navigation */}
      <div style={{ background: "#fff", padding: "6px 12px", borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", gap: 6, overflowX: "auto" }}>
        {[
          { id: "overview", label: "Overview", icon: Layers, count: null },
          { id: "registration", label: "Form Config", icon: FileText, count: null },
          { id: "participants", label: "Participants", icon: Users, count: stats.totalRegs },
          { id: "payments", label: "Payments", icon: CreditCard, count: payments.length },
          { id: "results", label: "Results", icon: Award, count: results.length },
          { id: "certificates", label: "Certificates", icon: ShieldCheck, count: certificates.length },
          { id: "notifications", label: "Notifications", icon: Bell, count: notifications.length },
          { id: "rounds", label: "Rounds", icon: Clock, count: null },
          { id: "settings", label: "Settings", icon: Settings, count: null },
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
                padding: "10px 16px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: isActive ? 800 : 600,
                color: isActive ? "#ffffff" : "#475569",
                background: isActive ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" : "transparent",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.18s ease",
              }}
            >
              <Icon size={15} color={isActive ? "#ffffff" : "#64748B"} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  style={{
                    padding: "2px 7px",
                    borderRadius: 10,
                    background: isActive ? "rgba(255,255,255,0.25)" : "#F1F5F9",
                    color: isActive ? "#ffffff" : "#64748B",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16 }}>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 12.5, color: "#64748B", fontWeight: 700 }}>Registrations</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", marginTop: 4 }}>{stats.totalRegs}</div>
            </div>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 12.5, color: "#16A34A", fontWeight: 700 }}>Paid Amount</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#16A34A", marginTop: 4 }}>₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
            </div>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 12.5, color: "#D97706", fontWeight: 700 }}>Pending Regs</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#D97706", marginTop: 4 }}>{stats.pendingRegs}</div>
            </div>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 12.5, color: "#2563EB", fontWeight: 700 }}>Qualified</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#2563EB", marginTop: 4 }}>{stats.qualified}</div>
            </div>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 12.5, color: "#7C3AED", fontWeight: 700 }}>Finalists</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#7C3AED", marginTop: 4 }}>{stats.finalists}</div>
            </div>
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 12.5, color: "#EAB308", fontWeight: 700 }}>Winners</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#EAB308", marginTop: 4 }}>{stats.winners}</div>
            </div>
          </div>

          {/* Recent Registrations Roster */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>Recent Registrations ({participants.length})</h3>
              <button onClick={() => setActiveTab("participants")} style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED", background: "none", border: "none", cursor: "pointer" }}>
                View All Roster →
              </button>
            </div>
            {participants.length === 0 ? (
              <div style={{ padding: "30px 0", textAlign: "center", color: "#64748B", fontSize: 13.5 }}>
                No participants registered for this event yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {participants.slice(0, 5).map((p: any) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>
                        {p.full_name} {p.team_name && <span style={{ fontSize: 12, color: "#7C3AED", fontWeight: 700 }}>({p.team_name})</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>{p.email} • {p.phone} • {p.participation_type || "Solo"}</div>
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

      {/* TAB 2: REGISTRATION FORM CONFIG */}
      {activeTab === "registration" && (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>Registration Rules &amp; Dynamic Form Schema</h3>
            <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
              Configuration settings, fee structure, and category options configured exclusively for <strong>{eventData.title}</strong>.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 14, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>Participation Categories</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
                {Array.isArray(eventData.participation_categories) ? eventData.participation_categories.join(", ") : "Solo, Duo, Group"}
              </div>
            </div>

            <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 14, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>Dance Styles</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
                {Array.isArray(eventData.dance_styles) && eventData.dance_styles.length > 0 ? eventData.dance_styles.join(", ") : "Classical, Hip Hop, Western, Folk"}
              </div>
            </div>

            <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 14, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>Required Verification Documents</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
                {Array.isArray(eventData.required_documents) && eventData.required_documents.length > 0 ? eventData.required_documents.join(", ") : "Profile Photo, ID Proof, Dance Video"}
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 8px" }}>Form Configuration Schema (JSON)</h4>
            <pre style={{ background: "#0F172A", padding: 16, borderRadius: 12, fontSize: 12, color: "#E2E8F0", overflowX: "auto" }}>
              {JSON.stringify(eventData.form_config || {}, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: PARTICIPANTS */}
      {activeTab === "participants" && (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>Event Roster ({participants.length})</h3>
            <Link href={`/admin/participants?eventId=${encodeURIComponent(eventId)}`} style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED", textDecoration: "none" }}>
              Open Dedicated Participant Roster →
            </Link>
          </div>

          {participants.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", background: "#F8FAFC", borderRadius: 16, border: "1.5px dashed #CBD5E1" }}>
              <Users size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", margin: "0 0 6px" }}>No participants registered for this event yet.</h4>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Participants who register for this event will appear in this table.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 800 }}>
                    <th style={{ padding: 12 }}>Reg ID</th>
                    <th style={{ padding: 12 }}>Participant / Team</th>
                    <th style={{ padding: 12 }}>Contact</th>
                    <th style={{ padding: 12 }}>Category / Style</th>
                    <th style={{ padding: 12 }}>Payment</th>
                    <th style={{ padding: 12 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: 12, fontWeight: 800, color: "#7C3AED" }}>{p.registration_number || p.id?.substring(0, 8)}</td>
                      <td style={{ padding: 12 }}>
                        <div style={{ fontWeight: 800, color: "#0F172A" }}>{p.full_name}</div>
                        {p.team_name && <div style={{ fontSize: 11.5, color: "#7C3AED", fontWeight: 700 }}>Team: {p.team_name}</div>}
                      </td>
                      <td style={{ padding: 12, color: "#64748B" }}>
                        <div>{p.phone}</div>
                        <div style={{ fontSize: 11.5 }}>{p.email}</div>
                      </td>
                      <td style={{ padding: 12, color: "#334155" }}>
                        <div>{p.category_name || "Solo Dance"}</div>
                        <div style={{ fontSize: 11.5, color: "#64748B" }}>{p.participation_type || "Solo"}</div>
                      </td>
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
          )}
        </div>
      )}

      {/* TAB 4: PAYMENTS */}
      {activeTab === "payments" && (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>Event Financial Transactions ({payments.length})</h3>
            <Link href={`/admin/payments?eventId=${encodeURIComponent(eventId)}`} style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED", textDecoration: "none" }}>
              Open Financial Revenue Dashboard →
            </Link>
          </div>

          {payments.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", background: "#F8FAFC", borderRadius: 16, border: "1.5px dashed #CBD5E1" }}>
              <CreditCard size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", margin: "0 0 6px" }}>No payment records found for this event.</h4>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Razorpay transactions for this event will appear here.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 800 }}>
                    <th style={{ padding: 12 }}>Registration No</th>
                    <th style={{ padding: 12 }}>Participant</th>
                    <th style={{ padding: 12 }}>Razorpay Order / Payment ID</th>
                    <th style={{ padding: 12 }}>Amount</th>
                    <th style={{ padding: 12 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((reg) => {
                    const payObj = Array.isArray(reg.registration_payments) ? reg.registration_payments[0] : reg.registration_payments;
                    return (
                      <tr key={reg.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: 12, fontWeight: 800, color: "#7C3AED" }}>{reg.registration_number}</td>
                        <td style={{ padding: 12, fontWeight: 700, color: "#0F172A" }}>{reg.participants?.full_name || "Participant"}</td>
                        <td style={{ padding: 12, color: "#64748B", fontFamily: "monospace", fontSize: 12 }}>
                          <div>Order: {payObj?.razorpay_order_id || "-"}</div>
                          <div>Pay: {payObj?.razorpay_payment_id || "-"}</div>
                        </td>
                        <td style={{ padding: 12, fontWeight: 900, color: "#0F172A" }}>₹{reg.amount}</td>
                        <td style={{ padding: 12 }}>
                          <span style={{ padding: "3px 8px", borderRadius: 6, background: reg.payment_status === "paid" ? "#DCFCE7" : "#FEF3C7", color: reg.payment_status === "paid" ? "#15803D" : "#B45309", fontSize: 11, fontWeight: 800 }}>
                            {reg.payment_status?.toUpperCase() || "UNPAID"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: RESULTS */}
      {activeTab === "results" && (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>Event Results &amp; Winner Leaderboard ({results.length})</h3>
            <Link href={`/admin/results?eventId=${encodeURIComponent(eventId)}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", color: "#fff", fontWeight: 800, fontSize: 12.5, textDecoration: "none" }}>
              <Award size={15} /> Open Full Results Manager
            </Link>
          </div>

          {results.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", background: "#F8FAFC", borderRadius: 16, border: "1.5px dashed #CBD5E1" }}>
              <Award size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", margin: "0 0 6px" }}>No results have been entered for this event yet.</h4>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Use the Results Manager to assign positions, scores, and winner standings for this event.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 800 }}>
                    <th style={{ padding: 12 }}>Participant</th>
                    <th style={{ padding: 12 }}>Category / Type</th>
                    <th style={{ padding: 12 }}>Result Standings</th>
                    <th style={{ padding: 12 }}>Score</th>
                    <th style={{ padding: 12 }}>Published</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((resItem: any) => (
                    <tr key={resItem.registration_id || resItem.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: 12, fontWeight: 800, color: "#0F172A" }}>{resItem.full_name}</td>
                      <td style={{ padding: 12, color: "#64748B" }}>{resItem.category_name || "Solo Dance"}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{ padding: "4px 10px", borderRadius: 8, background: resItem.result_type === "winner" ? "#FEF3C7" : "#EFF6FF", color: resItem.result_type === "winner" ? "#B45309" : "#2563EB", fontWeight: 800, fontSize: 11.5 }}>
                          {resItem.result_type?.toUpperCase()} (Rank #{resItem.position || "-"})
                        </span>
                      </td>
                      <td style={{ padding: 12, fontWeight: 800, color: "#0F172A" }}>{resItem.score !== null ? resItem.score : "-"}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{ padding: "3px 8px", borderRadius: 6, background: resItem.is_published ? "#DCFCE7" : "#F1F5F9", color: resItem.is_published ? "#15803D" : "#64748B", fontSize: 11, fontWeight: 800 }}>
                          {resItem.is_published ? "YES" : "NO"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CERTIFICATES */}
      {activeTab === "certificates" && (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: 0 }}>Event Digital Certificates ({certificates.length})</h3>
            <Link href={`/admin/certificates?eventId=${encodeURIComponent(eventId)}`} style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED", textDecoration: "none" }}>
              Open Certificates Workspace →
            </Link>
          </div>

          {certificates.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", background: "#F8FAFC", borderRadius: 16, border: "1.5px dashed #CBD5E1" }}>
              <ShieldCheck size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", margin: "0 0 6px" }}>No certificates issued for this event yet.</h4>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Generated participation and merit certificates for this event will appear here.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 800 }}>
                    <th style={{ padding: 12 }}>Certificate No</th>
                    <th style={{ padding: 12 }}>Participant</th>
                    <th style={{ padding: 12 }}>Type</th>
                    <th style={{ padding: 12 }}>Verification Token</th>
                    <th style={{ padding: 12 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: 12, fontWeight: 800, color: "#7C3AED" }}>{cert.certificate_number}</td>
                      <td style={{ padding: 12, fontWeight: 700, color: "#0F172A" }}>{cert.participant_name || cert.participant_id}</td>
                      <td style={{ padding: 12, color: "#334155" }}>{cert.certificate_type}</td>
                      <td style={{ padding: 12, fontFamily: "monospace", fontSize: 11.5, color: "#64748B" }}>{cert.verification_token}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{ padding: "3px 8px", borderRadius: 6, background: cert.status === "issued" ? "#DCFCE7" : "#FEF3C7", color: cert.status === "issued" ? "#15803D" : "#B45309", fontSize: 11, fontWeight: 800 }}>
                          {cert.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 16px" }}>Event System Notifications ({notifications.length})</h3>
          {notifications.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", background: "#F8FAFC", borderRadius: 16, border: "1.5px dashed #CBD5E1" }}>
              <Bell size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", margin: "0 0 6px" }}>No notifications for this event.</h4>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>System alerts related to registrations or payments for this event will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notifications.map((n) => (
                <div key={n.id} style={{ padding: 14, borderRadius: 12, background: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{n.title}</div>
                    <div style={{ fontSize: 11.5, color: "#94A3B8" }}>{new Date(n.created_at).toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "#475569" }}>{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: ROUNDS */}
      {activeTab === "rounds" && (
        <CompetitionRoundsManager eventId={eventId} eventTitle={eventData?.title} />
      )}

      {/* TAB 9: SETTINGS / EDIT */}
      {activeTab === "settings" && (
        <EventForm mode="edit" eventId={eventId} />
      )}
    </div>
  );
}
