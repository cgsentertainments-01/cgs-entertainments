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
} from "lucide-react";

interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  venue: string;
  city: string;
  location: string;
  price: string;
  participantsCount: number;
  maxSeats: number;
  status: string;
  is_published: boolean;
  img?: string;
  competitionsCount?: number;
}

const STATUS_FILTERS = [
  { id: "All", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "registration_open", label: "Registration Open" },
  { id: "upcoming", label: "Upcoming" },
  { id: "ongoing", label: "Live" },
  { id: "completed", label: "Completed" },
];

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("All");

  const fetchAdminEvents = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/events?all=true", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const items = (data.events || []).map((e: any) => ({
          id: e.id,
          slug: e.slug || e.id,
          title: e.title,
          category: e.category || "Dance",
          date: e.date || "TBA 2026",
          venue: e.venue || "Venue TBA",
          city: e.city || "Hyderabad",
          location: e.location || (e.venue && e.city ? `${e.venue}, ${e.city}` : e.city || "Hyderabad"),
          price: typeof e.registrationFee === "number" ? `₹${e.registrationFee}` : `₹${e.registration_fee || 0}`,
          participantsCount: e.participantsCount || e.current_participants || 0,
          maxSeats: e.maxSeats || e.max_participants || 500,
          status: e.status || "registration_open",
          is_published: e.is_published !== undefined ? Boolean(e.is_published) : true,
          img: e.img || e.banner_url || e.banner_image || "",
          competitionsCount: e.competitionsCount || e.categories_count || (e.form_config?.competitions?.length || 1),
        }));
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

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.category.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (activeStatusFilter === "draft") {
      matchesStatus = !evt.is_published || evt.status.toLowerCase() === "draft";
    } else if (activeStatusFilter === "registration_open") {
      matchesStatus = evt.status.toLowerCase() === "registration_open" || evt.status.toLowerCase() === "open";
    } else if (activeStatusFilter === "upcoming") {
      matchesStatus = evt.status.toLowerCase() === "upcoming";
    } else if (activeStatusFilter === "ongoing") {
      matchesStatus = evt.status.toLowerCase() === "ongoing" || evt.status.toLowerCase() === "live";
    } else if (activeStatusFilter === "completed") {
      matchesStatus = evt.status.toLowerCase() === "completed";
    }

    return matchesSearch && matchesStatus;
  });

  const getBadgeStyle = (status: string, isPublished: boolean) => {
    if (!isPublished || status.toLowerCase() === "draft") {
      return { label: "DRAFT", color: "#64748B", bg: "#F1F5F9" };
    }
    switch (status.toLowerCase()) {
      case "registration_open":
      case "open":
        return { label: "REGISTRATION OPEN", color: "#2563EB", bg: "#EFF6FF" };
      case "ongoing":
      case "live":
        return { label: "LIVE", color: "#16A34A", bg: "#DCFCE7" };
      case "upcoming":
        return { label: "UPCOMING", color: "#7C3AED", bg: "#F3E8FF" };
      case "completed":
        return { label: "COMPLETED", color: "#475569", bg: "#F8FAFC" };
      case "cancelled":
        return { label: "CANCELLED", color: "#DC2626", bg: "#FEF2F2" };
      default:
        return { label: status.toUpperCase(), color: "#475569", bg: "#F8FAFC" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Events
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Create and manage national competition events.
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
              placeholder="Search events by name or location..."
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

        {/* Status Filter Tabs */}
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
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", margin: "0 0 6px" }}>No Matching Events</h3>
          <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
            No events match your selected status or search filter.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {filteredEvents.map((evt) => {
            const badge = getBadgeStyle(evt.status, evt.is_published);
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
                      background: badge.bg,
                      color: badge.color,
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: 0.5,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Card Content */}
                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 8px", lineHeight: 1.3 }}>
                      {evt.title}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#64748B" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                        <Calendar size={15} color="#7C3AED" />
                        <span>{evt.date}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                        <MapPin size={15} color="#64748B" />
                        <span>{evt.city || evt.location}</span>
                      </div>
                    </div>
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
                        {evt.competitionsCount || 1}
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
