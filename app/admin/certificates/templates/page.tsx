"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  Edit3,
  Copy,
  Eye,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Upload,
  X,
  FileText,
  Sliders,
  Image as ImageIcon,
  Check,
  Ban,
  ArrowLeft,
} from "lucide-react";

interface CertificateTemplate {
  id: string;
  name: string;
  certificate_type?: string;
  background_url: string;
  orientation?: "landscape" | "portrait";
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AdminCertificatesTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ready-Made Template Upload Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newCertType, setNewCertType] = useState("winner");
  const [newBgUrl, setNewBgUrl] = useState<string | null>(null);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Preview Modal state
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/certificates/templates");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTemplates(data.templates || []);
          return;
        }
      }
      setError("Failed to fetch certificate templates.");
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      setError("Network error fetching certificate templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Upload Ready-Made Background Image (.webp, .png, .jpg, .jpeg)
  const handleTemplateImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/webp", "image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setModalError("Invalid image format! Please upload a .webp, .png, or .jpg file.");
      return;
    }

    try {
      setUploadingBg(true);
      setModalError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "backgrounds");

      const res = await fetch("/api/certificates/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          setNewBgUrl(data.url);
          showToast("✓ Template image uploaded successfully!");
          return;
        }
        setModalError(data.error || "Failed to upload template image.");
      } else {
        const errJson = await res.json();
        setModalError(errJson.error || "Upload failed.");
      }
    } catch (err) {
      console.error("Error uploading template image:", err);
      setModalError("Network error uploading template image.");
    } finally {
      setUploadingBg(false);
    }
  };

  // Save Ready-Made Template
  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      setModalError("Please enter a Template Name.");
      return;
    }
    if (!newBgUrl) {
      setModalError("Please upload a Certificate Ready-Made Image file (.webp, .png, .jpg).");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: newTemplateName.trim(),
        certificate_type: newCertType,
        background_url: newBgUrl,
        orientation: "landscape",
        is_active: true,
      };

      const res = await fetch("/api/certificates/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showToast(`✓ Ready-made template "${newTemplateName}" saved!`);
          setShowUploadModal(false);
          setNewTemplateName("");
          setNewBgUrl(null);
          fetchTemplates();
          return;
        }
      }
      setModalError("Failed saving template.");
    } catch (err) {
      console.error("Error saving template:", err);
      setModalError("Network error saving template.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleActive = async (t: CertificateTemplate) => {
    try {
      const res = await fetch(`/api/certificates/templates/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !t.is_active }),
      });
      if (res.ok) {
        showToast(`✓ Template "${t.name}" status updated to ${!t.is_active ? "ACTIVE" : "INACTIVE"}`);
        fetchTemplates();
      }
    } catch (e) {
      console.error("Error toggling template status:", e);
    }
  };

  // Delete Template safely
  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) return;
    try {
      const res = await fetch(`/api/certificates/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`✓ Template "${name}" deleted`);
        fetchTemplates();
      }
    } catch (e) {
      console.error("Error deleting template:", e);
    }
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1440, margin: "0 auto", fontFamily: "inherit" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 99999,
            background: "#10B981",
            color: "#ffffff",
            padding: "14px 22px",
            borderRadius: 14,
            boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
            fontWeight: 800,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <CheckCircle2 size={20} color="#fff" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <Link href="/admin/certificates" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6D28D9", textDecoration: "none", fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
            <ArrowLeft size={16} /> Back to Certificates
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4, display: "flex", alignItems: "center", gap: 10 }}>
            <ImageIcon size={28} color="#6D28D9" /> Ready-Made Certificate Templates
          </h1>
          <p style={{ fontSize: 14.5, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Upload complete ready-made background images (.webp, .png, .jpg). The uploaded image is your certificate design.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={fetchTemplates}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              background: "#F3F4F6",
              color: "#374151",
              border: "1px solid #D1D5DB",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              setShowUploadModal(true);
              setNewTemplateName("");
              setNewBgUrl(null);
              setModalError(null);
            }}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(109,40,217,0.3)",
            }}
          >
            <Plus size={18} /> Upload Ready-Made Template
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: "#FEF2F2", color: "#991B1B", borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Templates Gallery Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "#6B7280", fontWeight: 700 }}>
          Loading ready-made templates...
        </div>
      ) : templates.length === 0 ? (
        <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "60px 24px", textAlign: "center", color: "#64748B" }}>
          <ImageIcon size={48} color="#94A3B8" style={{ margin: "0 auto 14px", opacity: 0.5 }} />
          <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>No Certificate Templates Uploaded Yet</h3>
          <p style={{ fontSize: 14, color: "#64748B", maxWidth: 440, margin: "0 auto 20px" }}>
            Upload ready-made background design images (.webp, .png, .jpg). Admin can then select a template and edit text over it.
          </p>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            style={{ padding: "10px 20px", borderRadius: 12, background: "#6D28D9", color: "#fff", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
          >
            + Upload First Template
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {templates.map((t) => (
            <div
              key={t.id}
              style={{
                background: "#ffffff",
                borderRadius: 20,
                border: t.is_active ? "2px solid #6D28D9" : "1.5px solid #E2E8F0",
                padding: 20,
                boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div>
                {/* Thumbnail Preview Card */}
                <div
                  style={{
                    height: 180,
                    borderRadius: 14,
                    background: t.background_url ? `url(${t.background_url}) center/cover no-repeat` : "#F8FAFC",
                    marginBottom: 16,
                    border: "1px solid #E2E8F0",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(15, 23, 42, 0.75)", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
                    {t.certificate_type || "Winner"}
                  </div>
                  <div style={{ position: "absolute", top: 10, right: 10, background: t.is_active ? "#10B981" : "#64748B", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                    {t.is_active ? "ACTIVE" : "INACTIVE"}
                  </div>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>{t.name}</h3>
                <div style={{ fontSize: 12.5, color: "#64748B", marginBottom: 14 }}>
                  Uploaded: {t.created_at ? new Date(t.created_at).toLocaleDateString("en-IN") : "Recent"}
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid #F1F5F9" }}>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(t)}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: "#F1F5F9", border: "1px solid #CBD5E1", fontSize: 12.5, fontWeight: 800, color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                >
                  <Eye size={14} color="#6D28D9" /> Preview
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleActive(t)}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: t.is_active ? "#FEF3C7" : "#ECFDF5", border: t.is_active ? "1px solid #FCD34D" : "1px solid #A7F3D0", fontSize: 12.5, fontWeight: 800, color: t.is_active ? "#B45309" : "#047857", cursor: "pointer" }}
                >
                  {t.is_active ? "Deactivate" : "Activate"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(t.id, t.name)}
                  style={{ padding: "8px 10px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", color: "#EF4444", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                  title="Delete Template"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── UPLOAD READY-MADE TEMPLATE MODAL ── */}
      {showUploadModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 520, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 19, fontWeight: 900, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Upload size={20} color="#6D28D9" /> Upload Ready-Made Template Image
              </h3>
              <button type="button" onClick={() => setShowUploadModal(false)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} color="#94A3B8" /></button>
            </div>

            {modalError && (
              <div style={{ padding: 12, background: "#FEF2F2", color: "#991B1B", borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 700 }}>
                ⚠️ {modalError}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                Template Name:
              </label>
              <input
                type="text"
                placeholder="e.g. Gold Winner Certificate"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, fontWeight: 700 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                Certificate Type:
              </label>
              <select
                value={newCertType}
                onChange={(e) => setNewCertType(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, fontWeight: 700, background: "#fff" }}
              >
                <option value="winner">🏆 Winner</option>
                <option value="runner_up">🥈 Runner-up</option>
                <option value="finalist">🥉 Finalist</option>
                <option value="special_mention">⭐ Special Mention</option>
                <option value="participation">🎓 Participation</option>
                <option value="achievement">🌟 Achievement</option>
                <option value="custom">🎨 Custom</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                Upload Background Image (.webp, .png, .jpg):
              </label>

              {newBgUrl ? (
                <div style={{ position: "relative", height: 160, borderRadius: 12, overflow: "hidden", border: "2px solid #6D28D9" }}>
                  <img src={newBgUrl} alt="Background preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => setNewBgUrl(null)}
                    style={{ position: "absolute", top: 8, right: 8, background: "rgba(239, 68, 68, 0.9)", color: "#fff", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 140, border: "2px dashed #CBD5E1", borderRadius: 12, background: "#F8FAFC", cursor: "pointer" }}>
                  <Upload size={28} color="#6D28D9" style={{ marginBottom: 8 }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                    {uploadingBg ? "Uploading..." : "Click to Upload Certificate Image"}
                  </span>
                  <span style={{ fontSize: 11.5, color: "#64748B", marginTop: 4 }}>Supports .WEBP, .PNG, .JPG, .JPEG</span>
                  <input type="file" accept="image/webp,image/png,image/jpeg,image/jpg" onChange={handleTemplateImageUpload} style={{ display: "none" }} disabled={uploadingBg} />
                </label>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button type="button" onClick={() => setShowUploadModal(false)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 700, color: "#334155", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={isSaving || !newBgUrl}
                style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)", fontWeight: 900, color: "#fff", cursor: isSaving || !newBgUrl ? "not-allowed" : "pointer" }}
              >
                {isSaving ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW TEMPLATE MODAL ── */}
      {previewTemplate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 24, width: "100%", maxWidth: 960, padding: 24, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>{previewTemplate.name}</h3>
                <div style={{ fontSize: 12.5, color: "#64748B" }}>Type: <strong>{previewTemplate.certificate_type || "Winner"}</strong></div>
              </div>
              <button type="button" onClick={() => setPreviewTemplate(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={22} color="#94A3B8" /></button>
            </div>

            <div style={{ width: "100%", height: 500, borderRadius: 16, overflow: "hidden", border: "1px solid #E2E8F0", background: `url(${previewTemplate.background_url}) center/contain no-repeat #F8FAFC` }} />
          </div>
        </div>
      )}
    </div>
  );
}
