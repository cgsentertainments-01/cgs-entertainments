"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronRight,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventCard } from "@/components/events/EventCard";

const ITEMS_PER_PAGE = 12;

function EventsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Primary data states
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Active Filter states
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All");
  const [activeDateFilter, setActiveDateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("nearest");

  // Mobile Bottom Sheet state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [tempMobileCat, setTempMobileCat] = useState("All");
  const [tempMobileLoc, setTempMobileLoc] = useState("All");
  const [tempMobileDate, setTempMobileDate] = useState("All");
  const [tempMobileSort, setTempMobileSort] = useState("nearest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Sync state from URL parameters on initial load
  useEffect(() => {
    if (!searchParams) return;
    const cat = searchParams.get("category") || searchParams.get("cat");
    const loc = searchParams.get("location") || searchParams.get("city");
    const dt = searchParams.get("date");
    const srt = searchParams.get("sort");
    const q = searchParams.get("search") || searchParams.get("q");

    if (cat) setActiveCategory(cat);
    if (loc) setActiveLocation(loc);
    if (dt) setActiveDateFilter(dt);
    if (srt) setSortBy(srt);
    if (q) setSearch(q);
  }, [searchParams]);

  // Sync active filters to URL query params
  const updateUrlParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val && val !== "All" && val !== "nearest" && val.trim() !== "") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    const queryString = params.toString();
    const newPath = queryString ? `/events?${queryString}` : "/events";
    window.history.replaceState(null, "", newPath);
  };

  // Fetch events and category data from backend APIs
  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);

      const [evtRes, catRes] = await Promise.all([
        fetch("/api/events?upcoming=true", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);

      if (!evtRes.ok) throw new Error("Failed to load events");

      const evtData = await evtRes.json();
      setEvents(evtData.events || []);

      if (catRes.ok) {
        const cData = await catRes.json();
        setCategories(cData.categories || []);
      }
    } catch (err) {
      console.error("Error loading events page data:", err);
      setError(true);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dynamically extract unique location/city names from loaded events
  const uniqueLocations = useMemo(() => {
    const locSet = new Set<string>();
    events.forEach((e) => {
      const city = e.city || e.location?.split(",")[1]?.trim() || e.location?.split(",")[0]?.trim();
      if (city && city.trim() && city.toLowerCase() !== "tba") {
        locSet.add(city.trim());
      }
    });
    return Array.from(locSet).sort();
  }, [events]);

  // Date filtering logic
  const checkDateMatch = (evtDateStr: string, filter: string) => {
    if (filter === "All") return true;
    if (!evtDateStr) return true;

    const evtDate = new Date(evtDateStr);
    if (isNaN(evtDate.getTime())) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === "Upcoming") {
      return evtDate.getTime() >= today.getTime();
    }

    if (filter === "Today") {
      return evtDate.toDateString() === today.toDateString();
    }

    if (filter === "This Week") {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return evtDate.getTime() >= today.getTime() && evtDate.getTime() <= nextWeek.getTime();
    }

    if (filter === "This Month") {
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
      return evtDate.getTime() >= today.getTime() && evtDate.getTime() <= endOfMonth.getTime();
    }

    return true;
  };

  // Multi-faceted Filtering logic
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // 1. Category Filter
      const catName = e.category || e.category_name || e.badge || "";
      const matchesCat =
        activeCategory === "All" ||
        catName.toLowerCase() === activeCategory.toLowerCase() ||
        (e.badge && e.badge.toLowerCase() === activeCategory.toLowerCase()) ||
        (e.category_id && String(e.category_id).toLowerCase() === activeCategory.toLowerCase()) ||
        (e.category_slug && e.category_slug.toLowerCase() === activeCategory.toLowerCase());

      // 2. Location Filter
      const evtLoc = `${e.location || ""} ${e.city || ""} ${e.venue || ""}`.toLowerCase();
      const matchesLoc =
        activeLocation === "All" || evtLoc.includes(activeLocation.toLowerCase());

      // 3. Date Filter
      const matchesDate = checkDateMatch(e.rawDate || e.event_date || e.date, activeDateFilter);

      // 4. Search Filter (Title, Location/City, Category)
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        evtLoc.includes(q) ||
        catName.toLowerCase().includes(q) ||
        (e.dance_style && e.dance_style.toLowerCase().includes(q));

      return matchesCat && matchesLoc && matchesDate && matchesSearch;
    });
  }, [events, activeCategory, activeLocation, activeDateFilter, search]);

  // Sorting logic
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (sortBy === "nearest") {
        const dA = new Date(a.rawDate || a.event_date || a.date).getTime() || 0;
        const dB = new Date(b.rawDate || b.event_date || b.date).getTime() || 0;
        return dA - dB;
      } else if (sortBy === "latest") {
        const dA = new Date(a.created_at || a.rawDate || a.event_date || a.date).getTime() || 0;
        const dB = new Date(b.created_at || b.rawDate || b.event_date || b.date).getTime() || 0;
        return dB - dA;
      } else if (sortBy === "title_asc") {
        return (a.title || "").localeCompare(b.title || "");
      } else if (sortBy === "fee_asc") {
        return (a.registrationFee || a.registration_fee || 0) - (b.registrationFee || b.registration_fee || 0);
      } else if (sortBy === "fee_desc") {
        return (b.registrationFee || b.registration_fee || 0) - (a.registrationFee || a.registration_fee || 0);
      }
      return 0;
    });
  }, [filteredEvents, sortBy]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategory, activeLocation, activeDateFilter, sortBy]);

  // Paginated subset
  const totalPages = Math.ceil(sortedEvents.length / ITEMS_PER_PAGE) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedEvents, currentPage]);

  const hasActiveFilters =
    search.trim() !== "" ||
    activeCategory !== "All" ||
    activeLocation !== "All" ||
    activeDateFilter !== "All" ||
    sortBy !== "nearest";

  const clearAllFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setActiveLocation("All");
    setActiveDateFilter("All");
    setSortBy("nearest");
    updateUrlParams({ search: "", category: "All", location: "All", date: "All", sort: "nearest" });
  };

  // Open Mobile Filter Modal and sync current states
  const openMobileModal = () => {
    setTempMobileCat(activeCategory);
    setTempMobileLoc(activeLocation);
    setTempMobileDate(activeDateFilter);
    setTempMobileSort(sortBy);
    setMobileFilterOpen(true);
  };

  const applyMobileFilters = () => {
    setActiveCategory(tempMobileCat);
    setActiveLocation(tempMobileLoc);
    setActiveDateFilter(tempMobileDate);
    setSortBy(tempMobileSort);
    updateUrlParams({
      category: tempMobileCat,
      location: tempMobileLoc,
      date: tempMobileDate,
      sort: tempMobileSort,
      search,
    });
    setMobileFilterOpen(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", color: "#111827" }}>
      <Navbar />

      {/* ── 1. PAGE HEADER HERO SECTION (COMPACT) ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #1E1B4B 0%, #3730A3 50%, #6D28D9 100%)",
          paddingTop: 64,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Ambient Background Light Orbs */}
        <div
          style={{
            position: "absolute",
            top: "-40%",
            right: "10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 32px 38px", position: "relative", zIndex: 10 }}>
          {/* Subtle Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Link href="/" style={{ fontSize: 13, color: "#C4B5FD", textDecoration: "none", fontWeight: 600 }}>
              Home
            </Link>
            <ChevronRight size={14} color="#A78BFA" />
            <span style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 700 }}>Events</span>
          </div>

          <h1
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: "#FFFFFF",
              margin: "0 0 8px",
              letterSpacing: "-0.8px",
              lineHeight: 1.15,
            }}
            className="evts-hero-title"
          >
            EVENTS
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#E9D5FF",
              fontWeight: 600,
              margin: "0 0 6px",
            }}
          >
            Discover events worth experiencing.
          </p>
          <p
            style={{
              fontSize: 13.5,
              color: "#C4B5FD",
              margin: 0,
              maxWidth: 700,
              fontWeight: 500,
              lineHeight: 1.45,
            }}
          >
            Explore competitions, entertainment, corporate events, cultural programs and more happening across India.
          </p>
        </div>
      </section>

      {/* ── 2. SEARCH & DESKTOP / MOBILE FILTER TOOLBAR ── */}
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
          position: "sticky",
          top: 60,
          zIndex: 40,
        }}
        className="evts-sticky-toolbar"
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 20px" }} className="cgs-main-container">
          {/* Main Toolbar Container */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Top Search Line */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Prominent Search Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#F9FAFB",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 14,
                  padding: "0 16px",
                  flex: 1,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                className="search-input-wrapper"
              >
                <Search size={18} color="#6D28D9" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search events, cities, categories..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    updateUrlParams({ search: e.target.value, category: activeCategory, location: activeLocation, date: activeDateFilter, sort: sortBy });
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    outline: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#111827",
                    width: "100%",
                    padding: "11px 0",
                  }}
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      updateUrlParams({ search: "", category: activeCategory, location: activeLocation, date: activeDateFilter, sort: sortBy });
                    }}
                    style={{ border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
                  >
                    <X size={16} color="#9CA3AF" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Trigger Button (< 768px) */}
              <button
                onClick={openMobileModal}
                className="mobile-filter-trigger"
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 18px",
                  background: hasActiveFilters ? "#F3E8FF" : "#F9FAFB",
                  border: `1.5px solid ${hasActiveFilters ? "#6D28D9" : "#E5E7EB"}`,
                  borderRadius: 14,
                  color: hasActiveFilters ? "#6D28D9" : "#374151",
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <SlidersHorizontal size={16} color={hasActiveFilters ? "#6D28D9" : "#4B5563"} />
                Filter &amp; Sort
              </button>
            </div>

            {/* Desktop Filters Row (Hidden on Mobile) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
              className="desktop-filter-toolbar"
            >
              {/* Category Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <select
                  value={activeCategory}
                  onChange={(e) => {
                    setActiveCategory(e.target.value);
                    updateUrlParams({ category: e.target.value, location: activeLocation, date: activeDateFilter, sort: sortBy, search });
                  }}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${activeCategory !== "All" ? "#6D28D9" : "#E5E7EB"}`,
                    background: activeCategory !== "All" ? "#FAF5FF" : "#F9FAFB",
                    color: activeCategory !== "All" ? "#6D28D9" : "#374151",
                    fontSize: 13.5,
                    fontWeight: 700,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="All">Category: All</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <select
                  value={activeLocation}
                  onChange={(e) => {
                    setActiveLocation(e.target.value);
                    updateUrlParams({ location: e.target.value, category: activeCategory, date: activeDateFilter, sort: sortBy, search });
                  }}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${activeLocation !== "All" ? "#6D28D9" : "#E5E7EB"}`,
                    background: activeLocation !== "All" ? "#FAF5FF" : "#F9FAFB",
                    color: activeLocation !== "All" ? "#6D28D9" : "#374151",
                    fontSize: 13.5,
                    fontWeight: 700,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="All">Location: All Cities</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <select
                  value={activeDateFilter}
                  onChange={(e) => {
                    setActiveDateFilter(e.target.value);
                    updateUrlParams({ date: e.target.value, category: activeCategory, location: activeLocation, sort: sortBy, search });
                  }}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${activeDateFilter !== "All" ? "#6D28D9" : "#E5E7EB"}`,
                    background: activeDateFilter !== "All" ? "#FAF5FF" : "#F9FAFB",
                    color: activeDateFilter !== "All" ? "#6D28D9" : "#374151",
                    fontSize: 13.5,
                    fontWeight: 700,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="All">Date: All Dates</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    updateUrlParams({ sort: e.target.value, category: activeCategory, location: activeLocation, date: activeDateFilter, search });
                  }}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #E5E7EB",
                    background: "#F9FAFB",
                    color: "#374151",
                    fontSize: 13.5,
                    fontWeight: 700,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="nearest">Sort: Nearest Date</option>
                  <option value="latest">Sort: Latest Added</option>
                  <option value="title_asc">Sort: A-Z</option>
                  <option value="fee_asc">Sort: Fee (Low to High)</option>
                  <option value="fee_desc">Sort: Fee (High to Low)</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 12,
                    border: "1.5px solid #DDD6FE",
                    background: "#FFFFFF",
                    color: "#6D28D9",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s ease",
                  }}
                >
                  <RotateCcw size={14} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT CONTAINER ── */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px 80px" }}>
        {/* Results Header Counter */}
        {!loading && !error && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
              {sortedEvents.length} {sortedEvents.length === 1 ? "event" : "events"} found
            </div>

            {sortedEvents.length > 0 && (
              <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, sortedEvents.length)} of {sortedEvents.length}
              </div>
            )}
          </div>
        )}

        {/* ── LOADING SKELETON STATE ── */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 22,
            }}
            className="events-page-grid"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
                <div style={{ width: "100%", height: 180, background: "#E5E7EB" }} />
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  <div style={{ width: "85%", height: 20, background: "#E5E7EB", borderRadius: 6 }} />
                  <div style={{ width: "55%", height: 14, background: "#E5E7EB", borderRadius: 6 }} />
                  <div style={{ width: "45%", height: 14, background: "#E5E7EB", borderRadius: 6 }} />
                  <div style={{ width: "100%", height: 38, background: "#E5E7EB", borderRadius: 10, marginTop: "auto" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {!loading && error && (
          <div
            style={{
              textAlign: "center",
              padding: "70px 24px",
              background: "#FFFFFF",
              borderRadius: 22,
              border: "1.5px solid #FCA5A5",
              maxWidth: 480,
              margin: "40px auto",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#FEF2F2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>
              Unable to load events
            </h3>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 22px" }}>
              We encountered a connection issue. Please try again.
            </p>
            <button
              onClick={loadData}
              style={{
                padding: "11px 26px",
                borderRadius: 12,
                background: "#6D28D9",
                color: "#FFF",
                border: "none",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(109, 40, 217, 0.3)",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── NO EVENTS IN DATABASE AT ALL STATE ── */}
        {!loading && !error && events.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              background: "#FFFFFF",
              borderRadius: 22,
              border: "1.5px solid #E5E7EB",
              maxWidth: 520,
              margin: "30px auto",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#F3E8FF",
                color: "#6D28D9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <FolderOpen size={28} />
            </div>
            <h3 style={{ fontSize: 21, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>
              No events available yet
            </h3>
            <p style={{ fontSize: 14.5, color: "#6B7280", margin: 0 }}>
              Check back soon for upcoming national competitions and entertainment events.
            </p>
          </div>
        )}

        {/* ── EMPTY SEARCH / FILTERED STATE ── */}
        {!loading && !error && events.length > 0 && sortedEvents.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              background: "#FFFFFF",
              borderRadius: 22,
              border: "1.5px solid #E5E7EB",
              maxWidth: 540,
              margin: "30px auto",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 14 }}>🔍</div>
            <h3 style={{ fontSize: 21, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>
              No events found
            </h3>
            <p style={{ fontSize: 14.5, color: "#6B7280", margin: "0 0 24px", lineHeight: 1.5 }}>
              We couldn&apos;t find events matching your search or active filters.
            </p>
            <button
              onClick={clearAllFilters}
              style={{
                padding: "11px 26px",
                borderRadius: 12,
                background: "#6D28D9",
                color: "#FFF",
                border: "none",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(109, 40, 217, 0.25)",
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* ── 4. EVENT CARDS GRID (4/3/2/1 RESPONSIVE COLUMNS) ── */}
        {!loading && !error && sortedEvents.length > 0 && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 22,
              }}
              className="events-page-grid"
            >
              {paginatedEvents.map((evt) => (
                <EventCard key={evt.id} evt={evt} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 48,
                }}
              >
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    background: "#FFFFFF",
                    color: currentPage === 1 ? "#9CA3AF" : "#374151",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      border: `1.5px solid ${currentPage === pNum ? "#6D28D9" : "#E5E7EB"}`,
                      background: currentPage === pNum ? "#6D28D9" : "#FFFFFF",
                      color: currentPage === pNum ? "#FFFFFF" : "#374151",
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    background: "#FFFFFF",
                    color: currentPage === totalPages ? "#9CA3AF" : "#374151",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── 5. MOBILE BOTTOM SHEET FILTER MODAL ── */}
      {mobileFilterOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: "24px 20px 32px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 -10px 40px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 19, fontWeight: 900, color: "#111827", margin: 0 }}>
                Filter &amp; Sort Events
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                style={{ border: "none", background: "#F3F4F6", borderRadius: "50%", padding: 6, cursor: "pointer" }}
              >
                <X size={18} color="#374151" />
              </button>
            </div>

            {/* Category Select */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#374151", marginBottom: 8 }}>
                Category
              </label>
              <select
                value={tempMobileCat}
                onChange={(e) => setTempMobileCat(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #E5E7EB",
                  background: "#F9FAFB",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111827",
                  outline: "none",
                }}
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Select */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#374151", marginBottom: 8 }}>
                Location
              </label>
              <select
                value={tempMobileLoc}
                onChange={(e) => setTempMobileLoc(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #E5E7EB",
                  background: "#F9FAFB",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111827",
                  outline: "none",
                }}
              >
                <option value="All">All Cities</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Select */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#374151", marginBottom: 8 }}>
                Date Range
              </label>
              <select
                value={tempMobileDate}
                onChange={(e) => setTempMobileDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #E5E7EB",
                  background: "#F9FAFB",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111827",
                  outline: "none",
                }}
              >
                <option value="All">All Dates</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            {/* Sort Select */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#374151", marginBottom: 8 }}>
                Sort By
              </label>
              <select
                value={tempMobileSort}
                onChange={(e) => setTempMobileSort(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #E5E7EB",
                  background: "#F9FAFB",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111827",
                  outline: "none",
                }}
              >
                <option value="nearest">Nearest Date</option>
                <option value="latest">Latest Added</option>
                <option value="title_asc">A-Z</option>
                <option value="fee_asc">Fee (Low to High)</option>
                <option value="fee_desc">Fee (High to Low)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                onClick={() => {
                  setTempMobileCat("All");
                  setTempMobileLoc("All");
                  setTempMobileDate("All");
                  setTempMobileSort("nearest");
                }}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "1.5px solid #E5E7EB",
                  background: "#FFFFFF",
                  color: "#374151",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Clear All
              </button>
              <button
                onClick={applyMobileFilters}
                style={{
                  flex: 2,
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "none",
                  background: "#6D28D9",
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(109,40,217,0.3)",
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* ── RESPONSIVE & ANIMATION STYLES ── */}
      <style>{`
        .skeleton-pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 0.3; }
          100% { opacity: 0.7; }
        }

        @media (min-width: 1280px) {
          .events-page-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 1279px) and (min-width: 1024px) {
          .events-page-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 1023px) and (min-width: 640px) {
          .events-page-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 639px) {
          .events-page-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }

        @media (max-width: 768px) {
          .desktop-filter-toolbar { display: none !important; }
          .mobile-filter-trigger { display: flex !important; }
          .evts-hero-title { font-size: 30px !important; }
        }
      `}</style>
    </div>
  );
}

function EventsLoadingFallback() {
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />
      <div style={{ marginTop: 120, textAlign: "center", color: "#6B7280", fontWeight: 600 }}>
        Loading events discovery...
      </div>
      <Footer />
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsLoadingFallback />}>
      <EventsPageContent />
    </Suspense>
  );
}
