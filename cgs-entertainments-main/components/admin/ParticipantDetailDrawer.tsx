"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Video,
  Image as ImageIcon,
  Award,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Download,
  Play,
  Layers,
  Trophy,
} from "lucide-react";
import { parseParticipantDocuments } from "@/lib/utils/document-parser";

interface ParticipantDetailDrawerProps {
  participant: any | null;
  onClose: () => void;
  onUpdateResult?: (participant: any) => void;
}

export function ParticipantDetailDrawer({
  participant,
  onClose,
  onUpdateResult,
}: ParticipantDetailDrawerProps) {
  if (!participant) return null;

  const [activeTab, setActiveTab] = useState<
    "personal" | "event" | "team" | "payment" | "documents" | "progression" | "results" | "qr"
  >("personal");

  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

  const docs = parseParticipantDocuments(
    participant.document_urls,
    participant.details,
    participant
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 620,
          height: "100vh",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 30px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Drawer Header */}
        <div style={{ background: "linear-gradient(135deg, #090314 0%, #150A30 100%)", padding: "24px 28px", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#A78BFA", letterSpacing: 0.5 }}>
                REGISTRATION #{participant.registration_number || participant.participant_number || "REG-001"}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "4px 0 6px" }}>
                {participant.full_name || participant.name}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ padding: "3px 10px", borderRadius: 6, background: participant.payment_status === "paid" ? "#DCFCE7" : "#FEF3C7", color: participant.payment_status === "paid" ? "#15803D" : "#B45309", fontSize: 11, fontWeight: 800 }}>
                  {participant.payment_status?.toUpperCase() || "PAYMENT PENDING"}
                </span>
                <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 11, fontWeight: 800 }}>
                  {participant.registration_status?.toUpperCase() || "CONFIRMED"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 10, padding: 8, cursor: "pointer" }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", padding: "6px 12px", display: "flex", gap: 4, overflowX: "auto" }}>
          {[
            { id: "personal", label: "Personal" },
            { id: "event", label: "Event" },
            { id: "team", label: "Participation" },
            { id: "payment", label: "Payment" },
            { id: "documents", label: "Documents" },
            { id: "progression", label: "Rounds" },
            { id: "results", label: "Results" },
            { id: "qr", label: "QR Code" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: activeTab === t.id ? 800 : 600,
                color: activeTab === t.id ? "#7C3AED" : "#64748B",
                background: activeTab === t.id ? "#fff" : "transparent",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: activeTab === t.id ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* TAB 1: Personal Info */}
          {activeTab === "personal" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>Personal Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, background: "#F8FAFC", padding: 18, borderRadius: 14, border: "1px solid #E2E8F0" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Full Name</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{participant.full_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Phone Number</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{participant.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Email Address</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{participant.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Date of Birth</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{participant.date_of_birth || "N/A"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>City / State</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{participant.city ? `${participant.city}, ${participant.state || ""}` : "N/A"}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Event & Competition */}
          {activeTab === "event" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>Event & Competition</h3>
              <div style={{ background: "#F8FAFC", padding: 18, borderRadius: 14, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Event Title</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{participant.event_title || "Warangal Dance Championship"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Competition Category</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#7C3AED", marginTop: 2 }}>{participant.category_name || "Solo Dance"}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Participation & Team */}
          {activeTab === "team" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>Participation Details</h3>
              <div style={{ background: "#F8FAFC", padding: 18, borderRadius: 14, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Participation Type</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{participant.participation_type?.toUpperCase() || "SOLO"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Team Name</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginTop: 2 }}>{participant.team_name || "— (Solo Entry)"}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Payment Details */}
          {activeTab === "payment" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>Payment Information</h3>
              <div style={{ background: "#F8FAFC", padding: 18, borderRadius: 14, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Payment Status</div>
                  <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 8, background: participant.payment_status === "paid" ? "#DCFCE7" : "#FEF3C7", color: participant.payment_status === "paid" ? "#15803D" : "#B45309", fontSize: 12, fontWeight: 800, marginTop: 4 }}>
                    {participant.payment_status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Registration Amount</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", marginTop: 2 }}>₹{participant.registration_amount || 500}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Documents Display */}
          {activeTab === "documents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>Uploaded Documents</h3>

              {/* Passport Photo */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 8 }}>Passport Photo</div>
                {docs.passportPhoto ? (
                  <img src={docs.passportPhoto} alt="Passport Photo" style={{ width: 120, height: 120, borderRadius: 12, objectFit: "cover", border: "1px solid #CBD5E1" }} />
                ) : (
                  <div style={{ color: "#94A3B8", fontSize: 13 }}>No passport photo uploaded.</div>
                )}
              </div>

              {/* Aadhaar / ID Proof */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 8 }}>Aadhaar / ID Proof</div>
                {docs.idProof ? (
                  <a href={docs.idProof} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#EFF6FF", color: "#2563EB", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>
                    <ExternalLink size={15} /> View ID Proof Document
                  </a>
                ) : (
                  <div style={{ color: "#94A3B8", fontSize: 13 }}>No ID proof uploaded.</div>
                )}
              </div>

              {/* Dance Video */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 8 }}>Audition / Performance Dance Video</div>
                {docs.danceVideo ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <video src={docs.danceVideo} controls style={{ width: "100%", maxHeight: 240, borderRadius: 10, background: "#000" }} />
                    <a href={docs.danceVideo} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, fontWeight: 700, color: "#7C3AED", textDecoration: "none" }}>
                      Open video in new tab →
                    </a>
                  </div>
                ) : (
                  <div style={{ color: "#94A3B8", fontSize: 13 }}>No dance video submitted.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Competition Progression */}
          {activeTab === "progression" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>Round Progression Timeline</h3>
              <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#16A34A" }} />
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0F172A" }}>Round 1 / Auditions → Qualified</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#7C3AED" }} />
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0F172A" }}>Semi Final → Qualified</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EAB308" }} />
                  <div style={{ fontSize: 13.5, fontWeight: 900, color: "#B45309" }}>Final → Winner</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Results */}
          {activeTab === "results" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>Assigned Result</h3>
              <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#B45309" }}>
                  🏆 {participant.result?.result_type?.toUpperCase() || "WINNER"}
                </div>
                <div style={{ fontSize: 13, color: "#78350F", marginTop: 4 }}>Position Rank: #{participant.result?.position || 1}</div>
              </div>
            </div>
          )}

          {/* TAB 8: QR Code */}
          {activeTab === "qr" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0 }}>Verification QR Token</h3>
              <div style={{ background: "#fff", border: "2px solid #E2E8F0", padding: 24, borderRadius: 20 }}>
                <QrCode size={160} color="#0F172A" />
              </div>
              <div style={{ fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>
                Token: {participant.qr_token || participant.id}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
