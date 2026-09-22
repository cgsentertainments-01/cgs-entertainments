"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Bell,
  SlidersHorizontal,
  Calendar,
  MapPin,
  Heart,
  ChevronRight,
  Sparkles,
  X,
  RotateCcw,
  Flame,
} from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { isUpcomingEvent, isPublishedEvent } from "@/lib/event-lifecycle";

export type EventHubItem = {
  id: string;
  title: string;
  slug: string;
  badge: string;
  badgeBg?: string;
  date: string;
  rawDate?: string;
  location: string;
  venue?: string;
  city?: string;
  img: string;
  short_description?: string;
  description?: string;
  registrationFee?: number;
  is_featured?: boolean;
};

let cachedHubEvents: EventHubItem[] | null = null;
let cachedHubChips: { id: string; label: string; badge: string }[] | null = null;

export function DiscoverEventHub() {
  const [events, setEvents] = useState<EventHubItem[]>(cachedHubEvents || []);
  const [loading, setLoading] = useState(cachedHubEvents === null);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");

  // Modal State
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Dynamic Categories state
  const [dbCategories, setDbCategories] = useState<{ id: string; label: string; badge: string }[]>(
    cachedHubChips || [{ id: "all", label: "All", badge: "ALL" }]
  );

  useEffect(() => {
    async function fetchChips() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            const mapped = data.categories.map((c: any) => ({
              id: c.slug || c.id,
              label: c.name,
              badge: (c.slug || c.name).toUpperCase(),
            }));
            const chips = [{ id: "all", label: "All", badge: "ALL" }, ...mapped];
            cachedHubChips = chips;
            setDbCategories(chips);
          }
        }
      } catch (err) {
        console.warn("Notice loading category chips:", err);
      }
    }
    fetchChips();
  }, []);

  const categoryChips = dbCategories;

  // Wishlist State (persisted in localStorage)
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cgs_wishlist");
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch {
      // ignore storage error
    }
  }, []);

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setWishlist((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("cgs_wishlist", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Fetch events immediately from API with background revalidation
  useEffect(() => {
    let isMounted = true;
    async function loadEvents() {
      try {
        if (!cachedHubEvents) {
          setLoading(true);
        }
        const res = await fetch("/api/events?type=published");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.events)) {
            cachedHubEvents = data.events;
            setEvents(data.events);
          }
        }
      } catch (err) {
        console.error("Error fetching events for Discover Hub:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  // Published Events vs Upcoming Events
  const publishedEvents = useMemo(() => {
    return events.filter((e: any) => isPublishedEvent(e));
  }, [events]);

  const upcomingEventsRaw = useMemo(() => {
    return events.filter((e: any) => isUpcomingEvent(e));
  }, [events]);

  // Combined list for search & category filtering
  const allAvailableEvents = useMemo(() => {
    return publishedEvents;
  }, [publishedEvents]);

  // Unique Cities extracted from published events
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    allAvailableEvents.forEach((e) => {
      const city = e.city || e.location?.split(",")[1]?.trim() || e.location?.split(",")[0]?.trim();
      if (city && city.toLowerCase() !== "tba") set.add(city.trim());
    });
    return Array.from(set).sort();
  }, [allAvailableEvents]);

  // Filtered published events list
  const filteredEvents = useMemo(() => {
    return allAvailableEvents.filter((evt) => {
      // 1. Category Pill Filter
      const catName = (evt.badge || "").toLowerCase();
      const matchesCategory =
        selectedCategory === "All" ||
        catName === selectedCategory.toLowerCase() ||
        (evt.badge && evt.badge.toLowerCase().includes(selectedCategory.toLowerCase()));

      // 2. Search Text Filter
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        evt.title.toLowerCase().includes(q) ||
        (evt.location && evt.location.toLowerCase().includes(q)) ||
        (evt.badge && evt.badge.toLowerCase().includes(q)) ||
        (evt.short_description && evt.short_description.toLowerCase().includes(q));

      // 3. City Filter
      const matchesCity =
        selectedCity === "All" ||
        (evt.location && evt.location.toLowerCase().includes(selectedCity.toLowerCase())) ||
        (evt.city && evt.city.toLowerCase() === selectedCity.toLowerCase());

      // 4. Date Filter
      let matchesDate = true;
      if (selectedDateFilter !== "All" && evt.rawDate) {
        const evtTime = new Date(evt.rawDate).getTime();
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (selectedDateFilter === "Upcoming") matchesDate = evtTime >= now.getTime();
        else if (selectedDateFilter === "This Month") {
          const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
          matchesDate = evtTime >= now.getTime() && evtTime <= endMonth;
        }
      }

      return matchesCategory && matchesSearch && matchesCity && matchesDate;
    });
  }, [allAvailableEvents, selectedCategory, search, selectedCity, selectedDateFilter]);

  // Separate Featured vs Main List
  const featuredEvent = useMemo(() => {
    return filteredEvents.find((e) => e.is_featured) || filteredEvents[0] || null;
  }, [filteredEvents]);

  const upcomingList = useMemo(() => {
    return upcomingEventsRaw;
  }, [upcomingEventsRaw]);

  const hasActiveFilters =
    search.trim() !== "" || selectedCategory !== "All" || selectedCity !== "All" || selectedDateFilter !== "All";

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedCity("All");
    setSelectedDateFilter("All");
  };

  return (
    <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "16px 20px 48px" }} className="cgs-discover-hub">
      {/* ── 1. HEADER SECTION ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          padding: "4px 0",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#111827",
              margin: "0 0 2px",
              letterSpacing: "-0.6px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Discover Events
            <Sparkles size={20} color="#6D28D9" style={{ animation: "spin 12s linear infinite" }} />
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0, fontWeight: 500 }}>
            Find something exciting
          </p>
        </div>

        {/* Notifications Icon (🔔) */}
        <Link
          href="/notifications"
          aria-label="Notifications"
          style={{
            position: "relative",
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "#FFFFFF",
            border: "1.5px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#374151",
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            transition: "all 0.2s ease",
          }}
          className="cgs-bell-btn"
        >
          <Bell size={20} color="#6D28D9" />
          {/* Notification Dot */}
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#EF4444",
              border: "2px solid #FFFFFF",
            }}
          />
        </Link>
      </header>

      {/* ── 2. SEARCH & FILTER TOOLBAR (🔍 Search events... ⚙) ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        {/* Search Input Box */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#FFFFFF",
            border: "1.5px solid #E5E7EB",
            borderRadius: 16,
            padding: "0 16px",
            flex: 1,
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          className="search-bar-container"
        >
          <Search size={19} color="#6D28D9" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              background: "none",
              outline: "none",
              fontSize: 14.5,
              fontWeight: 500,
              color: "#111827",
              width: "100%",
              padding: "13px 0",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={16} color="#9CA3AF" />
            </button>
          )}
        </div>

        {/* Quick Filter Gear Button (⚙) */}
        <button
          onClick={() => setFilterModalOpen(true)}
          aria-label="Filter Events"
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: hasActiveFilters ? "#F3E8FF" : "#FFFFFF",
            border: `1.5px solid ${hasActiveFilters ? "#6D28D9" : "#E5E7EB"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: hasActiveFilters ? "#6D28D9" : "#374151",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          className="filter-gear-btn"
        >
          <SlidersHorizontal size={20} color={hasActiveFilters ? "#6D28D9" : "#4B5563"} />
        </button>
      </div>

      {/* ── 3. HORIZONTAL CATEGORY CHIPS ([All] [Dance] [Design] ...) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 12,
          marginBottom: 24,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="category-chips-scroll"
      >
        {categoryChips.map((chip) => {
          const isActive = selectedCategory.toLowerCase() === chip.label.toLowerCase();
          return (
            <button
              key={chip.id}
              onClick={() => setSelectedCategory(chip.label)}
              style={{
                padding: "10px 20px",
                borderRadius: 20,
                border: `1.5px solid ${isActive ? "#6D28D9" : "#E5E7EB"}`,
                background: isActive
                  ? "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)"
                  : "#FFFFFF",
                color: isActive ? "#FFFFFF" : "#374151",
                fontSize: 13.5,
                fontWeight: isActive ? 800 : 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
                boxShadow: isActive
                  ? "0 4px 14px rgba(109, 40, 217, 0.3)"
                  : "0 2px 6px rgba(0,0,0,0.02)",
                transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transform: isActive ? "scale(1.03)" : "scale(1)",
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* ── 4. FEATURED EVENT SECTION ── */}
      <section style={{ marginBottom: 36 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "#111827",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              letterSpacing: "-0.3px",
            }}
          >
            Featured
            <Flame size={18} color="#EF4444" fill="#EF4444" />
          </h2>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                background: "none",
                border: "none",
                color: "#6D28D9",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        {/* Featured Card matching wireframe with loading skeleton */}
        {loading ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E5E7EB",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.04)",
            }}
            className="skeleton-pulse"
          >
            <div style={{ width: "100%", height: 260, background: "#F3F4F6" }} />
            <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ width: "60%", height: 24, background: "#E5E7EB", borderRadius: 8 }} />
              <div style={{ width: "40%", height: 16, background: "#E5E7EB", borderRadius: 6 }} />
              <div style={{ width: "85%", height: 16, background: "#E5E7EB", borderRadius: 6 }} />
              <div style={{ width: "100%", height: 46, background: "#E5E7EB", borderRadius: 14, marginTop: 8 }} />
            </div>
          </div>
        ) : featuredEvent ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E5E7EB",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(109, 40, 217, 0.04)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            className="featured-hero-card"
          >
            {/* EVENT IMAGE & CATEGORY OVERLAY */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 260,
                background: "#1E1B4B",
                overflow: "hidden",
              }}
            >
              {featuredEvent.img ? (
                <Image
                  src={featuredEvent.img}
                  alt={featuredEvent.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                  priority
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #1E1B4B 0%, #4C1D95 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={40} color="#8B5CF6" />
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />

              {/* Category Badge overlay (e.g. DANCE) */}
              <span
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 18,
                  background: featuredEvent.badgeBg || "#6D28D9",
                  color: "#FFFFFF",
                  padding: "6px 14px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {featuredEvent.badge || "FEATURED"}
              </span>
            </div>

            {/* CARD BODY DETAILS */}
            <div style={{ padding: "20px 22px 24px" }}>
              {/* Title & Wishlist Heart Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <h3
                  style={{
                    fontSize: 21,
                    fontWeight: 900,
                    color: "#111827",
                    margin: 0,
                    lineHeight: 1.25,
                    letterSpacing: "-0.4px",
                  }}
                >
                  {featuredEvent.title}
                </h3>

                {/* Wishlist Heart Toggle Button (♡ / ❤️) */}
                <button
                  onClick={(e) => toggleWishlist(featuredEvent.id, e)}
                  aria-label="Save to Wishlist"
                  style={{
                    border: "none",
                    background: wishlist[featuredEvent.id] ? "#FEE2E2" : "#F3F4F6",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: wishlist[featuredEvent.id] ? "scale(1.1)" : "scale(1)",
                    flexShrink: 0,
                  }}
                >
                  <Heart
                    size={20}
                    color={wishlist[featuredEvent.id] ? "#EF4444" : "#6B7280"}
                    fill={wishlist[featuredEvent.id] ? "#EF4444" : "none"}
                  />
                </button>
              </div>

              {/* Date & Location */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", fontWeight: 700 }}>
                  <span style={{ fontSize: 16 }}>📅</span>
                  <span>{featuredEvent.date}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", fontWeight: 700 }}>
                  <span style={{ fontSize: 16 }}>📍</span>
                  <span>{featuredEvent.location}</span>
                </div>
              </div>

              {/* Short Description */}
              {(featuredEvent.short_description || featuredEvent.description) && (
                <p
                  style={{
                    fontSize: 13.5,
                    color: "#6B7280",
                    margin: "0 0 20px",
                    lineHeight: 1.5,
                    fontWeight: 500,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {featuredEvent.short_description || featuredEvent.description}
                </p>
              )}

              {/* View Details Button */}
              <Link
                href={`/events/${featuredEvent.slug || featuredEvent.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px 24px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                  color: "#FFFFFF",
                  fontSize: 14.5,
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(109, 40, 217, 0.3)",
                  transition: "all 0.2s ease",
                  width: "100%",
                }}
                className="view-details-btn"
              >
                View Details
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: 40,
              background: "#FFFFFF",
              borderRadius: 20,
              border: "1.5px dashed #E5E7EB",
              textAlign: "center",
              color: "#6B7280",
            }}
          >
            No featured events match your search filters.
          </div>
        )}
      </section>

      {/* ── 5. UPCOMING EVENTS SECTION ── */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "#111827",
              margin: 0,
              letterSpacing: "-0.3px",
            }}
          >
            Upcoming Events
          </h2>
          <Link
            href="/events"
            style={{
              fontSize: 13.5,
              fontWeight: 800,
              color: "#6D28D9",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            See All <ChevronRight size={15} />
          </Link>
        </div>

        {/* Cards Grid with Loading Skeletons */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18,
            }}
            className="upcoming-events-grid"
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 18,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: 340,
                }}
                className="skeleton-pulse"
              >
                <div style={{ width: "100%", height: 180, background: "#F3F4F6" }} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  <div style={{ width: "80%", height: 18, background: "#E5E7EB", borderRadius: 6 }} />
                  <div style={{ width: "50%", height: 14, background: "#E5E7EB", borderRadius: 6 }} />
                  <div style={{ width: "40%", height: 14, background: "#E5E7EB", borderRadius: 6 }} />
                  <div style={{ width: "100%", height: 36, background: "#E5E7EB", borderRadius: 10, marginTop: "auto" }} />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingList.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18,
            }}
            className="upcoming-events-grid"
          >
            {upcomingList.map((evt) => (
              <EventCard key={evt.id} evt={evt} />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: 40,
              background: "#FFFFFF",
              borderRadius: 20,
              border: "1.5px dashed #E5E7EB",
              textAlign: "center",
              color: "#6B7280",
            }}
          >
            No upcoming events found.
          </div>
        )}
      </section>

      {/* ── 6. QUICK FILTER MODAL / SHEET (⚙ Triggered) ── */}
      {filterModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(17, 24, 39, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setFilterModalOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 540,
              background: "#FFFFFF",
              borderRadius: "28px 28px 0 0",
              padding: "24px 24px 32px",
              boxShadow: "0 -10px 40px rgba(0,0,0,0.2)",
              animation: "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <SlidersHorizontal size={20} color="#6D28D9" /> Filter &amp; Sort
              </h3>
              <button
                onClick={() => setFilterModalOpen(false)}
                style={{ border: "none", background: "#F3F4F6", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={18} color="#4B5563" />
              </button>
            </div>

            {/* Filter Options Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Category Filter */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #E5E7EB",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    outline: "none",
                  }}
                >
                  <option value="All">All Categories</option>
                  {categoryChips.filter((c) => c.id !== "all").map((c) => (
                    <option key={c.id} value={c.label}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* City / Location Filter */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>
                  City / Location
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #E5E7EB",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    outline: "none",
                  }}
                >
                  <option value="All">All Cities</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>
                  Date Filter
                </label>
                <select
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #E5E7EB",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    outline: "none",
                  }}
                >
                  <option value="All">All Dates</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="This Month">This Month</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <button
                  onClick={clearFilters}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 14,
                    border: "1.5px solid #DDD6FE",
                    background: "#FFFFFF",
                    color: "#6D28D9",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Reset All
                </button>
                <button
                  onClick={() => setFilterModalOpen(false)}
                  style={{
                    flex: 2,
                    padding: "12px",
                    borderRadius: 14,
                    border: "none",
                    background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(109, 40, 217, 0.3)",
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      <style jsx global>{`
        @media (max-width: 767px) {
          .cgs-discover-hub {
            padding-bottom: 96px !important;
          }
        }
        .category-chips-scroll::-webkit-scrollbar {
          display: none;
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @media (max-width: 639px) {
          .upcoming-events-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .upcoming-events-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 14px !important;
          }
        }
        @media (min-width: 1024px) {
          .upcoming-events-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }
        }
        .featured-hero-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 44px rgba(109, 40, 217, 0.16) !important;
        }
        .cgs-bell-btn:hover,
        .filter-gear-btn:hover {
          border-color: #6D28D9 !important;
          transform: translateY(-2px);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .skeleton-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
