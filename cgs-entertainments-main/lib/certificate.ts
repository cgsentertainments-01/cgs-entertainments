import { createHash, randomBytes } from "crypto";

export interface CertificateEligibility {
  eligible: boolean;
  certificateType: "winner" | "runner_up" | "finalist" | "merit" | "appreciation" | "participation" | "achievement" | "custom" | null;
  title: string;
  reason?: string;
}

export interface CanvaTextElement {
  id: string;
  field_key?: string;
  text: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: "normal" | "italic";
  color: string;
  textAlign: "left" | "center" | "right";
  is_custom?: boolean;
}

export interface CertificateHistoryItem {
  id: string;
  action: "created" | "issued" | "reissued" | "revoked" | "updated";
  title: string;
  timestamp: string;
  performed_by?: string;
  notes?: string;
}

export interface CertificateSnapshotData {
  participant_name: string;
  participant_number: string;
  event_title: string;
  event_date: string | null;
  venue: string | null;
  category_name: string | null;
  competition_name?: string | null;
  round_name?: string | null;
  participation_type: string | null;
  result_label: string;
  result_badge: string;
  certificate_title: string;
  subtitle?: string;
  authorized_signatory: string;
  signatory_title?: string;
  organization_name: string;
  certificate_number: string;
  verification_token: string;
  issue_date: string;
  template_id?: string | null;
  template_name?: string | null;
  background_url?: string | null;
  custom_notes?: string | null;
  revoke_reason?: string | null;
  reissued_from_id?: string | null;
  history_logs?: CertificateHistoryItem[];
  text_elements?: CanvaTextElement[];
}

/**
 * Check Certificate Eligibility based on result status.
 */
export function checkCertificateEligibility(
  resultType: string | null | undefined,
  allowParticipation: boolean = true
): CertificateEligibility {
  const normalized = (resultType || "pending").toLowerCase().trim();

  switch (normalized) {
    case "winner":
    case "first_place":
      return {
        eligible: true,
        certificateType: "winner",
        title: "Winner Certificate",
      };
    case "runner_up":
    case "runner-up":
    case "second_place":
      return {
        eligible: true,
        certificateType: "runner_up",
        title: "Runner-up Certificate",
      };
    case "third_place":
    case "finalist":
      return {
        eligible: true,
        certificateType: "finalist",
        title: "Finalist Certificate",
      };
    case "special_mention":
    case "appreciation":
      return {
        eligible: true,
        certificateType: "appreciation",
        title: "Appreciation Certificate",
      };
    case "achievement":
      return {
        eligible: true,
        certificateType: "achievement",
        title: "Achievement Certificate",
      };
    case "custom":
      return {
        eligible: true,
        certificateType: "custom",
        title: "Custom Certificate",
      };
    case "participant":
    case "completed":
      if (allowParticipation) {
        return {
          eligible: true,
          certificateType: "participation",
          title: "Participation Certificate",
        };
      }
      return {
        eligible: false,
        certificateType: null,
        title: "Ineligible",
        reason: "Participation certificates are disabled for this event",
      };
    case "disqualified":
      return {
        eligible: false,
        certificateType: null,
        title: "Disqualified",
        reason: "Participant is disqualified.",
      };
    case "pending":
    default:
      return {
        eligible: false,
        certificateType: null,
        title: "Ineligible",
        reason: "Result status is Pending. Result must be assigned first.",
      };
  }
}

/**
 * Format result type to human readable label with badge styling.
 */
export function formatResultLabel(resultType?: string | null): { label: string; badge: string; color: string; bg: string } {
  const norm = (resultType || "pending").toLowerCase().trim();
  switch (norm) {
    case "winner":
      return { label: "Winner", badge: "🏆 Winner", color: "#B45309", bg: "#FEF3C7" };
    case "first_place":
      return { label: "1st Place", badge: "🥇 1st Place", color: "#854D0E", bg: "#FEF9C3" };
    case "second_place":
      return { label: "2nd Place", badge: "🥈 2nd Place", color: "#334155", bg: "#F1F5F9" };
    case "third_place":
      return { label: "3rd Place", badge: "🥉 3rd Place", color: "#C2410C", bg: "#FFEDD5" };
    case "runner_up":
    case "runner-up":
      return { label: "Runner-up", badge: "🥈 Runner-up", color: "#1E293B", bg: "#E2E8F0" };
    case "finalist":
      return { label: "Finalist", badge: "🥉 Finalist", color: "#9A3412", bg: "#FFEDD5" };
    case "special_mention":
    case "appreciation":
      return { label: "Special Mention", badge: "⭐ Special Mention", color: "#6B21A8", bg: "#F3E8FF" };
    case "qualified":
      return { label: "Qualified", badge: "✓ Qualified", color: "#15803D", bg: "#DCFCE7" };
    case "participant":
    case "completed":
      return { label: "Participant", badge: "🎓 Participated", color: "#0369A1", bg: "#E0F2FE" };
    case "disqualified":
      return { label: "Disqualified", badge: "✕ Disqualified", color: "#B91C1C", bg: "#FEE2E2" };
    case "pending":
    default:
      return { label: "Pending", badge: "⏳ Pending", color: "#64748B", bg: "#F8FAFC" };
  }
}

/**
 * Format certificate type to clean display label.
 */
export function formatCertificateTypeLabel(certType?: string | null): string {
  const norm = (certType || "participation").toLowerCase().trim();
  switch (norm) {
    case "winner":
      return "Winner Certificate";
    case "runner_up":
    case "runner-up":
      return "Runner-up Certificate";
    case "finalist":
    case "merit":
      return "Finalist Certificate";
    case "appreciation":
    case "special_mention":
      return "Appreciation Certificate";
    case "achievement":
      return "Achievement Certificate";
    case "custom":
      return "Custom Certificate";
    case "participation":
    default:
      return "Participation Certificate";
  }
}

/**
 * Generate unique certificate number: CGS-CERT-YYYY-XXXXXX
 */
export function generateCertificateNumber(year: number = new Date().getFullYear()): string {
  const randomHex = Math.floor(100000 + Math.random() * 900000).toString();
  return `CGS-CERT-${year}-${randomHex}`;
}

/**
 * Generate secure verification token.
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Helper to build audit history item
 */
export function createAuditHistoryItem(
  action: "created" | "issued" | "reissued" | "revoked" | "updated",
  title: string,
  notes?: string,
  performed_by: string = "Admin"
): CertificateHistoryItem {
  return {
    id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    action,
    title,
    timestamp: new Date().toISOString(),
    performed_by,
    notes,
  };
}

/**
 * Embed snapshot JSON into HTML Data URI cleanly.
 */
export function encodeCertificatePayload(snapshot: CertificateSnapshotData, html: string): string {
  const snapshotJson = JSON.stringify(snapshot);
  const commentHeader = `<!-- CERT_SNAPSHOT:${encodeURIComponent(snapshotJson)} -->\n`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(commentHeader + html)}`;
}

/**
 * Extract snapshot JSON from certificate_url.
 */
export function extractCertificateSnapshot(certificateUrl: string): CertificateSnapshotData | null {
  try {
    if (!certificateUrl) return null;
    let decoded = certificateUrl;
    if (decoded.startsWith("data:text/html;charset=utf-8,")) {
      decoded = decodeURIComponent(decoded.replace("data:text/html;charset=utf-8,", ""));
    }
    const match = decoded.match(/<!-- CERT_SNAPSHOT:(.*?) -->/);
    if (match && match[1]) {
      const snapshotJson = decodeURIComponent(match[1]);
      return JSON.parse(snapshotJson);
    }
  } catch (e) {}
  return null;
}

/**
 * Render HTML Certificate from Snapshot & Background Image.
 */
export function renderCertificateHTMLFromSnapshot(snapshot: CertificateSnapshotData): string {
  const bgStyle = snapshot.background_url
    ? `background-image: url('${snapshot.background_url}'); background-size: cover; background-position: center;`
    : `background: radial-gradient(circle at center, #ffffff 0%, #faf5ff 100%);`;

  // Default elements if text_elements not present
  const elements: CanvaTextElement[] = snapshot.text_elements && snapshot.text_elements.length > 0
    ? snapshot.text_elements
    : [
        { id: "org", text: snapshot.organization_name || "CGS ENTERTAINMENTS", x: 50, y: 12, fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 900, fontStyle: "normal", color: "#6d28d9", textAlign: "center" },
        { id: "title", text: snapshot.certificate_title || "Certificate of Achievement", x: 50, y: 22, fontFamily: "'Cinzel', serif", fontSize: 32, fontWeight: 900, fontStyle: "normal", color: "#0f172a", textAlign: "center" },
        { id: "subtitle", text: "THIS IS PROUDLY PRESENTED TO", x: 50, y: 31, fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 700, fontStyle: "normal", color: "#64748b", textAlign: "center" },
        { id: "name", text: snapshot.participant_name, x: 50, y: 43, fontFamily: "'Pinyon Script', cursive", fontSize: 56, fontWeight: 700, fontStyle: "normal", color: "#6d28d9", textAlign: "center" },
        { id: "pid", text: `ID: ${snapshot.participant_number}`, x: 50, y: 53, fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 800, color: "#475569", fontStyle: "normal", textAlign: "center" },
        { id: "event", text: `For performance in ${snapshot.event_title} (${snapshot.category_name || "General"})`, x: 50, y: 62, fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 600, color: "#334155", fontStyle: "normal", textAlign: "center" },
        { id: "result", text: snapshot.result_badge || snapshot.result_label.toUpperCase(), x: 50, y: 72, fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 800, color: "#d97706", fontStyle: "normal", textAlign: "center" },
        { id: "cert_no", text: `Cert #: ${snapshot.certificate_number}`, x: 20, y: 88, fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 600, color: "#64748b", fontStyle: "normal", textAlign: "left" },
        { id: "date", text: `Issue Date: ${snapshot.issue_date}`, x: 50, y: 88, fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 600, color: "#64748b", fontStyle: "normal", textAlign: "center" },
        { id: "sig", text: `Signature: ${snapshot.authorized_signatory}`, x: 80, y: 88, fontFamily: "'Pinyon Script', cursive", fontSize: 22, fontWeight: 700, color: "#0f172a", fontStyle: "normal", textAlign: "right" },
      ];

  const textOverlays = elements
    .map((el) => {
      const transformX = el.textAlign === "center" ? "-50%" : el.textAlign === "right" ? "-100%" : "0%";
      return `
        <div style="
          position: absolute;
          left: ${el.x}%;
          top: ${el.y}%;
          transform: translate(${transformX}, -50%);
          font-family: ${el.fontFamily};
          font-size: ${el.fontSize}px;
          font-weight: ${el.fontWeight};
          font-style: ${el.fontStyle};
          color: ${el.color};
          text-align: ${el.textAlign};
          white-space: nowrap;
          pointer-events: none;
          line-height: 1.2;
        ">
          ${el.text}
        </div>
      `;
    })
    .join("\n");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${snapshot.certificate_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800;900&family=Montserrat:wght@400;600;700;800&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;600;700;800&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Montserrat', sans-serif;
      background: #0f172a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .cert-container {
      width: 1000px;
      height: 700px;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border-radius: 8px;
      overflow: hidden;
      background-color: #ffffff;
      ${bgStyle}
    }
  </style>
</head>
<body>
  <div class="cert-container">
    ${textOverlays}
  </div>
</body>
</html>
  `;
}
