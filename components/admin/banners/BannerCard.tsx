import React from "react";
import { Banner } from "@/types/banner";
import { deriveBannerStatus, getStatusBadgeConfig } from "@/lib/utils/banner-status";
import {
  Edit3,
  Copy,
  Trash2,
  Eye,
  Calendar,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Tag,
} from "lucide-react";

interface BannerCardProps {
  banner: Banner;
  index: number;
  totalCount: number;
  onEdit: (banner: Banner) => void;
  onDuplicate: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onPreview: (banner: Banner) => void;
  onToggleActive: (banner: Banner) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
}

export function BannerCard({
  banner,
  index,
  totalCount,
  onEdit,
  onDuplicate,
  onDelete,
  onPreview,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}: BannerCardProps) {
  const derivedStatus = deriveBannerStatus(banner);
  const statusConfig = getStatusBadgeConfig(derivedStatus);

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Not set";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "Invalid date";
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Not set";
    }
  };

  const getPlacementLabel = (type: string) => {
    switch (type) {
      case "hero":
        return "Homepage Hero";
      case "event":
        return "Event Highlight";
      case "promotional":
        return "Promotional";
      case "announcement":
        return "Announcement";
      default:
        return type;
    }
  };

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver && onDragOver(e, index);
      }}
      onDrop={(e) => onDrop && onDrop(e, index)}
      style={{
        background: "#ffffff",
        borderRadius: 20,
        border: "1.5px solid #E2E8F0",
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, boxShadow 0.2s ease, border-color 0.2s ease",
        position: "relative",
      }}
      className="banner-card-hover"
    >
      {/* Top Banner Image Container (Main Visual Focus) */}
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          position: "relative",
          backgroundColor: "#0F172A",
          backgroundImage: `url(${banner.image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        {/* Dark Gradient Overlay for text readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15, 23, 42, 0.35) 0%, rgba(15, 23, 42, 0.88) 100%)",
          }}
        />

        {/* Top Badges Header */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}
        >
          {/* Drag Handle & Order Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                background: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(6px)",
                color: "#ffffff",
                padding: "4px 8px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "grab",
              }}
              title="Drag to reorder"
            >
              <GripVertical size={14} color="#CBD5E1" />
              <span>#{banner.display_order ?? index + 1}</span>
            </div>

            <span
              style={{
                background: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(6px)",
                color: "#CBD5E1",
                padding: "4px 10px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Tag size={12} color="#A78BFA" />
              {getPlacementLabel(banner.banner_type)}
            </span>
          </div>

          {/* Derived Status Badge */}
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: 11.5,
              fontWeight: 800,
              color: statusConfig.color,
              background: statusConfig.bg,
              border: `1px solid ${statusConfig.border}`,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: statusConfig.dotColor,
                display: "inline-block",
              }}
            />
            {statusConfig.label}
          </div>
        </div>

        {/* Floating Content Info over image */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 14,
            right: 14,
            zIndex: 10,
            color: "#ffffff",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: -0.3,
              lineHeight: 1.2,
              marginBottom: 4,
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {banner.title}
          </div>

          {(banner.subtitle || banner.description) && (
            <div
              style={{
                fontSize: 12,
                color: "#E2E8F0",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {banner.subtitle || banner.description}
            </div>
          )}
        </div>
      </div>

      {/* Details Meta Section */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Dates Meta */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11.5, color: "#64748B" }}>
          <div>
            <span style={{ fontWeight: 700, color: "#475569" }}>Start:</span>{" "}
            {banner.start_date ? formatDate(banner.start_date) : "Immediate"}
          </div>
          <div>
            <span style={{ fontWeight: 700, color: "#475569" }}>End:</span>{" "}
            {banner.end_date ? formatDate(banner.end_date) : "No expiry"}
          </div>
        </div>

        {/* CTA Link Preview if available */}
        {banner.link_url && (
          <div
            style={{
              fontSize: 11.5,
              color: "#7C3AED",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <ExternalLink size={12} />
            <span>
              {banner.button_text ? `${banner.button_text} → ` : ""}
              {banner.link_url}
            </span>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div
        style={{
          padding: "12px 16px",
          background: "#F8FAFC",
          borderTop: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
        }}
      >
        {/* Left: Reorder arrows for accessibility/mobile */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {onMoveUp && (
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              style={{
                padding: 5,
                borderRadius: 6,
                border: "1px solid #CBD5E1",
                background: index === 0 ? "#F1F5F9" : "#ffffff",
                cursor: index === 0 ? "not-allowed" : "pointer",
                color: index === 0 ? "#94A3B8" : "#334155",
              }}
              title="Move order up"
            >
              <ArrowUp size={13} />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              disabled={index === totalCount - 1}
              onClick={() => onMoveDown(index)}
              style={{
                padding: 5,
                borderRadius: 6,
                border: "1px solid #CBD5E1",
                background: index === totalCount - 1 ? "#F1F5F9" : "#ffffff",
                cursor: index === totalCount - 1 ? "not-allowed" : "pointer",
                color: index === totalCount - 1 ? "#94A3B8" : "#334155",
              }}
              title="Move order down"
            >
              <ArrowDown size={13} />
            </button>
          )}
        </div>

        {/* Right: Main Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {/* Preview Button */}
          <button
            type="button"
            onClick={() => onPreview(banner)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              background: "#ffffff",
              fontSize: 12,
              fontWeight: 700,
              color: "#334155",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            title="Preview customer layout"
          >
            <Eye size={13} /> Preview
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(banner)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #DDD6FE",
              background: "#F5F3FF",
              fontSize: 12,
              fontWeight: 700,
              color: "#6D28D9",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            title="Edit Banner"
          >
            <Edit3 size={13} /> Edit
          </button>

          {/* Duplicate Button */}
          <button
            type="button"
            onClick={() => onDuplicate(banner)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              background: "#ffffff",
              fontSize: 12,
              fontWeight: 700,
              color: "#475569",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            title="Duplicate Banner"
          >
            <Copy size={13} /> Duplicate
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(banner)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #FECACA",
              background: "#FEF2F2",
              fontSize: 12,
              fontWeight: 700,
              color: "#DC2626",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            title="Delete Banner"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
