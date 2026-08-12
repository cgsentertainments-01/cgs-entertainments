"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Download, ChevronRight, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const regId =
    searchParams?.get("registrationId") ||
    searchParams?.get("registration_id") ||
    searchParams?.get("id") ||
    searchParams?.get("orderId") ||
    searchParams?.get("razorpay_order_id") ||
    "";

  const [loading, setLoading] = useState(true);
  const [regData, setRegData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegistration() {
      if (!regId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/registrations/${encodeURIComponent(regId)}`);
        const data = await res.json();

        if (res.ok && data.success && data.registration) {
          setRegData(data.registration);
        } else {
          setError(data.error || "Could not fetch registration details.");
        }
      } catch (err: any) {
        console.error("Error fetching registration success:", err);
        setError("Network error fetching registration.");
      } finally {
        setLoading(false);
      }
    }

    fetchRegistration();
  }, [regId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#6B7280" }}>
          Loading confirmed registration details...
        </div>
      </div>
    );
  }

  const participantName = regData?.participants?.full_name || "Valued Participant";
  const regNumber = regData?.registration_number || regId || "CGS-REG-CONFIRMED";
  const eventTitle = regData?.events?.title || "CGS Entertainments Event";
  const eventCity = regData?.events?.city || "Hyderabad";
  const categoryName = regData?.event_categories?.name || regData?.dance_styles?.name || "Participant";
  const amountPaid = regData?.amount !== undefined ? `₹${regData.amount}` : "Paid";
  const statusBadge = (regData?.registration_status || "confirmed").toUpperCase();
  const qrToken = regData?.qr_token || regNumber;

  return (
    <div style={{ maxWidth: 720, margin: "40px auto 60px", padding: "0 24px" }}>
      <div
        style={{
          background: "#fff",
          border: "1.5px solid #E5E7EB",
          borderRadius: 24,
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Success icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#DCFCE7",
            color: "#166534",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <CheckCircle2 size={40} color="#166534" />
        </div>

        <span
          style={{
            padding: "4px 14px",
            borderRadius: 20,
            background: "#F3E8FF",
            color: "#6D28D9",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          REGISTRATION {statusBadge}
        </span>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: "14px 0 8px" }}>
          You're Registered! 🎉
        </h1>

        <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 28px", lineHeight: 1.6 }}>
          A confirmation email &amp; WhatsApp notification with your Participant Receipt and QR ID Card have been dispatched.
        </p>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "#FEF2F2",
              color: "#991B1B",
              fontSize: 13,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Live Database ID Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #6D28D9 100%)",
            borderRadius: 20,
            padding: "24px",
            color: "#fff",
            textAlign: "left",
            marginBottom: 28,
            boxShadow: "0 10px 30px rgba(109,40,217,0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#C4B5FD", fontWeight: 800 }}>CGS ENTERTAINMENTS</div>
              <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>PARTICIPANT ID CARD</div>
            </div>
            <span style={{ fontSize: 11, background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: 8, fontWeight: 800 }}>
              PASS #{regNumber}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>{participantName}</div>
              <div style={{ fontSize: 14, color: "#C4B5FD", marginTop: 2 }}>{eventTitle}</div>
              <div style={{ fontSize: 12, color: "#E0E7FF", marginTop: 6, display: "flex", gap: 12 }}>
                <span>Category: {categoryName}</span>
                <span>·</span>
                <span>Location: {eventCity}</span>
                <span>·</span>
                <span>Amount: {amountPaid}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 12,
                background: "#fff",
                padding: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              title={`Verification Token: ${qrToken}`}
            >
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm14 0h4v2h-4v-2zm0 4h2v2h-2v-2zm-4-4h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm-4-4h2v6h-2v-6zm4-12h2v2h-2V3zm-2 2h2v2h-2V5zm-2-2h2v6h-2V3z"
                  fill="#1E1B4B"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => window.print()}
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
            }}
          >
            <Download size={16} /> Print / Save Pass
          </button>
          <Link
            href="/events"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "12px 24px",
              background: "#fff",
              color: "#374151",
              border: "1.5px solid #E5E7EB",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Explore More Events <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />
      <div style={{ paddingTop: 64 }}>
        <Suspense fallback={<div style={{ textAlign: "center", padding: "60px 20px" }}>Loading confirmation...</div>}>
          <RegistrationSuccessContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
