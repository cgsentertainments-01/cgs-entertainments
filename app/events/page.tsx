"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventCard, EventType } from "@/components/events/EventCard";

/* ─── MOCK DATA ─── */
const ALL_EVENTS: EventType[] = [
  {
    id: "e1",
    slug: "national-dance-championship",
    title: "National Dance Championship",
    badge: "DANCE",
    badgeBg: "#312E81",
    date: "25 May 2026",
    location: "Hyderabad, Telangana",
    img: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "e2",
    slug: "elite-modeling-show",
    title: "Elite Modeling Show 2026",
    badge: "MODELING",
    badgeBg: "#1D4ED8",
    date: "10 June 2026",
    location: "Bangalore, Karnataka",
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "e3",
    slug: "acting-excellence-awards",
    title: "Acting Excellence Awards",
    badge: "ACTING",
    badgeBg: "#78350F",
    date: "18 June 2026",
    location: "Chennai, Tamil Nadu",
    img: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "e4",
    slug: "voice-of-india-2026",
    title: "Voice of India 2026",
    badge: "SINGING",
    badgeBg: "#9D174D",
    date: "30 June 2026",
    location: "Mumbai, Maharashtra",
    img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "e5",
    slug: "rhythm-india-music-fest",
    title: "Rhythm India Music Fest",
    badge: "MUSIC",
    badgeBg: "#065F46",
    date: "15 July 2026",
    location: "Pune, Maharashtra",
    img: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "e6",
    slug: "lens-masters-photography",
    title: "Lens Masters Photography",
    badge: "PHOTO",
    badgeBg: "#92400E",
    date: "22 July 2026",
    location: "Delhi, India",
    img: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "e7",
    slug: "south-dance-fiesta",
    title: "South Dance Fiesta",
    badge: "DANCE",
    badgeBg: "#312E81",
    date: "5 August 2026",
    location: "Coimbatore, Tamil Nadu",
    img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "e8",
    slug: "kids-talent-hunt",
    title: "Kids Talent Hunt 2026",
    badge: "DANCE",
    badgeBg: "#6D28D9",
    date: "20 August 2026",
    location: "Hyderabad, Telangana",
    img: "https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?auto=format&fit=crop&w=800&q=85",
  },
];

const CATEGORIES = ["All", "Dance", "Modeling", "Acting", "Singing", "Music", "Photography"];

/* ─── PAGE ─── */
export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = ALL_EVENTS.filter((e) => {
    const matchesCat = activeCategory === "All" || e.badge.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />

      {/* ── Page Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E1B4B 0%, #3730A3 50%, #6D28D9 100%)",
          paddingTop: 64,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "44px 32px 48px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Link href="/" style={{ fontSize: 13, color: "#C4B5FD", textDecoration: "none", fontWeight: 500 }}>
              Home
            </Link>
            <ChevronRight size={14} color="#7C3AED" />
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Events</span>
          </div>

          <h1
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 10px",
              letterSpacing: -1,
            }}
            className="evts-h1"
          >
            Upcoming Events
          </h1>
          <p style={{ fontSize: 16, color: "#C4B5FD", fontWeight: 500, margin: 0 }}>
            Discover and register for dance, modeling, singing, acting &amp; more competitions across India.
          </p>
        </div>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
          position: "sticky",
          top: 64,
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              height: 68,
              flexWrap: "wrap",
            }}
            className="filter-bar"
          >
            {/* Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#F9FAFB",
                border: "1.5px solid #E5E7EB",
                borderRadius: 12,
                padding: "0 14px",
                flex: "1 1 240px",
                maxWidth: 360,
              }}
            >
              <Search size={16} color="#9CA3AF" />
              <input
                type="text"
                placeholder="Search events, cities…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: "none",
                  background: "none",
                  outline: "none",
                  fontSize: 14,
                  color: "#111827",
                  width: "100%",
                  padding: "10px 0",
                  fontFamily: "inherit",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}
                >
                  <X size={15} color="#9CA3AF" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }} className="cat-pills">
              {CATEGORIES.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "7px 18px",
                      borderRadius: 20,
                      border: `1.5px solid ${active ? "#6D28D9" : "#E5E7EB"}`,
                      background: active ? "#6D28D9" : "#fff",
                      color: active ? "#fff" : "#374151",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      whiteSpace: "nowrap",
                      boxShadow: active ? "0 2px 8px rgba(109,40,217,0.25)" : "none",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Results count */}
            <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
              {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Events Grid ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 32px 60px" }}>
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #E5E7EB",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎭</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>No events found</h3>
            <p style={{ fontSize: 14, color: "#6B7280" }}>Try a different search or category filter.</p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              style={{
                marginTop: 20,
                padding: "10px 24px",
                background: "#6D28D9",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 22,
            }}
            className="events-page-grid"
          >
            {filtered.map((evt) => (
              <EventCard key={evt.id} evt={evt} />
            ))}
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @media (max-width: 1100px) { .events-page-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px)  { .events-page-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px)  {
          .evts-h1 { font-size: 30px !important; }
          .cat-pills { display: none !important; }
        }
      `}</style>
    </div>
  );
}
