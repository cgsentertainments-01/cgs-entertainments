"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Ticket,
  Calendar,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Compass,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegistrationRecord {
  id: string;
  registration_number: string;
  registration_status: string;
  payment_status: string;
  amount: number;
  registration_date: string;
  event: {
    id: string;
    title: string;
    slug: string;
    event_date?: string;
    venue?: string;
    city?: string;
    address?: string;
  } | null;
  category: { name: string } | null;
}

// ─── Status helpers ────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "confirmed" || s === "completed") {
    return { icon: <CheckCircle2 size={14} />, label: "Confirmed", color: "#16A34A", bg: "rgba(22,163,74,0.08)" };
  }
  if (s === "cancelled" || s === "rejected") {
    return { icon: <XCircle size={14} />, label: s === "cancelled" ? "Cancelled" : "Rejected", color: "#DC2626", bg: "rgba(220,38,38,0.08)" };
  }
  if (s === "payment_pending") {
    return { icon: <AlertCircle size={14} />, label: "Payment Pending", color: "#D97706", bg: "rgba(217,119,6,0.08)" };
  }
  return { icon: <Clock size={14} />, label: "Pending", color: "#6D28D9", bg: "rgba(109,40,217,0.08)" };
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Date TBA";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Date TBA";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "Date TBA";
  }
}

function formatAmount(amount: number): string {
  if (!amount || amount === 0) return "Free";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function RegistrationSkeleton() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1.5px solid #E2E8F0",
        padding: "24px 28px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
      }}
      className="reg-skeleton-card"
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <div className="skeleton-bar" style={{ width: 120, height: 22, borderRadius: 8, marginBottom: 12 }} />
        <div className="skeleton-bar" style={{ width: "80%", height: 26, borderRadius: 8, marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 16 }}>
          <div className="skeleton-bar" style={{ width: 100, height: 18, borderRadius: 6 }} />
          <div className="skeleton-bar" style={{ width: 140, height: 18, borderRadius: 6 }} />
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="skeleton-bar" style={{ width: 90, height: 16, borderRadius: 6, marginBottom: 8, marginLeft: "auto" }} />
        <div className="skeleton-bar" style={{ width: 70, height: 32, borderRadius: 8, marginBottom: 12, marginLeft: "auto" }} />
        <div className="skeleton-bar" style={{ width: 110, height: 36, borderRadius: 12, marginLeft: "auto" }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MyRegistrationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetchRegistrations = useCallback(async () => {
    if (!user?.email) return;

    setFetchState("loading");
    setErrorMessage("");

    try {
      const supabase = createClient();

      // Step 1: find participant by the authenticated user's email
      const { data: participantData, error: partError } = await supabase
        .from("participants")
        .select("id")
        .eq("email", user.email.trim().toLowerCase())
        .maybeSingle();

      if (partError) {
        console.error("Error fetching participant:", partError.message);
        setErrorMessage("Could not fetch your participant record. Please try again.");
        setFetchState("error");
        return;
      }

      // No participant record → no registrations
      if (!participantData) {
        setRegistrations([]);
        setFetchState("success");
        return;
      }

      // Step 2: fetch registrations for this participant, joining events & categories
      const { data: regData, error: regError } = await supabase
        .from("registrations")
        .select(`
          id,
          registration_number,
          registration_status,
          payment_status,
          amount,
          registration_date,
          event:events (
            id,
            title,
            slug,
            event_date,
            venue,
            city,
            address
          ),
          category:event_categories (
            name
          )
        `)
        .eq("participant_id", participantData.id)
        .order("registration_date", { ascending: false });

      if (regError) {
        console.error("Error fetching registrations:", regError.message);
        setErrorMessage("Could not load your registrations. Please try again.");
        setFetchState("error");
        return;
      }

      setRegistrations((regData as unknown as RegistrationRecord[]) || []);
      setFetchState("success");
    } catch (err: any) {
      console.error("Unexpected error fetching registrations:", err);
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      setFetchState("error");
    }
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!authLoading && user) {
      fetchRegistrations();
    }
  }, [authLoading, user, fetchRegistrations, router]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: "36px auto 64px", padding: "0 24px" }}>
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background: "#F3E8FF",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 800,
              color: "#6D28D9",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            <Ticket size={14} color="#6D28D9" /> Participant Pass Holder
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#0F172A",
              margin: "0 0 6px",
              letterSpacing: -0.5,
            }}
          >
            My Competition Registrations
          </h1>
          <p style={{ fontSize: 15, color: "#64748B", margin: 0, fontWeight: 500 }}>
            View your registered event tickets, schedules, and entry passes.
          </p>
        </div>

        {/* ── Loading State ── */}
        {(fetchState === "idle" || fetchState === "loading" || authLoading) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <RegistrationSkeleton />
            <RegistrationSkeleton />
            <RegistrationSkeleton />
          </div>
        )}

        {/* ── Error State ── */}
        {fetchState === "error" && (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #FCA5A5",
              padding: "40px 32px",
              textAlign: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                background: "rgba(239,68,68,0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <AlertCircle size={28} color="#DC2626" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
              Something went wrong
            </h3>
            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
              {errorMessage || "Unable to load your registrations. Please try again."}
            </p>
            <button
              onClick={fetchRegistrations}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                background: "#6D28D9",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#5B21B6")}
              onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#6D28D9")}
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {fetchState === "success" && registrations.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #E2E8F0",
              padding: "60px 32px",
              textAlign: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                background: "linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 4px 16px rgba(109,40,217,0.12)",
              }}
            >
              <Ticket size={32} color="#6D28D9" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
              No registrations yet
            </h3>
            <p style={{ fontSize: 15, color: "#64748B", margin: "0 0 28px", maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
              You haven't registered for any events yet. Explore upcoming competitions and secure your spot!
            </p>
            <Link
              href="/events"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 26px",
                background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                color: "#fff",
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(109,40,217,0.25)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 20px rgba(109,40,217,0.35)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(109,40,217,0.25)";
              }}
            >
              <Compass size={17} /> Explore Events
            </Link>
          </div>
        )}

        {/* ── Registrations List ── */}
        {fetchState === "success" && registrations.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {registrations.map((reg) => {
              const badge = statusBadge(reg.registration_status);
              const eventTitle = reg.event?.title || "Untitled Event";
              const eventSlug = reg.event?.slug || reg.event?.id || "";
              const categoryName = reg.category?.name || "Event";
              const eventDate = reg.event?.event_date;
              const venue =
                reg.event?.venue && reg.event?.city
                  ? `${reg.event.venue}, ${reg.event.city}`
                  : reg.event?.city || reg.event?.venue || "Venue TBA";

              return (
                <div
                  key={reg.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: 20,
                    border: "1.5px solid #E2E8F0",
                    padding: "24px 28px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 20,
                    flexWrap: "wrap",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                  }}
                  className="reg-card"
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(109,40,217,0.10)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#C4B5FD";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.03)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#E2E8F0";
                  }}
                >
                  {/* Left: Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 900,
                          background: "#6D28D9",
                          color: "#fff",
                          padding: "3px 10px",
                          borderRadius: 8,
                          textTransform: "uppercase",
                        }}
                      >
                        {categoryName}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: badge.color,
                          background: badge.bg,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 10px",
                          borderRadius: 8,
                        }}
                      >
                        {badge.icon} {badge.label}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: 19,
                        fontWeight: 900,
                        color: "#0F172A",
                        margin: "0 0 10px",
                        lineHeight: 1.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                      title={eventTitle}
                    >
                      {eventTitle}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        flexWrap: "wrap",
                        color: "#64748B",
                        fontSize: 13.5,
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={15} color="#6D28D9" />
                        {formatDate(eventDate)}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={15} color="#6D28D9" />
                        {venue}
                      </span>
                    </div>
                  </div>

                  {/* Right: Pass ID + Amount + Button */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700, marginBottom: 2 }}>
                      Pass ID
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#475569",
                        fontWeight: 800,
                        fontFamily: "monospace",
                        marginBottom: 6,
                      }}
                    >
                      {reg.registration_number}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: "#6D28D9",
                        margin: "0 0 12px",
                      }}
                    >
                      {formatAmount(reg.amount)}
                    </div>
                    {eventSlug ? (
                      <Link
                        href={`/events/${eventSlug}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          background: "#F3E8FF",
                          color: "#6D28D9",
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 800,
                          textDecoration: "none",
                          transition: "background 0.15s",
                        }}
                        onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#EDE9FE")}
                        onMouseOut={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#F3E8FF")}
                      >
                        View Details <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <Link
                        href="/events"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          background: "#F3E8FF",
                          color: "#6D28D9",
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 800,
                          textDecoration: "none",
                        }}
                      >
                        View Events <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-bar {
          background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
          display: block;
        }
        @media (max-width: 768px) {
          .reg-card {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .reg-card > div:last-child {
            text-align: left !important;
          }
          .reg-skeleton-card {
            flex-direction: column !important;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
}
