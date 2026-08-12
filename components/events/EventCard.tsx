"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Heart, ChevronRight } from "lucide-react";

export type EventType = {
  id: string;
  title: string;
  slug: string;
  badge: string;
  badgeBg?: string;
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
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cgs_wishlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[evt.id]) setIsSaved(true);
      }
    } catch {
      // ignore
    }
  }, [evt.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = localStorage.getItem("cgs_wishlist");
      const parsed = saved ? JSON.parse(saved) : {};
      const nextState = !isSaved;
      parsed[evt.id] = nextState;
      localStorage.setItem("cgs_wishlist", JSON.stringify(parsed));
      setIsSaved(nextState);
    } catch {
      // ignore
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFFFF",
        border: `1.5px solid ${hovered ? "#C4B5FD" : "#E5E7EB"}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 12px 28px rgba(109, 40, 217, 0.12), 0 2px 8px rgba(0,0,0,0.04)"
          : "0 1px 4px rgba(0,0,0,0.03)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
          background: "#1E1B4B",
        }}
      >
        <Image
          src={
            evt.img ||
            "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=85"
          }
          alt={evt.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.4s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* Small Category Badge over image */}
        <span
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            padding: "3px 8px",
            borderRadius: 6,
            background: evt.badgeBg || "#6D28D9",
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            backdropFilter: "blur(4px)",
          }}
        >
          {evt.badge || "EVENT"}
        </span>

        {/* Small Wishlist Heart in top-right */}
        <button
          onClick={toggleWishlist}
          aria-label="Save to Wishlist"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            border: "none",
            background: isSaved ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(4px)",
            width: 30,
            height: 30,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: isSaved ? "scale(1.08)" : "scale(1)",
            zIndex: 2,
          }}
        >
          <Heart
            size={15}
            color={isSaved ? "#EF4444" : "#FFFFFF"}
            fill={isSaved ? "#EF4444" : "none"}
          />
        </button>
      </div>

      {/* Card Content - Compact padding */}
      <div
        style={{
          padding: "10px 12px 12px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: 6,
        }}
      >
        <h3
          style={{
            fontSize: 14.5,
            fontWeight: 700,
            color: "#111827",
            margin: 0,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.6em",
          }}
        >
          {evt.title}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, margin: "2px 0 4px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "#4B5563",
              fontWeight: 600,
            }}
          >
            <Calendar size={13} color="#6D28D9" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {evt.date}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "#4B5563",
              fontWeight: 600,
            }}
          >
            <MapPin size={13} color="#6D28D9" style={{ flexShrink: 0 }} />
            <span
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {evt.location}
            </span>
          </div>
        </div>

        {/* Simple Text CTA: View Details → */}
        <Link
          href={`/events/${evt.slug || evt.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            fontSize: 12.5,
            fontWeight: 700,
            color: "#6D28D9",
            textDecoration: "none",
            marginTop: "auto",
            paddingTop: 4,
            transition: "color 0.2s ease",
          }}
          className="cgs-event-card-cta"
        >
          <span>View Details</span>
          <ChevronRight size={14} style={{ transition: "transform 0.2s ease" }} className="cta-arrow-icon" />
        </Link>
      </div>

      <style jsx global>{`
        .cgs-event-card-cta:hover {
          color: #5B21B6 !important;
        }
        .cgs-event-card-cta:hover .cta-arrow-icon {
          transform: translateX(3px);
        }
      `}</style>
    </div>
  );
}

export default EventCard;

