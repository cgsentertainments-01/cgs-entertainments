"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Bell,
  Trophy,
  MessageSquare,
  CheckCircle2,
  CheckCheck,
  Calendar,
  Sparkles,
  ExternalLink,
  Filter,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
  event_id?: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "result" | "message">("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id: string, linkUrl?: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      if (linkUrl) {
        router.push(linkUrl);
      }
    } catch (e) {
      console.error("Failed marking read:", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error("Failed marking all read:", e);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.is_read;
    if (activeFilter === "result") return n.notification_type === "result";
    if (activeFilter === "message") return n.notification_type === "message";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 960, margin: "36px auto 64px", padding: "0 24px" }}>
        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#F3E8FF", borderRadius: 12, fontSize: 12, fontWeight: 800, color: "#6D28D9", textTransform: "uppercase", marginBottom: 8 }}>
              <Bell size={14} color="#6D28D9" /> Participant Alerts
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.5 }}>
              Notifications & Updates
            </h1>
            <p style={{ fontSize: 15, color: "#64748B", margin: 0, fontWeight: 500 }}>
              Stay updated on your contest results, judge feedback, and announcements.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                background: "#6D28D9",
                color: "#ffffff",
                border: "none",
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(109, 40, 217, 0.25)",
              }}
            >
              <CheckCheck size={16} /> Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            background: "#ffffff",
            padding: 8,
            borderRadius: 16,
            border: "1.5px solid #E2E8F0",
            overflowX: "auto",
          }}
        >
          {[
            { key: "all", label: "All Notifications" },
            { key: "unread", label: `Unread (${unreadCount})` },
            { key: "result", label: "Contest Results 🏆" },
            { key: "message", label: "Direct Messages ✉" },
          ].map((tab) => {
            const active = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key as any)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 800,
                  border: "none",
                  background: active ? "#6D28D9" : "transparent",
                  color: active ? "#ffffff" : "#64748B",
                  cursor: "pointer",
                  transition: "all 0.18s",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Notifications List Container */}
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748B", fontWeight: 600 }}>
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "1.5px solid #E2E8F0",
              padding: 48,
              textAlign: "center",
            }}
          >
            <Sparkles size={40} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>
              No notifications found
            </h3>
            <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
              {activeFilter === "unread" ? "You have no unread notifications." : "Notifications regarding your event results will appear here."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  border: n.is_read ? "1.5px solid #E2E8F0" : "2px solid #C084FC",
                  padding: "20px 24px",
                  boxShadow: n.is_read ? "0 2px 8px rgba(0,0,0,0.02)" : "0 8px 24px rgba(109, 40, 217, 0.08)",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  position: "relative",
                  transition: "all 0.2s",
                }}
              >
                {/* Visual Unread Indicator Dot */}
                {!n.is_read && (
                  <span
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 20,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#6D28D9",
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: n.notification_type === "result" ? "#FEF3C7" : "#F3E8FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {n.notification_type === "result" ? (
                    <Trophy size={22} color="#D97706" />
                  ) : (
                    <MessageSquare size={22} color="#6D28D9" />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        padding: "2px 8px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                        background: n.notification_type === "result" ? "#FEF3C7" : "#F3E8FF",
                        color: n.notification_type === "result" ? "#B45309" : "#6D28D9",
                      }}
                    >
                      {n.notification_type === "result" ? "Result Announcement" : "Admin Message"}
                    </span>
                    <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>
                      {new Date(n.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
                    {n.title}
                  </h3>

                  <p style={{ fontSize: 14, color: "#475569", margin: "0 0 14px", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                    {n.message}
                  </p>

                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {n.link_url && (
                      <Link
                        href={n.link_url}
                        onClick={() => handleMarkAsRead(n.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 14px",
                          background: "#F3E8FF",
                          color: "#6D28D9",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          textDecoration: "none",
                        }}
                      >
                        View Event Result <ArrowRight size={14} />
                      </Link>
                    )}

                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(n.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#64748B",
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <CheckCircle2 size={14} color="#10B981" /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
