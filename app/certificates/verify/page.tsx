"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Award, ShieldCheck, Search, CheckCircle2, XCircle, Calendar, MapPin, Building, RefreshCw } from "lucide-react";

export default function PublicCertificateVerificationPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || searchParams.get("token") || searchParams.get("number") || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (queryToVerify?: string) => {
    const q = (queryToVerify !== undefined ? queryToVerify : query).trim();
    if (!q) {
      setError("Please enter a Certificate Number or Verification Token.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await fetch(`/api/certificates/verify?query=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || "Unable to verify certificate.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Network error while connecting to verification server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleVerify(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 800, margin: "48px auto 80px", padding: "0 24px" }}>
        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              background: "#F3E8FF",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 800,
              color: "#6D28D9",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            <ShieldCheck size={16} color="#6D28D9" /> Official Credential Verification Portal
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: "#0F172A", margin: "0 0 10px", letterSpacing: -0.5 }}>
            Verify Certificate Authenticity
          </h1>
          <p style={{ fontSize: 15, color: "#64748B", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>
            Enter a valid Certificate Number (e.g. CGS-CERT-2026-XXXXXX) or Verification Token to check official issued status.
          </p>
        </div>

        {/* Verification Search Box */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 24,
            border: "1.5px solid #E2E8F0",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            marginBottom: 32,
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
              <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Enter Certificate Number (e.g. CGS-CERT-2026-123456)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 46px",
                  borderRadius: 14,
                  border: "1.5px solid #CBD5E1",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none",
                  background: "#F8FAFC",
                  color: "#0F172A",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 28px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 800,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(109, 40, 217, 0.28)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />} Verify Credential
            </button>
          </form>

          {error && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#FEF2F2", color: "#991B1B", borderRadius: 12, fontSize: 13.5, fontWeight: 700 }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Verification Result Display Card */}
        {result && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              border: result.valid ? "2px solid #10B981" : "2px solid #EF4444",
              padding: "36px 32px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
            }}
          >
            {result.valid && result.verification ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CheckCircle2 size={28} color="#10B981" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#10B981", textTransform: "uppercase", letterSpacing: 1 }}>
                        Official Verification Status
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                        {result.verification.status}
                      </h3>
                    </div>
                  </div>

                  <span style={{ fontSize: 13, fontWeight: 800, color: "#6D28D9", background: "#F3E8FF", padding: "6px 14px", borderRadius: 10 }}>
                    Cert #: {result.verification.certificate_number}
                  </span>
                </div>

                <div style={{ borderTop: "1.5px solid #F1F5F9", paddingTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>RECIPIENT NAME</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", marginTop: 4 }}>{result.verification.participant_name}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B", marginTop: 2 }}>{result.verification.participant_number}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>EVENT TITLE</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", marginTop: 4 }}>{result.verification.event_title}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>AWARD / RESULT</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#D97706", marginTop: 4 }}>{result.verification.result_badge}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>EVENT DATE &amp; VENUE</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <Calendar size={14} color="#6D28D9" />
                      {result.verification.event_date ? new Date(result.verification.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                    </div>
                    {result.verification.venue && (
                      <div style={{ fontSize: 13, color: "#64748B", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={13} color="#64748B" /> {result.verification.venue}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px dashed #E2E8F0", fontSize: 12, color: "#94A3B8", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <span>Issued Date: <strong>{result.verification.issued_at ? new Date(result.verification.issued_at).toLocaleDateString("en-IN") : "N/A"}</strong></span>
                  <span>Issued by: <strong>CGS Entertainments Platform</strong></span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEE2E2", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <XCircle size={28} color="#EF4444" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#991B1B", margin: "0 0 8px" }}>Credential Verification Failed</h3>
                <p style={{ fontSize: 14, color: "#64748B", maxWidth: 440, margin: "0 auto" }}>
                  {result.message || "No valid certificate matches the provided certificate number or token."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
