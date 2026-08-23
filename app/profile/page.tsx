"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  User,
  ShieldCheck,
  Ticket,
  Award,
  Sparkles,
  LogOut,
  ArrowRight,
  Download,
  Eye,
  ExternalLink,
  X,
  CheckCircle2,
  Calendar,
  MapPin,
  RefreshCw,
} from "lucide-react";

interface UserCertificate {
  id: string;
  certificate_number: string;
  registration_id: string;
  participant_id: string;
  event_id: string;
  certificate_type: string;
  status: string;
  issued_at: string;
  verification_token: string;
  certificate_url: string;

  certificate_title: string;
  participant_name: string;
  participant_number: string;
  event_title: string;
  event_date: string | null;
  venue: string | null;
  category_name: string;
  participation_type: string;
  result_label: string;
  result_badge: string;
  issue_date_str: string;
  authorized_signatory: string;
  organization_name: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  const [myCertificates, setMyCertificates] = useState<UserCertificate[]>([]);
  const [loadingCerts, setLoadingCerts] = useState<boolean>(true);
  const [certsError, setCertsError] = useState<string | null>(null);
  const [viewingCert, setViewingCert] = useState<UserCertificate | null>(null);

  const fetchMyCertificates = async () => {
    if (!user) return;
    try {
      setLoadingCerts(true);
      setCertsError(null);
      const res = await fetch("/api/certificates/my-certificates", { cache: "no-store" });
      const data = await res.json();

      if (res.ok && data.success) {
        setMyCertificates(data.certificates || []);

        // Check hash or URL search param to auto-open target certificate
        if (typeof window !== "undefined" && window.location.hash) {
          const targetId = window.location.hash.replace("#cert-", "").replace("#", "");
          const match = (data.certificates || []).find((c: UserCertificate) => c.id === targetId || c.certificate_number === targetId);
          if (match) {
            setViewingCert(match);
          }
        }
      } else {
        setCertsError(data.error || "Unable to fetch certificates.");
      }
    } catch (err: any) {
      console.error("[PROFILE] Error fetching user certificates:", err);
      setCertsError("Network error fetching certificates.");
    } finally {
      setLoadingCerts(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyCertificates();
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
        <Navbar />
        <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
          <h2>Redirecting to login...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Participant";

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  const handleDownloadCertificate = (cert: UserCertificate) => {
    if (!cert.certificate_url) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      let rawHTML = cert.certificate_url;
      if (rawHTML.startsWith("data:text/html;charset=utf-8,")) {
        rawHTML = decodeURIComponent(rawHTML.replace("data:text/html;charset=utf-8,", ""));
      }
      printWindow.document.write(rawHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 1040, margin: "36px auto 64px", padding: "0 24px" }} className="cgs-main-container">
        {/* Profile Card Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #090314 0%, #1A0A3A 50%, #311068 100%)",
            borderRadius: 24,
            padding: "36px 40px",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            boxShadow: "0 16px 40px rgba(15, 10, 40, 0.2)",
          }}
          className="profile-card-header"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #A78BFA",
                }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 900,
                  border: "3px solid #A78BFA",
                }}
              >
                {displayName.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 10px",
                  background: "rgba(167, 139, 250, 0.2)",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#E9D5FF",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                <Sparkles size={12} color="#C4B5FD" /> Official Participant Profile
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 4px" }}>{displayName}</h1>
              <div style={{ fontSize: 14, color: "#C4B5FD", fontWeight: 500, wordBreak: "break-all" }}>
                {user.email}
              </div>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            style={{
              padding: "12px 22px",
              borderRadius: 14,
              background: "rgba(239, 68, 68, 0.2)",
              border: "1.5px solid rgba(239, 68, 68, 0.4)",
              color: "#F87171",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* ── SECTION 1: MY CERTIFICATES (PRIMARY REWARD ACCESS) ── */}
        <div id="certificates" style={{ marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
              <Award size={24} color="#6D28D9" /> My Official Certificates
            </h2>

            <button
              type="button"
              onClick={fetchMyCertificates}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                background: "#F1F5F9",
                border: "1px solid #CBD5E1",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 800,
                color: "#334155",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} className={loadingCerts ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {loadingCerts ? (
            <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "40px", textAlign: "center", color: "#64748B" }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px", display: "block", color: "#6D28D9" }} />
              Loading your verified certificates from Supabase...
            </div>
          ) : certsError ? (
            <div style={{ background: "#FEF2F2", borderRadius: 16, border: "1px solid #FECACA", padding: "20px", color: "#991B1B", fontWeight: 700 }}>
              ⚠️ {certsError}
            </div>
          ) : myCertificates.length === 0 ? (
            <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "40px 24px", textAlign: "center", color: "#64748B" }}>
              <Award size={44} color="#94A3B8" style={{ margin: "0 auto 12px", opacity: 0.5 }} />
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>No Certificates Issued Yet</h3>
              <p style={{ fontSize: 13.5, color: "#64748B", maxWidth: 480, margin: "0 auto 16px" }}>
                When event organizers assign results and issue your official certificate of participation or award, it will appear right here for viewing and downloading.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 20 }}>
              {myCertificates.map((cert) => (
                <div
                  key={cert.id}
                  id={`cert-${cert.id}`}
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #FAF5FF 100%)",
                    borderRadius: 20,
                    border: "1.5px solid #E9D5FF",
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(109, 40, 217, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Header Badge */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#6D28D9", background: "#F3E8FF", padding: "4px 10px", borderRadius: 8 }}>
                        {cert.certificate_number}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#D97706", background: "#FEF3C7", padding: "4px 10px", borderRadius: 8 }}>
                        {cert.result_badge}
                      </span>
                    </div>

                    {/* Certificate Title */}
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
                      {cert.certificate_title}
                    </h3>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#6D28D9", marginBottom: 12 }}>
                      Recipient: {cert.participant_name}
                    </div>

                    {/* Event & Category Info */}
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>
                      {cert.event_title}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>
                      Category: <strong>{cert.category_name}</strong> ({cert.participation_type})
                    </div>
                  </div>

                  {/* Footer Details & Action Buttons */}
                  <div style={{ paddingTop: 14, borderTop: "1px solid #F3E8FF" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, color: "#94A3B8", marginBottom: 14 }}>
                      <span>Issued: {cert.issue_date_str}</span>
                      <span style={{ color: "#10B981", fontWeight: 800 }}>✓ Verified</span>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setViewingCert(cert)}
                        style={{
                          flex: 1,
                          padding: "9px 12px",
                          borderRadius: 10,
                          background: "#F3E8FF",
                          color: "#6D28D9",
                          border: "1px solid #E9D5FF",
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Eye size={15} /> View
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadCertificate(cert)}
                        style={{
                          flex: 1,
                          padding: "9px 12px",
                          borderRadius: 10,
                          background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                          color: "#ffffff",
                          border: "none",
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          boxShadow: "0 4px 12px rgba(109, 40, 217, 0.25)",
                        }}
                      >
                        <Download size={15} /> Download
                      </button>
                    </div>

                    <div style={{ marginTop: 10, textAlign: "center" }}>
                      <Link
                        href={`/certificates/verify?query=${encodeURIComponent(cert.certificate_number)}`}
                        target="_blank"
                        style={{ fontSize: 11.5, color: "#6D28D9", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        Public Verification Link <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION 2: QUICK ACCESS REGISTRATIONS ── */}
        <div
          style={{
            marginTop: 32,
            background: "linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)",
            border: "1.5px solid #C4B5FD",
            borderRadius: 20,
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            boxShadow: "0 4px 16px rgba(109, 40, 217, 0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "#6D28D9",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Ticket size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 2px" }}>
                My Registrations &amp; Payment History
              </h3>
              <p style={{ fontSize: 13.5, color: "#6D28D9", margin: 0, fontWeight: 600 }}>
                View your confirmed passes, payment transaction receipts, and entry QR codes synchronized from Supabase.
              </p>
            </div>
          </div>

          <Link
            href="/my-registrations"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              borderRadius: 12,
              background: "#6D28D9",
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(109, 40, 217, 0.3)",
            }}
          >
            View Registrations <ArrowRight size={16} />
          </Link>
        </div>

        {/* ── SECTION 3: ACCOUNT & SECURITY DETAILS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginTop: 24,
          }}
          className="profile-details-grid"
        >
          {/* Card 1: Account Information */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "28px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <User size={20} color="#6D28D9" /> Account Details
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>Full Name</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginTop: 2 }}>{displayName}</div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>Email Address</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginTop: 2, wordBreak: "break-all" }}>{user.email}</div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>Account ID</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginTop: 2, fontFamily: "monospace", wordBreak: "break-all" }}>{user.id}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Security & Status */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "28px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={20} color="#16A34A" /> Security &amp; Verification
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>Auth Provider</div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: "#111827", marginTop: 2 }}>
                  {user.app_metadata?.provider === "google" ? "Google OAuth 2.0" : "Email & Password"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>Email Verification</div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: "#16A34A", marginTop: 2 }}>Verified &amp; Active</div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>Last Sign In</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#475569", marginTop: 2 }}>
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Active Session"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: VIEW CERTIFICATE SNAPSHOT ── */}
      {viewingCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 24, width: "100%", maxWidth: 1040, height: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.35)", overflow: "hidden" }}>
            {/* Modal Header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={20} color="#6D28D9" />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                    {viewingCert.certificate_title}
                  </h3>
                  <div style={{ fontSize: 12, color: "#64748B" }}>
                    Cert #: <strong>{viewingCert.certificate_number}</strong> | Issued for <strong>{viewingCert.participant_name}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => handleDownloadCertificate(viewingCert)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                    color: "#ffffff",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 12px rgba(109, 40, 217, 0.25)",
                  }}
                >
                  <Download size={15} /> Download PDF
                </button>
                <button type="button" onClick={() => setViewingCert(null)} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}>
                  <X size={22} color="#94A3B8" />
                </button>
              </div>
            </div>

            {/* Modal Iframe Container rendering exact snapshot */}
            <div style={{ flex: 1, padding: 16, background: "#0F172A", overflow: "hidden" }}>
              <iframe
                srcDoc={
                  viewingCert.certificate_url.startsWith("data:text/html;charset=utf-8,")
                    ? decodeURIComponent(viewingCert.certificate_url.replace("data:text/html;charset=utf-8,", ""))
                    : viewingCert.certificate_url
                }
                style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
                title="Official Certificate Frame"
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .profile-details-grid { grid-template-columns: 1fr !important; }
          .profile-card-header { padding: 24px !important; flex-direction: column; align-items: flex-start !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
}
