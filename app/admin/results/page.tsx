"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  ChevronRight,
  Star,
  ShieldCheck,
} from "lucide-react";

interface EventOption {
  id: string;
  title: string;
}

interface ParticipantResult {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  event_title?: string;
  category_name?: string;
  registration_status?: string;
  result_type?: "winner" | "runner_up" | "finalist" | "qualified" | "eliminated" | "pending";
  position?: number;
  notes?: string;
}

export default function AdminResultsPage() {
  const [eventsList, setEventsList] = useState<EventOption[]>([]);
  const [participants, setParticipants] = useState<ParticipantResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all");
  const [selectedRound, setSelectedRound] = useState<string>("all");
  const [statusCategory, setStatusCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Result Declaration Modal
  const [editingParticipant, setEditingParticipant] = useState<ParticipantResult | null>(null);
  const [resultTypeInput, setResultTypeInput] = useState<string>("winner");
  const [positionInput, setPositionInput] = useState<number>(1);
  const [notesInput, setNotesInput] = useState<string>("");
  const [savingResult, setSavingResult] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/participants", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setEventsList(data.events || []);
        setParticipants(
          (data.participants || []).map((p: any) => ({
            id: p.id,
            full_name: p.full_name,
            phone: p.phone,
            email: p.email,
            event_title: p.event_title,
            category_name: p.category_name,
            registration_status: p.registration_status,
            result_type: p.result?.result_type || "pending",
            position: p.result?.position || 1,
            notes: p.result?.notes || "",
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching results data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveResult = async () => {
    if (!editingParticipant) return;
    try {
      setSavingResult(true);
      // Update result state locally and trigger API update if available
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === editingParticipant.id
            ? { ...p, result_type: resultTypeInput as any, position: positionInput, notes: notesInput }
            : p
        )
      );
      setEditingParticipant(null);
    } catch (err) {
      console.error("Error saving result:", err);
    } finally {
      setSavingResult(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    const matchesStatus =
      statusCategory === "all" ||
      p.result_type?.toLowerCase() === statusCategory.toLowerCase() ||
      (statusCategory === "qualified" && p.registration_status === "qualified");

    return matchesSearch && matchesStatus;
  });

  const getResultBadge = (type?: string) => {
    switch (type) {
      case "winner":
        return { label: "🏆 WINNER", bg: "#FEF3C7", color: "#B45309" };
      case "runner_up":
        return { label: "🥈 RUNNER-UP", bg: "#F1F5F9", color: "#334155" };
      case "finalist":
        return { label: "🥉 FINALIST", bg: "#FFEDD5", color: "#C2410C" };
      case "qualified":
        return { label: "✓ QUALIFIED", bg: "#DCFCE7", color: "#15803D" };
      case "eliminated":
        return { label: "✕ ELIMINATED", bg: "#FEE2E2", color: "#B91C1C" };
      default:
        return { label: "⏳ PENDING", bg: "#F8FAFC", color: "#64748B" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
          Results & Winner Management
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Manage competition results, declare winners, and issue ranks.
        </p>
      </div>

      {/* Filters Bar */}
      <div style={{ background: "#fff", padding: 20, borderRadius: 18, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {/* Event Filter */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 4 }}>EVENT</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 600, background: "#fff" }}
            >
              <option value="all">All Events</option>
              {eventsList.map((evt) => (
                <option key={evt.id} value={evt.id}>{evt.title}</option>
              ))}
            </select>
          </div>

          {/* Competition Filter */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 4 }}>COMPETITION</label>
            <select
              value={selectedCompetition}
              onChange={(e) => setSelectedCompetition(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 600, background: "#fff" }}
            >
              <option value="all">All Competitions</option>
              <option value="solo">Solo Dance</option>
              <option value="duo">Duo Dance</option>
              <option value="group">Group Dance</option>
            </select>
          </div>

          {/* Round Filter */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 4 }}>ROUND</label>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 600, background: "#fff" }}
            >
              <option value="all">All Rounds</option>
              <option value="round1">Round 1 / Auditions</option>
              <option value="semifinal">Semi Final</option>
              <option value="final">Final</option>
            </select>
          </div>
        </div>

        {/* Result Status Tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingTop: 4 }}>
          {["all", "pending", "qualified", "eliminated", "finalist", "winner", "runner_up"].map((cat) => {
            const isActive = statusCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setStatusCategory(cat)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "#ffffff" : "#475569",
                  background: isActive ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" : "#F1F5F9",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cat === "all" ? "All Results" : cat.replace("_", " ").toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Roster Table */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#64748B", fontWeight: 600 }}>
          Loading results...
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 800 }}>
                <th style={{ padding: "14px 18px" }}>PARTICIPANT</th>
                <th style={{ padding: "14px 18px" }}>EVENT</th>
                <th style={{ padding: "14px 18px" }}>COMPETITION</th>
                <th style={{ padding: "14px 18px" }}>RESULT STATUS</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((p) => {
                const b = getResultBadge(p.result_type);
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 800, color: "#0F172A" }}>{p.full_name}</div>
                      <div style={{ fontSize: 11.5, color: "#64748B" }}>{p.phone}</div>
                    </td>
                    <td style={{ padding: "14px 18px", color: "#334155", fontWeight: 600 }}>{p.event_title || "Warangal Dance"}</td>
                    <td style={{ padding: "14px 18px", color: "#7C3AED", fontWeight: 700 }}>{p.category_name || "Solo Dance"}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 8, background: b.bg, color: b.color, fontSize: 11.5, fontWeight: 900 }}>
                        {b.label}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingParticipant(p);
                          setResultTypeInput(p.result_type || "winner");
                          setPositionInput(p.position || 1);
                          setNotesInput(p.notes || "");
                        }}
                        style={{ padding: "6px 14px", borderRadius: 8, background: "#7C3AED", color: "#fff", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
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

      {/* Set Result Modal */}
      {editingParticipant && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 440, width: "100%", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Set Result: {editingParticipant.full_name}
            </h3>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6 }}>Result Status</label>
              <select
                value={resultTypeInput}
                onChange={(e) => setResultTypeInput(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", background: "#fff" }}
              >
                <option value="winner">🏆 Winner</option>
                <option value="runner_up">🥈 Runner-up</option>
                <option value="finalist">🥉 Finalist</option>
                <option value="qualified">✓ Qualified</option>
                <option value="eliminated">✕ Eliminated</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6 }}>Position Rank</label>
              <input
                type="number"
                value={positionInput}
                onChange={(e) => setPositionInput(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6 }}>Judges Notes</label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Optional notes or scoring commentary..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, outline: "none", height: 70 }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setEditingParticipant(null)}
                style={{ padding: "9px 16px", borderRadius: 10, background: "#F1F5F9", color: "#334155", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveResult}
                style={{ padding: "9px 20px", borderRadius: 10, background: "#7C3AED", color: "#fff", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
              >
                Save Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
