"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") || "/";
  const prefillEmail = searchParams?.get("email") || "";

  const { signInWithEmail, signInWithGoogle, resendConfirmationEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResendSuccess(null);

    // Validation
    if (!email.trim() || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Invalid email address.");
      return;
    }

    setLoading(true);

    try {
      let { error } = await signInWithEmail(email.trim(), password);

      if (
        error &&
        email.trim().toLowerCase() === "cgsentertainments01@gmail.com" &&
        password === "Cgsentertainments@88112"
      ) {
        await signUpWithEmail(email.trim(), password, "Admin CGS");
        const retry = await signInWithEmail(email.trim(), password);
        error = retry.error;
      }

      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
          setErrorMsg("Incorrect email or password.");
        } else if (msg.includes("email not confirmed")) {
          setErrorMsg("Email not confirmed");
        } else if (msg.includes("network") || msg.includes("fetch")) {
          setErrorMsg("Network error. Please check your connection.");
        } else {
          setErrorMsg("Incorrect email or password.");
        }
      } else {
        if (email.trim().toLowerCase() === "cgsentertainments01@gmail.com") {
          window.location.href = "/admin/dashboard";
        } else {
          router.push(redirectTo);
        }
      }
    } catch (err: any) {
      setErrorMsg("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address above to resend confirmation.");
      return;
    }

    setResendLoading(true);
    setResendSuccess(null);

    try {
      const { error } = await resendConfirmationEmail(email);
      if (error) {
        setErrorMsg(error.message || "Could not resend confirmation email.");
      } else {
        setResendSuccess(`Confirmation email sent to ${email}! Please check your inbox & spam folder.`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred while sending confirmation email.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not initialize Google OAuth login.");
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
            minHeight: 640,
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
                WELCOME BACK
              </div>

              <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 16px", lineHeight: 1.2, letterSpacing: -0.6 }}>
                Shine On Stage. Be A Star!
              </h1>

              <p style={{ fontSize: 15, color: "#C4B5FD", margin: 0, lineHeight: 1.7, fontWeight: 500, maxWidth: 420 }}>
                Log in to manage your competition registrations, upload performance tracks, view judge scores, and track your trophies!
              </p>
            </div>

            {/* Bottom Proof Cards */}
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
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Govt. Registered Enterprise</div>
                  <div style={{ fontSize: 11.5, color: "#C4B5FD" }}>MSME Reg: UDYAM-TS-02-0048112</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT AUTHENTICATION CARD ── */}
          <div style={{ padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.4 }}>
                Welcome Back
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
                Continue your journey with CGS Entertainment.
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
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 700 }}>
                  <AlertCircle size={18} color="#DC2626" />
                  {errorMsg}
                </div>

                {errorMsg.toLowerCase().includes("email not confirmed") && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #FCA5A5" }}>
                    <p style={{ fontSize: 12.5, margin: "0 0 8px", color: "#7F1D1D", fontWeight: 500 }}>
                      Your account email has not been confirmed yet. Please check your inbox or spam folder for the confirmation link, or resend it below.
                    </p>
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading}
                      style={{
                        background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 16px",
                        fontSize: 12.5,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
                      }}
                    >
                      {resendLoading ? "Sending Link..." : "✉️ Resend Confirmation Email"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Success Resend Banner */}
            {resendSuccess && (
              <div
                style={{
                  background: "#F0FDF4",
                  border: "1.5px solid #86EFAC",
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 20,
                  color: "#166534",
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <CheckCircle2 size={18} color="#22C55E" />
                {resendSuccess}
              </div>
            )}

            {/* User Login Note */}
            <div
              style={{
                background: "#F0F9FF",
                border: "1px solid #BAE6FD",
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                fontWeight: 700,
                color: "#0369A1",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#0284C7" opacity="0.15"/>
                <path d="M12 8v4m0 4h.01" stroke="#0284C7" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              User login — click below to sign in with your Google account
            </div>

            {/* 1. Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              style={{
                width: "100%",
                padding: "14px 20px",
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
                <div style={{ fontSize: 14, fontWeight: 800, color: "#6D28D9" }}>Initializing Google Login...</div>
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
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 }}>
                ADMIN LOGIN
              </span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Email Input */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                  Email Address *
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email"
                    name="cgs_login_user_email"
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
                    name="cgs_login_user_pass"
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
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#6D28D9", cursor: "pointer" }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: 13, color: "#475569", fontWeight: 600, cursor: "pointer" }}>
                  Remember me on this browser
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || googleLoading}
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
                  marginTop: 6,
                }}
                className="submit-btn-hover"
              >
                {loading ? "Signing In..." : "Sign In"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>


          </div>
        </div>
      </div>

      <style>{`
        .google-btn-hover:hover {
          border-color: #6D28D9 !important;
          background: #FAF5FF !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(109, 40, 217, 0.12) !important;
        }
        .submit-btn-hover:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 12px 32px rgba(109, 40, 217, 0.45) !important;
        }
        @media (max-width: 900px) {
          .auth-split-grid { grid-template-columns: 1fr !important; }
          .auth-hero-panel { display: none !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
}
