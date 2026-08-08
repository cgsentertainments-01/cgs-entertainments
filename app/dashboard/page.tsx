"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LayoutDashboard, Trophy, Ticket, Award, Sparkles, ArrowRight, User } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Participant";

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: "36px auto 64px", padding: "0 24px" }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#F3E8FF", borderRadius: 12, fontSize: 12, fontWeight: 800, color: "#6D28D9", textTransform: "uppercase", marginBottom: 8 }}>
            <Sparkles size={14} color="#6D28D9" /> Participant Command Center
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.5 }}>
            Welcome, {displayName}! 👋
          </h1>
          <p style={{ fontSize: 15, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Here is your live competition dashboard, event registrations, judges evaluation scores, and certificate wallet.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 36 }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: 20, border: "1.5px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#F3E8FF", color: "#6D28D9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Ticket size={22} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A" }}>2 Active</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginTop: 2 }}>Registered Competitions</div>
          </div>

          <div style={{ background: "#fff", padding: "24px", borderRadius: 20, border: "1.5px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Trophy size={22} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A" }}>3 Trophies</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginTop: 2 }}>Won In 2025 Championships</div>
          </div>

          <div style={{ background: "#fff", padding: "24px", borderRadius: 20, border: "1.5px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Award size={22} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A" }}>5 Verified</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginTop: 2 }}>Official Certificates</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "#fff", borderRadius: 24, border: "1.5px solid #E2E8F0", padding: "32px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 20px" }}>
            Quick Actions
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <Link
              href="/events"
              style={{
                padding: "20px",
                borderRadius: 16,
                background: "#FAF5FF",
                border: "1.5px solid #E9D5FF",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#6D28D9" }}>Browse Events</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Register for upcoming stage shows</div>
              </div>
              <ArrowRight size={20} color="#6D28D9" />
            </Link>

            <Link
              href="/my-registrations"
              style={{
                padding: "20px",
                borderRadius: 16,
                background: "#F0FDF4",
                border: "1.5px solid #BBF7D0",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#16A34A" }}>My Passes</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Download entry QR tickets</div>
              </div>
              <ArrowRight size={20} color="#16A34A" />
            </Link>

            <Link
              href="/profile"
              style={{
                padding: "20px",
                borderRadius: 16,
                background: "#F0F9FF",
                border: "1.5px solid #BAE6FD",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0284C7" }}>Edit Profile</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Update phone &amp; personal details</div>
              </div>
              <ArrowRight size={20} color="#0284C7" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
