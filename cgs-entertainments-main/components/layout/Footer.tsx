"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Youtube, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ background: "#1E1B4B", color: "#C4B5FD", padding: "48px 0 24px" }} className="cgs-footer">
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }} className="cgs-main-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1.4fr",
            gap: 40,
            paddingBottom: 36,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
          className="footer-cols"
        >
          {/* Brand Info Column */}
          <div className="footer-brand-col">
            <div
              style={{
                background: "#ffffff",
                padding: "8px 18px",
                borderRadius: 14,
                display: "inline-flex",
                alignItems: "center",
                marginBottom: 16,
                boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                width: 250,
                height: 64,
                overflow: "visible",
              }}
              className="footer-logo-card"
            >
              <img
                src="/images/logos/logo.jpeg"
                alt="CGS Entertainments Logo"
                style={{
                  height: 60,
                  width: "auto",
                  objectFit: "contain",
                  mixBlendMode: "multiply",
                  filter: "contrast(1.12) brightness(0.95)",
                  transform: "scale(1.85)",
                  transformOrigin: "left center",
                  marginLeft: "6px",
                }}
                className="footer-logo-img"
              />
            </div>

            <p style={{ fontSize: 13, color: "#A78BFA", lineHeight: 1.7, maxWidth: 260, margin: "0 0 16px" }} className="footer-tagline">
              Show Your Talent. Shine On Stage. Be A Star! India&apos;s Premier Competition Platform.
            </p>

            {/* Social Media Links (Instagram, YouTube, WhatsApp) */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="footer-social-wrap">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/cgs_entertainment_88112/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram (@cgs_entertainments_88112)"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(225, 48, 108, 0.15)",
                  border: "1.5px solid rgba(225, 48, 108, 0.4)",
                  color: "#F472B6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className="footer-social-btn insta-hover"
              >
                <Instagram size={19} />
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@CgsEntertainments"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube (Cgs Entertainments)"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1.5px solid rgba(239, 68, 68, 0.4)",
                  color: "#F87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className="footer-social-btn yt-hover"
              >
                <Youtube size={19} />
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/918019488112"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp (+91 80194 88112)"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "1.5px solid rgba(34, 197, 94, 0.4)",
                  color: "#4ADE80",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className="footer-social-btn wa-hover"
              >
                <MessageCircle size={19} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col-quick">
            <h4 style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16 }} className="footer-heading">
              Quick Links
            </h4>
            {["Home", "Events", "Categories", "FAQs", "Contact"].map((l) => (
              <Link
                key={l}
                href={`/${l.toLowerCase() === "home" ? "" : l.toLowerCase()}`}
                style={{ display: "block", fontSize: 13, color: "#A78BFA", textDecoration: "none", marginBottom: 10, fontWeight: 500 }}
                className="footer-nav-link"
              >
                {l}
              </Link>
            ))}
          </div>

          {/* Categories Column */}
          <div className="footer-col-cat">
            <h4 style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16 }} className="footer-heading">
              Categories
            </h4>
            {["Dance", "Modeling", "Acting", "Singing", "Music"].map((l) => (
              <Link
                key={l}
                href={`/categories?slug=${l.toLowerCase()}`}
                style={{ display: "block", fontSize: 13, color: "#A78BFA", textDecoration: "none", marginBottom: 10, fontWeight: 500 }}
                className="footer-nav-link"
              >
                {l}
              </Link>
            ))}
          </div>

          {/* Contact Us Column */}
          <div className="footer-contact-col">
            <h4 style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16 }} className="footer-heading">
              Contact Us
            </h4>
            <div style={{ fontSize: 13, color: "#A78BFA", lineHeight: 2.1 }} className="footer-contact-details">
              <div>Hyderabad, Telangana, India</div>
              <div>+91 98765 43210</div>
              <div className="footer-email-link">info@cgsentertainments.com</div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div style={{ paddingTop: 28, textAlign: "center" }} className="footer-bottom-wrap">
          <div style={{ fontSize: 18, color: "#FFFFFF", marginBottom: 8, fontWeight: 600 }} className="footer-credit">
            Designed and Developed by{" "}
            <a
              href={`https://wa.me/919392472134?text=${encodeURIComponent(
                "Hi Autofy.ai Team! ✨\n\nI came across your amazing work and would love to connect with you.\n\nI'm interested in learning more about:\n✨ Your services and expertise\n✨ How you can help my business grow\n✨ Pricing and packages"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#FFFFFF",
                fontWeight: 900,
                textDecoration: "underline",
                textUnderlineOffset: "5px",
                textDecorationColor: "#A855F7",
                fontSize: 20,
                letterSpacing: -0.2,
                transition: "all 0.25s ease",
                display: "inline-block",
              }}
              className="autofy-link"
            >
              Autofy.ai
            </a>
          </div>
          <div style={{ fontSize: 14.5, color: "#C4B5FD", fontWeight: 600 }} className="footer-copyright">
            © {new Date().getFullYear()} CGS Entertainments. All rights reserved.
          </div>
        </div>
      </div>
      <style>{`
        .footer-social-btn:hover {
          transform: translateY(-3px) scale(1.12);
        }
        .insta-hover:hover {
          background: #E1306C !important;
          color: #fff !important;
          border-color: #E1306C !important;
          box-shadow: 0 6px 18px rgba(225, 48, 108, 0.45) !important;
        }
        .yt-hover:hover {
          background: #FF0000 !important;
          color: #fff !important;
          border-color: #FF0000 !important;
          box-shadow: 0 6px 18px rgba(239, 68, 68, 0.45) !important;
        }
        .wa-hover:hover {
          background: #25D366 !important;
          color: #fff !important;
          border-color: #25D366 !important;
          box-shadow: 0 6px 18px rgba(37, 211, 102, 0.45) !important;
        }
        .autofy-link:hover {
          color: #C084FC !important;
          text-decoration: underline !important;
          text-decoration-color: #C084FC !important;
          transform: translateY(-2px) scale(1.05);
        }

        /* ── Tablet & Small Desktop (769px - 1024px) ── */
        @media (max-width: 1024px) and (min-width: 769px) {
          .footer-cols {
            grid-template-columns: 1.5fr 1fr 1fr 1.2fr !important;
            gap: 28px !important;
          }
        }

        /* ── Mobile & Tablet (< 768px) ── */
        @media (max-width: 768px) {
          .cgs-footer {
            padding: 36px 0 calc(84px + env(safe-area-inset-bottom, 0px)) !important;
          }
          .cgs-footer .cgs-main-container {
            padding-left: 16px !important;
            padding-right: 16px !important;
            box-sizing: border-box !important;
          }
          .footer-cols {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px 20px !important;
            padding-bottom: 28px !important;
          }
          .footer-brand-col {
            grid-column: 1 / -1 !important;
          }
          .footer-contact-col {
            grid-column: 1 / -1 !important;
          }
          .footer-tagline {
            max-width: 100% !important;
          }
          .footer-contact-details {
            line-height: 1.9 !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }
          .footer-email-link {
            word-break: break-all !important;
            overflow-wrap: break-word !important;
          }
          .footer-bottom-wrap {
            padding-top: 22px !important;
          }
          .footer-credit {
            font-size: clamp(14px, 3.8vw, 16px) !important;
            margin-bottom: 6px !important;
            line-height: 1.4 !important;
          }
          .autofy-link {
            font-size: clamp(15px, 4.2vw, 18px) !important;
          }
          .footer-copyright {
            font-size: 12.5px !important;
            line-height: 1.5 !important;
          }
        }

        /* ── Mobile Phone Viewport Enhancements (<= 480px) ── */
        @media (max-width: 480px) {
          .footer-logo-card {
            width: 220px !important;
            height: 56px !important;
            padding: 6px 14px !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .footer-logo-img {
            height: 48px !important;
            transform: scale(1.6) !important;
          }
          .footer-heading {
            margin-bottom: 12px !important;
          }
          .footer-nav-link {
            margin-bottom: 8px !important;
          }
        }

        /* ── Very Narrow Mobile Viewports (<= 360px: e.g. 320px - 360px) ── */
        @media (max-width: 360px) {
          .cgs-footer .cgs-main-container {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .footer-cols {
            gap: 26px 14px !important;
          }
          .footer-logo-card {
            width: 200px !important;
            height: 52px !important;
            padding: 6px 12px !important;
          }
          .footer-logo-img {
            height: 42px !important;
            transform: scale(1.5) !important;
          }
        }
      `}</style>
    </footer>
  );
}
