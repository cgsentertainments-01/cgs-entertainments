"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  Download,
  Plus,
  X,
  LayoutTemplate,
  FileText,
  RefreshCw,
  Eye,
  Trash2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Ban,
  ArrowLeft,
  ArrowRight,
  Check,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Move,
  Lock,
} from "lucide-react";
import { formatResultLabel, CertificateSnapshotData, CanvaTextElement } from "@/lib/certificate";

interface GeneratedCertificate {
  id: string;
  certificate_number: string;
  registration_id: string;
  participant_id: string;
  event_id: string;
  template_id?: string | null;
  certificate_type: string;
  certificate_url: string;
  verification_token: string;
  status: string; // 'issued' | 'revoked'
  issued_at: string;
  created_at: string;
  revoke_reason?: string | null;
  reissued_from_id?: string | null;
  snapshot_data?: CertificateSnapshotData | null;

  participant_name: string;
  participant_number: string;
  participant_email: string;
  event_title: string;
  event_date: string | null;
  venue: string | null;
  category_name: string;
  comp_type: string;
  result_type: string;

  result_mismatch?: boolean;
  current_eligible_type?: string | null;
}

interface EligibleRegistration {
  registration_id: string;
  registration_number: string;
  participant_id: string;
  participant_name: string;
  participant_number: string;
  participant_email: string;
  event_id: string;
  event_title: string;
  event_date: string | null;
  venue: string | null;
  category_name: string;
  comp_type: string;
  result_type: string;
  is_eligible: boolean;
  certificate_type: string | null;
  eligibility_reason: string | null;
}

interface TemplateItem {
  id: string;
  name: string;
  certificate_type?: string;
  background_url: string;
  orientation?: string;
  is_active: boolean;
}

interface Counters {
  total_generated: number;
  revoked_count: number;
  eligible_awaiting: number;
  ineligible_pending: number;
  winner: number;
  runner_up: number;
  merit: number;
  appreciation: number;
  participation: number;
}

export default function AdminCertificatesPage() {
  const [activeTab, setActiveTab] = useState<"generated" | "eligible" | "revoked">("generated");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [certificates, setCertificates] = useState<GeneratedCertificate[]>([]);
  const [eligibleRegs, setEligibleRegs] = useState<EligibleRegistration[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [counters, setCounters] = useState<Counters>({
    total_generated: 0,
    revoked_count: 0,
    eligible_awaiting: 0,
    ineligible_pending: 0,
    winner: 0,
    runner_up: 0,
    merit: 0,
    appreciation: 0,
    participation: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [resultFilter, setResultFilter] = useState("all");

  // Wizard Step Modal State (Step 1: Select Template, Step 2: Canva-Style Editor)
  const [issuingReg, setIssuingReg] = useState<EligibleRegistration | null>(null);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);

  // Selected Template Source of Truth
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [templateFetchError, setTemplateFetchError] = useState<string | null>(null);

  // Canva Canvas State
  const [canvasElements, setCanvasElements] = useState<CanvaTextElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [issuingInProgress, setIssuingInProgress] = useState<boolean>(false);

  // Reissue & Revoke State
  const [reissuingCert, setReissuingCert] = useState<GeneratedCertificate | null>(null);
  const [reissueReason, setReissueReason] = useState<string>("");
  const [reissueInProgress, setReissueInProgress] = useState<boolean>(false);
  const [revokingCert, setRevokingCert] = useState<GeneratedCertificate | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>("");

  // View & Delete Modal State
  const [viewingCert, setViewingCert] = useState<GeneratedCertificate | null>(null);
  const [deletingCert, setDeletingCert] = useState<GeneratedCertificate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCertificatesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/certificates", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCertificates(data.certificates || []);
          setEligibleRegs(data.eligibleRegistrations || []);
          setTemplates(data.templates || []);
          if (data.counters) setCounters(data.counters);
          return;
        }
      }
      setError("Failed to fetch certificate database.");
    } catch (err: any) {
      console.error("Error fetching certificates:", err);
      setError("Network error fetching certificate records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificatesData();
  }, []);

  // Launch Certificate Generation Wizard & Initialize Canva Elements
  const openIssueWizard = async (reg: EligibleRegistration) => {
    setIssuingReg(reg);
    setWizardStep(1); // Step 1: Select Ready-Made Image Template
    setLoadingTemplates(true);
    setTemplateFetchError(null);

    const resultBadgeStr = formatResultLabel(reg.result_type).badge;
    const issueDateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    // Initialize Default Canva Text Elements
    const initialElements: CanvaTextElement[] = [
      { id: "org", field_key: "organization_name", text: "CGS ENTERTAINMENTS", x: 50, y: 10, fontFamily: "Cinzel, serif", fontSize: 20, fontWeight: 900, fontStyle: "normal", color: "#6d28d9", textAlign: "center" },
      { id: "title", field_key: "certificate_title", text: `Certificate of ${reg.result_type.toUpperCase()}`, x: 50, y: 19, fontFamily: "Cinzel, serif", fontSize: 28, fontWeight: 900, fontStyle: "normal", color: "#0f172a", textAlign: "center" },
      { id: "subtitle", field_key: "subtitle", text: "THIS IS PROUDLY PRESENTED TO", x: 50, y: 28, fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 700, fontStyle: "normal", color: "#64748b", textAlign: "center" },
      { id: "name", field_key: "participant_name", text: reg.participant_name, x: 50, y: 41, fontFamily: "'Pinyon Script', cursive", fontSize: 54, fontWeight: 700, fontStyle: "normal", color: "#6d28d9", textAlign: "center" },
      { id: "pid", field_key: "participant_number", text: `ID: ${reg.participant_number}`, x: 50, y: 52, fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 800, color: "#475569", fontStyle: "normal", textAlign: "center" },
      { id: "event", field_key: "event_title", text: `For performance in ${reg.event_title} (${reg.category_name})`, x: 50, y: 61, fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 600, color: "#334155", fontStyle: "normal", textAlign: "center" },
      { id: "result", field_key: "result_label", text: resultBadgeStr, x: 50, y: 70, fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 800, color: "#d97706", fontStyle: "normal", textAlign: "center" },
      { id: "cert_no", field_key: "certificate_number", text: "Cert #: CGS-CERT-2026-AUTO", x: 20, y: 88, fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#64748b", fontStyle: "normal", textAlign: "left" },
      { id: "date", field_key: "issue_date", text: `Issue Date: ${issueDateStr}`, x: 50, y: 88, fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#64748b", fontStyle: "normal", textAlign: "center" },
      { id: "sig", field_key: "authorized_signatory", text: "Signature: CGS Management", x: 80, y: 88, fontFamily: "'Pinyon Script', cursive", fontSize: 22, fontWeight: 700, color: "#0f172a", fontStyle: "normal", textAlign: "right" },
    ];

    setCanvasElements(initialElements);
    setSelectedElementId("name"); // Default selected element: Participant Name

    try {
      // FETCH FRESH ACTIVE TEMPLATES DIRECTLY FROM SUPABASE AT THIS EXACT MOMENT
      const res = await fetch("/api/certificates/templates", { cache: "no-store" });
      const data = await res.json();

      if (res.ok && data.success) {
        const freshTemplates: TemplateItem[] = data.templates || [];
        setTemplates(freshTemplates);

        // Pre-select matching active template
        const activeTemplates = freshTemplates.filter((t) => t.is_active !== false);
        const matchingTpl =
          activeTemplates.find((t) => t.certificate_type?.toLowerCase() === reg.result_type.toLowerCase()) ||
          activeTemplates[0] ||
          null;
        setSelectedTemplate(matchingTpl);
      } else {
        setTemplateFetchError(data.error || "Unable to load certificate templates. Please try again.");
      }
    } catch (err: any) {
      console.error("Failed to load certificate templates on modal launch:", err);
      setTemplateFetchError("Unable to load certificate templates. Please try again.");
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Add Custom Text Element to Canva Canvas
  const handleAddCustomText = () => {
    const newId = `custom_${Date.now()}`;
    const newElement: CanvaTextElement = {
      id: newId,
      text: "Congratulations!",
      x: 50,
      y: 35,
      fontFamily: "Montserrat, sans-serif",
      fontSize: 18,
      fontWeight: 800,
      fontStyle: "normal",
      color: "#6d28d9",
      textAlign: "center",
      is_custom: true,
    };
    setCanvasElements((prev) => [...prev, newElement]);
    setSelectedElementId(newId);
  };

  // Delete Selected Canva Text Element
  const handleDeleteSelectedElement = () => {
    if (!selectedElementId) return;
    setCanvasElements((prev) => prev.filter((el) => el.id !== selectedElementId));
    setSelectedElementId(null);
  };

  // Handle Dragging Canvas Elements
  const handleMouseDown = (e: React.MouseEvent, elId: string) => {
    e.stopPropagation();
    setSelectedElementId(elId);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
    const relativeY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(5, Math.min(95, Math.round(relativeX)));
    const clampedY = Math.max(5, Math.min(95, Math.round(relativeY)));

    setCanvasElements((prev) =>
      prev.map((el) => (el.id === selectedElementId ? { ...el, x: clampedX, y: clampedY } : el))
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Selected Element Pointer
  const selectedElement = canvasElements.find((el) => el.id === selectedElementId) || null;

  // Execute Final Certificate Issuance preserving exact template ID & image URL
  const handleExecuteIssue = async () => {
    if (!issuingReg) return;
    try {
      setIssuingInProgress(true);
      const nameEl = canvasElements.find((el) => el.id === "name" || el.field_key === "participant_name");
      const titleEl = canvasElements.find((el) => el.id === "title" || el.field_key === "certificate_title");
      const sigEl = canvasElements.find((el) => el.id === "sig" || el.field_key === "authorized_signatory");
      const dateEl = canvasElements.find((el) => el.id === "date" || el.field_key === "issue_date");

      const payload = {
        registration_id: issuingReg.registration_id,
        template_id: selectedTemplate?.id || null,
        background_url: selectedTemplate?.background_url || null,
        participant_display_name: nameEl?.text || issuingReg.participant_name,
        certificate_title: titleEl?.text || "Certificate of Achievement",
        authorized_signatory: sigEl?.text || "CGS Management",
        custom_issue_date: dateEl?.text || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        text_elements: canvasElements,
      };

      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Certificate ${data.certificate.certificate_number} issued for ${nameEl?.text || issuingReg.participant_name}!`);
        setIssuingReg(null);
        fetchCertificatesData();
      } else {
        alert(`Error issuing certificate: ${data.error || "Unable to issue"}`);
      }
    } catch (err) {
      console.error("Issue error:", err);
      alert("Network error issuing certificate.");
    } finally {
      setIssuingInProgress(false);
    }
  };

  // Open Reissue Modal
  const openReissueModal = (cert: GeneratedCertificate) => {
    setReissuingCert(cert);
    setReissueReason("");
  };

  // Execute Reissue Action
  const handleExecuteReissue = async () => {
    if (!reissuingCert) return;
    if (!reissueReason.trim()) {
      alert("Please enter a mandatory Reissue Reason.");
      return;
    }

    try {
      setReissueInProgress(true);
      const res = await fetch(`/api/certificates/${reissuingCert.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_type: "reissue",
          reissue_reason: reissueReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Certificate reissued! New Cert #: ${data.certificate.certificate_number}`);
        setReissuingCert(null);
        fetchCertificatesData();
      } else {
        alert(`Error reissuing certificate: ${data.error || "Unable to reissue"}`);
      }
    } catch (err) {
      console.error("Reissue error:", err);
      alert("Network error reissuing certificate.");
    } finally {
      setReissueInProgress(false);
    }
  };

  // Execute Revoke Action
  const handleExecuteRevoke = async () => {
    if (!revokingCert) return;
    if (!revokeReason.trim()) {
      alert("Please enter a mandatory Revocation Reason.");
      return;
    }

    try {
      const res = await fetch(`/api/certificates/${revokingCert.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_type: "revoke",
          reissue_reason: revokeReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Certificate ${revokingCert.certificate_number} marked as REVOKED.`);
        setRevokingCert(null);
        fetchCertificatesData();
      } else {
        alert(`Error revoking certificate: ${data.error || "Unable to revoke"}`);
      }
    } catch (err) {
      console.error("Revoke error:", err);
      alert("Network error revoking certificate.");
    }
  };

  // Delete Certificate Record ONLY
  const handleDeleteCertificate = async () => {
    if (!deletingCert) return;
    try {
      const res = await fetch(`/api/certificates?id=${deletingCert.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Certificate ${deletingCert.certificate_number} deleted. Master profiles remain safe.`);
        setDeletingCert(null);
        fetchCertificatesData();
      } else {
        alert(`Error deleting certificate: ${data.error || "Unable to delete"}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error deleting certificate.");
    }
  };

  // Download PDF / Print Certificate
  const handleDownloadCertificate = (cert: GeneratedCertificate) => {
    if (!cert.certificate_url) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      let rawHTML = cert.certificate_url;
      if (rawHTML.startsWith("data:text/html;charset=utf-8,")) {
        rawHTML = decodeURIComponent(rawHTML.replace("data:text/html;charset=utf-8,", ""));
      }
      printWindow.document.write(rawHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  // Filtered Lists
  const activeCertificatesList = certificates.filter((c) => (activeTab === "revoked" ? c.status === "revoked" : c.status === "issued"));
  const filteredCertificates = activeCertificatesList.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.participant_name.toLowerCase().includes(q) ||
      c.certificate_number.toLowerCase().includes(q) ||
      c.participant_number.toLowerCase().includes(q) ||
      c.event_title.toLowerCase().includes(q) ||
      c.category_name.toLowerCase().includes(q);

    const matchesResult = resultFilter === "all" || c.result_type === resultFilter;
    return matchesSearch && matchesResult;
  });

  const filteredEligible = eligibleRegs.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.participant_name.toLowerCase().includes(q) ||
      r.participant_number.toLowerCase().includes(q) ||
      r.event_title.toLowerCase().includes(q) ||
      r.category_name.toLowerCase().includes(q);

    const matchesResult = resultFilter === "all" || r.result_type === resultFilter;
    return matchesSearch && matchesResult;
  });

  const activeSelectableTemplates = templates.filter((t) => t.is_active !== false);

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1440, margin: "0 auto", fontFamily: "inherit" }}>
      {/* Toast Notification */}
      {toastMessage && (
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
          <CheckCircle2 size={20} color="#fff" /> {toastMessage}
        </div>
      )}

      {/* Navigation Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4, display: "flex", alignItems: "center", gap: 10 }}>
            <Award size={28} color="#6D28D9" /> Certificate Management System
          </h1>
          <p style={{ fontSize: 14.5, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Select Ready-Made Template → Canva-Style Editor → Issue Certificate.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={fetchCertificatesData}
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

          <Link
            href="/admin/certificates/templates"
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 800,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(109,40,217,0.3)",
            }}
          >
            <LayoutTemplate size={16} /> Manage Image Templates
          </Link>

          <Link
            href="/certificates/verify"
            target="_blank"
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              background: "#FAF5FF",
              color: "#6D28D9",
              border: "1px solid #E9D5FF",
              fontSize: 14,
              fontWeight: 800,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShieldCheck size={16} /> Public Verification Portal <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Statistics Header Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Issued Certificates</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", marginTop: 4 }}>{counters.total_generated}</div>
        </div>

        <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#1D4ED8" }}>Ready to Issue</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#2563EB", marginTop: 4 }}>{counters.eligible_awaiting}</div>
        </div>

        <div style={{ background: "#FEF3C7", border: "1.5px solid #FCD34D", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#B45309" }}>🏆 Winners</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#D97706", marginTop: 4 }}>{counters.winner}</div>
        </div>

        <div style={{ background: "#F1F5F9", border: "1.5px solid #CBD5E1", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>🥈 Runner-up</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#475569", marginTop: 4 }}>{counters.runner_up}</div>
        </div>

        <div style={{ background: "#FFEDD5", border: "1.5px solid #FDBA74", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#C2410C" }}>🥉 Finalists</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#EA580C", marginTop: 4 }}>{counters.merit}</div>
        </div>

        <div style={{ background: "#F3E8FF", border: "1.5px solid #DDD6FE", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#6D28D9" }}>⭐ Special Mention</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#7C3AED", marginTop: 4 }}>{counters.appreciation}</div>
        </div>

        <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#991B1B" }}>🚫 Revoked</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#EF4444", marginTop: 4 }}>{counters.revoked_count}</div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ borderBottom: "2px solid #E2E8F0", display: "flex", gap: 24, paddingBottom: 2, marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setActiveTab("generated")}
          style={{
            padding: "10px 16px",
            fontSize: 15,
            fontWeight: 800,
            color: activeTab === "generated" ? "#6D28D9" : "#64748B",
            background: "none",
            border: "none",
            borderBottom: activeTab === "generated" ? "3px solid #6D28D9" : "3px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <Award size={18} /> Issued Certificates ({counters.total_generated})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("eligible")}
          style={{
            padding: "10px 16px",
            fontSize: 15,
            fontWeight: 800,
            color: activeTab === "eligible" ? "#6D28D9" : "#64748B",
            background: "none",
            border: "none",
            borderBottom: activeTab === "eligible" ? "3px solid #6D28D9" : "3px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <UserCheck size={18} /> Eligible Registrations Awaiting Issue ({counters.eligible_awaiting})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("revoked")}
          style={{
            padding: "10px 16px",
            fontSize: 15,
            fontWeight: 800,
            color: activeTab === "revoked" ? "#EF4444" : "#64748B",
            background: "none",
            border: "none",
            borderBottom: activeTab === "revoked" ? "3px solid #EF4444" : "3px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <Ban size={18} /> Revoked Certificates ({counters.revoked_count})
        </button>
      </div>

      {/* Search & Result Filters */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          border: "1.5px solid #E2E8F0",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginBottom: 24,
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search Participant Display Name, Cert Number, Participant No, Event Title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px 11px 40px",
              borderRadius: 12,
              border: "1.5px solid #E2E8F0",
              fontSize: 14,
              outline: "none",
              background: "#F8FAFC",
              color: "#0F172A",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginRight: 4 }}>Result Filter:</span>
          {[
            { key: "all", label: "All Results" },
            { key: "winner", label: "🏆 Winner" },
            { key: "runner_up", label: "🥈 Runner-up" },
            { key: "finalist", label: "🥉 Finalist" },
            { key: "special_mention", label: "⭐ Special Mention" },
            { key: "participant", label: "🎓 Participant" },
          ].map((tab) => {
            const active = resultFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setResultFilter(tab.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 800,
                  border: active ? "1.5px solid #6D28D9" : "1px solid #E2E8F0",
                  background: active ? "#F3E8FF" : "#ffffff",
                  color: active ? "#6D28D9" : "#475569",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: "#FEF2F2", color: "#991B1B", borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── TAB 1 & TAB 3: ISSUED OR REVOKED CERTIFICATES ── */}
      {(activeTab === "generated" || activeTab === "revoked") && (
        <div>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#6B7280", fontWeight: 700 }}>
              Loading certificate database from Supabase...
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "60px 24px", textAlign: "center", color: "#64748B" }}>
              <Award size={48} color="#94A3B8" style={{ margin: "0 auto 14px", opacity: 0.5 }} />
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
                {activeTab === "revoked" ? "No Revoked Certificates" : "No Issued Certificates Yet"}
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", maxWidth: 440, margin: "0 auto 20px" }}>
                Assign results to participants in the Participant Registry to make them eligible, then select an uploaded image template and issue certificates.
              </p>
              {activeTab === "generated" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("eligible")}
                  style={{ padding: "10px 20px", borderRadius: 12, background: "#6D28D9", color: "#fff", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
                >
                  View Eligible Registrations
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
              {filteredCertificates.map((cert) => {
                const resultMeta = formatResultLabel(cert.result_type);
                const issueDateStr = cert.issued_at
                  ? new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                  : "-";

                return (
                  <div
                    key={cert.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: 20,
                      border: cert.result_mismatch ? "2px solid #F59E0B" : cert.status === "revoked" ? "2px solid #FCA5A5" : "1.5px solid #E2E8F0",
                      padding: "24px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      {/* Top Header Badge */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: cert.status === "revoked" ? "#EF4444" : "#6D28D9", background: cert.status === "revoked" ? "#FEE2E2" : "#F3E8FF", padding: "4px 10px", borderRadius: 8 }}>
                          {cert.certificate_number}
                        </span>
                        <Award size={22} color={cert.status === "revoked" ? "#EF4444" : "#D97706"} />
                      </div>

                      {/* Result Mismatch Warning */}
                      {cert.result_mismatch && (
                        <div style={{ padding: "8px 12px", background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 10, marginBottom: 12, fontSize: 12, fontWeight: 800, color: "#B45309", display: "flex", alignItems: "center", gap: 6 }}>
                          <AlertTriangle size={15} color="#D97706" /> Result updated to '{cert.result_type}'. Reissue recommended.
                        </div>
                      )}

                      {/* Recipient Display Name */}
                      <h3 style={{ fontSize: 19, fontWeight: 900, color: "#0F172A", margin: "0 0 2px" }}>
                        {cert.participant_name}
                      </h3>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B", marginBottom: 12 }}>
                        ID: {cert.participant_number}
                      </div>

                      {/* Event Details */}
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>
                        {cert.event_title}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>
                        Category: <strong>{cert.category_name}</strong> ({cert.comp_type})
                      </div>

                      {/* Result Badge */}
                      <div style={{ padding: "6px 14px", background: resultMeta.bg, borderRadius: 10, fontSize: 12.5, fontWeight: 800, color: resultMeta.color, display: "inline-block" }}>
                        {resultMeta.badge}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #F1F5F9" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, fontSize: 12, color: "#94A3B8" }}>
                        <span>Issued: {issueDateStr}</span>
                        <span style={{ color: cert.status === "issued" ? "#10B981" : "#EF4444", fontWeight: 800 }}>
                          ● {cert.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => setViewingCert(cert)}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 10,
                            background: "#F1F5F9",
                            border: "1px solid #CBD5E1",
                            color: "#334155",
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <Eye size={14} color="#6D28D9" /> View
                        </button>

                        {cert.status === "issued" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDownloadCertificate(cert)}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                borderRadius: 10,
                                background: "#6D28D9",
                                color: "#ffffff",
                                border: "none",
                                fontSize: 12.5,
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                              }}
                            >
                              <Download size={14} /> PDF
                            </button>

                            <button
                              type="button"
                              onClick={() => openReissueModal(cert)}
                              style={{
                                padding: "8px 12px",
                                borderRadius: 10,
                                background: "#FEF3C7",
                                border: "1px solid #FCD34D",
                                color: "#D97706",
                                fontSize: 12.5,
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                              title="Reissue certificate with updated details"
                            >
                              <RotateCcw size={14} /> Reissue
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => setDeletingCert(cert)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            background: "#F8FAFC",
                            border: "1px solid #CBD5E1",
                            color: "#64748B",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                          title="Delete certificate record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: ELIGIBLE REGISTRATIONS ── */}
      {activeTab === "eligible" && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflowX: "auto", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#6B7280", fontWeight: 700 }}>
              Loading registration database...
            </div>
          ) : filteredEligible.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>
              <UserCheck size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>No Registrations Awaiting Issue</h3>
              <p style={{ fontSize: 14, marginTop: 4 }}>
                All eligible registrations have certificates issued, or results are pending.
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", color: "#4B5563", fontWeight: 700 }}>
                  <th style={{ padding: "14px 20px" }}>PARTICIPANT NO</th>
                  <th style={{ padding: "14px 20px" }}>PARTICIPANT NAME</th>
                  <th style={{ padding: "14px 20px" }}>EVENT &amp; CATEGORY</th>
                  <th style={{ padding: "14px 20px" }}>ASSIGNED RESULT</th>
                  <th style={{ padding: "14px 20px" }}>ELIGIBILITY STATUS</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredEligible.map((reg) => {
                  const resultMeta = formatResultLabel(reg.result_type);

                  return (
                    <tr key={reg.registration_id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "16px 20px", fontWeight: 800, color: "#6D28D9" }}>
                        {reg.participant_number}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontWeight: 800, color: "#111827" }}>{reg.participant_name}</div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>{reg.participant_email}</div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontWeight: 700, color: "#111827" }}>{reg.event_title}</div>
                        <div style={{ fontSize: 12, color: "#6D28D9", fontWeight: 700 }}>{reg.category_name} ({reg.comp_type})</div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 8, background: resultMeta.bg, color: resultMeta.color, fontSize: 12.5, fontWeight: 800 }}>
                          {resultMeta.badge}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        {reg.is_eligible ? (
                          <span style={{ color: "#10B981", fontSize: 13, fontWeight: 800 }}>
                            ✓ Eligible ({reg.certificate_type})
                          </span>
                        ) : (
                          <span style={{ color: "#EF4444", fontSize: 13, fontWeight: 700 }}>
                            ⚠️ {reg.eligibility_reason || "Ineligible"}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        {reg.is_eligible ? (
                          <button
                            type="button"
                            onClick={() => openIssueWizard(reg)}
                            style={{
                              padding: "8px 16px",
                              borderRadius: 10,
                              background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                              color: "#ffffff",
                              fontSize: 13,
                              fontWeight: 800,
                              border: "none",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              boxShadow: "0 2px 8px rgba(109,40,217,0.25)",
                            }}
                          >
                            <Sparkles size={14} /> Generate Certificate
                          </button>
                        ) : (
                          <span style={{ fontSize: 12.5, color: "#94A3B8", fontStyle: "italic" }}>
                            Result Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── CANVA-STYLE CERTIFICATE EDITOR MODAL ── */}
      {issuingReg && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 24, width: "100%", maxWidth: 1280, height: "96vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.35)", overflow: "hidden" }}>
            {/* Modal Top Bar */}
            <div style={{ padding: "14px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={18} color="#6D28D9" />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    Canva Certificate Editor <span style={{ fontSize: 11, background: "#F3E8FF", color: "#6D28D9", padding: "2px 8px", borderRadius: 6, fontWeight: 800 }}>LIVE CANVAS</span>
                  </h3>
                  <div style={{ fontSize: 12, color: "#64748B" }}>
                    Participant: <strong>{issuingReg.participant_name}</strong> ({issuingReg.participant_number}) | Template: <strong>{selectedTemplate?.name || "Classic Gold Banner (Default)"}</strong>
                  </div>
                </div>
              </div>

              {/* Step Navigation & Close */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: wizardStep === 1 ? "#6D28D9" : "#10B981" }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: wizardStep === 1 ? "#6D28D9" : "#10B981", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                    {wizardStep === 1 ? "1" : "✓"}
                  </span>
                  Choose Design Template
                </div>
                <span style={{ color: "#CBD5E1" }}>→</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: wizardStep === 2 ? "#6D28D9" : "#94A3B8" }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: wizardStep === 2 ? "#6D28D9" : "#E2E8F0", color: wizardStep === 2 ? "#fff" : "#64748B", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                    2
                  </span>
                  Canva Interactive Canvas
                </div>

                <button type="button" onClick={() => setIssuingReg(null)} style={{ border: "none", background: "none", cursor: "pointer", marginLeft: 12 }}>
                  <X size={22} color="#94A3B8" />
                </button>
              </div>
            </div>

            {/* WIZARD STEP 1: SELECT READY-MADE TEMPLATE */}
            {wizardStep === 1 && (
              <div style={{ flex: 1, padding: "28px", overflowY: "auto", background: "#F8FAFC", display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
                    Select Uploaded Ready-Made Certificate Design
                  </h3>
                  <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
                    Click to select ONE template background image for {issuingReg.participant_name}'s {issuingReg.result_type.toUpperCase()} certificate.
                  </p>
                </div>

                {loadingTemplates ? (
                  <div style={{ padding: 60, textAlign: "center", color: "#6B7280", fontWeight: 700 }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px", display: "block", color: "#6D28D9" }} />
                    Loading active certificate templates from Supabase...
                  </div>
                ) : templateFetchError ? (
                  <div style={{ padding: 20, background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 14, textAlign: "center", fontWeight: 700 }}>
                    ⚠️ {templateFetchError}
                  </div>
                ) : activeSelectableTemplates.length === 0 ? (
                  <div style={{ padding: 40, background: "#ffffff", borderRadius: 16, border: "1.5px solid #CBD5E1", textAlign: "center", color: "#64748B" }}>
                    <AlertTriangle size={36} color="#D97706" style={{ margin: "0 auto 10px" }} />
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>No active certificate templates available.</h4>
                    <p style={{ fontSize: 13, color: "#64748B" }}>Please navigate to Templates Management to upload or activate a template.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, flex: 1 }}>
                    {/* Default Option */}
                    <div
                      onClick={() => setSelectedTemplate(null)}
                      style={{
                        background: "#ffffff",
                        borderRadius: 16,
                        border: selectedTemplate === null ? "2.5px solid #6D28D9" : "1.5px solid #E2E8F0",
                        padding: "16px",
                        cursor: "pointer",
                        boxShadow: selectedTemplate === null ? "0 8px 24px rgba(109,40,217,0.15)" : "0 2px 8px rgba(0,0,0,0.02)",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      {selectedTemplate === null && (
                        <div style={{ position: "absolute", top: 12, right: 12, background: "#6D28D9", color: "#fff", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={16} />
                        </div>
                      )}
                      <div>
                        <div style={{ height: 130, background: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, border: "1px solid #E9D5FF" }}>
                          <Award size={44} color="#6D28D9" />
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>Classic Gold Banner (Default)</h4>
                        <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>High-resolution classic gold border with Cinzel typography</p>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #F1F5F9", fontSize: 12, fontWeight: 800, color: selectedTemplate === null ? "#6D28D9" : "#64748B" }}>
                        {selectedTemplate === null ? "✓ Selected Design" : "Click to Select"}
                      </div>
                    </div>

                    {/* Fresh Active Templates */}
                    {activeSelectableTemplates.map((t) => {
                      const isSelected = selectedTemplate?.id === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTemplate(t)}
                          style={{
                            background: "#ffffff",
                            borderRadius: 16,
                            border: isSelected ? "2.5px solid #6D28D9" : "1.5px solid #E2E8F0",
                            padding: "16px",
                            cursor: "pointer",
                            boxShadow: isSelected ? "0 8px 24px rgba(109,40,217,0.15)" : "0 2px 8px rgba(0,0,0,0.02)",
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          {isSelected && (
                            <div style={{ position: "absolute", top: 12, right: 12, background: "#6D28D9", color: "#fff", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Check size={16} />
                            </div>
                          )}
                          <div>
                            <div style={{ height: 130, background: t.background_url ? `url(${t.background_url}) center/cover no-repeat` : "#F8FAFC", borderRadius: 12, marginBottom: 12, border: "1px solid #E2E8F0" }} />
                            <h4 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>{t.name}</h4>
                            <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Type: {t.certificate_type || "Winner"}</p>
                          </div>
                          <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #F1F5F9", fontSize: 12, fontWeight: 800, color: isSelected ? "#6D28D9" : "#64748B" }}>
                            {isSelected ? "✓ Selected Template" : "Click to Select"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer Next Button */}
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    disabled={loadingTemplates}
                    style={{
                      padding: "12px 28px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                      color: "#ffffff",
                      fontSize: 14.5,
                      fontWeight: 900,
                      border: "none",
                      cursor: loadingTemplates ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(109, 40, 217, 0.3)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    Open Canva Certificate Editor <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* WIZARD STEP 2: 3-COLUMN CANVA-STYLE CERTIFICATE EDITOR */}
            {wizardStep === 2 && (
              <div style={{ flex: 1, display: "flex", overflow: "hidden", background: "#0F172A" }}>
                {/* ── LEFT SIDEBAR: TEXT ELEMENTS SHORTCUTS ── */}
                <div style={{ width: 260, borderRight: "1px solid #334155", padding: "20px 16px", background: "#1E293B", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <Type size={16} color="#A855F7" /> Canvas Text Elements
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {canvasElements.map((el) => {
                      const isSel = selectedElementId === el.id;
                      return (
                        <div
                          key={el.id}
                          onClick={() => setSelectedElementId(el.id)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            background: isSel ? "#6D28D9" : "#0F172A",
                            color: "#ffffff",
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: "pointer",
                            border: isSel ? "1.5px solid #A855F7" : "1px solid #334155",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 170 }}>
                            {el.text}
                          </span>
                          <Move size={13} color={isSel ? "#fff" : "#64748B"} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Custom Text Button */}
                  <button
                    type="button"
                    onClick={handleAddCustomText}
                    style={{
                      marginTop: 16,
                      padding: "11px",
                      borderRadius: 10,
                      background: "#A855F7",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Plus size={16} /> Add Custom Text
                  </button>
                </div>

                {/* ── CENTER: CANVA INTERACTIVE CANVAS WITH LOCKED BACKGROUND ── */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    userSelect: "none",
                    position: "relative",
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  {/* Canvas Frame displaying exact uploaded template background */}
                  <div
                    ref={canvasRef}
                    onClick={() => setSelectedElementId(null)}
                    style={{
                      width: 840,
                      height: 580,
                      position: "relative",
                      borderRadius: 8,
                      overflow: "hidden",
                      boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
                      backgroundColor: "#ffffff",
                      background: selectedTemplate?.background_url
                        ? `url('${selectedTemplate.background_url}') center/cover no-repeat`
                        : "radial-gradient(circle at center, #ffffff 0%, #faf5ff 100%)",
                      border: "4px solid #6d28d9",
                    }}
                  >
                    {/* Locked Background Watermark Notice */}
                    <div style={{ position: "absolute", top: 8, left: 12, fontSize: 10, fontWeight: 800, color: "#64748b", background: "rgba(255,255,255,0.75)", padding: "3px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4, zIndex: 1 }}>
                      <Lock size={11} color="#6d28d9" /> Locked Template: {selectedTemplate?.name || "Default Gold Banner"}
                    </div>

                    {/* Canvas Text Elements Overlay */}
                    {canvasElements.map((el) => {
                      const isSel = selectedElementId === el.id;
                      const isEditing = editingInlineId === el.id;
                      const transformX = el.textAlign === "center" ? "-50%" : el.textAlign === "right" ? "-100%" : "0%";

                      return (
                        <div
                          key={el.id}
                          onMouseDown={(e) => handleMouseDown(e, el.id)}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingInlineId(el.id);
                          }}
                          style={{
                            position: "absolute",
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            transform: `translate(${transformX}, -50%)`,
                            fontFamily: el.fontFamily,
                            fontSize: `${el.fontSize}px`,
                            fontWeight: el.fontWeight,
                            fontStyle: el.fontStyle,
                            color: el.color,
                            textAlign: el.textAlign,
                            whiteSpace: "nowrap",
                            cursor: "move",
                            padding: "2px 6px",
                            border: isSel ? "2px solid #A855F7" : "1.5px dashed transparent",
                            borderRadius: 4,
                            background: isSel ? "rgba(168, 85, 247, 0.1)" : "transparent",
                            boxShadow: isSel ? "0 0 0 3px rgba(168, 85, 247, 0.2)" : "none",
                            zIndex: isSel ? 10 : 2,
                          }}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={el.text}
                              onChange={(e) => {
                                const newTxt = e.target.value;
                                setCanvasElements((prev) =>
                                  prev.map((item) => (item.id === el.id ? { ...item, text: newTxt } : item))
                                );
                              }}
                              onBlur={() => setEditingInlineId(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingInlineId(null);
                              }}
                              autoFocus
                              style={{
                                fontFamily: el.fontFamily,
                                fontSize: `${el.fontSize}px`,
                                fontWeight: el.fontWeight,
                                color: el.color,
                                background: "rgba(255,255,255,0.9)",
                                border: "1px solid #A855F7",
                                borderRadius: 4,
                                outline: "none",
                                padding: "0 4px",
                              }}
                            />
                          ) : (
                            el.text
                          )}

                          {/* Canva Selection Handles */}
                          {isSel && (
                            <>
                              <div style={{ position: "absolute", top: -4, left: -4, width: 8, height: 8, background: "#A855F7", borderRadius: "50%" }} />
                              <div style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, background: "#A855F7", borderRadius: "50%" }} />
                              <div style={{ position: "absolute", bottom: -4, left: -4, width: 8, height: 8, background: "#A855F7", borderRadius: "50%" }} />
                              <div style={{ position: "absolute", bottom: -4, right: -4, width: 8, height: 8, background: "#A855F7", borderRadius: "50%" }} />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── RIGHT SIDEBAR: CONTEXTUAL PROPERTIES PANEL ── */}
                <div style={{ width: 280, borderLeft: "1px solid #334155", padding: "20px 18px", background: "#1E293B", color: "#ffffff", overflowY: "auto" }}>
                  {selectedElement ? (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#A855F7", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                        Selected Element Properties
                      </div>

                      {/* Text Input */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 4 }}>
                          Text Value (Double-click on canvas to edit):
                        </label>
                        <input
                          type="text"
                          value={selectedElement.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCanvasElements((prev) =>
                              prev.map((el) => (el.id === selectedElement.id ? { ...el, text: val } : el))
                            );
                          }}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #A855F7", background: "#0F172A", color: "#fff", fontSize: 13, fontWeight: 700 }}
                        />
                      </div>

                      {/* Font Family */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 4 }}>
                          Font Family:
                        </label>
                        <select
                          value={selectedElement.fontFamily}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCanvasElements((prev) =>
                              prev.map((el) => (el.id === selectedElement.id ? { ...el, fontFamily: val } : el))
                            );
                          }}
                          style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #334155", background: "#0F172A", color: "#fff", fontSize: 12.5 }}
                        >
                          <option value="'Pinyon Script', cursive">Pinyon Calligraphy</option>
                          <option value="'Playfair Display', serif">Playfair Serif</option>
                          <option value="Cinzel, serif">Cinzel Classic</option>
                          <option value="Montserrat, sans-serif">Montserrat Clean</option>
                          <option value="Inter, sans-serif">Inter Standard</option>
                        </select>
                      </div>

                      {/* Font Size */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 4 }}>
                          <span>Font Size:</span>
                          <span>{selectedElement.fontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={12}
                          max={72}
                          value={selectedElement.fontSize}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCanvasElements((prev) =>
                              prev.map((el) => (el.id === selectedElement.id ? { ...el, fontSize: val } : el))
                            );
                          }}
                          style={{ width: "100%" }}
                        />
                      </div>

                      {/* Style & Alignment */}
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 16 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => {
                              const newWeight = selectedElement.fontWeight === 900 ? 700 : 900;
                              setCanvasElements((prev) =>
                                prev.map((el) => (el.id === selectedElement.id ? { ...el, fontWeight: newWeight } : el))
                              );
                            }}
                            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: selectedElement.fontWeight === 900 ? "#A855F7" : "#0F172A", color: "#fff", cursor: "pointer" }}
                          >
                            <Bold size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newStyle = selectedElement.fontStyle === "italic" ? "normal" : "italic";
                              setCanvasElements((prev) =>
                                prev.map((el) => (el.id === selectedElement.id ? { ...el, fontStyle: newStyle } : el))
                              );
                            }}
                            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: selectedElement.fontStyle === "italic" ? "#A855F7" : "#0F172A", color: "#fff", cursor: "pointer" }}
                          >
                            <Italic size={14} />
                          </button>
                        </div>

                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setCanvasElements((prev) =>
                                prev.map((el) => (el.id === selectedElement.id ? { ...el, textAlign: "left" } : el))
                              );
                            }}
                            style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #334155", background: selectedElement.textAlign === "left" ? "#A855F7" : "#0F172A", color: "#fff", cursor: "pointer" }}
                          >
                            <AlignLeft size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCanvasElements((prev) =>
                                prev.map((el) => (el.id === selectedElement.id ? { ...el, textAlign: "center" } : el))
                              );
                            }}
                            style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #334155", background: selectedElement.textAlign === "center" ? "#A855F7" : "#0F172A", color: "#fff", cursor: "pointer" }}
                          >
                            <AlignCenter size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCanvasElements((prev) =>
                                prev.map((el) => (el.id === selectedElement.id ? { ...el, textAlign: "right" } : el))
                              );
                            }}
                            style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #334155", background: selectedElement.textAlign === "right" ? "#A855F7" : "#0F172A", color: "#fff", cursor: "pointer" }}
                          >
                            <AlignRight size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Color Picker Swatches */}
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 6 }}>
                          Text Color:
                        </label>
                        <div style={{ display: "flex", gap: 8 }}>
                          {["#6d28d9", "#d97706", "#0f172a", "#10b981", "#ef4444", "#ffffff", "#000000"].map((c) => (
                            <div
                              key={c}
                              onClick={() => {
                                setCanvasElements((prev) =>
                                  prev.map((el) => (el.id === selectedElement.id ? { ...el, color: c } : el))
                                );
                              }}
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: c,
                                cursor: "pointer",
                                border: selectedElement.color === c ? "2px solid #A855F7" : "1px solid #475569",
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Delete Element Button */}
                      <button
                        type="button"
                        onClick={handleDeleteSelectedElement}
                        style={{
                          width: "100%",
                          padding: "9px",
                          borderRadius: 8,
                          background: "#FEF2F2",
                          color: "#EF4444",
                          border: "1px solid #FECACA",
                          fontWeight: 800,
                          fontSize: 12.5,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Trash2 size={14} /> Remove Element
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: "40px 10px", textAlign: "center", color: "#64748B" }}>
                      <Move size={32} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8" }}>No Element Selected</div>
                      <p style={{ fontSize: 12, marginTop: 4 }}>Click any text element on the canvas to edit its properties, drag position, or font styling.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Bottom Bar for Step 2 */}
            {wizardStep === 2 && (
              <div style={{ padding: "14px 24px", borderTop: "1px solid #E2E8F0", background: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 700, color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <ArrowLeft size={16} /> Back to Template Selection
                </button>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setIssuingReg(null)}
                    style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 700, color: "#334155", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteIssue}
                    disabled={issuingInProgress}
                    style={{
                      padding: "10px 26px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                      fontWeight: 900,
                      color: "#fff",
                      cursor: issuingInProgress ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(109, 40, 217, 0.3)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Sparkles size={16} /> {issuingInProgress ? "Issuing..." : "Issue Certificate"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: REISSUE CERTIFICATE ── */}
      {reissuingCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 540, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <RotateCcw size={22} color="#D97706" />
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>Reissue Certificate</h3>
                  <div style={{ fontSize: 12.5, color: "#64748B" }}>Existing Cert #: <strong>{reissuingCert.certificate_number}</strong></div>
                </div>
              </div>
              <button type="button" onClick={() => setReissuingCert(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} color="#94A3B8" /></button>
            </div>

            <div style={{ background: "#FEF3C7", padding: "12px 16px", borderRadius: 12, marginBottom: 20, border: "1px solid #FCD34D", fontSize: 13, color: "#B45309" }}>
              ⚠️ <strong>Notice:</strong> Reissuing will mark the previous certificate ({reissuingCert.certificate_number}) as Revoked, issue an updated certificate version, and record an audit entry.
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>
                Mandatory Reissue Reason:
              </label>
              <input
                type="text"
                value={reissueReason}
                onChange={(e) => setReissueReason(e.target.value)}
                placeholder="e.g. Corrected spelling of participant surname"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button type="button" onClick={() => setReissuingCert(null)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 700, color: "#334155", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReissue}
                disabled={reissueInProgress}
                style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "#D97706", fontWeight: 900, color: "#fff", cursor: reissueInProgress ? "not-allowed" : "pointer" }}
              >
                {reissueInProgress ? "Reissuing..." : "Confirm & Reissue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REVOKE CERTIFICATE ── */}
      {revokingCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FEE2E2", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ban size={26} color="#EF4444" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>Revoke Certificate?</h3>
              <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
                Are you sure you want to mark certificate <strong>{revokingCert.certificate_number}</strong> as Revoked?
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                Revocation Reason:
              </label>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Disqualified by jury committee"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" onClick={() => setRevokingCert(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #CBD5E1", background: "#fff", fontWeight: 800, color: "#334155", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={handleExecuteRevoke} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "#EF4444", fontWeight: 800, color: "#fff", cursor: "pointer" }}>
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW CERTIFICATE ── */}
      {viewingCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 24, width: "100%", maxWidth: 1040, height: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Award size={24} color="#6D28D9" />
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>Official Certificate View</h3>
                  <div style={{ fontSize: 12.5, color: "#64748B" }}>Cert #: <strong>{viewingCert.certificate_number}</strong> | Recipient: <strong>{viewingCert.participant_name}</strong></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {viewingCert.status === "issued" && (
                  <button
                    type="button"
                    onClick={() => handleDownloadCertificate(viewingCert)}
                    style={{ padding: "8px 16px", borderRadius: 10, background: "#6D28D9", color: "#fff", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <Download size={15} /> Download PDF
                  </button>
                )}
                <button type="button" onClick={() => setViewingCert(null)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                  <X size={22} color="#94A3B8" />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, padding: 16, background: "#0F172A", borderRadius: "0 0 24px 24px", overflow: "hidden" }}>
              <iframe
                srcDoc={
                  viewingCert.certificate_url.startsWith("data:text/html;charset=utf-8,")
                    ? decodeURIComponent(viewingCert.certificate_url.replace("data:text/html;charset=utf-8,", ""))
                    : viewingCert.certificate_url
                }
                style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
                title="Certificate View Frame"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE CERTIFICATE ── */}
      {deletingCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FEE2E2", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={26} color="#EF4444" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>Delete Certificate Record?</h3>
              <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
                Are you sure you want to delete certificate <strong>{deletingCert.certificate_number}</strong>?
              </p>
            </div>

            <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: 12, marginBottom: 24, border: "1px solid #E2E8F0", fontSize: 13, color: "#475569" }}>
              <ShieldCheck size={16} color="#10B981" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }} />
              <strong>Safety Assurance:</strong> Deletes ONLY the certificate record. Registration history and participant profiles remain 100% intact.
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" onClick={() => setDeletingCert(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #CBD5E1", background: "#fff", fontWeight: 800, color: "#334155", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={handleDeleteCertificate} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "#EF4444", fontWeight: 800, color: "#fff", cursor: "pointer" }}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
