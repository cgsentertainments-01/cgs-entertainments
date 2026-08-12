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
  short_description?: string;
  description?: string;
  status?: string;
};

export type EventData = EventType;

export function EventCard({ evt }: { evt: EventType }) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const shortDesc = evt.short_description || evt.description || "";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1.5px solid ${hovered ? "#C4B5FD" : "#E5E7EB"}`,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 20px 40px rgba(109,40,217,0.14), 0 4px 12px rgba(0,0,0,0.05)"
          : "0 1px 6px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* 4:3 Aspect Ratio Banner Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "75%", /* 4:3 Aspect Ratio */
          overflow: "hidden",
          background: "#F3F4F6",
        }}
      >
        <Image
          src={evt.img || "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=85"}
          alt={evt.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.45s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        {/* Category Badge */}
        <span
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "5px 12px",
            borderRadius: 8,
            background: evt.badgeBg || "#6D28D9",
            color: "#fff",
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: 1.1,
            textTransform: "uppercase",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            backdropFilter: "blur(4px)",
          }}
        >
          {evt.badge || "EVENT"}
        </span>
      </div>

      {/* Card Content */}
      <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
        <h3
          style={{
            fontSize: 15.5,
            fontWeight: 800,
            color: "#111827",
            margin: 0,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            height: "2.7em",
          }}
        >
          {evt.title}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#4B5563", fontWeight: 600 }}>
            <Calendar size={14} color="#6D28D9" style={{ flexShrink: 0 }} />
            {evt.date}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#4B5563", fontWeight: 600 }}>
            <MapPin size={14} color="#6D28D9" style={{ flexShrink: 0 }} />
            {evt.location}
          </span>
        </div>

        {shortDesc && (
          <p
            style={{
              fontSize: 12.5,
              color: "#6B7280",
              margin: "2px 0 0",
              lineHeight: 1.45,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {shortDesc}
          </p>
        )}

        {/* View Details Button */}
        <Link
          href={`/events/${evt.slug}`}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 0",
            marginTop: "auto",
            border: `1.5px solid ${btnHovered ? "#6D28D9" : "#DDD6FE"}`,
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 800,
            color: btnHovered ? "#fff" : "#6D28D9",
            textDecoration: "none",
            background: btnHovered ? "linear-gradient(135deg, #6D28D9, #7C3AED)" : "#fff",
            transition: "all 0.22s ease",
            boxShadow: btnHovered ? "0 4px 14px rgba(109,40,217,0.3)" : "none",
            transform: btnHovered ? "translateY(-1px)" : "translateY(0)",
          }}
        >
          View Details
          <ChevronRight size={15} style={{ transform: btnHovered ? "translateX(3px)" : "translateX(0)", transition: "transform 0.2s" }} />
        </Link>
      </div>
    </div>
  );
}

export default EventCard;
