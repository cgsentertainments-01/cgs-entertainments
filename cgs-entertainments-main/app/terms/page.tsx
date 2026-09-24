"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />

      <div style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #3730A3 50%, #6D28D9 100%)", paddingTop: 64 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "44px 32px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Link href="/" style={{ fontSize: 13, color: "#C4B5FD", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={14} color="#7C3AED" />
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Terms &amp; Conditions</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: "#fff", margin: "0 0 10px" }}>Terms &amp; Conditions</h1>
          <p style={{ fontSize: 16, color: "#C4B5FD", margin: 0 }}>Please read these terms carefully before registering for any CGS Entertainments event.</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 60px" }}>
        <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 20, padding: "36px", display: "flex", flexDirection: "column", gap: 24, fontSize: 14, color: "#4B5563", lineHeight: 1.8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>1. Event Registration</h2>
          <p style={{ margin: 0 }}>By registering for an event, you agree to abide by the event rules, age eligibility requirements, and schedule set by CGS Entertainments.</p>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>2. Fees &amp; Payments</h2>
          <p style={{ margin: 0 }}>All registration fees are non-refundable unless an event is canceled by CGS Entertainments. Payments are processed securely.</p>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>3. Code of Conduct</h2>
          <p style={{ margin: 0 }}>Participants must demonstrate professional behavior, sportsmanship, and respect towards judges, staff, and fellow contestants.</p>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>4. Media Rights</h2>
          <p style={{ margin: 0 }}>CGS Entertainments reserves the right to use photographs and video recordings taken during events for promotional purposes.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
