"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GuestJudge } from "@/types/guest-judge";
import { fetchGuestsJudges } from "@/services/guest-judge.service";
import { Instagram, Youtube, Twitter, Linkedin, Crown, Award, UserCheck, Sparkles } from "lucide-react";

export default function PublicGuestsJudgesPage() {
  const [items, setItems] = useState<GuestJudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchGuestsJudges("public");
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch public guests & judges:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredItems = items.filter((item) => {
    if (filterRole === "all") return true;
    return item.role === filterRole;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />

      {/* Hero Section */}
      <div style={{ marginTop: 72, background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)", color: "#fff", padding: "60px 20px 70px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", fontSize: 13, fontWeight: 800, color: "#E0E7FF", marginBottom: 16 }}>
            <Sparkles size={16} color="#FFD700" />
            CGS ENTERTAINMENTS CELEBRITIES
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", margin: "0 0 16px", letterSpacing: -0.5 }}>
            Meet Our Esteemed Guests &amp; Judges
          </h1>
          <p style={{ fontSize: 16, color: "#C7D2FE", lineHeight: 1.6, margin: 0 }}>
            India&apos;s finest choreographers, celebrity artists, and dance icons guiding and judging talent across our prestigious stage events.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ maxWidth: 1200, margin: "-30px auto 60px", padding: "0 20px" }}>
        {/* Role Filters */}
        <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 20, padding: "14px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
          {[
            { label: "All Celebrities", value: "all" },
            { label: "Judges", value: "Judge" },
            { label: "Guests", value: "Guest" },
            { label: "Chief Guests", value: "Chief Guest" },
          ].map((tab) => {
            const isActive = filterRole === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setFilterRole(tab.value)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 14,
                  fontSize: 13.5,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "#fff" : "#4B5563",
                  background: isActive ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" : "transparent",
                  border: isActive ? "none" : "1px solid transparent",
                  cursor: "pointer",
                  boxShadow: isActive ? "0 4px 14px rgba(124, 58, 237, 0.3)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Grid Display */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#6B7280", fontWeight: 700 }}>
            Loading guests &amp; judges...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 24, border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎭</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: 0 }}>No Records Found</h3>
            <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>Check back soon for upcoming guest announcements!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 28 }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 24,
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className="guest-card-hover"
              >
                {/* Image */}
                <div style={{ position: "relative", width: 110, height: 110, borderRadius: "50%", overflow: "hidden", border: "3px solid #6D28D9", marginBottom: 16, boxShadow: "0 8px 20px rgba(109,40,217,0.2)" }}>
                  {item.photo_url ? (
                    <Image src={item.photo_url} alt={item.name} fill style={{ objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: "#6D28D9" }}>
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Role Badge */}
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    marginBottom: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background:
                      item.role === "Chief Guest"
                        ? "#FEF3C7"
                        : item.role === "Judge"
                        ? "#EDE9FE"
                        : "#D1FAE5",
                    color:
                      item.role === "Chief Guest"
                        ? "#B45309"
                        : item.role === "Judge"
                        ? "#6D28D9"
                        : "#047857",
                  }}
                >
                  {item.role === "Chief Guest" && <Crown size={12} />}
                  {item.role === "Judge" && <Award size={12} />}
                  {item.role === "Guest" && <UserCheck size={12} />}
                  {item.role}
                </span>

                {/* Name & Title */}
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: "0 0 4px" }}>
                  {item.name}
                </h3>
                {item.designation && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6D28D9", marginBottom: 2 }}>
                    {item.designation}
                  </div>
                )}
                {item.organization && (
                  <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>
                    {item.organization}
                  </div>
                )}

                {/* Bio */}
                {item.bio && (
                  <p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6, margin: "0 0 16px", flex: 1 }}>
                    {item.bio}
                  </p>
                )}

                {/* Social Icons */}
                <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
                  {item.social_links?.instagram && (
                    <a href={item.social_links.instagram} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: "50%", background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Instagram size={16} color="#E1306C" />
                    </a>
                  )}
                  {item.social_links?.youtube && (
                    <a href={item.social_links.youtube} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Youtube size={16} color="#FF0000" />
                    </a>
                  )}
                  {item.social_links?.twitter && (
                    <a href={item.social_links.twitter} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: "50%", background: "#F0F9FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Twitter size={16} color="#1DA1F2" />
                    </a>
                  )}
                  {item.social_links?.linkedin && (
                    <a href={item.social_links.linkedin} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Linkedin size={16} color="#0A66C2" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .guest-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(109, 40, 217, 0.12) !important;
          border-color: #C4B5FD !important;
        }
      `}</style>
      <Footer />
    </div>
  );
}
