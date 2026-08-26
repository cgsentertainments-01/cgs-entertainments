"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Plus,
  Search,
  MapPin,
  Users,
  Trophy,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Layers,
  Sparkles,
  Trash2,
} from "lucide-react";
import { getEventLifecycleStatus, LifecycleInfo, isUpcomingEvent, isPublishedEvent, isDraftEvent } from "@/lib/event-lifecycle";

interface EventItem {
  id: string;
  slug: string;
  title: string;
  short_description?: string;
  category: string;
  date: string;
  venue: string;
  city: string;
  location: string;
  price: string;
  participantsCount: number;
  maxSeats: number;
  status: string;
  event_type: "published" | "upcoming";
  is_published: boolean;
  img?: string;
  competitionsCount?: number;
  lifecycle?: LifecycleInfo;
  form_config?: any;
  rawItem?: any;
}

const STATUS_FILTERS = [
  { id: "All", label: "All" },
  { id: "DRAFT", label: "Draft" },
  { id: "COMING_SOON", label: "Coming Soon" },
  { id: "REGISTRATION_OPEN", label: "Registration Open" },
  { id: "REGISTRATION_CLOSING_SOON", label: "Closing Soon" },
  { id: "REGISTRATION_CLOSED", label: "Registration Closed" },
  { id: "LIVE", label: "Live" },
  { id: "COMPLETED", label: "Completed" },
];

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"published" | "upcoming" | "draft" | "all">("published");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("All");

  const fetchAdminEvents = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/events?all=true", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const items = (data.events || []).map((e: any) => {
          const lifecycle = e.lifecycle || getEventLifecycleStatus(e);
          const partTypes = e.form_config?.participationTypes || [];
          const compCount = partTypes.length || 1;
          
          return {
            id: String(e.id),
            slug: e.slug || String(e.id),
            title: e.title,
            short_description: e.short_description || e.title,
            category: e.category || "Dance",
            date: e.date || "TBA 2026",
            venue: e.venue || "Venue TBA",
            city: e.city || "Hyderabad",
            location: e.location || (e.venue && e.city ? `${e.venue}, ${e.city}` : e.city || "Hyderabad"),
            price: typeof e.registrationFee === "number" ? `₹${e.registrationFee}` : `₹${e.registration_fee || 0}`,
            participantsCount: e.participantsCount || e.current_participants || 0,
            maxSeats: e.maxSeats || e.max_participants || 500,
            status: e.status || "registration_open",
            event_type: isUpcomingEvent(e, lifecycle) ? "upcoming" : (isDraftEvent(e, lifecycle) ? "draft" : "published"),
            is_published: e.is_published !== undefined ? Boolean(e.is_published) : true,
            img: e.img || e.banner_url || e.banner_image || "",
            competitionsCount: compCount,
            lifecycle,
            form_config: e.form_config,
            rawItem: e,
          };
        });
        setEvents(items);
      } else {
        setErrorMessage("Unable to load events. Please check your database connection.");
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to fetch admin events:", err);
      setErrorMessage("Unable to load events. Please check your network or server setup.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAdminEvents();
      } else {
        alert(data.error || "Unable to delete event.");
      }
    } catch (err: any) {
      alert(err.message || "Unable to delete event.");
    }
  };

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  const publishedCount = events.filter((e) => isPublishedEvent(e.rawItem || e)).length;
  const upcomingCount = events.filter((e) => isUpcomingEvent(e.rawItem || e)).length;
  const draftCount = events.filter((e) => isDraftEvent(e.rawItem || e)).length;
  const allCount = events.length;

  const filteredEvents = events.filter((evt) => {
    const raw = evt.rawItem || evt;
    const isUp = isUpcomingEvent(raw);
    const isPub = isPublishedEvent(raw);
    const isDr = isDraftEvent(raw);

    let matchesTab = true;
    if (activeTab === "published") matchesTab = isPub;
    else if (activeTab === "upcoming") matchesTab = isUp;
    else if (activeTab === "draft") matchesTab = isDr;
    else if (activeTab === "all") matchesTab = true;

    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.category.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (activeStatusFilter !== "All") {
      const currentLifecycleStatus = evt.lifecycle?.status || evt.status.toUpperCase();
      matchesStatus = currentLifecycleStatus === activeStatusFilter;
    }

    return matchesTab && matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Events Management
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Create and manage national competitions and professional event lifecycles.
          </p>
        </div>

        <Link
          href="/admin/events/create"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 22px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(109, 40, 217, 0.3)",
          }}
        >
          <Plus size={18} />
          + Create Event
        </Link>
      </div>

      {/* Main Mode Tabs: Published Events vs Upcoming Events vs Drafts vs All */}
      <div style={{ display: "flex", gap: 12, borderBottom: "2px solid #E2E8F0", paddingBottom: 0, overflowX: "auto" }}>
        <button
          type="button"
          onClick={() => { setActiveTab("published"); setActiveStatusFilter("All"); }}
          style={{
            padding: "12px 22px",
            fontSize: 15,
            fontWeight: 900,
            color: activeTab === "published" ? "#7C3AED" : "#64748B",
            borderBottom: activeTab === "published" ? "3px solid #7C3AED" : "3px solid transparent",
            background: "none",
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: -2,
            transition: "all 0.18s ease",
            whiteSpace: "nowrap",
          }}
        >
          <span>Published Events</span>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 12,
              background: activeTab === "published" ? "#F3E8FF" : "#F1F5F9",
              color: activeTab === "published" ? "#7C3AED" : "#64748B",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {publishedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("upcoming"); setActiveStatusFilter("All"); }}
          style={{
            padding: "12px 22px",
            fontSize: 15,
            fontWeight: 900,
            color: activeTab === "upcoming" ? "#2563EB" : "#64748B",
            borderBottom: activeTab === "upcoming" ? "3px solid #2563EB" : "3px solid transparent",
            background: "none",
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: -2,
            transition: "all 0.18s ease",
            whiteSpace: "nowrap",
          }}
        >
          <span>Upcoming Events</span>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 12,
              background: activeTab === "upcoming" ? "#DBEAFE" : "#F1F5F9",
              color: activeTab === "upcoming" ? "#2563EB" : "#64748B",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {upcomingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("draft"); setActiveStatusFilter("All"); }}
          style={{
            padding: "12px 22px",
            fontSize: 15,
            fontWeight: 900,
            color: activeTab === "draft" ? "#475569" : "#64748B",
            borderBottom: activeTab === "draft" ? "3px solid #475569" : "3px solid transparent",
            background: "none",
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: -2,
            transition: "all 0.18s ease",
            whiteSpace: "nowrap",
          }}
        >
          <span>Draft Events</span>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 12,
              background: activeTab === "draft" ? "#E2E8F0" : "#F1F5F9",
              color: activeTab === "draft" ? "#334155" : "#64748B",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {draftCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("all"); setActiveStatusFilter("All"); }}
          style={{
            padding: "12px 22px",
            fontSize: 15,
            fontWeight: 900,
            color: activeTab === "all" ? "#0F172A" : "#64748B",
            borderBottom: activeTab === "all" ? "3px solid #0F172A" : "3px solid transparent",
            background: "none",
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: -2,
            transition: "all 0.18s ease",
            whiteSpace: "nowrap",
          }}
        >
          <span>All Events</span>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 12,
              background: activeTab === "all" ? "#E2E8F0" : "#F1F5F9",
              color: activeTab === "all" ? "#0F172A" : "#64748B",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {allCount}
          </span>
        </button>
      </div>

      {errorMessage && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 14, padding: "16px 20px", color: "#DC2626", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Controls Bar: Search & Status Filters */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          background: "#fff",
          padding: 16,
          borderRadius: 18,
          border: "1px solid #E2E8F0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* Search Input */}
          <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
            <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder={activeTab === "upcoming" ? "Search upcoming events..." : "Search events by name or location..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 42px",
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                fontSize: 13.5,
                outline: "none",
                background: "#F8FAFC",
              }}
            />
          </div>
        </div>

        {/* Status Filter Tabs (Only shown for Published Events) */}
        {activeTab === "published" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {STATUS_FILTERS.map((filter) => {
              const isActive = activeStatusFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveStatusFilter(filter.id)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? "#ffffff" : "#475569",
                    background: isActive
                      ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)"
                      : "#F1F5F9",
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.18s ease",
                    boxShadow: isActive ? "0 2px 8px rgba(124, 58, 237, 0.25)" : "none",
                  }}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Events Grid / Cards */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#64748B", fontWeight: 600 }}>
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1.5px dashed #CBD5E1",
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎭</div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
            No events found
          </h3>
          <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px", fontWeight: 500 }}>
            Create your first event to start accepting participant registrations.
          </p>
          <Link
            href="/admin/events/create"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 26px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(109, 40, 217, 0.3)",
            }}
          >
            <Plus size={18} />
            + Create Event
          </Link>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: "48px 24px", textAlign: "center" }}>
          <AlertCircle size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", margin: "0 0 6px" }}>
            {activeTab === "upcoming" ? "No Upcoming Events Found" : "No Matching Published Events"}
          </h3>
          <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
            {activeTab === "upcoming" ? "Click '+ Create Event' to announce a new upcoming event." : "No published events match your selected status or search filter."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {filteredEvents.map((evt) => {
            const lc = evt.lifecycle || getEventLifecycleStatus(evt.rawItem || evt);
            const partTypes = evt.form_config?.participationTypes || [];
            const feeSummary = partTypes.length > 0
              ? partTypes.map((pt: any) => `${pt.name} ₹${pt.fee}`).join(" • ")
              : evt.price;

            // Render Upcoming Event Card
            if (activeTab === "upcoming" || evt.event_type === "upcoming") {
              return (
                <div
                  key={evt.id}
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    border: "1.5px solid #BFDBFE",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 10px rgba(59, 130, 246, 0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  className="admin-event-card"
                >
                  <div style={{ height: 140, background: "#1E293B", position: "relative", overflow: "hidden" }}>
                    {evt.img ? (
                      <img src={evt.img} alt={evt.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Sparkles size={36} color="#94A3B8" />
                      </div>
                    )}
                    <span style={{ position: "absolute", top: 12, right: 12, padding: "4px 10px", borderRadius: 8, background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", fontSize: 11, fontWeight: 900 }}>
                      COMING SOON
                    </span>
                  </div>

                  <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#2563EB", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                        {evt.category}
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", margin: "0 0 8px", lineHeight: 1.3 }}>
                        {evt.title}
                      </h3>
                      {evt.short_description && (
                        <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 12px", lineHeight: 1.4 }}>
                          {evt.short_description}
                        </p>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "#64748B" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                          <Calendar size={14} color="#2563EB" />
                          <span>Expected Date: {evt.date}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                          <MapPin size={14} color="#64748B" />
                          <span>{evt.city || evt.location}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <Link
                        href={`/admin/events/${encodeURIComponent(evt.id)}/edit`}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "10px",
                          borderRadius: 12,
                          background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                          color: "#ffffff",
                          fontSize: 13,
                          fontWeight: 800,
                          textDecoration: "none",
                        }}
                      >
                        <Sparkles size={15} /> Complete &amp; Publish
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt.id)}
                        style={{
                          padding: "10px",
                          borderRadius: 12,
                          background: "#FEE2E2",
                          color: "#DC2626",
                          border: "none",
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                        title="Delete Upcoming Event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Render Published Event Card
            return (
              <div
                key={evt.id}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: "1px solid #E2E8F0",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                className="admin-event-card"
              >
                {/* Banner Thumbnail */}
                <div style={{ height: 140, background: "#0F172A", position: "relative", overflow: "hidden" }}>
                  {evt.img ? (
                    <img
                      src={evt.img}
                      alt={evt.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Sparkles size={36} color="#A78BFA" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: lc.badgeBg,
                      color: lc.badgeColor,
                      border: `1px solid ${lc.badgeBorder}`,
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: 0.5,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    {lc.label}
                  </span>

                  {/* Release Tag */}
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: evt.is_published ? "rgba(22, 163, 74, 0.85)" : "rgba(100, 116, 139, 0.85)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {evt.is_published ? "RELEASED" : "DRAFT"}
                  </span>
                </div>

                {/* Card Content */}
                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                      {evt.category}
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", margin: "0 0 8px", lineHeight: 1.3 }}>
                      {evt.title}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "#64748B" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                        <Calendar size={14} color="#7C3AED" />
                        <span>Event Date: {evt.date}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                        <MapPin size={14} color="#64748B" />
                        <span>{evt.city || evt.location}</span>
                      </div>
                      {evt.rawItem?.registration_start_date && (
                        <div style={{ fontSize: 11.5, color: "#475569", fontWeight: 500 }}>
                          <span style={{ fontWeight: 700 }}>Reg Opens:</span> {new Date(evt.rawItem.registration_start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                      {evt.rawItem?.registration_deadline && (
                        <div style={{ fontSize: 11.5, color: "#475569", fontWeight: 500 }}>
                          <span style={{ fontWeight: 700 }}>Reg Closes:</span> {new Date(evt.rawItem.registration_deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fee Summary */}
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6D28D9", background: "#FAF5FF", padding: "6px 10px", borderRadius: 8 }}>
                    {feeSummary}
                  </div>

                  {/* Stat pills */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#F8FAFC",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #F1F5F9",
                      fontSize: 12.5,
                    }}
                  >
                    <div>
                      <div style={{ color: "#64748B", fontWeight: 600 }}>Registrations</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#0F172A", marginTop: 1 }}>
                        {evt.participantsCount}
                      </div>
                    </div>
                    <div style={{ width: 1, height: 28, background: "#E2E8F0" }} />
                    <div>
                      <div style={{ color: "#64748B", fontWeight: 600 }}>Competitions</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#7C3AED", marginTop: 1 }}>
                        {evt.competitionsCount}
                      </div>
                    </div>
                  </div>

                  {/* Manage Button */}
                  <Link
                    href={`/admin/events/${encodeURIComponent(evt.id)}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      width: "100%",
                      padding: "11px",
                      borderRadius: 12,
                      background: "#F1F5F9",
                      color: "#0F172A",
                      fontSize: 13.5,
                      fontWeight: 800,
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                      boxSizing: "border-box",
                    }}
                    className="manage-evt-btn"
                  >
                    <span>Manage Event</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .admin-event-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.07) !important;
        }
        .manage-evt-btn:hover {
          background: #7C3AED !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
