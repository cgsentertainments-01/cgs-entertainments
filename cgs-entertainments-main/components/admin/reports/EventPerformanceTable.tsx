"use client";

import React, { useState, useMemo } from "react";
import { Search, ArrowUpDown, Calendar, Award, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export interface EventPerformanceItem {
  id: string;
  title: string;
  categoryName: string;
  eventDate: string | null;
  registrations: number;
  attended: number;
  attendanceRate: number;
  certificates: number;
  status: string;
}

interface EventPerformanceTableProps {
  events: EventPerformanceItem[];
  loading?: boolean;
}

type SortField = "title" | "categoryName" | "eventDate" | "registrations" | "attendanceRate" | "certificates" | "status";
type SortOrder = "asc" | "desc";

export function EventPerformanceTable({ events = [], loading = false }: EventPerformanceTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("registrations");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = events.filter((e) => {
      const query = search.toLowerCase().trim();
      if (!query) return true;
      return (
        e.title.toLowerCase().includes(query) ||
        e.categoryName.toLowerCase().includes(query) ||
        e.status.toLowerCase().includes(query)
      );
    });

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "eventDate") {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [events, search, sortField, sortOrder]);

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 24,
        border: "1.5px solid #E2E8F0",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {/* Table Section Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.3 }}>
            Event Performance
          </h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Comprehensive matrix showing registrations, attendance rates, and certificate metrics per event
          </p>
        </div>

        {/* Live Search Input */}
        <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
          <Search size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search event name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 14px 9px 38px",
              borderRadius: 12,
              border: "1.5px solid #E2E8F0",
              fontSize: 13,
              outline: "none",
              background: "#F8FAFC",
              color: "#0F172A",
              fontWeight: 500,
            }}
          />
        </div>
      </div>

      {/* Table Data View */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: 13, fontWeight: 600 }}>
          Loading event performance statistics...
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B", fontSize: 14, fontWeight: 600 }}>
          No events found matching your search.
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid #E2E8F0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0", color: "#475569", fontWeight: 700 }}>
                <th
                  onClick={() => handleSort("title")}
                  style={{ padding: "14px 18px", cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    Event <ArrowUpDown size={13} color="#94A3B8" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("categoryName")}
                  style={{ padding: "14px 18px", cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    Category <ArrowUpDown size={13} color="#94A3B8" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("eventDate")}
                  style={{ padding: "14px 18px", cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    Date <ArrowUpDown size={13} color="#94A3B8" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("registrations")}
                  style={{ padding: "14px 18px", cursor: "pointer", userSelect: "none", textAlign: "center" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    Registrations <ArrowUpDown size={13} color="#94A3B8" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("attendanceRate")}
                  style={{ padding: "14px 18px", cursor: "pointer", userSelect: "none", textAlign: "center" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    Attendance <ArrowUpDown size={13} color="#94A3B8" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("certificates")}
                  style={{ padding: "14px 18px", cursor: "pointer", userSelect: "none", textAlign: "center" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    Certificates <ArrowUpDown size={13} color="#94A3B8" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("status")}
                  style={{ padding: "14px 18px", cursor: "pointer", userSelect: "none", textAlign: "right" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                    Status <ArrowUpDown size={13} color="#94A3B8" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((item, idx) => {
                const formattedDate = item.eventDate
                  ? new Date(item.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                  : "TBA";

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: idx === filteredAndSorted.length - 1 ? "none" : "1px solid #F1F5F9",
                      background: idx % 2 === 0 ? "#ffffff" : "#FAFAFA",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* Title */}
                    <td style={{ padding: "14px 18px", fontWeight: 800, color: "#0F172A" }}>
                      {item.title}
                    </td>

                    {/* Category */}
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ background: "#F1F5F9", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#475569" }}>
                        {item.categoryName}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "14px 18px", color: "#64748B", fontWeight: 600, fontSize: 13 }}>
                      {formattedDate}
                    </td>

                    {/* Registrations */}
                    <td style={{ padding: "14px 18px", textAlign: "center", fontWeight: 800, color: "#7C3AED" }}>
                      {item.registrations}
                    </td>

                    {/* Attendance */}
                    <td style={{ padding: "14px 18px", textAlign: "center" }}>
                      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, color: item.attendanceRate > 70 ? "#15803D" : "#D97706" }}>
                          {item.attendanceRate}%
                        </span>
                        <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>
                          ({item.attended} / {item.registrations})
                        </span>
                      </div>
                    </td>

                    {/* Certificates */}
                    <td style={{ padding: "14px 18px", textAlign: "center", fontWeight: 800, color: "#0284C7" }}>
                      {item.certificates}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  let bg = "#F1F5F9";
  let color = "#475569";
  let border = "#CBD5E1";

  if (s === "upcoming") {
    bg = "#EFF6FF";
    color = "#1D4ED8";
    border = "#BFDBFE";
  } else if (s === "ongoing") {
    bg = "#FDF2F8";
    color = "#DB2777";
    border = "#FBCFE8";
  } else if (s === "completed") {
    bg = "#F0FDF4";
    color = "#15803D";
    border = "#BBF7D0";
  } else if (s === "draft") {
    bg = "#FEF3C7";
    color = "#B45309";
    border = "#FDE68A";
  }

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 800,
        background: bg,
        color: color,
        border: `1px solid ${border}`,
        display: "inline-block",
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}
