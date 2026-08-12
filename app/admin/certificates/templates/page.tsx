"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

interface CertificateTemplate {
  id: string;
  name: string;
  background_url: string;
  orientation?: "landscape" | "portrait";
  width?: number;
  height?: number;
  configuration?: any;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AdminCertificatesTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Template Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newBgUrl, setNewBgUrl] = useState<string | null>(null);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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

  // Upload background file in modal
  const handleModalBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
          return;
        }
        setModalError(data.error || "Failed to upload background image.");
      } else {
        const errJson = await res.json();
        setModalError(errJson.error || "Upload failed.");
      }
    } catch (err) {
      console.error("Error uploading background:", err);
      setModalError("Network error uploading background image.");
    } finally {
      setUploadingBg(false);
    }
  };

  // Create Template and launch editor
  const handleProceedToEditor = async () => {
    if (!newTemplateName.trim()) {
      setModalError("Please enter a Template Name.");
      return;
    }
    if (!newBgUrl) {
      setModalError("Please upload a Certificate Background image.");
      return;
    }

    try {
      const payload = {
        name: newTemplateName.trim(),
        background_url: newBgUrl,
        orientation: "landscape",
        width: 1100,
        height: 780,
        configuration: {
          elements: [
            {
              id: "elem-title",
              type: "static_text",
              text: "CERTIFICATE OF ACHIEVEMENT",
              x: 200,
              y: 120,
              width: 700,
              height: 50,
              fontSize: 32,
              fontFamily: "Cinzel, serif",
              fontWeight: 800,
              textAlign: "center",
              color: "#D97706",
              rotation: 0,
              opacity: 100,
              zIndex: 1,
            },
            {
              id: "elem-name",
              type: "dynamic_text",
              fieldKey: "participant_name",
              text: "{{participant_name}}",
              x: 200,
              y: 260,
              width: 700,
              height: 60,
              fontSize: 42,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              textAlign: "center",
              color: "#0F172A",
              rotation: 0,
              opacity: 100,
              zIndex: 2,
            },
            {
              id: "elem-event",
              type: "dynamic_text",
              fieldKey: "event_name",
              text: "{{event_name}}",
              x: 200,
              y: 360,
              width: 700,
              height: 40,
              fontSize: 24,
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              textAlign: "center",
              color: "#6D28D9",
              rotation: 0,
              opacity: 100,
              zIndex: 3,
            },
            {
              id: "elem-qr",
              type: "qr_code",
              fieldKey: "qr_code",
              x: 80,
              y: 580,
              width: 110,
              height: 110,
              rotation: 0,
              opacity: 100,
              zIndex: 4,
            },
          ],
        },
        is_active: false,
      };

      const res = await fetch("/api/certificates/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.template) {
          setShowCreateModal(false);
          router.push(`/admin/certificates/templates/editor?id=${data.template.id}`);
          return;
        }
      }
      setModalError("Failed launching template editor.");
    } catch (err) {
      console.error("Error launching editor:", err);
      setModalError("Failed launching template editor.");
    }
  };

  // Set Active Template
  const handleSetActive = async (t: CertificateTemplate) => {
    try {
      const res = await fetch(`/api/certificates/templates/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      });
      if (res.ok) {
        showToast(`✓ Template "${t.name}" set as Active default!`);
        fetchTemplates();
      }
    } catch (e) {
      console.error("Error setting active template:", e);
    }
  };

  // Delete Template
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

  // Duplicate Template
  const handleDuplicateTemplate = async (t: CertificateTemplate) => {
    try {
      const payload = {
        name: `${t.name} (Copy)`,
        background_url: t.background_url,
        orientation: t.orientation || "landscape",
        width: t.width || 1100,
        height: t.height || 780,
        configuration: t.configuration || { elements: [] },
        is_active: false,
      };
      const res = await fetch("/api/certificates/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(`✓ Template duplicated: ${t.name} (Copy)`);
        fetchTemplates();
      }
    } catch (e) {
      console.error("Error duplicating template:", e);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", display: "flex", alignItems: "center", gap: 10, margin: "0 0 4px" }}>
            <Award size={28} color="#6D28D9" /> Certificate Templates Registry
          </h1>
          <p style={{ fontSize: 14.5, color: "#6B7280", margin: 0 }}>
            Upload certificate background designs and visually configure dynamic element placements.
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
              borderRadius: 10,
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
              setNewTemplateName("");
              setNewBgUrl(null);
              setModalError(null);
              setShowCreateModal(true);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 22px",
              background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(109, 40, 217, 0.25)",
            }}
          >
            <Plus size={18} /> Create Template
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: "#FEF2F2", color: "#991B1B", borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "#64748B", fontWeight: 700 }}>
          Loading certificate templates registry...
        </div>
      ) : templates.length === 0 ? (
        <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: 20, padding: 60, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          <Award size={48} color="#CBD5E1" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>No Certificate Templates Created</h3>
          <p style={{ fontSize: 14, color: "#64748B", maxWidth: 480, margin: "0 auto 20px" }}>
            Upload your official event certificate design image and visually place participant names, dates, results, and QR codes.
          </p>
          <button
            type="button"
            onClick={() => {
              setNewTemplateName("");
              setNewBgUrl(null);
              setModalError(null);
              setShowCreateModal(true);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              background: "#6D28D9",
              color: "#fff",
              borderRadius: 12,
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
              border: "none",
              boxShadow: "0 4px 14px rgba(109,40,217,0.3)",
            }}
          >
            <Plus size={18} /> Create Your First Template
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
          {templates.map((t) => {
            const isLandscape = (t.orientation || "landscape") === "landscape";
            const dateStr = t.created_at ? new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent";
            const elemCount = t.configuration?.elements?.length || 0;

            return (
              <div
                key={t.id}
                style={{
                  background: "#ffffff",
                  border: t.is_active ? "2px solid #6D28D9" : "1.5px solid #E2E8F0",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: t.is_active ? "0 10px 28px rgba(109,40,217,0.15)" : "0 2px 10px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* Thumbnail Header */}
                <div
                  style={{
                    height: 200,
                    background: t.background_url ? `url(${t.background_url}) center/cover no-repeat #F8FAFC` : "#F8FAFC",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  {!t.background_url && (
                    <div style={{ color: "#94A3B8", textAlign: "center" }}>
                      <ImageIcon size={32} style={{ margin: "0 auto 4px", opacity: 0.5 }} />
                      <div style={{ fontSize: 12, fontWeight: 700 }}>No Background Image</div>
                    </div>
                  )}

                  {/* Status Badges */}
                  <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8 }}>
                    {t.is_active ? (
                      <span style={{ background: "#10B981", color: "#fff", fontSize: 11, fontWeight: 900, padding: "4px 10px", borderRadius: 8, boxShadow: "0 2px 6px rgba(16,185,129,0.4)" }}>
                        ✓ Active Default
                      </span>
                    ) : (
                      <span style={{ background: "rgba(15,23,42,0.75)", backdropFilter: "blur(4px)", color: "#94A3B8", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8 }}>
                        Draft Template
                      </span>
                    )}
                  </div>

                  <div style={{ position: "absolute", top: 12, right: 12 }}>
                    <span style={{ background: "rgba(255,255,255,0.9)", color: "#334155", fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 6 }}>
                      {isLandscape ? "Landscape" : "Portrait"}
                    </span>
                  </div>
                </div>

                {/* Card Info Body */}
                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
                      {t.name}
                    </h3>
                    <div style={{ fontSize: 13, color: "#64748B", display: "flex", gap: 12, alignItems: "center" }}>
                      <span>{elemCount} configured elements</span>
                      <span>•</span>
                      <span>Created {dateStr}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link
                        href={`/admin/certificates/templates/editor?id=${t.id}`}
                        style={{
                          flex: 1,
                          padding: "9px 14px",
                          background: "#6D28D9",
                          color: "#fff",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          textDecoration: "none",
                          textAlign: "center",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          boxShadow: "0 2px 8px rgba(109,40,217,0.25)",
                        }}
                      >
                        <Edit3 size={14} /> Open Editor
                      </Link>

                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(t)}
                        style={{
                          padding: "9px 12px",
                          background: "#F3F4F6",
                          color: "#1E293B",
                          border: "1px solid #CBD5E1",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                        title="Preview template"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateTemplate(t)}
                        style={{
                          padding: "9px 12px",
                          background: "#F3F4F6",
                          color: "#1E293B",
                          border: "1px solid #CBD5E1",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                        title="Duplicate template"
                      >
                        <Copy size={15} />
                      </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #F1F5F9" }}>
                      {!t.is_active && (
                        <button
                          type="button"
                          onClick={() => handleSetActive(t)}
                          style={{ background: "none", border: "none", color: "#10B981", fontSize: 12.5, fontWeight: 800, cursor: "pointer", padding: 0 }}
                        >
                          Set as Active Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(t.id, t.name)}
                        style={{ background: "none", border: "none", color: "#EF4444", fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: 0, marginLeft: "auto" }}
                      >
                        Delete Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE TEMPLATE MODAL ── */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 24, width: "100%", maxWidth: 520, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={24} color="#6D28D9" />
                </div>
                <div>
                  <h3 style={{ fontSize: 19, fontWeight: 900, color: "#0F172A", margin: 0 }}>Create Certificate Template</h3>
                  <div style={{ fontSize: 13, color: "#64748B" }}>Upload background design and name template</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} color="#94A3B8" /></button>
            </div>

            {modalError && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 12, padding: "10px 14px", color: "#991B1B", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                {modalError}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                Template Name:
              </label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g. National Championship Certificate 2026"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, outline: "none" }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                Upload Certificate Design Background (PNG / JPG / WEBP):
              </label>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px 16px",
                  borderRadius: 16,
                  border: "2px dashed #CBD5E1",
                  background: "#F8FAFC",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <Upload size={28} color="#6D28D9" style={{ marginBottom: 8 }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>
                  {uploadingBg ? "Uploading Background..." : newBgUrl ? "✓ Background Uploaded (Click to Replace)" : "Choose Certificate Image File"}
                </span>
                <span style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>High-resolution Landscape design image</span>
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleModalBgUpload} style={{ display: "none" }} />
              </label>

              {newBgUrl && (
                <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden", border: "1px solid #E2E8F0", height: 120, background: `url(${newBgUrl}) center/contain no-repeat #F8FAFC` }} />
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 700, color: "#334155", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToEditor}
                style={{
                  padding: "10px 22px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                  fontWeight: 900,
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(109, 40, 217, 0.3)",
                }}
              >
                Launch Visual Editor →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {previewTemplate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 24, width: "100%", maxWidth: 900, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: "1px solid #E2E8F0" }}>
            <div style={{ padding: "16px 24px", background: "#0F172A", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 900 }}>Template Preview: {previewTemplate.name}</div>
              <button onClick={() => setPreviewTemplate(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24, background: "#020617", display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  position: "relative",
                  width: 800,
                  height: 560,
                  background: previewTemplate.background_url ? `url(${previewTemplate.background_url}) center/cover no-repeat #ffffff` : "#ffffff",
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              >
                {(previewTemplate.configuration?.elements || []).map((elem: any) => {
                  let textVal = elem.text || "";
                  if (elem.type === "dynamic_text" && elem.fieldKey) {
                    const sampleMap: Record<string, string> = {
                      participant_name: "Kalyani Mukkollu",
                      event_name: "CGS Dance Fest 2026",
                      event_date: "15 August 2026",
                      result: "Winner 🏆",
                      certificate_id: "CGS-DF26-0001",
                      issue_date: "20 August 2026",
                      organizer_name: "CGS Entertainments",
                    };
                    textVal = sampleMap[elem.fieldKey] || elem.fieldKey;
                  }

                  const scaleFactor = 800 / (previewTemplate.width || 1100);

                  return (
                    <div
                      key={elem.id}
                      style={{
                        position: "absolute",
                        left: elem.x * scaleFactor,
                        top: elem.y * scaleFactor,
                        width: elem.width * scaleFactor,
                        height: elem.height * scaleFactor,
                        zIndex: elem.zIndex,
                        transform: `rotate(${elem.rotation || 0}deg)`,
                        opacity: (elem.opacity ?? 100) / 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: elem.textAlign === "center" ? "center" : elem.textAlign === "right" ? "flex-end" : "flex-start",
                      }}
                    >
                      {(elem.type === "static_text" || elem.type === "dynamic_text") && (
                        <span
                          style={{
                            fontFamily: elem.fontFamily || "sans-serif",
                            fontSize: `${(elem.fontSize || 20) * scaleFactor}px`,
                            fontWeight: elem.fontWeight || 600,
                            fontStyle: elem.fontStyle || "normal",
                            color: elem.color || "#0F172A",
                            textAlign: elem.textAlign || "left",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {textVal}
                        </span>
                      )}
                      {elem.type === "logo" && elem.src && <img src={elem.src} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: "14px 24px", background: "#F8FAFC", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setPreviewTemplate(null)} style={{ padding: "8px 20px", background: "#0F172A", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
