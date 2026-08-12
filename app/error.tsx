"use client";

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error handler:", error);
  }, [error]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Something went wrong!</h2>
      <p style={{ color: "#64748B", marginBottom: 20 }}>An error occurred while loading this page.</p>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 24px",
          borderRadius: 10,
          background: "#6D28D9",
          color: "#fff",
          border: "none",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
