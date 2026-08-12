"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  Search,
  Filter,
  ArrowLeft,
  Video,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  Award,
  Star,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  X,
  Play,
  FileText,
  Megaphone,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  event_date?: string;
  venue?: string;
  city?: string;
}

interface EventParticipantItem {
  id: string;
  participant_number: string;
  full_name: string;
  email: string;
  phone: string;
  registration_id?: string;
  registration_number?: string;
  registration_status?: string;
  payment_status?: string;
  registration_amount?: number;
  video_url?: string | null;
  video_signed_url?: string | null;
  created_at?: string;
  attendance?: "present" | "absent";
  // Assigned Result
  result?: {
    id?: string;
    result_type: "winner" | "runner_up" | "finalist" | "special_mention" | "participant" | "pending";
    position?: number;
    selected_at?: string;
    notes?: string;
  };
  details?: any;
}

const RESULT_OPTIONS = [
  { value: "winner", label: "Winner", badge: "🏆 Winner", color: "#D97706", bg: "#FEF3C7", pos: 1 },
  { value: "runner_up", label: "Runner-up", badge: "🥈 Runner-up", color: "#475569", bg: "#F1F5F9", pos: 2 },
  { value: "finalist", label: "Finalist", badge: "🥉 Finalist", color: "#B45309", bg: "#FFEDD5", pos: 3 },
  { value: "special_mention", label: "Special Mention", badge: "⭐ Special Mention", color: "#6D28D9", bg: "#F3E8FF", pos: 4 },
  { value: "participant", label: "Participant", badge: "👤 Participant", color: "#2563EB", bg: "#EFF6FF", pos: 5 },
  { value: "pending", label: "No Result / Pending", badge: "⏳ Pending", color: "#64748B", bg: "#F8FAFC", pos: 99 },
];

export default function AdminEventParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();

  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [participants, setParticipants] = useState<EventParticipantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [resultFilter, setResultFilter] = useState("all");

  // Modals state
  const [videoModal, setVideoModal] = useState<{ url: string; title: string } | null>(null);
  const [detailModal, setDetailModal] = useState<EventParticipantItem | null>(null);
  const [resultModal, setResultModal] = useState<EventParticipantItem | null>(null);
  const [announceModal, setAnnounceModal] = useState<EventParticipantItem | null>(null);
  const [messageModal, setMessageModal] = useState<EventParticipantItem | null>(null);

  // Form State for Result Selection
  const [selectedResultType, setSelectedResultType] = useState<string>("winner");
  const [positionRank, setPositionRank] = useState<number>(1);
  const [resultNotes, setResultNotes] = useState<string>("");
  const [notifyParticipant, setNotifyParticipant] = useState<boolean>(true);
  const [sendEmail, setSendEmail] = useState<boolean>(false);
  const [savingResult, setSavingResult] = useState<boolean>(false);

  // Form State for Messaging
  const [msgSubject, setMsgSubject] = useState<string>("");
  const [msgBody, setMsgBody] = useState<string>("");
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Attendance local state toggle map
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "present" | "absent">>({});

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Fetch Event details and participant list with assigned results
  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Event Details
      let fetchedEvent: any = null;
      const evtRes = await fetch(`/api/events/${encodeURIComponent(eventId)}`);
      if (evtRes.ok) {
        const evtJson = await evtRes.json();
        fetchedEvent = evtJson.event || evtJson;
        setEventData(fetchedEvent);
      }

      // 2. Fetch all participants from global participant API
      const partsRes = await fetch("/api/participants");
      let allParticipants: any[] = [];
      if (partsRes.ok) {
        const partsJson = await partsRes.json();
        allParticipants = partsJson.participants || [];
      }

      // Filter participants who registered for this event
      const targetTitle = fetchedEvent?.title;
      const eventParts = allParticipants.filter((p) => {
        if (p.event_id && p.event_id === eventId) return true;
        if (targetTitle && p.event_title && p.event_title.toLowerCase() === targetTitle.toLowerCase()) return true;
        if (!p.event_id && (!p.event_title || p.event_title === "N/A")) return true;
        return false;
      });

      // 3. Fetch Event Results for this event
      const resRes = await fetch(`/api/events/${encodeURIComponent(eventId)}/results`);
      let resultsMap: Record<string, any> = {};
      if (resRes.ok) {
        const resJson = await resRes.json();
        (resJson.results || []).forEach((r: any) => {
          resultsMap[r.participant_id] = r;
        });
      }

      const combined: EventParticipantItem[] = eventParts.map((p) => {
        const r = resultsMap[p.id];
        return {
          ...p,
          attendance: attendanceMap[p.id] || "present",
          result: r
            ? {
                id: r.id,
                result_type: r.result_type || "pending",
                position: r.position,
                selected_at: r.selected_at,
                notes: r.notes,
              }
            : {
                result_type: "pending",
                position: 99,
              },
        };
      });

      setParticipants(combined);
    } catch (err) {
      console.error("Error loading event participants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const openResultModal = (p: EventParticipantItem) => {
    setResultModal(p);
    const currRes = p.result?.result_type || "winner";
    setSelectedResultType(currRes);
    const opt = RESULT_OPTIONS.find((o) => o.value === currRes);
    setPositionRank(p.result?.position || opt?.pos || 1);
    setResultNotes(p.result?.notes || "");
    setNotifyParticipant(true);
    setSendEmail(false);
  };

  const handleSaveResult = async (withNotify: boolean) => {
    if (!resultModal) return;
    try {
      setSavingResult(true);
      const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: resultModal.id,
          registration_id: resultModal.registration_id,
          result_type: selectedResultType,
          position: positionRank,
          notes: resultNotes,
          notify: withNotify,
          send_email: sendEmail,
        }),
      });

      if (res.ok) {
        const opt = RESULT_OPTIONS.find((o) => o.value === selectedResultType);
        showToast(
          `Result updated: ${resultModal.full_name} is marked as ${opt?.label || selectedResultType}${
            withNotify ? " (Notification Sent)" : ""
          }`
        );
        setResultModal(null);
        setAnnounceModal(null);
        loadData();
      } else {
        const errJson = await res.json();
        alert(`Error saving result: ${errJson.error || "Failed"}`);
      }
    } catch (err) {
      console.error("Error saving result:", err);
    } finally {
      setSavingResult(false);
    }
  };

  const openMessageModal = (p: EventParticipantItem) => {
    setMessageModal(p);
    setMsgSubject(`Important Update regarding ${eventData?.title || "CGS Festival"}`);
    setMsgBody(
      `Congratulations ${p.full_name}! 🎉\n\nYou have been selected as the ${
        p.result?.result_type === "winner" ? "Winner" : "Participant"
      } of ${eventData?.title || "CGS Festival"}.\n\nYour certificate and next round details will be available soon.\n\nRegards,\nCGS Entertainments`
    );
  };

  const handleSendMessage = async () => {
    if (!messageModal) return;
    try {
      setSendingMsg(true);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: messageModal.id,
          event_id: eventId,
          subject: msgSubject,
          message: msgBody,
          notify: true,
          send_email: sendEmail,
        }),
      });

      if (res.ok) {
        showToast(`Message sent to ${messageModal.full_name} and in-app notification created!`);
        setMessageModal(null);
      } else {
        const errJson = await res.json();
        alert(`Failed to send message: ${errJson.error}`);
      }
    } catch (err) {
      console.error("Failed sending message:", err);
    } finally {
      setSendingMsg(false);
    }
  };

  const toggleAttendance = (pId: string) => {
    setAttendanceMap((prev) => {
      const nextVal = prev[pId] === "absent" ? "present" : "absent";
      return { ...prev, [pId]: nextVal };
    });
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      (p.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.participant_number || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesResult =
      resultFilter === "all" || (p.result?.result_type || "pending") === resultFilter;

    return matchesSearch && matchesResult;
  });

  const getBadge = (resultType?: string) => {
    const opt = RESULT_OPTIONS.find((o) => o.value === (resultType || "pending"));
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 10px",
          borderRadius: 8,
          background: opt?.bg || "#F8FAFC",
          color: opt?.color || "#64748B",
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        {opt?.badge || "⏳ Pending"}
      </span>
    );
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1440, margin: "0 auto", fontFamily: "inherit" }}>
      {/* Success Toast */}
      {successToast && (
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
          <CheckCircle2 size={20} color="#fff" /> {successToast}
        </div>
      )}

      {/* Top Header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/events"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            fontWeight: 700,
            color: "#6D28D9",
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={16} /> Back to Events List
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 10 }}>
              <Trophy size={28} color="#6D28D9" /> Participant Registry & Result Selection
            </h1>
            <p style={{ fontSize: 14.5, color: "#64748B", margin: 0 }}>
              Event: <strong style={{ color: "#0F172A" }}>{eventData?.title || "CGS Dance Fest 2026"}</strong> | Review performance submissions and assign competition results.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={loadData}
              style={{
                padding: "10px 18px",
                background: "#F3E8FF",
                color: "#6D28D9",
                border: "none",
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1.5px solid #E2E8F0",
          padding: 16,
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 280 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 14, top: 12 }} />
          <input
            type="text"
            placeholder="Search participant by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 42px",
              borderRadius: 10,
              border: "1.5px solid #CBD5E1",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
            <Filter size={14} /> Result:
          </span>
          {["all", "winner", "runner_up", "finalist", "special_mention", "participant", "pending"].map((rKey) => {
            const active = resultFilter === rKey;
            const labelMap: Record<string, string> = {
              all: "All",
              winner: "🏆 Winner",
              runner_up: "🥈 Runner-up",
              finalist: "🥉 Finalist",
              special_mention: "⭐ Special Mention",
              participant: "👤 Participant",
              pending: "⏳ Pending",
            };
            return (
              <button
                key={rKey}
                type="button"
                onClick={() => setResultFilter(rKey)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 800,
                  border: active ? "1.5px solid #6D28D9" : "1.5px solid #E2E8F0",
                  background: active ? "#6D28D9" : "#ffffff",
                  color: active ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {labelMap[rKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Participants Table */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#64748B", fontSize: 15, fontWeight: 600 }}>
          Loading participant registry & results...
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div style={{ background: "#fff", padding: 48, textAlign: "center", borderRadius: 16, border: "1px solid #E2E8F0" }}>
          <Users size={40} color="#94A3B8" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>No participants found</h3>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>Try clearing your search query or filter selection.</p>
        </div>
      ) : (
        <div style={{ background: "#ffffff", borderRadius: 16, border: "1.5px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0", color: "#475569", fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>
                <th style={{ padding: "14px 18px" }}>Participant Info</th>
                <th style={{ padding: "14px 18px" }}>Contact</th>
                <th style={{ padding: "14px 18px" }}>Performance</th>
                <th style={{ padding: "14px 18px" }}>Result Status</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((p) => {
                const videoTarget = p.video_signed_url || p.video_url;

                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    {/* Participant Info */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{p.full_name}</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                        ID: <span style={{ fontWeight: 700 }}>{p.participant_number || p.id.substring(0, 8)}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", display: "flex", alignItems: "center", gap: 5 }}>
                        <Mail size={13} color="#6D28D9" /> {p.email}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <Phone size={13} color="#6D28D9" /> {p.phone || "N/A"}
                      </div>
                    </td>

                    {/* Performance / Video */}
                    <td style={{ padding: "14px 18px" }}>
                      {videoTarget ? (
                        <button
                          type="button"
                          onClick={() => setVideoModal({ url: videoTarget, title: `${p.full_name} Audition` })}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            background: "#F3E8FF",
                            color: "#6D28D9",
                            border: "1px solid #DDD6FE",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          <Play size={13} fill="#6D28D9" /> Watch Video
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic" }}>No Video Uploaded</span>
                      )}
                    </td>

                    {/* Result Status */}
                    <td style={{ padding: "14px 18px" }}>
                      <div>{getBadge(p.result?.result_type)}</div>
                      {p.result?.selected_at && (
                        <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                          Updated {new Date(p.result.selected_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        {/* Select Result Button */}
                        <button
                          type="button"
                          onClick={() => openResultModal(p)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1.5px solid #6D28D9",
                            background: "#6D28D9",
                            color: "#ffffff",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Trophy size={14} color="#fff" /> Select Result
                        </button>

                        {/* Announce Result Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setAnnounceModal(p);
                            setSelectedResultType(p.result?.result_type || "winner");
                          }}
                          title="Announce Result"
                          style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "1px solid #F59E0B",
                            background: "#FEF3C7",
                            color: "#B45309",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Megaphone size={14} /> Announce
                        </button>

                        {/* Message Participant */}
                        <button
                          type="button"
                          onClick={() => openMessageModal(p)}
                          title="Message Participant"
                          style={{
                            padding: 6,
                            borderRadius: 8,
                            border: "1px solid #CBD5E1",
                            background: "#fff",
                            color: "#334155",
                            cursor: "pointer",
                          }}
                        >
                          <Send size={15} />
                        </button>

                        {/* View Full Details */}
                        <button
                          type="button"
                          onClick={() => setDetailModal(p)}
                          title="View Details"
                          style={{
                            padding: 6,
                            borderRadius: 8,
                            border: "1px solid #CBD5E1",
                            background: "#fff",
                            color: "#475569",
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── RESULT SELECTION MODAL ── */}
      {resultModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 540, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
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

            {/* Event Name */}
            <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: 12, marginBottom: 20, border: "1px solid #E2E8F0", fontSize: 13.5, color: "#334155" }}>
              Event: <strong style={{ color: "#0F172A" }}>{eventData?.title || "CGS Competition"}</strong>
            </div>

            {/* Result Type Selection */}
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

            {/* Position / Rank */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                Position / Ranking Number:
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

            {/* Optional Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>
                Jury / Admin Feedback Notes (Optional):
              </label>
              <textarea
                rows={2}
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                placeholder="e.g. Outstanding choreography and stage expressiveness..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13.5, resize: "vertical" }}
              />
            </div>

            {/* Notification Checkboxes */}
            <div style={{ background: "#FAF5FF", padding: 14, borderRadius: 12, border: "1px solid #E9D5FF", marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 800, color: "#6D28D9", cursor: "pointer", marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={notifyParticipant}
                  onChange={(e) => setNotifyParticipant(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "#6D28D9" }}
                />
                ☑ Notify participant (Creates in-app notification)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 700, color: "#475569", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#6D28D9" }}
                />
                ☑ Send email notification (Logs to email audit table)
              </label>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => handleSaveResult(false)}
                disabled={savingResult}
                style={{
                  padding: "11px 18px",
                  borderRadius: 12,
                  border: "1.5px solid #CBD5E1",
                  background: "#ffffff",
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                Save Result Only
              </button>

              <button
                type="button"
                onClick={() => handleSaveResult(true)}
                disabled={savingResult}
                style={{
                  padding: "11px 22px",
                  borderRadius: 12,
                  border: "none",
                  background: "#6D28D9",
                  fontSize: 13.5,
                  fontWeight: 900,
                  color: "#ffffff",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(109, 40, 217, 0.3)",
                }}
              >
                {savingResult ? "Saving..." : "Save Result & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ANNOUNCE RESULT CONFIRMATION MODAL ── */}
      {announceModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Megaphone size={28} color="#D97706" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>Announce Result</h3>
              <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
                You are about to officially publish the result for <strong>{announceModal.full_name}</strong>.
              </p>
            </div>

            <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 14, border: "1px solid #E2E8F0", marginBottom: 20, fontSize: 13.5 }}>
              <div><strong>Event:</strong> {eventData?.title || "CGS Event"}</div>
              <div style={{ marginTop: 4 }}><strong>Selected Result:</strong> {getBadge(selectedResultType)}</div>
              <div style={{ marginTop: 6, color: "#64748B", fontSize: 12.5 }}>
                Notification: "Congratulations! You have been selected as the Winner of {eventData?.title || "CGS Event"}."
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setAnnounceModal(null)}
                style={{ padding: "10px 18px", borderRadius: 12, border: "1px solid #CBD5E1", background: "#fff", fontWeight: 700, color: "#334155", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveResult(true)}
                disabled={savingResult}
                style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: "#D97706", fontWeight: 900, color: "#fff", cursor: "pointer" }}
              >
                {savingResult ? "Publishing..." : "Announce Result"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MESSAGE PARTICIPANT MODAL ── */}
      {messageModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, width: "100%", maxWidth: 520, padding: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Send size={20} color="#6D28D9" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>Message Participant</h3>
                  <div style={{ fontSize: 13, color: "#64748B" }}>Recipient: <strong>{messageModal.full_name}</strong> ({messageModal.email})</div>
                </div>
              </div>
              <button type="button" onClick={() => setMessageModal(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} color="#94A3B8" /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>Subject:</label>
              <input
                type="text"
                value={msgSubject}
                onChange={(e) => setMsgSubject(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14 }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>Message Content:</label>
              <textarea
                rows={5}
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13.5, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
                style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "#6D28D9", fontWeight: 900, color: "#fff", cursor: "pointer" }}
              >
                {sendingMsg ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIDEO PLAYER MODAL ── */}
      {videoModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: 20 }}>
          <div style={{ background: "#0F172A", borderRadius: 20, width: "100%", maxWidth: 800, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ padding: "16px 24px", background: "#1E293B", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
              <div style={{ fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <Video size={18} color="#A78BFA" /> {videoModal.title}
              </div>
              <button type="button" onClick={() => setVideoModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={22} color="#94A3B8" /></button>
            </div>
            <div style={{ padding: 12, background: "#000", display: "flex", justifyContent: "center" }}>
              <video src={videoModal.url} controls autoPlay style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 10 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
