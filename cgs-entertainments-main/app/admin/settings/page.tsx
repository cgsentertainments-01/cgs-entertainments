"use client";

import React from "react";
import Link from "next/link";
import {
  Settings,
  Image as ImageIcon,
  UserCheck,
  Globe,
  CreditCard,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Sliders,
} from "lucide-react";

export default function AdminSettingsPage() {
  const settingsSections = [
    {
      title: "Banner Management",
      desc: "Manage homepage banners, promotional slides, and mobile banners.",
      href: "/admin/banners",
      icon: ImageIcon,
      color: "#7C3AED",
      bg: "#F3E8FF",
    },
    {
      title: "Guests & Judges",
      desc: "Manage judges roster, guest star appearances, and profile photos.",
      href: "/admin/guests-judges",
      icon: UserCheck,
      color: "#2563EB",
      bg: "#EFF6FF",
    },
    {
      title: "Event Categories",
      desc: "Configure event master categories (Dance, Modeling, Acting, Singing).",
      href: "/admin/categories",
      icon: Globe,
      color: "#16A34A",
      bg: "#DCFCE7",
    },
    {
      title: "Website Settings",
      desc: "Customize homepage text, SEO metadata, contact details, and social links.",
      href: "/admin/website-settings",
      icon: Sliders,
      color: "#D97706",
      bg: "#FEF3C7",
    },
    {
      title: "Payment Gateway & Audit Logs",
      desc: "Inspect Razorpay order logs, payment status audits, and transaction histories.",
      href: "/admin/payments",
      icon: CreditCard,
      color: "#0284C7",
      bg: "#E0F2FE",
    },
    {
      title: "Reports & Analytics",
      desc: "Export registration reports, financial summaries, and event analytics.",
      href: "/admin/reports",
      icon: BarChart3,
      color: "#9333EA",
      bg: "#F3E8FF",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
          Admin Settings & Operations
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Manage global site settings, media banners, guest judges, and system configurations.
        </p>
      </div>

      {/* Grid of Settings Hub Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {settingsSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <Link
              key={sec.title}
              href={sec.href}
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid #E2E8F0",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
                textDecoration: "none",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
              }}
              className="admin-settings-card"
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: sec.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={24} color={sec.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
                    {sec.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.4 }}>
                    {sec.desc}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 800, color: sec.color }}>
                <span>Configure Section</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        .admin-settings-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.06) !important;
          border-color: #CBD5E1 !important;
        }
      `}</style>
    </div>
  );
}
