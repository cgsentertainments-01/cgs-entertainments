"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Trophy, Calendar, MapPin, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MyEventItem {
  registration_id: string;
  registration_number: string;
  registration_status: string;
  amount: number;
  event_id: string;
  event_title: string;
  event_date: string;
  venue: string;
  city: string;
  result: {
    result_type: string;
    position?: number;
  };
}

const RESULT_BADGES: Record<string, { label: string; bg: string; color: string }> = {
  winner: { label: "🏆 Winner", bg: "#FEF3C7", color: "#B45309" },
  runner_up: { label: "🥈 Runner-up", bg: "#F1F5F9", color: "#334155" },
  finalist: { label: "🥉 Finalist", bg: "#FFEDD5", color: "#C2410C" },
  special_mention: { label: "⭐ Special Mention", bg: "#F3E8FF", color: "#6D28D9" },
  participant: { label: "👤 Participant", bg: "#EFF6FF", color: "#1D4ED8" },
  pending: { label: "⏳ Pending Review", bg: "#F8FAFC", color: "#64748B" },
};

export default function MyEventsListPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<MyEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/my-events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.myEvents || []);
        }
      } catch (e) {
        console.error("Error fetching my events:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, [user]);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 960, margin: "36px auto 64px", padding: "0 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#FEF3C7", borderRadius: 12, fontSize: 12, fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: 8 }}>
            <Trophy size={14} color="#B45309" /> Event Results & Achievements
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.5 }}>
            My Event Results
          </h1>
          <p style={{ fontSize: 15, color: "#64748B", margin: 0, fontWeight: 500 }}>
            View competition scores, winner announcements, and digital certificate statuses.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748B", fontWeight: 600 }}>Loading event results...</div>
        ) : events.length === 0 ? (
          <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: 48, textAlign: "center" }}>
            <Trophy size={40} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>No event results found</h3>
            <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>Register for events to track your results here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {events.map((evt) => {
              const badge = RESULT_BADGES[evt.result?.result_type || "pending"] || RESULT_BADGES.pending;
              return (
                <div
                  key={evt.registration_id}
                  style={{
                    background: "#ffffff",
                    borderRadius: 20,
                    border: "1.5px solid #E2E8F0",
                    padding: "24px 28px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 20,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, background: badge.bg, color: badge.color, padding: "4px 12px", borderRadius: 8 }}>
                        {badge.label}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
                      {evt.event_title}
                    </h3>

                    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", color: "#64748B", fontSize: 13.5, fontWeight: 600 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={15} color="#6D28D9" /> {evt.event_date ? new Date(evt.event_date).toLocaleDateString("en-IN") : "TBA"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={15} color="#6D28D9" /> {evt.venue}, {evt.city}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Link
                      href={`/my-events/${evt.event_id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 20px",
                        background: "#6D28D9",
                        color: "#ffffff",
                        borderRadius: 12,
                        fontSize: 13.5,
                        fontWeight: 800,
                        textDecoration: "none",
                        boxShadow: "0 4px 12px rgba(109, 40, 217, 0.2)",
                      }}
                    >
                      View Result Page <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
