"use client";

import React, { useEffect, useState } from "react";
import { generateQRCodeDataURL, getVerificationUrl } from "@/lib/qr";
import { User, QrCode } from "lucide-react";

export interface ParticipantCardProps {
  registrationNumber: string;
  participantName: string;
  eventTitle: string;
  categoryName?: string;
  eventDate?: string;
  location?: string;
  amountPaid?: string | number;
  paymentId?: string;
  paymentStatus?: string;
  registrationStatus?: string;
  qrToken?: string;
  photoUrl?: string | null;
  showScanLabel?: boolean;
  className?: string;
  compact?: boolean;
}

export function ParticipantCard({
  registrationNumber,
  participantName,
  eventTitle,
  categoryName = "Participant",
  eventDate = "Date TBA",
  location = "Hyderabad",
  amountPaid = "₹0",
  paymentId,
  paymentStatus,
  registrationStatus = "CONFIRMED",
  qrToken,
  photoUrl,
  showScanLabel = true,
  className = "",
  compact = false,
}: ParticipantCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const reference = qrToken || registrationNumber;

  useEffect(() => {
    let isMounted = true;
    async function loadQR() {
      if (!reference) return;
      const targetUrl = getVerificationUrl(reference);
      const dataUrl = await generateQRCodeDataURL(targetUrl);
      if (isMounted) {
        setQrCodeUrl(dataUrl);
      }
    }
    loadQR();
    return () => {
      isMounted = false;
    };
  }, [reference]);

  const formattedAmount =
    typeof amountPaid === "number"
      ? amountPaid === 0
        ? "₹0 (Free)"
        : `₹${amountPaid}`
      : amountPaid;

  const targetVerificationUrl = getVerificationUrl(reference);

  return (
    <div
      className={`participant-id-card ${className}`}
      style={{
        background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #6D28D9 100%)",
        borderRadius: compact ? 16 : 22,
        padding: compact ? "20px" : "28px",
        color: "#ffffff",
        textAlign: "left",
        boxShadow: "0 12px 36px rgba(109,40,217,0.32)",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      {/* Background Decorative Accent */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,181,253,0.15) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Bar: Brand & Pass Tag */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: compact ? 14 : 20,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          paddingBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#C4B5FD", fontWeight: 800, textTransform: "uppercase" }}>
            CGS ENTERTAINMENTS
          </div>
          <div style={{ fontSize: compact ? 16 : 19, fontWeight: 900, marginTop: 2, letterSpacing: -0.3 }}>
            OFFICIAL PARTICIPANT PASS
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              fontSize: 11,
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(4px)",
              padding: "5px 12px",
              borderRadius: 20,
              fontWeight: 800,
              fontFamily: "monospace",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "inline-block",
            }}
          >
            PASS #{registrationNumber || "CGS-REG-CONFIRMED"}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          display: "flex",
          gap: compact ? 16 : 24,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {/* Left: Participant Photo & Info */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", flex: 1, minWidth: 220 }}>
          {/* Profile Photo if exists */}
          {photoUrl ? (
            <div
              style={{
                width: compact ? 56 : 68,
                height: compact ? 56 : 68,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #C4B5FD",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                flexShrink: 0,
                background: "#312E81",
              }}
            >
              {/* eslint-disable-next-img-element */}
              <img
                src={photoUrl}
                alt={participantName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <div
              style={{
                width: compact ? 48 : 56,
                height: compact ? 48 : 56,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
                flexShrink: 0,
              }}
            >
              <User size={compact ? 24 : 28} color="#C4B5FD" />
            </div>
          )}

          {/* Details */}
          <div>
            <div
              style={{
                fontSize: compact ? 17 : 20,
                fontWeight: 900,
                color: "#FFFFFF",
                lineHeight: 1.2,
                margin: "0 0 4px",
              }}
            >
              {participantName}
            </div>
            <div style={{ fontSize: compact ? 13 : 15, color: "#C4B5FD", fontWeight: 700, margin: "0 0 8px" }}>
              {eventTitle}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#E0E7FF",
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
                fontWeight: 600,
              }}
            >
              <span style={{ background: "rgba(255,255,255,0.12)", padding: "2px 8px", borderRadius: 6 }}>
                {categoryName}
              </span>
              <span>•</span>
              <span>{location}</span>
              <span>•</span>
              <span>{eventDate}</span>
            </div>
          </div>
        </div>

        {/* Right: Real Scannable QR Code */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: compact ? 80 : 96,
              height: compact ? 80 : 96,
              borderRadius: 14,
              background: "#FFFFFF",
              padding: compact ? 6 : 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              border: "2px solid #FFFFFF",
            }}
            title={`Scan to verify: ${targetVerificationUrl}`}
          >
            {qrCodeUrl ? (
              /* eslint-disable-next-img-element */
              <img
                src={qrCodeUrl}
                alt={`Verification QR Code for ${registrationNumber}`}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#312E81" }}>
                <QrCode size={32} />
                <span style={{ fontSize: 9, fontWeight: 700, marginTop: 4 }}>Loading...</span>
              </div>
            )}
          </div>

          {showScanLabel && (
            <div
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: 1.2,
                color: "#C4B5FD",
                marginTop: 6,
                textTransform: "uppercase",
                background: "rgba(0,0,0,0.2)",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              SCAN TO VERIFY
            </div>
          )}
        </div>
      </div>

      {/* Footer Info Row */}
      <div
        style={{
          marginTop: compact ? 14 : 18,
          paddingTop: 12,
          borderTop: "1px dashed rgba(255,255,255,0.15)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#C4B5FD",
          fontWeight: 600,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          Status: <strong style={{ color: "#4ADE80" }}>{registrationStatus.toUpperCase()}</strong>
        </div>
        <div>
          Amount: <strong style={{ color: "#FFFFFF" }}>{formattedAmount}</strong>
        </div>
        {paymentId && (
          <div>
            Ref: <span style={{ fontFamily: "monospace", color: "#E0E7FF" }}>{paymentId}</span>
          </div>
        )}
      </div>
    </div>
  );
}
