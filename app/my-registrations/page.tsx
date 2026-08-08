"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Ticket, Calendar, MapPin, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function MyRegistrationsPage() {
  const { user } = useAuth();

  const mockRegistrations = [
    {
      id: "REG-88112-DANCE",
      eventTitle: "Hyderabad National Dance Championship 2026",
      category: "Solo Hip-Hop / Street Dance",
      date: "25 May 2026",
      venue: "Shilpakaram Auditorium, Hitec City, Hyderabad",
      status: "Confirmed & Ticket Issued",
      amount: "₹1,499",
    },
    {
      id: "REG-88113-MODEL",
      eventTitle: "South India Fashion & Modeling Hunt",
      category: "Runway Fashion Show",
      date: "10 June 2026",
      venue: "Kanteerava Indoor Stadium, Bangalore",
      status: "Confirmed & Ticket Issued",
      amount: "₹1,999",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: "36px auto 64px", padding: "0 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#F3E8FF", borderRadius: 12, fontSize: 12, fontWeight: 800, color: "#6D28D9", textTransform: "uppercase", marginBottom: 8 }}>
            <Ticket size={14} color="#6D28D9" /> Participant Pass Holder
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.5 }}>
            My Competition Registrations
          </h1>
          <p style={{ fontSize: 15, color: "#64748B", margin: 0, fontWeight: 500 }}>
            View your registered event tickets, schedules, and entry passes.
          </p>
        </div>

        {/* Registrations Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {mockRegistrations.map((reg) => (
            <div
              key={reg.id}
              style={{
                background: "#ffffff",
                borderRadius: 20,
                border: "1.5px solid #E2E8F0",
                padding: "24px 28px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, background: "#6D28D9", color: "#fff", padding: "3px 10px", borderRadius: 8, textTransform: "uppercase" }}>
                    {reg.category}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={14} /> {reg.status}
                  </span>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 10px" }}>
                  {reg.eventTitle}
                </h3>

                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", color: "#64748B", fontSize: 13.5, fontWeight: 600 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={15} color="#6D28D9" /> {reg.date}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={15} color="#6D28D9" /> {reg.venue}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>Pass ID: {reg.id}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#6D28D9", margin: "4px 0 10px" }}>{reg.amount}</div>
                <Link
                  href="/events"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    background: "#F3E8FF",
                    color: "#6D28D9",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  View Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
