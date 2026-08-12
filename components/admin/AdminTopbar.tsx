"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  Search,
  Calendar as CalendarIcon,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface AdminTopbarProps {
  onToggleMobileSidebar?: () => void;
}

export function AdminTopbar({ onToggleMobileSidebar }: AdminTopbarProps) {
  const { user, adminProfile, signOut } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adminName = adminProfile?.name || user?.user_metadata?.full_name || user?.email || "Admin";
  const adminEmail = adminProfile?.email || user?.email || "";
  const adminRole = adminProfile?.role ? adminProfile.role.replace("_", " ").toUpperCase() : "ADMIN";
  const avatarUrl = adminProfile?.avatar || user?.user_metadata?.avatar_url || "/images/logos/logo.jpeg";

  return (
    <header
      style={{
        height: 72,
        background: "#ffffff",
        borderBottom: "1.5px solid #E2E8F0",
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 9999,
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      }}
    >
      {/* Left: Mobile Toggle & Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, maxWidth: 480 }}>
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 10,
            padding: "8px",
            cursor: "pointer",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="admin-mobile-toggle"
        >
          <Menu size={20} />
        </button>

        {/* Search Input */}
        <div style={{ position: "relative", width: "100%" }}>
          <Search
            size={17}
            color="#94A3B8"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search anything..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              borderRadius: 14,
              border: "1.5px solid #E2E8F0",
              fontSize: 13.5,
              background: "#F8FAFC",
              color: "#0F172A",
              outline: "none",
              transition: "all 0.2s",
            }}
            className="admin-search-input"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Date Picker Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            background: "#F8FAFC",
            border: "1.5px solid #E2E8F0",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            color: "#334155",
            cursor: "pointer",
          }}
          className="admin-top-btn"
        >
          <CalendarIcon size={16} color="#6D28D9" />
          <span>21 May 2026</span>
          <ChevronDown size={14} color="#94A3B8" />
        </div>

        {/* Notification Bell */}
        <div
          style={{
            position: "relative",
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#F8FAFC",
            border: "1.5px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#475569",
          }}
          className="admin-top-btn"
        >
          <Bell size={18} />
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#EF4444",
              color: "#fff",
              fontSize: 10,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}
          >
            8
          </span>
        </div>

        {/* Admin Profile Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "4px 10px 4px 6px",
              background: "#ffffff",
              border: "1.5px solid #E2E8F0",
              borderRadius: 30,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            className="admin-top-btn"
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                fontWeight: 900,
                overflow: "hidden",
              }}
            >
              {avatarUrl && avatarUrl !== "/images/logos/logo.jpeg" ? (
                <img src={avatarUrl} alt={adminName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                adminName.slice(0, 2).toUpperCase()
              )}
            </div>

            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
                {adminName}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6D28D9" }}>{adminRole}</div>
            </div>

            <ChevronDown size={15} color="#94A3B8" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 220,
                background: "#ffffff",
                border: "1.5px solid #E2E8F0",
                borderRadius: 16,
                boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                padding: 8,
                zIndex: 99999,
              }}
            >
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #F1F5F9", marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{adminName}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{adminEmail}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/admin/settings");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#334155",
                    background: "none",
                    border: "none",
                    width: "100%",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  className="dropdown-hover"
                >
                  <User size={16} color="#6D28D9" />
                  Admin Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#334155",
                    background: "none",
                    border: "none",
                    width: "100%",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  className="dropdown-hover"
                >
                  <ExternalLink size={16} color="#0284C7" />
                  View Public Website
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/admin/website-settings");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#334155",
                    background: "none",
                    border: "none",
                    width: "100%",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  className="dropdown-hover"
                >
                  <Settings size={16} color="#D97706" />
                  Website Settings
                </button>
              </div>

              <div style={{ height: 1, background: "#F1F5F9", margin: "4px 0" }} />

              <button
                type="button"
                onClick={async () => {
                  setProfileOpen(false);
                  await signOut();
                  router.push("/admin/login");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#DC2626",
                  background: "#FEF2F2",
                  border: "none",
                  width: "100%",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                className="dropdown-logout"
              >
                <LogOut size={16} color="#DC2626" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-top-btn {
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .admin-top-btn:hover {
          border-color: #7C3AED !important;
          background: #FAF5FF !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.12) !important;
        }
        .admin-search-input {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .admin-search-input:focus {
          border-color: #7C3AED !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.14) !important;
        }
        .dropdown-hover {
          transition: all 0.18s ease !important;
        }
        .dropdown-hover:hover {
          background: #FAF5FF !important;
          color: #6D28D9 !important;
          transform: translateX(3px);
        }
        .dropdown-logout {
          transition: all 0.18s ease !important;
        }
        .dropdown-logout:hover {
          background: #FEE2E2 !important;
          transform: translateX(3px);
        }
        @media (min-width: 1024px) {
          .admin-mobile-toggle { display: none !important; }
        }
        @media (max-width: 768px) {
          header { padding: 0 16px !important; }
          .admin-top-date-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}
