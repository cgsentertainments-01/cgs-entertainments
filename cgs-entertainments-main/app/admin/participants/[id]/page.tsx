"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  User,
  Award,
  Calendar,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  Eye,
  Download,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { formatResultLabel, formatCertificateTypeLabel } from "@/lib/certificate";

interface ParticipantDetail {
  id: string;
  full_name: string;
  participant_number: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  profile_photo?: string;
  created_at?: string;
}

interface IssuedCertificate {
  id: string;
  certificate_number: string;
  certificate_type: string;
  certificate_url: string;
  status: string;
  issued_at: string;
  event_title: string;
  category_name: string;
  result_type: string;
}

export default function AdminParticipantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const participantId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<ParticipantDetail | null>(null);
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [viewingCert, setViewingCert] = useState<IssuedCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipantData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch participant details and certificates
      const res = await fetch(`/api/certificates`);
      const data = await res.json();

      if (res.ok && data.success) {
        // Filter certificates for this participant ID
        const matchedCerts = (data.certificates || []).filter(
          (c: any) => c.participant_id === participantId
        );
        setCertificates(matchedCerts);

        // Deduce participant info from certificates or fallback
        if (matchedCerts.length > 0) {
          const sample = matchedCerts[0];
          setParticipant({
            id: participantId,
            full_name: sample.participant_name,
            participant_number: sample.participant_number,
            email: sample.participant_email || "N/A",
            phone: "N/A",
          });
        }
      }
    } catch (err: any) {
      console.error("Error fetching participant certificates:", err);
      setError("Network error fetching participant data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (participantId) {
      fetchParticipantData();
    }
  }, [participantId]);

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto", fontFamily: "inherit" }}>
      {/* Top Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/certificates" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6D28D9", textDecoration: "none", fontWeight: 800, fontSize: 13, marginBottom: 10 }}>
          <ArrowLeft size={16} /> Back to Certificates Dashboard
        </Link>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <User size={26} color="#6D28D9" /> Participant Profile &amp; Issued Credentials
        </h1>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "#64748B", fontWeight: 700 }}>
          Loading participant profile...
        </div>
      ) : (
        <div>
          {/* Participant Info Banner */}
          <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: 24, marginBottom: 28, boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F3E8FF", color: "#6D28D9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900 }}>
                {participant?.full_name?.substring(0, 2).toUpperCase() || "P"}
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
                  {participant?.full_name || `Participant (${participantId.substring(0, 8)})`}
                </h2>
                <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                  Participant ID: <strong>{participant?.participant_number || participantId}</strong> • Email: <strong>{participant?.email}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ── 13. PARTICIPANT PROFILE INTEGRATION (CERTIFICATES SECTION) ── */}
          <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <Award size={20} color="#6D28D9" /> Issued Certificates
            </h3>

            {certificates.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748B", background: "#F8FAFC", borderRadius: 16 }}>
                <Award size={40} color="#94A3B8" style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>No certificates issued to this participant yet.</div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Certificates will appear here automatically once issued.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    style={{
                      background: "#F8FAFC",
                      borderRadius: 16,
                      border: "1.5px solid #E2E8F0",
                      padding: 18,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#6D28D9", fontFamily: "monospace" }}>
                          {cert.certificate_number}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 900, background: "#ECFDF5", color: "#047857", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                          {cert.status}
                        </span>
                      </div>

                      <h4 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
                        {cert.event_title}
                      </h4>
                      <div style={{ fontSize: 13, color: "#475569", fontWeight: 700, marginBottom: 8 }}>
                        {formatCertificateTypeLabel(cert.certificate_type)}
                      </div>

                      <div style={{ fontSize: 12, color: "#64748B" }}>
                        Issued: <strong>{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #E2E8F0", display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setViewingCert(cert)}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: "#6D28D9", color: "#fff", border: "none", fontSize: 12.5, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      >
                        <Eye size={14} /> View Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW CERTIFICATE MODAL */}
      {viewingCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 24, width: "100%", maxWidth: 900, padding: 24, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>{viewingCert.certificate_number}</h3>
                <div style={{ fontSize: 12.5, color: "#64748B" }}>{viewingCert.event_title} • {formatCertificateTypeLabel(viewingCert.certificate_type)}</div>
              </div>
              <button type="button" onClick={() => setViewingCert(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><Eye size={22} color="#94A3B8" /></button>
            </div>

            <div style={{ width: "100%", height: 480, borderRadius: 16, overflow: "hidden", border: "1px solid #E2E8F0" }}>
              <iframe
                srcDoc={
                  viewingCert.certificate_url?.startsWith("data:text/html;charset=utf-8,")
                    ? decodeURIComponent(viewingCert.certificate_url.replace("data:text/html;charset=utf-8,", ""))
                    : viewingCert.certificate_url
                }
                style={{ width: "100%", height: "100%", border: "none" }}
                title="Participant Certificate Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
