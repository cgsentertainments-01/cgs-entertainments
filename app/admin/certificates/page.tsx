"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Award, Search, Download, Plus, X, LayoutTemplate, FileText } from "lucide-react";

interface CertificateRecord {
  certId: string;
  recipientName: string;
  eventName: string;
  issueDate: string;
  rankBadge: string;
}

export default function AdminCertificatesPage() {
  const [activeTab, setActiveTab] = useState<"generated" | "templates">("generated");
  const [certificates, setCertificates] = useState<CertificateRecord[]>([
    {
      certId: "CERT-CGS-2026-001",
      recipientName: "Kalyani Mukkollu",
      eventName: "CGS Dance Fest 2026",
      issueDate: "15 August 2026",
      rankBadge: "Winner 🏆",
    },
    {
      certId: "CERT-CGS-2026-002",
      recipientName: "Rahul Kumar",
      eventName: "CGS Dance Fest 2026",
      issueDate: "15 August 2026",
      rankBadge: "Runner-up 🥈",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredCerts = certificates.filter(
    (c) =>
      c.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.eventName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Navigation Header Tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4, display: "flex", alignItems: "center", gap: 10 }}>
            <Award size={28} color="#6D28D9" /> Certificate Management
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Manage certificate design templates and view generated certificates.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/admin/certificates/templates"
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
              color: "#ffffff",
              fontSize: 13.5,
              fontWeight: 800,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(109,40,217,0.3)",
            }}
          >
            <LayoutTemplate size={16} /> Certificate Templates
          </Link>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ borderBottom: "2px solid #E2E8F0", display: "flex", gap: 24, paddingBottom: 2 }}>
        <Link
          href="/admin/certificates/templates"
          style={{
            padding: "8px 12px",
            fontSize: 14,
            fontWeight: 800,
            color: "#6D28D9",
            textDecoration: "none",
            borderBottom: "3px solid #6D28D9",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <LayoutTemplate size={16} /> Templates
        </Link>
        <div
          style={{
            padding: "8px 12px",
            fontSize: 14,
            fontWeight: 700,
            color: "#94A3B8",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "not-allowed",
          }}
        >
          <FileText size={16} /> Generated Certificates (PDF Generation Placeholder)
        </div>
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
            placeholder="Search generated certificates..."
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
                {cert.rankBadge}
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>Issued: {cert.issueDate}</span>
              <button
                type="button"
                disabled
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: "#F1F5F9",
                  border: "1px solid #CBD5E1",
                  color: "#94A3B8",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                title="PDF Generation will be enabled in next step"
              >
                <Download size={14} /> PDF Download (Next Step)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
