"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Calendar } from "lucide-react";
import { EventCard, EventType } from "@/components/events/EventCard";

export function HomeUpcomingEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events?upcoming=true", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to fetch upcoming events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();

    const handleFocus = () => fetchUpcomingEvents();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

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

        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 18,
            }}
            className="evt-grid"
          >
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                style={{
                  height: 310,
                  background: "#F9FAFB",
                  borderRadius: 18,
                  border: "1.5px solid #E5E7EB",
                  animation: "pulse 1.5s infinite ease-in-out",
                }}
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "#FAF5FF",
              borderRadius: 20,
              border: "1.5px dashed #DDD6FE",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#EDE9FE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Calendar size={28} color="#6D28D9" />
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#111827",
                margin: "0 0 6px",
              }}
            >
              No upcoming events at the moment.
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#6B7280",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Stay tuned for our upcoming events!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }} className="evt-grid">
            {events.map((evt) => (
              <EventCard key={evt.id} evt={evt} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 639px) {
          .evt-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .evt-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 14px !important;
          }
        }
        @media (min-width: 1024px) {
          .evt-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }
        }
        .view-all-btn2:hover { background: #F5F3FF !important; }
      `}</style>
    </section>
  );
}
