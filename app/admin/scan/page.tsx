"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Camera,
  Search,
  RefreshCw,
  User,
  Calendar,
  MapPin,
  Award,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ParticipantCard } from "@/components/registration/ParticipantCard";

export default function AdminScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scannedToken, setScannedToken] = useState<string | null>(null);

  const scannerRef = useRef<any>(null);
  const readerElementId = "cgs-qr-reader";

  // Function to process a decoded QR code or manual token
  async function processToken(tokenOrUrl: string) {
    if (!tokenOrUrl) return;

    let cleanToken = tokenOrUrl.trim();

    // Extract token if decoded string is a full URL like https://domain.com/verify/CGS-REG-2026-000001
    if (cleanToken.includes("/verify/")) {
      const parts = cleanToken.split("/verify/");
      cleanToken = parts[parts.length - 1];
    }

    setScannedToken(cleanToken);
    setLoading(true);
    setScanResult(null);

    // Stop scanning while showing result
    stopScanner();

    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(cleanToken)}`);
      const data = await res.json();
      setScanResult(data);
    } catch (err: any) {
      console.error("Scanner API error:", err);
      setScanResult({
        verified: false,
        error: "Network error fetching participant record.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Start HTML5 Camera Scanner
  async function startScanner() {
    setCameraError(null);
    setScanResult(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (_) {}
      }

      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      setIsScanning(true);

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          console.log("QR Code scanned successfully:", decodedText);
          processToken(decodedText);
        },
        () => {
          // Frame error callback - non-fatal
        }
      );
    } catch (err: any) {
      console.error("Failed to start camera scanner:", err);
      setIsScanning(false);
      setCameraError(
        err?.message || "Camera access is required to scan participant QR codes."
      );
    }
  }

  // Stop Scanner
  async function stopScanner() {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        setIsScanning(false);
      }
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualInput.trim()) {
      processToken(manualInput);
    }
  }

  function handleVerifyAnother() {
    setScanResult(null);
    setScannedToken(null);
    setManualInput("");
    startScanner();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Navbar />

      <div style={{ maxWidth: 840, margin: "36px auto 60px", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
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
            <ShieldCheck size={16} color="#6D28D9" /> ORGANIZER / ADMIN VERIFICATION
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#0F172A",
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Participant QR Scanner
          </h1>
          <p style={{ fontSize: 15, color: "#64748B", margin: "6px 0 0", fontWeight: 500 }}>
            Scan participant pass QR code or enter Registration ID manually.
          </p>
        </div>

        {/* ── MAIN SCANNING / SEARCH BOX ── */}
        {!scanResult && !loading && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
              padding: "32px 28px",
              marginBottom: 32,
            }}
          >
            {/* Camera Scanner Container */}
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <div
                id={readerElementId}
                style={{
                  width: "100%",
                  maxWidth: 400,
                  minHeight: isScanning ? 320 : 0,
                  margin: "0 auto 16px",
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#1E1B4B",
                }}
              />

              {!isScanning && (
                <div
                  style={{
                    padding: "40px 20px",
                    border: "2px dashed #C4B5FD",
                    borderRadius: 20,
                    background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "#F3E8FF",
                      color: "#6D28D9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    <Camera size={32} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
                    Ready to Scan QR Code
                  </div>
                  <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 auto 20px", maxWidth: 360 }}>
                    Click below to enable your camera and scan a participant's QR code pass.
                  </p>
                  <button
                    onClick={startScanner}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "13px 28px",
                      background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 14,
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(109,40,217,0.25)",
                    }}
                  >
                    <Camera size={18} /> Launch Device Camera
                  </button>
                </div>
              )}

              {isScanning && (
                <button
                  onClick={stopScanner}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    background: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FCA5A5",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Stop Camera Scanner
                </button>
              )}
            </div>

            {/* Camera Access Error Banner */}
            {cameraError && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1.5px solid #FCA5A5",
                  borderRadius: 16,
                  padding: "16px 20px",
                  color: "#991B1B",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 28,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800 }}>Camera Access Required</div>
                  <div>Camera access is required to scan participant QR codes. Please check browser permissions or enter Registration ID manually below.</div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                margin: "24px 0",
                color: "#94A3B8",
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span>OR ENTER REGISTRATION ID</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            {/* Manual Registration Input Form */}
            <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
                <Search
                  size={18}
                  color="#94A3B8"
                  style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="Enter Registration ID (e.g. CGS-REG-2026-000001 or QR Token)"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px 14px 44px",
                    borderRadius: 14,
                    border: "1.5px solid #CBD5E1",
                    fontSize: 14,
                    fontWeight: 600,
                    outline: "none",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!manualInput.trim()}
                style={{
                  padding: "14px 26px",
                  background: manualInput.trim() ? "#6D28D9" : "#CBD5E1",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: manualInput.trim() ? "pointer" : "not-allowed",
                  transition: "background 0.2s",
                }}
              >
                Verify Manually
              </button>
            </form>
          </div>
        )}

        {/* Loading Indicator during Verification */}
        {loading && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1.5px solid #E2E8F0",
              padding: "50px 24px",
              textAlign: "center",
              boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
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
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
              Verifying reference #{scannedToken}...
            </div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── VERIFIED PARTICIPANT RESULT ── */}
        {!loading && scanResult && scanResult.verified && scanResult.registration && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "2px solid #10B981",
              boxShadow: "0 10px 40px rgba(16,185,129,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Verified Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                padding: "24px 28px",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle2 size={32} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase" }}>
                    ✓ PARTICIPANT VERIFIED
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, marginTop: 2 }}>
                    {scanResult.registration.participant.full_name}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  background: "#FFFFFF",
                  color: "#047857",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontFamily: "monospace",
                }}
              >
                #{scanResult.registration.registration_number}
              </span>
            </div>

            {/* Details Body */}
            <div style={{ padding: "28px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "16px 20px",
                  background: "#F8FAFC",
                  padding: "20px 24px",
                  borderRadius: 18,
                  border: "1px solid #E2E8F0",
                  marginBottom: 24,
                  fontSize: 13.5,
                }}
              >
                <div>
                  <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    Participant Name
                  </div>
                  <div style={{ fontWeight: 900, color: "#0F172A", fontSize: 15, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <User size={15} color="#6D28D9" /> {scanResult.registration.participant.full_name}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    Registration ID
                  </div>
                  <div style={{ fontWeight: 900, color: "#6D28D9", fontSize: 15, marginTop: 2, fontFamily: "monospace" }}>
                    {scanResult.registration.registration_number}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    Event
                  </div>
                  <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                    {scanResult.registration.event.title}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    Category
                  </div>
                  <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <Award size={15} color="#6D28D9" /> {scanResult.registration.category}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    Date
                  </div>
                  <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={15} color="#6D28D9" />
                    {scanResult.registration.event.event_date
                      ? new Date(scanResult.registration.event.event_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date TBA"}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    Location
                  </div>
                  <div style={{ fontWeight: 800, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={15} color="#6D28D9" /> {scanResult.registration.event.city || "Hyderabad"}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    Payment Status
                  </div>
                  <div style={{ fontWeight: 900, color: "#059669", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <CreditCard size={15} color="#059669" /> {scanResult.registration.payment_status} ({scanResult.registration.is_free ? "₹0 Free" : `₹${scanResult.registration.amount}`})
                  </div>
                </div>

                <div>
                  <div style={{ color: "#64748B", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    Registration Status
                  </div>
                  <div style={{ fontWeight: 900, color: "#059669", marginTop: 2 }}>
                    {scanResult.registration.registration_status}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={handleVerifyAnother}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 26px",
                    background: "#6D28D9",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(109,40,217,0.25)",
                  }}
                >
                  <RefreshCw size={16} /> Verify Another Participant
                </button>

                <Link
                  href={`/verify/${encodeURIComponent(scanResult.registration.registration_number)}`}
                  target="_blank"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 26px",
                    background: "#F3E8FF",
                    color: "#6D28D9",
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={16} /> View Full Registration Pass
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── INVALID RESULT ── */}
        {!loading && scanResult && !scanResult.verified && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "2px solid #FCA5A5",
              padding: "40px 28px",
              textAlign: "center",
              boxShadow: "0 8px 30px rgba(220,38,38,0.08)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#FEF2F2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <XCircle size={36} color="#DC2626" />
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#991B1B", margin: "0 0 8px" }}>
              ❌ INVALID PARTICIPANT
            </h3>

            <p style={{ fontSize: 14.5, color: "#64748B", margin: "0 0 24px", fontWeight: 600 }}>
              {scanResult.error || "Unable to verify this participant. The QR code is invalid or no longer active."}
            </p>

            <button
              onClick={handleVerifyAnother}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                background: "#6D28D9",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={16} /> Try Scanning Again
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
