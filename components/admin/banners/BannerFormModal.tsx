import React, { useState, useEffect } from "react";
import { Banner, BannerFormData, BannerPlacement } from "@/types/banner";
import { uploadBannerImage } from "@/services/banner.service";
import { deriveBannerStatus, getStatusBadgeConfig } from "@/lib/utils/banner-status";
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Link as LinkIcon,
  ExternalLink,
  Eye,
  Loader2,
} from "lucide-react";

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: BannerFormData) => Promise<void>;
  initialBanner?: Banner | null;
  maxDisplayOrder?: number;
}

export function BannerFormModal({
  isOpen,
  onClose,
  onSave,
  initialBanner,
  maxDisplayOrder = 1,
}: BannerFormModalProps) {
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    mobile_image_url: "",
    link_url: "",
    button_text: "",
    banner_type: "hero",
    display_order: maxDisplayOrder,
    is_active: true,
    start_date: "",
    end_date: "",
    target_blank: false,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (initialBanner) {
      // Format start/end date for datetime-local input YYYY-MM-DDTHH:mm
      const formatDateForInput = (iso?: string | null) => {
        if (!iso) return "";
        try {
          const d = new Date(iso);
          if (isNaN(d.getTime())) return "";
          return d.toISOString().slice(0, 16);
        } catch {
          return "";
        }
      };

      setFormData({
        id: initialBanner.id,
        title: initialBanner.title || "",
        subtitle: initialBanner.subtitle || "",
        description: initialBanner.description || "",
        image_url: initialBanner.image_url || "",
        mobile_image_url: initialBanner.mobile_image_url || "",
        link_url: initialBanner.link_url || "",
        button_text: initialBanner.button_text || "",
        banner_type: initialBanner.banner_type || "hero",
        display_order: initialBanner.display_order ?? 1,
        is_active: initialBanner.is_active ?? true,
        start_date: formatDateForInput(initialBanner.start_date),
        end_date: formatDateForInput(initialBanner.end_date),
        target_blank: initialBanner.target_blank ?? false,
      });
    } else {
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        image_url: "",
        mobile_image_url: "",
        link_url: "",
        button_text: "Explore Events",
        banner_type: "hero",
        display_order: maxDisplayOrder,
        is_active: true,
        start_date: "",
        end_date: "",
        target_blank: false,
      });
    }
    setErrors({});
  }, [initialBanner, isOpen, maxDisplayOrder]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) {
      errs.title = "Banner title is required.";
    }

    if (!formData.image_url.trim()) {
      errs.image_url = "Banner image is required. Please upload or enter an image URL.";
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        errs.end_date = "End date & time cannot be before start date.";
      }
    }

    if (formData.link_url.trim()) {
      try {
        // Validate URL format if absolute
        if (formData.link_url.startsWith("http://") || formData.link_url.startsWith("https://")) {
          new URL(formData.link_url);
        }
      } catch {
        errs.link_url = "Please enter a valid URL (e.g. https://... or /events)";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setErrors((prev) => ({ ...prev, image_url: "" }));

    try {
      const uploadedUrl = await uploadBannerImage(file);
      setFormData((prev) => ({ ...prev, image_url: uploadedUrl }));
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, image_url: err.message || "Failed to upload file." }));
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, form: err.message || "An error occurred while saving." }));
    } finally {
      setSaving(false);
    }
  };

  // Derive status preview for schedule dates
  const currentDerivedStatus = deriveBannerStatus({
    title: formData.title,
    image_url: formData.image_url,
    is_active: formData.is_active,
    start_date: formData.start_date || null,
    end_date: formData.end_date || null,
  });

  const statusBadge = getStatusBadgeConfig(currentDerivedStatus);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 680,
          height: "100vh",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.2)",
          animation: "slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          overflowY: "auto",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
              {initialBanner ? "Edit Banner" : "Create New Banner"}
            </h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
              Configure promotional images, links, schedules & placement.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#F1F5F9",
              border: "none",
              padding: 8,
              borderRadius: 10,
              color: "#64748B",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 28 }}>
          {errors.form && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#DC2626",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={18} /> {errors.form}
            </div>
          )}

          {/* SECTION A — BASIC INFORMATION */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: "#7C3AED",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                borderBottom: "1px solid #F1F5F9",
                paddingBottom: 6,
              }}
            >
              Section A — Basic Information
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6, display: "block" }}>
                Banner Title *
              </label>
              <input
                type="text"
                placeholder="e.g. DANCE COMPETITION 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: errors.title ? "1.5px solid #EF4444" : "1.5px solid #CBD5E1",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              {errors.title && (
                <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4, fontWeight: 600 }}>
                  {errors.title}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6, display: "block" }}>
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. CGS ENTERTAINMENTS"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #CBD5E1",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6, display: "block" }}>
                  CTA Button Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Register Now"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #CBD5E1",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6, display: "block" }}>
                Description / Tagline
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Show Your Talent. Shine On Stage. Be A Star!"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #CBD5E1",
                  fontSize: 13.5,
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6, display: "block" }}>
                CTA Target Link
              </label>
              <div style={{ position: "relative" }}>
                <LinkIcon
                  size={16}
                  color="#94A3B8"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="e.g. /events or https://..."
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "11px 14px 11px 36px",
                    borderRadius: 12,
                    border: errors.link_url ? "1.5px solid #EF4444" : "1.5px solid #CBD5E1",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>
              {errors.link_url && (
                <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4, fontWeight: 600 }}>
                  {errors.link_url}
                </div>
              )}
            </div>
          </div>

          {/* SECTION B — BANNER IMAGE */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: "#7C3AED",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                borderBottom: "1px solid #F1F5F9",
                paddingBottom: 6,
              }}
            >
              Section B — Banner Image Upload
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? "2px dashed #7C3AED" : "2px dashed #CBD5E1",
                borderRadius: 16,
                padding: "24px",
                textAlign: "center",
                background: dragActive ? "#F3E8FF" : "#F8FAFC",
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              {uploading ? (
                <div style={{ padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <Loader2 size={32} color="#7C3AED" className="animate-spin" />
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED" }}>
                    Uploading Banner to Supabase Storage...
                  </div>
                </div>
              ) : formData.image_url ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 360,
                      aspectRatio: "16 / 9",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid #E2E8F0",
                      backgroundImage: `url(${formData.image_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <label
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        background: "#ffffff",
                        border: "1px solid #CBD5E1",
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#334155",
                        cursor: "pointer",
                      }}
                    >
                      Replace Image
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        style={{ display: "none" }}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#DC2626",
                        cursor: "pointer",
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <label style={{ cursor: "pointer", display: "block" }}>
                  <UploadCloud size={36} color="#7C3AED" style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#1E293B" }}>
                    Drag &amp; Drop or Click to Upload Banner Image
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                    Supports JPG, JPEG, PNG, WEBP (Max size 5MB • Recommended ratio 16:9)
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    style={{ display: "none" }}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                </label>
              )}
            </div>
            {errors.image_url && (
              <div style={{ fontSize: 12, color: "#EF4444", fontWeight: 600 }}>{errors.image_url}</div>
            )}

            {/* Direct Image URL input fallback */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 4, display: "block" }}>
                Or enter image URL directly:
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid #CBD5E1",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* SECTION C — DISPLAY SETTINGS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: "#7C3AED",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                borderBottom: "1px solid #F1F5F9",
                paddingBottom: 6,
              }}
            >
              Section C — Display Settings
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6, display: "block" }}>
                  Placement Position
                </label>
                <select
                  value={formData.banner_type}
                  onChange={(e) => setFormData({ ...formData, banner_type: e.target.value as BannerPlacement })}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #CBD5E1",
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "#1E293B",
                    outline: "none",
                  }}
                >
                  <option value="hero">Homepage Hero Slider</option>
                  <option value="event">Event Highlight</option>
                  <option value="promotional">Promotional Banner</option>
                  <option value="announcement">Announcement Popup</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6, display: "block" }}>
                  Sort Order Number
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #CBD5E1",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                fontWeight: 700,
                color: "#334155",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.target_blank}
                onChange={(e) => setFormData({ ...formData, target_blank: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: "#7C3AED" }}
              />
              <span>Open CTA link in new browser tab</span>
            </label>
          </div>

          {/* SECTION D — SCHEDULING */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #F1F5F9",
                paddingBottom: 6,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#7C3AED",
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Section D — Scheduling &amp; Automated Status
              </div>

              {/* Calculated Status Badge Preview */}
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 800,
                  color: statusBadge.color,
                  background: statusBadge.bg,
                  border: `1px solid ${statusBadge.border}`,
                }}
              >
                Calculated Status: {statusBadge.label}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6, display: "block" }}>
                  Start Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #CBD5E1",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6, display: "block" }}>
                  End Date &amp; Time (Expiry)
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: errors.end_date ? "1.5px solid #EF4444" : "1.5px solid #CBD5E1",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
                {errors.end_date && (
                  <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4, fontWeight: 600 }}>
                    {errors.end_date}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION E — VISIBILITY & PUBLISHING */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: "#7C3AED",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                borderBottom: "1px solid #F1F5F9",
                paddingBottom: 6,
              }}
            >
              Section E — Visibility &amp; Status
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: 16,
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>
                  Active Status
                </div>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  When enabled, banner will display publicly during valid schedule dates.
                </div>
              </div>

              <label
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: 50,
                  height: 26,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: formData.is_active ? "#16A34A" : "#CBD5E1",
                    borderRadius: 34,
                    transition: "0.2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      content: '""',
                      height: 20,
                      width: 20,
                      left: formData.is_active ? 26 : 3,
                      bottom: 3,
                      backgroundColor: "white",
                      borderRadius: "50%",
                      transition: "0.2s",
                    }}
                  />
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 20,
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 20px",
                borderRadius: 12,
                border: "1.5px solid #CBD5E1",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                padding: "12px 26px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 800,
                border: "none",
                cursor: saving || uploading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> {initialBanner ? "Update Banner" : "Save Banner"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
