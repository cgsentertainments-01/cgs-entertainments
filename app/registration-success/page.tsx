"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Download, ChevronRight, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ParticipantCard } from "@/components/registration/ParticipantCard";

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
  const participantNumber = regData?.participants?.participant_number || "CGS-P-REGIST";
  const regNumber = regData?.registration_number || regId || "CGS-REG-CONFIRMED";
  const eventTitle = regData?.events?.title || "CGS Entertainments Event";
  const eventDate = regData?.events?.event_date
    ? new Date(regData.events.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Event Date TBA";
  const eventCity = regData?.events?.city || "Hyderabad";
  const categoryName = regData?.event_categories?.name || regData?.dance_styles?.name || "Participant";
  const amountPaid = regData?.amount !== undefined ? `₹${regData.amount}` : "Paid";
  const statusBadge = (regData?.registration_status || "confirmed").toUpperCase();
  const qrToken = regData?.qr_token || regNumber;
  const paymentId =
    regData?.registration_payments?.[0]?.razorpay_payment_id ||
    regData?.registration_payments?.razorpay_payment_id ||
    regData?.razorpay_payment_id ||
    "pay_verified";
  const photoUrl = regData?.participants?.profile_photo;

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
            background: "#DCFCE7",
            color: "#166534",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {statusBadge === "CONFIRMED" ? "PAYMENT SUCCESSFUL 🎉" : `REGISTRATION ${statusBadge}`}
        </span>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: "14px 0 8px" }}>
          Registration Success!
        </h1>

        <p style={{ fontSize: 15, color: "#4B5563", margin: "0 0 28px", lineHeight: 1.6, fontWeight: 600 }}>
          Your event registration &amp; payment have been verified successfully.
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

        {/* Payment & Registration Details Grid */}
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 18,
            padding: "24px",
            textAlign: "left",
            marginBottom: 24,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px 24px",
            fontSize: 13.5,
          }}
        >
          <div>
            <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Registration Number</div>
            <div style={{ fontWeight: 900, color: "#6D28D9", fontSize: 15, marginTop: 2 }}>{regNumber}</div>
          </div>
          <div>
            <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Participant ID</div>
            <div style={{ fontWeight: 900, color: "#0F172A", fontSize: 15, marginTop: 2 }}>{participantNumber}</div>
          </div>
          <div>
            <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Participant Name</div>
            <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 14, marginTop: 2 }}>{participantName}</div>
          </div>
          <div>
            <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Category</div>
            <div style={{ fontWeight: 800, color: "#6D28D9", fontSize: 14, marginTop: 2 }}>{categoryName}</div>
          </div>
          <div>
            <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Payment Status</div>
            <div style={{ fontWeight: 800, color: "#059669", fontSize: 14, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }}></span> Paid
            </div>
          </div>
          <div>
            <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Razorpay Payment ID</div>
            <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 13, marginTop: 2, fontFamily: "monospace" }}>{paymentId}</div>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Registration Fee Paid</div>
            <div style={{ fontWeight: 900, color: "#059669", fontSize: 20, marginTop: 2 }}>{amountPaid}</div>
          </div>
        </div>

        {/* Live Scannable Participant ID Card */}
        <div style={{ marginBottom: 28 }}>
          <ParticipantCard
            registrationNumber={regNumber}
            participantName={participantName}
            eventTitle={eventTitle}
            categoryName={categoryName}
            eventDate={eventDate}
            location={eventCity}
            amountPaid={regData?.amount !== undefined && Number(regData.amount) === 0 ? "₹0 (Free)" : amountPaid}
            paymentId={Number(regData?.amount) === 0 ? "N/A (Free Registration)" : paymentId}
            paymentStatus={Number(regData?.amount) === 0 ? "FREE REGISTRATION" : (regData?.payment_status || "PAID").toUpperCase()}
            registrationStatus={statusBadge}
            qrToken={qrToken}
            photoUrl={photoUrl}
            showScanLabel={true}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/my-registrations"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              background: "#6D28D9",
              color: "#fff",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            View Registration
          </Link>
          <button
            onClick={() => window.print()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              background: "#F3E8FF",
              color: "#6D28D9",
              border: "1.5px solid #C4B5FD",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <Download size={16} /> Download Receipt
          </button>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "12px 22px",
              background: "#fff",
              color: "#374151",
              border: "1.5px solid #E5E7EB",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Back to Home <ChevronRight size={16} />
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
