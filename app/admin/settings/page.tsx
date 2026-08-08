"use client";

import React, { useState } from "react";
import { Settings, Shield, User, Lock, CheckCircle2, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [adminName, setAdminName] = useState("Admin CGS");
  const [adminEmail, setAdminEmail] = useState("cgsentertainments01@gmail.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
          Admin Account &amp; Security Settings
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Manage your CGS Admin profile credentials and authentication security settings.
        </p>
      </div>

      {savedMsg && (
        <div style={{ padding: "14px 18px", background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: 14, color: "#166534", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={18} color="#22C55E" /> Admin profile updated successfully.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24 }}>
        {/* Profile Details */}
        <div style={{ background: "#ffffff", borderRadius: 24, border: "1.5px solid #E2E8F0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 20px" }}>
            Admin Profile Info
          </h2>

          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                Admin Display Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                Official Admin Email Address
              </label>
              <input
                type="email"
                value={adminEmail}
                disabled
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, background: "#F8FAFC", color: "#64748B" }}
              />
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                Primary master admin email verified in Supabase Auth.
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: "12px 22px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div style={{ background: "#ffffff", borderRadius: 24, border: "1.5px solid #E2E8F0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 20px" }}>
            Change Password
          </h2>

          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "12px 22px",
                borderRadius: 12,
                background: "#0284C7",
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
