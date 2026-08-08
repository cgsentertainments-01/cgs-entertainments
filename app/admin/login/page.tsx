"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Shield,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorizedError = searchParams?.get("error") === "unauthorized";

  const { signInWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetEmail = email.trim();
    if (!targetEmail || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    // Verify admin email
    if (targetEmail.toLowerCase() !== "cgsentertainments01@gmail.com") {
      setErrorMsg("Unauthorized Access. Email is not registered as an official Admin.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signInWithEmail(targetEmail, password);

      if (error) {
        setErrorMsg("Incorrect email or password. Please verify credentials.");
      } else {
        window.location.href = "/admin/dashboard";
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          background: "#ffffff",
          borderRadius: 28,
          border: "1.5px solid #E2E8F0",
          boxShadow: "0 24px 64px rgba(15, 10, 40, 0.12)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1.15fr",
          minHeight: 600,
        }}
        className="admin-login-grid"
      >
        {/* ── LEFT HERO PANEL ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #090314 0%, #150A33 40%, #2E1065 75%, #4C1D95 100%)",
            padding: "48px 40px",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
          className="admin-login-hero"
        >
          {/* Background Radial Glow */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              right: "-20%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div>
            {/* Logo Badge */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "8px 16px",
                borderRadius: 14,
                display: "inline-flex",
                alignItems: "center",
                marginBottom: 32,
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                height: 52,
              }}
            >
              <img
                src="/images/logos/logo.jpeg"
                alt="CGS Entertainments Logo"
                style={{
                  height: 44,
                  width: "auto",
                  mixBlendMode: "multiply",
                  filter: "contrast(1.08)",
                }}
              />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 20,
                background: "rgba(167, 139, 250, 0.15)",
                border: "1px solid rgba(167, 139, 250, 0.3)",
                color: "#E9D5FF",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              <Shield size={14} color="#C4B5FD" />
              OFFICIAL ADMIN PORTAL
            </div>

            <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 16px", lineHeight: 1.2, letterSpacing: -0.6 }}>
              Control Room &amp; Operations
            </h1>

            <p style={{ fontSize: 14.5, color: "#C4B5FD", margin: 0, lineHeight: 1.7, fontWeight: 500, maxWidth: 420 }}>
              Manage competition events, participant registrations, certificates, hero banners, and payment revenue from your centralized enterprise command center.
            </p>
          </div>

          {/* Bottom Enterprise Badge */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 40 }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                borderRadius: 16,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <ShieldCheck size={22} color="#86EFAC" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Secure Enterprise Access</div>
                <div style={{ fontSize: 11.5, color: "#C4B5FD" }}>CGS Entertainments Core System</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT LOGIN CARD ── */}
        <div style={{ padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                background: "#F3E8FF",
                borderRadius: 10,
                fontSize: 11.5,
                fontWeight: 800,
                color: "#6D28D9",
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              <Sparkles size={13} />
              ADMIN ACCESS ONLY
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.4 }}>
              ADMIN LOGIN
            </h2>
            <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
              Authenticate with your official CGS Admin credentials.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1.5px solid #FECACA",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 20,
                color: "#991B1B",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13.5,
                fontWeight: 700,
              }}
            >
              <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Email Input */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                Admin Email Address *
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  name="cgs_admin_email_field"
                  autoComplete="off"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
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

            {/* Password Input */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>
                  Password *
                </label>
                <Link href="/forgot-password" style={{ fontSize: 12, fontWeight: 800, color: "#6D28D9", textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="cgs_admin_pass_field"
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 42px 12px 42px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    fontSize: 14,
                    outline: "none",
                    background: "#F8FAFC",
                    color: "#0F172A",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94A3B8" }}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
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
                transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
                marginTop: 8,
              }}
              className="admin-submit-btn"
            >
              {loading ? "Authenticating Admin..." : "Sign In to Admin Dashboard"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Secure Admin Footer Note */}
          <div style={{ marginTop: 32, padding: "12px 16px", background: "#FAF5FF", borderRadius: 12, border: "1px solid #E9D5FF", display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={18} color="#6D28D9" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#5B21B6" }}>
              Restricted Area: Unauthorized attempts are logged and monitored.
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .admin-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(109, 40, 217, 0.45) !important;
        }
        @media (max-width: 900px) {
          .admin-login-grid { grid-template-columns: 1fr !important; }
          .admin-login-hero { display: none !important; }
        }
      `}</style>
    </div>
  );
}
