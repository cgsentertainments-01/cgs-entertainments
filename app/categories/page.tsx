"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Calendar,
  MapPin,
  Tag,
  FolderOpen,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventCard, EventType } from "@/components/events/EventCard";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  eventsCount?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(false);

      const [catRes, evtRes] = await Promise.all([
        fetch("/api/categories", { cache: "no-store" }),
        fetch("/api/events?upcoming=true", { cache: "no-store" }),
      ]);

      if (!catRes.ok) throw new Error("Failed to load categories");

      const catData = await catRes.json();
      const loadedCategories: CategoryData[] = catData.categories || [];
      setCategories(loadedCategories);

      if (evtRes.ok) {
        const evtData = await evtRes.json();
        setEvents(evtData.events || []);
      }
    } catch (err) {
      console.error("Error fetching category page data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter events based on selected category
  const filteredEvents = events.filter((evt) => {
    if (selectedCategory === "All") return true;
    const catName = evt.category || evt.badge || evt.category_name || "";
    const selectedObj = categories.find(
      (c) => c.name.toLowerCase() === selectedCategory.toLowerCase() || c.slug.toLowerCase() === selectedCategory.toLowerCase()
    );

    const matchesName = catName.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSlug = selectedObj && catName.toLowerCase() === selectedObj.slug.toLowerCase();
    const matchesId = selectedObj && evt.category_id && String(evt.category_id) === String(selectedObj.id);

    return matchesName || matchesSlug || matchesId;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", color: "#111827" }}>
      <Navbar />

      {/* ── 2. HERO SECTION (LIGHT THEME) ── */}
      <section
        style={{
          position: "relative",
          background: "linear-gradient(135deg, #F3E8FF 0%, #FAF5FF 50%, #EFF6FF 100%)",
          paddingTop: 64,
          overflow: "hidden",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        {/* Soft Background Accent Orbs */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "15%",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, transparent 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244, 114, 182, 0.2) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "48px 32px 44px",
            position: "relative",
            zIndex: 10,
            textAlign: "center",
          }}
        >
          {/* Tagline Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 30,
              background: "#FFFFFF",
              border: "1.5px solid #DDD6FE",
              color: "#6D28D9",
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 14,
              boxShadow: "0 4px 14px rgba(109, 40, 217, 0.12)",
            }}
          >
            <Compass size={14} color="#6D28D9" />
            <span>Event Discovery</span>
          </div>

          {/* Hero Main Heading */}
          <h1
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: "#111827",
              margin: "0 0 12px",
              letterSpacing: "-1px",
              lineHeight: 1.15,
            }}
            className="cat-hero-title"
          >
            EXPLORE{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6D28D9 0%, #9333EA 50%, #EC4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              EVENTS
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p
            style={{
              fontSize: 16.5,
              color: "#4B5563",
              maxWidth: 620,
              margin: "0 auto",
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            Discover experiences, activities and events happening around you.
          </p>
        </div>
      </section>

      {/* ── 3. CATEGORY NAVIGATION (LIGHT THEME HORIZONTAL BAR) ── */}
      <div
        style={{
          position: "sticky",
          top: 60,
          zIndex: 40,
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 20px" }} className="cgs-main-container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            className="cat-scroll-nav"
          >
            {/* All Events Pill */}
            <button
              onClick={() => setSelectedCategory("All")}
              style={{
                padding: "9px 22px",
                borderRadius: 30,
                border: selectedCategory === "All" ? "1.5px solid #6D28D9" : "1.5px solid #E5E7EB",
                background: selectedCategory === "All" ? "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)" : "#FFFFFF",
                color: selectedCategory === "All" ? "#FFFFFF" : "#374151",
                fontSize: 13.5,
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.22s ease",
                boxShadow: selectedCategory === "All" ? "0 4px 16px rgba(109, 40, 217, 0.3)" : "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <span>All Events</span>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 7px",
                  borderRadius: 12,
                  background: selectedCategory === "All" ? "rgba(255, 255, 255, 0.25)" : "#F3F4F6",
                  color: selectedCategory === "All" ? "#FFF" : "#6B7280",
                }}
              >
                {events.length}
              </span>
            </button>

            {/* Dynamic Category Pills */}
            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 30,
                    border: isSelected ? "1.5px solid #6D28D9" : "1.5px solid #E5E7EB",
                    background: isSelected ? "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)" : "#FFFFFF",
                    color: isSelected ? "#FFFFFF" : "#374151",
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.22s ease",
                    boxShadow: isSelected ? "0 4px 16px rgba(109, 40, 217, 0.3)" : "0 1px 3px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <span>{cat.name}</span>
                  {typeof cat.eventsCount === "number" && cat.eventsCount > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 7px",
                        borderRadius: 12,
                        background: isSelected ? "rgba(255, 255, 255, 0.25)" : "#F3F4F6",
                        color: isSelected ? "#FFF" : "#6B7280",
                      }}
                    >
                      {cat.eventsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "44px 32px 80px" }} className="cgs-main-container">

        {/* ── ERROR STATE (LIGHT THEME) ── */}
        {error && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1.5px solid #FCA5A5",
              maxWidth: 520,
              margin: "40px auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#FEF2F2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <RefreshCw size={26} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>
              Unable to load categories
            </h3>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 22px" }}>
              We encountered a connection issue. Please try again.
            </p>
            <button
              onClick={fetchData}
              style={{
                padding: "11px 26px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                color: "#FFF",
                border: "none",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(109, 40, 217, 0.3)",
              }}
            >
              <RefreshCw size={15} /> Try Again
            </button>
          </div>
        )}

        {/* ── LOADING SKELETONS (LIGHT THEME) ── */}
        {loading && !error && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ width: 220, height: 24, borderRadius: 8, background: "#E5E7EB" }} className="skeleton-pulse" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="cat-grid-layout">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  style={{
                    height: 280,
                    borderRadius: 22,
                    background: "#FFFFFF",
                    border: "1.5px solid #E5E7EB",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  }}
                  className="skeleton-pulse"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── CATEGORY SHOWCASE & CARDS (LIGHT THEME) ── */}
        {!loading && !error && (
          <>
            {/* Section Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#111827", margin: "0 0 4px", letterSpacing: -0.4 }}>
                  {selectedCategory === "All" ? "Featured Event Categories" : `${selectedCategory} Showcase`}
                </h2>
                <p style={{ fontSize: 14, color: "#6B7280", margin: 0, fontWeight: 500 }}>
                  Select a category to explore live stage and talent competitions.
                </p>
              </div>

              {selectedCategory !== "All" && (
                <button
                  onClick={() => setSelectedCategory("All")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6D28D9",
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Show All Categories →
                </button>
              )}
            </div>

            {/* ── 5, 6, 7, 8. CATEGORY CARDS EDITORIAL GRID (LIGHT THEME) ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 24,
                marginBottom: 60,
              }}
              className="cat-grid-layout"
            >
              {categories
                .filter((cat) => selectedCategory === "All" || cat.name.toLowerCase() === selectedCategory.toLowerCase())
                .map((cat, idx) => (
                  <CategoryCardLight
                    key={cat.id}
                    category={cat}
                    isSelected={selectedCategory.toLowerCase() === cat.name.toLowerCase()}
                    onSelect={() => setSelectedCategory(cat.name)}
                    isLargeFeatured={selectedCategory === "All" && idx < 2}
                  />
                ))}
            </div>

            {/* ── 10. SHOW EVENTS IN CATEGORY (LIGHT THEME) ── */}
            <div style={{ paddingTop: 16, borderTop: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: "#6D28D9",
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      marginBottom: 4,
                    }}
                  >
                    <Calendar size={13} color="#6D28D9" />
                    <span>Upcoming Events</span>
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: 0, letterSpacing: -0.5 }}>
                    {selectedCategory === "All"
                      ? "Upcoming Competition Events"
                      : `Upcoming ${selectedCategory} Events`}
                  </h2>
                </div>

                <Link
                  href={selectedCategory === "All" ? "/events" : `/events?category=${encodeURIComponent(selectedCategory)}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#6D28D9",
                    fontSize: 13.5,
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  View All Events <ChevronRight size={16} />
                </Link>
              </div>

              {/* ── 13. EMPTY CATEGORY STATE (LIGHT THEME) ── */}
              {filteredEvents.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 24px",
                    background: "#FFFFFF",
                    borderRadius: 22,
                    border: "1.5px dashed #CBD5E1",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "#F3E8FF",
                      color: "#6D28D9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <FolderOpen size={26} />
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>
                    No upcoming events in {selectedCategory}
                  </h3>
                  <p style={{ fontSize: 13.5, color: "#6B7280", margin: "0 0 20px" }}>
                    Check back soon or explore other categories for active competitions.
                  </p>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    style={{
                      padding: "11px 24px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                      color: "#FFF",
                      border: "none",
                      fontSize: 13.5,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: "0 4px 14px rgba(109, 40, 217, 0.25)",
                    }}
                  >
                    Explore All Events <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 22,
                  }}
                  className="cat-events-grid"
                >
                  {filteredEvents.map((evt) => (
                    <EventCard key={evt.id} evt={evt} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />

      <style>{`
        .cat-scroll-nav::-webkit-scrollbar {
          display: none;
        }
        .skeleton-pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 0.3; }
          100% { opacity: 0.7; }
        }
        @media (max-width: 1024px) {
          .cat-grid-layout { grid-template-columns: repeat(2, 1fr) !important; }
          .cat-events-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .cat-grid-layout { grid-template-columns: 1fr !important; }
          .cat-events-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
          .cat-hero-title { font-size: 32px !important; }
        }
      `}</style>
    </div>
  );
}

/* ── 5, 6, 7. LIGHT THEME CATEGORY CARD COMPONENT ── */
function CategoryCardLight({
  category,
  isSelected,
  onSelect,
  isLargeFeatured = false,
}: {
  category: CategoryData;
  isSelected: boolean;
  onSelect: () => void;
  isLargeFeatured?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fallbackImg =
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";
  const displayImage = imgError || !category.image ? fallbackImg : category.image;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        height: isLargeFeatured ? 310 : 260,
        borderRadius: 22,
        overflow: "hidden",
        cursor: "pointer",
        background: "#FFFFFF",
        border: isSelected
          ? "2.5px solid #6D28D9"
          : hovered
          ? "2px solid #8B5CF6"
          : "1.5px solid #E5E7EB",
        boxShadow: hovered
          ? "0 18px 42px rgba(109, 40, 217, 0.22), 0 4px 12px rgba(0, 0, 0, 0.05)"
          : isSelected
          ? "0 8px 24px rgba(109, 40, 217, 0.16)"
          : "0 2px 10px rgba(0, 0, 0, 0.04)",
        transform: hovered ? "translateY(-7px)" : "translateY(0)",
        transition: "all 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
      onClick={onSelect}
    >
      {/* Category Image */}
      <Image
        src={displayImage}
        alt={category.name}
        fill
        sizes="(max-width:768px) 100vw, 33vw"
        onError={() => setImgError(true)}
        style={{
          objectFit: "cover",
          objectPosition: "center",
          transform: hovered ? "scale(1.07)" : "scale(1)",
          transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Subtle Overlay Gradient for Text Contrast */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hovered
            ? "linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.65) 50%, rgba(15, 23, 42, 0.94) 100%)"
            : "linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.55) 50%, rgba(15, 23, 42, 0.88) 100%)",
          transition: "background 0.32s ease",
          pointerEvents: "none",
        }}
      />

      {/* Top Event Count Pill */}
      {typeof category.eventsCount === "number" && category.eventsCount > 0 && (
        <div style={{ position: "absolute", top: 14, right: 14, zIndex: 10 }}>
          <span
            style={{
              padding: "4px 11px",
              borderRadius: 20,
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              color: "#1E1B4B",
              fontSize: 11,
              fontWeight: 800,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              backdropFilter: "blur(6px)",
            }}
          >
            {category.eventsCount} {category.eventsCount === 1 ? "Event" : "Events"}
          </span>
        </div>
      )}

      {/* Card Content Area */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "22px 20px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <h3
          style={{
            fontSize: isLargeFeatured ? 25 : 21,
            fontWeight: 900,
            color: "#FFFFFF",
            margin: 0,
            letterSpacing: "-0.4px",
            lineHeight: 1.2,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {category.name}
        </h3>

        {category.description && (
          <p
            style={{
              fontSize: 12.5,
              color: "#E2E8F0",
              margin: 0,
              fontWeight: 500,
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {category.description}
          </p>
        )}

        {/* Explore Events Link */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 6,
            fontSize: 12.5,
            fontWeight: 800,
            color: hovered ? "#F472B6" : "#E9D5FF",
            transition: "color 0.25s ease",
          }}
        >
          <span>Explore events</span>
          <ArrowRight
            size={14}
            style={{
              transform: hovered ? "translateX(6px)" : "translateX(0)",
              transition: "transform 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
