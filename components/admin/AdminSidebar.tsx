"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  Users,
  CreditCard,
  Award,
  BarChart3,
  Settings,
  Globe,
  Crown,
  X,
  UserCheck,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Events", href: "/admin/events", icon: Calendar },
    { label: "Banner", href: "/admin/banner", icon: ImageIcon },
    { label: "Guests & Judges", href: "/admin/guests-judges", icon: UserCheck },
    { label: "Categories", href: "/admin/categories", icon: Globe },
    { label: "Participants", href: "/admin/participants", icon: Users },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Certificates", href: "/admin/certificates", icon: Award },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
    { label: "Website Settings", href: "/admin/website-settings", icon: Globe },
  ];

  const sidebarContent = (
    <aside
      style={{
        width: 260,
        height: "100vh",
        background: "linear-gradient(180deg, #090314 0%, #150A30 45%, #0B0418 100%)",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 16px 20px",
        color: "#fff",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div>
        {/* Logo Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 8px",
            marginBottom: 32,
          }}
        >
          <Link href="/admin/dashboard" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "4px 8px",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 38,
              }}
            >
              <img
                src="/images/logos/logo.jpeg"
                alt="CGS Entertainments"
                style={{ height: 30, width: "auto", mixBlendMode: "multiply", filter: "contrast(1.08)" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: 0.5, lineHeight: 1.1 }}>
                CGS <span style={{ color: "#E879F9" }}>X</span>
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: "#A78BFA", letterSpacing: 1.5, textTransform: "uppercase" }}>
                ENTERTAINMENTS
              </div>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                padding: 6,
                cursor: "pointer",
                display: "none",
              }}
              className="admin-mobile-close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href)) ||
              (item.href === "/admin/banner" && pathname?.startsWith("/admin/banners"));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 16px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "#ffffff" : "#A78BFA",
                  background: isActive
                    ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)"
                    : "transparent",
                  boxShadow: isActive ? "0 4px 16px rgba(124, 58, 237, 0.4)" : "none",
                  textDecoration: "none",
                  transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className={isActive ? "" : "admin-nav-hover"}
              >
                <Icon size={19} color={isActive ? "#ffffff" : "#A78BFA"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Pro Badge */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 18,
          padding: "16px 14px",
          textAlign: "center",
          marginTop: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 10px",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
          }}
        >
          <Crown size={18} color="#FFD700" />
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
          CGS Entertainments
        </div>
        <div style={{ fontSize: 10.5, color: "#C4B5FD", lineHeight: 1.4 }}>
          Online Dance Competition Management System
        </div>
      </div>

      <style>{`
        .admin-nav-hover {
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .admin-nav-hover:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
          transform: translateX(5px) !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2) !important;
        }
        .admin-nav-hover:hover svg {
          color: #F472B6 !important;
          transform: scale(1.1);
        }
        @media (max-width: 1023px) {
          .admin-desktop-sidebar { display: none !important; }
          .admin-mobile-close { display: flex !important; }
        }
      `}</style>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div style={{ display: "block" }} className="admin-desktop-sidebar">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
          }}
          onClick={onCloseMobile}
        >
          <div onClick={(e) => e.stopPropagation()}>{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
