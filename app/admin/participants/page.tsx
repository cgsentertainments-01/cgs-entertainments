"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { ParticipantDetailDrawer } from "@/components/admin/ParticipantDetailDrawer";

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
  event_id?: string;
  event_title?: string;
  category_name?: string;
  participation_type?: string;
  team_name?: string;
  registration_status?: string;
  payment_status?: string;
  registration_amount?: number;
  document_urls?: any;
  result?: any;
}

interface EventOption {
  id: string;
  title: string;
}

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [eventsList, setEventsList] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedRound, setSelectedRound] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Selected participant for drawer view
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantItem | null>(null);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/participants", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
        setEventsList(data.events || []);
      } else {
        setError("Failed to fetch participants from database.");
        setParticipants([]);
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
      setError("Failed to fetch participants.");
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const filteredParticipants = participants.filter((p) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery) ||
      p.registration_number?.toLowerCase().includes(searchQuery.toLowerCase());

    // Event filter
    const matchesEvent =
      selectedEventId === "all" || p.event_id === selectedEventId;

    // Competition filter
    const matchesCompetition =
      selectedCompetition === "all" ||
      p.category_name?.toLowerCase().includes(selectedCompetition.toLowerCase());

    // Type filter
    const matchesType =
      selectedType === "all" ||
      p.participation_type?.toLowerCase() === selectedType.toLowerCase();

    // Payment filter
    const matchesPayment =
      selectedPayment === "all" ||
      p.payment_status?.toLowerCase() === selectedPayment.toLowerCase();

    // Status filter
    const matchesStatus =
      selectedStatus === "all" ||
      p.registration_status?.toLowerCase() === selectedStatus.toLowerCase() ||
      p.result?.result_type?.toLowerCase() === selectedStatus.toLowerCase();

    return (
      matchesSearch &&
      matchesEvent &&
      matchesCompetition &&
      matchesType &&
      matchesPayment &&
      matchesStatus
    );
  });

  const getPaymentBadge = (status?: string) => {
    if (status === "paid") return { label: "PAID", bg: "#DCFCE7", color: "#15803D" };
    return { label: "PENDING", bg: "#FEF3C7", color: "#B45309" };
  };

  const getStatusBadge = (status?: string, result?: any) => {
    if (result?.result_type === "winner") return { label: "WINNER", bg: "#FEF3C7", color: "#B45309" };
    if (result?.result_type === "finalist") return { label: "FINALIST", bg: "#FFEDD5", color: "#C2410C" };
    if (status === "qualified") return { label: "QUALIFIED", bg: "#DCFCE7", color: "#15803D" };
    if (status === "eliminated") return { label: "ELIMINATED", bg: "#FEE2E2", color: "#B91C1C" };
    return { label: "CONFIRMED", bg: "#EFF6FF", color: "#2563EB" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
          Participants
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Manage participant registrations across all competition events.
        </p>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 14, padding: "14px 18px", color: "#DC2626", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Controls & Multi-Filters */}
      <div style={{ background: "#fff", padding: 20, borderRadius: 18, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Search Input */}
        <div style={{ position: "relative" }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search participant by name, email, phone or registration ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "11px 14px 11px 42px", borderRadius: 12, border: "1px solid #CBD5E1", fontSize: 13.5, outline: "none", background: "#F8FAFC" }}
          />
        </div>

        {/* Dropdown Filters Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
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
              <option value="photo">Best Photo</option>
            </select>
          </div>

          {/* Participation Type */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 4 }}>TYPE</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 600, background: "#fff" }}
            >
              <option value="all">All Types</option>
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="group">Group</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 4 }}>PAYMENT</label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 600, background: "#fff" }}
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748B", marginBottom: 4 }}>STATUS</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 600, background: "#fff" }}
            >
              <option value="all">All Statuses</option>
              <option value="qualified">Qualified</option>
              <option value="eliminated">Eliminated</option>
              <option value="finalist">Finalist</option>
              <option value="winner">Winner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#64748B", fontWeight: 600 }}>
          Loading participant registry...
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: "48px 24px", textAlign: "center" }}>
          <AlertCircle size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", margin: "0 0 6px" }}>No Participants Found</h3>
          <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
            No participants match your current search or filter criteria.
          </p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 800 }}>
                  <th style={{ padding: "14px 18px" }}>PARTICIPANT</th>
                  <th style={{ padding: "14px 18px" }}>EVENT</th>
                  <th style={{ padding: "14px 18px" }}>COMPETITION</th>
                  <th style={{ padding: "14px 18px" }}>TYPE</th>
                  <th style={{ padding: "14px 18px" }}>TEAM</th>
                  <th style={{ padding: "14px 18px" }}>PAYMENT</th>
                  <th style={{ padding: "14px 18px" }}>ROUND</th>
                  <th style={{ padding: "14px 18px" }}>STATUS</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p) => {
                  const payBadge = getPaymentBadge(p.payment_status);
                  const stBadge = getStatusBadge(p.registration_status, p.result);
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer" }}
                      onClick={() => setSelectedParticipant(p)}
                    >
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 800, color: "#0F172A" }}>{p.full_name}</div>
                        <div style={{ fontSize: 11.5, color: "#64748B" }}>{p.phone}</div>
                      </td>
                      <td style={{ padding: "14px 18px", color: "#334155", fontWeight: 600 }}>
                        {p.event_title || "Warangal Dance"}
                      </td>
                      <td style={{ padding: "14px 18px", color: "#7C3AED", fontWeight: 700 }}>
                        {p.category_name || "Solo Dance"}
                      </td>
                      <td style={{ padding: "14px 18px", color: "#475569", fontWeight: 600 }}>
                        {p.participation_type?.toUpperCase() || "SOLO"}
                      </td>
                      <td style={{ padding: "14px 18px", color: "#64748B" }}>
                        {p.team_name || "—"}
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ padding: "3px 9px", borderRadius: 6, background: payBadge.bg, color: payBadge.color, fontSize: 11, fontWeight: 800 }}>
                          {payBadge.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", color: "#475569", fontWeight: 600 }}>
                        Round 1
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ padding: "3px 9px", borderRadius: 6, background: stBadge.bg, color: stBadge.color, fontSize: 11, fontWeight: 800 }}>
                          {stBadge.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedParticipant(p);
                          }}
                          style={{ padding: "6px 12px", borderRadius: 8, background: "#F1F5F9", color: "#334155", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <Eye size={14} /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Participant Detail Drawer */}
      <ParticipantDetailDrawer
        participant={selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
      />
    </div>
  );
}
