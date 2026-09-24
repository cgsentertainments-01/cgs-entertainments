"use client";

import React, { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Pagination } from "@/components/common/Pagination";

interface AdminRegistration {
  id: string;
  registration_number: string;
  amount: number;
  registration_status: string;
  payment_status: string;
  created_at: string;
  participation_type?: string;
  team_name?: string;
  participant_count?: number;
  id_proof_url?: string;
  photo_url?: string;
  video_url?: string;
  document_urls?: Record<string, string>;
  events?: {
    title?: string;
    venue?: string;
    city?: string;
    category?: string;
  };
  participants?: {
    full_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    video_path?: string;
    video_url?: string;
  };
  event_categories?: {
    name?: string;
  };
  registration_payments?: Array<{
    id?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    status?: string;
    paid_at?: string;
  }> | {
    id?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    status?: string;
    paid_at?: string;
  };
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReg, setSelectedReg] = useState<AdminRegistration | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/registrations");
      const data = await res.json();

      if (res.ok && data.success) {
        setRegistrations(data.registrations || []);
      } else {
        setError(data.error || "Failed to fetch registrations.");
      }
    } catch (err: any) {
      console.error("Error fetching registrations:", err);
      setError("Network error fetching registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const getRazorpayPaymentId = (reg: AdminRegistration) => {
    if (Array.isArray(reg.registration_payments)) {
      return reg.registration_payments[0]?.razorpay_payment_id || "-";
    }
    if (reg.registration_payments && typeof reg.registration_payments === "object") {
      return reg.registration_payments.razorpay_payment_id || "-";
    }
    return "-";
  };

  const getRazorpayOrderId = (reg: AdminRegistration) => {
    if (Array.isArray(reg.registration_payments)) {
      return reg.registration_payments[0]?.razorpay_order_id || "-";
    }
    if (reg.registration_payments && typeof reg.registration_payments === "object") {
      return reg.registration_payments.razorpay_order_id || "-";
    }
    return "-";
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const filteredRegistrations = registrations.filter((reg) => {
    const searchLower = searchQuery.toLowerCase();
    const rzpId = getRazorpayPaymentId(reg).toLowerCase();
    const matchesSearch =
      (reg.registration_number || "").toLowerCase().includes(searchLower) ||
      (reg.participants?.full_name || "").toLowerCase().includes(searchLower) ||
      (reg.participants?.email || "").toLowerCase().includes(searchLower) ||
      (reg.participants?.phone || "").toLowerCase().includes(searchLower) ||
      (reg.events?.title || "").toLowerCase().includes(searchLower) ||
      (reg.participation_type || "").toLowerCase().includes(searchLower) ||
      (reg.team_name || "").toLowerCase().includes(searchLower) ||
      rzpId.includes(searchLower);

    const payStatus = (reg.payment_status || "unpaid").toLowerCase();
    const regStatus = (reg.registration_status || "pending").toLowerCase();

    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "paid") matchesStatus = payStatus === "paid";
      else if (statusFilter === "pending") matchesStatus = payStatus === "pending" || payStatus === "unpaid" || regStatus === "payment_pending";
      else if (statusFilter === "failed") matchesStatus = payStatus === "failed";
      else if (statusFilter === "refunded") matchesStatus = payStatus === "refunded";
      else matchesStatus = payStatus === statusFilter || regStatus === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRegistrations.length / pageSize) || 1;
  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDownloadCSV = () => {
    const headers = "Registration No,Participant Name,Email,Phone,Event,Category,Participation Type,Team Name,Amount,Payment Status,Registration Status,Razorpay Payment ID,Date\n";
    const rows = filteredRegistrations
      .map((r) => {
        const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : "";
        const rzpPayId = getRazorpayPaymentId(r);
        const cat = r.event_categories?.name || r.events?.category || "General";
        const partType = r.participation_type || "Solo";
        const team = r.team_name || "";
        return `"${r.registration_number || r.id}","${r.participants?.full_name || ""}","${r.participants?.email || ""}","${r.participants?.phone || ""}","${r.events?.title || ""}","${cat}","${partType}","${team}","₹${r.amount || 0}","${r.payment_status}","${r.registration_status}","${rzpPayId}","${dateStr}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations_export_${Date.now()}.csv`;
    a.click();
  };

  const renderUploads = (reg: AdminRegistration) => {
    const docs = reg.document_urls || {};
    const photoUrl = reg.photo_url || docs.photo || docs.profile_photo || docs.passportPhoto || docs.passport_photo;
    const idProofUrl = reg.id_proof_url || docs.idProof || docs.id_proof || docs.idProofUrl || docs.id_proof_url || docs.aadhaar || docs.aadhaar_card || docs.aadhaarFile || docs.identity_proof;
    const videoUrl = reg.video_url || reg.participants?.video_url || reg.participants?.video_path || docs.danceVideo || docs.dance_video || docs.video || docs.videoUrl;

    const extraKeys = Object.keys(docs).filter(
      (k) => !["photo", "profile_photo", "passportPhoto", "passport_photo", "danceVideo", "dance_video", "video", "videoUrl", "idProof", "id_proof", "idProofUrl", "id_proof_url", "aadhaar", "aadhaar_card", "aadhaarFile", "identity_proof"].includes(k)
    );

    if (!photoUrl && !idProofUrl && !videoUrl && extraKeys.length === 0) {
      return <span style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>Not uploaded</span>;
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12 }}>
        <div>
          <span style={{ fontWeight: 700, color: "#475569" }}>Passport Photo: </span>
          {photoUrl ? (
            <a href={photoUrl} target="_blank" rel="noreferrer" style={{ color: "#166534", fontWeight: 800, textDecoration: "underline" }}>
              View Photo
            </a>
          ) : (
            <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>Not uploaded</span>
          )}
        </div>

        <div>
          <span style={{ fontWeight: 700, color: "#475569" }}>Aadhaar / ID Proof: </span>
          {idProofUrl ? (
            <a href={idProofUrl} target="_blank" rel="noreferrer" style={{ color: "#2563EB", fontWeight: 800, textDecoration: "underline" }}>
              View ID Proof
            </a>
          ) : (
            <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>Not uploaded</span>
          )}
        </div>

        <div>
          <span style={{ fontWeight: 700, color: "#475569" }}>Dance Video: </span>
          {videoUrl ? (
            <a href={videoUrl} target="_blank" rel="noreferrer" style={{ color: "#6D28D9", fontWeight: 800, textDecoration: "underline" }}>
              Play Video
            </a>
          ) : (
            <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>Not uploaded</span>
          )}
        </div>

        {extraKeys.map((k) => (
          <div key={k}>
            <span style={{ fontWeight: 700, color: "#475569" }}>{k}: </span>
            <a href={docs[k]} target="_blank" rel="noreferrer" style={{ color: "#475569", fontWeight: 800, textDecoration: "underline" }}>
              Open
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", display: "flex", alignItems: "center", gap: 10 }}>
            <Ticket size={28} color="#6D28D9" /> Event Registrations &amp; Payments
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
            Live registration &amp; Razorpay payment records directly synchronized from Supabase PostgreSQL.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={fetchRegistrations}
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
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: "18px 20px",
          marginBottom: 24,
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search by Registration #, Name, Email, Phone, Event, Participation Type, Team, or Payment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 42px",
              borderRadius: 10,
              border: "1px solid #D1D5DB",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        {/* Filter Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Filter size={16} color="#6B7280" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #D1D5DB",
              fontSize: 14,
              fontWeight: 700,
              outline: "none",
              background: "#fff",
              color: "#374151",
            }}
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending / Unpaid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: "#FEF2F2", color: "#991B1B", borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Registrations Table */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#6B7280", fontWeight: 700 }}>
            Fetching live registrations &amp; Razorpay payment status from Supabase...
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>
            <Ticket size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>No Registrations Found</h3>
            <p style={{ fontSize: 14, marginTop: 4 }}>
              {searchQuery ? "Try adjusting your search query or status filter." : "Registered event participants will appear here in real time."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", color: "#4B5563", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>REGISTRATION ID</th>
                <th style={{ padding: "14px 20px" }}>USER</th>
                <th style={{ padding: "14px 20px" }}>EVENT &amp; CATEGORY</th>
                <th style={{ padding: "14px 20px" }}>PARTICIPATION &amp; TEAM</th>
                <th style={{ padding: "14px 20px" }}>UPLOADS</th>
                <th style={{ padding: "14px 20px" }}>AMOUNT</th>
                <th style={{ padding: "14px 20px" }}>PAYMENT STATUS</th>
                <th style={{ padding: "14px 20px" }}>REGISTRATION DATE</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRegistrations.map((reg) => {
                const dateStr = reg.created_at ? new Date(reg.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
                const payStatus = (reg.payment_status || "unpaid").toLowerCase();
                const rzpPayId = getRazorpayPaymentId(reg);

                let statusBg = "#FEF3C7";
                let statusColor = "#92400E";
                if (payStatus === "paid") {
                  statusBg = "#DCFCE7";
                  statusColor = "#166534";
                } else if (payStatus === "failed") {
                  statusBg = "#FEE2E2";
                  statusColor = "#991B1B";
                } else if (payStatus === "refunded") {
                  statusBg = "#F3E8FF";
                  statusColor = "#6D28D9";
                }

                const catName = reg.event_categories?.name || reg.events?.category || "General";
                const partType = reg.participation_type || "Solo";

                return (
                  <tr key={reg.id} style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.2s" }}>
                    <td style={{ padding: "16px 20px", fontWeight: 800, color: "#6D28D9" }}>
                      {reg.registration_number || reg.id.substring(0, 8)}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{reg.participants?.full_name || "N/A"}</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>{reg.participants?.email || reg.participants?.phone || "-"}</div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 700, color: "#1F2937" }}>{reg.events?.title || "N/A"}</div>
                      <div style={{ fontSize: 12, color: "#6D28D9", fontWeight: 700, marginTop: 2 }}>
                        {catName} ({partType})
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 800, color: "#111827" }}>{partType}</div>
                      {reg.team_name ? (
                        <div style={{ fontSize: 12, color: "#4C1D95", fontWeight: 700, marginTop: 2 }}>
                          Team: {reg.team_name}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "#9CA3AF" }}>Individual</div>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {renderUploads(reg)}
                    </td>
                    <td style={{ padding: "16px 20px", fontWeight: 800, color: "#111827" }}>
                      ₹{reg.amount || 0}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 800,
                          background: statusBg,
                          color: statusColor,
                          textTransform: "uppercase",
                        }}
                      >
                        {payStatus}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", color: "#4B5563" }}>{dateStr}</td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <button
                        onClick={() => setSelectedReg(reg)}
                        style={{
                          padding: "6px 12px",
                          background: "#F3F4F6",
                          color: "#374151",
                          border: "1px solid #D1D5DB",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Modal for Details */}
      {selectedReg && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 620, width: "100%", padding: "28px 32px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16, color: "#111827" }}>
              Registration #{selectedReg.registration_number}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14, color: "#374151" }}>
              <div><strong>Participant Name:</strong> {selectedReg.participants?.full_name || "N/A"}</div>
              <div><strong>Email:</strong> {selectedReg.participants?.email || "N/A"}</div>
              <div><strong>Phone:</strong> {selectedReg.participants?.phone || "N/A"}</div>
              <div><strong>Event:</strong> {selectedReg.events?.title || "N/A"}</div>
              <div><strong>Category:</strong> {selectedReg.event_categories?.name || selectedReg.events?.category || "General"}</div>
              <div><strong>Participation Type:</strong> <span style={{ fontWeight: 800, color: "#6D28D9" }}>{selectedReg.participation_type || "Solo"}</span></div>
              <div><strong>Team Name:</strong> {selectedReg.team_name || "N/A"}</div>
              <div><strong>Performers Count:</strong> {selectedReg.participant_count || 1}</div>
              <div><strong>Uploaded Files:</strong></div>
              <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                {renderUploads(selectedReg)}
              </div>
              <div><strong>Amount Fee:</strong> ₹{selectedReg.amount}</div>
              <div><strong>Payment Status:</strong> <span style={{ textTransform: "uppercase", fontWeight: 800, color: selectedReg.payment_status === "paid" ? "#166534" : "#991B1B" }}>{selectedReg.payment_status || "unpaid"}</span></div>
              <div><strong>Registration Status:</strong> {selectedReg.registration_status}</div>
              <div><strong>Razorpay Order ID:</strong> <code style={{ color: "#6D28D9" }}>{getRazorpayOrderId(selectedReg)}</code></div>
              <div><strong>Razorpay Payment ID:</strong> <code style={{ color: "#6D28D9" }}>{getRazorpayPaymentId(selectedReg)}</code></div>
              <div><strong>Registration Date:</strong> {selectedReg.created_at ? new Date(selectedReg.created_at).toLocaleString("en-IN") : "-"}</div>
            </div>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button
                onClick={() => setSelectedReg(null)}
                style={{ padding: "10px 20px", background: "#6D28D9", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}
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
