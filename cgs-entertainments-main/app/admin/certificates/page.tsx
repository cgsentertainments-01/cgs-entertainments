"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Printer,
  Share2,
  Clock,
  ChevronRight,
  Filter,
  Layers,
  Calendar,
  User,
  Medal,
  Info,
} from "lucide-react";
import {
  formatResultLabel,
  formatCertificateTypeLabel,
  CertificateSnapshotData,
  CanvaTextElement,
  CertificateHistoryItem,
  renderCertificateHTMLFromSnapshot,
} from "@/lib/certificate";

interface CertificateRecord {
  id: string;
  certificate_number: string;
  registration_id: string;
  participant_id: string;
  event_id: string;
  round_id?: string | null;
  template_id?: string | null;
  certificate_type: string;
  certificate_type_label?: string;
  certificate_url: string;
  verification_token: string;
  status: string; // 'draft' | 'pending' | 'issued' | 'revoked'
  issued_at: string;
  created_at: string;
  revoke_reason?: string | null;
  reissued_from_id?: string | null;
  history?: CertificateHistoryItem[];
  snapshot_data?: CertificateSnapshotData | null;

  participant_name: string;
  participant_number: string;
  participant_email: string;
  registration_number: string;
  event_title: string;
  event_date: string | null;
  venue: string | null;
  category_name: string;
  competition_name: string;
  round_name: string;
  participation_type: string;
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
  category_id: string;
  category_name: string;
  competition_name: string;
  participation_type: string;
  result_type: string;
  position?: number | null;
  score?: number | null;
  is_eligible: boolean;
  already_has_cert: boolean;
  certificate_type: string | null;
  eligibility_reason: string | null;
}

interface TemplateItem {
  id: string;
  name: string;
  certificate_type?: string;
  background_url: string;
  orientation?: string;
  is_active?: boolean;
  is_default?: boolean;
}

interface Counters {
  total_certificates: number;
  total_generated: number;
  issued: number;
  pending: number;
  draft: number;
  revoked: number;
  winner: number;
  runner_up: number;
  finalist: number;
  appreciation: number;
  participation: number;
  achievement: number;
}

function AdminCertificatesDashboardContent() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("eventId") || searchParams.get("event_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [eligibleRegs, setEligibleRegs] = useState<EligibleRegistration[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [counters, setCounters] = useState<Counters>({
    total_certificates: 0,
    total_generated: 0,
    issued: 0,
    pending: 0,
    draft: 0,
    revoked: 0,
    winner: 0,
    runner_up: 0,
    finalist: 0,
    appreciation: 0,
    participation: 0,
    achievement: 0,
  });

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState(eventIdParam || "all");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [issueDateFilter, setIssueDateFilter] = useState("");

  const [filterOptions, setFilterOptions] = useState<{
    events: string[];
    competitions: string[];
    certificate_types: string[];
    statuses: string[];
  }>({
    events: [],
    competitions: [],
    certificate_types: ["winner", "runner_up", "finalist", "appreciation", "participation", "achievement", "custom"],
    statuses: ["issued", "pending", "draft", "revoked"],
  });

  // Selection for Bulk Issuance
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([]);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);

  // Guided Certificate Issuance Workflow Modal State
  const [showIssueWorkflow, setShowIssueWorkflow] = useState(false);
  const [workflowStep, setWorkflowStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [wfSelectedEventId, setWfSelectedEventId] = useState<string>(eventIdParam || "all");
  const [wfSelectedCompId, setWfSelectedCompId] = useState<string>("all");
  const [wfSelectedRound, setWfSelectedRound] = useState<string>("Final Round");
  const [wfSelectedResultType, setWfSelectedResultType] = useState<string>("all");
  const [wfSelectedRegs, setWfSelectedRegs] = useState<EligibleRegistration[]>([]);
  const [wfSelectedCertType, setWfSelectedCertType] = useState<string>("winner");
  const [wfSelectedTemplate, setWfSelectedTemplate] = useState<TemplateItem | null>(null);
  const [canvasElements, setCanvasElements] = useState<CanvaTextElement[]>([]);
  const [issuingInProgress, setIssuingInProgress] = useState<boolean>(false);

  // Duplicate Warning Modal State
  const [duplicateWarning, setDuplicateWarning] = useState<{
    reg: EligibleRegistration;
    existingCert: any;
  } | null>(null);

  // Certificate Details Drawer State
  const [selectedCertDetail, setSelectedCertDetail] = useState<CertificateRecord | null>(null);

  // Reissue & Revoke Modal State
  const [reissuingCert, setReissuingCert] = useState<CertificateRecord | null>(null);
  const [reissueReason, setReissueReason] = useState<string>("");
  const [reissueInProgress, setReissueInProgress] = useState<boolean>(false);

  const [revokingCert, setRevokingCert] = useState<CertificateRecord | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>("");

  const [deletingCert, setDeletingCert] = useState<CertificateRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCertificatesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = eventIdParam && eventIdParam !== "all"
        ? `/api/certificates?eventId=${encodeURIComponent(eventIdParam)}`
        : "/api/certificates";

      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCertificates(data.certificates || []);
          setEligibleRegs(data.eligibleRegistrations || []);
          setTemplates(data.templates || []);
          if (data.counters) setCounters(data.counters);
          if (data.filterOptions) setFilterOptions(data.filterOptions);
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
  }, [eventIdParam]);

  useEffect(() => {
    fetchCertificatesData();
  }, []);

  // Main View Mode Tab ("eligible" | "issued" | "all")
  const [activeViewTab, setActiveViewTab] = useState<"eligible" | "issued" | "all">("eligible");

  // Filtered Certificates for Main Table
  const filteredCertificates = certificates.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.participant_name.toLowerCase().includes(q) ||
      c.certificate_number.toLowerCase().includes(q) ||
      c.participant_number.toLowerCase().includes(q) ||
      c.registration_number.toLowerCase().includes(q) ||
      c.event_title.toLowerCase().includes(q) ||
      c.category_name.toLowerCase().includes(q);

    const matchesEvent = eventFilter === "all" || c.event_title === eventFilter;
    const matchesComp = competitionFilter === "all" || c.category_name === competitionFilter;
    const matchesType = typeFilter === "all" || c.certificate_type === typeFilter;
    const matchesResult = resultFilter === "all" || c.result_type === resultFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesDate = !issueDateFilter || (c.issued_at && c.issued_at.startsWith(issueDateFilter));

    return matchesSearch && matchesEvent && matchesComp && matchesType && matchesResult && matchesStatus && matchesDate;
  });

  // Filtered Eligible Winners / Results for Eligible Tab
  const filteredEligibleRegs = eligibleRegs.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.participant_name.toLowerCase().includes(q) ||
      r.participant_number.toLowerCase().includes(q) ||
      r.registration_number.toLowerCase().includes(q) ||
      r.event_title.toLowerCase().includes(q) ||
      r.category_name.toLowerCase().includes(q);

    const matchesEvent = eventFilter === "all" || r.event_title === eventFilter;
    const matchesComp = competitionFilter === "all" || r.category_name === competitionFilter;
    const matchesResult = resultFilter === "all" || r.result_type === resultFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "issued" && r.already_has_cert) ||
      (statusFilter === "pending" && !r.already_has_cert);

    return matchesSearch && matchesEvent && matchesComp && matchesResult && matchesStatus && r.is_eligible;
  });

  // Open Certificate Details Drawer
  const openDetailsDrawer = async (cert: CertificateRecord) => {
    setSelectedCertDetail(cert);
    // Optionally fetch full history if missing
    try {
      const res = await fetch(`/api/certificates/${cert.id}`);
      const data = await res.json();
      if (res.ok && data.success && data.certificate) {
        setSelectedCertDetail(data.certificate);
      }
    } catch {}
  };

  // Launch Guided Issue Workflow
  const openIssueWorkflow = () => {
    setWorkflowStep(1);
    setWfSelectedEventId("all");
    setWfSelectedCompId("all");
    setWfSelectedRound("Final Round");
    setWfSelectedResultType("all");
    setWfSelectedRegs([]);
    setWfSelectedCertType("winner");

    // Default matching template
    const defaultTpl = templates.find((t) => t.is_default || t.is_active !== false) || templates[0] || null;
    setWfSelectedTemplate(defaultTpl);
    setShowIssueWorkflow(true);
  };

  // Quick 1-Click Issue Certificate for an Eligible Winner
  const handleQuickIssueCertificate = (reg: EligibleRegistration) => {
    setWorkflowStep(5);
    setWfSelectedEventId(reg.event_title);
    setWfSelectedCompId(reg.category_name);
    setWfSelectedRegs([reg]);
    setWfSelectedCertType(reg.certificate_type || "winner");

    const defaultTpl = templates.find((t) => t.is_default || t.is_active !== false) || templates[0] || null;
    setWfSelectedTemplate(defaultTpl);
    initializeCanvasElements(reg, reg.certificate_type || "winner");
    setShowIssueWorkflow(true);
  };

  // Initialize Canva Canvas elements for single/bulk issuance preview
  const initializeCanvasElements = (sampleReg: EligibleRegistration, certType: string) => {
    const resultBadgeStr = formatResultLabel(sampleReg.result_type).badge;
    const issueDateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const titleText = formatCertificateTypeLabel(certType);

    const initialElements: CanvaTextElement[] = [
      { id: "org", field_key: "organization_name", text: "CGS ENTERTAINMENTS", x: 50, y: 10, fontFamily: "Cinzel, serif", fontSize: 20, fontWeight: 900, fontStyle: "normal", color: "#6d28d9", textAlign: "center" },
      { id: "title", field_key: "certificate_title", text: titleText, x: 50, y: 19, fontFamily: "Cinzel, serif", fontSize: 28, fontWeight: 900, fontStyle: "normal", color: "#0f172a", textAlign: "center" },
      { id: "subtitle", field_key: "subtitle", text: "THIS IS PROUDLY PRESENTED TO", x: 50, y: 28, fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 700, fontStyle: "normal", color: "#64748b", textAlign: "center" },
      { id: "name", field_key: "participant_name", text: sampleReg.participant_name, x: 50, y: 41, fontFamily: "'Pinyon Script', cursive", fontSize: 54, fontWeight: 700, fontStyle: "normal", color: "#6d28d9", textAlign: "center" },
      { id: "pid", field_key: "participant_number", text: `ID: ${sampleReg.participant_number}`, x: 50, y: 52, fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 800, color: "#475569", fontStyle: "normal", textAlign: "center" },
      { id: "event", field_key: "event_title", text: `For performance in ${sampleReg.event_title} (${sampleReg.category_name})`, x: 50, y: 61, fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 600, color: "#334155", fontStyle: "normal", textAlign: "center" },
      { id: "result", field_key: "result_label", text: resultBadgeStr, x: 50, y: 70, fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 800, color: "#d97706", fontStyle: "normal", textAlign: "center" },
      { id: "cert_no", field_key: "certificate_number", text: "Cert #: CGS-CERT-2026-AUTO", x: 20, y: 88, fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#64748b", fontStyle: "normal", textAlign: "left" },
      { id: "date", field_key: "issue_date", text: `Issue Date: ${issueDateStr}`, x: 50, y: 88, fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#64748b", fontStyle: "normal", textAlign: "center" },
      { id: "sig", field_key: "authorized_signatory", text: "Signature: CGS Management", x: 80, y: 88, fontFamily: "'Pinyon Script', cursive", fontSize: 22, fontWeight: 700, color: "#0f172a", fontStyle: "normal", textAlign: "right" },
    ];
    setCanvasElements(initialElements);
  };

  // Handle Issuing Workflow Next Step
  const handleNextWorkflowStep = () => {
    if (workflowStep === 4 && wfSelectedRegs.length === 0) {
      alert("Please select at least one qualified participant to issue certificates.");
      return;
    }
    if (workflowStep === 4 && wfSelectedRegs.length > 0) {
      // Check duplicate status for selected participants
      const sample = wfSelectedRegs[0];
      initializeCanvasElements(sample, wfSelectedCertType);
    }
    setWorkflowStep((prev) => (prev < 6 ? ((prev + 1) as any) : prev));
  };

  // Execute Bulk/Single Certificate Issuance
  const handleExecuteWorkflowIssue = async () => {
    if (wfSelectedRegs.length === 0) return;

    try {
      setIssuingInProgress(true);
      const regIds = wfSelectedRegs.map((r) => r.registration_id);

      const nameEl = canvasElements.find((el) => el.id === "name" || el.field_key === "participant_name");
      const titleEl = canvasElements.find((el) => el.id === "title" || el.field_key === "certificate_title");
      const sigEl = canvasElements.find((el) => el.id === "sig" || el.field_key === "authorized_signatory");
      const dateEl = canvasElements.find((el) => el.id === "date" || el.field_key === "issue_date");

      const payload = {
        registration_ids: regIds,
        template_id: wfSelectedTemplate?.id || null,
        background_url: wfSelectedTemplate?.background_url || null,
        certificate_type_override: wfSelectedCertType,
        certificate_title: titleEl?.text || formatCertificateTypeLabel(wfSelectedCertType),
        authorized_signatory: sigEl?.text || "CGS Management",
        custom_issue_date: dateEl?.text || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        text_elements: canvasElements,
        round_name: wfSelectedRound,
      };

      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Issued ${data.issued_count || regIds.length} certificate(s) successfully!`);
        setShowIssueWorkflow(false);
        fetchCertificatesData();
      } else if (res.status === 409 && data.already_issued) {
        setDuplicateWarning({
          reg: wfSelectedRegs[0],
          existingCert: data.existingCertificate,
        });
      } else {
        alert(`Error issuing certificate: ${data.error || "Unable to issue"}`);
      }
    } catch (err) {
      console.error("Workflow issue error:", err);
      alert("Network error issuing certificates.");
    } finally {
      setIssuingInProgress(false);
    }
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
        if (selectedCertDetail?.id === reissuingCert.id) {
          setSelectedCertDetail(data.certificate);
        }
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
        if (selectedCertDetail?.id === revokingCert.id) {
          setSelectedCertDetail({ ...selectedCertDetail, status: "revoked" });
        }
        fetchCertificatesData();
      } else {
        alert(`Error revoking certificate: ${data.error || "Unable to revoke"}`);
      }
    } catch (err) {
      console.error("Revoke error:", err);
      alert("Network error revoking certificate.");
    }
  };

  // Delete Certificate Record
  const handleDeleteCertificate = async () => {
    if (!deletingCert) return;
    try {
      const res = await fetch(`/api/certificates?id=${deletingCert.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Certificate ${deletingCert.certificate_number} deleted.`);
        setDeletingCert(null);
        if (selectedCertDetail?.id === deletingCert.id) setSelectedCertDetail(null);
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
  const handleDownloadCertificate = (cert: CertificateRecord) => {
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

  // Filter options lists
  const availableEvents = filterOptions.events;
  const availableCompetitions = filterOptions.competitions;

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

      {/* Top Header & Quick Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4, display: "flex", alignItems: "center", gap: 10 }}>
            <Award size={28} color="#6D28D9" /> Certificate Management System
          </h1>
          <p style={{ fontSize: 14.5, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Issue, verify, preview, reissue, and manage official digital certificates for all event competitions.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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

          <button
            type="button"
            onClick={openIssueWorkflow}
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
            <Plus size={18} /> Issue Certificates
          </button>

          <Link
            href="/admin/certificates/templates"
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
            <LayoutTemplate size={16} /> Certificate Templates
          </Link>

          <Link
            href="/certificates/verify"
            target="_blank"
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              background: "#F8FAFC",
              color: "#475569",
              border: "1px solid #CBD5E1",
              fontSize: 14,
              fontWeight: 800,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShieldCheck size={16} /> QR Verification Portal <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* ── 1. CERTIFICATIONS DASHBOARD TOP SUMMARY CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: 18, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>Total Certificates</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#0F172A", marginTop: 6 }}>{counters.total_certificates}</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>System credentials tracked</div>
        </div>

        <div style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0", borderRadius: 18, padding: "20px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#047857", textTransform: "uppercase", letterSpacing: 0.5 }}>Issued</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#059669", marginTop: 6 }}>{counters.issued}</div>
          <div style={{ fontSize: 12, color: "#10B981", marginTop: 4 }}>Active &amp; verified</div>
        </div>

        <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 18, padding: "20px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: 0.5 }}>Pending</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#2563EB", marginTop: 6 }}>{counters.pending}</div>
          <div style={{ fontSize: 12, color: "#3B82F6", marginTop: 4 }}>Awaiting issue</div>
        </div>

        <div style={{ background: "#F8FAFC", border: "1.5px solid #CBD5E1", borderRadius: 18, padding: "20px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Draft</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#334155", marginTop: 6 }}>{counters.draft}</div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Unpublished drafts</div>
        </div>

        <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 18, padding: "20px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#991B1B", textTransform: "uppercase", letterSpacing: 0.5 }}>Revoked</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#EF4444", marginTop: 6 }}>{counters.revoked}</div>
          <div style={{ fontSize: 12, color: "#F87171", marginTop: 4 }}>Superseded / cancelled</div>
        </div>
      </div>

      {/* ── 2. CERTIFICATE FILTERS & SEARCH BAR ── */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          border: "1.5px solid #E2E8F0",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginBottom: 24,
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
        }}
      >
        {/* Search Input */}
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by Participant Name, Registration ID, or Certificate ID (e.g. CGS-CERT-00125)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 44px",
              borderRadius: 12,
              border: "1.5px solid #E2E8F0",
              fontSize: 14,
              fontWeight: 600,
              outline: "none",
              background: "#F8FAFC",
              color: "#0F172A",
            }}
          />
        </div>

        {/* Dropdown Filters Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#64748B", marginBottom: 4, textTransform: "uppercase" }}>Event</label>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13, fontWeight: 700, background: "#fff", color: "#0F172A" }}
            >
              <option value="all">All Events</option>
              {availableEvents.map((ev) => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#64748B", marginBottom: 4, textTransform: "uppercase" }}>Competition</label>
            <select
              value={competitionFilter}
              onChange={(e) => setCompetitionFilter(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13, fontWeight: 700, background: "#fff", color: "#0F172A" }}
            >
              <option value="all">All Competitions</option>
              {availableCompetitions.map((comp) => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#64748B", marginBottom: 4, textTransform: "uppercase" }}>Certificate Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13, fontWeight: 700, background: "#fff", color: "#0F172A" }}
            >
              <option value="all">All Types</option>
              <option value="winner">Winner</option>
              <option value="runner_up">Runner-up</option>
              <option value="finalist">Finalist</option>
              <option value="appreciation">Appreciation</option>
              <option value="participation">Participation</option>
              <option value="achievement">Achievement</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#64748B", marginBottom: 4, textTransform: "uppercase" }}>Result</label>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13, fontWeight: 700, background: "#fff", color: "#0F172A" }}
            >
              <option value="all">All Results</option>
              <option value="winner">Winner</option>
              <option value="runner_up">Runner-up</option>
              <option value="finalist">Finalist</option>
              <option value="special_mention">Special Mention</option>
              <option value="participant">Participant</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#64748B", marginBottom: 4, textTransform: "uppercase" }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13, fontWeight: 700, background: "#fff", color: "#0F172A" }}
            >
              <option value="all">All Statuses</option>
              <option value="issued">Issued</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#64748B", marginBottom: 4, textTransform: "uppercase" }}>Issue Date</label>
            <input
              type="date"
              value={issueDateFilter}
              onChange={(e) => setIssueDateFilter(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13, fontWeight: 700, background: "#fff" }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: "#FEF2F2", color: "#991B1B", borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── VIEW MODE TAB SWITCHER BAR ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, borderBottom: "2px solid #E2E8F0", paddingBottom: 12, overflowX: "auto" }}>
        <button
          type="button"
          onClick={() => setActiveViewTab("eligible")}
          style={{
            padding: "10px 20px",
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeViewTab === "eligible" ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" : "#F1F5F9",
            color: activeViewTab === "eligible" ? "#ffffff" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: activeViewTab === "eligible" ? "0 4px 14px rgba(124,58,237,0.25)" : "none",
            whiteSpace: "nowrap",
          }}
        >
          <Award size={16} /> Eligible Winners &amp; Results ({eligibleRegs.filter((r) => r.is_eligible).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab("issued")}
          style={{
            padding: "10px 20px",
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeViewTab === "issued" ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" : "#F1F5F9",
            color: activeViewTab === "issued" ? "#ffffff" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: activeViewTab === "issued" ? "0 4px 14px rgba(124,58,237,0.25)" : "none",
            whiteSpace: "nowrap",
          }}
        >
          <CheckCircle2 size={16} /> Issued Certificates ({certificates.filter((c) => c.status === "issued").length})
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab("all")}
          style={{
            padding: "10px 20px",
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeViewTab === "all" ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" : "#F1F5F9",
            color: activeViewTab === "all" ? "#ffffff" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: activeViewTab === "all" ? "0 4px 14px rgba(124,58,237,0.25)" : "none",
            whiteSpace: "nowrap",
          }}
        >
          <Layers size={16} /> All System Credentials ({certificates.length})
        </button>
      </div>

      {/* ── 3. CERTIFICATE TABLE / ELIGIBLE WINNERS TABLE ── */}
      <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
        {activeViewTab === "eligible" ? (
          /* ── TAB 1: ELIGIBLE WINNERS & RESULTS TABLE ── */
          <div>
            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#6B7280", fontWeight: 700 }}>
                Loading eligible competition results from database...
              </div>
            ) : filteredEligibleRegs.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center", color: "#64748B" }}>
                <Award size={48} color="#CBD5E1" style={{ margin: "0 auto 14px" }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>No Eligible Competition Results Found</h3>
                <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
                  Mark participants as Winners or 1st/2nd/3rd Place in <strong>Admin → Results</strong> to make them appear here automatically.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0" }}>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Participant / Team</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Event</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Competition</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Reg ID</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Result</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Rank &amp; Score</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Certificate Status</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEligibleRegs.map((reg) => {
                      const resMeta = formatResultLabel(reg.result_type);
                      return (
                        <tr key={reg.registration_id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "16px 18px" }}>
                            <div style={{ fontWeight: 800, color: "#0F172A" }}>{reg.participant_name}</div>
                            <div style={{ fontSize: 12, color: "#64748B" }}>{reg.participant_number}</div>
                          </td>
                          <td style={{ padding: "16px 18px", fontWeight: 700, color: "#334155" }}>{reg.event_title}</td>
                          <td style={{ padding: "16px 18px", color: "#475569", fontWeight: 600 }}>{reg.category_name}</td>
                          <td style={{ padding: "16px 18px", fontWeight: 800, color: "#7C3AED", fontFamily: "monospace" }}>{reg.registration_number}</td>
                          <td style={{ padding: "16px 18px" }}>
                            <span style={{ fontSize: 12.5, fontWeight: 800, color: resMeta.color, background: resMeta.bg, padding: "4px 10px", borderRadius: 8 }}>
                              {resMeta.badge}
                            </span>
                          </td>
                          <td style={{ padding: "16px 18px", color: "#334155", fontWeight: 700 }}>
                            {reg.position ? `#${reg.position}` : "-"} {reg.score !== null && reg.score !== undefined ? `(${reg.score} pts)` : ""}
                          </td>
                          <td style={{ padding: "16px 18px" }}>
                            {reg.already_has_cert ? (
                              <span style={{ fontSize: 11.5, fontWeight: 900, background: "#ECFDF5", color: "#047857", padding: "4px 10px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <CheckCircle2 size={13} /> Certificate Issued
                              </span>
                            ) : (
                              <span style={{ fontSize: 11.5, fontWeight: 900, background: "#FEF3C7", color: "#B45309", padding: "4px 10px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <Clock size={13} /> Eligible - Not Issued
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "16px 18px", textAlign: "right" }}>
                            {reg.already_has_cert ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const cert = certificates.find((c) => c.registration_id === reg.registration_id);
                                  if (cert) openDetailsDrawer(cert);
                                }}
                                style={{ padding: "6px 12px", borderRadius: 8, background: "#F1F5F9", border: "1px solid #CBD5E1", fontSize: 12, fontWeight: 800, color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                              >
                                <Eye size={13} color="#7C3AED" /> View Certificate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleQuickIssueCertificate(reg)}
                                style={{ padding: "6px 14px", borderRadius: 8, background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", color: "#fff", border: "none", fontSize: 12, fontWeight: 900, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                              >
                                <Award size={13} /> Issue Certificate
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* ── TAB 2 & 3: ISSUED / ALL SYSTEM CERTIFICATES TABLE ── */
          <div>
            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#6B7280", fontWeight: 700 }}>
                Loading certificates from database...
              </div>
            ) : filteredCertificates.length === 0 ? (
              /* ── PROFESSIONAL EMPTY STATES ── */
              <div style={{ padding: "60px 24px", textAlign: "center", color: "#64748B" }}>
                <Award size={48} color="#94A3B8" style={{ margin: "0 auto 14px", opacity: 0.5 }} />
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
                  {certificates.length === 0 ? "No certificates issued yet." : "No certificates found for the selected filters."}
                </h3>
                <p style={{ fontSize: 14, color: "#64748B", maxWidth: 440, margin: "0 auto 20px" }}>
                  {certificates.length === 0
                    ? "Select eligible participants from competition results and generate official certificates."
                    : "Try resetting your search or dropdown filter parameters to view matching certificate records."}
                </p>
                {certificates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setEventFilter("all");
                      setCompetitionFilter("all");
                      setTypeFilter("all");
                      setResultFilter("all");
                      setStatusFilter("all");
                      setIssueDateFilter("");
                    }}
                    style={{ padding: "10px 20px", borderRadius: 12, background: "#6D28D9", color: "#fff", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0" }}>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Certificate ID</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Participant</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Event</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Competition</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Result</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Certificate Type</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Issued Date</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertificates.map((cert) => {
                      const resultMeta = formatResultLabel(cert.result_type);
                      const issueDateStr = cert.issued_at
                        ? new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "Draft";

                      return (
                        <tr
                          key={cert.id}
                          style={{
                            borderBottom: "1px solid #F1F5F9",
                            transition: "background 0.15s ease",
                          }}
                          className="hover:bg-slate-50"
                        >
                          <td style={{ padding: "16px 18px", fontWeight: 800, color: "#6D28D9", fontFamily: "monospace" }}>
                            <button
                              type="button"
                              onClick={() => openDetailsDrawer(cert)}
                              style={{ background: "none", border: "none", padding: 0, color: "#6D28D9", fontWeight: 800, cursor: "pointer", textDecoration: "underline" }}
                            >
                              {cert.certificate_number}
                            </button>
                          </td>

                          <td style={{ padding: "16px 18px" }}>
                            <div style={{ fontWeight: 800, color: "#0F172A" }}>{cert.participant_name}</div>
                            <div style={{ fontSize: 12, color: "#64748B" }}>{cert.participant_number}</div>
                          </td>

                          <td style={{ padding: "16px 18px", fontWeight: 700, color: "#334155" }}>
                            {cert.event_title}
                          </td>

                          <td style={{ padding: "16px 18px", color: "#475569", fontWeight: 600 }}>
                            {cert.category_name || cert.competition_name}
                          </td>

                          <td style={{ padding: "16px 18px" }}>
                            <span style={{ fontSize: 12.5, fontWeight: 800, color: resultMeta.color, background: resultMeta.bg, padding: "4px 10px", borderRadius: 8 }}>
                              {resultMeta.badge}
                            </span>
                          </td>

                          <td style={{ padding: "16px 18px", fontWeight: 700, color: "#0F172A" }}>
                            {formatCertificateTypeLabel(cert.certificate_type)}
                          </td>

                          <td style={{ padding: "16px 18px", color: "#64748B", fontWeight: 600 }}>
                            {issueDateStr}
                          </td>

                          <td style={{ padding: "16px 18px" }}>
                            <span
                              style={{
                                fontSize: 11.5,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                padding: "4px 10px",
                                borderRadius: 8,
                                background:
                                  cert.status === "issued"
                                    ? "#ECFDF5"
                                    : cert.status === "revoked"
                                    ? "#FEF2F2"
                                    : cert.status === "pending"
                                    ? "#EFF6FF"
                                    : "#F8FAFC",
                                color:
                                  cert.status === "issued"
                                    ? "#047857"
                                    : cert.status === "revoked"
                                    ? "#EF4444"
                                    : cert.status === "pending"
                                    ? "#1D4ED8"
                                    : "#64748B",
                              }}
                            >
                              {cert.status}
                            </span>
                          </td>

                          {/* Row Actions */}
                          <td style={{ padding: "16px 18px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                onClick={() => openDetailsDrawer(cert)}
                                style={{ padding: "6px 10px", borderRadius: 8, background: "#F1F5F9", border: "1px solid #CBD5E1", fontSize: 12, fontWeight: 800, color: "#334155", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                              >
                                <Eye size={13} color="#6D28D9" /> View
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadCertificate(cert)}
                                style={{ padding: "6px 10px", borderRadius: 8, background: "#FAF5FF", border: "1px solid #E9D5FF", fontSize: 12, fontWeight: 800, color: "#6D28D9", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                              >
                                <Download size={13} /> Print/PDF
                              </button>

                              {cert.status === "issued" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReissuingCert(cert);
                                      setReissueReason("");
                                    }}
                                    style={{ padding: "6px 10px", borderRadius: 8, background: "#FEF3C7", border: "1px solid #FCD34D", fontSize: 12, fontWeight: 800, color: "#B45309", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                                  >
                                    <RotateCcw size={13} /> Reissue
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRevokingCert(cert);
                                      setRevokeReason("");
                                    }}
                                    style={{ padding: "6px 10px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", fontSize: 12, fontWeight: 800, color: "#EF4444", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                                  >
                                    <Ban size={13} /> Revoke
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 4. CERTIFICATE DETAILS DRAWER ── */}
      {selectedCertDetail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end", zIndex: 9999 }}>
          <div style={{ background: "#ffffff", width: "100%", maxWidth: 720, height: "100vh", overflowY: "auto", padding: 32, boxShadow: "-10px 0 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1.5px solid #F1F5F9", paddingBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#6D28D9", textTransform: "uppercase", letterSpacing: 1 }}>Certificate Details Drawer</span>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: "2px 0 0" }}>{selectedCertDetail.certificate_number}</h2>
                </div>
                <button type="button" onClick={() => setSelectedCertDetail(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={24} color="#94A3B8" /></button>
              </div>

              {/* Grid Metadata */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", background: "#F8FAFC", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Participant</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginTop: 2 }}>{selectedCertDetail.participant_name}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Registration ID</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#6D28D9", marginTop: 2, fontFamily: "monospace" }}>{selectedCertDetail.registration_number}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Event</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{selectedCertDetail.event_title}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Competition</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{selectedCertDetail.category_name || selectedCertDetail.competition_name}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Participation Type</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#334155", marginTop: 2 }}>{selectedCertDetail.participation_type || "Solo"}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Round</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#334155", marginTop: 2 }}>{selectedCertDetail.round_name || "Final"}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Result</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: formatResultLabel(selectedCertDetail.result_type).color, marginTop: 2 }}>{formatResultLabel(selectedCertDetail.result_type).badge}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Certificate Type</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{formatCertificateTypeLabel(selectedCertDetail.certificate_type)}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Issued Date</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginTop: 2 }}>{selectedCertDetail.issued_at ? new Date(selectedCertDetail.issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Status</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: selectedCertDetail.status === "issued" ? "#059669" : "#EF4444", marginTop: 2, textTransform: "uppercase" }}>{selectedCertDetail.status}</div>
                </div>
              </div>

              {/* Large Certificate Preview */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>Certificate Preview</h3>
                <div style={{ width: "100%", height: 340, borderRadius: 16, overflow: "hidden", border: "1.5px solid #CBD5E1", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
                  <iframe
                    srcDoc={
                      selectedCertDetail.certificate_url?.startsWith("data:text/html;charset=utf-8,")
                        ? decodeURIComponent(selectedCertDetail.certificate_url.replace("data:text/html;charset=utf-8,", ""))
                        : selectedCertDetail.certificate_url
                    }
                    style={{ width: "100%", height: "100%", border: "none" }}
                    title="Certificate Preview"
                  />
                </div>
              </div>

              {/* ── 12. CERTIFICATE HISTORY AUDIT TRAIL ── */}
              <div style={{ marginBottom: 24, background: "#F8FAFC", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0" }}>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: "#0F172A", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={16} color="#6D28D9" /> Audit &amp; Issuance History
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {selectedCertDetail.history && selectedCertDetail.history.length > 0 ? (
                    selectedCertDetail.history.map((h, i) => (
                      <div key={h.id || i} style={{ display: "flex", alignItems: "flex-start", gap: 12, position: "relative" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: h.action === "revoked" ? "#EF4444" : "#10B981", marginTop: 4, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{h.title}</div>
                          <div style={{ fontSize: 11.5, color: "#64748B" }}>
                            {new Date(h.timestamp).toLocaleString("en-IN")} • Performed by: {h.performed_by || "Admin"}
                          </div>
                          {h.notes && <div style={{ fontSize: 12, color: "#334155", marginTop: 2, fontStyle: "italic" }}>"{h.notes}"</div>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12.5, color: "#64748B" }}>Certificate created and issued via administrative console.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Bar Footer */}
            <div style={{ display: "flex", gap: 12, borderTop: "1.5px solid #F1F5F9", paddingTop: 16 }}>
              <button
                type="button"
                onClick={() => handleDownloadCertificate(selectedCertDetail)}
                style={{ flex: 1, padding: "12px 18px", borderRadius: 12, background: "#6D28D9", color: "#fff", border: "none", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Download size={16} /> Download / Print PDF
              </button>

              <Link
                href={`/certificates/verify?query=${encodeURIComponent(selectedCertDetail.certificate_number)}`}
                target="_blank"
                style={{ padding: "12px 18px", borderRadius: 12, background: "#FAF5FF", color: "#6D28D9", border: "1px solid #E9D5FF", fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Share2 size={16} /> Verify
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 8 & 9. ISSUE CERTIFICATE WORKFLOW MODAL ── */}
      {showIssueWorkflow && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 24, width: "100%", maxWidth: 860, maxHeight: "90vh", overflowY: "auto", padding: 32, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1.5px solid #F1F5F9", paddingBottom: 14 }}>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 900, color: "#6D28D9", textTransform: "uppercase", letterSpacing: 1 }}>Guided Workflow</span>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "2px 0 0" }}>Issue Certificates Workflow</h2>
              </div>
              <button type="button" onClick={() => setShowIssueWorkflow(false)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={22} color="#94A3B8" /></button>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, position: "relative" }}>
              {[
                { step: 1, label: "Select Event" },
                { step: 2, label: "Competition" },
                { step: 3, label: "Round" },
                { step: 4, label: "Participants" },
                { step: 5, label: "Cert Type & Template" },
                { step: 6, label: "Preview & Issue" },
              ].map((s) => {
                const isPassed = workflowStep > s.step;
                const isCurrent = workflowStep === s.step;
                return (
                  <div key={s.step} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, zIndex: 2 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: isPassed ? "#10B981" : isCurrent ? "#6D28D9" : "#E2E8F0",
                        color: isPassed || isCurrent ? "#ffffff" : "#64748B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 900,
                        marginBottom: 6,
                      }}
                    >
                      {isPassed ? <Check size={16} /> : s.step}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: isCurrent ? 900 : 700, color: isCurrent ? "#6D28D9" : "#64748B", textAlign: "center" }}>{s.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Workflow Step Content */}
            {workflowStep === 1 && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>Step 1: Select Event</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                  <button
                    type="button"
                    onClick={() => setWfSelectedEventId("all")}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      border: wfSelectedEventId === "all" ? "2px solid #6D28D9" : "1.5px solid #E2E8F0",
                      background: wfSelectedEventId === "all" ? "#FAF5FF" : "#fff",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 800, color: "#0F172A" }}>All Events</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Select eligible participants from any event</div>
                  </button>

                  {availableEvents.map((ev) => (
                    <button
                      key={ev}
                      type="button"
                      onClick={() => setWfSelectedEventId(ev)}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        border: wfSelectedEventId === ev ? "2px solid #6D28D9" : "1.5px solid #E2E8F0",
                        background: wfSelectedEventId === ev ? "#FAF5FF" : "#fff",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#0F172A" }}>{ev}</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Filter participants for this event</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {workflowStep === 2 && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>Step 2: Select Competition / Category</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                  <button
                    type="button"
                    onClick={() => setWfSelectedCompId("all")}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      border: wfSelectedCompId === "all" ? "2px solid #6D28D9" : "1.5px solid #E2E8F0",
                      background: wfSelectedCompId === "all" ? "#FAF5FF" : "#fff",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 800, color: "#0F172A" }}>All Competitions</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Solo, Group, Duet, etc.</div>
                  </button>

                  {availableCompetitions.map((comp) => (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setWfSelectedCompId(comp)}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        border: wfSelectedCompId === comp ? "2px solid #6D28D9" : "1.5px solid #E2E8F0",
                        background: wfSelectedCompId === comp ? "#FAF5FF" : "#fff",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#0F172A" }}>{comp}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {workflowStep === 3 && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>Step 3: Select Competition Round</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                  {["Final Round", "Semi-Final", "Quarter-Final", "Auditions / Round 1"].map((rd) => (
                    <button
                      key={rd}
                      type="button"
                      onClick={() => setWfSelectedRound(rd)}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        border: wfSelectedRound === rd ? "2px solid #6D28D9" : "1.5px solid #E2E8F0",
                        background: wfSelectedRound === rd ? "#FAF5FF" : "#fff",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#0F172A" }}>{rd}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {workflowStep === 4 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                    Step 4: Select Qualified Participants ({wfSelectedRegs.length} Selected)
                  </h3>

                  <button
                    type="button"
                    onClick={() => {
                      const eligibleFiltered = eligibleRegs.filter((r) => r.is_eligible && !r.already_has_cert);
                      setWfSelectedRegs(wfSelectedRegs.length === eligibleFiltered.length ? [] : eligibleFiltered);
                    }}
                    style={{ padding: "6px 12px", borderRadius: 8, background: "#F1F5F9", border: "1px solid #CBD5E1", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                  >
                    Toggle Select All
                  </button>
                </div>

                <div style={{ maxHeight: 320, overflowY: "auto", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: 12 }}>
                  {eligibleRegs
                    .filter((r) => {
                      const matchesEv = wfSelectedEventId === "all" || r.event_title === wfSelectedEventId;
                      const matchesComp = wfSelectedCompId === "all" || r.category_name === wfSelectedCompId;
                      return matchesEv && matchesComp && r.is_eligible;
                    })
                    .map((r) => {
                      const isSelected = wfSelectedRegs.some((x) => x.registration_id === r.registration_id);
                      return (
                        <div
                          key={r.registration_id}
                          onClick={() => {
                            if (isSelected) {
                              setWfSelectedRegs(wfSelectedRegs.filter((x) => x.registration_id !== r.registration_id));
                            } else {
                              setWfSelectedRegs([...wfSelectedRegs, r]);
                            }
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: 12,
                            borderRadius: 10,
                            background: isSelected ? "#FAF5FF" : "#fff",
                            border: isSelected ? "1.5px solid #6D28D9" : "1px solid #F1F5F9",
                            marginBottom: 8,
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <input type="checkbox" checked={isSelected} readOnly style={{ width: 18, height: 18, accentColor: "#6D28D9" }} />
                            <div>
                              <div style={{ fontWeight: 800, color: "#0F172A" }}>{r.participant_name}</div>
                              <div style={{ fontSize: 12, color: "#64748B" }}>{r.registration_number} • {r.event_title}</div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: formatResultLabel(r.result_type).color, background: formatResultLabel(r.result_type).bg, padding: "3px 8px", borderRadius: 6 }}>
                              {formatResultLabel(r.result_type).badge}
                            </span>
                            {r.already_has_cert && (
                              <span style={{ fontSize: 11, fontWeight: 800, color: "#D97706", background: "#FEF3C7", padding: "3px 8px", borderRadius: 6 }}>
                                Already Issued
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {workflowStep === 5 && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>Step 5: Select Certificate Type &amp; Template</h3>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>Certificate Type:</label>
                  <select
                    value={wfSelectedCertType}
                    onChange={(e) => setWfSelectedCertType(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, fontWeight: 700, background: "#fff" }}
                  >
                    <option value="winner">🏆 Winner Certificate</option>
                    <option value="runner_up">🥈 Runner-up Certificate</option>
                    <option value="finalist">🥉 Finalist Certificate</option>
                    <option value="appreciation">⭐ Appreciation Certificate</option>
                    <option value="participation">🎓 Participation Certificate</option>
                    <option value="achievement">🌟 Achievement Certificate</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>Select Design Template:</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                    {templates.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setWfSelectedTemplate(t)}
                        style={{
                          height: 120,
                          borderRadius: 12,
                          background: `url(${t.background_url}) center/cover no-repeat`,
                          border: wfSelectedTemplate?.id === t.id ? "3px solid #6D28D9" : "1.5px solid #E2E8F0",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(15,23,42,0.8)", color: "#fff", padding: "4px 8px", fontSize: 11, fontWeight: 800 }}>
                          {t.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {workflowStep === 6 && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>Step 6: Preview &amp; Confirm Issuance ({wfSelectedRegs.length} Participants)</h3>
                <div style={{ padding: 14, background: "#FAF5FF", borderRadius: 12, border: "1px solid #E9D5FF", marginBottom: 16, fontSize: 13.5, color: "#6D28D9", fontWeight: 700 }}>
                  Generating <strong>{formatCertificateTypeLabel(wfSelectedCertType)}</strong> for <strong>{wfSelectedRegs.length} participant(s)</strong>.
                </div>

                <div style={{ width: "100%", height: 320, borderRadius: 14, border: "1px solid #CBD5E1", overflow: "hidden" }}>
                  <iframe
                    srcDoc={
                      wfSelectedRegs[0]
                        ? renderCertificateHTMLFromSnapshot({
                            participant_name: wfSelectedRegs[0].participant_name,
                            participant_number: wfSelectedRegs[0].participant_number,
                            event_title: wfSelectedRegs[0].event_title,
                            event_date: wfSelectedRegs[0].event_date,
                            venue: wfSelectedRegs[0].venue,
                            category_name: wfSelectedRegs[0].category_name,
                            competition_name: wfSelectedRegs[0].category_name,
                            round_name: wfSelectedRound,
                            participation_type: wfSelectedRegs[0].participation_type,
                            result_label: formatResultLabel(wfSelectedRegs[0].result_type).label,
                            result_badge: formatResultLabel(wfSelectedRegs[0].result_type).badge,
                            certificate_title: formatCertificateTypeLabel(wfSelectedCertType),
                            authorized_signatory: "CGS Management",
                            organization_name: "CGS Entertainments",
                            certificate_number: "CGS-CERT-AUTO-PREVIEW",
                            verification_token: "preview_token",
                            issue_date: new Date().toLocaleDateString("en-IN"),
                            background_url: wfSelectedTemplate?.background_url,
                          })
                        : ""
                    }
                    style={{ width: "100%", height: "100%", border: "none" }}
                    title="Workflow Preview"
                  />
                </div>
              </div>
            )}

            {/* Stepper Footer Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid #F1F5F9", paddingTop: 20, marginTop: 24 }}>
              <button
                type="button"
                onClick={() => setWorkflowStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev))}
                disabled={workflowStep === 1}
                style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 700, cursor: workflowStep === 1 ? "not-allowed" : "pointer" }}
              >
                Back
              </button>

              {workflowStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNextWorkflowStep}
                  style={{ padding: "10px 22px", borderRadius: 10, background: "#6D28D9", color: "#fff", border: "none", fontWeight: 900, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  Next Step <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleExecuteWorkflowIssue}
                  disabled={issuingInProgress}
                  style={{ padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg, #059669 0%, #10B981 100%)", color: "#fff", border: "none", fontWeight: 900, cursor: issuingInProgress ? "not-allowed" : "pointer" }}
                >
                  {issuingInProgress ? "Issuing Certificates..." : `Confirm & Issue (${wfSelectedRegs.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 10. DUPLICATE PREVENTION WARNING MODAL ── */}
      {duplicateWarning && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <AlertTriangle size={48} color="#D97706" style={{ margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>Certificate Already Issued</h3>
            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 20px" }}>
              Participant <strong>{duplicateWarning.reg.participant_name}</strong> already holds certificate <strong>{duplicateWarning.existingCert.certificate_number}</strong> for this event and result.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 800, color: "#334155", cursor: "pointer" }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setDuplicateWarning(null);
                  openDetailsDrawer(duplicateWarning.existingCert);
                }}
                style={{ padding: "10px 18px", borderRadius: 10, background: "#6D28D9", color: "#fff", border: "none", fontWeight: 800, cursor: "pointer" }}
              >
                View Existing Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REISSUE MODAL ── */}
      {reissuingCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 500, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <RotateCcw size={20} color="#D97706" /> Reissue Certificate
              </h3>
              <button type="button" onClick={() => setReissuingCert(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} color="#94A3B8" /></button>
            </div>

            <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 16 }}>
              Reissuing will revoke <strong>{reissuingCert.certificate_number}</strong> and generate a new certificate credential with updated details.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>Reissue Reason (Mandatory):</label>
              <textarea
                rows={3}
                placeholder="e.g. Name spelling correction requested by participant..."
                value={reissueReason}
                onChange={(e) => setReissueReason(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13.5, fontWeight: 600 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button type="button" onClick={() => setReissuingCert(null)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 700, color: "#334155", cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={handleExecuteReissue} disabled={reissueInProgress} style={{ padding: "10px 20px", borderRadius: 10, background: "#D97706", color: "#fff", border: "none", fontWeight: 900, cursor: reissueInProgress ? "not-allowed" : "pointer" }}>
                {reissueInProgress ? "Reissuing..." : "Confirm & Reissue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REVOKE MODAL ── */}
      {revokingCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 500, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#EF4444", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Ban size={20} color="#EF4444" /> Revoke Certificate
              </h3>
              <button type="button" onClick={() => setRevokingCert(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} color="#94A3B8" /></button>
            </div>

            <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 16 }}>
              Are you sure you want to revoke <strong>{revokingCert.certificate_number}</strong>? Public verification queries will display this credential as Revoked.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>Revocation Reason (Mandatory):</label>
              <textarea
                rows={3}
                placeholder="e.g. Disqualification or administrative withdrawal..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13.5, fontWeight: 600 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button type="button" onClick={() => setRevokingCert(null)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 700, color: "#334155", cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={handleExecuteRevoke} style={{ padding: "10px 20px", borderRadius: 10, background: "#EF4444", color: "#fff", border: "none", fontWeight: 900, cursor: "pointer" }}>
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCertificatesDashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>Loading certificates workspace...</div>}>
      <AdminCertificatesDashboardContent />
    </Suspense>
  );
}
