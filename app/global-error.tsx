"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: 40,
          textAlign: "center",
          background: "#F8FAFC",
          color: "#0F172A",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 500,
            width: "100%",
            background: "#ffffff",
            borderRadius: 20,
            padding: 36,
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>
            Application Error
          </h2>
          <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
            {error?.message || "An unexpected system error occurred."}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "12px 28px",
              borderRadius: 10,
              background: "#6D28D9",
              color: "#ffffff",
              border: "none",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
