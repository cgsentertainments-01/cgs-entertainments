"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut, Ticket, Award, ChevronDown, ShieldCheck } from "lucide-react";

export function UserDropdown() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Participant";

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 14px 6px 8px",
          background: "#FAF5FF",
          border: "1.5px solid #E9D5FF",
          borderRadius: 30,
          cursor: "pointer",
          transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: open ? "0 4px 16px rgba(109, 40, 217, 0.18)" : "0 2px 8px rgba(0,0,0,0.04)",
        }}
        className="user-avatar-btn"
      >
        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid #6D28D9" }}
          />
        ) : (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 0.5,
              border: "2px solid #E9D5FF",
            }}
          >
            {initials}
          </div>
        )}

        <span style={{ fontSize: 14, fontWeight: 800, color: "#1E1B4B", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayName}
        </span>

        <ChevronDown
          size={16}
          color="#6D28D9"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: 250,
            background: "#ffffff",
            border: "1.5px solid #E5E7EB",
            borderRadius: 20,
            boxShadow: "0 20px 48px rgba(15, 10, 40, 0.18), 0 0 20px rgba(109, 40, 217, 0.08)",
            padding: 10,
            zIndex: 99999,
            animation: "fadeInScale 0.2s ease forwards",
          }}
        >
          {/* User Info Header */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #F3F4F6", marginBottom: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>
              {user.email?.toLowerCase() === "cgsentertainments01@gmail.com" ? "Admin CGS" : displayName}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </div>
            {user.email?.toLowerCase() === "cgsentertainments01@gmail.com" ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "3px 8px", background: "#F3E8FF", borderRadius: 8, fontSize: 11, fontWeight: 800, color: "#6D28D9" }}>
                <ShieldCheck size={13} /> Official Super Admin
              </div>
            ) : (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "3px 8px", background: "#DCFCE7", borderRadius: 8, fontSize: 11, fontWeight: 800, color: "#15803D" }}>
                <ShieldCheck size={13} /> Authenticated User
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {user.email?.toLowerCase() === "cgsentertainments01@gmail.com" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: "#ffffff",
                  background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  textDecoration: "none",
                  marginBottom: 6,
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                }}
              >
                <ShieldCheck size={17} color="#ffffff" />
                Admin Control Panel
              </Link>
            )}

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 700,
                color: "#374151",
                textDecoration: "none",
                transition: "all 0.18s",
              }}
              className="dropdown-item-hover"
            >
              <User size={17} color="#0284C7" />
              My Profile
            </Link>

            <Link
              href="/my-registrations"
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 700,
                color: "#374151",
                textDecoration: "none",
                transition: "all 0.18s",
              }}
              className="dropdown-item-hover"
            >
              <Ticket size={17} color="#16A34A" />
              My Registrations
            </Link>

            <Link
              href="/certificates"
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 700,
                color: "#374151",
                textDecoration: "none",
                transition: "all 0.18s",
              }}
              className="dropdown-item-hover"
            >
              <Award size={17} color="#D97706" />
              My Certificates
            </Link>
          </div>

          <div style={{ height: 1, background: "#F3F4F6", margin: "6px 0" }} />

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 13.5,
              fontWeight: 800,
              color: "#DC2626",
              background: "#FEF2F2",
              border: "none",
              cursor: "pointer",
              transition: "all 0.18s",
            }}
            className="dropdown-logout-hover"
          >
            <LogOut size={17} color="#DC2626" />
            Sign Out
          </button>
        </div>
      )}

      <style>{`
        .user-avatar-btn:hover {
          border-color: #6D28D9 !important;
          background: #F3E8FF !important;
        }
        .dropdown-item-hover:hover {
          background: #FAF5FF !important;
          color: #6D28D9 !important;
        }
        .dropdown-logout-hover:hover {
          background: #FEE2E2 !important;
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(-6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
