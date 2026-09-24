"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, Menu, X } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { UserDropdown } from "@/components/auth/UserDropdown";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);

      // Hide on scroll down after 70px, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 70) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Category", href: "/categories" },
    { label: "FAQs", href: "/faqs" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <>
      {/* ── SQUARE ROUNDED NAVBAR WITH AUTO-HIDE ON SCROLL ── */}
      <header
        style={{
          position: "fixed",
          top: 12,
          left: "50%",
          transform: visible ? "translate(-50%, 0)" : "translate(-50%, -130%)",
          width: "calc(100% - 32px)",
          maxWidth: 1360,
          zIndex: 9999,
          background: "#ffffff",
          border: "1.5px solid #E5E7EB",
          borderRadius: 20,
          boxShadow: scrolled
            ? "0 14px 40px rgba(0, 0, 0, 0.12), 0 2px 10px rgba(109, 40, 217, 0.06)"
            : "0 8px 26px rgba(0, 0, 0, 0.06)",
          transition: "transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, background 0.25s ease",
        }}
        className="cgs-top-header"
      >
        <div
          style={{
            maxWidth: 1380,
            margin: "0 auto",
            padding: "0 28px",
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          className="cgs-top-header-inner"
        >
          {/* Logo from public/images/logos */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div
              style={{
                position: "relative",
                height: 54,
                width: 210,
                display: "flex",
                alignItems: "center",
                mixBlendMode: "multiply",
                overflow: "hidden",
              }}
              className="cgs-logo-wrapper"
            >
              {/* Official CGS Entertainments Logo */}
              <img
                src="/images/logos/logo.jpeg"
                alt="CGS Entertainments Logo"
                style={{
                  height: 50,
                  width: "auto",
                  objectFit: "contain",
                  mixBlendMode: "multiply",
                  filter: "contrast(1.12) brightness(0.95)",
                  transform: "scale(1.4)",
                  transformOrigin: "left center",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                  const fallback = document.getElementById("cgs-text-logo-fallback");
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            </div>

            {/* Fallback Text Logo */}
            <div id="cgs-text-logo-fallback" style={{ display: "none", flexDirection: "column", lineHeight: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontWeight: 900, fontSize: 24, color: "#6D28D9", letterSpacing: -0.5 }}>CGS</span>
                <span style={{ fontSize: 11, background: "#6D28D9", color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 900 }}>★</span>
              </div>
              <span style={{ fontSize: 8, fontWeight: 800, color: "#7C3AED", letterSpacing: 2.5, textTransform: "uppercase", marginTop: 2 }}>
                ENTERTAINMENTS
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop & Tablet) */}
          <nav style={{ display: "flex", alignItems: "center", gap: 28 }} className="cgs-nav-desktop">
            {navItems.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={label}
                  href={href}
                  style={{
                    textDecoration: "none",
                    fontSize: 14.5,
                    fontWeight: active ? 800 : 600,
                    color: active ? "#6D28D9" : "#374151",
                    position: "relative",
                    padding: "8px 0",
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  className="nav-link-hover"
                >
                  {label}
                  {active && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: "linear-gradient(90deg, #6D28D9, #7C3AED)",
                        borderRadius: 99,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Login */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user ? (
              <>
                <NotificationBell />
                <UserDropdown />
              </>
            ) : (
              <Link
                href="/login"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 20px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#111827",
                  textDecoration: "none",
                  background: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className="cgs-login-btn"
              >
                <User size={16} color="#6D28D9" />
                Login
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="cgs-hamburger"
              style={{
                display: "none",
                border: "none",
                background: "#F3F4F6",
                borderRadius: 10,
                padding: "8px",
                cursor: "pointer",
                color: "#111827",
              }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div
            style={{
              background: "#fff",
              borderTop: "1.5px solid #F3F4F6",
              padding: "12px 24px 20px",
              borderRadius: "0 0 20px 20px",
            }}
          >
            {navItems.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  padding: "12px 0",
                  fontSize: 15,
                  fontWeight: pathname === href ? 800 : 600,
                  color: pathname === href ? "#6D28D9" : "#374151",
                  textDecoration: "none",
                  borderBottom: "1px solid #F9FAFB",
                }}
              >
                {label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 16,
                  background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                  color: "#fff",
                  textAlign: "center",
                  padding: "12px",
                  borderRadius: 12,
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                <User size={16} /> Login
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Spacer to push page content down below floating header */}
      <div style={{ height: 88 }} />

      <style>{`
        .nav-link-hover:hover {
          color: #6D28D9 !important;
        }
        .cgs-login-btn:hover {
          border-color: #6D28D9 !important;
          color: #6D28D9 !important;
          box-shadow: 0 6px 18px rgba(109, 40, 217, 0.15) !important;
          transform: translateY(-2px);
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .cgs-nav-desktop { gap: 16px !important; }
          .cgs-top-header-inner { padding: 0 18px !important; }
          .cgs-logo-wrapper { width: 170px !important; }
        }
        @media (max-width: 767px) {
          .cgs-nav-desktop { display: none !important; }
          .cgs-hamburger { display: flex !important; }
          .cgs-top-header { width: calc(100% - 24px) !important; top: 8px !important; }
          .cgs-top-header-inner { padding: 0 14px !important; height: 60px !important; }
          .cgs-logo-wrapper { width: 160px !important; height: 46px !important; }
        }
      `}</style>
    </>
  );
}
