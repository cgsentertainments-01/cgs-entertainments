"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Heart, ChevronRight, Clock } from "lucide-react";
import { getEventLifecycleStatus, LifecycleInfo, isUpcomingEvent as checkIsUpcoming } from "@/lib/event-lifecycle";

export type EventType = {
  id: string;
  title: string;
  slug: string;
  badge: string;
  badgeBg?: string;
  category?: string;
  date: string;
  location: string;
  img: string;
  short_description?: string;
  description?: string;
  status?: string;
  event_type?: string;
  lifecycle?: LifecycleInfo;
  is_published?: boolean;
  registration_start_date?: string;
  registration_deadline?: string;
  event_date?: string;
  event_end_date?: string;
  form_config?: any;
  prize_pool?: string;
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

  const lc = evt.lifecycle || getEventLifecycleStatus(evt);
  const isUpcomingEvent = checkIsUpcoming(evt) || lc.status === "COMING_SOON";
  const partTypes = evt.form_config?.participationTypes || [];
  const partTypesSummary = !isUpcomingEvent && partTypes.length > 0 ? partTypes.map((p: any) => p.name).join(", ") : null;

  const regStartFormatted = evt.registration_start_date
    ? new Date(evt.registration_start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFFFF",
        border: `1.5px solid ${hovered ? (isUpcomingEvent ? "#93C5FD" : "#C4B5FD") : "#E5E7EB"}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered
          ? isUpcomingEvent
            ? "0 12px 28px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0,0,0,0.04)"
            : "0 12px 28px rgba(109, 40, 217, 0.12), 0 2px 8px rgba(0,0,0,0.04)"
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
          paddingTop: "70%",
          overflow: "hidden",
          background: "#1E1B4B",
        }}
      >
        {evt.img ? (
          <Image
            src={evt.img}
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
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #1E1B4B 0%, #4C1D95 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        )}
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
            background: isUpcomingEvent ? "#2563EB" : (evt.badgeBg || "#6D28D9"),
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            backdropFilter: "blur(4px)",
          }}
        >
          {evt.badge || evt.category || "EVENT"}
        </span>

        {/* Status Badge in bottom-left over image */}
        <span
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            padding: "3px 8px",
            borderRadius: 6,
            background: isUpcomingEvent ? "#EFF6FF" : lc.badgeBg,
            color: isUpcomingEvent ? "#2563EB" : lc.badgeColor,
            border: `1px solid ${isUpcomingEvent ? "#BFDBFE" : lc.badgeBorder}`,
            fontSize: 10.5,
            fontWeight: 900,
            letterSpacing: 0.3,
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            backdropFilter: "blur(4px)",
          }}
        >
          {isUpcomingEvent ? "COMING SOON" : lc.label}
        </span>

        {/* Wishlist Heart */}
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

      {/* Card Content */}
      <div
        style={{
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: 6,
        }}
      >
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#111827",
            margin: 0,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.5em",
          }}
        >
          {evt.title}
        </h3>

        {(evt.short_description || evt.description) && (
          <p
            style={{
              fontSize: 12,
              color: "#6B7280",
              margin: 0,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {evt.short_description || evt.description}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" }}>
          {evt.date && evt.date.toLowerCase() !== "tba 2026" && (
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
              <Calendar size={13} color={isUpcomingEvent ? "#2563EB" : "#6D28D9"} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {evt.date}
              </span>
            </div>
          )}

          {evt.location && evt.location.toLowerCase() !== "venue tba, hyderabad" && (
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
              <MapPin size={13} color={isUpcomingEvent ? "#2563EB" : "#6D28D9"} style={{ flexShrink: 0 }} />
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
          )}

          {/* Registration Opening Date if configured */}
          {!isUpcomingEvent && lc.status === "COMING_SOON" && regStartFormatted && (
            <div style={{ fontSize: 11.5, color: "#6D28D9", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={12} color="#6D28D9" />
              <span>Reg Opens: {regStartFormatted}</span>
            </div>
          )}

          {/* Competition types summary if configured (Hide for Upcoming Events) */}
          {!isUpcomingEvent && partTypesSummary && (
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
              Options: {partTypesSummary}
            </div>
          )}
        </div>

        {/* Action Link: View Details / Coming Soon (Do NOT show Register Now for Upcoming Events) */}
        <Link
          href={`/events/${evt.slug || evt.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12.5,
            fontWeight: 800,
            color: isUpcomingEvent ? "#2563EB" : (lc.ctaEnabled ? "#6D28D9" : "#475569"),
            textDecoration: "none",
            marginTop: "auto",
            paddingTop: 8,
            borderTop: "1px solid #F3F4F6",
            transition: "color 0.2s ease",
          }}
          className="cgs-event-card-cta"
        >
          <span>{isUpcomingEvent ? "Coming Soon" : lc.ctaText}</span>
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
