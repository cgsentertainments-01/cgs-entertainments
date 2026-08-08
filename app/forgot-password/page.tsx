"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { error } = await resetPasswordForEmail(email);
      if (error) {
        setErrorMsg(error.message || "Could not send reset password email.");
      } else {
        setSuccessMsg("Password reset email sent! Check your inbox for instructions.");
        setEmail("");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred while requesting password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 540, margin: "48px auto 80px", padding: "0 24px" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 28,
            border: "1.5px solid #E2E8F0",
            padding: "44px 36px",
            boxShadow: "0 20px 48px rgba(15, 10, 40, 0.08)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "#F3E8FF",
                color: "#6D28D9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Sparkles size={26} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 8px", letterSpacing: -0.4 }}>
              Reset Password
            </h1>
            <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              Enter your registered email address and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1.5px solid #FECACA",
                borderRadius: 14,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
                color: "#991B1B",
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              <AlertCircle size={18} color="#DC2626" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: "#F0FDF4",
                border: "1.5px solid #86EFAC",
                borderRadius: 14,
                padding: "16px",
                textAlign: "center",
                marginBottom: 20,
                color: "#166534",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={32} color="#22C55E" style={{ margin: "0 auto 8px" }} />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                Email Address *
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "13px 14px 13px 42px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    fontSize: 14,
                    outline: "none",
                    background: "#F8FAFC",
                    color: "#0F172A",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "15px 24px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                color: "#fff",
                border: "none",
                fontSize: 15,
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 8px 24px rgba(109, 40, 217, 0.35)",
              }}
            >
              {loading ? "Sending..." : "Send Reset Email"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#64748B", fontWeight: 500 }}>
            Remembered your password?{" "}
            <Link href="/login" style={{ color: "#6D28D9", fontWeight: 900, textDecoration: "none" }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
