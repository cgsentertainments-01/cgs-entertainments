import React from "react";
import { Banner } from "@/types/banner";
import { BannerCard } from "./BannerCard";
import { ImageOff, Plus, Layers } from "lucide-react";

interface BannerGridProps {
  banners: Banner[];
  loading?: boolean;
  onEdit: (banner: Banner) => void;
  onDuplicate: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onPreview: (banner: Banner) => void;
  onToggleActive: (banner: Banner) => void;
  onReorder: (reorderedBanners: Banner[]) => void;
  onCreateClick: () => void;
}

export function BannerGrid({
  banners,
  loading = false,
  onEdit,
  onDuplicate,
  onDelete,
  onPreview,
  onToggleActive,
  onReorder,
  onCreateClick,
}: BannerGridProps) {
  // Move Up / Move Down reorder helper
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const [movedItem] = newBanners.splice(index, 1);
    newBanners.splice(targetIndex, 0, movedItem);

    // Update display_order property
    const updated = newBanners.map((b, i) => ({
      ...b,
      display_order: i + 1,
    }));

    onReorder(updated);
  };

  // HTML5 Drag & Drop reorder
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndexStr = e.dataTransfer.getData("text/plain");
    if (!dragIndexStr) return;

    const dragIndex = parseInt(dragIndexStr, 10);
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;

    const newBanners = [...banners];
    const [movedItem] = newBanners.splice(dragIndex, 1);
    newBanners.splice(dropIndex, 0, movedItem);

    const updated = newBanners.map((b, i) => ({
      ...b,
      display_order: i + 1,
    }));

    onReorder(updated);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
        className="responsive-banner-grid"
      >
        {[1, 2, 3, 4, 5, 6].map((key) => (
          <div
            key={key}
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "1.5px solid #E2E8F0",
              overflow: "hidden",
              height: 340,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, background: "#F1F5F9" }} className="animate-pulse" />
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ height: 18, width: "70%", background: "#E2E8F0", borderRadius: 6 }} className="animate-pulse" />
              <div style={{ height: 14, width: "90%", background: "#F1F5F9", borderRadius: 6 }} className="animate-pulse" />
              <div style={{ height: 32, width: "100%", background: "#F1F5F9", borderRadius: 8, marginTop: 8 }} className="animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: 24,
          border: "2px dashed #E2E8F0",
          padding: "60px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          margin: "12px 0",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#F3E8FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Layers size={32} color="#7C3AED" />
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
          No Banners Found
        </h3>
        <p style={{ fontSize: 14, color: "#64748B", maxWidth: 420, margin: "0 0 24px", lineHeight: 1.5 }}>
          Create your first promotional banner to start showcase campaigns, stage events, and highlight collections on your website.
        </p>

        <button
          type="button"
          onClick={onCreateClick}
          style={{
            padding: "12px 24px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
          }}
        >
          <Plus size={18} /> Create Banner
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
        className="responsive-banner-grid"
      >
        {banners.map((banner, index) => (
          <BannerCard
            key={banner.id}
            banner={banner}
            index={index}
            totalCount={banners.length}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onPreview={onPreview}
            onToggleActive={onToggleActive}
            onMoveUp={() => handleMove(index, "up")}
            onMoveDown={() => handleMove(index, "down")}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .responsive-banner-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .responsive-banner-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
