"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Award, ArrowRight, Sparkles, FileText, BadgeCheck } from "lucide-react";

export default function CertificatesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
        <Navbar />
        <div style={{ maxWidth: 600, margin: "100px auto", padding: "0 24px", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#6D28D9" }}>Loading your certificates...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: "36px auto 64px", padding: "0 24px" }}>
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background: "#FEF3C7",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 800,
              color: "#D97706",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            <Award size={14} color="#D97706" /> Verified Credentials
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.5 }}>
            My Certificates
          </h1>
          <p style={{ fontSize: 15, color: "#64748B", margin: 0, fontWeight: 500 }}>
            View and download all certificates you've earned from CGS Entertainment events.
          </p>
        </div>

        {/* Empty State Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 24,
            border: "1.5px solid #E2E8F0",
            padding: "64px 32px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Empty State Illustration / Icon */}
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
              border: "2px solid #E9D5FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              boxShadow: "0 8px 24px rgba(109, 40, 217, 0.12)",
            }}
          >
            <BadgeCheck size={42} color="#6D28D9" />
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
            No certificates available yet.
          </h3>
          <p style={{ fontSize: 14, color: "#64748B", maxWidth: 440, margin: "0 0 24px", lineHeight: 1.6 }}>
            Certificates will appear here automatically after participating in and completing CGS Entertainment championship events.
          </p>

          <Link
            href="/events"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 26px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
              color: "#ffffff",
              fontSize: 14.5,
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(109, 40, 217, 0.28)",
              transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            Browse Events
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
