"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Users,
  FileText,
  Upload,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Eye,
  Info,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { EventFormConfig } from "@/types/event-config";

interface AdminFormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  categoryName: string;
  formConfig: EventFormConfig;
}

export function AdminFormPreviewModal({
  isOpen,
  onClose,
  eventTitle,
  categoryName,
  formConfig,
}: AdminFormPreviewModalProps) {
  const [activeStep, setActiveStep] = useState(1);

  // Active participation types
  const activeTypes = (formConfig.participationTypes || []).filter(
    (pt) => pt.isActive !== false
  );
  const [selectedTypeId, setSelectedTypeId] = useState<string>(
    activeTypes[0]?.id || "solo"
  );

  const currentType =
    activeTypes.find((pt) => pt.id === selectedTypeId) ||
    activeTypes[0] || {
      id: "solo",
      name: "Solo",
      minParticipants: 1,
      maxParticipants: 1,
      fee: 500,
    };

  const [numParticipants, setNumParticipants] = useState<number>(
    currentType.minParticipants || 1
  );

  // When selected type changes, adjust numParticipants to min
  const handleTypeSelect = (typeId: string) => {
    setSelectedTypeId(typeId);
    const pt = activeTypes.find((t) => t.id === typeId);
    if (pt) {
      setNumParticipants(pt.minParticipants);
    }
  };

  const isMultiParticipant = (currentType.maxParticipants || 1) > 1;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 24,
          maxWidth: 900,
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
            color: "#fff",
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 20,
                background: "rgba(255, 255, 255, 0.15)",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 6,
              }}
            >
              <Eye size={13} /> ADMIN FORM PREVIEW
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#fff" }}>
              {eventTitle || "Sample Event"} ({categoryName})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Header */}
        <div
          style={{
            background: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            overflowX: "auto",
          }}
        >
          {[
            { num: 1, title: "1. Select Event" },
            { num: 2, title: "2. Participation Type" },
            { num: 3, title: "3. Participant Details" },
            { num: 4, title: "4. Documents" },
            { num: 5, title: "5. Review & Pay" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveStep(s.num)}
              style={{
                background: activeStep === s.num ? "#6D28D9" : "transparent",
                color: activeStep === s.num ? "#fff" : "#64748B",
                border: "none",
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: 28, overflowY: "auto", flex: 1 }}>
          {/* STEP 1: SELECT EVENT */}
          {activeStep === 1 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginTop: 0 }}>
                Step 1: Event Selection
              </h3>
              <p style={{ fontSize: 13.5, color: "#64748B" }}>
                The user picks or confirms the event they want to register for.
              </p>
              <div
                style={{
                  border: "2px solid #6D28D9",
                  borderRadius: 16,
                  padding: 20,
                  background: "#FAF5FF",
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    style={{
                      background: "#6D28D9",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: 12,
                      textTransform: "uppercase",
                    }}
                  >
                    {categoryName}
                  </span>
                  <h4 style={{ fontSize: 18, fontWeight: 900, color: "#1E1B4B", margin: "8px 0 4px" }}>
                    {eventTitle || "Event Title"}
                  </h4>
                  <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
                    Venue: HICC Convention Centre, Hyderabad • Date: 25 Oct 2026
                  </p>
                </div>
                <div
                  style={{
                    background: "#22C55E",
                    color: "#fff",
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  ✓ Selected
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PARTICIPATION TYPE */}
          {activeStep === 2 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginTop: 0 }}>
                Step 2: Select Participation Option
              </h3>
              <p style={{ fontSize: 13.5, color: "#64748B" }}>
                Configured participation categories and live fees.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 16,
                  marginTop: 16,
                }}
              >
                {activeTypes.map((pt) => {
                  const isSel = pt.id === selectedTypeId;
                  return (
                    <div
                      key={pt.id}
                      onClick={() => handleTypeSelect(pt.id)}
                      style={{
                        border: `2px solid ${isSel ? "#6D28D9" : "#E2E8F0"}`,
                        background: isSel ? "#FAF5FF" : "#fff",
                        borderRadius: 16,
                        padding: 16,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: isSel ? "0 4px 14px rgba(109,40,217,0.15)" : "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                          color: isSel ? "#6D28D9" : "#1E293B",
                        }}
                      >
                        [ {pt.name} ]
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", margin: "4px 0 10px" }}>
                        {pt.minParticipants === pt.maxParticipants
                          ? `${pt.minParticipants} Participant${pt.minParticipants > 1 ? "s" : ""}`
                          : `${pt.minParticipants}–${pt.maxParticipants} Participants`}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#059669" }}>
                        ₹{pt.fee.toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: PARTICIPANT DETAILS */}
          {activeStep === 3 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    Step 3: Participant Details ({currentType.name})
                  </h3>
                  <p style={{ fontSize: 13.5, color: "#64748B", margin: "4px 0 0" }}>
                    Selected Option Fee: <strong>₹{currentType.fee.toLocaleString("en-IN")}</strong>
                  </p>
                </div>
                {currentType.minParticipants !== currentType.maxParticipants && (
                  <div
                    style={{
                      background: "#EDE9FE",
                      color: "#6D28D9",
                      padding: "8px 16px",
                      borderRadius: 20,
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    Participants: {numParticipants} / {currentType.maxParticipants}
                  </div>
                )}
              </div>

              {/* Group Add/Remove Controls */}
              {currentType.minParticipants !== currentType.maxParticipants && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    margin: "16px 0",
                    background: "#F8FAFC",
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <button
                    type="button"
                    disabled={numParticipants <= currentType.minParticipants}
                    onClick={() => setNumParticipants((p) => Math.max(currentType.minParticipants, p - 1))}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "1px solid #CBD5E1",
                      background: "#fff",
                      fontWeight: 800,
                      cursor: numParticipants <= currentType.minParticipants ? "not-allowed" : "pointer",
                      opacity: numParticipants <= currentType.minParticipants ? 0.5 : 1,
                    }}
                  >
                    - Remove Participant
                  </button>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>
                    Total: {numParticipants} Participants
                  </span>
                  <button
                    type="button"
                    disabled={numParticipants >= currentType.maxParticipants}
                    onClick={() => setNumParticipants((p) => Math.min(currentType.maxParticipants, p + 1))}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "none",
                      background: "#6D28D9",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: numParticipants >= currentType.maxParticipants ? "not-allowed" : "pointer",
                      opacity: numParticipants >= currentType.maxParticipants ? 0.5 : 1,
                    }}
                  >
                    + Add Participant
                  </button>
                </div>
              )}

              {/* Team Details if Multi-participant */}
              {isMultiParticipant && (
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <h4 style={{ margin: "0 0 12px", color: "#1E293B", fontSize: 14, fontWeight: 800 }}>
                    Team Information
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {formConfig.teamSettings?.allowTeamName && (
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                          Team Name {formConfig.teamSettings.teamNameRequired ? "*" : ""}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Royal Dancers"
                          disabled
                          style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 8,
                            border: "1px solid #CBD5E1",
                            background: "#fff",
                            fontSize: 13,
                          }}
                        />
                      </div>
                    )}
                    {formConfig.teamSettings?.allowTeamLeader && (
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                          Team Leader Name {formConfig.teamSettings.teamLeaderRequired ? "*" : ""}
                        </label>
                        <input
                          type="text"
                          placeholder="Leader Full Name"
                          disabled
                          style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 8,
                            border: "1px solid #CBD5E1",
                            background: "#fff",
                            fontSize: 13,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Render Participant Forms */}
              {Array.from({ length: numParticipants }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    background: "#ffffff",
                  }}
                >
                  <h4 style={{ margin: "0 0 14px", color: "#6D28D9", fontSize: 15, fontWeight: 900 }}>
                    Participant #{idx + 1} Details
                  </h4>

                  {/* Basic Fields */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {(formConfig.basicFields || [])
                      .filter((f) => f.enabled)
                      .map((field) => (
                        <div key={field.id}>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                            {field.label} {field.required ? "*" : "(Optional)"}
                          </label>
                          <input
                            type={field.id === "dob" ? "date" : "text"}
                            placeholder={`Enter ${field.label}`}
                            disabled
                            style={{
                              width: "100%",
                              padding: 9,
                              borderRadius: 8,
                              border: "1px solid #CBD5E1",
                              background: "#F8FAFC",
                              fontSize: 13,
                            }}
                          />
                        </div>
                      ))}
                  </div>

                  {/* Custom Fields */}
                  {(formConfig.customFields || []).length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: "#475569",
                          marginBottom: 8,
                          textTransform: "uppercase",
                        }}
                      >
                        Custom Event Fields
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {formConfig.customFields.map((cf) => (
                          <div key={cf.id}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                              {cf.label} {cf.required ? "*" : "(Optional)"}
                            </label>
                            {cf.type === "dropdown" ? (
                              <select
                                disabled
                                style={{
                                  width: "100%",
                                  padding: 9,
                                  borderRadius: 8,
                                  border: "1px solid #CBD5E1",
                                  background: "#F8FAFC",
                                  fontSize: 13,
                                }}
                              >
                                {(cf.options || []).map((opt) => (
                                  <option key={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : cf.type === "radio" ? (
                              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                                {(cf.options || []).map((opt) => (
                                  <label key={opt} style={{ fontSize: 12, display: "flex", gap: 4 }}>
                                    <input type="radio" disabled /> {opt}
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <input
                                type={cf.type === "number" ? "number" : cf.type === "date" ? "date" : "text"}
                                placeholder={`Enter ${cf.label}`}
                                disabled
                                style={{
                                  width: "100%",
                                  padding: 9,
                                  borderRadius: 8,
                                  border: "1px solid #CBD5E1",
                                  background: "#F8FAFC",
                                  fontSize: 13,
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: DOCUMENTS */}
          {activeStep === 4 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginTop: 0 }}>
                Step 4: Required Documents
              </h3>
              <p style={{ fontSize: 13.5, color: "#64748B" }}>
                Configured document uploads for this event.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                {(formConfig.documents || []).map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      border: "1.5px solid #E2E8F0",
                      borderRadius: 16,
                      padding: 16,
                      background: "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>
                        {doc.name} {doc.required ? "*" : "(Optional)"}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                        Type: {doc.uploadType.toUpperCase()} • Max Size: {doc.maxSizeMB}MB • Allowed: {doc.allowedFileTypes}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled
                      style={{
                        padding: "8px 16px",
                        borderRadius: 10,
                        border: "1px solid #CBD5E1",
                        background: "#fff",
                        color: "#475569",
                        fontSize: 12.5,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Upload size={14} /> Choose File
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & PAY */}
          {activeStep === 5 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginTop: 0 }}>
                Step 5: Review & Payment Summary
              </h3>
              <p style={{ fontSize: 13.5, color: "#64748B" }}>
                Verify details before passing to Razorpay gateway.
              </p>

              <div
                style={{
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 20,
                  padding: 24,
                  background: "#FAF5FF",
                  marginTop: 16,
                }}
              >
                <h4 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 900, color: "#6D28D9" }}>
                  Registration Summary
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
                  <div>
                    <span style={{ color: "#64748B" }}>Event:</span>{" "}
                    <strong>{eventTitle || "Sample Event"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Participation Option:</span>{" "}
                    <strong>{currentType.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Participants Count:</span>{" "}
                    <strong>{numParticipants}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Registration Fee:</span>{" "}
                    <strong style={{ color: "#059669", fontSize: 16 }}>
                      ₹{currentType.fee.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px solid #E2E8F0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
                    Total Amount Payable:
                  </span>
                  <span style={{ fontSize: 24, fontWeight: 900, color: "#059669" }}>
                    ₹{currentType.fee.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 20, textAlign: "center" }}>
                <button
                  type="button"
                  disabled
                  style={{
                    padding: "14px 36px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                    color: "#fff",
                    border: "none",
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: "not-allowed",
                    opacity: 0.9,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Lock size={18} /> Pay ₹{currentType.fee.toLocaleString("en-IN")} Now (Razorpay)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div
          style={{
            background: "#F8FAFC",
            borderTop: "1px solid #E2E8F0",
            padding: "16px 28px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            type="button"
            disabled={activeStep <= 1}
            onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid #CBD5E1",
              background: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: activeStep <= 1 ? "not-allowed" : "pointer",
              opacity: activeStep <= 1 ? 0.5 : 1,
            }}
          >
            ← Previous Step
          </button>
          <button
            type="button"
            disabled={activeStep >= 5}
            onClick={() => setActiveStep((s) => Math.min(5, s + 1))}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: "#6D28D9",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              cursor: activeStep >= 5 ? "not-allowed" : "pointer",
              opacity: activeStep >= 5 ? 0.5 : 1,
            }}
          >
            Next Step →
          </button>
        </div>
      </div>
    </div>
  );
}
