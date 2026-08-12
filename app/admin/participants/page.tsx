"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Download,
  Mail,
  Phone,
  Calendar,
  Eye,
  RefreshCw,
  MapPin,
  Play,
  X,
  Video,
  ExternalLink,
  ShieldCheck,
  FileText,
  UserCheck,
  Award,
  Music,
  Trophy,
  Filter,
  CheckCircle2,
  AlertCircle,
  Star,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Send,
  Bell,
} from "lucide-react";

interface ParticipantItem {
  id: string;
  registration_id?: string;
  registration_number?: string;
  participant_id: string;
  participant_number: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  event_id?: string;
  event_title?: string;
  event_date?: string | null;
  event_location?: string | null;
  category_name?: string;
  registration_status?: string;
  payment_status?: string;
  video_path?: string | null;
  video_url?: string | null;
  video_signed_url?: string | null;
  id_proof_url?: string | null;
  created_at?: string;
  // Result object
  result?: {
    id?: string;
    result_type: "winner" | "runner_up" | "finalist" | "special_mention" | "participant" | "pending";
    position?: number;
    selected_at?: string | null;
    notes?: string | null;
  };
  details?: {
    parentName?: string | null;
    whatsapp?: string | null;
    age?: string | null;
    compType?: string | null;
    ageCat?: string | null;
    danceStyle?: string | null;
    teamName?: string | null;
    numParticipants?: string | null;
    songTitle?: string | null;
    duration?: string | null;
    academy?: string | null;
    awards?: string | null;
    emergencyName?: string | null;
    emergencyRelation?: string | null;
    emergencyMobile?: string | null;
    agreeCorrect?: boolean;
    agreeRules?: boolean;
    signature?: string | null;
    signatureDate?: string | null;
  };
}

interface EventOption {
  id: string;
  title: string;
}

const RESULT_OPTIONS = [
  { value: "winner", label: "Winner", badge: "🏆 Winner", color: "#D97706", bg: "#FEF3C7", pos: 1 },
  { value: "runner_up", label: "Runner-up", badge: "🥈 Runner-up", color: "#475569", bg: "#F1F5F9", pos: 2 },
  { value: "finalist", label: "Finalist", badge: "🥉 Finalist", color: "#B45309", bg: "#FFEDD5", pos: 3 },
  { value: "special_mention", label: "Special Mention", badge: "⭐ Special Mention", color: "#6D28D9", bg: "#F3E8FF", pos: 4 },
  { value: "participant", label: "Participant", badge: "👤 Participant", color: "#2563EB", bg: "#EFF6FF", pos: 5 },
  { value: "pending", label: "No Result / Pending", badge: "⏳ Pending", color: "#64748B", bg: "#F8FAFC", pos: 99 },
];

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [eventsList, setEventsList] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");

  // Modals state
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantItem | null>(null);
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);
  const [resultModal, setResultModal] = useState<ParticipantItem | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"personal" | "performance" | "emergency" | "media">("personal");

  // Confirmation Modal State (with notify parameter)
  const [confirmModal, setConfirmModal] = useState<{
    participant: ParticipantItem;
    newResultType: string;
    position: number;
    notes: string;
    notifyParticipant: boolean;
    isReset?: boolean;
    winnerWarning?: string | null;
  } | null>(null);

  // Admin Custom Messaging Modal State
  const [messageModal, setMessageModal] = useState<ParticipantItem | null>(null);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgError, setMsgError] = useState<string | null>(null);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Result selection form state
  const [selectedResultType, setSelectedResultType] = useState<string>("winner");
  const [positionRank, setPositionRank] = useState<number>(1);
  const [resultNotes, setResultNotes] = useState<string>("");
  const [savingResult, setSavingResult] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchParticipantsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/participants");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setParticipants(data.participants || []);
          setEventsList(data.events || []);
          return;
        }
      }
      setError("Failed to fetch participant registry.");
    } catch (err: any) {
      console.error("Error fetching participants:", err);
      setError("Network error fetching participant registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipantsData();
  }, []);

  const openResultModal = (p: ParticipantItem) => {
    setResultModal(p);
    const currRes = p.result?.result_type || "pending";
    setSelectedResultType(currRes);
    const opt = RESULT_OPTIONS.find((o) => o.value === currRes);
    setPositionRank(p.result?.position || opt?.pos || 1);
    setResultNotes(p.result?.notes || "");
  };

  // Step 3: Trigger Confirmation Dialog with explicit Notify flag choice
  const requestResultConfirmation = (targetType: string, notifyParticipant: boolean, isReset: boolean = false) => {
    if (!resultModal) return;

    let warning: string | null = null;
    if (targetType === "winner") {
      const existingWinner = participants.find(
        (p) =>
          p.event_id === resultModal.event_id &&
          p.id !== resultModal.id &&
          p.result?.result_type === "winner"
      );
      if (existingWinner) {
        warning = `Notice: This event already has a Winner assigned (${existingWinner.full_name}). Assigning another Winner will add to the winners list for this event.`;
      }
    }

    const opt = RESULT_OPTIONS.find((o) => o.value === targetType);
    setConfirmModal({
      participant: resultModal,
      newResultType: targetType,
      position: targetType === "pending" ? 99 : (opt?.pos || positionRank),
      notes: targetType === "pending" ? "" : resultNotes,
      notifyParticipant,
      isReset,
      winnerWarning: warning,
    });
  };

  // Execute Result update after confirmation
  const handleExecuteSaveResult = async () => {
    if (!confirmModal) return;
    try {
      setSavingResult(true);
      const { participant: targetP, newResultType, position, notes, notifyParticipant } = confirmModal;
      const evtId = targetP.event_id || "default-event";

      const res = await fetch(`/api/events/${encodeURIComponent(evtId)}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: targetP.participant_id || targetP.id,
          registration_id: targetP.registration_id,
          result_type: newResultType,
          position: position,
          notes: notes,
          notify: notifyParticipant, // Step 3: Explicit Notify option
        }),
      });

      if (res.ok) {
        const opt = RESULT_OPTIONS.find((o) => o.value === newResultType);
        showToast(
          confirmModal.isReset
            ? `✓ Result reset to Pending for ${targetP.full_name}`
            : notifyParticipant
            ? `✓ Result updated & Notification sent to ${targetP.full_name}`
            : `✓ Result updated (Saved Only) for ${targetP.full_name}`
        );
        setConfirmModal(null);
        setResultModal(null);
        fetchParticipantsData();
      } else {
        const errJson = await res.json();
        alert(`Error updating result: ${errJson.error || "Unable to update result"}`);
      }
    } catch (err) {
      console.error("Error saving result:", err);
      alert("Unable to update result. Please try again.");
    } finally {
      setSavingResult(false);
    }
  };

  // Step 3: Handle Admin Custom Message Submission
  const openMessageModal = (p: ParticipantItem) => {
    setMessageModal(p);
    setMsgSubject("");
    setMsgBody("");
    setMsgError(null);
  };

  const handleSendMessage = async () => {
    if (!messageModal) return;

    if (!msgSubject.trim()) {
      setMsgError("Subject line cannot be empty.");
      return;
    }
    if (!msgBody.trim()) {
      setMsgError("Message body cannot be empty.");
      return;
    }

    try {
      setSendingMsg(true);
      setMsgError(null);

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: messageModal.participant_id || messageModal.id,
          event_id: messageModal.event_id || null,
          subject: msgSubject.trim(),
          message: msgBody.trim(),
          notify: true, // Step 3: Deliver as website notification
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showToast(`✓ Message sent successfully to ${messageModal.full_name}`);
          setMessageModal(null);
          return;
        }
        setMsgError(data.error || "Failed sending message.");
      } else {
        const errJson = await res.json();
        setMsgError(errJson.error || "Failed sending message.");
      }
    } catch (err) {
      console.error("Error sending custom message:", err);
      setMsgError("Network error while sending message.");
    } finally {
      setSendingMsg(false);
    }
  };

  // Event-filtered Participants (for summary calculations)
  const eventFilteredParticipants = participants.filter((p) => {
    return (
      selectedEventId === "all" ||
      p.event_id === selectedEventId ||
      p.event_title?.toLowerCase() === selectedEventId.toLowerCase()
    );
  });

  // Dynamic Summary Counters
  const summaryCounters = {
    total: eventFilteredParticipants.length,
    pending: eventFilteredParticipants.filter((p) => (p.result?.result_type || "pending") === "pending").length,
    winner: eventFilteredParticipants.filter((p) => p.result?.result_type === "winner").length,
    runner_up: eventFilteredParticipants.filter((p) => p.result?.result_type === "runner_up").length,
    finalist: eventFilteredParticipants.filter((p) => p.result?.result_type === "finalist").length,
    special_mention: eventFilteredParticipants.filter((p) => p.result?.result_type === "special_mention").length,
    participant: eventFilteredParticipants.filter((p) => p.result?.result_type === "participant").length,
  };

  // Filtered Participants Logic for table
  const filteredParticipants = eventFilteredParticipants.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const d = p.details || {};

    const matchesSearch =
      !query ||
      (p.full_name || "").toLowerCase().includes(query) ||
      (p.email || "").toLowerCase().includes(query) ||
      (p.phone || "").toLowerCase().includes(query) ||
      (p.participant_number || "").toLowerCase().includes(query) ||
      (p.registration_number || "").toLowerCase().includes(query) ||
      (p.event_title || "").toLowerCase().includes(query) ||
      (p.category_name || "").toLowerCase().includes(query) ||
      (d.danceStyle || "").toLowerCase().includes(query) ||
      (d.teamName || "").toLowerCase().includes(query);

    const currentResultType = p.result?.result_type || "pending";
    const matchesResult =
      resultFilter === "all" || currentResultType === resultFilter;

    return matchesSearch && matchesResult;
  });

  const handleDownloadCSV = () => {
    const headers =
      "Registration ID,Participant Number,Full Name,Email,Phone,WhatsApp,DOB,Age,Gender,Parent Name,Address,City,State,Pincode,Event,Category,Comp Type,Age Category,Dance Style,Team Name,Song Title,Duration,Academy,Awards,Video Path,Result Status,Date Registered\n";

    const rows = filteredParticipants
      .map((p) => {
        const d = p.details || {};
        const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN") : "";
        const videoStr = p.video_signed_url || p.video_path || p.video_url || "No performance video uploaded";
        const resLabel = p.result?.result_type || "pending";

        return `"${p.registration_number || p.id}","${p.participant_number || ""}","${p.full_name || ""}","${p.email || ""}","${p.phone || ""}","${d.whatsapp || ""}","${p.date_of_birth || ""}","${d.age || ""}","${p.gender || ""}","${d.parentName || ""}","${p.address || ""}","${p.city || ""}","${p.state || ""}","${p.pincode || ""}","${p.event_title || ""}","${p.category_name || ""}","${d.compType || ""}","${d.ageCat || ""}","${d.danceStyle || ""}","${d.teamName || ""}","${d.songTitle || ""}","${d.duration || ""}","${d.academy || ""}","${d.awards || ""}","${videoStr}","${resLabel}","${dateStr}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cgs_event_registrations_export_${Date.now()}.csv`;
    a.click();
  };

  const getResultBadge = (resultType?: string, eventTitle?: string) => {
    const opt = RESULT_OPTIONS.find((o) => o.value === (resultType || "pending"));
    const titleText = eventTitle ? `${opt?.label} for ${eventTitle}` : opt?.label;
    return (
      <span
        title={titleText}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 12px",
          borderRadius: 8,
          background: opt?.bg || "#F8FAFC",
          color: opt?.color || "#64748B",
          fontSize: 12.5,
          fontWeight: 800,
        }}
      >
        {opt?.badge || "⏳ Pending"}
      </span>
    );
  };

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

      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", display: "flex", alignItems: "center", gap: 10, margin: "0 0 4px" }}>
            <Users size={28} color="#6D28D9" /> Participant Registry &amp; Performance Review
          </h1>
          <p style={{ fontSize: 14.5, color: "#6B7280", margin: 0 }}>
            Review event registrations, watch audition videos, assign contest results, and send notifications.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={fetchParticipantsData}
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
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
          <button
            type="button"
            onClick={handleDownloadCSV}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "#6D28D9",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(109, 40, 217, 0.25)",
            }}
          >
            <Download size={16} /> Export Full CSV
          </button>
        </div>
      </div>

      {/* Dynamic Summary Counter Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "#ffffff", border: "1.5px solid #E2E8F0", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Total Registrations</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", marginTop: 4 }}>{summaryCounters.total}</div>
        </div>

        <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B" }}>⏳ Pending</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#475569", marginTop: 4 }}>{summaryCounters.pending}</div>
        </div>

        <div style={{ background: "#FEF3C7", border: "1.5px solid #FCD34D", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#B45309" }}>🏆 Winners</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#D97706", marginTop: 4 }}>{summaryCounters.winner}</div>
        </div>

        <div style={{ background: "#F1F5F9", border: "1.5px solid #CBD5E1", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>🥈 Runner-up</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#475569", marginTop: 4 }}>{summaryCounters.runner_up}</div>
        </div>

        <div style={{ background: "#FFEDD5", border: "1.5px solid #FDBA74", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#C2410C" }}>🥉 Finalists</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#EA580C", marginTop: 4 }}>{summaryCounters.finalist}</div>
        </div>

        <div style={{ background: "#F3E8FF", border: "1.5px solid #DDD6FE", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#6D28D9" }}>⭐ Special Mention</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#7C3AED", marginTop: 4 }}>{summaryCounters.special_mention}</div>
        </div>

        <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#1D4ED8" }}>👤 Participants</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#2563EB", marginTop: 4 }}>{summaryCounters.participant}</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #E5E7EB",
          borderRadius: 20,
          padding: "20px 24px",
          marginBottom: 24,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: 1, minWidth: 280 }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder="Search Name, Email, Phone, Participant No, Event, Category, Dance Style, Team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                borderRadius: 12,
                border: "1.5px solid #D1D5DB",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* Event Filter Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 240 }}>
            <Filter size={16} color="#6D28D9" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid #D1D5DB",
                fontSize: 14,
                fontWeight: 700,
                color: "#1E293B",
                background: "#ffffff",
                cursor: "pointer",
              }}
            >
              <option value="all">All Events ({eventsList.length > 0 ? eventsList.length : "Database"})</option>
              {eventsList.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Filter Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingTop: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#64748B", marginRight: 4 }}>Result Filter:</span>
          {[
            { key: "all", label: `All (${summaryCounters.total})` },
            { key: "pending", label: `⏳ Pending (${summaryCounters.pending})` },
            { key: "winner", label: `🏆 Winners (${summaryCounters.winner})` },
            { key: "runner_up", label: `🥈 Runner-up (${summaryCounters.runner_up})` },
            { key: "finalist", label: `🥉 Finalists (${summaryCounters.finalist})` },
            { key: "special_mention", label: `⭐ Special Mention (${summaryCounters.special_mention})` },
            { key: "participant", label: `👤 Participants (${summaryCounters.participant})` },
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
                  fontSize: 13,
                  fontWeight: 800,
                  border: active ? "1.5px solid #6D28D9" : "1px solid #E2E8F0",
                  background: active ? "#F3E8FF" : "#ffffff",
                  color: active ? "#6D28D9" : "#475569",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
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
          {error}
        </div>
      )}

      {/* Participants Summary Table */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflowX: "auto", overflowY: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#6B7280", fontWeight: 700 }}>
            Loading participant registration database...
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>
            <Users size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>No Event Registrations Found</h3>
            <p style={{ fontSize: 14, marginTop: 4 }}>
              Registered talent participants for selected filters will appear here.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", color: "#4B5563", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>PARTICIPANT NO</th>
                <th style={{ padding: "14px 20px" }}>PARTICIPANT NAME</th>
                <th style={{ padding: "14px 20px" }}>EVENT &amp; CATEGORY</th>
                <th style={{ padding: "14px 20px" }}>DANCE STYLE &amp; TEAM</th>
                <th style={{ padding: "14px 20px" }}>CONTACT INFO</th>
                <th style={{ padding: "14px 20px" }}>PERFORMANCE VIDEO</th>
                <th style={{ padding: "14px 20px" }}>RESULT</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((p) => {
                const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
                const hasVideo = Boolean(p.video_signed_url || p.video_path || p.video_url);
                const d = p.details || {};
                const videoTarget = p.video_signed_url || p.video_path || p.video_url;

                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {/* Participant Number */}
                    <td style={{ padding: "16px 20px", fontWeight: 800, color: "#6D28D9" }}>
                      {p.participant_number || p.id.substring(0, 8)}
                    </td>

                    {/* Participant Name */}
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 800, color: "#111827" }}>{p.full_name}</div>
                      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                        {p.gender ? `${p.gender.toUpperCase()}` : ""} {d.age ? `• Age: ${d.age} Yrs` : ""}
                      </div>
                    </td>

                    {/* Event & Category */}
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{p.event_title || "CGS Talent Competition"}</div>
                      <div style={{ fontSize: 12, color: "#6D28D9", fontWeight: 700, marginTop: 2 }}>
                        {p.category_name || "General"} {d.compType ? `(${d.compType})` : ""}
                      </div>
                    </td>

                    {/* Dance Style & Team */}
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>
                        {d.danceStyle || "Classical Performance"}
                      </div>
                      {d.teamName && (
                        <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, marginTop: 2 }}>
                          Team: {d.teamName}
                        </div>
                      )}
                    </td>

                    {/* Contact Info */}
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ color: "#374151", fontSize: 13, fontWeight: 600 }}>{p.email}</div>
                      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{p.phone}</div>
                    </td>

                    {/* Performance Video */}
                    <td style={{ padding: "16px 20px" }}>
                      {hasVideo && videoTarget ? (
                        <button
                          type="button"
                          onClick={() => setPlayingVideo({ url: videoTarget, title: `${p.full_name} Audition` })}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 14px",
                            background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(109,40,217,0.25)",
                          }}
                        >
                          <Play size={13} fill="#fff" /> ▶ Watch Video
                        </button>
                      ) : (
                        <span style={{ fontSize: 12.5, color: "#9CA3AF", fontStyle: "italic", fontWeight: 500 }}>
                          No performance video uploaded
                        </span>
                      )}
                    </td>

                    {/* Result Badge */}
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {getResultBadge(p.result?.result_type, p.event_title)}
                        <button
                          type="button"
                          onClick={() => openResultModal(p)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "1px solid #CBD5E1",
                            background: "#ffffff",
                            color: "#6D28D9",
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                          title="Assign or update result"
                        >
                          Select
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={() => openMessageModal(p)}
                          style={{
                            padding: "6px 12px",
                            background: "#FAF5FF",
                            color: "#6D28D9",
                            border: "1px solid #E9D5FF",
                            borderRadius: 8,
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                          title="Send custom message to participant"
                        >
                          <MessageSquare size={14} /> Message
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedParticipant(p);
                            setActiveModalTab("personal");
                          }}
                          style={{
                            padding: "6px 14px",
                            background: "#F3F4F6",
                            color: "#1E1B4B",
                            border: "1px solid #CBD5E1",
                            borderRadius: 8,
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Eye size={14} color="#6D28D9" /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── RESULT SELECTION MODAL ── */}
      {resultModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 560, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trophy size={22} color="#6D28D9" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>Assign Result</h3>
                  <div style={{ fontSize: 13, color: "#64748B" }}>Participant: <strong>{resultModal.full_name}</strong></div>
                </div>
              </div>
              <button type="button" onClick={() => setResultModal(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} color="#94A3B8" /></button>
            </div>

            <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: 12, marginBottom: 20, border: "1px solid #E2E8F0", fontSize: 13.5, color: "#334155" }}>
              Event: <strong style={{ color: "#0F172A" }}>{resultModal.event_title || "CGS Competition"}</strong>
              {resultModal.details?.danceStyle && <div>Performance: <strong>{resultModal.details.danceStyle}</strong></div>}
            </div>

            {/* Result Options Grid */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>
                Select Result Type:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {RESULT_OPTIONS.map((opt) => {
                  const isSelected = selectedResultType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedResultType(opt.value);
                        setPositionRank(opt.pos);
                      }}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        textAlign: "left",
                        fontSize: 13.5,
                        fontWeight: 800,
                        border: isSelected ? "2px solid #6D28D9" : "1.5px solid #E2E8F0",
                        background: isSelected ? "#F3E8FF" : "#ffffff",
                        color: isSelected ? "#6D28D9" : "#334155",
                        cursor: "pointer",
                      }}
                    >
                      {opt.badge}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedResultType !== "pending" && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                  Position Rank Number:
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={positionRank}
                  onChange={(e) => setPositionRank(parseInt(e.target.value) || 1)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                />
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                Admin Jury Notes (Optional):
              </label>
              <textarea
                rows={2}
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                placeholder="e.g. Outstanding choreography and stage presence..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13.5, resize: "vertical" }}
              />
            </div>

            {/* Buttons: Step 3 Dual Save Options */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <button
                type="button"
                onClick={() => requestResultConfirmation("pending", false, true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #CBD5E1",
                  background: "#F8FAFC",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#64748B",
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={14} /> Reset Result
              </button>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => requestResultConfirmation(selectedResultType, false, false)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #CBD5E1",
                    background: "#ffffff",
                    fontWeight: 800,
                    color: "#334155",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                  title="Save result quietly without sending notification"
                >
                  Save Result Only
                </button>
                <button
                  type="button"
                  onClick={() => requestResultConfirmation(selectedResultType, true, false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                    fontWeight: 900,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    boxShadow: "0 4px 14px rgba(109,40,217,0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Bell size={14} /> Save &amp; Notify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT CONFIRMATION MODAL ── */}
      {confirmModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: confirmModal.isReset ? "#F1F5F9" : "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                {confirmModal.isReset ? <RotateCcw size={26} color="#64748B" /> : <Trophy size={26} color="#D97706" />}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
                {confirmModal.isReset ? "Reset Result to Pending?" : "Confirm Result Assignment"}
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
                {confirmModal.isReset
                  ? `Are you sure you want to reset ${confirmModal.participant.full_name}'s result to Pending?`
                  : `Are you sure you want to assign this result?`}
              </p>
            </div>

            {/* Winner Conflict Warning if applicable */}
            {confirmModal.winnerWarning && (
              <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#92400E" }}>
                <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>{confirmModal.winnerWarning}</div>
              </div>
            )}

            <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 14, border: "1px solid #E2E8F0", marginBottom: 20, fontSize: 13.5, color: "#334155" }}>
              <div><strong>Participant:</strong> {confirmModal.participant.full_name} ({confirmModal.participant.participant_number})</div>
              <div style={{ marginTop: 4 }}><strong>Event:</strong> {confirmModal.participant.event_title || "CGS Competition"}</div>
              {confirmModal.participant.details?.danceStyle && <div style={{ marginTop: 4 }}><strong>Performance:</strong> {confirmModal.participant.details.danceStyle}</div>}
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <strong>New Result:</strong> {getResultBadge(confirmModal.newResultType, confirmModal.participant.event_title)}
              </div>
              <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700, color: confirmModal.notifyParticipant ? "#6D28D9" : "#64748B" }}>
                Notification Action: {confirmModal.notifyParticipant ? "🔔 Send website notification to participant" : "🔕 Save result quietly (No notification)"}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 700, color: "#334155", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSaveResult}
                disabled={savingResult}
                style={{
                  padding: "10px 22px",
                  borderRadius: 10,
                  border: "none",
                  background: confirmModal.isReset ? "#475569" : "#6D28D9",
                  fontWeight: 900,
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(109,40,217,0.25)",
                }}
              >
                {savingResult ? "Saving..." : confirmModal.isReset ? "Confirm Reset" : "Confirm Result"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN CUSTOM MESSAGING MODAL ── */}
      {messageModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 24, width: "100%", maxWidth: 540, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MessageSquare size={22} color="#6D28D9" />
                </div>
                <div>
                  <h3 style={{ fontSize: 19, fontWeight: 900, color: "#0F172A", margin: 0 }}>Message Participant</h3>
                  <div style={{ fontSize: 13, color: "#64748B" }}>Recipient: <strong>{messageModal.full_name}</strong></div>
                </div>
              </div>
              <button type="button" onClick={() => setMessageModal(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} color="#94A3B8" /></button>
            </div>

            <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: 14, marginBottom: 20, border: "1px solid #E2E8F0", fontSize: 13.5, color: "#334155" }}>
              <div><strong>Event:</strong> {messageModal.event_title || "CGS Competition"}</div>
              <div><strong>Email:</strong> {messageModal.email}</div>
            </div>

            {msgError && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", color: "#991B1B", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                {msgError}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                Subject Title:
              </label>
              <input
                type="text"
                value={msgSubject}
                onChange={(e) => setMsgSubject(e.target.value)}
                placeholder="e.g. Schedule Update / Audition Feedback"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, outline: "none" }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                Message Content:
              </label>
              <textarea
                rows={4}
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder="Type your message to the participant..."
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13.5, resize: "vertical", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                type="button"
                onClick={() => setMessageModal(null)}
                style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 700, color: "#334155", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sendingMsg}
                style={{
                  padding: "10px 22px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                  fontWeight: 900,
                  color: "#fff",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(109, 40, 217, 0.3)",
                }}
              >
                <Send size={15} /> {sendingMsg ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIDEO PLAYER MODAL ── */}
      {playingVideo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
          <div style={{ background: "#111827", borderRadius: 24, maxWidth: 840, width: "100%", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)", border: "1px solid #374151" }}>
            <div style={{ padding: "16px 24px", background: "#1F2937", borderBottom: "1px solid #374151", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
                <Video size={20} color="#A78BFA" />
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>
                  Audition Video: {playingVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000" }}>
              {playingVideo.url.includes("youtube.com") || playingVideo.url.includes("youtu.be") ? (
                <iframe
                  src={playingVideo.url.replace("watch?v=", "embed/")}
                  title="Audition Video"
                  style={{ width: "100%", height: 450, border: "none", borderRadius: 14 }}
                  allowFullScreen
                />
              ) : (
                <video
                  src={playingVideo.url}
                  controls
                  autoPlay
                  controlsList="nodownload"
                  style={{ width: "100%", maxHeight: "70vh", borderRadius: 14, outline: "none", background: "#000" }}
                >
                  Your browser does not support html5 video playback.
                </video>
              )}
            </div>

            <div style={{ padding: "16px 24px", background: "#1F2937", borderTop: "1px solid #374151", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a
                href={playingVideo.url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#A78BFA", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                Open original video link <ExternalLink size={14} />
              </a>
              <button
                onClick={() => setPlayingVideo(null)}
                style={{ padding: "8px 20px", background: "#6D28D9", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPREHENSIVE PARTICIPANT DETAILS MODAL ── */}
      {selectedParticipant && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 24, maxWidth: 840, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            
            {/* Modal Header */}
            <div style={{ padding: "20px 28px", background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#A78BFA", letterSpacing: 0.5 }}>
                  REGISTRATION PROFILE #{selectedParticipant.participant_number}
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: "2px 0 0", color: "#fff" }}>
                  {selectedParticipant.full_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedParticipant(null)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", background: "#F8FAFC", padding: "0 28px" }}>
              {[
                { id: "personal", label: "Personal & Contact Info", icon: UserCheck },
                { id: "performance", label: "Event & Performance", icon: Music },
                { id: "emergency", label: "Emergency & Declaration", icon: ShieldCheck },
                { id: "media", label: "Uploaded Files & Media", icon: Video },
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveModalTab(tab.id as any)}
                    style={{
                      padding: "14px 18px",
                      background: "transparent",
                      border: "none",
                      borderBottom: isActive ? "3px solid #6D28D9" : "3px solid transparent",
                      color: isActive ? "#6D28D9" : "#64748B",
                      fontWeight: isActive ? 800 : 600,
                      fontSize: 13.5,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.2s",
                    }}
                  >
                    <IconComp size={16} /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Scrollable Content */}
            <div style={{ flex: 1, padding: "28px", overflowY: "auto", background: "#ffffff" }}>
              {/* TAB 1: PERSONAL & CONTACT INFO */}
              {activeModalTab === "personal" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 14, borderBottom: "1px solid #CBD5E1", paddingBottom: 8 }}>
                      Personal Identity
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: "#334155" }}>
                      <div><strong>Full Name:</strong> {selectedParticipant.full_name}</div>
                      <div><strong>Date of Birth:</strong> {selectedParticipant.date_of_birth || "N/A"}</div>
                      <div><strong>Age:</strong> {selectedParticipant.details?.age || "N/A"} Yrs</div>
                      <div><strong>Gender:</strong> {selectedParticipant.gender ? selectedParticipant.gender.toUpperCase() : "N/A"}</div>
                      <div><strong>Parent/Guardian:</strong> {selectedParticipant.details?.parentName || "N/A"}</div>
                    </div>
                  </div>

                  <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 14, borderBottom: "1px solid #CBD5E1", paddingBottom: 8 }}>
                      Contact Details
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: "#334155" }}>
                      <div><strong>Email:</strong> {selectedParticipant.email}</div>
                      <div><strong>Mobile Phone:</strong> {selectedParticipant.phone}</div>
                      <div><strong>WhatsApp Phone:</strong> {selectedParticipant.details?.whatsapp || selectedParticipant.phone}</div>
                      <div><strong>Address:</strong> {selectedParticipant.address || "N/A"}</div>
                      <div><strong>City / Town:</strong> {selectedParticipant.city || "N/A"}</div>
                      <div><strong>State:</strong> {selectedParticipant.state || "N/A"}</div>
                      <div><strong>Pincode:</strong> {selectedParticipant.pincode || "N/A"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EVENT & PERFORMANCE INFO */}
              {activeModalTab === "performance" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 14, borderBottom: "1px solid #CBD5E1", paddingBottom: 8 }}>
                      Event Registration
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: "#334155" }}>
                      <div><strong>Event Name:</strong> {selectedParticipant.event_title || "General Event"}</div>
                      <div><strong>Category:</strong> {selectedParticipant.category_name || "N/A"}</div>
                      <div><strong>Performance Type:</strong> {selectedParticipant.details?.compType || "Solo"}</div>
                      <div><strong>Age Category:</strong> {selectedParticipant.details?.ageCat || "N/A"}</div>
                      <div><strong>Dance / Performance Style:</strong> {selectedParticipant.details?.danceStyle || "N/A"}</div>
                      <div><strong>Performers Count:</strong> {selectedParticipant.details?.numParticipants || "1"}</div>
                      <div><strong>Official Result:</strong> {getResultBadge(selectedParticipant.result?.result_type, selectedParticipant.event_title)}</div>
                    </div>
                  </div>

                  <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 14, borderBottom: "1px solid #CBD5E1", paddingBottom: 8 }}>
                      Track &amp; Academy Info
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: "#334155" }}>
                      <div><strong>Team / Group Name:</strong> {selectedParticipant.details?.teamName || "N/A"}</div>
                      <div><strong>Song Title:</strong> {selectedParticipant.details?.songTitle || "N/A"}</div>
                      <div><strong>Duration:</strong> {selectedParticipant.details?.duration || "N/A"} Mins</div>
                      <div><strong>Academy / Institute:</strong> {selectedParticipant.details?.academy || "N/A"}</div>
                      <div><strong>Previous Awards:</strong> {selectedParticipant.details?.awards || "None"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EMERGENCY & DECLARATION */}
              {activeModalTab === "emergency" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 14, borderBottom: "1px solid #CBD5E1", paddingBottom: 8 }}>
                      Emergency Contact
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: "#334155" }}>
                      <div><strong>Contact Person Name:</strong> {selectedParticipant.details?.emergencyName || "N/A"}</div>
                      <div><strong>Relationship:</strong> {selectedParticipant.details?.emergencyRelation || "N/A"}</div>
                      <div><strong>Contact Mobile Phone:</strong> {selectedParticipant.details?.emergencyMobile || "N/A"}</div>
                    </div>
                  </div>

                  <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 14, borderBottom: "1px solid #CBD5E1", paddingBottom: 8 }}>
                      Declaration &amp; Signature
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: "#334155" }}>
                      <div><strong>Information Correct:</strong> <span style={{ color: "#166534", fontWeight: 800 }}>Verified &amp; Agreed</span></div>
                      <div><strong>Abide by Rules &amp; Terms:</strong> <span style={{ color: "#166534", fontWeight: 800 }}>Verified &amp; Agreed</span></div>
                      <div><strong>Signed Name:</strong> {selectedParticipant.details?.signature || selectedParticipant.full_name}</div>
                      <div><strong>Signature Date:</strong> {selectedParticipant.details?.signatureDate || "N/A"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: UPLOADED FILES & MEDIA */}
              {activeModalTab === "media" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Video File */}
                  <div style={{ background: "#FAF5FF", borderRadius: 16, padding: 20, border: "1.5px solid #E9D5FF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#581C87", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <Video size={18} color="#7C3AED" /> Audition Performance Video
                      </h4>
                      <p style={{ fontSize: 12.5, color: "#7E22CE", margin: "4px 0 0" }}>
                        Audition video playback link for jury review.
                      </p>
                    </div>
                    {selectedParticipant.video_signed_url || selectedParticipant.video_path || selectedParticipant.video_url ? (
                      <button
                        type="button"
                        onClick={() => {
                          const targetUrl = selectedParticipant.video_signed_url || selectedParticipant.video_path || selectedParticipant.video_url;
                          if (targetUrl) {
                            setSelectedParticipant(null);
                            setPlayingVideo({ url: targetUrl, title: `${selectedParticipant.full_name} (${selectedParticipant.participant_number})` });
                          }
                        }}
                        style={{
                          padding: "8px 18px",
                          background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
                        }}
                      >
                        <Play size={14} fill="#fff" /> ▶ Watch Video
                      </button>
                    ) : (
                      <span style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic", fontWeight: 600 }}>
                        No performance video uploaded
                      </span>
                    )}
                  </div>

                  {/* ID Proof File */}
                  <div style={{ background: "#F0FDF4", borderRadius: 16, padding: 20, border: "1.5px solid #BBF7D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#14532D", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <FileText size={18} color="#16A34A" /> ID Proof Document
                      </h4>
                      <p style={{ fontSize: 12.5, color: "#15803D", margin: "4px 0 0" }}>
                        Government ID document uploaded during registration.
                      </p>
                    </div>
                    {selectedParticipant.id_proof_url ? (
                      <a
                        href={selectedParticipant.id_proof_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: "8px 18px",
                          background: "#16A34A",
                          color: "#fff",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <ExternalLink size={14} /> View ID Proof
                      </a>
                    ) : (
                      <span style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic", fontWeight: 600 }}>
                        Not uploaded
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 28px", background: "#F8FAFC", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    const p = selectedParticipant;
                    setSelectedParticipant(null);
                    openMessageModal(p);
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#FAF5FF",
                    color: "#6D28D9",
                    border: "1px solid #E9D5FF",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <MessageSquare size={15} /> Message Participant
                </button>
              </div>

              <button
                onClick={() => setSelectedParticipant(null)}
                style={{ padding: "10px 24px", background: "#0F172A", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer", fontSize: 13 }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
