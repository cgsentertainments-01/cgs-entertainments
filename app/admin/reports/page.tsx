"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, Download, Calendar, Users, IndianRupee, Filter } from "lucide-react";

export default function AdminReportsPage() {
  const [timeframe, setTimeframe] = useState("Month");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
            Analytics &amp; Executive Reports
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Comprehensive performance metrics for events, registrations, and revenue analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Downloading executive analytics report (PDF)...")}
          style={{
            padding: "11px 20px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
          }}
        >
          <Download size={18} /> Export Full PDF Report
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "20px 22px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B", marginBottom: 2 }}>Monthly Revenue</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#0F172A" }}>₹3,45,680</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", marginTop: 4 }}>+18.6% growth</div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "20px 22px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B", marginBottom: 2 }}>Total Registrations</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#0F172A" }}>987</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", marginTop: 4 }}>94% seat conversion</div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "20px 22px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B", marginBottom: 2 }}>Average Ticket Price</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#0F172A" }}>₹1,450</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginTop: 4 }}>Across 5 categories</div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "20px 22px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B", marginBottom: 2 }}>Certificates Issued</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#0F172A" }}>412</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#6D28D9", marginTop: 4 }}>100% verified</div>
        </div>
      </div>

      {/* Main Bar Chart Section */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 24,
          border: "1.5px solid #E2E8F0",
          padding: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
            Category Revenue Breakdown (2026 Season)
          </h2>

          <div style={{ display: "flex", gap: 8 }}>
            {["Week", "Month", "Year"].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  background: timeframe === tf ? "#7C3AED" : "#F1F5F9",
                  color: timeframe === tf ? "#ffffff" : "#475569",
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Bar Chart Visualizer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { category: "Dance Competitions", revenue: "₹1,85,400", pct: 85, color: "#7C3AED" },
            { category: "Modeling & Fashion Hunts", revenue: "₹95,200", pct: 60, color: "#EC4899" },
            { category: "Singing Auditions", revenue: "₹42,100", pct: 40, color: "#06B6D4" },
            { category: "Acting Excellence Awards", revenue: "₹22,980", pct: 25, color: "#F59E0B" },
          ].map((item) => (
            <div key={item.category}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
                <span>{item.category}</span>
                <span>{item.revenue}</span>
              </div>
              <div style={{ width: "100%", height: 12, background: "#F1F5F9", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: 6, transition: "width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
