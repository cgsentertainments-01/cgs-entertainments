"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EventCard, EventType } from "@/components/events/EventCard";

const EVENTS: EventType[] = [
  {
    id: "e1",
    title: "National Dance Championship",
    slug: "national-dance-championship",
    badge: "DANCE",
    badgeBg: "#312E81",
    date: "25 May 2026",
    location: "Hyderabad",
    img: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=700&h=480&q=85",
  },
  {
    id: "e2",
    title: "Elite Modeling Show",
    slug: "elite-modeling-show",
    badge: "MODELING",
    badgeBg: "#1D4ED8",
    date: "10 June 2026",
    location: "Bangalore",
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&h=480&q=85",
  },
  {
    id: "e3",
    title: "Acting Excellence Awards",
    slug: "acting-excellence-awards",
    badge: "ACTING",
    badgeBg: "#78350F",
    date: "18 June 2026",
    location: "Chennai",
    img: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=700&h=480&q=85",
  },
  {
    id: "e4",
    title: "Voice of India 2026",
    slug: "voice-of-india-2026",
    badge: "SINGING",
    badgeBg: "#9D174D",
    date: "30 June 2026",
    location: "Mumbai",
    img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=700&h=480&q=85",
  },
  {
    id: "e5",
    title: "Rhythm India Music Fest",
    slug: "rhythm-india-music-fest",
    badge: "MUSIC",
    badgeBg: "#065F46",
    date: "15 July 2026",
    location: "Pune",
    img: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=700&h=480&q=85",
  },
  {
    id: "e6",
    title: "Lens Masters Photography",
    slug: "lens-masters-photography",
    badge: "PHOTO",
    badgeBg: "#92400E",
    date: "22 July 2026",
    location: "Delhi",
    img: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=700&h=480&q=85",
  },
  {
    id: "e7",
    title: "South Dance Fiesta",
    slug: "south-dance-fiesta",
    badge: "DANCE",
    badgeBg: "#312E81",
    date: "5 August 2026",
    location: "Coimbatore",
    img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=700&h=480&q=85",
  },
  {
    id: "e8",
    title: "Kids Talent Hunt 2026",
    slug: "kids-talent-hunt",
    badge: "DANCE",
    badgeBg: "#6D28D9",
    date: "20 August 2026",
    location: "Hyderabad",
    img: "https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?auto=format&fit=crop&w=700&h=480&q=85",
  },
];

export function HomeUpcomingEvents() {
  return (
    <section style={{ padding: "40px 0 36px", background: "#fff", borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 4,
                height: 24,
                background: "linear-gradient(180deg,#6D28D9,#A855F7)",
                borderRadius: 99,
              }}
            />
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#111827",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              UPCOMING EVENTS
            </h2>
          </div>
          <Link
            href="/events"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 13,
              fontWeight: 700,
              color: "#6D28D9",
              textDecoration: "none",
              padding: "6px 14px",
              border: "1.5px solid #DDD6FE",
              borderRadius: 8,
            }}
            className="view-all-btn2"
          >
            View All Events <ChevronRight size={15} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }} className="evt-grid">
          {EVENTS.map((evt) => (
            <EventCard key={evt.id} evt={evt} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .evt-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px)  { .evt-grid { grid-template-columns: 1fr !important; } }
        .view-all-btn2:hover { background: #F5F3FF !important; }
      `}</style>
    </section>
  );
}
