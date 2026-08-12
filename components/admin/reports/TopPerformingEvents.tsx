"use client";

import React from "react";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

export interface TopEventItem {
  rank: number;
  id: string;
  title: string;
  categoryName: string;
  registrations: number;
  attendanceRate: number;
  certificatesIssued: number;
}

interface TopPerformingEventsProps {
  events: TopEventItem[];
  loading?: boolean;
}

export function TopPerformingEvents({ events = [], loading = false }: TopPerformingEventsProps) {
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.3 }}>
            Top Performing Events
          </h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Ranked by registration count, turnout performance, and certificate distribution
          </p>
        </div>
        <div style={{ padding: 8, borderRadius: 12, background: "#FEF3C7", color: "#D97706" }}>
          <Trophy size={20} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "30px", textAlign: "center", color: "#94A3B8", fontSize: 13, fontWeight: 600 }}>
          Loading top events leaderboard...
        </div>
      ) : events.length === 0 ? (
        <div style={{ padding: "30px", textAlign: "center", color: "#64748B", fontSize: 13, fontWeight: 600 }}>
          No event performance data available.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {events.map((evt) => {
            let rankBadgeBg = "#F1F5F9";
            let rankBadgeColor = "#475569";
            let RankIcon = Medal;

            if (evt.rank === 1) {
              rankBadgeBg = "linear-gradient(135deg, #F59E0B, #D97706)";
              rankBadgeColor = "#ffffff";
              RankIcon = Trophy;
            } else if (evt.rank === 2) {
              rankBadgeBg = "linear-gradient(135deg, #94A3B8, #64748B)";
              rankBadgeColor = "#ffffff";
            } else if (evt.rank === 3) {
              rankBadgeBg = "linear-gradient(135deg, #D97706, #B45309)";
              rankBadgeColor = "#ffffff";
            }

            return (
              <div
                key={evt.id || evt.rank}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 14,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                className="hover-card-elevation"
              >
                {/* Left Rank & Details */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: rankBadgeBg,
                      color: rankBadgeColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 16,
                      boxShadow: evt.rank <= 3 ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    #{evt.rank}
                  </div>

                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 2px" }}>
                      {evt.title}
                    </h3>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", background: "#F1F5F9", padding: "2px 8px", borderRadius: 6 }}>
                      {evt.categoryName}
                    </span>
                  </div>
                </div>

                {/* Right Performance Stats */}
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#7C3AED" }}>{evt.registrations}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Registrations</div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: evt.attendanceRate > 70 ? "#15803D" : "#D97706" }}>
                      {evt.attendanceRate}%
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Attendance</div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#0284C7" }}>{evt.certificatesIssued}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Certificates</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
