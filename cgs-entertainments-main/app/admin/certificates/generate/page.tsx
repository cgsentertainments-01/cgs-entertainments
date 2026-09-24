"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, ArrowLeft, RefreshCw, Sparkles, Filter, CheckCircle2, AlertCircle, Eye, Download, ShieldCheck } from "lucide-react";
import { formatResultLabel } from "@/lib/certificate";

interface EligibleRegistrationItem {
  registration_id: string;
  registration_number: string;
  participant_id: string;
  participant_name: string;
  participant_number: string;
  participant_email: string;
  event_id: string;
  event_title: string;
  category_name: string;
  comp_type: string;
  result_type: string;
  is_eligible: boolean;
  certificate_type: string | null;
  eligibility_reason: string | null;
}

interface ExistingCertificateItem {
  id: string;
  certificate_number: string;
  registration_id: string;
  participant_name: string;
}

export default function AdminCertificatesGeneratePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [eligibleList, setEligibleList] = useState<EligibleRegistrationItem[]>([]);
  const [existingCerts, setExistingCerts] = useState<ExistingCertificateItem[]>([]);
  const [eventsList, setEventsList] = useState<{ id: string; title: string }[]>([]);

  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [batchGenerating, setBatchGenerating] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchGeneratorData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/certificates");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEligibleList(data.eligibleRegistrations || []);
          setExistingCerts(data.certificates || []);

          // Extract unique events list
          const uniqueEventsMap: Record<string, string> = {};
          (data.eligibleRegistrations || []).forEach((r: any) => {
            uniqueEventsMap[r.event_id] = r.event_title;
          });
          (data.certificates || []).forEach((c: any) => {
            uniqueEventsMap[c.event_id] = c.event_title;
          });

          const evts = Object.keys(uniqueEventsMap).map((id) => ({ id, title: uniqueEventsMap[id] }));
          setEventsList(evts);
          return;
        }
      }
      setError("Failed to fetch certificate generator database.");
    } catch (err) {
      console.error("Fetch generator exception:", err);
      setError("Network error loading generator data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneratorData();
  }, []);

  const handleSingleGenerate = async (regId: string, pName: string) => {
    try {
      setGeneratingId(regId);
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_id: regId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Certificate ${data.certificate.certificate_number} generated for ${pName}`);
        fetchGeneratorData();
      } else {
        alert(`Error: ${data.error || "Unable to generate certificate"}`);
      }
    } catch (err) {
      console.error("Generate error:", err);
      alert("Network error generating certificate.");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleBatchGenerate = async () => {
    const readyItems = filteredItems.filter((r) => r.is_eligible);
    if (readyItems.length === 0) return;

    if (!confirm(`Are you sure you want to generate ${readyItems.length} certificate(s)?`)) return;

    try {
      setBatchGenerating(true);
      let count = 0;
      for (const item of readyItems) {
        const res = await fetch("/api/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registration_id: item.registration_id }),
        });
        if (res.ok) count++;
      }
      showToast(`✓ Batch generation complete! Generated ${count} certificate(s).`);
      fetchGeneratorData();
    } catch (err) {
      console.error("Batch generate error:", err);
      alert("Error during batch certificate generation.");
    } finally {
      setBatchGenerating(false);
    }
  };

  const filteredItems = eligibleList.filter((item) => {
    const matchesEvent = selectedEventId === "all" || item.event_id === selectedEventId;
    const matchesResult = resultFilter === "all" || item.result_type === resultFilter;
    return matchesEvent && matchesResult;
  });

  const readyToGenerateCount = filteredItems.filter((r) => r.is_eligible).length;

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

      {/* Top Navigation */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/certificates"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            fontWeight: 800,
            color: "#6D28D9",
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={16} /> Back to Certificate Management
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 10 }}>
              <Sparkles size={28} color="#6D28D9" /> Certificate Batch Generator
            </h1>
            <p style={{ fontSize: 14.5, color: "#64748B", margin: 0 }}>
              Filter registrations with eligible assigned results and generate official certificates with 1-click duplicate protection.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={fetchGeneratorData}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                background: "#F3F4F6",
                color: "#374151",
                border: "1px solid #D1D5DB",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>

            <button
              type="button"
              onClick={handleBatchGenerate}
              disabled={batchGenerating || readyToGenerateCount === 0}
              style={{
                padding: "10px 22px",
                borderRadius: 12,
                background: readyToGenerateCount > 0 ? "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)" : "#CBD5E1",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 800,
                border: "none",
                cursor: readyToGenerateCount > 0 && !batchGenerating ? "pointer" : "not-allowed",
                boxShadow: readyToGenerateCount > 0 ? "0 4px 14px rgba(109,40,217,0.3)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Sparkles size={16} /> {batchGenerating ? "Generating..." : `Generate All Eligible (${readyToGenerateCount})`}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          border: "1.5px solid #E2E8F0",
          padding: "20px 24px",
          marginBottom: 24,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 260 }}>
          <Filter size={16} color="#6D28D9" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1.5px solid #CBD5E1",
              fontSize: 14,
              fontWeight: 700,
              background: "#ffffff",
            }}
          >
            <option value="all">All Events ({eventsList.length})</option>
            {eventsList.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#64748B" }}>Result Filter:</span>
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1.5px solid #CBD5E1",
              fontSize: 14,
              fontWeight: 700,
              background: "#ffffff",
            }}
          >
            <option value="all">All Results</option>
            <option value="winner">🏆 Winner</option>
            <option value="runner_up">🥈 Runner-up</option>
            <option value="finalist">🥉 Finalist</option>
            <option value="special_mention">⭐ Special Mention</option>
            <option value="participant">🎓 Participant</option>
            <option value="pending">⏳ Pending</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: "#FEF2F2", color: "#991B1B", borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Generator Table */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflowX: "auto", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#6B7280", fontWeight: 700 }}>
            Loading event registrations...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>
            <Award size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>No Registrations Found</h3>
            <p style={{ fontSize: 14, marginTop: 4 }}>
              Select a different event or assign results to participants in the Participant Registry.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", color: "#4B5563", fontWeight: 700 }}>
                <th style={{ padding: "14px 20px" }}>PARTICIPANT NO</th>
                <th style={{ padding: "14px 20px" }}>PARTICIPANT NAME</th>
                <th style={{ padding: "14px 20px" }}>EVENT &amp; CATEGORY</th>
                <th style={{ padding: "14px 20px" }}>ASSIGNED RESULT</th>
                <th style={{ padding: "14px 20px" }}>ELIGIBILITY STATUS</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const resultMeta = formatResultLabel(item.result_type);
                const isGenerating = generatingId === item.registration_id;

                return (
                  <tr key={item.registration_id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "16px 20px", fontWeight: 800, color: "#6D28D9" }}>
                      {item.participant_number}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 800, color: "#111827" }}>{item.participant_name}</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>{item.participant_email}</div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{item.event_title}</div>
                      <div style={{ fontSize: 12, color: "#6D28D9", fontWeight: 700 }}>{item.category_name}</div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 8, background: resultMeta.bg, color: resultMeta.color, fontSize: 12.5, fontWeight: 800 }}>
                        {resultMeta.badge}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {item.is_eligible ? (
                        <span style={{ color: "#10B981", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 5 }}>
                          <CheckCircle2 size={16} /> Eligible ({item.certificate_type})
                        </span>
                      ) : (
                        <span style={{ color: "#EF4444", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                          <AlertCircle size={16} /> {item.eligibility_reason || "Ineligible"}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      {item.is_eligible ? (
                        <button
                          type="button"
                          onClick={() => handleSingleGenerate(item.registration_id, item.participant_name)}
                          disabled={isGenerating}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 10,
                            background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                            color: "#ffffff",
                            fontSize: 13,
                            fontWeight: 800,
                            border: "none",
                            cursor: isGenerating ? "not-allowed" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            boxShadow: "0 2px 8px rgba(109,40,217,0.25)",
                          }}
                        >
                          <Sparkles size={14} /> {isGenerating ? "Generating..." : "Generate Certificate"}
                        </button>
                      ) : (
                        <span style={{ fontSize: 12.5, color: "#94A3B8", fontStyle: "italic" }}>
                          Result Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
