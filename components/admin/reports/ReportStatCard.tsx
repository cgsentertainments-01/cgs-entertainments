"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface ReportStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  indicatorText?: string;
  indicatorType?: "positive" | "negative" | "neutral" | "purple";
  loading?: boolean;
}

export function ReportStatCard({
  label,
  value,
  icon: Icon,
  iconColor = "#7C3AED",
  iconBg = "#F3E8FF",
  indicatorText,
  indicatorType = "neutral",
  loading = false,
}: ReportStatCardProps) {
  if (loading) {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          border: "1.5px solid #E2E8F0",
          padding: "20px 22px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          animation: "pulse 1.5s infinite ease-in-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ height: 14, width: 100, background: "#E2E8F0", borderRadius: 6 }} />
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F5F9" }} />
        </div>
        <div style={{ height: 32, width: 90, background: "#CBD5E1", borderRadius: 8 }} />
        <div style={{ height: 14, width: 120, background: "#F1F5F9", borderRadius: 6 }} />
      </div>
    );
  }

  let indicatorColor = "#64748B";
  let indicatorBg = "transparent";

  if (indicatorType === "positive") {
    indicatorColor = "#15803D";
    indicatorBg = "#DCFCE7";
  } else if (indicatorType === "negative") {
    indicatorColor = "#B91C1C";
    indicatorBg = "#FEE2E2";
  } else if (indicatorType === "purple") {
    indicatorColor = "#6D28D9";
    indicatorBg = "#F3E8FF";
  }

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        border: "1.5px solid #E2E8F0",
        padding: "20px 22px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      className="hover-card-elevation"
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: -0.1 }}>
          {label}
        </span>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={iconColor} />
        </div>
      </div>

      <div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: -0.6, lineHeight: 1.1 }}>
          {value}
        </div>
        {indicatorText && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: indicatorColor,
              background: indicatorBg,
              padding: indicatorBg !== "transparent" ? "3px 8px" : "0",
              borderRadius: 6,
              display: "inline-block",
              marginTop: 6,
            }}
          >
            {indicatorText}
          </div>
        )}
      </div>
    </div>
  );
}
