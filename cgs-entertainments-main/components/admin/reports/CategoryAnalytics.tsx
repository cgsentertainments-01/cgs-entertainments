"use client";

import React from "react";
import { Layers, FolderCheck } from "lucide-react";

export interface CategoryPerformanceItem {
  id: string;
  name: string;
  eventsCount: number;
  registrations: number;
  participants: number;
  attended: number;
  percentage: number;
}

interface CategoryAnalyticsProps {
  categories: CategoryPerformanceItem[];
  loading?: boolean;
}

const CATEGORY_COLORS = [
  "#7C3AED", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#6366F1", // Indigo
  "#3B82F6", // Blue
];

export function CategoryAnalytics({ categories = [], loading = false }: CategoryAnalyticsProps) {
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
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.3 }}>
          Category Performance
        </h2>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Distribution of registrations, participants, and event counts across categories
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "30px", textAlign: "center", color: "#94A3B8", fontSize: 13, fontWeight: 600 }}>
          Loading category analytics...
        </div>
      ) : categories.length === 0 ? (
        <div style={{ padding: "30px", textAlign: "center", color: "#64748B", fontSize: 13, fontWeight: 600 }}>
          No category data available for the active filters.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {categories.map((cat, idx) => {
            const barColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

            return (
              <div
                key={cat.id || idx}
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {/* Header Line */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: barColor }} />
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{cat.name}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", background: "#E2E8F0", padding: "2px 8px", borderRadius: 6 }}>
                      {cat.eventsCount} Event{cat.eventsCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, fontWeight: 700 }}>
                    <div style={{ color: "#7C3AED" }}>
                      <strong>{cat.registrations}</strong> Regs
                    </div>
                    <div style={{ color: "#06B6D4" }}>
                      <strong>{cat.participants}</strong> Participants
                    </div>
                    <div style={{ color: "#15803D" }}>
                      <strong>{cat.attended}</strong> Attended
                    </div>
                    <div style={{ background: "#ffffff", padding: "3px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12, fontWeight: 800, color: "#0F172A" }}>
                      {cat.percentage}% of total
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: "100%", height: 10, background: "#E2E8F0", borderRadius: 6, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.max(cat.percentage, 3)}%`,
                      height: "100%",
                      background: barColor,
                      borderRadius: 6,
                      transition: "width 0.6s ease-in-out",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
