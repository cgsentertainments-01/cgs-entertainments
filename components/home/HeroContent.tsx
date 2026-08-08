"use client";

import React from "react";
import { HeroFeatures } from "./HeroFeatures";

export function HeroContent() {
  return (
    <div
      style={{
        width: "41%",
        flexShrink: 0,
        padding: "44px 28px 40px 32px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      className="hero-left"
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#6D28D9",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        CGS ENTERTAINMENTS
      </p>

      <h1
        style={{
          fontSize: 66,
          fontWeight: 900,
          color: "#0F0F0F",
          lineHeight: 1.0,
          margin: 0,
          letterSpacing: -2,
        }}
        className="hero-h1"
      >
        DANCE
      </h1>

      <h2
        style={{
          fontSize: 66,
          fontWeight: 900,
          color: "#EC4899",
          lineHeight: 1.0,
          margin: "0 0 16px",
          letterSpacing: -2,
        }}
        className="hero-h2"
      >
        COMPETITION 2026
      </h2>

      <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, marginBottom: 18 }}>
        Show Your Talent. Shine On Stage. Be A Star!
      </p>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 30 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#1F2937" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="#6D28D9" strokeWidth="2" />
            <path d="M3 9h18M8 2v4M16 2v4" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" />
          </svg>
          20 - 22 March, 2026
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#1F2937" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EC4899" />
            <circle cx="12" cy="9" r="2.5" fill="#fff" />
          </svg>
          Hyderabad, Telangana
        </span>
      </div>

      <HeroFeatures />
    </div>
  );
}
