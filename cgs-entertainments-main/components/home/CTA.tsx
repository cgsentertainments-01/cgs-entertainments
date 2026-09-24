"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, ArrowRight } from "lucide-react";

export function CTA() {
  const [boxH, setBoxH] = useState(false);
  const [btn1H, setBtn1H] = useState(false);
  const [btn2H, setBtn2H] = useState(false);

  return (
    <section style={{ padding: "48px 0 60px", background: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div
          onMouseEnter={() => setBoxH(true)}
          onMouseLeave={() => setBoxH(false)}
          style={{
            background: boxH
              ? "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 40%, #E9D5FF 100%)"
              : "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 50%, #EDE9FE 100%)",
            border: `2px solid ${boxH ? "#A78BFA" : "#DDD6FE"}`,
            borderRadius: 24,
            padding: "52px 40px",
            textAlign: "center",
            boxShadow: boxH
              ? "0 24px 60px rgba(109,40,217,0.22), 0 0 32px rgba(167,139,250,0.18)"
              : "0 8px 30px rgba(109,40,217,0.08)",
            transform: boxH ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
            transition: "all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 20,
              background: boxH ? "#E9D5FF" : "#EDE9FE",
              color: "#6D28D9",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 16,
              transition: "background 0.25s",
            }}
          >
            <Sparkles size={15} color="#6D28D9" /> Ready to Shine?
          </div>

          <h2 style={{ fontSize: 34, fontWeight: 900, color: "#111827", margin: "0 0 12px", letterSpacing: -0.5 }}>
            Ready to Showcase Your Talent on Stage?
          </h2>

          <p style={{ fontSize: 15.5, color: "#4B5563", maxWidth: 620, margin: "0 auto 32px", lineHeight: 1.6, fontWeight: 500 }}>
            Join thousands of performers across India. Register today for upcoming dance, modeling, singing, acting &amp; music events!
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {/* Primary CTA Button */}
            <Link
              href="/events"
              onMouseEnter={() => setBtn1H(true)}
              onMouseLeave={() => setBtn1H(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "15px 34px",
                background: btn1H
                  ? "linear-gradient(135deg, #5B21B6 0%, #6D28D9 100%)"
                  : "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                color: "#fff",
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: btn1H
                  ? "0 14px 36px rgba(109, 40, 217, 0.5)"
                  : "0 6px 22px rgba(109, 40, 217, 0.35)",
                transform: btn1H ? "translateY(-3px) scale(1.05)" : "translateY(0) scale(1)",
                transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              Explore All Events
              <ChevronRight size={18} style={{ transform: btn1H ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s" }} />
            </Link>

            {/* Secondary CTA Button */}
            <Link
              href="/contact"
              onMouseEnter={() => setBtn2H(true)}
              onMouseLeave={() => setBtn2H(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "15px 30px",
                background: btn2H ? "#FAF5FF" : "#fff",
                color: btn2H ? "#6D28D9" : "#374151",
                border: `2px solid ${btn2H ? "#6D28D9" : "#D1D5DB"}`,
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: btn2H
                  ? "0 10px 24px rgba(109, 40, 217, 0.15)"
                  : "0 2px 8px rgba(0,0,0,0.04)",
                transform: btn2H ? "translateY(-3px) scale(1.05)" : "translateY(0) scale(1)",
                transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              Contact Us
              <ArrowRight size={16} style={{ transform: btn2H ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s" }} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
