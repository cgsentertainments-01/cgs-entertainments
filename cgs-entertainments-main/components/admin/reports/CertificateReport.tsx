"use client";

import React from "react";
import { Award, CheckCircle2, Clock, ShieldX, FileText } from "lucide-react";

export interface EventCertificateItem {
  eventId: string;
  eventTitle: string;
  eligible: number;
  issued: number;
  pending: number;
}

export interface CertificateReportData {
  eligible: number;
  issued: number;
  pending: number;
  revoked: number;
  eventBreakdown: EventCertificateItem[];
}

interface CertificateReportProps {
  data: CertificateReportData;
  loading?: boolean;
}

export function CertificateReport({ data, loading = false }: CertificateReportProps) {
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
        gap: 24,
      }}
    >
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.3 }}>
          Certificate Overview
        </h2>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Tracking digital certificate issuance, eligibility status, and event-wise fulfilment
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "30px", textAlign: "center", color: "#94A3B8", fontSize: 13, fontWeight: 600 }}>
          Loading certificate metrics...
        </div>
      ) : (
        <>
          {/* Top 4 Metric Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {/* Eligible */}
            <div style={{ background: "#F8FAFC", borderRadius: 16, border: "1px solid #E2E8F0", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Award size={18} color="#6366F1" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>Eligible Participants</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#0F172A" }}>{data.eligible}</div>
            </div>

            {/* Issued */}
            <div style={{ background: "#F0FDF4", borderRadius: 16, border: "1px solid #DCFCE7", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <CheckCircle2 size={18} color="#16A34A" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#15803D" }}>Certificates Issued</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#16A34A" }}>{data.issued}</div>
            </div>

            {/* Pending */}
            <div style={{ background: "#FEF3C7", borderRadius: 16, border: "1px solid #FDE68A", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Clock size={18} color="#D97706" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#B45309" }}>Certificates Pending</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#D97706" }}>{data.pending}</div>
            </div>

            {/* Revoked */}
            <div style={{ background: "#FEF2F2", borderRadius: 16, border: "1px solid #FEE2E2", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <ShieldX size={18} color="#DC2626" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#991B1B" }}>Certificates Revoked</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#DC2626" }}>{data.revoked}</div>
            </div>
          </div>

          {/* Event-Wise Certificate Table */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#334155", margin: "0 0 12px" }}>
              Event-Wise Certificate Status
            </h3>
            {data.eventBreakdown.length === 0 ? (
              <div style={{ fontSize: 13, color: "#94A3B8" }}>No event certificate breakdown available.</div>
            ) : (
              <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 700 }}>
                      <th style={{ padding: "12px 16px" }}>Event Title</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Eligible</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Issued</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.eventBreakdown.map((row, idx) => (
                      <tr
                        key={row.eventId || idx}
                        style={{
                          borderBottom: idx === data.eventBreakdown.length - 1 ? "none" : "1px solid #F1F5F9",
                          background: idx % 2 === 0 ? "#ffffff" : "#FAFAFA",
                        }}
                      >
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0F172A" }}>
                          {row.eventTitle}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "#334155" }}>
                          {row.eligible}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800, color: "#16A34A" }}>
                          {row.issued}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800, color: row.pending > 0 ? "#D97706" : "#64748B" }}>
                          {row.pending}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
