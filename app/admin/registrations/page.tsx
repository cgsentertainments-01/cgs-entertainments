"use client";

import React, { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

interface AdminRegistration {
  id: string;
  registration_number: string;
  amount: number;
  registration_status: string;
  payment_status: string;
  created_at: string;
  events?: {
    title?: string;
    venue?: string;
    city?: string;
  };
  participants?: {
    full_name?: string;
    email?: string;
    phone?: string;
    city?: string;
  };
  event_categories?: {
    name?: string;
  };
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReg, setSelectedReg] = useState<AdminRegistration | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/registrations");
      const data = await res.json();

      if (res.ok && data.success) {
        setRegistrations(data.registrations || []);
      } else {
        setError(data.error || "Failed to fetch registrations.");
      }
    } catch (err: any) {
      console.error("Error fetching registrations:", err);
      setError("Network error fetching registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter((reg) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (reg.registration_number || "").toLowerCase().includes(searchLower) ||
      (reg.participants?.full_name || "").toLowerCase().includes(searchLower) ||
      (reg.participants?.email || "").toLowerCase().includes(searchLower) ||
      (reg.participants?.phone || "").toLowerCase().includes(searchLower) ||
      (reg.events?.title || "").toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" ||
      reg.registration_status === statusFilter ||
      reg.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDownloadCSV = () => {
    const headers = "Registration No,Participant Name,Email,Phone,Event,Category,Date,Amount,Payment Status,Registration Status\n";
    const rows = filteredRegistrations
      .map((r) => {
        const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : "";
        return `"${r.registration_number || r.id}","${r.participants?.full_name || ""}","${r.participants?.email || ""}","${r.participants?.phone || ""}","${r.events?.title || ""}","${r.event_categories?.name || ""}","${dateStr}","₹${r.amount || 0}","${r.payment_status}","${r.registration_status}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", display: "flex", alignItems: "center", gap: 10 }}>
            <Ticket size={28} color="#6D28D9" /> Event Registrations
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
            Live registration records directly synchronized from Supabase PostgreSQL database.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={fetchRegistrations}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              background: "#F3F4F6",
              color: "#374151",
              border: "1px solid #D1D5DB",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={handleDownloadCSV}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "#6D28D9",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: "18px 20px",
          marginBottom: 24,
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search by Registration #, Name, Email, Phone, or Event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 42px",
              borderRadius: 10,
              border: "1px solid #D1D5DB",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={16} color="#6B7280" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #D1D5DB",
              fontSize: 14,
              fontWeight: 600,
              outline: "none",
              background: "#fff",
            }}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="payment_pending">Payment Pending</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: "#FEF2F2", color: "#991B1B", borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Registrations Table */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#6B7280", fontWeight: 700 }}>
            Fetching live registrations from Supabase database...
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>
            <Ticket size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>No Registrations Found</h3>
            <p style={{ fontSize: 14, marginTop: 4 }}>
              {searchQuery ? "Try adjusting your search query or status filter." : "Registered event participants will appear here in real time."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", color: "#4B5563", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>REGISTRATION NO</th>
                <th style={{ padding: "14px 20px" }}>PARTICIPANT</th>
                <th style={{ padding: "14px 20px" }}>EVENT</th>
                <th style={{ padding: "14px 20px" }}>DATE</th>
                <th style={{ padding: "14px 20px" }}>AMOUNT</th>
                <th style={{ padding: "14px 20px" }}>PAYMENT</th>
                <th style={{ padding: "14px 20px" }}>REGISTRATION</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg) => {
                const dateStr = reg.created_at ? new Date(reg.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
                const isPaid = reg.payment_status === "paid";
                const isConfirmed = reg.registration_status === "confirmed";

                return (
                  <tr key={reg.id} style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.2s" }}>
                    <td style={{ padding: "16px 20px", fontWeight: 800, color: "#6D28D9" }}>
                      {reg.registration_number || reg.id.substring(0, 8)}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{reg.participants?.full_name || "N/A"}</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>{reg.participants?.email || reg.participants?.phone || "-"}</div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 700, color: "#1F2937" }}>{reg.events?.title || "N/A"}</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>{reg.event_categories?.name || reg.events?.city || ""}</div>
                    </td>
                    <td style={{ padding: "16px 20px", color: "#4B5563" }}>{dateStr}</td>
                    <td style={{ padding: "16px 20px", fontWeight: 800, color: "#111827" }}>
                      ₹{reg.amount || 0}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 800,
                          background: isPaid ? "#DCFCE7" : "#FEF3C7",
                          color: isPaid ? "#166534" : "#92400E",
                          textTransform: "uppercase",
                        }}
                      >
                        {reg.payment_status || "unpaid"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 800,
                          background: isConfirmed ? "#F3E8FF" : "#F3F4F6",
                          color: isConfirmed ? "#6D28D9" : "#4B5563",
                          textTransform: "uppercase",
                        }}
                      >
                        {reg.registration_status || "pending"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <button
                        onClick={() => setSelectedReg(reg)}
                        style={{
                          padding: "6px 12px",
                          background: "#F3F4F6",
                          color: "#374151",
                          border: "1px solid #D1D5DB",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Details */}
      {selectedReg && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 560, width: "100%", padding: "28px 32px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16, color: "#111827" }}>
              Registration #{selectedReg.registration_number}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14, color: "#374151" }}>
              <div><strong>Participant Name:</strong> {selectedReg.participants?.full_name || "N/A"}</div>
              <div><strong>Email:</strong> {selectedReg.participants?.email || "N/A"}</div>
              <div><strong>Phone:</strong> {selectedReg.participants?.phone || "N/A"}</div>
              <div><strong>Event:</strong> {selectedReg.events?.title || "N/A"}</div>
              <div><strong>Amount Fee:</strong> ₹{selectedReg.amount}</div>
              <div><strong>Payment Status:</strong> {selectedReg.payment_status}</div>
              <div><strong>Registration Status:</strong> {selectedReg.registration_status}</div>
              <div><strong>Date Registered:</strong> {selectedReg.created_at ? new Date(selectedReg.created_at).toLocaleString("en-IN") : "-"}</div>
            </div>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button
                onClick={() => setSelectedReg(null)}
                style={{ padding: "10px 20px", background: "#6D28D9", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
