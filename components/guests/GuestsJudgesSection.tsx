"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { GuestJudge } from "@/types/guest-judge";
import { fetchGuestsJudges } from "@/services/guest-judge.service";
import { Instagram, Youtube, Twitter, Linkedin, Crown, Award, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";

interface GuestsJudgesSectionProps {
  title?: string;
  showViewAll?: boolean;
}

export function GuestsJudgesSection({
  title = "Guests & Judges",
  showViewAll = true,
}: GuestsJudgesSectionProps) {
  const [items, setItems] = useState<GuestJudge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublicData() {
      try {
        setLoading(true);
        const data = await fetchGuestsJudges("public");
        setItems(data);
      } catch (err) {
        console.error("Error loading public guests & judges:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicData();
  }, []);

  if (loading) {
    return (
      <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
        <div style={{ fontSize: 14, color: "#6B7280", fontWeight: 600 }}>Loading guests &amp; judges...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: 0, position: "relative", display: "inline-block" }}>
            {title}
            <span style={{ position: "absolute", bottom: -6, left: 0, width: 28, height: 3, background: "#6D28D9", borderRadius: 99 }} />
          </h2>
        </div>
        {showViewAll && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/guests-judges" style={{ fontSize: 13, color: "#6D28D9", fontWeight: 700, textDecoration: "none" }}>
              View All
            </Link>
          </div>
        )}
      </div>

      {/* Row of Cards */}
      <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 10 }} className="hide-scroll">
        {items.map((person) => (
          <PublicJudgeCard key={person.id} person={person} />
        ))}
      </div>

      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function PublicJudgeCard({ person }: { person: GuestJudge }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 8,
        flexShrink: 0,
        width: 130,
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* Avatar Container */}
      <div
        style={{
          position: "relative",
          width: 92,
          height: 92,
          borderRadius: "50%",
          overflow: "hidden",
          border: `2.5px solid ${hovered ? "#6D28D9" : "#E5E7EB"}`,
          boxShadow: hovered ? "0 8px 24px rgba(109, 40, 217, 0.25)" : "0 2px 8px rgba(0,0,0,0.06)",
          transition: "all 0.25s ease",
          background: "#F3F4F6",
        }}
      >
        {person.photo_url ? (
          <Image
            src={person.photo_url}
            alt={person.name}
            fill
            style={{ objectFit: "cover", transform: hovered ? "scale(1.1)" : "scale(1)", transition: "transform 0.35s ease" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#6D28D9" }}>
            {person.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: hovered ? "#6D28D9" : "#111827", transition: "color 0.2s" }}>
          {person.name}
        </div>
        <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 500, marginTop: 1 }}>
          {person.designation || person.role}
        </div>
      </div>

      {/* Social Links */}
      <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
        {person.social_links?.instagram && (
          <a href={person.social_links.instagram} target="_blank" rel="noopener noreferrer" style={{ padding: 4, borderRadius: "50%", background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Instagram size={12} color="#E1306C" />
          </a>
        )}
        {person.social_links?.youtube && (
          <a href={person.social_links.youtube} target="_blank" rel="noopener noreferrer" style={{ padding: 4, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Youtube size={12} color="#FF0000" />
          </a>
        )}
        {person.social_links?.twitter && (
          <a href={person.social_links.twitter} target="_blank" rel="noopener noreferrer" style={{ padding: 4, borderRadius: "50%", background: "#F0F9FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Twitter size={12} color="#1DA1F2" />
          </a>
        )}
        {person.social_links?.linkedin && (
          <a href={person.social_links.linkedin} target="_blank" rel="noopener noreferrer" style={{ padding: 4, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Linkedin size={12} color="#0A66C2" />
          </a>
        )}
      </div>
    </div>
  );
}
