"use client";

import React, { useState } from "react";
import { TrendingUp, Users, Calendar } from "lucide-react";

export interface RegistrationTrendItem {
  key: string;
  label: string;
  registrations: number;
  participants: number;
}

interface RegistrationChartProps {
  data: RegistrationTrendItem[];
  groupBy: "daily" | "weekly" | "monthly";
  onGroupByChange: (mode: "daily" | "weekly" | "monthly") => void;
  loading?: boolean;
}

export function RegistrationChart({
  data = [],
  groupBy,
  onGroupByChange,
  loading = false,
}: RegistrationChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => Math.max(d.registrations, d.participants, 1)), 5);

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 24,
        border: "1.5px solid #E2E8F0",
        padding: "24px 28px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Chart Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: -0.3 }}>
              Registration Overview
            </h2>
            <div style={{ padding: "4px 8px", background: "#F3E8FF", borderRadius: 8, fontSize: 11.5, fontWeight: 800, color: "#6D28D9", display: "flex", alignItems: "center", gap: 4 }}>
              <TrendingUp size={14} /> Live Trend
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0", fontWeight: 500 }}>
            Registration velocity and participant trends across selected timeframes
          </p>
        </div>

        {/* View Mode Toggle Switch */}
        <div style={{ display: "flex", background: "#F1F5F9", padding: 4, borderRadius: 12, gap: 4 }}>
          {(["daily", "weekly", "monthly"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onGroupByChange(mode)}
              style={{
                padding: "6px 16px",
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: groupBy === mode ? 800 : 600,
                border: "none",
                cursor: "pointer",
                background: groupBy === mode ? "#ffffff" : "transparent",
                color: groupBy === mode ? "#6D28D9" : "#64748B",
                boxShadow: groupBy === mode ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s ease",
                textTransform: "capitalize",
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 12.5, fontWeight: 700 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "#7C3AED" }} />
          <span style={{ color: "#334155" }}>Registrations</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "#06B6D4" }} />
          <span style={{ color: "#334155" }}>Unique Participants</span>
        </div>
      </div>

      {/* Chart Canvas area */}
      {loading ? (
        <div
          style={{
            height: 240,
            width: "100%",
            background: "#F8FAFC",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94A3B8",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Loading registration trend data...
        </div>
      ) : data.length === 0 ? (
        <div
          style={{
            height: 220,
            width: "100%",
            background: "#F8FAFC",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#94A3B8",
            gap: 8,
          }}
        >
          <Calendar size={32} color="#CBD5E1" />
          <div style={{ fontSize: 14, fontWeight: 700, color: "#64748B" }}>No registrations recorded in this period</div>
          <div style={{ fontSize: 12, color: "#94A3B8" }}>Try selecting a broader date range or clearing filters</div>
        </div>
      ) : (
        <div style={{ position: "relative", width: "100%", marginTop: 8 }}>
          {/* Bar / Column Chart Visual */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              height: 220,
              gap: 12,
              paddingBottom: 28,
              borderBottom: "1.5px dashed #E2E8F0",
              position: "relative",
            }}
          >
            {data.map((item, idx) => {
              const regHeightPct = Math.max(8, (item.registrations / maxVal) * 100);
              const partHeightPct = Math.max(6, (item.participants / maxVal) * 100);
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={item.key || idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "flex-end",
                    position: "relative",
                    cursor: "pointer",
                  }}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "105%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#0F172A",
                        color: "#ffffff",
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        zIndex: 20,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                        pointerEvents: "none",
                        lineHeight: 1.4,
                      }}
                    >
                      <div style={{ color: "#E2E8F0", fontSize: 11, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ color: "#A78BFA" }}>Registrations: <strong>{item.registrations}</strong></div>
                      <div style={{ color: "#67E8F9" }}>Participants: <strong>{item.participants}</strong></div>
                    </div>
                  )}

                  {/* Dual Bar Group */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, width: "100%", justifyContent: "center", height: "100%" }}>
                    {/* Registrations Bar */}
                    <div
                      style={{
                        width: "40%",
                        maxWidth: 24,
                        minWidth: 8,
                        height: `${regHeightPct}%`,
                        background: isHovered ? "linear-gradient(180deg, #8B5CF6 0%, #6D28D9 100%)" : "linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)",
                        borderRadius: "6px 6px 0 0",
                        transition: "all 0.25s ease",
                        boxShadow: isHovered ? "0 4px 12px rgba(124, 58, 237, 0.4)" : "none",
                      }}
                    />
                    {/* Unique Participants Bar */}
                    <div
                      style={{
                        width: "40%",
                        maxWidth: 24,
                        minWidth: 8,
                        height: `${partHeightPct}%`,
                        background: isHovered ? "linear-gradient(180deg, #22D3EE 0%, #0891B2 100%)" : "linear-gradient(180deg, #67E8F9 0%, #06B6D4 100%)",
                        borderRadius: "6px 6px 0 0",
                        transition: "all 0.25s ease",
                        boxShadow: isHovered ? "0 4px 12px rgba(6, 182, 212, 0.4)" : "none",
                      }}
                    />
                  </div>

                  {/* Date Label Below Bar */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -24,
                      fontSize: 11,
                      fontWeight: isHovered ? 800 : 600,
                      color: isHovered ? "#7C3AED" : "#64748B",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
