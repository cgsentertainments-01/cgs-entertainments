"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { User, Mail, Phone, ShieldCheck, Calendar, Trophy, Sparkles, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, signOut } = useAuth();

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

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: "36px auto 64px", padding: "0 24px" }} className="cgs-main-container">
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
                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #A78BFA" }}
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
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", background: "rgba(167, 139, 250, 0.2)", borderRadius: 12, fontSize: 11, fontWeight: 800, color: "#E9D5FF", textTransform: "uppercase", marginBottom: 6 }}>
                <Sparkles size={12} color="#C4B5FD" /> Official Participant Profile
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 4px" }}>{displayName}</h1>
              <div style={{ fontSize: 14, color: "#C4B5FD", fontWeight: 500, wordBreak: "break-all" }}>{user.email}</div>
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

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32 }} className="profile-details-grid">
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
                <div style={{ fontSize: 14.5, fontWeight: 800, color: "#16A34A", marginTop: 2 }}>
                  Verified &amp; Active
                </div>
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
