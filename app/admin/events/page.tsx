"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Eye,
  AlertCircle,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Ban,
  Users,
  Trophy,
} from "lucide-react";

interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  category_id?: string;
  date: string;
  rawDate?: string;
  registration_deadline?: string;
  venue: string;
  city: string;
  location: string;
  price: string;
  registration_fee: number;
  participantsCount: number;
  maxSeats: number;
  status: string;
  is_published: boolean;
  img?: string;
  created_at?: string;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Actions State
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [cannotDeleteMsg, setCannotDeleteMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

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
          category_id: e.category_id,
          date: e.date || "TBA 2026",
          rawDate: e.rawDate || e.event_date,
          registration_deadline: e.registration_deadline ? new Date(e.registration_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Open",
          venue: e.venue || "Venue TBA",
          city: e.city || "Hyderabad",
          location: e.location || (e.venue && e.city ? `${e.venue}, ${e.city}` : e.city || "Hyderabad"),
          price: typeof e.registrationFee === "number" ? `₹${e.registrationFee}` : `₹${e.registration_fee || 0}`,
          registration_fee: e.registrationFee || e.registration_fee || 0,
          participantsCount: e.participantsCount || e.current_participants || 0,
          maxSeats: e.maxSeats || e.max_participants || 500,
          status: e.status || "registration_open",
          is_published: e.is_published !== undefined ? Boolean(e.is_published) : true,
          img: e.img || e.banner_url || e.banner_image || "",
          created_at: e.created_at ? new Date(e.created_at).toLocaleDateString() : "Recent",
        }));
        setEvents(items);
      } else {
        setErrorMessage("Unable to load events. Please check your Supabase connection and database configuration.");
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to fetch admin events:", err);
      setErrorMessage("Unable to load events. Please check your Supabase connection and database configuration.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  // Quick Action: Publish / Unpublish Toggle
  const handleTogglePublish = async (evt: EventItem) => {
    try {
      const updatedPublish = !evt.is_published;
      const res = await fetch(`/api/events/${encodeURIComponent(evt.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...evt, is_published: updatedPublish }),
      });
      if (res.ok) {
        setActionSuccessMsg(`Event "${evt.title}" is now ${updatedPublish ? "Published" : "Unpublished"}.`);
        fetchAdminEvents();
        setTimeout(() => setActionSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error("Error updating publish status:", err);
    }
  };

  // Quick Action: Cancel Event
  const handleCancelEvent = async (evt: EventItem) => {
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(evt.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...evt, status: "cancelled", is_published: false }),
      });
      if (res.ok) {
        setActionSuccessMsg(`Event "${evt.title}" marked as Cancelled.`);
        fetchAdminEvents();
        setTimeout(() => setActionSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error("Error cancelling event:", err);
    }
  };

  // Quick Action: Deactivate / Archive Event
  const handleArchiveEvent = async (evt: EventItem) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(evt.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...evt, status: "archived", is_published: false }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Event "${evt.title}" has been archived/deactivated.`);
        setDeletingEvent(null);
        setCannotDeleteMsg(null);
        fetchAdminEvents();
        setTimeout(() => setActionSuccessMsg(null), 3000);
      } else {
        setDeleteError(data.error || "Failed to deactivate event.");
      }
    } catch (err: any) {
      console.error("Error deactivating event:", err);
      setDeleteError(err.message || "Failed to deactivate event.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Action: Confirm Permanent Delete Event (for events with 0 registrations)
  const confirmDeleteEvent = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/events?id=${encodeURIComponent(deletingEvent.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActionSuccessMsg(`Event "${deletingEvent.title}" deleted successfully.`);
        setDeletingEvent(null);
        setCannotDeleteMsg(null);
        fetchAdminEvents();
        setTimeout(() => setActionSuccessMsg(null), 3000);
      } else if (res.status === 409 || data.hasRegistrations) {
        setCannotDeleteMsg(data.error || "This event has existing registrations and cannot be permanently deleted. You can deactivate/archive it instead.");
      } else {
        setDeleteError(data.error || "Failed to delete event from database.");
      }
    } catch (err: any) {
      console.error("Error deleting event:", err);
      setDeleteError(err.message || "Network error deleting event.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      evt.status.toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter === "Published" && evt.is_published) ||
      (statusFilter === "Draft" && !evt.is_published) ||
      (statusFilter === "Archived" && (evt.status.toLowerCase() === "archived" || evt.status.toLowerCase() === "inactive"));

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (status: string, isPublished: boolean) => {
    if (status.toLowerCase() === "archived" || status.toLowerCase() === "inactive") {
      return { label: "Archived", color: "#D97706", bg: "#FEF3C7" };
    }
    if (!isPublished) {
      return { label: "Draft", color: "#64748B", bg: "#F1F5F9" };
    }
    switch (status.toLowerCase()) {
      case "registration_open":
      case "upcoming":
        return { label: "Registration Open", color: "#2563EB", bg: "#EFF6FF" };
      case "ongoing":
        return { label: "Ongoing", color: "#16A34A", bg: "#DCFCE7" };
      case "completed":
        return { label: "Completed", color: "#475569", bg: "#F8FAFC" };
      case "cancelled":
        return { label: "Cancelled", color: "#DC2626", bg: "#FEF2F2" };
      default:
        return { label: status, color: "#475569", bg: "#F8FAFC" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Top Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
            Events Management
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Manage, publish, and organize national competition events saved in Supabase.
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
            border: "none",
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

      {/* Notifications */}
      {actionSuccessMsg && (
        <div style={{ background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 14, padding: "12px 18px", color: "#15803D", fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={18} />
          {actionSuccessMsg}
        </div>
      )}

      {errorMessage && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 14, padding: "16px 20px", color: "#DC2626", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>
          <AlertCircle size={20} />
          <div>
            <div style={{ fontWeight: 800 }}>Unable to load events.</div>
            <div style={{ fontSize: 13, marginTop: 2, opacity: 0.9 }}>Please check your Supabase connection and database configuration.</div>
          </div>
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          background: "#fff",
          padding: 16,
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by title, location, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 42px",
              borderRadius: 10,
              border: "1px solid #CBD5E1",
              fontSize: 13.5,
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Filter size={16} color="#64748B" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #CBD5E1",
              fontSize: 13.5,
              fontWeight: 600,
              color: "#334155",
              outline: "none",
              background: "#F8FAFC",
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="registration_open">Registration Open</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ── Events Table / Empty State ── */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#64748B", fontWeight: 600 }}>
          Loading events from Supabase...
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1.5px dashed #CBD5E1",
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
            No events yet.
          </h3>
          <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px", fontWeight: 500 }}>
            Create your first event to display it on the website.
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
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <AlertCircle size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", margin: "0 0 6px" }}>No Matching Events</h3>
          <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
            No events match your current search or filter criteria.
          </p>
        </div>
      ) : (
        /* Data Table */
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569" }}>EVENT DETAILS</th>
                <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569" }}>CATEGORY</th>
                <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569" }}>DATE &amp; DEADLINE</th>
                <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569" }}>VENUE &amp; CITY</th>
                <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569" }}>FEE &amp; SEATS</th>
                <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569" }}>STATUS</th>
                <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt) => {
                const badgeStyle = getStatusBadgeStyle(evt.status, evt.is_published);
                return (
                  <tr key={evt.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    {/* Title & Image */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {evt.img ? (
                          <img
                            src={evt.img}
                            alt={evt.title}
                            style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: 10,
                              background: "#EDE9FE",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Calendar size={20} color="#6D28D9" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{evt.title}</div>
                          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>Slug: /{evt.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 6,
                          background: "#F1F5F9",
                          color: "#334155",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {evt.category}
                      </span>
                    </td>

                    {/* Date & Deadline */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{evt.date}</div>
                      <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                        Deadline: {evt.registration_deadline}
                      </div>
                    </td>

                    {/* Venue */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{evt.venue}</div>
                      <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <MapPin size={12} color="#94A3B8" /> {evt.city}
                      </div>
                    </td>

                    {/* Fee & Participants */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{evt.price}</div>
                      <div style={{ fontSize: 11.5, color: "#64748B" }}>
                        {evt.participantsCount} / {evt.maxSeats} seats
                      </div>
                    </td>

                    {/* Status & Published Badge */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: badgeStyle.bg,
                            color: badgeStyle.color,
                            fontSize: 11.5,
                            fontWeight: 800,
                          }}
                        >
                          {badgeStyle.label}
                        </span>
                        {evt.is_published ? (
                          <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                            <CheckCircle2 size={11} /> Published
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                            <XCircle size={11} /> Draft (Unpublished)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions: Participants & Results, View, Edit, Publish/Unpublish, Cancel, Delete */}
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        {/* Participants & Results Link */}
                        <Link
                          href={`/admin/events/${encodeURIComponent(evt.id)}/participants`}
                          title="View Participants & Winner Selection"
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1.5px solid #DDD6FE",
                            background: "#F5F3FF",
                            color: "#6D28D9",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 800,
                            textDecoration: "none",
                          }}
                        >
                          <Trophy size={14} color="#6D28D9" /> Participants
                        </Link>

                        {/* View Preview */}
                        <Link
                          href={`/events/${encodeURIComponent(evt.slug)}`}
                          title="View Event on Website"
                          style={{
                            padding: 6,
                            borderRadius: 8,
                            border: "1px solid #CBD5E1",
                            background: "#fff",
                            color: "#475569",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Eye size={15} />
                        </Link>

                        {/* Edit Event */}
                        <Link
                          href={`/admin/events/${encodeURIComponent(evt.id)}/edit`}
                          title="Edit Event"
                          style={{
                            padding: 6,
                            borderRadius: 8,
                            border: "1px solid #CBD5E1",
                            background: "#fff",
                            color: "#6D28D9",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Edit2 size={15} />
                        </Link>

                        {/* Publish / Unpublish Toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(evt)}
                          title={evt.is_published ? "Unpublish Event" : "Publish Event"}
                          style={{
                            padding: "5px 9px",
                            borderRadius: 8,
                            border: `1px solid ${evt.is_published ? "#CBD5E1" : "#86EFAC"}`,
                            background: evt.is_published ? "#fff" : "#DCFCE7",
                            color: evt.is_published ? "#475569" : "#15803D",
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {evt.is_published ? "Unpublish" : "Publish"}
                        </button>

                        {/* Cancel Event */}
                        {evt.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => handleCancelEvent(evt)}
                            title="Cancel Event"
                            style={{
                              padding: 6,
                              borderRadius: 8,
                              border: "1px solid #FED7AA",
                              background: "#FFF7ED",
                              color: "#C2410C",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Ban size={15} />
                          </button>
                        )}

                        {/* Delete Event */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingEvent(evt);
                            setDeleteError(null);
                            setCannotDeleteMsg(null);
                          }}
                          title="Delete Event"
                          style={{
                            padding: 6,
                            borderRadius: 8,
                            border: "1px solid #FECACA",
                            background: "#FEF2F2",
                            color: "#DC2626",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Smart Delete / Deactivate Event Confirmation Modal */}
      {deletingEvent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              width: "100%",
              maxWidth: 480,
              padding: 28,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            {deletingEvent.participantsCount > 0 || cannotDeleteMsg ? (
              /* CASE: Event HAS existing registrations -> Offer Deactivate / Archive */
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertTriangle size={24} color="#D97706" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                      Event Cannot Be Permanently Deleted
                    </h3>
                    <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                      Event: <strong>{deletingEvent.title}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, marginBottom: 20, background: "#FFFBEB", border: "1px solid #FDE68A", padding: 14, borderRadius: 12 }}>
                  This event has <strong>{deletingEvent.participantsCount || "existing"}</strong> registered participant(s) and payment records. It cannot be permanently deleted to prevent financial data corruption.
                  <div style={{ marginTop: 8, fontWeight: 700, color: "#92400E" }}>
                    You can deactivate / archive it instead to hide it from new registrations while preserving history.
                  </div>
                </div>

                {deleteError && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 12, color: "#DC2626", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                    {deleteError}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingEvent(null);
                      setDeleteError(null);
                      setCannotDeleteMsg(null);
                    }}
                    style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid #CBD5E1", background: "#fff", fontSize: 13.5, fontWeight: 700, color: "#334155", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleArchiveEvent(deletingEvent)}
                    disabled={isDeleting}
                    style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #D97706, #B45309)", fontSize: 13.5, fontWeight: 800, color: "#fff", cursor: "pointer" }}
                  >
                    {isDeleting ? "Deactivating..." : "Deactivate / Archive Event"}
                  </button>
                </div>
              </div>
            ) : (
              /* CASE: Event HAS NO registrations -> Allow Permanent Supabase Deletion */
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertTriangle size={24} color="#DC2626" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                      Are you sure you want to delete this event?
                    </h3>
                    <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                      Event: <strong>{deletingEvent.title}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.5, marginBottom: 20 }}>
                  This will permanently delete this event from Supabase database. This action cannot be undone.
                </div>

                {deleteError && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 12, color: "#DC2626", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                    {deleteError}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingEvent(null);
                      setDeleteError(null);
                      setCannotDeleteMsg(null);
                    }}
                    style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid #CBD5E1", background: "#fff", fontSize: 13.5, fontWeight: 700, color: "#334155", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteEvent}
                    disabled={isDeleting}
                    style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "#DC2626", fontSize: 13.5, fontWeight: 800, color: "#fff", cursor: "pointer" }}
                  >
                    {isDeleting ? "Deleting..." : "Delete Event"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
