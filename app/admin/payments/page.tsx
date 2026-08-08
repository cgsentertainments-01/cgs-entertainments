"use client";

import React, { useState } from "react";
import {
  CreditCard,
  IndianRupee,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

interface PaymentRecord {
  txnId: string;
  participantName: string;
  email: string;
  eventName: string;
  amount: string;
  date: string;
  gateway: string;
  status: "Completed" | "Pending" | "Refunded";
}

export default function AdminPaymentsPage() {
  const [payments] = useState<PaymentRecord[]>([
    {
      txnId: "TXN-99882201",
      participantName: "Rathul Rathod",
      email: "rathodmallesh2006@gmail.com",
      eventName: "Hyderabad National Dance Championship",
      amount: "₹1,499",
      date: "15 May 2026, 14:32",
      gateway: "Razorpay / UPI",
      status: "Completed",
    },
    {
      txnId: "TXN-99882202",
      participantName: "Rathod Rahul",
      email: "rathodrahulnayak2006@gmail.com",
      eventName: "South India Fashion & Modeling Hunt",
      amount: "₹1,999",
      date: "17 May 2026, 11:15",
      gateway: "Razorpay / Card",
      status: "Completed",
    },
    {
      txnId: "TXN-99882203",
      participantName: "Mukollu Divyasri",
      email: "mukolludivyasri@gmail.com",
      eventName: "Voice of India Music Auditions",
      amount: "₹1,199",
      date: "18 May 2026, 16:45",
      gateway: "Razorpay / NetBanking",
      status: "Completed",
    },
    {
      txnId: "TXN-99882204",
      participantName: "Ananya Sharma",
      email: "ananya.sharma@example.com",
      eventName: "Acting Excellence Awards & Auditions",
      amount: "₹1,299",
      date: "20 May 2026, 09:20",
      gateway: "Razorpay / UPI",
      status: "Pending",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.txnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.eventName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
          Payments &amp; Financial Revenue
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Track registration fee collections, Razorpay transactions, and financial analytics.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "20px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>Total Revenue Collected</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A" }}>₹3,45,680</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", marginTop: 4 }}>+18.6% vs last month</div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "20px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>Pending Transactions</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#D97706" }}>₹12,450</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginTop: 4 }}>4 transactions pending</div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "20px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>Successful Payments</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#16A34A" }}>98.4%</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", marginTop: 4 }}>Gateway uptime normal</div>
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
            placeholder="Search by Txn ID, name, email, or event..."
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
          {["All", "Completed", "Pending", "Refunded"].map((st) => (
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
                <th style={{ padding: "16px 20px" }}>Transaction ID</th>
                <th style={{ padding: "16px 20px" }}>Payer Details</th>
                <th style={{ padding: "16px 20px" }}>Event</th>
                <th style={{ padding: "16px 20px" }}>Gateway</th>
                <th style={{ padding: "16px 20px" }}>Date</th>
                <th style={{ padding: "16px 20px" }}>Amount</th>
                <th style={{ padding: "16px 20px" }}>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.txnId} style={{ borderBottom: "1px solid #F1F5F9", fontSize: 13.5 }}>
                  <td style={{ padding: "16px 20px", fontWeight: 800, color: "#6D28D9" }}>{p.txnId}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 800, color: "#0F172A" }}>{p.participantName}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{p.email}</div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#334155" }}>{p.eventName}</td>
                  <td style={{ padding: "16px 20px", color: "#64748B" }}>{p.gateway}</td>
                  <td style={{ padding: "16px 20px", color: "#64748B" }}>{p.date}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 900, color: "#0F172A" }}>{p.amount}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: p.status === "Completed" ? "#16A34A" : p.status === "Pending" ? "#D97706" : "#DC2626",
                        background: p.status === "Completed" ? "#DCFCE7" : p.status === "Pending" ? "#FEF3C7" : "#FEF2F2",
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
