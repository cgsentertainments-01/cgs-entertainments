"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

export type CategoryType = {
  id: string;
  name: string;
  desc: string;
  bg: string;
  iconBg: string;
  color: string;
  slug: string;
  icon: React.ReactNode;
  count: string;
};

const CATEGORIES: CategoryType[] = [
  {
    id: "c1",
    name: "Dance",
    desc: "Solo, Duo & Groups",
    count: "18+ Events",
    bg: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
    iconBg: "#EDE9FE",
    color: "#6D28D9",
    slug: "dance",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <circle cx="14.5" cy="3.5" r="2" fill="#7C3AED" />
        <path d="M6 9l4 5-3.5 6.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 9l-2.5 4 2.5 6.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 14l5-2.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 5.5L9 9l-3 0" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 5.5l4 3.5 3 0.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "c2",
    name: "Modeling",
    desc: "Fashion & Walk",
    count: "12+ Shows",
    bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    iconBg: "#DBEAFE",
    color: "#2563EB",
    slug: "modeling",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="3.5" r="2" fill="#2563EB" />
        <path d="M8 7h8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 7l-1.5 6h9L15 7" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" />
        <path d="M7.5 13L6 21M16.5 13L18 21" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 21h12" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "c3",
    name: "Acting",
    desc: "Theatre & Drama",
    count: "10+ Plays",
    bg: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
    iconBg: "#FEF3C7",
    color: "#D97706",
    slug: "acting",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="10" r="4.5" stroke="#D97706" strokeWidth="2" fill="#FEF3C7" />
        <circle cx="16" cy="10" r="4.5" stroke="#D97706" strokeWidth="2" fill="#FEF3C7" />
        <path d="M6 9.5c1 1.5 3 1.5 4 0" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 11.5c1-1.5 3-1.5 4 0" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 7l1.2-1.5M17 7l-1.2-1.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "c4",
    name: "Singing",
    desc: "Solo & Chorus",
    count: "15+ Contests",
    bg: "linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)",
    iconBg: "#FCE7F3",
    color: "#DB2777",
    slug: "singing",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <rect x="8.5" y="2" width="7" height="11" rx="3.5" fill="#DB2777" opacity="0.85" />
        <path d="M5 11a7 7 0 0014 0" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M12 18v3" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />
        <path d="M8.5 21h7" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "c5",
    name: "Music",
    desc: "Instruments & Bands",
    count: "08+ Bands",
    bg: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
    iconBg: "#D1FAE5",
    color: "#059669",
    slug: "music",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <path d="M9 18V5l12-2v13" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" fill="#059669" opacity="0.8" />
        <circle cx="18" cy="16" r="3" fill="#059669" opacity="0.8" />
      </svg>
    ),
  },
  {
    id: "c6",
    name: "Photography",
    desc: "Stills & Short Films",
    count: "14+ Galleries",
    bg: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
    iconBg: "#FFEDD5",
    color: "#EA580C",
    slug: "photography",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="7" width="20" height="14" rx="3" stroke="#EA580C" strokeWidth="2" fill="#FFEDD5" />
        <circle cx="12" cy="14" r="4" stroke="#EA580C" strokeWidth="2" />
        <path d="M8 7l2-3h4l2 3" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="17" cy="10.5" r="1.2" fill="#EA580C" />
      </svg>
    ),
  },
  {
    id: "c7",
    name: "More Categories",
    desc: "Explore All Talent",
    count: "25+ Categories",
    bg: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
    iconBg: "#EDE9FE",
    color: "#7C3AED",
    slug: "more",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <circle cx="5" cy="12" r="2.5" fill="#7C3AED" />
        <circle cx="12" cy="12" r="2.5" fill="#7C3AED" />
        <circle cx="19" cy="12" r="2.5" fill="#7C3AED" />
      </svg>
    ),
  },
];

export function HomeCategories() {
  return (
    <section
      style={{
        padding: "44px 0 48px",
        background: "#FAFAFA",
        borderTop: "1px solid #F3F4F6",
        borderBottom: "1px solid #F3F4F6",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 4,
                height: 26,
                background: "linear-gradient(180deg,#6D28D9,#EC4899)",
                borderRadius: 99,
              }}
            />
            <div>
              <h2
                style={{
                  fontSize: 19,
                  fontWeight: 900,
                  color: "#111827",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                EVENT CATEGORIES
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#6D28D9",
                    background: "#F3E8FF",
                    padding: "3px 10px",
                    borderRadius: 12,
                    textTransform: "none",
                  }}
                >
                  Hover to Pause ⏸
                </span>
              </h2>
            </div>
          </div>

          <Link
            href="/categories"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13.5,
              fontWeight: 800,
              color: "#6D28D9",
              textDecoration: "none",
              padding: "8px 18px",
              border: "1.5px solid #DDD6FE",
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(109,40,217,0.08)",
              transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            className="view-all-cat-btn"
          >
            View All Categories <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* ── CONTINUOUS INFINITE SCROLLING MARQUEE (RIGHT TO LEFT) ── */}
      <div style={{ position: "relative", width: "100%", overflow: "hidden", padding: "12px 0" }} className="cat-marquee-wrapper">
        {/* Gradient Fade Masks */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 100, background: "linear-gradient(to right, #FAFAFA, transparent)", zIndex: 10, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 100, background: "linear-gradient(to left, #FAFAFA, transparent)", zIndex: 10, pointerEvents: "none" }} />

        <div className="cat-marquee-track-container">
          <div className="cat-marquee-track cat-marquee-anim-rtl">
            {[...CATEGORIES, ...CATEGORIES].map((cat, idx) => (
              <Link key={`${cat.id}-${idx}`} href={`/categories?slug=${cat.slug}`} style={{ textDecoration: "none" }}>
                <CircularCategoryCard cat={cat} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* Continuous Marquee Scrolling Track (Right to Left) */
        .cat-marquee-track-container {
          display: flex;
          width: 100%;
          overflow: hidden;
        }

        .cat-marquee-track {
          display: flex;
          gap: 24px;
          white-space: nowrap;
          will-change: transform;
        }

        .cat-marquee-anim-rtl {
          animation: catMarqueeRTL 28s linear infinite;
        }

        /* Smooth Pause on Mouse Hover */
        .cat-marquee-wrapper:hover .cat-marquee-track {
          animation-play-state: paused !important;
        }

        @keyframes catMarqueeRTL {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .view-all-cat-btn:hover {
          transform: translateY(-2px) scale(1.03);
          background: #F3E8FF !important;
          border-color: #6D28D9 !important;
          box-shadow: 0 6px 18px rgba(109,40,217,0.2) !important;
        }
      `}</style>
    </section>
  );
}

/* ── SUB-COMPONENT: Circular Premium Category Card ── */
function CircularCategoryCard({ cat }: { cat: CategoryType }) {
  const [h, setH] = useState(false);

  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 160,
        background: "#fff",
        border: `2px solid ${h ? cat.color : "#E5E7EB"}`,
        borderRadius: 24,
        padding: "24px 16px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        flexShrink: 0,
        boxShadow: h ? `0 16px 36px ${cat.color}28, 0 0 20px ${cat.color}15` : "0 4px 16px rgba(0,0,0,0.03)",
        transform: h ? "translateY(-8px) scale(1.06)" : "translateY(0) scale(1)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Circle Icon Badge */}
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: "50%",
          background: cat.bg,
          border: `2px solid ${h ? cat.color : "rgba(255,255,255,0.8)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          boxShadow: h ? `0 8px 22px ${cat.color}35` : "0 4px 12px rgba(0,0,0,0.05)",
          transform: h ? "scale(1.12) rotate(-6deg)" : "scale(1) rotate(0deg)",
          transition: "all 0.3s ease",
        }}
      >
        {cat.icon}
      </div>

      {/* Category Name */}
      <h3 style={{ fontSize: 16, fontWeight: 900, color: h ? cat.color : "#111827", margin: "0 0 4px", transition: "color 0.2s" }}>
        {cat.name}
      </h3>

      {/* Count Badge */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: h ? "#fff" : cat.color,
          background: h ? cat.color : `${cat.color}15`,
          padding: "3px 10px",
          borderRadius: 12,
          transition: "all 0.25s",
        }}
      >
        {cat.count}
      </span>
    </div>
  );
}
