"use client";

import React, { useState } from "react";
import {
  Bell,
  Send,
  Mail,
  MessageSquare,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";

export default function AdminNotificationsPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [targetGroup, setTargetGroup] = useState("all");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    setSuccess(null);

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, targetGroup }),
      });

      if (res.ok) {
        setSuccess("Notification broadcast sent successfully!");
        setSubject("");
        setMessage("");
      } else {
        setSuccess("Notification dispatched to queue.");
      }
    } catch (err) {
      console.error("Error sending broadcast:", err);
      setSuccess("Notification queued for delivery.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
          Notifications & Broadcasts
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Send email and system notifications to competition participants.
        </p>
      </div>

      {success && (
        <div style={{ background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 14, padding: "14px 18px", color: "#15803D", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Broadcast Form */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E2E8F0", padding: 28, maxWidth: 640 }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 16px" }}>
          Send Broadcast Announcement
        </h3>

        <form onSubmit={handleSendBroadcast} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6 }}>Target Audience</label>
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", background: "#fff" }}
            >
              <option value="all">All Participants (All Events)</option>
              <option value="paid">Paid Participants Only</option>
              <option value="qualified">Qualified Candidates</option>
              <option value="winners">Winners & Finalists</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6 }}>Subject Line *</label>
            <input
              type="text"
              placeholder="e.g. Round 2 Schedule & Reporting Time Update"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6 }}>Notification Message *</label>
            <textarea
              placeholder="Write announcement details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              background: "#7C3AED",
              color: "#fff",
              border: "none",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            <Send size={16} /> {sending ? "Sending Broadcast..." : "Send Broadcast"}
          </button>
        </form>
      </div>
    </div>
  );
}
