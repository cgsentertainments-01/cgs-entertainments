"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  active: boolean;
  order: number;
}

export default function AdminBannerPage() {
  const [banners, setBanners] = useState<BannerItem[]>([
    {
      id: "BAN-1",
      title: "DANCE TO EXPRESS, COMPETE TO IMPRESS!",
      subtitle: "India's Biggest Dance Competitions Managed with Passion by CGS Entertainments.",
      imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80",
      active: true,
      order: 1,
    },
    {
      id: "BAN-2",
      title: "SOUTH INDIA MODELING & FASHION SHOW 2026",
      subtitle: "Register participants, review judges scores & issue verified certificates.",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
      active: true,
      order: 2,
    },
    {
      id: "BAN-3",
      title: "ACTING & THEATRE EXCELLENCE AWARDS 2026",
      subtitle: "Unleash your acting potential on India's premier national stage.",
      imageUrl: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80",
      active: false,
      order: 3,
    },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const toggleActive = (id: string) => {
    setBanners(
      banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  const deleteBanner = (id: string) => {
    if (confirm("Are you sure you want to delete this hero banner?")) {
      setBanners(banners.filter((b) => b.id !== id));
    }
  };

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newBanner: BannerItem = {
      id: `BAN-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      subtitle: newSubtitle || "Managed by CGS Entertainments",
      imageUrl:
        newImageUrl ||
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      active: true,
      order: banners.length + 1,
    };

    setBanners([...banners, newBanner]);
    setNewTitle("");
    setNewSubtitle("");
    setNewImageUrl("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
          Hero Banner Management
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Manage home page hero sliders, promotions, and stage show feature banners.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        {/* Banner List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
            Active &amp; Expired Banners ({banners.length})
          </h2>

          {banners.map((b, idx) => (
            <div
              key={b.id}
              style={{
                background: "#ffffff",
                borderRadius: 20,
                border: "1.5px solid #E2E8F0",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  height: 140,
                  position: "relative",
                  backgroundImage: `url(${b.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(9,3,20,0.2) 0%, rgba(9,3,20,0.85) 100%)",
                  }}
                />

                <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, display: "flex", gap: 8 }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 800,
                      color: b.active ? "#15803D" : "#991B1B",
                      background: b.active ? "#DCFCE7" : "#FEF2F2",
                    }}
                  >
                    {b.active ? "● Live on Website" : "○ Inactive"}
                  </span>
                </div>

                <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, zIndex: 10, color: "#fff" }}>
                  <div style={{ fontSize: 15, fontWeight: 900, textTransform: "uppercase" }}>{b.title}</div>
                  <div style={{ fontSize: 12, color: "#CBD5E1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {b.subtitle}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#FAFAFA",
                  borderTop: "1px solid #F1F5F9",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>
                  Sort Position: #{b.order}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => toggleActive(b.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #E2E8F0",
                      background: "#ffffff",
                      fontSize: 12,
                      fontWeight: 700,
                      color: b.active ? "#D97706" : "#16A34A",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {b.active ? <EyeOff size={14} /> : <Eye size={14} />}
                    {b.active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteBanner(b.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #FECACA",
                      background: "#FEF2F2",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#DC2626",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upload New Banner Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            border: "1.5px solid #E2E8F0",
            padding: "24px",
            height: "fit-content",
            boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 16px" }}>
            Add New Hero Banner
          </h2>

          <form onSubmit={handleAddBanner} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                Banner Headline Title *
              </label>
              <input
                type="text"
                placeholder="e.g. NATIONAL MUSIC CHAMPIONSHIP 2026"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #E2E8F0",
                  fontSize: 13.5,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                Subtitle Description
              </label>
              <input
                type="text"
                placeholder="e.g. India's biggest stage for aspiring singers"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #E2E8F0",
                  fontSize: 13.5,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                Banner Image URL (Unsplash or Supabase Storage)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #E2E8F0",
                  fontSize: 13.5,
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                border: "2px dashed #CBD5E1",
                borderRadius: 16,
                padding: "24px",
                textAlign: "center",
                background: "#F8FAFC",
                cursor: "pointer",
              }}
            >
              <UploadCloud size={32} color="#7C3AED" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 800, color: "#334155" }}>
                Click or Drag &amp; Drop to Upload Banner File
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                Supports PNG, JPG, WEBP up to 5MB (16:9 ratio recommended)
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: "13px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
              }}
            >
              <Plus size={18} /> Publish Banner
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
