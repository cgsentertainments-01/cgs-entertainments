"use client";

import React, { useState } from "react";
import { Globe, ShieldCheck, CheckCircle2, Instagram, Youtube, Phone } from "lucide-react";

export default function AdminWebsiteSettingsPage() {
  const [siteName, setSiteName] = useState("CGS Entertainments");
  const [tagline, setTagline] = useState("Shine On Stage. Be A Star! India's Premier Competition Platform.");
  const [contactEmail, setContactEmail] = useState("cgsentertainments01@gmail.com");
  const [contactPhone, setContactPhone] = useState("+91 80194 88112");
  const [instagram, setInstagram] = useState("@cgs_entertainments_88112");
  const [msmeReg, setMsmeReg] = useState("UDYAM-TS-02-0048112");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
          Public Website Settings &amp; Branding
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Manage global website branding, contact information, social links, and maintenance status.
        </p>
      </div>

      {savedMsg && (
        <div style={{ padding: "14px 18px", background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: 14, color: "#166534", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={18} color="#22C55E" /> Website settings updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Branding Section */}
        <div style={{ background: "#ffffff", borderRadius: 24, border: "1.5px solid #E2E8F0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 20px" }}>
            General Branding &amp; Tagline
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                Platform Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                MSME Registration Number
              </label>
              <input
                type="text"
                value={msmeReg}
                onChange={(e) => setMsmeReg(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
              Main Platform Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
            />
          </div>
        </div>

        {/* Contact & Social Links */}
        <div style={{ background: "#ffffff", borderRadius: 24, border: "1.5px solid #E2E8F0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 20px" }}>
            Contact Details &amp; Social Links
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                Contact Email Address
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
              Instagram Handle
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
            />
          </div>
        </div>

        {/* Maintenance Toggle */}
        <div style={{ background: "#ffffff", borderRadius: 24, border: "1.5px solid #E2E8F0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>Maintenance Mode</div>
            <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
              Temporarily display maintenance screen to public users during updates.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              fontSize: 13.5,
              fontWeight: 800,
              cursor: "pointer",
              background: maintenanceMode ? "#DC2626" : "#E2E8F0",
              color: maintenanceMode ? "#ffffff" : "#475569",
              transition: "all 0.2s",
            }}
          >
            {maintenanceMode ? "Maintenance ON" : "Maintenance OFF"}
          </button>
        </div>

        <button
          type="submit"
          style={{
            padding: "14px 28px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            color: "#ffffff",
            fontSize: 15,
            fontWeight: 900,
            border: "none",
            cursor: "pointer",
            width: "fit-content",
            boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
          }}
        >
          Save Website Settings
        </button>
      </form>
    </div>
  );
}
