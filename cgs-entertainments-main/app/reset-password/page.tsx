"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setErrorMsg(error.message || "Could not update password.");
      } else {
        setSuccessMsg("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
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
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 8px", letterSpacing: -0.4 }}>
              Set New Password
            </h1>
            <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
              Type your new strong password below to restore access.
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

          <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                New Password *
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "13px 42px 13px 42px",
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

            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                Confirm New Password *
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "13px 42px 13px 42px",
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
              {loading ? "Updating..." : "Update Password"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
