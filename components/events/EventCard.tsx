"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ChevronRight } from "lucide-react";

export type EventType = {
  id: string;
  title: string;
  slug: string;
  badge: string;
  badgeBg: string;
  date: string;
  location: string;
  img: string;
};

export type EventData = EventType;

export function EventCard({ evt }: { evt: EventType }) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1.5px solid ${hovered ? "#DDD6FE" : "#E5E7EB"}`,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 20px 48px rgba(109,40,217,0.15), 0 4px 12px rgba(0,0,0,0.06)"
          : "0 1px 6px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Banner image */}
      <div style={{ position: "relative", width: "100%", paddingTop: "64%", overflow: "hidden", background: "#F3F4F6" }}>
        <Image
          src={evt.img}
          alt={evt.title}
          fill
          sizes="(max-width:768px) 100vw, 25vw"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.45s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)",
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            padding: "5px 11px",
            borderRadius: 7,
            background: evt.badgeBg,
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            backdropFilter: "blur(4px)",
          }}
        >
          {evt.badge}
        </span>
      </div>

      {/* Card content */}
      <div style={{ padding: "16px 16px 18px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.4 }}>
          {evt.title}
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
            <Calendar size={13} color="#6D28D9" />
            {evt.date}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
            <MapPin size={13} color="#6D28D9" />
            {evt.location}
          </span>
        </div>

        {/* View details button */}
        <Link
          href={`/events/${evt.slug}`}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "9px 0",
            marginTop: "auto",
            border: `1.5px solid ${btnHovered ? "#6D28D9" : "#DDD6FE"}`,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            color: btnHovered ? "#fff" : "#6D28D9",
            textDecoration: "none",
            background: btnHovered ? "linear-gradient(135deg, #6D28D9, #7C3AED)" : "#fff",
            transition: "all 0.22s ease",
            boxShadow: btnHovered ? "0 4px 14px rgba(109,40,217,0.3)" : "none",
            transform: btnHovered ? "translateY(-1px)" : "translateY(0)",
          }}
        >
          View Details
          {btnHovered && <ChevronRight size={14} />}
        </Link>
      </div>
    </div>
  );
}

export default EventCard;
