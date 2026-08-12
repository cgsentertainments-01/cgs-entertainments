"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  XCircle,
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
  registration_payments?: Array<{
    id?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    status?: string;
    paid_at?: string;
  }> | {
    id?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    status?: string;
    paid_at?: string;
  };
}

export default function AdminPaymentsPage() {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/registrations");
      const data = await res.json();

      if (res.ok && data.success) {
        setRegistrations(data.registrations || []);
      } else {
        setError(data.error || "Failed to load payments data.");
      }
    } catch (err: any) {
      console.error("Error fetching admin payments:", err);
      setError("Network error loading payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const getRazorpayPaymentId = (reg: AdminRegistration) => {
    if (Array.isArray(reg.registration_payments)) {
      return reg.registration_payments[0]?.razorpay_payment_id || "-";
    }
    if (reg.registration_payments && typeof reg.registration_payments === "object") {
      return reg.registration_payments.razorpay_payment_id || "-";
    }
    return "-";
  };

  const getRazorpayOrderId = (reg: AdminRegistration) => {
    if (Array.isArray(reg.registration_payments)) {
      return reg.registration_payments[0]?.razorpay_order_id || "-";
    }
    if (reg.registration_payments && typeof reg.registration_payments === "object") {
      return reg.registration_payments.razorpay_order_id || "-";
    }
    return "-";
  };

  // Calculations for KPI metric cards
  const totalRevenue = registrations.reduce((acc, r) => {
    const isPaid = (r.payment_status || "").toLowerCase() === "paid";
    return isPaid ? acc + Number(r.amount || 0) : acc;
  }, 0);

  const pendingAmount = registrations.reduce((acc, r) => {
    const s = (r.payment_status || "").toLowerCase();
    const isPending = s === "unpaid" || s === "pending" || s === "payment_pending";
    return isPending ? acc + Number(r.amount || 0) : acc;
  }, 0);

  const pendingCount = registrations.filter((r) => {
    const s = (r.payment_status || "").toLowerCase();
    return s === "unpaid" || s === "pending" || s === "payment_pending";
  }).length;

  const paidCount = registrations.filter((r) => (r.payment_status || "").toLowerCase() === "paid").length;
  const successRate = registrations.length > 0 ? ((paidCount / registrations.length) * 100).toFixed(1) : "100.0";

  // Filtered rows
  const filteredPayments = registrations.filter((r) => {
    const searchLower = searchQuery.toLowerCase();
    const payId = getRazorpayPaymentId(r).toLowerCase();
    const orderId = getRazorpayOrderId(r).toLowerCase();

    const matchesSearch =
      (r.registration_number || "").toLowerCase().includes(searchLower) ||
      (r.participants?.full_name || "").toLowerCase().includes(searchLower) ||
      (r.participants?.email || "").toLowerCase().includes(searchLower) ||
      (r.events?.title || "").toLowerCase().includes(searchLower) ||
      payId.includes(searchLower) ||
      orderId.includes(searchLower);

    const s = (r.payment_status || "unpaid").toLowerCase();
    let normalizedStatus = "Pending";
    if (s === "paid") normalizedStatus = "Completed";
    else if (s === "failed") normalizedStatus = "Failed";
    else if (s === "refunded") normalizedStatus = "Refunded";

    const matchesStatus = statusFilter === "All" || normalizedStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amt: number) => {
    return `₹${amt.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
            Payments &amp; Financial Revenue
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Live payment collections and Razorpay transactions fetched dynamically from Supabase database.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "#ffffff",
            border: "1.5px solid #E2E8F0",
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 800,
            color: "#334155",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} color="#7C3AED" />
          Refresh Data
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 14,
            background: "#FEF2F2",
            border: "1.5px solid #FCA5A5",
            color: "#991B1B",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* 3 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "20px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>Total Verified Revenue</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A" }}>{formatCurrency(totalRevenue)}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", marginTop: 4 }}>{paidCount} confirmed payments</div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "20px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>Pending Payments Amount</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#D97706" }}>{formatCurrency(pendingAmount)}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginTop: 4 }}>{pendingCount} pending registrations</div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "20px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>Payment Success Rate</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#16A34A" }}>{successRate}%</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", marginTop: 4 }}>Calculated from database records</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          border: "1.5px solid #E2E8F0",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ position: "relative", minWidth: 280, flex: 1 }}>
          <Search size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by Payment ID, Order ID, name, email, or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              borderRadius: 12,
              border: "1.5px solid #E2E8F0",
              fontSize: 13.5,
              outline: "none",
              background: "#F8FAFC",
              color: "#0F172A",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["All", "Completed", "Pending", "Failed", "Refunded"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                background: statusFilter === st ? "#7C3AED" : "#F1F5F9",
                color: statusFilter === st ? "#ffffff" : "#475569",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          border: "1.5px solid #E2E8F0",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>
                <th style={{ padding: "16px 20px" }}>Razorpay Payment ID / Registration</th>
                <th style={{ padding: "16px 20px" }}>Participant Details</th>
                <th style={{ padding: "16px 20px" }}>Event</th>
                <th style={{ padding: "16px 20px" }}>Gateway</th>
                <th style={{ padding: "16px 20px" }}>Date</th>
                <th style={{ padding: "16px 20px" }}>Amount</th>
                <th style={{ padding: "16px 20px" }}>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 20px", textAlign: "center", color: "#64748B", fontWeight: 600 }}>
                    Loading payment records from database...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 20px", textAlign: "center", color: "#64748B", fontWeight: 600 }}>
                    No payment records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((r) => {
                  const payId = getRazorpayPaymentId(r);
                  const orderId = getRazorpayOrderId(r);
                  const rawStatus = (r.payment_status || "unpaid").toLowerCase();
                  let displayStatus = "Pending";
                  if (rawStatus === "paid") displayStatus = "Completed";
                  else if (rawStatus === "failed") displayStatus = "Failed";
                  else if (rawStatus === "refunded") displayStatus = "Refunded";

                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #F1F5F9", fontSize: 13.5 }}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontWeight: 800, color: "#6D28D9", fontFamily: "monospace" }}>
                          {payId !== "-" ? payId : r.registration_number || r.id}
                        </div>
                        {orderId !== "-" && (
                          <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace", marginTop: 2 }}>
                            Order: {orderId}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontWeight: 800, color: "#0F172A" }}>{r.participants?.full_name || "Participant"}</div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>{r.participants?.email || "-"}</div>
                      </td>
                      <td style={{ padding: "16px 20px", color: "#334155", fontWeight: 700 }}>{r.events?.title || "Event"}</td>
                      <td style={{ padding: "16px 20px", color: "#64748B" }}>Razorpay</td>
                      <td style={{ padding: "16px 20px", color: "#64748B" }}>{formatDate(r.created_at)}</td>
                      <td style={{ padding: "16px 20px", fontWeight: 900, color: "#0F172A" }}>{formatCurrency(Number(r.amount || 0))}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 8,
                            fontSize: 11.5,
                            fontWeight: 800,
                            color:
                              displayStatus === "Completed"
                                ? "#16A34A"
                                : displayStatus === "Pending"
                                ? "#D97706"
                                : "#DC2626",
                            background:
                              displayStatus === "Completed"
                                ? "#DCFCE7"
                                : displayStatus === "Pending"
                                ? "#FEF3C7"
                                : "#FEF2F2",
                          }}
                        >
                          {displayStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
