"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Upload,
  Type,
  User,
  Calendar,
  Trophy,
  Award,
  QrCode,
  Image as ImageIcon,
  ChevronLeft,
  Save,
  Eye,
  Edit3,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  CheckCircle2,
  AlertCircle,
  Plus,
  RotateCw,
  Sliders,
} from "lucide-react";

interface CanvasElement {
  id: string;
  type: "static_text" | "dynamic_text" | "logo" | "qr_code";
  fieldKey?: string;
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  color?: string;
  letterSpacing?: number;
  lineHeight?: number;
  rotation?: number;
  opacity?: number;
  zIndex: number;
  src?: string;
}

const DYNAMIC_FIELDS_LIST = [
  { key: "participant_name", label: "Participant Name", icon: User, sample: "Kalyani Mukkollu" },
  { key: "event_name", label: "Event Name", icon: Award, sample: "CGS Dance Fest 2026" },
  { key: "event_date", label: "Event Date", icon: Calendar, sample: "15 August 2026" },
  { key: "result", label: "Contest Result", icon: Trophy, sample: "Winner 🏆" },
  { key: "certificate_id", label: "Certificate ID", icon: Sliders, sample: "CGS-DF26-0001" },
  { key: "issue_date", label: "Issue Date", icon: Calendar, sample: "20 August 2026" },
  { key: "organizer_name", label: "Organizer Name", icon: Award, sample: "CGS Entertainments" },
];

const FONT_FAMILIES = [
  { name: "Cinzel (Classic Serif)", value: "Cinzel, serif" },
  { name: "Playfair Display (Elegant Serif)", value: "'Playfair Display', serif" },
  { name: "Montserrat (Modern Clean)", value: "Montserrat, sans-serif" },
  { name: "Inter (Clean Sans)", value: "Inter, sans-serif" },
  { name: "Roboto (Standard)", value: "Roboto, sans-serif" },
  { name: "Great Vibes (Script)", value: "'Great Vibes', cursive" },
  { name: "Alex Brush (Calligraphy)", value: "'Alex Brush', cursive" },
];

function CertificateEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdParam = searchParams ? searchParams.get("id") : null;

  // Template Meta State
  const [templateId, setTemplateId] = useState<string | null>(templateIdParam);
  const [templateName, setTemplateName] = useState<string>("National Excellence Certificate");
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [canvasWidth, setCanvasWidth] = useState<number>(1100);
  const [canvasHeight, setCanvasHeight] = useState<number>(780);

  // Canvas Elements & Undo/Redo State
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Editor View Controls
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [zoom, setZoom] = useState<number>(100);
  const [uploadingBg, setUploadingBg] = useState<boolean>(false);
  const [savingTemplate, setSavingTemplate] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dragging / Resizing State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const pushState = (newElements: CanvasElement[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newElements]);
    setHistoryIndex(updatedHistory.length);
    setElements(newElements);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  useEffect(() => {
    if (templateIdParam) {
      const loadTemplate = async () => {
        try {
          const res = await fetch(`/api/certificates/templates/${templateIdParam}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.template) {
              const t = data.template;
              setTemplateId(t.id);
              setTemplateName(t.name);
              setBackgroundUrl(t.background_url);
              setOrientation(t.orientation || "landscape");
              setCanvasWidth(t.width || 1100);
              setCanvasHeight(t.height || 780);
              const loadedElems = t.configuration?.elements || [];
              setElements(loadedElems);
              setHistory([loadedElems]);
              setHistoryIndex(0);
            }
          }
        } catch (e) {
          console.error("Error loading template for edit:", e);
        }
      };
      loadTemplate();
    } else {
      const initElems: CanvasElement[] = [
        {
          id: "elem-1",
          type: "static_text",
          text: "CERTIFICATE OF EXCELLENCE",
          x: 250,
          y: 120,
          width: 600,
          height: 50,
          fontSize: 32,
          fontFamily: "Cinzel, serif",
          fontWeight: 800,
          textAlign: "center",
          color: "#D97706",
          letterSpacing: 2,
          rotation: 0,
          opacity: 100,
          zIndex: 1,
        },
        {
          id: "elem-2",
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
          id: "elem-3",
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
          id: "elem-4",
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
      ];
      setElements(initElems);
      setHistory([initElems]);
      setHistoryIndex(0);
    }
  }, [templateIdParam]);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBg(true);
      setErrorMsg(null);

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
          setBackgroundUrl(data.url);
          showToast("✓ Certificate background updated successfully!");
        } else {
          setErrorMsg(data.error || "Failed uploading image");
        }
      }
    } catch (err) {
      console.error("Background upload error:", err);
      setErrorMsg("Network error uploading background image.");
    } finally {
      setUploadingBg(false);
    }
  };

  const addStaticText = () => {
    const newElem: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "static_text",
      text: "Sample Static Text",
      x: 350,
      y: 440,
      width: 400,
      height: 40,
      fontSize: 20,
      fontFamily: "Inter, sans-serif",
      fontWeight: 600,
      textAlign: "center",
      color: "#334155",
      rotation: 0,
      opacity: 100,
      zIndex: elements.length + 1,
    };
    pushState([...elements, newElem]);
    setSelectedId(newElem.id);
  };

  const addDynamicField = (fieldKey: string, defaultLabel: string) => {
    const newElem: CanvasElement = {
      id: `field-${Date.now()}`,
      type: "dynamic_text",
      fieldKey: fieldKey,
      text: `{{${fieldKey}}}`,
      x: 300,
      y: 460,
      width: 500,
      height: 44,
      fontSize: 22,
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
      textAlign: "center",
      color: "#1E1B4B",
      rotation: 0,
      opacity: 100,
      zIndex: elements.length + 1,
    };
    pushState([...elements, newElem]);
    setSelectedId(newElem.id);
  };

  const addQRCode = () => {
    const newElem: CanvasElement = {
      id: `qr-${Date.now()}`,
      type: "qr_code",
      fieldKey: "qr_code",
      x: 880,
      y: 580,
      width: 110,
      height: 110,
      rotation: 0,
      opacity: 100,
      zIndex: elements.length + 1,
    };
    pushState([...elements, newElem]);
    setSelectedId(newElem.id);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "logos");

      const res = await fetch("/api/certificates/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          const newElem: CanvasElement = {
            id: `logo-${Date.now()}`,
            type: "logo",
            src: data.url,
            x: 480,
            y: 40,
            width: 140,
            height: 70,
            rotation: 0,
            opacity: 100,
            zIndex: elements.length + 1,
          };
          pushState([...elements, newElem]);
          setSelectedId(newElem.id);
          showToast("✓ Logo asset added to canvas");
        }
      }
    } catch (err) {
      console.error("Logo upload error:", err);
    }
  };

  const updateSelectedElement = (fields: Partial<CanvasElement>) => {
    if (!selectedId) return;
    const nextElems = elements.map((elem) => (elem.id === selectedId ? { ...elem, ...fields } : elem));
    pushState(nextElems);
  };

  const deleteSelectedElement = () => {
    if (!selectedId) return;
    const nextElems = elements.filter((elem) => elem.id !== selectedId);
    pushState(nextElems);
    setSelectedId(null);
  };

  const changeLayer = (action: "front" | "back" | "forward" | "backward") => {
    if (!selectedId) return;
    const currElem = elements.find((e) => e.id === selectedId);
    if (!currElem) return;

    let nextElems = [...elements];
    if (action === "front") {
      const maxZ = Math.max(...elements.map((e) => e.zIndex), 0);
      nextElems = nextElems.map((e) => (e.id === selectedId ? { ...e, zIndex: maxZ + 1 } : e));
    } else if (action === "back") {
      const minZ = Math.min(...elements.map((e) => e.zIndex), 1);
      nextElems = nextElems.map((e) => (e.id === selectedId ? { ...e, zIndex: Math.max(1, minZ - 1) } : e));
    } else if (action === "forward") {
      nextElems = nextElems.map((e) => (e.id === selectedId ? { ...e, zIndex: e.zIndex + 1 } : e));
    } else if (action === "backward") {
      nextElems = nextElems.map((e) => (e.id === selectedId ? { ...e, zIndex: Math.max(1, e.zIndex - 1) } : e));
    }
    pushState(nextElems);
  };

  const alignSelected = (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    if (!selectedId) return;
    const selected = elements.find((e) => e.id === selectedId);
    if (!selected) return;

    let newX = selected.x;
    let newY = selected.y;

    if (alignment === "left") newX = 40;
    else if (alignment === "center") newX = Math.round((canvasWidth - selected.width) / 2);
    else if (alignment === "right") newX = canvasWidth - selected.width - 40;
    else if (alignment === "top") newY = 40;
    else if (alignment === "middle") newY = Math.round((canvasHeight - selected.height) / 2);
    else if (alignment === "bottom") newY = canvasHeight - selected.height - 40;

    updateSelectedElement({ x: newX, y: newY });
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setErrorMsg("Please enter a Template Name.");
      return;
    }
    if (!backgroundUrl) {
      setErrorMsg("Please upload a Certificate Background image.");
      return;
    }

    try {
      setSavingTemplate(true);
      setErrorMsg(null);

      const payload = {
        id: templateId || undefined,
        name: templateName.trim(),
        background_url: backgroundUrl,
        orientation: orientation,
        width: canvasWidth,
        height: canvasHeight,
        configuration: { elements: elements },
        is_active: true,
      };

      const res = await fetch("/api/certificates/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.template) {
          setTemplateId(data.template.id);
          showToast("✓ Certificate Template saved successfully!");
          setTimeout(() => {
            router.push("/admin/certificates/templates");
          }, 1200);
          return;
        }
        setErrorMsg(data.error || "Failed saving template.");
      } else {
        const errJson = await res.json();
        setErrorMsg(errJson.error || "Failed saving template.");
      }
    } catch (err) {
      console.error("Save template error:", err);
      setErrorMsg("Network error saving template.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleMouseDownElement = (e: React.MouseEvent, elem: CanvasElement) => {
    e.stopPropagation();
    setSelectedId(elem.id);
    setIsDragging(true);

    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (canvasBounds) {
      const mouseX = (e.clientX - canvasBounds.left) / (zoom / 100);
      const mouseY = (e.clientY - canvasBounds.top) / (zoom / 100);
      setDragOffset({ x: mouseX - elem.x, y: mouseY - elem.y });
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId || !canvasRef.current) return;

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - canvasBounds.left) / (zoom / 100);
    const mouseY = (e.clientY - canvasBounds.top) / (zoom / 100);

    const newX = Math.max(0, Math.round(mouseX - dragOffset.x));
    const newY = Math.max(0, Math.round(mouseY - dragOffset.y));

    setElements((prev) =>
      prev.map((elem) => (elem.id === selectedId ? { ...elem, x: newX, y: newY } : elem))
    );
  };

  const handleMouseUpCanvas = () => {
    if (isDragging) {
      setIsDragging(false);
      pushState(elements);
    }
  };

  const selectedElem = elements.find((e) => e.id === selectedId);

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#F8FAFC", fontFamily: "inherit", display: "flex", flexDirection: "column" }}>
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
            boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
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

      {/* TOP CONTROL BAR */}
      <div style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/admin/certificates/templates" style={{ color: "#94A3B8", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 13 }}>
            <ChevronLeft size={18} /> Templates
          </Link>
          <div style={{ height: 20, width: 1, background: "#475569" }} />
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template Name..."
            style={{
              background: "#0F172A",
              border: "1px solid #475569",
              color: "#fff",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 15,
              fontWeight: 800,
              minWidth: 260,
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #475569", background: "#0F172A", color: historyIndex > 0 ? "#fff" : "#475569", cursor: historyIndex > 0 ? "pointer" : "default" }}
            title="Undo"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #475569", background: "#0F172A", color: historyIndex < history.length - 1 ? "#fff" : "#475569", cursor: historyIndex < history.length - 1 ? "pointer" : "default" }}
            title="Redo"
          >
            <Redo2 size={16} />
          </button>

          <div style={{ height: 20, width: 1, background: "#475569" }} />

          <button onClick={() => setZoom((z) => Math.max(50, z - 10))} style={{ padding: 8, borderRadius: 8, border: "1px solid #475569", background: "#0F172A", color: "#fff", cursor: "pointer" }} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#CBD5E1", minWidth: 44, textAlign: "center" }}>{zoom}%</span>
          <button onClick={() => setZoom((z) => Math.min(150, z + 10))} style={{ padding: 8, borderRadius: 8, border: "1px solid #475569", background: "#0F172A", color: "#fff", cursor: "pointer" }} title="Zoom In">
            <ZoomIn size={16} />
          </button>

          <div style={{ height: 20, width: 1, background: "#475569" }} />

          <div style={{ background: "#0F172A", padding: 3, borderRadius: 10, border: "1px solid #475569", display: "flex", gap: 2 }}>
            <button
              onClick={() => setMode("edit")}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                background: mode === "edit" ? "#6D28D9" : "transparent",
                color: mode === "edit" ? "#fff" : "#94A3B8",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Edit3 size={14} /> Edit Mode
            </button>
            <button
              onClick={() => setMode("preview")}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                background: mode === "preview" ? "#6D28D9" : "transparent",
                color: mode === "preview" ? "#fff" : "#94A3B8",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Eye size={14} /> Preview
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleSaveTemplate}
            disabled={savingTemplate}
            style={{
              padding: "9px 22px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 13.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(109, 40, 217, 0.35)",
            }}
          >
            <Save size={16} /> {savingTemplate ? "Saving Template..." : "Save Template"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: "#FEF2F2", borderBottom: "1px solid #FCA5A5", padding: "10px 24px", color: "#991B1B", fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* THREE-COLUMN EDITOR LAYOUT */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT COLUMN */}
        <div style={{ width: 280, background: "#1E293B", borderRight: "1px solid #334155", padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 900, color: "#A78BFA", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Certificate Background
            </label>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 12px",
                borderRadius: 14,
                border: "2px dashed #475569",
                background: "#0F172A",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <Upload size={22} color="#A78BFA" style={{ marginBottom: 6 }} />
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "#F1F5F9" }}>
                {uploadingBg ? "Uploading..." : backgroundUrl ? "Replace Background" : "Upload Background"}
              </span>
              <span style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Landscape 1100 × 780 Recommended</span>
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleBgUpload} style={{ display: "none" }} />
            </label>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 900, color: "#A78BFA", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Add Elements
            </label>
            <button
              onClick={addStaticText}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #475569",
                background: "#0F172A",
                color: "#F8FAFC",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Type size={16} color="#6D28D9" /> + Static Heading / Subtext
            </button>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 900, color: "#A78BFA", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Dynamic Fields
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {DYNAMIC_FIELDS_LIST.map((f) => (
                <button
                  key={f.key}
                  onClick={() => addDynamicField(f.key, f.label)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #334155",
                    background: "#0F172A",
                    color: "#CBD5E1",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    textAlign: "left",
                  }}
                >
                  <Plus size={14} color="#A78BFA" />
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 900, color: "#A78BFA", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Assets &amp; Placeholders
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0F172A",
                  color: "#CBD5E1",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ImageIcon size={15} color="#10B981" /> + Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              </label>

              <button
                onClick={addQRCode}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1.5px dashed #6D28D9",
                  background: "#1E1B4B",
                  color: "#A78BFA",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <QrCode size={16} /> + Verification QR Placeholder
              </button>
            </div>
          </div>
        </div>

        {/* CENTER CANVAS */}
        <div
          style={{
            flex: 1,
            background: "#020617",
            padding: 32,
            overflow: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
        >
          <div
            ref={canvasRef}
            onClick={() => setSelectedId(null)}
            style={{
              position: "relative",
              width: canvasWidth,
              height: canvasHeight,
              transform: `scale(${zoom / 100})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.15s ease",
              background: backgroundUrl ? `url(${backgroundUrl}) center/contain no-repeat #ffffff` : "#ffffff",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            {!backgroundUrl && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontSize: 16, fontWeight: 800, color: "#334155" }}>No Certificate Background Uploaded</div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Upload a PNG or JPG background image from the left panel.</div>
              </div>
            )}

            {elements.map((elem) => {
              const isSelected = mode === "edit" && selectedId === elem.id;

              let displayContent = elem.text || "";
              if (mode === "preview" && elem.type === "dynamic_text" && elem.fieldKey) {
                const f = DYNAMIC_FIELDS_LIST.find((df) => df.key === elem.fieldKey);
                displayContent = f ? f.sample : elem.fieldKey;
              }

              return (
                <div
                  key={elem.id}
                  onMouseDown={(e) => mode === "edit" && handleMouseDownElement(e, elem)}
                  style={{
                    position: "absolute",
                    left: elem.x,
                    top: elem.y,
                    width: elem.width,
                    height: elem.height,
                    zIndex: elem.zIndex,
                    transform: `rotate(${elem.rotation || 0}deg)`,
                    opacity: (elem.opacity ?? 100) / 100,
                    cursor: mode === "edit" ? "move" : "default",
                    userSelect: "none",
                    border: isSelected ? "2px solid #6D28D9" : "1px dashed transparent",
                    boxShadow: isSelected ? "0 0 0 4px rgba(109, 40, 217, 0.25)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      elem.textAlign === "center"
                        ? "center"
                        : elem.textAlign === "right"
                        ? "flex-end"
                        : "flex-start",
                  }}
                >
                  {(elem.type === "static_text" || elem.type === "dynamic_text") && (
                    <span
                      style={{
                        fontFamily: elem.fontFamily || "Inter, sans-serif",
                        fontSize: `${elem.fontSize || 20}px`,
                        fontWeight: elem.fontWeight || 600,
                        fontStyle: elem.fontStyle || "normal",
                        color: elem.color || "#0F172A",
                        letterSpacing: elem.letterSpacing ? `${elem.letterSpacing}px` : "normal",
                        lineHeight: elem.lineHeight ? `${elem.lineHeight}px` : "normal",
                        textAlign: elem.textAlign || "left",
                        width: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {displayContent}
                    </span>
                  )}

                  {elem.type === "logo" && elem.src && (
                    <img src={elem.src} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  )}

                  {elem.type === "qr_code" && (
                    <div style={{ width: "100%", height: "100%", background: "#F1F5F9", border: "2px dashed #6D28D9", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 6, color: "#6D28D9" }}>
                      <QrCode size={36} />
                      <span style={{ fontSize: 9, fontWeight: 900, marginTop: 4, letterSpacing: 0.5 }}>QR VERIFY</span>
                    </div>
                  )}

                  {isSelected && (
                    <>
                      <div style={{ position: "absolute", top: -5, left: -5, width: 10, height: 10, background: "#6D28D9", borderRadius: "50%" }} />
                      <div style={{ position: "absolute", top: -5, right: -5, width: 10, height: 10, background: "#6D28D9", borderRadius: "50%" }} />
                      <div style={{ position: "absolute", bottom: -5, left: -5, width: 10, height: 10, background: "#6D28D9", borderRadius: "50%" }} />
                      <div style={{ position: "absolute", bottom: -5, right: -5, width: 10, height: 10, background: "#6D28D9", borderRadius: "50%" }} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ width: 300, background: "#1E293B", borderLeft: "1px solid #334155", padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#A78BFA", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Properties &amp; Formatting
          </div>

          {!selectedElem ? (
            <div style={{ padding: "32px 12px", textAlign: "center", color: "#64748B" }}>
              <Sliders size={28} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "#CBD5E1" }}>No Element Selected</div>
              <div style={{ fontSize: 11.5, marginTop: 4 }}>Click an element on the certificate canvas to edit its properties.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#0F172A", padding: "8px 12px", borderRadius: 8, border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: "#A78BFA", textTransform: "uppercase" }}>
                  {selectedElem.type.replace("_", " ")}
                </span>
                <button onClick={deleteSelectedElement} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }} title="Delete Element">
                  <Trash2 size={16} />
                </button>
              </div>

              {selectedElem.type === "static_text" && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#CBD5E1", marginBottom: 4 }}>
                    Text Content
                  </label>
                  <input
                    type="text"
                    value={selectedElem.text || ""}
                    onChange={(e) => updateSelectedElement({ text: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 13 }}
                  />
                </div>
              )}

              {(selectedElem.type === "static_text" || selectedElem.type === "dynamic_text") && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#CBD5E1", marginBottom: 4 }}>
                      Font Family
                    </label>
                    <select
                      value={selectedElem.fontFamily || "Inter, sans-serif"}
                      onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 13 }}
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f.value} value={f.value}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#CBD5E1", marginBottom: 4 }}>
                        Font Size (px)
                      </label>
                      <input
                        type="number"
                        min={8}
                        max={120}
                        value={selectedElem.fontSize || 20}
                        onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) || 16 })}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 13 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#CBD5E1", marginBottom: 4 }}>
                        Weight
                      </label>
                      <select
                        value={selectedElem.fontWeight || 600}
                        onChange={(e) => updateSelectedElement({ fontWeight: parseInt(e.target.value) || e.target.value })}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 13 }}
                      >
                        <option value={400}>Regular (400)</option>
                        <option value={600}>SemiBold (600)</option>
                        <option value={700}>Bold (700)</option>
                        <option value={900}>Black (900)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#CBD5E1", marginBottom: 4 }}>
                      Text Color &amp; Alignment
                    </label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input
                        type="color"
                        value={selectedElem.color || "#0F172A"}
                        onChange={(e) => updateSelectedElement({ color: e.target.value })}
                        style={{ width: 36, height: 36, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }}
                      />
                      <div style={{ flex: 1, display: "flex", gap: 4, background: "#0F172A", padding: 3, borderRadius: 8, border: "1px solid #475569" }}>
                        {(["left", "center", "right"] as const).map((align) => (
                          <button
                            key={align}
                            onClick={() => updateSelectedElement({ textAlign: align })}
                            style={{
                              flex: 1,
                              padding: 6,
                              borderRadius: 6,
                              border: "none",
                              background: selectedElem.textAlign === align ? "#6D28D9" : "transparent",
                              color: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            {align === "left" && <AlignLeft size={14} />}
                            {align === "center" && <AlignCenter size={14} />}
                            {align === "right" && <AlignRight size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div style={{ borderTop: "1px solid #334155", paddingTop: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#A78BFA", marginBottom: 8 }}>
                  Position &amp; Dimensions
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#94A3B8" }}>X (px)</label>
                    <input
                      type="number"
                      value={selectedElem.x}
                      onChange={(e) => updateSelectedElement({ x: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 12.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#94A3B8" }}>Y (px)</label>
                    <input
                      type="number"
                      value={selectedElem.y}
                      onChange={(e) => updateSelectedElement({ y: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 12.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#94A3B8" }}>Width (px)</label>
                    <input
                      type="number"
                      value={selectedElem.width}
                      onChange={(e) => updateSelectedElement({ width: parseInt(e.target.value) || 50 })}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 12.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#94A3B8" }}>Height (px)</label>
                    <input
                      type="number"
                      value={selectedElem.height}
                      onChange={(e) => updateSelectedElement({ height: parseInt(e.target.value) || 20 })}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 12.5 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #334155", paddingTop: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#A78BFA", marginBottom: 8 }}>
                  Layer Controls
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button onClick={() => changeLayer("forward")} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <ArrowUp size={14} /> Bring Forward
                  </button>
                  <button onClick={() => changeLayer("backward")} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <ArrowDown size={14} /> Send Backward
                  </button>
                  <button onClick={() => changeLayer("front")} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <ChevronsUp size={14} /> Bring to Front
                  </button>
                  <button onClick={() => changeLayer("back")} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #475569", background: "#0F172A", color: "#fff", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <ChevronsDown size={14} /> Send to Back
                  </button>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #334155", paddingTop: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#A78BFA", marginBottom: 8 }}>
                  Align Tools
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <button onClick={() => alignSelected("center")} style={{ padding: "6px", borderRadius: 6, border: "1px solid #475569", background: "#0F172A", color: "#CBD5E1", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    Center Horizontally
                  </button>
                  <button onClick={() => alignSelected("middle")} style={{ padding: "6px", borderRadius: 6, border: "1px solid #475569", background: "#0F172A", color: "#CBD5E1", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    Center Vertically
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CertificateEditorPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: "#fff", background: "#0F172A", minHeight: "100vh" }}>Loading Visual Certificate Editor...</div>}>
      <CertificateEditorContent />
    </Suspense>
  );
}
