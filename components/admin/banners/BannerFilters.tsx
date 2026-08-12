import React from "react";
import { BannerFilterState, BannerPlacement, BannerDerivedStatus } from "@/types/banner";
import { Search, RefreshCw, Plus, Filter, X } from "lucide-react";

interface BannerFiltersProps {
  filters: BannerFilterState;
  onFilterChange: (newFilters: Partial<BannerFilterState>) => void;
  onRefresh: () => void;
  onCreateClick: () => void;
  isRefreshing?: boolean;
}

export function BannerFilters({
  filters,
  onFilterChange,
  onRefresh,
  onCreateClick,
  isRefreshing = false,
}: BannerFiltersProps) {
  const statusOptions: { key: "all" | BannerDerivedStatus; label: string }[] = [
    { key: "all", label: "All Status" },
    { key: "active", label: "Active" },
    { key: "scheduled", label: "Scheduled" },
    { key: "expired", label: "Expired" },
    { key: "inactive", label: "Inactive" },
    { key: "draft", label: "Draft" },
  ];

  const placementOptions: { key: "all" | BannerPlacement; label: string }[] = [
    { key: "all", label: "All Placements" },
    { key: "hero", label: "Homepage Hero Slider" },
    { key: "event", label: "Event Highlight" },
    { key: "promotional", label: "Promotional Banner" },
    { key: "announcement", label: "Announcement Popup" },
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        padding: "16px 20px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Top Row: Search input + Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Search Bar */}
        <div style={{ flex: "1 1 300px", position: "relative" }}>
          <Search
            size={18}
            color="#94A3B8"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search by title, subtitle, or button text..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            style={{
              width: "100%",
              padding: "11px 40px 11px 42px",
              borderRadius: 12,
              border: "1.5px solid #E2E8F0",
              fontSize: 13.5,
              color: "#0F172A",
              background: "#F8FAFC",
              outline: "none",
              transition: "all 0.2s ease",
            }}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: "" })}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Placement Dropdown */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Filter size={15} color="#64748B" style={{ position: "absolute", left: 12, pointerEvents: "none" }} />
            <select
              value={filters.placement}
              onChange={(e) => onFilterChange({ placement: e.target.value as any })}
              style={{
                padding: "10px 14px 10px 34px",
                borderRadius: 12,
                border: "1.5px solid #E2E8F0",
                fontSize: 13,
                fontWeight: 700,
                color: "#334155",
                background: "#ffffff",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {placementOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1.5px solid #E2E8F0",
              background: "#ffffff",
              color: "#475569",
              fontSize: 13,
              fontWeight: 700,
              cursor: isRefreshing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Refresh Banners"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span className="hidden-mobile">Refresh</span>
          </button>

          {/* Primary Create Button */}
          <button
            type="button"
            onClick={onCreateClick}
            style={{
              padding: "11px 20px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
              color: "#ffffff",
              fontSize: 13.5,
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
              transition: "transform 0.15s ease",
            }}
          >
            <Plus size={18} />
            <span>Create Banner</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Status Tab Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {statusOptions.map((opt) => {
          const isActive = filters.status === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onFilterChange({ status: opt.key })}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: isActive ? "1.5px solid #7C3AED" : "1.5px solid #E2E8F0",
                background: isActive ? "#F3E8FF" : "#ffffff",
                color: isActive ? "#7C3AED" : "#64748B",
                fontSize: 12.5,
                fontWeight: isActive ? 800 : 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.18s ease",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
