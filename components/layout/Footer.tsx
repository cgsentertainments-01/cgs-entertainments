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
          <div>
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
              />
            </div>

            <p style={{ fontSize: 13, color: "#A78BFA", lineHeight: 1.7, maxWidth: 260, margin: "0 0 16px" }}>
              Show Your Talent. Shine On Stage. Be A Star! India&apos;s Premier Competition Platform.
            </p>

            {/* Social Media Links (Instagram, YouTube, WhatsApp) */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Instagram */}
              <a
                href="https://instagram.com/cgs_entertainments_88112"
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
                href="https://youtube.com"
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
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16 }}>
              Quick Links
            </h4>
            {["Home", "Events", "Categories", "FAQs", "Contact"].map((l) => (
              <Link
                key={l}
                href={`/${l.toLowerCase() === "home" ? "" : l.toLowerCase()}`}
                style={{ display: "block", fontSize: 13, color: "#A78BFA", textDecoration: "none", marginBottom: 10, fontWeight: 500 }}
              >
                {l}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16 }}>
              Categories
            </h4>
            {["Dance", "Modeling", "Acting", "Singing", "Music"].map((l) => (
              <Link
                key={l}
                href={`/categories?slug=${l.toLowerCase()}`}
                style={{ display: "block", fontSize: 13, color: "#A78BFA", textDecoration: "none", marginBottom: 10, fontWeight: 500 }}
              >
                {l}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16 }}>
              Contact Us
            </h4>
            <div style={{ fontSize: 13, color: "#A78BFA", lineHeight: 2.1 }}>
              <div>Hyderabad, Telangana, India</div>
              <div>+91 98765 43210</div>
              <div>info@cgsentertainments.com</div>
            </div>
          </div>
        </div>
        <div style={{ paddingTop: 28, textAlign: "center" }}>
          <div style={{ fontSize: 18, color: "#FFFFFF", marginBottom: 8, fontWeight: 600 }}>
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
          <div style={{ fontSize: 14.5, color: "#C4B5FD", fontWeight: 600 }}>
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
        @media (max-width: 800px) { .footer-cols { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 767px) {
          .cgs-footer { padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px)) !important; }
        }
        @media (max-width: 480px) { .footer-cols { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
