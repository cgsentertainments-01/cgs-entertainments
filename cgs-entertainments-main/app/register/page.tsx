"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validations
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Invalid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please make sure both password fields are identical.");
      return;
    }

    setLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const { error } = await signUpWithEmail(email.trim(), password, fullName);

      if (error) {
        if (error.message?.toLowerCase().includes("already registered") || error.message?.toLowerCase().includes("already been registered") || error.message?.toLowerCase().includes("user already exists")) {
          setErrorMsg("An account with this email already exists. Please sign in instead.");
        } else if (error.message?.toLowerCase().includes("rate limit")) {
          setErrorMsg("Too many attempts. Please wait a few minutes and try again.");
        } else {
          setErrorMsg("Could not complete registration. Please try again.");
        }
      } else {
        setSuccessMsg("✅ Account created successfully.");
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email.trim())}`);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not initialize Google OAuth.");
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: "32px auto 64px", padding: "0 24px" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 28,
            border: "1.5px solid #E2E8F0",
            boxShadow: "0 24px 64px rgba(15, 10, 40, 0.08)",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr",
            minHeight: 680,
          }}
          className="auth-split-grid"
        >
          {/* ── LEFT HERO PANEL ── */}
          <div
            style={{
              background: "linear-gradient(135deg, #090314 0%, #1A0A3A 40%, #2E1065 75%, #4C1D95 100%)",
              padding: "48px 40px",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
            className="auth-hero-panel"
          >
            {/* Background Glow */}
            <div
              style={{
                position: "absolute",
                top: "-20%",
                right: "-20%",
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(167,139,250,0.22) 0%, transparent 70%)",
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
                <Sparkles size={14} color="#C4B5FD" />
                JOIN THE PLATFORM
              </div>

              <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 16px", lineHeight: 1.2, letterSpacing: -0.6 }}>
                Create Your Official Participant Profile
              </h1>

              <p style={{ fontSize: 15, color: "#C4B5FD", margin: 0, lineHeight: 1.7, fontWeight: 500, maxWidth: 420 }}>
                Register today to enter India&apos;s biggest dance, modeling, singing, acting, and music championships!
              </p>
            </div>

            {/* Bottom Security Proof */}
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
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Instant Booking &amp; Verified Badges</div>
                  <div style={{ fontSize: 11.5, color: "#C4B5FD" }}>Secure Supabase Authentication</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT REGISTRATION CARD ── */}
          <div style={{ padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.4 }}>
                Create Your Account
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
                Get started in less than 60 seconds.
              </p>
            </div>

            {/* Notifications */}
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
                  marginBottom: 18,
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
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                  color: "#166534",
                  fontSize: 13.5,
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={18} color="#22C55E" />
                {successMsg}
              </div>
            )}

            {/* 1. Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              style={{
                width: "100%",
                padding: "13px 20px",
                borderRadius: 14,
                background: "#ffffff",
                border: "1.5px solid #E2E8F0",
                color: "#1E293B",
                fontSize: 14.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              className="google-btn-hover"
            >
              {googleLoading ? (
                <div style={{ fontSize: 14, fontWeight: 800, color: "#6D28D9" }}>Connecting to Google...</div>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 }}>
                OR REGISTER WITH EMAIL
              </span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* First & Last Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="form-2col">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                    First Name *
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      placeholder="Rahul"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "11px 12px 11px 38px",
                        borderRadius: 12,
                        border: "1.5px solid #E2E8F0",
                        fontSize: 13.5,
                        outline: "none",
                        background: "#F8FAFC",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                    Last Name *
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      placeholder="Sharma"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "11px 12px 11px 38px",
                        borderRadius: 12,
                        border: "1.5px solid #E2E8F0",
                        fontSize: 13.5,
                        outline: "none",
                        background: "#F8FAFC",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Full Width Email Address */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                  Email Address *
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 38px",
                      borderRadius: 12,
                      border: "1.5px solid #E2E8F0",
                      fontSize: 13.5,
                      outline: "none",
                      background: "#F8FAFC",
                      color: "#0F172A",
                    }}
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="form-2col">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                    Password *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "11px 36px 11px 38px",
                        borderRadius: 12,
                        border: "1.5px solid #E2E8F0",
                        fontSize: 13.5,
                        outline: "none",
                        background: "#F8FAFC",
                        color: "#0F172A",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94A3B8" }}
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>
                      Confirm Password *
                    </label>
                    {confirmPassword.length > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 800, color: confirmPassword === password ? "#16A34A" : "#DC2626" }}>
                        {confirmPassword === password ? "✓ Passwords Match" : "✕ Passwords Differ"}
                      </span>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "11px 36px 11px 38px",
                        borderRadius: 12,
                        border: `1.5px solid ${confirmPassword.length > 0 ? (confirmPassword === password ? "#86EFAC" : "#FECACA") : "#E2E8F0"}`,
                        fontSize: 13.5,
                        outline: "none",
                        background: "#F8FAFC",
                        color: "#0F172A",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94A3B8" }}
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                style={{
                  padding: "14px 24px",
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
                className="submit-btn-hover"
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Bottom Login Link */}
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748B", fontWeight: 500 }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#6D28D9", fontWeight: 900, textDecoration: "none" }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .google-btn-hover:hover {
          border-color: #6D28D9 !important;
          background: #FAF5FF !important;
          transform: translateY(-2px);
        }
        .submit-btn-hover:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 12px 32px rgba(109, 40, 217, 0.45) !important;
        }
        @media (max-width: 900px) {
          .auth-split-grid { grid-template-columns: 1fr !important; }
          .auth-hero-panel { display: none !important; }
          .form-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
}
