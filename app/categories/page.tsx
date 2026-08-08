"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  User,
  Users,
  UserPlus,
  Baby,
  Smile,
  Sparkles,
  Flame,
  Award,
  Star,
  Music,
  MoreHorizontal,
  ChevronRight,
  CheckCircle2,
  Heart,
  Zap,
} from "lucide-react";

/* ─── DANCE STYLES DATA ─── */
const DANCE_STYLES = [
  { id: "classical", name: "Classical", icon: <Award size={24} color="#C084FC" /> },
  { id: "folk", name: "Folk", icon: <Users size={24} color="#F472B6" /> },
  { id: "western", name: "Western", icon: <Zap size={24} color="#60A5FA" /> },
  { id: "hiphop", name: "Hip-Hop", icon: <Flame size={24} color="#FB923C" /> },
  { id: "bollywood", name: "Bollywood", icon: <Sparkles size={24} color="#F43F5E" /> },
  { id: "contemporary", name: "Contemporary", icon: <User size={24} color="#38BDF8" /> },
  { id: "semiclassic", name: "Semi-Classical", icon: <Heart size={24} color="#2DD4BF" /> },
  { id: "freestyle", name: "Freestyle", icon: <Star size={24} color="#FBBF24" /> },
  { id: "fusion", name: "Fusion", icon: <Music size={24} color="#A78BFA" /> },
  { id: "other", name: "Other", icon: <MoreHorizontal size={24} color="#9CA3AF" /> },
];

/* ─── HOVER COMPONENT: Competition Type Card ─── */
function CompTypeCard({
  card,
  selected,
  onClick,
}: {
  card: { id: string; title: string; desc: string; icon: React.ReactNode; iconBg: string };
  selected: boolean;
  onClick: () => void;
}) {
  const [h, setH] = useState(false);

  let transformVal = "translateY(0) scale(1)";
  let shadowVal = "0 2px 10px rgba(0,0,0,0.03)";
  if (h && selected) {
    transformVal = "translateY(-8px) scale(1.03)";
    shadowVal = "0 18px 40px rgba(109,40,217,0.28)";
  } else if (h) {
    transformVal = "translateY(-6px) scale(1.02)";
    shadowVal = "0 14px 32px rgba(109,40,217,0.2)";
  } else if (selected) {
    transformVal = "translateY(-3px) scale(1.01)";
    shadowVal = "0 8px 24px rgba(109,40,217,0.16)";
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        position: "relative",
        background: h || selected ? "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)" : "#fff",
        border: `2px solid ${h || selected ? "#6D28D9" : "#E5E7EB"}`,
        borderRadius: 22,
        padding: "24px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 18,
        boxShadow: shadowVal,
        transform: transformVal,
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {selected && (
        <div style={{ position: "absolute", top: 14, right: 14 }}>
          <CheckCircle2 size={22} color="#6D28D9" />
        </div>
      )}

      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 18,
          background: card.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 8px 20px ${card.iconBg}44`,
          transform: h ? "scale(1.15) rotate(-6deg)" : selected ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.25s ease",
        }}
      >
        {card.icon}
      </div>

      <div>
        <h3 style={{ fontSize: 19, fontWeight: 900, color: h || selected ? "#6D28D9" : "#111827", margin: "0 0 4px", transition: "color 0.2s" }}>
          {card.title}
        </h3>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
          {card.desc}
        </p>
      </div>
    </div>
  );
}

/* ─── HOVER COMPONENT: Age Category Card ─── */
function AgeCategoryCard({
  card,
  selected,
  onClick,
}: {
  card: { id: string; title: string; range: string; sub: string; accent: string; icon: React.ReactNode };
  selected: boolean;
  onClick: () => void;
}) {
  const [h, setH] = useState(false);

  let transformVal = "translateY(0) scale(1)";
  let shadowVal = "0 2px 8px rgba(0,0,0,0.03)";
  if (h && selected) {
    transformVal = "translateY(-9px) scale(1.035)";
    shadowVal = `0 18px 40px ${card.accent}45`;
  } else if (h) {
    transformVal = "translateY(-7px) scale(1.025)";
    shadowVal = `0 14px 32px ${card.accent}35`;
  } else if (selected) {
    transformVal = "translateY(-3px) scale(1.01)";
    shadowVal = `0 8px 22px ${card.accent}25`;
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        position: "relative",
        background: h || selected ? "linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)" : "#fff",
        border: `2px solid ${h || selected ? card.accent : "#E5E7EB"}`,
        borderRadius: 20,
        padding: "24px 14px 20px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
        boxShadow: shadowVal,
        transform: transformVal,
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Top Colored Bar Accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: h ? 7 : selected ? 5 : 4,
          background: card.accent,
          boxShadow: h || selected ? `0 2px 10px ${card.accent}` : "none",
          transition: "all 0.25s ease",
        }}
      />

      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: `${card.accent}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          transform: h ? "scale(1.28) rotate(-10deg)" : selected ? "scale(1.15)" : "scale(1) rotate(0deg)",
          transition: "transform 0.25s ease",
        }}
      >
        {card.icon}
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 900, color: "#111827", margin: "0 0 2px" }}>
        {card.title}
      </h3>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: card.accent, marginBottom: 8 }}>
        {card.range}
      </div>
      <p style={{ fontSize: 11.5, color: "#6B7280", margin: 0, fontWeight: 500, lineHeight: 1.35 }}>
        {card.sub}
      </p>
    </div>
  );
}

/* ─── HOVER COMPONENT: Dance Style Neon Card ─── */
function DanceStyleNeonCard({
  style,
  selected,
  onClick,
}: {
  style: { id: string; name: string; icon: React.ReactNode };
  selected: boolean;
  onClick: () => void;
}) {
  const [h, setH] = useState(false);

  let transformVal = "translateY(0) scale(1)";
  let shadowVal = "none";
  if (h && selected) {
    transformVal = "translateY(-8px) scale(1.07)";
    shadowVal = "0 14px 38px rgba(167, 139, 250, 0.6), 0 0 22px rgba(167, 139, 250, 0.4)";
  } else if (h) {
    transformVal = "translateY(-6px) scale(1.05)";
    shadowVal = "0 10px 30px rgba(167, 139, 250, 0.45), 0 0 16px rgba(167, 139, 250, 0.25)";
  } else if (selected) {
    transformVal = "translateY(-2px) scale(1.02)";
    shadowVal = "0 6px 20px rgba(167, 139, 250, 0.3)";
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: h || selected
          ? "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)"
          : "linear-gradient(135deg, #0F0A28 0%, #1A0E38 100%)",
        border: `1.5px solid ${h || selected ? "#A78BFA" : "rgba(255,255,255,0.12)"}`,
        borderRadius: 16,
        padding: "18px 8px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        boxShadow: shadowVal,
        transform: transformVal,
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div style={{ transform: h ? "scale(1.3) rotate(6deg)" : selected ? "scale(1.18)" : "scale(1)", transition: "transform 0.25s ease" }}>
        {style.icon}
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: h || selected ? "#fff" : "#D1D5DB", textAlign: "center" }}>
        {style.name}
      </span>
    </div>
  );
}

/* ─── HOVER COMPONENT: CTA Contact Button ─── */
function CtaContactBtn() {
  const [h, setH] = useState(false);
  return (
    <Link
      href="/contact"
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 32px",
        borderRadius: 14,
        background: h
          ? "linear-gradient(135deg, #5B21B6 0%, #6D28D9 100%)"
          : "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
        color: "#fff",
        fontSize: 14.5,
        fontWeight: 800,
        textDecoration: "none",
        boxShadow: h
          ? "0 10px 32px rgba(109, 40, 217, 0.45)"
          : "0 6px 20px rgba(109, 40, 217, 0.32)",
        whiteSpace: "nowrap",
        flexShrink: 0,
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: h ? "translateY(-3px) scale(1.04)" : "translateY(0) scale(1)",
      }}
    >
      Contact Us
      <ChevronRight size={17} style={{ transform: h ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s" }} />
    </Link>
  );
}

/* ─── MAIN PAGE ─── */
export default function CategoriesPage() {
  const [selectedCompType, setSelectedCompType] = useState<string>("solo");
  const [selectedAgeCat, setSelectedAgeCat] = useState<string>("teens");
  const [selectedStyle, setSelectedStyle] = useState<string>("bollywood");

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />

      {/* ── Top Hero Banner matching Reference ── */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(135deg, #090314 0%, #150933 50%, #251052 100%)",
          paddingTop: 64,
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "44px 32px 52px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 480px", gap: 32, alignItems: "center" }} className="cat-hero-grid">
            <div>
              <span
                style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  background: "rgba(167, 139, 250, 0.18)",
                  color: "#C4B5FD",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  border: "1px solid rgba(167, 139, 250, 0.3)",
                  display: "inline-block",
                  marginBottom: 14,
                }}
              >
                Explore All
              </span>
              <h1 style={{ fontSize: 44, fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: -1, lineHeight: 1.15 }}>
                Competition <span style={{ background: "linear-gradient(135deg, #F43F5E, #FB923C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Categories</span>
              </h1>
              <p style={{ fontSize: 16, color: "#C4B5FD", margin: "0 0 6px", fontWeight: 500 }}>
                Find the perfect category that matches your talent.
              </p>
              <p style={{ fontSize: 16, color: "#E0E7FF", margin: 0, fontWeight: 700 }}>
                Step on stage and shine!
              </p>
            </div>

            {/* Right Hero Image — Professional Action Stage Dancer */}
            <div style={{ position: "relative", height: 260, borderRadius: 22, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
              <Image
                src="https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=90"
                alt="Dance Stage Performer"
                fill
                priority
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #090314 0%, transparent 60%)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Category Content ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "44px 32px 64px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>

          {/* ── SECTION 01: Competition Type ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#6D28D9",
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(109,40,217,0.35)",
                }}
              >
                01
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>
                Competition Type
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="type-cards-grid">
              {[
                {
                  id: "solo",
                  title: "Solo",
                  desc: "Individual performance, one participant.",
                  icon: <User size={26} color="#fff" />,
                  iconBg: "#6D28D9",
                },
                {
                  id: "duo",
                  title: "Duo",
                  desc: "Two participants perform together.",
                  icon: <UserPlus size={26} color="#fff" />,
                  iconBg: "#D946EF",
                },
                {
                  id: "group",
                  title: "Group",
                  desc: "Three or more participants perform together.",
                  icon: <Users size={26} color="#fff" />,
                  iconBg: "#F97316",
                },
              ].map((card) => (
                <CompTypeCard
                  key={card.id}
                  card={card}
                  selected={selectedCompType === card.id}
                  onClick={() => setSelectedCompType(card.id)}
                />
              ))}
            </div>
          </div>

          {/* ── SECTION 02: Age Categories ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#6D28D9",
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(109,40,217,0.35)",
                }}
              >
                02
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>
                Age Categories
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }} className="age-cards-grid">
              {[
                {
                  id: "tiny-tots",
                  title: "Tiny Tots",
                  range: "3 – 5 Years",
                  sub: "Little stars taking the first step.",
                  accent: "#8B5CF6",
                  icon: <Baby size={24} color="#8B5CF6" />,
                },
                {
                  id: "kids",
                  title: "Kids",
                  range: "6 – 9 Years",
                  sub: "Young talent with big dreams.",
                  accent: "#3B82F6",
                  icon: <Smile size={24} color="#3B82F6" />,
                },
                {
                  id: "juniors",
                  title: "Juniors",
                  range: "10 – 13 Years",
                  sub: "Passionate performers in action.",
                  accent: "#10B981",
                  icon: <Sparkles size={24} color="#10B981" />,
                },
                {
                  id: "teens",
                  title: "Teens",
                  range: "14 – 17 Years",
                  sub: "Energetic, dynamic and fearless.",
                  accent: "#F97316",
                  icon: <Flame size={24} color="#F97316" />,
                },
                {
                  id: "seniors",
                  title: "Seniors",
                  range: "18+ Years",
                  sub: "Experience meets excellence.",
                  accent: "#EC4899",
                  icon: <User size={24} color="#EC4899" />,
                },
                {
                  id: "open",
                  title: "Open Category",
                  range: "All Ages",
                  sub: "Open to all age groups.",
                  accent: "#F59E0B",
                  icon: <Star size={24} color="#F59E0B" />,
                },
              ].map((card) => (
                <AgeCategoryCard
                  key={card.id}
                  card={card}
                  selected={selectedAgeCat === card.id}
                  onClick={() => setSelectedAgeCat(card.id)}
                />
              ))}
            </div>
          </div>

          {/* ── SECTION 03: Dance Styles (Neon Icons) ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#6D28D9",
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(109,40,217,0.35)",
                }}
              >
                03
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>
                Dance Styles
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 12 }} className="styles-grid-10">
              {DANCE_STYLES.map((style) => (
                <DanceStyleNeonCard
                  key={style.id}
                  style={style}
                  selected={selectedStyle === style.id}
                  onClick={() => setSelectedStyle(style.id)}
                />
              ))}
            </div>
          </div>

          {/* ── Bottom CTA Banner ── */}
          <div
            style={{
              background: "linear-gradient(135deg, #0B041C 0%, #1A0C3B 50%, #2A105C 100%)",
              borderRadius: 24,
              padding: "26px 36px",
              boxShadow: "0 12px 40px rgba(15,10,40,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}
            className="cat-cta-bar"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: "rgba(251, 191, 36, 0.18)",
                  border: "1px solid rgba(251, 191, 36, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Star size={28} color="#FBBF24" fill="#FBBF24" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: "0 0 4px" }}>
                  Can&apos;t find the right category?
                </h3>
                <p style={{ fontSize: 13.5, color: "#C4B5FD", margin: 0, fontWeight: 500 }}>
                  Contact us and we will help you find the perfect competition for you.
                </p>
              </div>
            </div>

            <CtaContactBtn />
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .cat-hero-grid { grid-template-columns: 1fr !important; }
          .age-cards-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .styles-grid-10 { grid-template-columns: repeat(5, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .type-cards-grid { grid-template-columns: 1fr !important; }
          .age-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .styles-grid-10 { grid-template-columns: repeat(3, 1fr) !important; }
          .cat-cta-bar { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>
      <Footer />
    </div>
  );
}
