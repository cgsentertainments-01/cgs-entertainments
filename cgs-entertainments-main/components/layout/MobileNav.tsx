"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, LayoutGrid, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide mobile navigation on admin pages to prevent overlapping with admin mobile UI
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const profileHref = user ? "/profile" : "/login";

  const navItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: Home,
      exact: true,
    },
    {
      id: "search",
      label: "Search",
      href: "/events",
      icon: Search,
      exact: false,
    },
    {
      id: "categories",
      label: "Categories",
      href: "/categories",
      icon: LayoutGrid,
      exact: false,
    },
    {
      id: "profile",
      label: "Profile",
      href: profileHref,
      icon: User,
      exact: false,
      matchExtra: ["/login", "/register", "/my-events", "/my-registrations"],
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1.5px solid #E5E7EB",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.06), 0 -1px 3px rgba(0, 0, 0, 0.03)",
        paddingTop: "6px",
        paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
        paddingLeft: "12px",
        paddingRight: "12px",
      }}
      className="cgs-mobile-bottom-nav"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          maxWidth: 480,
          margin: "0 auto",
          height: 52,
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          let isActive = false;
          if (pathname) {
            if (item.exact) {
              isActive = pathname === item.href;
            } else {
              isActive = pathname === item.href || pathname.startsWith(item.href);
              if (!isActive && item.matchExtra) {
                isActive = item.matchExtra.some((path) => pathname.startsWith(path));
              }
            }
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                flex: 1,
                height: "100%",
                padding: "2px 0",
                gap: 3,
                borderRadius: 12,
                position: "relative",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Icon Container with subtle active pill background */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 28,
                  borderRadius: 16,
                  background: isActive ? "linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)" : "transparent",
                  color: isActive ? "#6D28D9" : "#6B7280",
                  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} color={isActive ? "#6D28D9" : "#6B7280"} />
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "#6D28D9" : "#6B7280",
                  letterSpacing: -0.1,
                  lineHeight: 1,
                  transition: "color 0.2s ease, font-weight 0.2s ease",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .cgs-mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
