"use client";

import React, { useState } from "react";
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Users,
  IndianRupee,
  X,
  Check,
  AlertCircle,
  Filter,
} from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  price: string;
  participantsCount: number;
  maxSeats: number;
  status: "Ongoing" | "Upcoming" | "Completed" | "Cancelled";
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: "EVT-1",
      title: "Hyderabad National Dance Championship 2026",
      category: "Dance",
      date: "20-22 May 2026",
      location: "Shilpakaram Auditorium, Hyderabad",
      price: "₹1,499",
      participantsCount: 340,
      maxSeats: 500,
      status: "Ongoing",
    },
    {
      id: "EVT-2",
      title: "South India Fashion & Modeling Hunt 2026",
      category: "Modeling",
      date: "10-11 June 2026",
      location: "Kanteerava Stadium, Bangalore",
      price: "₹1,999",
      participantsCount: 220,
      maxSeats: 300,
      status: "Upcoming",
    },
    {
      id: "EVT-3",
      title: "Acting Excellence Awards & Auditions",
      category: "Acting",
      date: "18-19 June 2026",
      location: "Music Academy Hall, Chennai",
      price: "₹1,299",
      participantsCount: 185,
      maxSeats: 250,
      status: "Upcoming",
    },
    {
      id: "EVT-4",
      title: "Voice of India Music Auditions",
      category: "Singing",
      date: "30 June - 01 July 2026",
      location: "NCPA Auditorium, Mumbai",
      price: "₹1,199",
      participantsCount: 242,
      maxSeats: 400,
      status: "Upcoming",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Dance");
  const [formDate, setFormDate] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formPrice, setFormPrice] = useState("₹1,499");
  const [formMaxSeats, setFormMaxSeats] = useState(300);
  const [formStatus, setFormStatus] = useState<"Ongoing" | "Upcoming" | "Completed" | "Cancelled">("Upcoming");

  const openAddModal = () => {
    setEditingEvent(null);
    setFormTitle("");
    setFormCategory("Dance");
    setFormDate("");
    setFormLocation("");
    setFormPrice("₹1,499");
    setFormMaxSeats(300);
    setFormStatus("Upcoming");
    setIsModalOpen(true);
  };

  const openEditModal = (evt: EventItem) => {
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormCategory(evt.category);
    setFormDate(evt.date);
    setFormLocation(evt.location);
    setFormPrice(evt.price);
    setFormMaxSeats(evt.maxSeats);
    setFormStatus(evt.status);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formLocation) return;

    if (editingEvent) {
      setEvents(
        events.map((item) =>
          item.id === editingEvent.id
            ? {
                ...item,
                title: formTitle,
                category: formCategory,
                date: formDate || "TBA 2026",
                location: formLocation,
                price: formPrice,
                maxSeats: formMaxSeats,
                status: formStatus,
              }
            : item
        )
      );
    } else {
      const newEvt: EventItem = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        title: formTitle,
        category: formCategory,
        date: formDate || "TBA 2026",
        location: formLocation,
        price: formPrice,
        participantsCount: 0,
        maxSeats: formMaxSeats,
        status: formStatus,
      };
      setEvents([newEvt, ...events]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((item) => item.id !== id));
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || evt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Ongoing":
        return { color: "#16A34A", bg: "#DCFCE7" };
      case "Upcoming":
        return { color: "#2563EB", bg: "#EFF6FF" };
      case "Completed":
        return { color: "#6B7280", bg: "#F3F4F6" };
      case "Cancelled":
        return { color: "#DC2626", bg: "#FEF2F2" };
      default:
        return { color: "#475569", bg: "#F8FAFC" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
            Event Management
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Create, edit, and organize all national stage competitions and auditions.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          style={{
            padding: "11px 22px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
          }}
        >
          <Plus size={18} />
          Create New Event
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          border: "1.5px solid #E2E8F0",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ position: "relative", minWidth: 280, flex: 1 }}>
          <Search size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search events by title or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              borderRadius: 12,
              border: "1.5px solid #E2E8F0",
              fontSize: 13.5,
              outline: "none",
              background: "#F8FAFC",
              color: "#0F172A",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={16} color="#64748B" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>Status:</span>
          {["All", "Ongoing", "Upcoming", "Completed", "Cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                background: statusFilter === st ? "#7C3AED" : "#F1F5F9",
                color: statusFilter === st ? "#ffffff" : "#475569",
                transition: "all 0.2s",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {filteredEvents.map((evt) => {
          const badgeStyle = getStatusBadgeStyle(evt.status);
          return (
            <div
              key={evt.id}
              style={{
                background: "#ffffff",
                borderRadius: 20,
                border: "1.5px solid #E2E8F0",
                padding: "22px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#6D28D9",
                      background: "#F3E8FF",
                      textTransform: "uppercase",
                    }}
                  >
                    {evt.category}
                  </span>

                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: badgeStyle.color,
                      background: badgeStyle.bg,
                    }}
                  >
                    {evt.status}
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 10px", lineHeight: 1.3 }}>
                  {evt.title}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#64748B", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={15} color="#7C3AED" />
                    <span>{evt.date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={15} color="#7C3AED" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ height: 1, background: "#F1F5F9", margin: "12px 0" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700 }}>Fee</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>{evt.price}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700 }}>Registered</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#16A34A" }}>
                      {evt.participantsCount} / {evt.maxSeats}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(evt)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 10,
                      background: "#FAF5FF",
                      border: "1px solid #E9D5FF",
                      color: "#6D28D9",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Edit2 size={15} /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(evt.id)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: "#DC2626",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(9, 3, 20, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              width: "100%",
              maxWidth: 540,
              padding: "32px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                {editingEvent ? "Edit Event Details" : "Create New Competition Event"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad Dance Championship"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1.5px solid #E2E8F0",
                      fontSize: 13.5,
                      outline: "none",
                    }}
                  >
                    <option value="Dance">Dance</option>
                    <option value="Modeling">Modeling</option>
                    <option value="Singing">Singing</option>
                    <option value="Acting">Acting</option>
                    <option value="Music">Music</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1.5px solid #E2E8F0",
                      fontSize: 13.5,
                      outline: "none",
                    }}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                  Venue Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shilpakaram Auditorium, Hyderabad"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                    Dates
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20 - 22 May 2026"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1.5px solid #E2E8F0",
                      fontSize: 13.5,
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                    Price Fee
                  </label>
                  <input
                    type="text"
                    placeholder="₹1,499"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1.5px solid #E2E8F0",
                      fontSize: 13.5,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    background: "#ffffff",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                    color: "#fff",
                    border: "none",
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {editingEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
