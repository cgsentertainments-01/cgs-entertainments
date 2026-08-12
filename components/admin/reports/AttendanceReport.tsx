"use client";

import React from "react";
import { UserCheck, UserX, Users, Percent } from "lucide-react";

export interface AttendanceReportData {
  registered: number;
  attended: number;
  absent: number;
  attendanceRate: number;
}

interface AttendanceReportProps {
  data: AttendanceReportData;
  loading?: boolean;
}

export function AttendanceReport({ data, loading = false }: AttendanceReportProps) {
  const attendedPct = data.registered > 0 ? Math.round((data.attended / data.registered) * 100) : 0;
  const absentPct = 100 - attendedPct;

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
          Attendance Overview
        </h2>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Attendance breakdown and turnout conversion rate for event registrations
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "30px", textAlign: "center", color: "#94A3B8", fontSize: 13, fontWeight: 600 }}>
          Loading attendance metrics...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {/* Registered Participants */}
          <div style={{ background: "#F8FAFC", borderRadius: 16, border: "1px solid #E2E8F0", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ padding: 8, borderRadius: 10, background: "#EFF6FF", color: "#2563EB" }}>
                <Users size={18} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>Registered</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#0F172A" }}>{data.registered}</div>
            <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 4, fontWeight: 600 }}>Total Event Seats</div>
          </div>

          {/* Attended Participants */}
          <div style={{ background: "#F0FDF4", borderRadius: 16, border: "1px solid #DCFCE7", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ padding: 8, borderRadius: 10, background: "#DCFCE7", color: "#16A34A" }}>
                <UserCheck size={18} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#15803D" }}>Attended</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#16A34A" }}>{data.attended}</div>
            <div style={{ fontSize: 11.5, color: "#15803D", marginTop: 4, fontWeight: 700 }}>
              {attendedPct}% of registered
            </div>
          </div>

          {/* Absent Participants */}
          <div style={{ background: "#FEF2F2", borderRadius: 16, border: "1px solid #FEE2E2", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ padding: 8, borderRadius: 10, background: "#FEE2E2", color: "#DC2626" }}>
                <UserX size={18} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#991B1B" }}>Absent / Pending</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#DC2626" }}>{data.absent}</div>
            <div style={{ fontSize: 11.5, color: "#991B1B", marginTop: 4, fontWeight: 700 }}>
              {absentPct}% unverified / no-show
            </div>
          </div>

          {/* Overall Attendance Rate */}
          <div style={{ background: "#F3E8FF", borderRadius: 16, border: "1px solid #E9D5FF", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ padding: 8, borderRadius: 10, background: "#DDD6FE", color: "#6D28D9" }}>
                <Percent size={18} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#6D28D9" }}>Turnout Rate</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#6D28D9" }}>{data.attendanceRate}%</div>
            <div style={{ fontSize: 11.5, color: "#5B21B6", marginTop: 4, fontWeight: 700 }}>Attendance Benchmark</div>
          </div>
        </div>
      )}

      {/* Visual Turnout Distribution Bar */}
      {!loading && data.registered > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800 }}>
            <span style={{ color: "#16A34A" }}>Attended ({attendedPct}%)</span>
            <span style={{ color: "#DC2626" }}>Absent / Pending ({absentPct}%)</span>
          </div>
          <div style={{ width: "100%", height: 12, background: "#FEE2E2", borderRadius: 6, overflow: "hidden", display: "flex" }}>
            <div style={{ width: `${attendedPct}%`, height: "100%", background: "#22C55E", transition: "width 0.6s ease" }} />
            <div style={{ width: `${absentPct}%`, height: "100%", background: "#EF4444", transition: "width 0.6s ease" }} />
          </div>
        </div>
      )}
    </div>
  );
}
