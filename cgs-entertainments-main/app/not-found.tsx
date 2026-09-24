"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px" }}>
        <div style={{ textAlign: "center", maxWidth: 480, background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 24, padding: "48px 32px" }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: "#6D28D9", lineHeight: 1 }}>404</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "16px 0 8px" }}>
            Page Not Found
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 24px" }}>
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "#6D28D9",
              color: "#fff",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Return to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
