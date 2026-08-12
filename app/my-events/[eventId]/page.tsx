"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Trophy,
  Calendar,
  MapPin,
  CheckCircle2,
  Video,
  Award,
  ArrowLeft,
  Sparkles,
  Play,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MyEventDetail {
  registration_id: string;
  registration_number: string;
  registration_status: string;
  payment_status: string;
  amount: number;
  registration_date: string;
  participant_name: string;
  video_url?: string | null;

  event_id: string;
  event_title: string;
  event_slug: string;
  event_date: string;
  venue: string;
  city: string;
  status: string;

  result: {
    id?: string;
    result_type: "winner" | "runner_up" | "finalist" | "special_mention" | "participant" | "pending";
    position?: number;
    selected_at?: string;
    notes?: string;
  };
}

const RESULT_BADGE_MAP: Record<string, { label: string; badge: string; bg: string; color: string; desc: string }> = {
  winner: {
    label: "Winner",
    badge: "🏆 Winner",
    bg: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
    color: "#B45309",
    desc: "1st Place Winner - Outstanding Performance Award",
  },
  runner_up: {
    label: "Runner-up",
    badge: "🥈 Runner-up",
    bg: "linear-gradient(135deg, #F1F5F9, #E2E8F0)",
    color: "#334155",
    desc: "1st Runner-Up Award",
  },
  finalist: {
    label: "Finalist",
    badge: "🥉 Finalist",
    bg: "linear-gradient(135deg, #FFEDD5, #FED7AA)",
    color: "#C2410C",
    desc: "Official Contest Finalist",
  },
  special_mention: {
    label: "Special Mention",
    badge: "⭐ Special Mention",
    bg: "linear-gradient(135deg, #F3E8FF, #E9D5FF)",
    color: "#6D28D9",
    desc: "Jury Special Mention Award",
  },
  participant: {
    label: "Participant",
    badge: "👤 Participant",
    bg: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
    color: "#1D4ED8",
    desc: "Verified Event Participant",
  },
  pending: {
    label: "Pending Review",
    badge: "⏳ Under Review",
    bg: "linear-gradient(135deg, #F8FAFC, #F1F5F9)",
    color: "#64748B",
    desc: "Performance submission is currently under jury review.",
  },
};

export default function UserEventResultPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;
  const { user } = useAuth();

  const [eventItem, setEventItem] = useState<MyEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventResult = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/my-events");
        if (res.ok) {
          const data = await res.json();
          const items: MyEventDetail[] = data.myEvents || [];
          const found = items.find((item) => item.event_id === eventId || item.event_slug === eventId);
          setEventItem(found || null);
        }
      } catch (err) {
        console.error("Error fetching user event result:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventResult();
  }, [eventId, user]);

  const resMeta = RESULT_BADGE_MAP[eventItem?.result?.result_type || "pending"] || RESULT_BADGE_MAP.pending;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: "36px auto 64px", padding: "0 24px" }}>
        <Link
          href="/my-registrations"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            fontWeight: 800,
            color: "#6D28D9",
            textDecoration: "none",
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={16} /> Back to My Registrations
        </Link>

        {loading ? (
          <div style={{ padding: 64, textAlign: "center", color: "#64748B", fontWeight: 600 }}>
            Loading event result...
          </div>
        ) : !eventItem ? (
          <div style={{ background: "#fff", padding: 48, borderRadius: 20, textAlign: "center", border: "1px solid #E2E8F0" }}>
            <Trophy size={40} color="#94A3B8" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>Event Result Record</h3>
            <p style={{ fontSize: 14, color: "#64748B" }}>
              Registered events and verified results will be listed here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Event Header Banner Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #1E1B4B, #4C1D95)",
                borderRadius: 24,
                padding: "32px 36px",
                color: "#ffffff",
                boxShadow: "0 20px 50px rgba(76, 29, 149, 0.25)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "rgba(255,255,255,0.15)", borderRadius: 10, fontSize: 12, fontWeight: 900, textTransform: "uppercase", marginBottom: 10 }}>
                    <Sparkles size={14} color="#FBBF24" /> Official Result Card
                  </div>
                  <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 10px", letterSpacing: -0.5 }}>
                    {eventItem.event_title}
                  </h1>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 14, color: "#E9D5FF", fontWeight: 600 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Calendar size={16} color="#A78BFA" /> {eventItem.event_date ? new Date(eventItem.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={16} color="#A78BFA" /> {eventItem.venue}, {eventItem.city}
                    </span>
                  </div>
                </div>

                {/* Participation Status Tag */}
                <div style={{ background: "rgba(255,255,255,0.1)", padding: "10px 18px", borderRadius: 14, backdropFilter: "blur(10px)", textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#C084FC" }}>Participation Status</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#4ADE80", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={16} /> Completed
                  </div>
                </div>
              </div>
            </div>

            {/* Result Badge Section */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 24,
                border: "1.5px solid #E2E8F0",
                padding: "32px 36px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                Official Competition Result
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div
                  style={{
                    background: resMeta.bg,
                    color: resMeta.color,
                    padding: "16px 28px",
                    borderRadius: 20,
                    fontSize: 24,
                    fontWeight: 900,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {resMeta.badge}
                </div>

                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#0F172A" }}>
                    {resMeta.desc}
                  </div>
                  {eventItem.result.notes && (
                    <div style={{ fontSize: 14, color: "#475569", marginTop: 4, fontStyle: "italic" }}>
                      "{eventItem.result.notes}"
                    </div>
                  )}
                  {eventItem.result.selected_at && (
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4, fontWeight: 600 }}>
                      Result Date: {new Date(eventItem.result.selected_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance & Certificate Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Performance Section */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  border: "1.5px solid #E2E8F0",
                  padding: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Video size={20} color="#6D28D9" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>Performance Submission</h3>
                    <div style={{ fontSize: 12, color: "#64748B" }}>Participant: {eventItem.participant_name}</div>
                  </div>
                </div>

                {eventItem.video_url ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setPlayingVideo(eventItem.video_url || null)}
                      style={{
                        width: "100%",
                        padding: "12px 18px",
                        background: "#6D28D9",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Play size={16} fill="#fff" /> View Performance Video
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic", background: "#F8FAFC", padding: 14, borderRadius: 12, textAlign: "center" }}>
                    No performance video link uploaded
                  </div>
                )}
              </div>

              {/* Certificate Section (Future Integration Ready) */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  border: "1.5px solid #E2E8F0",
                  padding: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Award size={20} color="#D97706" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>Digital Certificate</h3>
                    <div style={{ fontSize: 12, color: "#64748B" }}>Official Merit & Participation</div>
                  </div>
                </div>

                <div style={{ background: "#FEF3C7", padding: "14px 18px", borderRadius: 14, border: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: 10 }}>
                  <Clock size={20} color="#B45309" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#B45309" }}>Certificate: Available Soon</div>
                    <div style={{ fontSize: 12, color: "#92400E", marginTop: 2 }}>Digital certificate generation for this result is being generated.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
