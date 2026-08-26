"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Users,
  CreditCard,
  Award,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Loader2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  type?: string;
  entity_type?: string;
  entity_id?: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export function AdminNotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch admin notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/notifications?limit=15");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
        }
      } else {
        // Fallback to general route if admin API returns 404 or auth pending
        const fbRes = await fetch("/api/notifications");
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData.notifications) {
            setNotifications(fbData.notifications);
            setUnreadCount(fbData.unreadCount || 0);
          }
        }
      }
    } catch (err: any) {
      console.warn("Error fetching admin notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and subscription/polling setup
  useEffect(() => {
    fetchNotifications();

    // Setup Supabase Realtime channel subscription
    let channel: any = null;
    try {
      const supabase = createClient();
      if (supabase) {
        channel = supabase
          .channel("admin-notifications-realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "notifications" },
            () => {
              fetchNotifications();
            }
          )
          .subscribe();
      }
    } catch (rtErr) {
      console.warn("Notice subscribing to Realtime notifications:", rtErr);
    }

    // Lightweight 30s fallback polling loop
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
      if (channel) {
        try {
          const supabase = createClient();
          if (supabase) supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [fetchNotifications]);

  // Refresh when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark single item read
  const handleMarkAsRead = async (e: React.MouseEvent, n: NotificationItem) => {
    e.stopPropagation();
    if (n.is_read) {
      if (n.link_url) {
        setOpen(false);
        router.push(n.link_url);
      }
      return;
    }

    setActionLoadingId(n.id);
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch(`/api/admin/notifications/${n.id}/read`, { method: "PATCH" });
    } catch (err) {
      console.error("Failed marking read:", err);
    } finally {
      setActionLoadingId(null);
    }

    if (n.link_url) {
      setOpen(false);
      router.push(n.link_url);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);

      await fetch("/api/admin/notifications/read-all", { method: "POST" });
    } catch (err) {
      console.error("Failed marking all read:", err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed deleting notification:", err);
    }
  };

  // Time formatting helper
  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "Just now";
    try {
      const date = new Date(dateStr);
      const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSecs < 60) return "Just now";
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  // Notification Icon mapping helper
  const renderNotificationIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t === "registration") {
      return <Users size={17} color="#7C3AED" />;
    }
    if (t === "payment" || t === "payment_success") {
      return <CreditCard size={17} color="#16A34A" />;
    }
    if (t === "payment_failed") {
      return <CreditCard size={17} color="#DC2626" />;
    }
    if (t === "event") {
      return <Calendar size={17} color="#2563EB" />;
    }
    if (t === "certificate") {
      return <Award size={17} color="#D97706" />;
    }
    if (t === "certificate_error") {
      return <AlertCircle size={17} color="#DC2626" />;
    }
    if (t === "verification") {
      return <Sparkles size={17} color="#0891B2" />;
    }
    if (t === "system" || t === "error") {
      return <ShieldAlert size={17} color="#E11D48" />;
    }
    return <Bell size={17} color="#7C3AED" />;
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          width: 40,
          height: 40,
          borderRadius: 12,
          background: open ? "#FAF5FF" : "#F8FAFC",
          border: open ? "1.5px solid #7C3AED" : "1.5px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: open ? "#7C3AED" : "#475569",
          transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: open ? "0 4px 12px rgba(124, 58, 237, 0.15)" : "none",
        }}
        title="Admin Notifications"
        aria-label="Admin Notifications"
      >
        <Bell size={18} />

        {/* Dynamic Unread Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              borderRadius: 10,
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              color: "#ffffff",
              fontSize: 10,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              border: "2px solid #ffffff",
              boxShadow: "0 2px 6px rgba(220, 38, 38, 0.35)",
              animation: "pulse 2s infinite",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: 380,
            background: "#ffffff",
            border: "1.5px solid #E2E8F0",
            borderRadius: 20,
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.16), 0 0 24px rgba(124, 58, 237, 0.08)",
            zIndex: 99999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "#FAF5FF",
              borderBottom: "1px solid #F3E8FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "#7C3AED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <Bell size={16} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#0F172A", lineHeight: 1.1 }}>
                  Admin Notifications
                </div>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                  System updates & events
                </div>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                style={{
                  background: "#ffffff",
                  border: "1px solid #E9D5FF",
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: "#7C3AED",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.18s",
                }}
                className="hover-purple"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List Area */}
          <div style={{ maxHeight: 380, overflowY: "auto", background: "#ffffff" }}>
            {loading ? (
              <div style={{ padding: "36px 20px", textAlign: "center", color: "#64748B" }}>
                <Loader2 size={24} color="#7C3AED" className="spin" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>Loading notifications...</div>
              </div>
            ) : error ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <AlertCircle size={24} color="#EF4444" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{error}</div>
                <button
                  type="button"
                  onClick={() => fetchNotifications()}
                  style={{
                    marginTop: 10,
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "#F1F5F9",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "#64748B" }}>
                <Sparkles size={32} color="#CBD5E1" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1E293B" }}>You're all caught up!</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>No new admin notifications right now.</div>
              </div>
            ) : (
              notifications.slice(0, 8).map((n) => {
                const isUnread = !n.is_read;
                return (
                  <div
                    key={n.id}
                    onClick={(e) => handleMarkAsRead(e, n)}
                    style={{
                      padding: "14px 18px",
                      borderBottom: "1px solid #F1F5F9",
                      background: isUnread ? "#FAF5FF" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      transition: "background 0.18s ease",
                      position: "relative",
                    }}
                    className="notif-item-hover"
                  >
                    {/* Icon Bubble */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        background: isUnread ? "#F3E8FF" : "#F8FAFC",
                        border: isUnread ? "1px solid #E9D5FF" : "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {renderNotificationIcon(n.notification_type || n.type || "")}
                    </div>

                    {/* Notification Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: isUnread ? 900 : 700,
                            color: "#0F172A",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {n.title}
                        </span>

                        {isUnread && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#7C3AED",
                              flexShrink: 0,
                              boxShadow: "0 0 6px rgba(124, 58, 237, 0.6)",
                            }}
                          />
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: 12.5,
                          color: isUnread ? "#334155" : "#64748B",
                          marginTop: 4,
                          lineHeight: 1.45,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as any,
                          overflow: "hidden",
                        }}
                      >
                        {n.message}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: 8,
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8" }}>
                          {formatTimeAgo(n.created_at)}
                        </span>

                        {/* Inline Actions */}
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 6 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isUnread && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkAsRead(e, n)}
                              disabled={actionLoadingId === n.id}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#7C3AED",
                                cursor: "pointer",
                                padding: 3,
                                borderRadius: 4,
                              }}
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNotification(e, n.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#94A3B8",
                              cursor: "pointer",
                              padding: 3,
                              borderRadius: 4,
                            }}
                            className="hover-red"
                            title="Delete notification"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All Link */}
          <Link
            href="/admin/notifications"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "13px 20px",
              background: "#F8FAFC",
              borderTop: "1.5px solid #E2E8F0",
              color: "#7C3AED",
              fontSize: 13,
              fontWeight: 900,
              textDecoration: "none",
              transition: "all 0.18s",
            }}
            className="footer-hover"
          >
            View Notification Center <ChevronRight size={16} />
          </Link>
        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .notif-item-hover:hover {
          background: #FAF5FF !important;
        }
        .hover-purple:hover {
          background: #7C3AED !important;
          color: #ffffff !important;
          border-color: #7C3AED !important;
        }
        .hover-red:hover {
          color: #DC2626 !important;
        }
        .footer-hover:hover {
          background: #FAF5FF !important;
          color: #6D28D9 !important;
        }
      `}</style>
    </div>
  );
}
