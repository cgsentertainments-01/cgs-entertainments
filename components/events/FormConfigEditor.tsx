"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  Settings,
  CheckCircle2,
  FileText,
  Users,
  Upload,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import {
  EventFormConfig,
  ParticipationTypeConfig,
  BasicParticipantFieldConfig,
  CustomFieldConfig,
  DocumentConfig,
  TeamSettingsConfig,
  CustomFieldType,
  DocumentUploadType,
} from "@/types/event-config";
import { AdminFormPreviewModal } from "./AdminFormPreviewModal";

interface FormConfigEditorProps {
  formConfig: EventFormConfig;
  onChange: (updated: EventFormConfig) => void;
  eventTitle: string;
  categoryName: string;
}

export function FormConfigEditor({
  formConfig,
  onChange,
  eventTitle,
  categoryName,
}: FormConfigEditorProps) {
  const [activeTab, setActiveTab] = useState<
    "participation" | "basic" | "custom" | "team" | "documents"
  >("participation");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────
  // 1. PARTICIPATION TYPES HANDLERS
  // ───────────────────────────────────────────────────────────────────────────
  const addParticipationType = () => {
    const nextOrder = (formConfig.participationTypes || []).length + 1;
    const newType: ParticipationTypeConfig = {
      id: `type_${Date.now()}`,
      name: "New Participation Option",
      minParticipants: 1,
      maxParticipants: 1,
      fee: 500,
      isActive: true,
      order: nextOrder,
    };
    onChange({
      ...formConfig,
      participationTypes: [...(formConfig.participationTypes || []), newType],
    });
  };

  const updateParticipationType = (
    index: number,
    field: keyof ParticipationTypeConfig,
    value: any
  ) => {
    const copy = [...(formConfig.participationTypes || [])];
    copy[index] = { ...copy[index], [field]: value };
    onChange({ ...formConfig, participationTypes: copy });
  };

  const removeParticipationType = (index: number) => {
    const copy = (formConfig.participationTypes || []).filter(
      (_, i) => i !== index
    );
    onChange({ ...formConfig, participationTypes: copy });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 2. BASIC PARTICIPANT FIELDS HANDLERS
  // ───────────────────────────────────────────────────────────────────────────
  const updateBasicField = (
    index: number,
    field: "enabled" | "required" | "label",
    value: any
  ) => {
    const copy = [...(formConfig.basicFields || [])];
    copy[index] = { ...copy[index], [field]: value };
    onChange({ ...formConfig, basicFields: copy });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 3. CUSTOM FIELDS HANDLERS
  // ───────────────────────────────────────────────────────────────────────────
  const addCustomField = () => {
    const nextOrder = (formConfig.customFields || []).length + 1;
    const newField: CustomFieldConfig = {
      id: `field_${Date.now()}`,
      label: "Custom Field Label",
      type: "text",
      required: false,
      options: ["Option 1", "Option 2"],
      order: nextOrder,
    };
    onChange({
      ...formConfig,
      customFields: [...(formConfig.customFields || []), newField],
    });
  };

  const updateCustomField = (
    index: number,
    field: keyof CustomFieldConfig,
    value: any
  ) => {
    const copy = [...(formConfig.customFields || [])];
    copy[index] = { ...copy[index], [field]: value };
    onChange({ ...formConfig, customFields: copy });
  };

  const removeCustomField = (index: number) => {
    const copy = (formConfig.customFields || []).filter((_, i) => i !== index);
    onChange({ ...formConfig, customFields: copy });
  };

  const addOptionToCustomField = (fieldIndex: number) => {
    const copy = [...(formConfig.customFields || [])];
    const opts = copy[fieldIndex].options || [];
    copy[fieldIndex].options = [...opts, `Option ${opts.length + 1}`];
    onChange({ ...formConfig, customFields: copy });
  };

  const updateCustomFieldOption = (
    fieldIndex: number,
    optIndex: number,
    val: string
  ) => {
    const copy = [...(formConfig.customFields || [])];
    const opts = [...(copy[fieldIndex].options || [])];
    opts[optIndex] = val;
    copy[fieldIndex].options = opts;
    onChange({ ...formConfig, customFields: copy });
  };

  const removeCustomFieldOption = (fieldIndex: number, optIndex: number) => {
    const copy = [...(formConfig.customFields || [])];
    const opts = (copy[fieldIndex].options || []).filter(
      (_, i) => i !== optIndex
    );
    copy[fieldIndex].options = opts;
    onChange({ ...formConfig, customFields: copy });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 4. TEAM SETTINGS HANDLERS
  // ───────────────────────────────────────────────────────────────────────────
  const updateTeamSetting = (field: keyof TeamSettingsConfig, value: boolean) => {
    onChange({
      ...formConfig,
      teamSettings: {
        ...(formConfig.teamSettings || {
          allowTeamName: true,
          teamNameRequired: true,
          allowTeamLeader: true,
          teamLeaderRequired: true,
          allowTeamContact: true,
          teamContactRequired: true,
        }),
        [field]: value,
      },
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 5. DOCUMENTS HANDLERS
  // ───────────────────────────────────────────────────────────────────────────
  const addDocument = () => {
    const nextOrder = (formConfig.documents || []).length + 1;
    const newDoc: DocumentConfig = {
      id: `doc_${Date.now()}`,
      name: "Document Name",
      uploadType: "document",
      required: true,
      maxSizeMB: 10,
      allowedFileTypes: ".pdf,.jpg,.jpeg,.png",
      order: nextOrder,
    };
    onChange({
      ...formConfig,
      documents: [...(formConfig.documents || []), newDoc],
    });
  };

  const updateDocument = (
    index: number,
    field: keyof DocumentConfig,
    value: any
  ) => {
    const copy = [...(formConfig.documents || [])];
    copy[index] = { ...copy[index], [field]: value };
    onChange({ ...formConfig, documents: copy });
  };

  const removeDocument = (index: number) => {
    const copy = (formConfig.documents || []).filter((_, i) => i !== index);
    onChange({ ...formConfig, documents: copy });
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        border: "1.5px solid #E2E8F0",
        padding: 28,
        marginTop: 28,
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <Settings size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                Registration Form Configuration
              </h3>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0, fontWeight: 500 }}>
                Configure event-specific participation options, fees, basic &amp; custom fields, and required documents.
              </p>
            </div>
          </div>
        </div>

        {/* Live Admin Preview Button */}
        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #312E81 0%, #4338CA 100%)",
            color: "#fff",
            border: "none",
            fontSize: 13.5,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(49, 46, 129, 0.25)",
            transition: "transform 0.2s",
          }}
        >
          <Eye size={16} /> Preview Registration Form
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1.5px solid #E2E8F0",
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        {[
          { id: "participation", label: "Participation Types & Fees", icon: Users },
          { id: "basic", label: "Basic Participant Fields", icon: FileText },
          { id: "custom", label: "Custom Fields", icon: Plus },
          { id: "team", label: "Team & Group Settings", icon: Settings },
          { id: "documents", label: "Required Documents", icon: Upload },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 18px",
                border: "none",
                borderBottom: `2.5px solid ${isActive ? "#6D28D9" : "transparent"}`,
                background: "transparent",
                color: isActive ? "#6D28D9" : "#64748B",
                fontSize: 13.5,
                fontWeight: isActive ? 800 : 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: PARTICIPATION TYPES & FEES */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === "participation" && (
        <div>
          <div
            style={{
              background: "#F8FAFC",
              borderRadius: 14,
              padding: 16,
              marginBottom: 20,
              border: "1px solid #E2E8F0",
              fontSize: 13,
              color: "#334155",
            }}
          >
            <strong>Note on Fee Logic:</strong> Registration fees are determined dynamically per participation type (e.g. Solo ₹500, Duo ₹800, Trio ₹1,000, Group ₹2,000). You can add, edit, or deactivate options below.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(formConfig.participationTypes || []).map((pt, idx) => (
              <div
                key={pt.id || idx}
                style={{
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 16,
                  padding: 20,
                  background: pt.isActive ? "#ffffff" : "#F8FAFC",
                  opacity: pt.isActive ? 1 : 0.7,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.8fr 0.5fr", gap: 12, alignItems: "center" }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Option Name *
                    </label>
                    <input
                      type="text"
                      value={pt.name}
                      onChange={(e) => updateParticipationType(idx, "name", e.target.value)}
                      placeholder="e.g. Solo / Duo / Group"
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 13.5,
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Min Participants
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={pt.minParticipants}
                      onChange={(e) => updateParticipationType(idx, "minParticipants", parseInt(e.target.value, 10) || 1)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 13.5,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Max Participants
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={pt.maxParticipants}
                      onChange={(e) => updateParticipationType(idx, "maxParticipants", parseInt(e.target.value, 10) || 1)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 13.5,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Registration Fee (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={pt.fee}
                      onChange={(e) => updateParticipationType(idx, "fee", parseFloat(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: "#059669",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Status
                    </label>
                    <button
                      type="button"
                      onClick={() => updateParticipationType(idx, "isActive", !pt.isActive)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "none",
                        background: pt.isActive ? "#DCFCE7" : "#F1F5F9",
                        color: pt.isActive ? "#166534" : "#64748B",
                        fontSize: 12.5,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {pt.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>

                  <div style={{ textAlign: "right", marginTop: 18 }}>
                    <button
                      type="button"
                      onClick={() => removeParticipationType(idx)}
                      style={{
                        background: "#FEF2F2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                        borderRadius: 10,
                        padding: 9,
                        cursor: "pointer",
                      }}
                      title="Remove Option"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addParticipationType}
            style={{
              marginTop: 18,
              padding: "11px 22px",
              borderRadius: 12,
              border: "1.5px dashed #6D28D9",
              background: "#FAF5FF",
              color: "#6D28D9",
              fontSize: 13.5,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={16} /> Add Participation Type
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: BASIC PARTICIPANT FIELDS */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === "basic" && (
        <div>
          <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 16 }}>
            Enable/Disable and set required rules for basic participant profile fields.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(formConfig.basicFields || []).map((field, idx) => (
              <div
                key={field.id}
                style={{
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 14,
                  padding: "14px 20px",
                  background: field.enabled ? "#ffffff" : "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>
                    {field.label}
                  </span>
                  <span style={{ fontSize: 12, color: "#94A3B8", marginLeft: 8 }}>
                    ({field.id})
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={field.enabled}
                      onChange={(e) => updateBasicField(idx, "enabled", e.target.checked)}
                    />
                    Enabled
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={field.required}
                      disabled={!field.enabled}
                      onChange={(e) => updateBasicField(idx, "required", e.target.checked)}
                    />
                    Required
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: CUSTOM FIELDS */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === "custom" && (
        <div>
          <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 16 }}>
            Add custom fields such as Performance Track Name, Singing Language, Dance Style, etc.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(formConfig.customFields || []).map((cf, idx) => (
              <div
                key={cf.id || idx}
                style={{
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 16,
                  padding: 20,
                  background: "#ffffff",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 0.5fr", gap: 12, alignItems: "center" }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Field Label *
                    </label>
                    <input
                      type="text"
                      value={cf.label}
                      onChange={(e) => updateCustomField(idx, "label", e.target.value)}
                      placeholder="e.g. Performance Style"
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 13.5,
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Field Type
                    </label>
                    <select
                      value={cf.type}
                      onChange={(e) => updateCustomField(idx, "type", e.target.value as CustomFieldType)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 13.5,
                      }}
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Number Input</option>
                      <option value="date">Date Input</option>
                      <option value="dropdown">Dropdown Select</option>
                      <option value="radio">Radio Buttons</option>
                      <option value="checkbox">Checkbox Toggle</option>
                      <option value="file">File Upload</option>
                      <option value="video">Video Upload</option>
                    </select>
                  </div>

                  <div style={{ marginTop: 22 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={cf.required}
                        onChange={(e) => updateCustomField(idx, "required", e.target.checked)}
                      />
                      Required
                    </label>
                  </div>

                  <div style={{ textAlign: "right", marginTop: 20 }}>
                    <button
                      type="button"
                      onClick={() => removeCustomField(idx)}
                      style={{
                        background: "#FEF2F2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                        borderRadius: 10,
                        padding: 9,
                        cursor: "pointer",
                      }}
                      title="Remove Field"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Option List for Dropdown or Radio */}
                {(cf.type === "dropdown" || cf.type === "radio") && (
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: "1px dashed #E2E8F0",
                      background: "#F8FAFC",
                      padding: 14,
                      borderRadius: 12,
                    }}
                  >
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", marginBottom: 8, display: "block" }}>
                      Options List (Dropdown / Radio Choices)
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      {(cf.options || []).map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#fff",
                            border: "1px solid #CBD5E1",
                            borderRadius: 8,
                            padding: "4px 8px",
                          }}
                        >
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateCustomFieldOption(idx, oIdx, e.target.value)}
                            style={{ border: "none", outline: "none", fontSize: 12.5, width: 100, fontWeight: 600 }}
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomFieldOption(idx, oIdx)}
                            style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", padding: 0 }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addOptionToCustomField(idx)}
                      style={{
                        background: "#fff",
                        border: "1px solid #6D28D9",
                        color: "#6D28D9",
                        borderRadius: 8,
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      + Add Choice Option
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addCustomField}
            style={{
              marginTop: 18,
              padding: "11px 22px",
              borderRadius: 12,
              border: "1.5px dashed #6D28D9",
              background: "#FAF5FF",
              color: "#6D28D9",
              fontSize: 13.5,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={16} /> Add Custom Field
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: TEAM & GROUP SETTINGS */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === "team" && (
        <div>
          <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 16 }}>
            Configure fields for multi-participant registrations (Duo, Trio, Group). Solo registrations hide these fields unless explicitly required.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ border: "1.5px solid #E2E8F0", borderRadius: 16, padding: 18, background: "#fff" }}>
              <h4 style={{ margin: "0 0 12px", color: "#0F172A", fontSize: 15, fontWeight: 800 }}>
                Team / Group Name
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formConfig.teamSettings?.allowTeamName !== false}
                    onChange={(e) => updateTeamSetting("allowTeamName", e.target.checked)}
                  />
                  Enable Team Name Field
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formConfig.teamSettings?.teamNameRequired !== false}
                    onChange={(e) => updateTeamSetting("teamNameRequired", e.target.checked)}
                  />
                  Require Team Name Field
                </label>
              </div>
            </div>

            <div style={{ border: "1.5px solid #E2E8F0", borderRadius: 16, padding: 18, background: "#fff" }}>
              <h4 style={{ margin: "0 0 12px", color: "#0F172A", fontSize: 15, fontWeight: 800 }}>
                Team Leader Name
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formConfig.teamSettings?.allowTeamLeader !== false}
                    onChange={(e) => updateTeamSetting("allowTeamLeader", e.target.checked)}
                  />
                  Enable Team Leader Field
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formConfig.teamSettings?.teamLeaderRequired !== false}
                    onChange={(e) => updateTeamSetting("teamLeaderRequired", e.target.checked)}
                  />
                  Require Team Leader Field
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: REQUIRED DOCUMENTS */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === "documents" && (
        <div>
          <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 16 }}>
            Define event-specific required documents (e.g. Passport Photo, Aadhaar, Dance Video / Audio Track).
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(formConfig.documents || []).map((doc, idx) => (
              <div
                key={doc.id || idx}
                style={{
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 16,
                  padding: 20,
                  background: "#ffffff",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.8fr 0.5fr", gap: 12, alignItems: "center" }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Document Name *
                    </label>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => updateDocument(idx, "name", e.target.value)}
                      placeholder="e.g. Dance Video"
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 13.5,
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Upload Type
                    </label>
                    <select
                      value={doc.uploadType}
                      onChange={(e) => updateDocument(idx, "uploadType", e.target.value as DocumentUploadType)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 13.5,
                      }}
                    >
                      <option value="image">Image (Photo)</option>
                      <option value="document">Document (PDF/Image)</option>
                      <option value="video">Video Upload</option>
                      <option value="audio">Audio Track</option>
                      <option value="file">Any File</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Max Size (MB)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={doc.maxSizeMB}
                      onChange={(e) => updateDocument(idx, "maxSizeMB", parseInt(e.target.value, 10) || 10)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 13.5,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Allowed Extensions
                    </label>
                    <input
                      type="text"
                      value={doc.allowedFileTypes}
                      onChange={(e) => updateDocument(idx, "allowedFileTypes", e.target.value)}
                      placeholder=".jpg,.png"
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 13.5,
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 22 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={doc.required}
                        onChange={(e) => updateDocument(idx, "required", e.target.checked)}
                      />
                      Required
                    </label>
                  </div>

                  <div style={{ textAlign: "right", marginTop: 18 }}>
                    <button
                      type="button"
                      onClick={() => removeDocument(idx)}
                      style={{
                        background: "#FEF2F2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                        borderRadius: 10,
                        padding: 9,
                        cursor: "pointer",
                      }}
                      title="Remove Document Requirement"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addDocument}
            style={{
              marginTop: 18,
              padding: "11px 22px",
              borderRadius: 12,
              border: "1.5px dashed #6D28D9",
              background: "#FAF5FF",
              color: "#6D28D9",
              fontSize: 13.5,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={16} /> Add Document Requirement
          </button>
        </div>
      )}

      {/* Admin Preview Modal Render */}
      <AdminFormPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        eventTitle={eventTitle}
        categoryName={categoryName}
        formConfig={formConfig}
      />
    </div>
  );
}
