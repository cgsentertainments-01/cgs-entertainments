"use client";

import React from "react";

export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#fff",
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "3.5px solid #EDE9FE",
        borderTopColor: "#6D28D9",
        animation: "spin 0.8s linear infinite",
      }} />
      <span style={{ fontSize: 14, fontWeight: 700, color: "#6D28D9", letterSpacing: 0.5 }}>
        Loading CGS Entertainments...
      </span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
