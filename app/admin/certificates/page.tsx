"use client";

import React, { useState } from "react";
import { Award, Search, Download, CheckCircle2, Plus, Sparkles, X } from "lucide-react";

interface CertificateRecord {
  certId: string;
  recipientName: string;
  eventName: string;
  issueDate: string;
  rankBadge: string;
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([
    {
      certId: "CERT-CGS-2026-001",
      recipientName: "Rathul Rathod",
      eventName: "Hyderabad National Dance Championship",
      issueDate: "15 May 2026",
      rankBadge: "Winner / 1st Place",
    },
    {
      certId: "CERT-CGS-2026-002",
      recipientName: "Rathod Rahul",
      eventName: "South India Fashion & Modeling Hunt",
      issueDate: "17 May 2026",
      rankBadge: "Official Participant",
    },
    {
      certId: "CERT-CGS-2026-003",
      recipientName: "Mukollu Divyasri",
      eventName: "Voice of India Music Auditions",
      issueDate: "18 May 2026",
      rankBadge: "Runner Up / 2nd Place",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [eventName, setEventName] = useState("Hyderabad National Dance Championship");
  const [rankBadge, setRankBadge] = useState("Official Participant");

  const filteredCerts = certificates.filter(
    (c) =>
      c.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.eventName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName) return;

    const newCert: CertificateRecord = {
      certId: `CERT-CGS-2026-0${certificates.length + 1}`,
      recipientName,
      eventName,
      issueDate: "21 May 2026",
      rankBadge,
    };

    setCertificates([newCert, ...certificates]);
    setRecipientName("");
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
            Certificate Generator &amp; Issuance
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Generate, sign, and issue official CGS digital certificates to competition winners &amp; participants.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: "11px 22px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
          }}
        >
          <Plus size={18} /> Issue New Certificate
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
            placeholder="Search by participant name, certificate ID, or event..."
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

      {/* Certificates Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {filteredCerts.map((cert) => (
          <div
            key={cert.certId}
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "1.5px solid #E2E8F0",
              padding: "24px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#6D28D9", background: "#F3E8FF", padding: "4px 10px", borderRadius: 8 }}>
                  {cert.certId}
                </span>
                <Award size={20} color="#D97706" />
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
                {cert.recipientName}
              </h3>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 12 }}>
                {cert.eventName}
              </div>

              <div style={{ padding: "6px 12px", background: "#FEF3C7", borderRadius: 10, fontSize: 12, fontWeight: 800, color: "#D97706", display: "inline-block" }}>
                🏆 {cert.rankBadge}
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>Issued: {cert.issueDate}</span>
              <button
                type="button"
                onClick={() => alert(`Downloading Certificate ${cert.certId}...`)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: "#FAF5FF",
                  border: "1px solid #E9D5FF",
                  color: "#6D28D9",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Issuance Modal */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              width: "100%",
              maxWidth: 500,
              padding: "32px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                Issue Digital Certificate
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateCert} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                  Participant Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rathul Rathod"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                  Event / Competition Name
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                  Achievement Rank / Designation
                </label>
                <select
                  value={rankBadge}
                  onChange={(e) => setRankBadge(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                >
                  <option value="Winner / 1st Place">Winner / 1st Place 🏆</option>
                  <option value="Runner Up / 2nd Place">Runner Up / 2nd Place 🥈</option>
                  <option value="2nd Runner Up / 3rd Place">2nd Runner Up / 3rd Place 🥉</option>
                  <option value="Official Participant">Official Participant 📜</option>
                  <option value="Special Performance Excellence">Special Performance Excellence ⭐</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    background: "#ffffff",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                    color: "#fff",
                    border: "none",
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
