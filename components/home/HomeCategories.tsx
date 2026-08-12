"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Layers, AlertCircle, RotateCcw } from "lucide-react";

export type CategoryDbItem = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  display_order?: number;
  eventsCount?: number;
};

// Generic emoji map for presentation only if DB category doesn't have custom icon
const PRESENTATION_EMOJIS: Record<string, string> = {
  dance: "💃",
  modeling: "👗",
  acting: "🎭",
  singing: "🎤",
  music: "🎵",
  photography: "📷",
  sports: "🏆",
  cultural: "🎪",
  corporate: "💼",
  entertainment: "🍿",
};

export function HomeCategories() {
  const [categories, setCategories] = useState<CategoryDbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAdminCategories = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      if (data.error) throw new Error("API reported error");
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching homepage categories:", err);
      setError(true);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminCategories();
  }, []);

  return (
    <section
      style={{
        padding: "24px 0 28px",
        background: "#FFFFFF",
        borderBottom: "1px solid #F3F4F6",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px" }}>
        {/* Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#111827",
                margin: "0 0 2px",
                letterSpacing: "-0.3px",
              }}
            >
              Event Categories
            </h2>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0, fontWeight: 500 }}>
              Explore events by your interest
            </p>
          </div>

          <Link
            href="/categories"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 13.5,
              fontWeight: 800,
              color: "#6D28D9",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
            className="cat-see-all-btn"
          >
            View All <ChevronRight size={15} />
          </Link>
        </div>

        {/* ── 1. LOADING SKELETON STATE ── */}
        {loading && (
          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "hidden",
              padding: "4px 0",
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  width: 140,
                  height: 52,
                  borderRadius: 16,
                  background: "#F3F4F6",
                  border: "1.5px solid #E5E7EB",
                  animation: "pulse 1.5s infinite ease-in-out",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* ── 2. ERROR STATE ── */}
        {!loading && error && (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 16,
              background: "#FEF2F2",
              border: "1.5px solid #FECACA",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#DC2626", fontSize: 13.5, fontWeight: 600 }}>
              <AlertCircle size={18} />
              <span>Unable to load categories from database.</span>
            </div>
            <button
              onClick={fetchAdminCategories}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 10,
                background: "#DC2626",
                color: "#FFFFFF",
                fontSize: 12.5,
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} /> Retry
            </button>
          </div>
        )}

        {/* ── 3. EMPTY STATE ── */}
        {!loading && !error && categories.length === 0 && (
          <div
            style={{
              padding: "24px 20px",
              borderRadius: 16,
              background: "#F9FAFB",
              border: "1.5px dashed #E5E7EB",
              textAlign: "center",
              color: "#6B7280",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Layers size={18} color="#9CA3AF" />
            <span>No categories available</span>
          </div>
        )}

        {/* ── 4. SUCCESS STATE: DYNAMIC ADMIN CATEGORIES SCROLL / AUTOSCROLL TRACK ── */}
        {!loading && !error && categories.length > 0 && (
          <div
            style={{
              position: "relative",
              width: "100%",
              overflow: "hidden",
              padding: "4px 0 6px",
            }}
            className="cat-autoscroll-wrapper"
          >
            {/* Edge Fade Masks */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: 32,
                background: "linear-gradient(to right, #FFFFFF, transparent)",
                zIndex: 10,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: 32,
                background: "linear-gradient(to left, #FFFFFF, transparent)",
                zIndex: 10,
                pointerEvents: "none",
              }}
            />

            <div className="cat-autoscroll-track-container">
              <div className="cat-autoscroll-track">
                {(categories.length > 3
                  ? [...categories, ...categories, ...categories]
                  : categories
                ).map((cat, idx) => {
                  const catSlug = (cat.slug || cat.name.toLowerCase()).replace(/[^a-z0-9]+/g, "-");
                  const emoji = cat.icon || PRESENTATION_EMOJIS[catSlug] || "✨";
                  const countLabel = cat.eventsCount !== undefined ? `${cat.eventsCount} Events` : "";

                  return (
                    <Link
                      key={`${cat.id}-${idx}`}
                      href={`/events?category=${encodeURIComponent(cat.slug || cat.name)}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 16px",
                          borderRadius: 16,
                          background: "#FAF5FF",
                          border: "1.5px solid #DDD6FE",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                          minWidth: 125,
                          flexShrink: 0,
                        }}
                        className="home-cat-chip"
                      >
                        <span style={{ fontSize: 20, lineHeight: 1 }}>{emoji}</span>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: "#111827",
                              lineHeight: 1.2,
                            }}
                          >
                            {cat.name}
                          </span>
                          {countLabel && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#6D28D9",
                                marginTop: 2,
                              }}
                            >
                              {countLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        .cat-autoscroll-track-container {
          display: flex;
          width: 100%;
          overflow: hidden;
        }

        .cat-autoscroll-track {
          display: flex;
          gap: 14px;
          white-space: nowrap;
          will-change: transform;
          animation: catAutoScroll 26s linear infinite;
        }

        .cat-autoscroll-wrapper:hover .cat-autoscroll-track {
          animation-play-state: paused !important;
        }

        @keyframes catAutoScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .home-cat-chip:hover {
          transform: translateY(-2px) scale(1.03);
          background: #F3E8FF !important;
          border-color: #6D28D9 !important;
          box-shadow: 0 6px 16px rgba(109, 40, 217, 0.14) !important;
        }
        .cat-see-all-btn:hover {
          color: #5B21B6 !important;
        }
      `}</style>
    </section>
  );
}

export default HomeCategories;


