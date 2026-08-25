"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Search,
  AlertCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  X,
  RefreshCw,
  Award,
  Layers,
} from "lucide-react";
import { CompetitionRound, CompetitionRoundParticipant, ParticipantRoundStatus } from "@/types/competition-round";

interface CompetitionRoundsManagerProps {
  eventId: string;
  eventTitle?: string;
}

const STATUS_BADGES: Record<ParticipantRoundStatus, { label: string; bg: string; color: string; icon: string }> = {
  pending: { label: "Pending", bg: "#F8FAFC", color: "#64748B", icon: "⏳" },
  qualified: { label: "Qualified", bg: "#DCFCE7", color: "#15803D", icon: "✓" },
  eliminated: { label: "Eliminated", bg: "#FEE2E2", color: "#B91C1C", icon: "✕" },
  withdrawn: { label: "Withdrawn", bg: "#F3F4F6", color: "#4B5563", icon: "—" },
  winner: { label: "🏆 Winner", bg: "#FEF3C7", color: "#B45309", icon: "🏆" },
  runner_up: { label: "🥈 Runner-up", bg: "#F1F5F9", color: "#334155", icon: "🥈" },
  finalist: { label: "🥉 Finalist", bg: "#FFEDD5", color: "#C2410C", icon: "🥉" },
};

export function CompetitionRoundsManager({ eventId, eventTitle }: CompetitionRoundsManagerProps) {
  const [rounds, setRounds] = useState<CompetitionRound[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<CompetitionRoundParticipant[]>([]);
  const [loadingRounds, setLoadingRounds] = useState<boolean>(true);
  const [loadingParticipants, setLoadingParticipants] = useState<boolean>(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selection for bulk promotion
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([]);

  // Modals
  const [showAddRoundModal, setShowAddRoundModal] = useState<boolean>(false);
  const [editingRound, setEditingRound] = useState<CompetitionRound | null>(null);
  const [showPromoteModal, setShowPromoteModal] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<CompetitionRoundParticipant | null>(null);

  // Form State for Add / Edit Round
  const [roundNameInput, setRoundNameInput] = useState<string>("");
  const [roundNumberInput, setRoundNumberInput] = useState<number>(1);
  const [roundStatusInput, setRoundStatusInput] = useState<string>("upcoming");
  const [roundDateInput, setRoundDateInput] = useState<string>("");
  const [roundFeeInput, setRoundFeeInput] = useState<number>(0);
  const [roundDescInput, setRoundDescInput] = useState<string>("");
  const [savingRound, setSavingRound] = useState<boolean>(false);

  // Form State for Result Modal
  const [resultStatusInput, setResultStatusInput] = useState<ParticipantRoundStatus>("qualified");
  const [resultNotesInput, setResultNotesInput] = useState<string>("");
  const [savingResult, setSavingResult] = useState<boolean>(false);

  // Action State for Promotion
  const [promoting, setPromoting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4500);
  };

  // 1. Fetch Rounds List
  const fetchRounds = async () => {
    try {
      setLoadingRounds(true);
      const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/rounds`);
      if (res.ok) {
        const data = await res.json();
        const fetchedRounds: CompetitionRound[] = data.rounds || [];
        setRounds(fetchedRounds);

        // Select active round or round 1 by default
        if (fetchedRounds.length > 0 && (!selectedRoundId || !fetchedRounds.some((r) => r.id === selectedRoundId))) {
          const activeRound = fetchedRounds.find((r) => r.status === "active") || fetchedRounds[0];
          setSelectedRoundId(activeRound.id);
        }
      }
    } catch (err) {
      console.error("Error fetching competition rounds:", err);
    } finally {
      setLoadingRounds(false);
    }
  };

  // 2. Fetch Round Participants
  const fetchRoundParticipants = async (roundId: string) => {
    try {
      setLoadingParticipants(true);
      const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/rounds/${encodeURIComponent(roundId)}/participants?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
        setSelectedRegIds([]);
      }
    } catch (err) {
      console.error("Error fetching round participants:", err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, [eventId]);

  useEffect(() => {
    if (selectedRoundId) {
      fetchRoundParticipants(selectedRoundId);
    }
  }, [selectedRoundId, statusFilter, searchQuery]);

  // Open Modal to Add Round
  const handleOpenAddRound = () => {
    setEditingRound(null);
    setRoundNameInput(`Round ${rounds.length + 1}`);
    setRoundNumberInput(rounds.length + 1);
    setRoundStatusInput(rounds.length === 0 ? "active" : "upcoming");
    setRoundDateInput("");
    setRoundFeeInput(0);
    setRoundDescInput("");
    setShowAddRoundModal(true);
  };

  // Open Modal to Edit Round
  const handleOpenEditRound = (r: CompetitionRound) => {
    setEditingRound(r);
    setRoundNameInput(r.name);
    setRoundNumberInput(r.round_number);
    setRoundStatusInput(r.status);
    setRoundDateInput(r.round_date ? r.round_date.split("T")[0] : "");
    setRoundFeeInput(r.fee || 0);
    setRoundDescInput(r.description || "");
    setShowAddRoundModal(true);
  };

  // Save Round (Add or Edit)
  const handleSaveRound = async () => {
    if (!roundNameInput.trim()) {
      alert("Please enter a round name.");
      return;
    }
    try {
      setSavingRound(true);
      if (editingRound) {
        const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/rounds/${encodeURIComponent(editingRound.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: roundNameInput,
            round_number: roundNumberInput,
            status: roundStatusInput,
            round_date: roundDateInput || null,
            fee: roundFeeInput,
            description: roundDescInput,
          }),
        });
        if (res.ok) {
          showToast(`Round "${roundNameInput}" updated successfully.`);
          setShowAddRoundModal(false);
          fetchRounds();
        }
      } else {
        const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/rounds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: roundNameInput,
            round_number: roundNumberInput,
            status: roundStatusInput,
            round_date: roundDateInput || null,
            fee: roundFeeInput,
            description: roundDescInput,
          }),
        });
        if (res.ok) {
          showToast(`Round "${roundNameInput}" created successfully.`);
          setShowAddRoundModal(false);
          fetchRounds();
        }
      }
    } catch (err) {
      console.error("Error saving round:", err);
    } finally {
      setSavingRound(false);
    }
  };

  // Delete Round
  const handleDeleteRound = async (r: CompetitionRound) => {
    if (!confirm(`Are you sure you want to delete "${r.name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/rounds/${encodeURIComponent(r.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Round "${r.name}" deleted.`);
        fetchRounds();
      }
    } catch (err) {
      console.error("Error deleting round:", err);
    }
  };

  // Checkbox Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRegIds(participants.map((p) => p.registration_id));
    } else {
      setSelectedRegIds([]);
    }
  };

  const handleSelectOne = (regId: string) => {
    setSelectedRegIds((prev) =>
      prev.includes(regId) ? prev.filter((id) => id !== regId) : [...prev, regId]
    );
  };

  // Execute Bulk Promotion
  const handleConfirmPromotion = async () => {
    if (!selectedRoundId || selectedRegIds.length === 0) return;
    try {
      setPromoting(true);
      const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/rounds/${encodeURIComponent(selectedRoundId)}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration_ids: selectedRegIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `Promoted ${data.promoted_count} participant(s) to ${data.target_round_name}.`);
        setShowPromoteModal(false);
        setSelectedRegIds([]);
        fetchRounds();
        fetchRoundParticipants(selectedRoundId);
      } else {
        alert(`Promotion notice: ${data.error || "Failed to promote participants."}`);
      }
    } catch (err) {
      console.error("Error performing promotion:", err);
    } finally {
      setPromoting(false);
    }
  };

  // Update Individual Participant Result Status
  const handleSaveResultStatus = async () => {
    if (!showResultModal || !selectedRoundId) return;
    try {
      setSavingResult(true);
      const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/rounds/${encodeURIComponent(selectedRoundId)}/participants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          round_participant_id: showResultModal.id,
          registration_id: showResultModal.registration_id,
          status: resultStatusInput,
          result_notes: resultNotesInput,
          notify: true,
        }),
      });

      if (res.ok) {
        showToast(`Status updated to ${resultStatusInput.toUpperCase()} for ${showResultModal.full_name}.`);
        setShowResultModal(null);
        fetchRoundParticipants(selectedRoundId);
      }
    } catch (err) {
      console.error("Error saving participant status:", err);
    } finally {
      setSavingResult(false);
    }
  };

  const currentRound = rounds.find((r) => r.id === selectedRoundId);
  const nextRoundIndex = rounds.findIndex((r) => r.id === selectedRoundId) + 1;
  const targetNextRound = nextRoundIndex > 0 && nextRoundIndex < rounds.length ? rounds[nextRoundIndex] : null;

  return (
    <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 9999,
            background: toastMsg.type === "success" ? "#065F46" : "#991B1B",
            color: "#ffffff",
            padding: "14px 24px",
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 14,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <CheckCircle2 size={18} /> {toastMsg.text}
        </div>
      )}

      {/* Header & Quick Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#EDE9FE", borderRadius: 10, fontSize: 12, fontWeight: 900, color: "#6D28D9", textTransform: "uppercase", marginBottom: 6 }}>
            <Layers size={14} color="#6D28D9" /> Competition Rounds Management
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
            Event Competition Rounds & Participant Promotion
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Configure rounds, track progression, mark results, and bulk promote qualified participants to subsequent rounds.
          </p>
        </div>

        <button
          onClick={handleOpenAddRound}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 22px",
            background: "#6D28D9",
            color: "#ffffff",
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 900,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(109, 40, 217, 0.25)",
          }}
        >
          <Plus size={18} /> Add New Round
        </button>
      </div>

      {/* Rounds Navigation Tabs */}
      {loadingRounds ? (
        <div style={{ padding: 24, textAlign: "center", color: "#64748B", fontWeight: 600 }}>Loading competition rounds...</div>
      ) : rounds.length === 0 ? (
        <div style={{ background: "#F8FAFC", borderRadius: 16, border: "1.5px dashed #CBD5E1", padding: 36, textAlign: "center", marginBottom: 24 }}>
          <Trophy size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>No Competition Rounds Configured</h4>
          <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 0 16px" }}>
            This event does not have any competition rounds configured yet. Add rounds (e.g. Round 1 / Audition, Semi Final, Final) to enable multi-round progression.
          </p>
          <button
            onClick={handleOpenAddRound}
            style={{
              padding: "10px 20px",
              background: "#6D28D9",
              color: "#ffffff",
              borderRadius: 12,
              fontSize: 13.5,
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={16} style={{ marginRight: 6 }} /> Configure First Round
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, marginBottom: 24, borderBottom: "1.5px solid #F1F5F9" }}>
          {rounds.map((r) => {
            const isSelected = r.id === selectedRoundId;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRoundId(r.id)}
                style={{
                  padding: "12px 20px",
                  borderRadius: 14,
                  background: isSelected ? "linear-gradient(135deg, #1E1B4B, #4C1D95)" : "#F8FAFC",
                  color: isSelected ? "#ffffff" : "#334155",
                  border: isSelected ? "1.5px solid #6D28D9" : "1.5px solid #E2E8F0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Round {r.round_number} • {r.status.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2 }}>{r.name}</div>
                </div>

                <div
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.2)" : "#E2E8F0",
                    color: isSelected ? "#ffffff" : "#475569",
                    padding: "3px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {r.participant_count || 0}
                </div>

                <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditRound(r);
                    }}
                    style={{ background: "none", border: "none", color: isSelected ? "#E9D5FF" : "#64748B", cursor: "pointer", padding: 2 }}
                    title="Edit Round"
                  >
                    <Edit2 size={14} />
                  </button>
                  {rounds.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRound(r);
                      }}
                      style={{ background: "none", border: "none", color: isSelected ? "#FCA5A5" : "#EF4444", cursor: "pointer", padding: 2 }}
                      title="Delete Round"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Round Toolbar: Filters & Bulk Actions */}
      {selectedRoundId && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap", background: "#F8FAFC", padding: "16px 20px", borderRadius: 16, border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", flex: 1 }}>
              {/* Search */}
              <div style={{ position: "relative", minWidth: 260 }}>
                <Search size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Search participant / team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 36px",
                    borderRadius: 10,
                    border: "1.5px solid #CBD5E1",
                    fontSize: 13.5,
                    fontWeight: 600,
                    outline: "none",
                  }}
                />
              </div>

              {/* Status Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Filter size={15} color="#64748B" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #CBD5E1",
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "#0F172A",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">All Round Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="qualified">Qualified</option>
                  <option value="eliminated">Eliminated</option>
                  <option value="winner">Winner</option>
                  <option value="runner_up">Runner-up</option>
                  <option value="finalist">Finalist</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>

            {/* Bulk Action Button */}
            <div>
              <button
                disabled={selectedRegIds.length === 0}
                onClick={() => setShowPromoteModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  background: selectedRegIds.length > 0 ? "#16A34A" : "#94A3B8",
                  color: "#ffffff",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 900,
                  border: "none",
                  cursor: selectedRegIds.length > 0 ? "pointer" : "not-allowed",
                  boxShadow: selectedRegIds.length > 0 ? "0 4px 14px rgba(22, 163, 74, 0.25)" : "none",
                }}
              >
                <ArrowRight size={16} /> Promote Selected ({selectedRegIds.length}) to Next Round
              </button>
            </div>
          </div>

          {/* Participant Table */}
          {loadingParticipants ? (
            <div style={{ padding: 48, textAlign: "center", color: "#64748B", fontWeight: 600 }}>Loading participants in round...</div>
          ) : participants.length === 0 ? (
            <div style={{ background: "#ffffff", borderRadius: 16, border: "1.5px solid #F1F5F9", padding: 48, textAlign: "center" }}>
              <Users size={36} color="#CBD5E1" style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>No Participants in this Round</h4>
              <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
                {statusFilter !== "all" || searchQuery
                  ? "No participants match the selected filters."
                  : "Promote participants from the previous round to populate this round."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0", color: "#475569" }}>
                    <th style={{ padding: "12px 16px", width: 40 }}>
                      <input
                        type="checkbox"
                        checked={selectedRegIds.length > 0 && selectedRegIds.length === participants.length}
                        onChange={handleSelectAll}
                        style={{ width: 16, height: 16, cursor: "pointer" }}
                      />
                    </th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>Reg ID / Reg #</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>Participant / Team Name</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>Type</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>Contact Info</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>Round Status</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => {
                    const isSelected = selectedRegIds.includes(p.registration_id);
                    const badge = STATUS_BADGES[p.status] || STATUS_BADGES.pending;
                    const isGroupOrDuo = p.participation_type && p.participation_type.toLowerCase() !== "solo";

                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: "1px solid #F1F5F9",
                          background: isSelected ? "#F0FDF4" : "#ffffff",
                          transition: "background 0.15s",
                        }}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(p.registration_id)}
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                          />
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 900, color: "#6D28D9" }}>{p.registration_number}</div>
                          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>{p.participant_number}</div>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 800, color: "#0F172A" }}>
                            {isGroupOrDuo && p.team_name ? (
                              <span style={{ color: "#6D28D9" }}>{p.team_name}</span>
                            ) : (
                              p.full_name
                            )}
                          </div>
                          {isGroupOrDuo && (
                            <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2, fontWeight: 600 }}>
                              Leader: {p.full_name} • Members: {p.participant_count || 2}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 8,
                              background: isGroupOrDuo ? "#F3E8FF" : "#EFF6FF",
                              color: isGroupOrDuo ? "#6D28D9" : "#1D4ED8",
                              fontWeight: 800,
                              fontSize: 12,
                            }}
                          >
                            {p.participation_type || "Solo"}
                          </span>
                        </td>

                        <td style={{ padding: "14px 16px", color: "#475569", fontWeight: 500 }}>
                          <div>{p.email}</div>
                          <div style={{ fontSize: 12, color: "#64748B" }}>{p.phone}</div>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: 10,
                              background: badge.bg,
                              color: badge.color,
                              fontWeight: 900,
                              fontSize: 12.5,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {badge.icon} {badge.label}
                          </span>
                          {p.result_notes && (
                            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2, fontStyle: "italic" }}>
                              "{p.result_notes}"
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <button
                            onClick={() => {
                              setShowResultModal(p);
                              setResultStatusInput(p.status);
                              setResultNotesInput(p.result_notes || "");
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              background: "#F1F5F9",
                              border: "1px solid #CBD5E1",
                              fontSize: 12,
                              fontWeight: 800,
                              color: "#334155",
                              cursor: "pointer",
                            }}
                          >
                            Set Result
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal 1: Add / Edit Round */}
      {showAddRoundModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, maxWidth: 500, width: "100%", padding: 32, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                {editingRound ? "Edit Competition Round" : "Add Competition Round"}
              </h3>
              <button onClick={() => setShowAddRoundModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 800, color: "#475569", display: "block", marginBottom: 6 }}>Round Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Round 1 / Preliminary, Semi Final, Final"
                  value={roundNameInput}
                  onChange={(e) => setRoundNameInput(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, fontWeight: 600 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 800, color: "#475569", display: "block", marginBottom: 6 }}>Round Sequence #</label>
                  <input
                    type="number"
                    min={1}
                    value={roundNumberInput}
                    onChange={(e) => setRoundNumberInput(parseInt(e.target.value, 10) || 1)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 800, color: "#475569", display: "block", marginBottom: 6 }}>Status</label>
                  <select
                    value={roundStatusInput}
                    onChange={(e) => setRoundStatusInput(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, fontWeight: 600, background: "#fff" }}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 800, color: "#475569", display: "block", marginBottom: 6 }}>Round Date (Optional)</label>
                  <input
                    type="date"
                    value={roundDateInput}
                    onChange={(e) => setRoundDateInput(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 800, color: "#475569", display: "block", marginBottom: 6 }}>Additional Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={roundFeeInput}
                    onChange={(e) => setRoundFeeInput(parseFloat(e.target.value) || 0)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, fontWeight: 600 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 800, color: "#475569", display: "block", marginBottom: 6 }}>Description / Jury Notes</label>
                <textarea
                  rows={3}
                  placeholder="Optional round description or criteria..."
                  value={roundDescInput}
                  onChange={(e) => setRoundDescInput(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13.5, fontWeight: 500 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAddRoundModal(false)}
                  style={{ padding: "10px 18px", borderRadius: 10, background: "#F1F5F9", border: "1px solid #CBD5E1", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingRound}
                  onClick={handleSaveRound}
                  style={{ padding: "10px 22px", borderRadius: 10, background: "#6D28D9", color: "#fff", fontWeight: 900, border: "none", cursor: "pointer" }}
                >
                  {savingRound ? "Saving..." : "Save Round"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Bulk Promotion Confirmation */}
      {showPromoteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, maxWidth: 480, width: "100%", padding: 32, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#DCFCE7", color: "#16A34A", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <ArrowRight size={28} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
                Promote {selectedRegIds.length} Participants?
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                You are about to promote <strong style={{ color: "#0F172A" }}>{selectedRegIds.length}</strong> selected participant(s) from <strong style={{ color: "#6D28D9" }}>{currentRound?.name}</strong> to{" "}
                <strong style={{ color: "#16A34A" }}>{targetNextRound ? targetNextRound.name : "Next Round"}</strong>.
              </p>
            </div>

            <div style={{ background: "#F8FAFC", borderRadius: 14, border: "1px solid #E2E8F0", padding: 16, marginBottom: 24, fontSize: 13, color: "#475569" }}>
              <div style={{ fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Promotion Guarantee:</div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                <li>Original Registration IDs & QR tokens remain intact.</li>
                <li>Duo & Group team structures are preserved as complete teams.</li>
                <li>No duplicate accounts or payments will be created.</li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#F1F5F9", border: "1px solid #CBD5E1", fontWeight: 800, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={promoting}
                onClick={handleConfirmPromotion}
                style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#16A34A", color: "#fff", fontWeight: 900, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}
              >
                {promoting ? "Promoting..." : `Promote (${selectedRegIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Set Individual Result Status */}
      {showResultModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, maxWidth: 440, width: "100%", padding: 28, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                Set Round Result Status
              </h3>
              <button onClick={() => setShowResultModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 16, fontSize: 14, color: "#475569" }}>
              Participant: <strong style={{ color: "#0F172A" }}>{showResultModal.full_name}</strong> ({showResultModal.registration_number})
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 800, color: "#475569", display: "block", marginBottom: 6 }}>Result Status</label>
                <select
                  value={resultStatusInput}
                  onChange={(e) => setResultStatusInput(e.target.value as ParticipantRoundStatus)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, fontWeight: 800, background: "#fff" }}
                >
                  <option value="qualified">Qualified</option>
                  <option value="eliminated">Eliminated</option>
                  <option value="winner">Winner 🏆</option>
                  <option value="runner_up">Runner-up 🥈</option>
                  <option value="finalist">Finalist 🥉</option>
                  <option value="pending">Pending</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 800, color: "#475569", display: "block", marginBottom: 6 }}>Result Remarks / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Optional remarks..."
                  value={resultNotesInput}
                  onChange={(e) => setResultNotesInput(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13.5, fontWeight: 500 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowResultModal(null)}
                  style={{ padding: "10px 16px", borderRadius: 10, background: "#F1F5F9", border: "1px solid #CBD5E1", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingResult}
                  onClick={handleSaveResultStatus}
                  style={{ padding: "10px 20px", borderRadius: 10, background: "#6D28D9", color: "#fff", fontWeight: 900, border: "none", cursor: "pointer" }}
                >
                  {savingResult ? "Updating..." : "Save Result"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
