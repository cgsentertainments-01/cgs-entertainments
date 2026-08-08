"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Download,
  Mail,
  Phone,
  Calendar,
  Ticket,
  Eye,
  CheckCircle2,
  X,
  Filter,
} from "lucide-react";

interface ParticipantItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventName: string;
  ticketId: string;
  registeredDate: string;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  amount: string;
}

export default function AdminParticipantsPage() {
  const [participants] = useState<ParticipantItem[]>([
    {
      id: "P-101",
      name: "Rathul Rathod",
      email: "rathodmallesh2006@gmail.com",
      phone: "+91 80194 88112",
      eventName: "Hyderabad National Dance Championship 2026",
      ticketId: "REG-88112-DANCE",
      registeredDate: "15 May 2026",
      paymentStatus: "Paid",
      amount: "₹1,499",
    },
    {
      id: "P-102",
      name: "Rathod Rahul",
      email: "rathodrahulnayak2006@gmail.com",
      phone: "+91 98765 43210",
      eventName: "South India Fashion & Modeling Hunt",
      ticketId: "REG-88113-MODEL",
      registeredDate: "17 May 2026",
      paymentStatus: "Paid",
      amount: "₹1,999",
    },
    {
      id: "P-103",
      name: "Mukollu Divyasri",
      email: "mukolludivyasri@gmail.com",
      phone: "+91 91234 56789",
      eventName: "Voice of India Music Auditions",
      ticketId: "REG-88114-SING",
      registeredDate: "18 May 2026",
      paymentStatus: "Paid",
      amount: "₹1,199",
    },
    {
      id: "P-104",
      name: "Ananya Sharma",
      email: "ananya.sharma@example.com",
      phone: "+91 99887 76655",
      eventName: "Acting Excellence Awards & Auditions",
      ticketId: "REG-88115-ACT",
      registeredDate: "20 May 2026",
      paymentStatus: "Pending",
      amount: "₹1,299",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantItem | null>(null);

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.eventName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadCSV = () => {
    const headers = "ID,Name,Email,Phone,Event,Ticket ID,Registered Date,Payment Status,Amount\n";
    const rows = filteredParticipants
      .map(
        (p) =>
          `"${p.id}","${p.name}","${p.email}","${p.phone}","${p.eventName}","${p.ticketId}","${p.registeredDate}","${p.paymentStatus}","${p.amount}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CGS_Participants_Export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
            Participants Directory
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Manage registered contestants, ticket passes, contact info &amp; payment records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadCSV}
          style={{
            padding: "11px 20px",
            borderRadius: 14,
            background: "#ffffff",
            border: "1.5px solid #E2E8F0",
            color: "#334155",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <Download size={18} color="#6D28D9" /> Export CSV Data
        </button>
      </div>

      {/* Search Bar */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          border: "1.5px solid #E2E8F0",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by participant name, email, ticket ID, or competition event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px 11px 40px",
              borderRadius: 12,
              border: "1.5px solid #E2E8F0",
              fontSize: 13.5,
              outline: "none",
              background: "#F8FAFC",
              color: "#0F172A",
            }}
          />
        </div>
      </div>

      {/* Participants Table */}
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
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>
                <th style={{ padding: "16px 20px" }}>Participant</th>
                <th style={{ padding: "16px 20px" }}>Competition Event</th>
                <th style={{ padding: "16px 20px" }}>Ticket ID</th>
                <th style={{ padding: "16px 20px" }}>Reg. Date</th>
                <th style={{ padding: "16px 20px" }}>Amount</th>
                <th style={{ padding: "16px 20px" }}>Status</th>
                <th style={{ padding: "16px 20px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredParticipants.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9", fontSize: 13.5 }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 800, color: "#0F172A" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{p.email}</div>
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 700, color: "#334155" }}>
                    {p.eventName}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ padding: "3px 8px", background: "#F3E8FF", borderRadius: 6, fontSize: 11.5, fontWeight: 800, color: "#6D28D9" }}>
                      {p.ticketId}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#64748B" }}>{p.registeredDate}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 800, color: "#0F172A" }}>{p.amount}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: p.paymentStatus === "Paid" ? "#16A34A" : "#D97706",
                        background: p.paymentStatus === "Paid" ? "#DCFCE7" : "#FEF3C7",
                      }}
                    >
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedParticipant(p)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 10,
                        background: "#FAF5FF",
                        border: "1px solid #E9D5FF",
                        color: "#6D28D9",
                        fontSize: 12.5,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Eye size={14} /> Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Participant Profile Modal */}
      {selectedParticipant && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(9, 3, 20, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setSelectedParticipant(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              width: "100%",
              maxWidth: 480,
              padding: "32px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                Participant Profile
              </h2>
              <button
                type="button"
                onClick={() => setSelectedParticipant(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", background: "#FAF5FF", borderRadius: 16, border: "1px solid #E9D5FF" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#6D28D9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>
                  {selectedParticipant.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>{selectedParticipant.name}</div>
                  <div style={{ fontSize: 12.5, color: "#6D28D9", fontWeight: 700 }}>ID: {selectedParticipant.id}</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: "#334155" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Mail size={16} color="#6D28D9" /> <span>{selectedParticipant.email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Phone size={16} color="#6D28D9" /> <span>{selectedParticipant.phone}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Ticket size={16} color="#6D28D9" /> <span>Ticket Pass: <strong>{selectedParticipant.ticketId}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Calendar size={16} color="#6D28D9" /> <span>Registered: {selectedParticipant.registeredDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
