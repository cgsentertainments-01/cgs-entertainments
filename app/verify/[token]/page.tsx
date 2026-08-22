"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Calendar,
  MapPin,
  Ticket,
  CreditCard,
  User,
  ArrowLeft,
  RefreshCw,
  Award,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ParticipantCard } from "@/components/registration/ParticipantCard";

interface VerificationData {
  verified: boolean;
  status?: string;
  error?: string;
  registration?: {
    id: string;
    registration_number: string;
    registration_status: string;
    registration_date: string;
    amount: number;
    is_free: boolean;
    payment_status: string;
    payment_id: string;
    qr_token: string;
    participant: {
      id?: string;
      participant_number?: string;
      full_name: string;
      email?: string;
      phone?: string;
      city?: string;
      state?: string;
      photo_url?: string | null;
    };
    event: {
      id?: string;
      title: string;
      slug?: string;
      event_date?: string;
      venue?: string;
      address?: string;
      city?: string;
      state?: string;
      banner_image?: string;
    };
    category: string;
  };
}

export default function VerifyParticipantPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerificationData | null>(null);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setLoading(false);
        setData({
          verified: false,
          error: "No verification token supplied.",
        });
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/verify/${encodeURIComponent(token)}`);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("Verification fetch error:", err);
        setData({
          verified: false,
          error: "Network error verifying participant.",
        });
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  const reg = data?.registration;
  const isVerified = data?.verified === true;

  const eventDateFormatted = reg?.event?.event_date
    ? new Date(reg.event.event_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Event Date TBA";

  const locationFormatted = reg?.event?.venue && reg?.event?.city
    ? `${reg.event.venue}, ${reg.event.city}`
    : reg?.event?.city || reg?.event?.venue || "Venue TBA";

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Navbar />

      <div style={{ maxWidth: 760, margin: "40px auto 60px", padding: "0 20px" }}>
        {/* Header Branding */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              background: "#F3E8FF",
              borderRadius: 20,
              color: "#6D28D9",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <ShieldCheck size={16} color="#6D28D9" /> CGS ENTERTAINMENTS
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#0F172A",
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            PARTICIPANT VERIFICATION
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: "6px 0 0", fontWeight: 500 }}>
            Official Live Verification Portal
          </p>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1.5px solid #E2E8F0",
              padding: "60px 24px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: "4px solid #F3E8FF",
                borderTopColor: "#6D28D9",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <div style={{ fontSize: 16, fontWeight: 700, color: "#475569" }}>
              Verifying participant credential with database...
            </div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── VERIFIED PARTICIPANT STATUS ── */}
        {!loading && isVerified && reg && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1.5px solid #10B981",
              boxShadow: "0 8px 32px rgba(16,185,129,0.12)",
              overflow: "hidden",
            }}
          >
            {/* Banner Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                padding: "24px 28px",
                color: "#FFFFFF",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <CheckCircle2 size={36} color="#FFFFFF" />
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  background: "rgba(255,255,255,0.25)",
                  padding: "4px 14px",
                  borderRadius: 20,
                }}
              >
                ✓ VERIFIED PARTICIPANT
              </div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>
                {reg.participant.full_name}
              </div>
            </div>

            {/* Verification Content Body */}
            <div style={{ padding: "32px 28px" }}>
              {/* Grid of Key Details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "18px 24px",
                  background: "#F8FAFC",
                  padding: "24px",
                  borderRadius: 18,
                  border: "1px solid #E2E8F0",
                  marginBottom: 28,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Participant Name
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                    <User size={16} color="#6D28D9" /> {reg.participant.full_name}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Registration ID
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#6D28D9", marginTop: 2, fontFamily: "monospace" }}>
                    {reg.registration_number}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Event Name
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                    {reg.event.title}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Participant Category
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <Award size={15} color="#6D28D9" /> {reg.category}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Event Date
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={15} color="#6D28D9" /> {eventDateFormatted}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Location
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={15} color="#6D28D9" /> {locationFormatted}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Amount Paid
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#059669", marginTop: 2 }}>
                    {reg.is_free ? "₹0 (Free)" : `₹${reg.amount}`}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Payment Status
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <CreditCard size={15} color="#6D28D9" /> {reg.payment_status}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Payment ID
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginTop: 2, fontFamily: "monospace" }}>
                    {reg.payment_id}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Registration Status
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#059669", marginTop: 2 }}>
                    {reg.registration_status}
                  </div>
                </div>
              </div>

              {/* Render Full Participant Card */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                  Verified Pass Holder Preview
                </div>
                <ParticipantCard
                  registrationNumber={reg.registration_number}
                  participantName={reg.participant.full_name}
                  eventTitle={reg.event.title}
                  categoryName={reg.category}
                  eventDate={eventDateFormatted}
                  location={reg.event.city || "Hyderabad"}
                  amountPaid={reg.is_free ? "₹0 (Free)" : `₹${reg.amount}`}
                  paymentId={reg.payment_id}
                  paymentStatus={reg.payment_status}
                  registrationStatus={reg.registration_status}
                  qrToken={reg.qr_token}
                  photoUrl={reg.participant.photo_url}
                  showScanLabel={true}
                />
              </div>

              <div style={{ textAlign: "center" }}>
                <Link
                  href="/"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 24px",
                    background: "#F3E8FF",
                    color: "#6D28D9",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  <ArrowLeft size={16} /> Back to CGS Home
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── INVALID PARTICIPANT STATUS ── */}
        {!loading && !isVerified && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1.5px solid #FCA5A5",
              boxShadow: "0 8px 32px rgba(220,38,38,0.08)",
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#FEF2F2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                border: "2px solid #FCA5A5",
              }}
            >
              <XCircle size={44} color="#DC2626" />
            </div>

            <span
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                background: "#FEF2F2",
                color: "#DC2626",
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              ❌ INVALID PARTICIPANT
            </span>

            <h2
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#0F172A",
                margin: "18px 0 10px",
              }}
            >
              Verification Failed
            </h2>

            <p
              style={{
                fontSize: 15,
                color: "#64748B",
                margin: "0 auto 28px",
                maxWidth: 440,
                lineHeight: 1.6,
                fontWeight: 600,
              }}
            >
              {data?.error || "Unable to verify this participant. The QR code is invalid or no longer active."}
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 22px",
                  background: "#6D28D9",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={16} /> Retry Verification
              </button>

              <Link
                href="/admin/scan"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 22px",
                  background: "#F3E8FF",
                  color: "#6D28D9",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Open Admin Scanner
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
