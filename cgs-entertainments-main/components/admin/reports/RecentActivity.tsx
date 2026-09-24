"use client";

import React from "react";
import { Activity, CalendarPlus, UserCheck, Award, CheckCircle2, Clock } from "lucide-react";

export interface RecentActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  type: "event_created" | "registration" | "certificate" | "event_completed";
}

interface RecentActivityProps {
  activities: RecentActivityItem[];
  loading?: boolean;
}

export function RecentActivity({ activities = [], loading = false }: RecentActivityProps) {
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
            Recent Activity
          </h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Audit log feed of live platform actions, registrations, and certificate issuances
          </p>
        </div>
        <div style={{ padding: 8, borderRadius: 10, background: "#F3E8FF", color: "#7C3AED" }}>
          <Activity size={20} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "30px", textAlign: "center", color: "#94A3B8", fontSize: 13, fontWeight: 600 }}>
          Loading recent activities...
        </div>
      ) : activities.length === 0 ? (
        <div style={{ padding: "30px", textAlign: "center", color: "#64748B", fontSize: 13, fontWeight: 600 }}>
          No recent activity logs recorded yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
          {activities.map((act, idx) => {
            let icon = <UserCheck size={18} />;
            let iconBg = "#EFF6FF";
            let iconColor = "#2563EB";

            if (act.type === "event_created") {
              icon = <CalendarPlus size={18} />;
              iconBg = "#F3E8FF";
              iconColor = "#7C3AED";
            } else if (act.type === "certificate") {
              icon = <Award size={18} />;
              iconBg = "#FEF3C7";
              iconColor = "#D97706";
            } else if (act.type === "event_completed") {
              icon = <CheckCircle2 size={18} />;
              iconBg = "#DCFCE7";
              iconColor = "#16A34A";
            }

            return (
              <div
                key={act.id || idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  transition: "background 0.2s ease",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: iconBg,
                    color: iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0F172A" }}>
                      {act.title}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <Clock size={12} /> {act.timeAgo}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#475569", marginTop: 2, fontWeight: 500 }}>
                    {act.subtitle}
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
