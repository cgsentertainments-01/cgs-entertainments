"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />

      <div style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #3730A3 50%, #6D28D9 100%)", paddingTop: 64 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "44px 32px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Link href="/" style={{ fontSize: 13, color: "#C4B5FD", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={14} color="#7C3AED" />
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Privacy Policy</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: "#fff", margin: "0 0 10px" }}>Privacy Policy</h1>
          <p style={{ fontSize: 16, color: "#C4B5FD", margin: 0 }}>How we collect, use, and protect your personal information.</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 60px" }}>
        <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 20, padding: "36px", display: "flex", flexDirection: "column", gap: 24, fontSize: 14, color: "#4B5563", lineHeight: 1.8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>Information We Collect</h2>
          <p style={{ margin: 0 }}>We collect participant details such as name, email, phone number, date of birth, and city when registering for events.</p>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>How We Use Information</h2>
          <p style={{ margin: 0 }}>Your data is used solely to issue participant passes, send event notifications via WhatsApp/Email, and verify event check-ins.</p>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>Data Security</h2>
          <p style={{ margin: 0 }}>We implement strict security measures to protect your personal information and never sell data to third parties.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
