"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Trophy,
  Award,
  Filter,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
  Users,
  Eye,
  Send,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface EventOption {
  id: string;
  title: string;
  category_id?: string;
  event_date?: string;
  status?: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface RosterItem {
  registration_id: string;
  registration_number: string;
  event_id: string;
  event_title: string;
  participant_id: string;
  participant_number: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  category_id?: string | null;
  category_name: string;

  // Type & Team info
  reg_type: "solo" | "duo" | "group";
  team_name?: string | null;
  member_summary: string;
  members?: any[];
  dance_style?: string | null;
  age_cat?: string | null;

  // Media
  video_url?: string | null;
  doc_urls?: Record<string, string>;

  // Result info
  result_id?: string | null;
  has_result: boolean;
  result_type: string; // winner, first_place, second_place, third_place, runner_up, finalist, qualified, participant, disqualified, pending
  position: number | null;
  score: number | null;
  notes: string;
  is_published: boolean;
  updated_at?: string;

  // Certification eligibility
  certification_eligibility?: {
    eligible: boolean;
    certificate_type: string | null;
    status: "issued" | "eligible" | "ineligible";
    certificate_number?: string | null;
    reason?: string | null;
  };

  // Inline Draft State
  draft_position?: number | null | "";
  draft_score?: number | null | "";
  draft_result_type?: string;
  draft_notes?: string;
  is_dirty?: boolean;
}

function AdminResultsContent() {
  const searchParams = useSearchParams();
  const queryEventId = searchParams.get("eventId") || searchParams.get("event_id") || "all";

  // System Data
  const [eventsList, setEventsList] = useState<EventOption[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>([]);
  const [roster, setRoster] = useState<RosterItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [selectedEventId, setSelectedEventId] = useState<string>(queryEventId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedRegType, setSelectedRegType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Participant Detail Modal Target
  const [detailTarget, setDetailTarget] = useState<RosterItem | null>(null);

  // Auto-dismiss success toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Fetch event participant roster
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const queryParams = new URLSearchParams();
      if (selectedEventId) queryParams.set("eventId", selectedEventId);
      if (selectedCategoryId !== "all") queryParams.set("categoryId", selectedCategoryId);
      if (selectedRegType !== "all") queryParams.set("regType", selectedRegType);
      if (selectedStatus !== "all") queryParams.set("status", selectedStatus);
      if (searchQuery.trim()) queryParams.set("search", searchQuery.trim());
      queryParams.set("t", Date.now().toString());

      const res = await fetch(`/api/admin/results?${queryParams.toString()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch event roster results from Supabase");
      }

      const fetchedEvents: EventOption[] = data.events || [];
      setEventsList(fetchedEvents);
      setCategoriesList(data.categories || []);

      // If selectedEventId is 'all' or empty, update selectedEventId to data.selectedEventId
      if ((selectedEventId === "all" || !selectedEventId) && data.selectedEventId) {
        setSelectedEventId(data.selectedEventId);
      }

      // Initialize roster items with draft inline state
      const initialRoster: RosterItem[] = (data.results || []).map((item: RosterItem) => ({
        ...item,
        draft_position: item.position !== null ? item.position : "",
        draft_score: item.score !== null ? item.score : "",
        draft_result_type: item.result_type || "pending",
        draft_notes: item.notes || "",
        is_dirty: false,
      }));

      setRoster(initialRoster);
    } catch (err: any) {
      console.error("Error fetching admin results roster:", err);
      setErrorMsg(err.message || "An error occurred while loading participants");
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, selectedCategoryId, selectedRegType, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Field Edits Inline
  const handleFieldChange = (
    registrationId: string,
    field: "draft_position" | "draft_score" | "draft_result_type" | "draft_notes",
    value: any
  ) => {
    setRoster((prev) =>
      prev.map((item) => {
        if (item.registration_id !== registrationId) return item;

        const updated = { ...item, [field]: value };

        // Determine if dirty
        const isPosChanged = String(updated.draft_position) !== String(item.position ?? "");
        const isScoreChanged = String(updated.draft_score) !== String(item.score ?? "");
        const isTypeChanged = updated.draft_result_type !== item.result_type;
        const isNotesChanged = updated.draft_notes !== item.notes;

        updated.is_dirty = isPosChanged || isScoreChanged || isTypeChanged || isNotesChanged;
        return updated;
      })
    );
  };

  // Count unsaved modified rows
  const dirtyRows = useMemo(() => roster.filter((r) => r.is_dirty), [roster]);

  // Save Single Row
  const handleSaveRow = async (item: RosterItem) => {
    try {
      setSavingRowId(item.registration_id);
      setErrorMsg(null);

      const payload = {
        event_id: item.event_id,
        participant_id: item.participant_id,
        registration_id: item.registration_id,
        category_id: item.category_id || null,
        result_type: item.draft_result_type || "pending",
        position: item.draft_position !== "" && item.draft_position !== null ? Number(item.draft_position) : null,
        score: item.draft_score !== "" && item.draft_score !== null ? Number(item.draft_score) : null,
        notes: item.draft_notes || null,
        notify: false,
      };

      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save result row to Supabase");
      }

      setSuccessToast(`Result saved for ${item.member_summary || item.full_name}!`);

      // Clear dirty state for this row
      setRoster((prev) =>
        prev.map((r) => {
          if (r.registration_id === item.registration_id) {
            return {
              ...r,
              has_result: payload.result_type !== "pending",
              result_type: payload.result_type,
              position: payload.position,
              score: payload.score,
              notes: payload.notes || "",
              is_dirty: false,
            };
          }
          return r;
        })
      );
    } catch (err: any) {
      console.error("Error saving row result:", err);
      setErrorMsg(err.message || "Failed to save result");
    } finally {
      setSavingRowId(null);
    }
  };

  // Save All Changes (Batch Update)
  const handleSaveAllChanges = async () => {
    if (dirtyRows.length === 0) return;
    try {
      setSavingAll(true);
      setErrorMsg(null);

      const updates = dirtyRows.map((item) => ({
        event_id: item.event_id,
        participant_id: item.participant_id,
        registration_id: item.registration_id,
        category_id: item.category_id || null,
        result_type: item.draft_result_type || "pending",
        position: item.draft_position !== "" && item.draft_position !== null ? Number(item.draft_position) : null,
        score: item.draft_score !== "" && item.draft_score !== null ? Number(item.draft_score) : null,
        notes: item.draft_notes || null,
        notify: false,
      }));

      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ updates }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to batch save results to Supabase");
      }

      setSuccessToast(`Successfully saved results for ${updates.length} participants to Supabase!`);
      fetchData();
    } catch (err: any) {
      console.error("Error saving all results:", err);
      setErrorMsg(err.message || "Failed to batch save results");
    } finally {
      setSavingAll(false);
    }
  };

  // Publish Event Results & Send Notifications
  const handlePublishResults = async () => {
    if (!selectedEventId || selectedEventId === "all") return;
    const confirmPublish = window.confirm(
      "Are you sure you want to publish results for this event? Non-pending results will become visible and notifications will be sent."
    );
    if (!confirmPublish) return;

    try {
      setPublishing(true);
      setErrorMsg(null);

      const readyItems = roster.filter((r) => (r.draft_result_type || r.result_type) !== "pending");

      const updates = readyItems.map((item) => ({
        event_id: item.event_id,
        participant_id: item.participant_id,
        registration_id: item.registration_id,
        category_id: item.category_id || null,
        result_type: item.draft_result_type || item.result_type,
        position: item.draft_position !== "" && item.draft_position !== null ? Number(item.draft_position) : (item.position ?? 99),
        score: item.draft_score !== "" && item.draft_score !== null ? Number(item.draft_score) : item.score,
        notes: item.draft_notes || item.notes,
        is_published: true,
        notify: true,
      }));

      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ updates }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish results");
      }

      setSuccessToast(`Results published successfully! Notifications sent to ${updates.length} participants.`);
      fetchData();
    } catch (err: any) {
      console.error("Error publishing results:", err);
      setErrorMsg(err.message || "Failed to publish results");
    } finally {
      setPublishing(false);
    }
  };

  const getResultBadge = (type?: string) => {
    switch (type) {
      case "winner":
        return { label: "🏆 WINNER", bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" };
      case "first_place":
        return { label: "🥇 1ST PLACE", bg: "#FEF9C3", color: "#854D0E", border: "#FEF08A" };
      case "second_place":
        return { label: "🥈 2ND PLACE", bg: "#F1F5F9", color: "#334155", border: "#CBD5E1" };
      case "third_place":
        return { label: "🥉 3RD PLACE", bg: "#FFEDD5", color: "#C2410C", border: "#FED7AA" };
      case "runner_up":
        return { label: "🥈 RUNNER-UP", bg: "#E2E8F0", color: "#1E293B", border: "#94A3B8" };
      case "finalist":
        return { label: "🥉 FINALIST", bg: "#FFEDD5", color: "#9A3412", border: "#FDBA74" };
      case "special_mention":
        return { label: "⭐ SPECIAL MENTION", bg: "#F3E8FF", color: "#6B21A8", border: "#E9D5FF" };
      case "qualified":
        return { label: "✓ QUALIFIED", bg: "#DCFCE7", color: "#15803D", border: "#BBF7D0" };
      case "participant":
        return { label: "🎓 PARTICIPATED", bg: "#E0F2FE", color: "#0369A1", border: "#BAE6FD" };
      case "disqualified":
        return { label: "✕ DISQUALIFIED", bg: "#FEE2E2", color: "#B91C1C", border: "#FECACA" };
      default:
        return { label: "⏳ PENDING", bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
    }
  };

  const getRegTypeBadge = (type: "solo" | "duo" | "group") => {
    switch (type) {
      case "duo":
        return { label: "DUO", bg: "#EFF6FF", color: "#1D4ED8" };
      case "group":
        return { label: "GROUP", bg: "#FEF3C7", color: "#B45309" };
      default:
        return { label: "SOLO", bg: "#F3E8FF", color: "#7E22CE" };
    }
  };

  // Pagination Logic
  const totalItems = roster.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedRoster = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return roster.slice(start, start + pageSize);
  }, [roster, currentPage, pageSize]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 50 }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 10 }}>
            <Trophy style={{ color: "#7C3AED" }} size={28} />
            Results & Winner Management
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Select an event to view all registered participants, enter positions & scores inline, and save or publish competition results.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 12,
              background: "#F1F5F9",
              color: "#334155",
              border: "1px solid #CBD5E1",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            type="button"
            onClick={handlePublishResults}
            disabled={publishing || loading || roster.length === 0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 12,
              background: "#15803D",
              color: "#ffffff",
              border: "none",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(21, 128, 61, 0.2)",
            }}
          >
            <Send size={15} /> {publishing ? "Publishing..." : "Publish Event Results"}
          </button>

          <button
            type="button"
            onClick={handleSaveAllChanges}
            disabled={dirtyRows.length === 0 || savingAll}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 22px",
              borderRadius: 12,
              background: dirtyRows.length > 0 ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" : "#94A3B8",
              color: "#ffffff",
              border: "none",
              fontSize: 13,
              fontWeight: 800,
              cursor: dirtyRows.length > 0 ? "pointer" : "not-allowed",
              boxShadow: dirtyRows.length > 0 ? "0 4px 14px rgba(124, 58, 237, 0.3)" : "none",
            }}
          >
            <Save size={16} />
            {savingAll ? "Saving..." : `Save All Changes (${dirtyRows.length})`}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div
          style={{
            background: "#DCFCE7",
            border: "1px solid #86EFAC",
            color: "#166534",
            padding: "14px 18px",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={18} style={{ color: "#16A34A" }} />
            {successToast}
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            style={{ background: "none", border: "none", color: "#166534", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div
          style={{
            background: "#FEE2E2",
            border: "1px solid #FCA5A5",
            color: "#991B1B",
            padding: "14px 18px",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={18} style={{ color: "#DC2626" }} />
            {errorMsg}
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            style={{ background: "none", border: "none", color: "#991B1B", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {dirtyRows.length > 0 && (
        <div
          style={{
            background: "#FEF3C7",
            border: "1px solid #FDE68A",
            color: "#B45309",
            padding: "12px 18px",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={16} /> You have <strong>{dirtyRows.length} unsaved result edit(s)</strong> in this table.
          </div>
          <button
            type="button"
            onClick={handleSaveAllChanges}
            disabled={savingAll}
            style={{ padding: "6px 14px", borderRadius: 8, background: "#B45309", color: "#fff", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
          >
            {savingAll ? "Saving..." : "Save Now"}
          </button>
        </div>
      )}

      {/* Event Selection & Filters Bar */}
      <div style={{ background: "#fff", padding: 20, borderRadius: 18, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {/* Primary Event Selector */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 900, color: "#7C3AED", marginBottom: 6, letterSpacing: "0.5px" }}>
              <Trophy size={14} /> SELECT EVENT <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid #7C3AED", fontSize: 13.5, fontWeight: 800, background: "#FFF5FF", color: "#0F172A", outline: "none" }}
            >
              {eventsList.map((evt) => {
                const dateStr = evt.event_date ? new Date(evt.event_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
                const statusStr = evt.status ? ` • ${evt.status.replace("_", " ").toUpperCase()}` : "";
                return (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} {dateStr || statusStr ? `(${dateStr}${statusStr})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Competition Category Filter */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 6, letterSpacing: "0.5px" }}>COMPETITION CATEGORY</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 600, background: "#fff" }}
            >
              <option value="all">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Registration Type Filter */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 6, letterSpacing: "0.5px" }}>REGISTRATION TYPE</label>
            <select
              value={selectedRegType}
              onChange={(e) => {
                setSelectedRegType(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 600, background: "#fff" }}
            >
              <option value="all">All Types (Solo / Duo / Group)</option>
              <option value="solo">Solo</option>
              <option value="duo">Duo / Pair</option>
              <option value="group">Group / Team</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 6, letterSpacing: "0.5px" }}>SEARCH PARTICIPANT / TEAM</label>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input
                type="text"
                placeholder="Search name, team, phone, REG#..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: "100%", padding: "9.5px 12px 9.5px 36px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, outline: "none" }}
              />
            </div>
          </div>
        </div>

        {/* Result Status Tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingTop: 4 }}>
          {[
            { id: "all", label: "All Statuses" },
            { id: "winner", label: "🏆 Winner" },
            { id: "first_place", label: "🥇 1st Place" },
            { id: "second_place", label: "🥈 2nd Place" },
            { id: "third_place", label: "🥉 3rd Place" },
            { id: "runner_up", label: "🥈 Runner-Up" },
            { id: "finalist", label: "🥉 Finalist" },
            { id: "qualified", label: "✓ Qualified" },
            { id: "participant", label: "🎓 Participated" },
            { id: "disqualified", label: "✕ Disqualified" },
            { id: "pending", label: "⏳ Pending" },
          ].map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedStatus(tab.id);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 18,
                  fontSize: 12,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "#ffffff" : "#475569",
                  background: isActive ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" : "#F1F5F9",
                  border: "none",
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

      {/* Master Event Roster Table */}
      {loading ? (
        <div style={{ background: "#fff", padding: "60px 0", borderRadius: 18, border: "1px solid #E2E8F0", textAlign: "center", color: "#64748B", fontWeight: 600 }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px", color: "#7C3AED" }} />
          Loading registered participants and results for selected event...
        </div>
      ) : roster.length === 0 ? (
        <div style={{ background: "#fff", padding: "60px 20px", borderRadius: 18, border: "1px solid #E2E8F0", textAlign: "center" }}>
          <Users size={48} style={{ color: "#CBD5E1", margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>No Registered Participants Found</h3>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
            No registered participants match your selected filters for this event. Try switching the Event or clearing search filters.
          </p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", color: "#475569", fontWeight: 800 }}>
                  <th style={{ padding: "14px 12px", width: 40, textAlign: "center" }}>#</th>
                  <th style={{ padding: "14px 16px", minWidth: 200 }}>PARTICIPANT / TEAM</th>
                  <th style={{ padding: "14px 12px", width: 85 }}>TYPE</th>
                  <th style={{ padding: "14px 14px", minWidth: 120 }}>COMPETITION</th>
                  <th style={{ padding: "14px 12px", width: 110 }}>POSITION</th>
                  <th style={{ padding: "14px 12px", width: 110 }}>SCORE</th>
                  <th style={{ padding: "14px 14px", minWidth: 160 }}>RESULT STATUS</th>
                  <th style={{ padding: "14px 14px", minWidth: 160 }}>CERTIFICATION ELIGIBILITY</th>
                  <th style={{ padding: "14px 14px", minWidth: 180 }}>JUDGES NOTES</th>
                  <th style={{ padding: "14px 16px", textAlign: "right", minWidth: 150 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRoster.map((r, index) => {
                  const globalIdx = (currentPage - 1) * pageSize + index + 1;
                  const regBadge = getRegTypeBadge(r.reg_type);
                  const isDirty = r.is_dirty;

                  return (
                    <tr
                      key={r.registration_id}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        background: isDirty ? "#FFFDF5" : "transparent",
                        transition: "background 0.2s ease",
                      }}
                    >
                      {/* Index */}
                      <td style={{ padding: "14px 12px", textAlign: "center", fontWeight: 700, color: "#94A3B8" }}>
                        {globalIdx}
                      </td>

                      {/* Participant / Team Info */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
                          {r.member_summary || r.full_name}
                          {isDirty && (
                            <span style={{ background: "#F59E0B", width: 7, height: 7, borderRadius: "50%", display: "inline-block" }} title="Unsaved edit" />
                          )}
                        </div>

                        {r.team_name && r.reg_type !== "solo" && (
                          <div style={{ fontSize: 11.5, color: "#7C3AED", fontWeight: 700 }}>Team: {r.team_name}</div>
                        )}

                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                          {r.registration_number} {r.phone ? `• ${r.phone}` : ""}
                        </div>
                      </td>

                      {/* Registration Type */}
                      <td style={{ padding: "14px 12px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: regBadge.bg,
                            color: regBadge.color,
                            fontSize: 10.5,
                            fontWeight: 900,
                          }}
                        >
                          {regBadge.label}
                        </span>
                      </td>

                      {/* Category */}
                      <td style={{ padding: "14px 14px", color: "#475569", fontWeight: 700 }}>
                        {r.category_name}
                      </td>

                      {/* Position / Rank Inline Input */}
                      <td style={{ padding: "14px 12px" }}>
                        <input
                          type="number"
                          min={1}
                          placeholder="Rank #"
                          value={r.draft_position ?? ""}
                          onChange={(e) => handleFieldChange(r.registration_id, "draft_position", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "7px 8px",
                            borderRadius: 8,
                            border: isDirty ? "2px solid #F59E0B" : "1px solid #CBD5E1",
                            fontSize: 13,
                            fontWeight: 700,
                            outline: "none",
                            background: "#fff",
                          }}
                        />
                      </td>

                      {/* Score Inline Input */}
                      <td style={{ padding: "14px 12px" }}>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Pts"
                          value={r.draft_score ?? ""}
                          onChange={(e) => handleFieldChange(r.registration_id, "draft_score", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "7px 8px",
                            borderRadius: 8,
                            border: isDirty ? "2px solid #F59E0B" : "1px solid #CBD5E1",
                            fontSize: 13,
                            fontWeight: 700,
                            outline: "none",
                            background: "#fff",
                          }}
                        />
                      </td>

                      {/* Result Status Inline Select */}
                      <td style={{ padding: "14px 14px" }}>
                        <select
                          value={r.draft_result_type || "pending"}
                          onChange={(e) => handleFieldChange(r.registration_id, "draft_result_type", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "7px 8px",
                            borderRadius: 8,
                            border: isDirty ? "2px solid #F59E0B" : "1px solid #CBD5E1",
                            fontSize: 12.5,
                            fontWeight: 800,
                            outline: "none",
                            background: "#fff",
                            color: r.draft_result_type !== "pending" ? "#0F172A" : "#64748B",
                          }}
                        >
                          <option value="winner">🏆 Winner</option>
                          <option value="first_place">🥇 1st Place</option>
                          <option value="second_place">🥈 2nd Place</option>
                          <option value="third_place">🥉 3rd Place</option>
                          <option value="runner_up">🥈 Runner-Up</option>
                          <option value="finalist">🥉 Finalist</option>
                          <option value="special_mention">⭐ Special Mention</option>
                          <option value="qualified">✓ Qualified</option>
                          <option value="participant">🎓 Participated</option>
                          <option value="disqualified">✕ Disqualified</option>
                          <option value="pending">⏳ Pending</option>
                        </select>
                      </td>

                      {/* Certification Eligibility Column */}
                      <td style={{ padding: "14px 14px" }}>
                        {(() => {
                          const draftType = r.draft_result_type || r.result_type;
                          const certInfo = r.certification_eligibility;

                          if (certInfo?.status === "issued") {
                            return (
                              <span
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  background: "#ECFDF5",
                                  color: "#047857",
                                  fontSize: 11,
                                  fontWeight: 800,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                                title={`Issued Certificate #${certInfo.certificate_number || ""}`}
                              >
                                <ShieldCheck size={13} /> Issued
                              </span>
                            );
                          } else if (draftType !== "pending" && draftType !== "disqualified" && draftType !== "eliminated") {
                            return (
                              <span
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  background: "#FAF5FF",
                                  color: "#7C3AED",
                                  border: "1px solid #E9D5FF",
                                  fontSize: 11,
                                  fontWeight: 800,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Award size={13} /> Eligible ({getResultBadge(draftType).label.replace(/^[^\w\s]+\s*/, "")})
                              </span>
                            );
                          } else {
                            return (
                              <span
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  background: "#F8FAFC",
                                  color: "#94A3B8",
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                Not Eligible
                              </span>
                            );
                          }
                        })()}
                      </td>

                      {/* Judges Notes Inline Input */}
                      <td style={{ padding: "14px 14px" }}>
                        <input
                          type="text"
                          placeholder="Optional notes..."
                          value={r.draft_notes || ""}
                          onChange={(e) => handleFieldChange(r.registration_id, "draft_notes", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "7px 10px",
                            borderRadius: 8,
                            border: isDirty ? "2px solid #F59E0B" : "1px solid #CBD5E1",
                            fontSize: 12.5,
                            outline: "none",
                            background: "#fff",
                          }}
                        />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          {/* Save Row Button */}
                          <button
                            type="button"
                            onClick={() => handleSaveRow(r)}
                            disabled={savingRowId === r.registration_id}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              background: isDirty ? "#7C3AED" : "#F1F5F9",
                              color: isDirty ? "#ffffff" : "#475569",
                              border: isDirty ? "none" : "1px solid #CBD5E1",
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Save size={13} />
                            {savingRowId === r.registration_id ? "Saving..." : "Save"}
                          </button>

                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={() => setDetailTarget(r)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              background: "#F8FAFC",
                              color: "#334155",
                              border: "1px solid #CBD5E1",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            title="View Participant & Registration Details"
                          >
                            <Eye size={13} /> Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ padding: "14px 20px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} participants
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "6px 12px", borderRadius: 8, background: "#F1F5F9", border: "1px solid #CBD5E1", fontSize: 12, fontWeight: 700, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", padding: "0 4px" }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: "6px 12px", borderRadius: 8, background: "#F1F5F9", border: "1px solid #CBD5E1", fontSize: 12, fontWeight: 700, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Participant & Team Details Inspection Modal */}
      {detailTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 560, width: "100%", padding: 24, display: "flex", flexDirection: "column", gap: 18, maxHeight: "90vh", overflowY: "auto" }}>
            {/* Modal Top */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #E2E8F0", paddingBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#7C3AED", letterSpacing: "0.5px" }}>PARTICIPANT DETAILS</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "2px 0 0" }}>
                  {detailTarget.team_name || detailTarget.full_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailTarget(null)}
                style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer" }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Registration Summary Card */}
            <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12.5 }}>
              <div>
                <span style={{ color: "#64748B", fontWeight: 700 }}>Registration ID:</span>{" "}
                <strong style={{ color: "#0F172A" }}>{detailTarget.registration_number}</strong>
              </div>

              <div>
                <span style={{ color: "#64748B", fontWeight: 700 }}>Registration Type:</span>{" "}
                <strong style={{ color: "#7C3AED", textTransform: "uppercase" }}>{detailTarget.reg_type}</strong>
              </div>

              <div>
                <span style={{ color: "#64748B", fontWeight: 700 }}>Event:</span>{" "}
                <strong style={{ color: "#0F172A" }}>{detailTarget.event_title}</strong>
              </div>

              <div>
                <span style={{ color: "#64748B", fontWeight: 700 }}>Category:</span>{" "}
                <strong style={{ color: "#0F172A" }}>{detailTarget.category_name}</strong>
              </div>

              {detailTarget.dance_style && (
                <div>
                  <span style={{ color: "#64748B", fontWeight: 700 }}>Dance Style:</span>{" "}
                  <strong style={{ color: "#0F172A" }}>{detailTarget.dance_style}</strong>
                </div>
              )}

              {detailTarget.age_cat && (
                <div>
                  <span style={{ color: "#64748B", fontWeight: 700 }}>Age Category:</span>{" "}
                  <strong style={{ color: "#0F172A" }}>{detailTarget.age_cat}</strong>
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>Primary Contact Details</h4>
              <div style={{ fontSize: 13, color: "#334155", display: "flex", flexDirection: "column", gap: 4 }}>
                <div><strong>Full Name:</strong> {detailTarget.full_name}</div>
                <div><strong>Phone:</strong> {detailTarget.phone}</div>
                {detailTarget.email && <div><strong>Email:</strong> {detailTarget.email}</div>}
                {(detailTarget.city || detailTarget.state) && (
                  <div><strong>Location:</strong> {[detailTarget.city, detailTarget.state].filter(Boolean).join(", ")}</div>
                )}
              </div>
            </div>

            {/* Duo / Group Member Roster */}
            {detailTarget.reg_type !== "solo" && detailTarget.members && detailTarget.members.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>Team Members ({detailTarget.members.length})</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {detailTarget.members.map((m: any, idx: number) => (
                    <div key={idx} style={{ background: "#F1F5F9", padding: "8px 12px", borderRadius: 8, fontSize: 12.5, display: "flex", justifyContent: "space-between" }}>
                      <strong>{m.name || m.full_name || `Member ${idx + 1}`}</strong>
                      <span style={{ color: "#64748B" }}>{m.age ? `Age ${m.age}` : ""} {m.phone || ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media & Uploaded Documents */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>Audition Submission & Media</h4>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {detailTarget.video_url ? (
                  <a
                    href={detailTarget.video_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 10,
                      background: "#7C3AED",
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: 12.5,
                      fontWeight: 800,
                    }}
                  >
                    <Video size={15} /> Play Audition Video <ExternalLink size={13} />
                  </a>
                ) : (
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>No audition video attached</span>
                )}
              </div>
            </div>

            {/* Current Result Summary */}
            <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0" }}>
              <h4 style={{ fontSize: 13, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>Current Assigned Result</h4>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: getResultBadge(detailTarget.result_type).bg, color: getResultBadge(detailTarget.result_type).color, fontWeight: 900, fontSize: 12 }}>
                  {getResultBadge(detailTarget.result_type).label}
                </span>
                {detailTarget.position && <div><strong>Rank:</strong> #{detailTarget.position}</div>}
                {detailTarget.score !== null && <div><strong>Score:</strong> {detailTarget.score} pts</div>}
              </div>
              {detailTarget.notes && (
                <div style={{ marginTop: 8, fontSize: 12.5, color: "#475569" }}>
                  <strong>Notes:</strong> {detailTarget.notes}
                </div>
              )}
            </div>

            {/* Modal Bottom */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDetailTarget(null)}
                style={{ padding: "9px 20px", borderRadius: 10, background: "#7C3AED", color: "#fff", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminResultsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 60, textAlign: "center", color: "#64748B", fontWeight: 700 }}>
          Loading Admin Results...
        </div>
      }
    >
      <AdminResultsContent />
    </Suspense>
  );
}
