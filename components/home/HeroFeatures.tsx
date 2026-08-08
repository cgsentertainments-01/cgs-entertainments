"use client";

import React from "react";

const FEATURES = [
  {
    bg: "#EDE9FE",
    color: "#6D28D9",
    top: "All Age Groups",
    bot: "Welcome",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3" stroke="#6D28D9" strokeWidth="2" />
        <circle cx="17" cy="8" r="2.5" stroke="#6D28D9" strokeWidth="1.8" />
        <path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 14c2.21 0 4 1.57 4 3.5" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    bg: "#FCE7F3",
    color: "#DB2777",
    top: "Exciting Prizes",
    bot: "& Rewards",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M8 3h8l1 5H7L8 3z" stroke="#DB2777" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="5" stroke="#DB2777" strokeWidth="2" />
        <path d="M9.5 20.5l2.5-2 2.5 2" stroke="#DB2777" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7 8c-2 1-3 2.5-3 4.5M17 8c2 1 3 2.5 3 4.5" stroke="#DB2777" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    bg: "#DBEAFE",
    color: "#2563EB",
    top: "Secure &",
    bot: "Safe Events",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6L12 2z" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" fill="#DBEAFE" />
        <path d="M9 12l2 2 4-4" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    bg: "#FEF3C7",
    color: "#D97706",
    top: "Professional",
    bot: "Stage",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="14" width="20" height="7" rx="2" stroke="#D97706" strokeWidth="2" fill="#FEF3C7" />
        <path d="M7 14V8M12 14V5M17 14V9" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function HeroFeatures() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }} className="feature-badges">
      {FEATURES.map((f, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: f.bg,
              color: f.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            {f.icon}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{f.top}</div>
            <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 500, lineHeight: 1.3 }}>{f.bot}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
