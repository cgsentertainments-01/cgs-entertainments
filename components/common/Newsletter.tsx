"use client";

import React, { useState } from "react";
import { Mail, CheckCircle, Send } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [h, setH] = useState(false);
  const [btnH, setBtnH] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section style={{ padding: "48px 0", background: "#fff", borderTop: "1px solid #F3F4F6" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div
          onMouseEnter={() => setH(true)}
          onMouseLeave={() => setH(false)}
          style={{
            background: "linear-gradient(135deg, #090314 0%, #1A0A3A 50%, #311068 100%)",
            borderRadius: 24,
            padding: "44px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            border: `2px solid ${h ? "#A78BFA" : "rgba(167, 139, 250, 0.25)"}`,
            boxShadow: h
              ? "0 24px 60px rgba(109, 40, 217, 0.45), 0 0 32px rgba(167, 139, 250, 0.25)"
              : "0 12px 40px rgba(15,10,40,0.35)",
            transform: h ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
            transition: "all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className="newsletter-box"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, maxWidth: 560 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                background: h ? "rgba(167, 139, 250, 0.25)" : "rgba(255,255,255,0.12)",
                border: `1.5px solid ${h ? "#C4B5FD" : "rgba(255,255,255,0.2)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transform: h ? "scale(1.12) rotate(-6deg)" : "scale(1)",
                transition: "all 0.3s ease",
              }}
            >
              <Mail size={26} color="#C4B5FD" />
            </div>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: -0.4 }}>
                Stay Updated on Upcoming Competitions
              </h2>
              <p style={{ fontSize: 13.5, color: "#C4B5FD", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                Subscribe to get instant notifications about dates, venues, registration deadlines, and exclusive early-bird discounts.
              </p>
            </div>
          </div>

          {submitted ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.2)", border: "1.5px solid #22C55E", padding: "14px 24px", borderRadius: 14 }}>
              <CheckCircle size={20} color="#86EFAC" />
              <span style={{ color: "#86EFAC", fontWeight: 800, fontSize: 14 }}>Thank you for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, flex: "1 1 380px", maxWidth: 440 }} className="news-form">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#fff",
                  borderRadius: 14,
                  padding: "0 16px",
                  flex: 1,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Mail size={18} color="#9CA3AF" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 0",
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                    color: "#111827",
                    background: "transparent",
                  }}
                />
              </div>

              <button
                type="submit"
                onMouseEnter={() => setBtnH(true)}
                onMouseLeave={() => setBtnH(false)}
                style={{
                  padding: "14px 26px",
                  borderRadius: 14,
                  background: btnH
                    ? "linear-gradient(135deg, #5B21B6 0%, #6D28D9 100%)"
                    : "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 900,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: btnH
                    ? "0 12px 32px rgba(109, 40, 217, 0.5)"
                    : "0 6px 20px rgba(109, 40, 217, 0.35)",
                  transform: btnH ? "translateY(-2px) scale(1.05)" : "translateY(0) scale(1)",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                Subscribe
                <Send size={16} style={{ transform: btnH ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s" }} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
