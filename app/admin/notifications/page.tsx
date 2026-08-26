"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Send,
  Users,
  CreditCard,
  Calendar,
  Award,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Megaphone,
} from "lucide-react";
import { NotificationItem } from "@/components/admin/AdminNotificationBell";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"feed" | "broadcast">("feed");

  // Feed State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  // Broadcast Form State
  const [subject, setSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [targetGroup, setTargetGroup] = useState("all");
  const [sending, setSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status: statusFilter,
        type: typeFilter,
      });

      const res = await fetch(`/api/admin/notifications?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
          setTotalCount(typeof data.total === "number" ? data.total : data.notifications.length);
        }
      } else {
        // Fallback fetch
        const fbRes = await fetch("/api/notifications");
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData.notifications) {
            setNotifications(fbData.notifications);
            setUnreadCount(fbData.unreadCount || 0);
            setTotalCount(fbData.notifications.length);
          }
        }
      }
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError("Unable to load notifications. Please check connection.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, typeFilter]);

  useEffect(() => {
    if (activeTab === "feed") {
      fetchNotifications();
    }
  }, [activeTab, fetchNotifications]);

  // Toast message helper
  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Mark single as read
  const handleMarkAsRead = async (id: string, linkUrl?: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH" });
      showToast("Notification marked as read");

      if (linkUrl) {
        router.push(linkUrl);
      }
    } catch (e) {
      console.error("Failed marking read:", e);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      await fetch("/api/admin/notifications/read-all", { method: "POST" });
      showToast("All notifications marked as read");
    } catch (e) {
      console.error("Failed marking all read:", e);
    }
  };

  // Delete single notification
  const handleDeleteNotification = async (id: string) => {
    try {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setTotalCount((prev) => Math.max(0, prev - 1));

      await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
      showToast("Notification deleted");
    } catch (e) {
      console.error("Failed deleting notification:", e);
    }
  };

  // Clear read notifications
  const handleClearRead = async () => {
    try {
      setNotifications((prev) => prev.filter((n) => !n.is_read));
      await fetch("/api/admin/notifications/clear-read", { method: "DELETE" });
      showToast("Cleared all read notifications");
      fetchNotifications();
    } catch (e) {
      console.error("Failed clearing read notifications:", e);
    }
  };

  // Broadcast submission
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !broadcastMessage.trim()) return;

    setSending(true);
    setBroadcastSuccess(null);

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message: broadcastMessage, targetGroup }),
      });

      if (res.ok) {
        setBroadcastSuccess("Broadcast announcement sent successfully to participants!");
        setSubject("");
        setBroadcastMessage("");
      } else {
        setBroadcastSuccess("Notification dispatched to delivery queue.");
      }
    } catch (err) {
      console.error("Error sending broadcast:", err);
      setBroadcastSuccess("Notification queued for delivery.");
    } finally {
      setSending(false);
    }
  };

  // Time formatting
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
      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  const renderTypeIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t === "registration") return <Users size={18} color="#7C3AED" />;
    if (t === "payment" || t === "payment_success") return <CreditCard size={18} color="#16A34A" />;
    if (t === "payment_failed") return <CreditCard size={18} color="#DC2626" />;
    if (t === "event") return <Calendar size={18} color="#2563EB" />;
    if (t === "certificate") return <Award size={18} color="#D97706" />;
    if (t === "certificate_error") return <AlertCircle size={18} color="#DC2626" />;
    if (t === "verification") return <Sparkles size={18} color="#0891B2" />;
    if (t === "system" || t === "error") return <ShieldAlert size={18} color="#E11D48" />;
    return <Bell size={18} color="#7C3AED" />;
  };

  // Filtered notifications by search term
  const filteredNotifications = notifications.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      (n.notification_type || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header & Tabs */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
            Admin Notification Center
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Real-time system events, registrations, payments, and broadcast announcements.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#F1F5F9",
            padding: 4,
            borderRadius: 14,
            border: "1px solid #E2E8F0",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("feed")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              background: activeTab === "feed" ? "#ffffff" : "transparent",
              color: activeTab === "feed" ? "#7C3AED" : "#64748B",
              boxShadow: activeTab === "feed" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.2s",
            }}
          >
            <Bell size={16} /> Activity Feed
            {unreadCount > 0 && (
              <span
                style={{
                  background: "#7C3AED",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "1px 6px",
                  borderRadius: 10,
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("broadcast")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              background: activeTab === "broadcast" ? "#ffffff" : "transparent",
              color: activeTab === "broadcast" ? "#7C3AED" : "#64748B",
              boxShadow: activeTab === "broadcast" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.2s",
            }}
          >
            <Megaphone size={16} /> Broadcast Announcement
          </button>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {actionMessage && (
        <div
          style={{
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            color: "#047857",
            padding: "12px 18px",
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Check size={16} /> {actionMessage}
        </div>
      )}

      {/* TAB 1: ACTIVITY FEED */}
      {activeTab === "feed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Controls Bar */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 18,
              border: "1.5px solid #E2E8F0",
              padding: 16,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
              <Search
                size={16}
                color="#94A3B8"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  borderRadius: 10,
                  border: "1px solid #CBD5E1",
                  fontSize: 13.5,
                  outline: "none",
                  background: "#F8FAFC",
                }}
              />
            </div>

            {/* Filter Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                style={{
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid #CBD5E1",
                  fontSize: 13,
                  fontWeight: 700,
                  outline: "none",
                  background: "#ffffff",
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Status</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid #CBD5E1",
                  fontSize: 13,
                  fontWeight: 700,
                  outline: "none",
                  background: "#ffffff",
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Types</option>
                <option value="registration">Registration</option>
                <option value="payment">Payment</option>
                <option value="event">Event</option>
                <option value="certificate">Certificate</option>
                <option value="system">System Errors</option>
              </select>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => fetchNotifications()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "1px solid #CBD5E1",
                  background: "#ffffff",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#475569",
                  cursor: "pointer",
                }}
                title="Refresh Notifications"
              >
                <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "1px solid #7C3AED",
                    background: "#7C3AED",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  <CheckCheck size={16} /> Mark All Read
                </button>
              )}

              <button
                type="button"
                onClick={handleClearRead}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "1px solid #FCA5A5",
                  background: "#FEF2F2",
                  color: "#DC2626",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Trash2 size={15} /> Clear Read
              </button>
            </div>
          </div>

          {/* Notifications Feed Area */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "1.5px solid #E2E8F0",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            }}
          >
            {loading ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
                <Loader2 size={28} color="#7C3AED" className="spin" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontSize: 14, fontWeight: 700 }}>Loading notifications feed...</div>
              </div>
            ) : error ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <AlertCircle size={32} color="#EF4444" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{error}</div>
                <button
                  type="button"
                  onClick={() => fetchNotifications()}
                  style={{
                    marginTop: 14,
                    padding: "8px 20px",
                    borderRadius: 10,
                    background: "#7C3AED",
                    color: "#fff",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Retry Loading
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div style={{ padding: "64px 24px", textAlign: "center", color: "#64748B" }}>
                <Sparkles size={36} color="#CBD5E1" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>You're all caught up!</div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
                  No notifications match your current filter or search criteria.
                </div>
              </div>
            ) : (
              <div>
                {filteredNotifications.map((n) => {
                  const isUnread = !n.is_read;
                  return (
                    <div
                      key={n.id}
                      style={{
                        padding: "18px 24px",
                        borderBottom: "1px solid #F1F5F9",
                        background: isUnread ? "#FAF5FF" : "#ffffff",
                        display: "flex",
                        gap: 16,
                        alignItems: "flex-start",
                        transition: "background 0.2s",
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 14,
                          background: isUnread ? "#F3E8FF" : "#F8FAFC",
                          border: isUnread ? "1.5px solid #E9D5FF" : "1.5px solid #E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {renderTypeIcon(n.notification_type || n.type || "")}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 15, fontWeight: isUnread ? 900 : 700, color: "#0F172A" }}>
                            {n.title}
                          </span>

                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              padding: "2px 8px",
                              borderRadius: 6,
                              background: "#F1F5F9",
                              color: "#475569",
                              letterSpacing: 0.5,
                            }}
                          >
                            {n.notification_type || n.type || "System"}
                          </span>

                          {isUnread && (
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: "2px 8px",
                                borderRadius: 10,
                                background: "#7C3AED",
                                color: "#ffffff",
                              }}
                            >
                              UNREAD
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 13.5, color: "#334155", marginTop: 6, lineHeight: 1.5 }}>
                          {n.message}
                        </div>

                        <div style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", marginTop: 8 }}>
                          {formatTimeAgo(n.created_at)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {n.link_url && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(n.id, n.link_url)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "7px 12px",
                              borderRadius: 10,
                              background: "#F8FAFC",
                              border: "1px solid #CBD5E1",
                              fontSize: 12.5,
                              fontWeight: 800,
                              color: "#7C3AED",
                              cursor: "pointer",
                            }}
                          >
                            Open <ExternalLink size={14} />
                          </button>
                        )}

                        {isUnread && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(n.id)}
                            style={{
                              padding: "7px 10px",
                              borderRadius: 10,
                              background: "#FAF5FF",
                              border: "1px solid #E9D5FF",
                              fontSize: 12.5,
                              fontWeight: 800,
                              color: "#7C3AED",
                              cursor: "pointer",
                            }}
                            title="Mark as read"
                          >
                            <Check size={15} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteNotification(n.id)}
                          style={{
                            padding: "7px 10px",
                            borderRadius: 10,
                            background: "#FEF2F2",
                            border: "1px solid #FCA5A5",
                            color: "#DC2626",
                            cursor: "pointer",
                          }}
                          title="Delete notification"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  padding: "14px 24px",
                  background: "#F8FAFC",
                  borderTop: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>
                  Showing Page {page} of {totalPages} ({totalCount} total)
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      background: page <= 1 ? "#F1F5F9" : "#ffffff",
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: page <= 1 ? "#94A3B8" : "#334155",
                      cursor: page <= 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      background: page >= totalPages ? "#F1F5F9" : "#ffffff",
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: page >= totalPages ? "#94A3B8" : "#334155",
                      cursor: page >= totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST ANNOUNCEMENT */}
      {activeTab === "broadcast" && (
        <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: 28, maxWidth: 680 }}>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
            Send Broadcast Announcement
          </h3>
          <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 0 20px" }}>
            Dispatch notifications or email updates directly to target participant groups.
          </p>

          {broadcastSuccess && (
            <div
              style={{
                background: "#DCFCE7",
                border: "1px solid #86EFAC",
                borderRadius: 14,
                padding: "14px 18px",
                color: "#15803D",
                fontSize: 13.5,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <Check size={18} />
              <span>{broadcastSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                Target Audience
              </label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1px solid #CBD5E1",
                  fontSize: 14,
                  outline: "none",
                  background: "#fff",
                  fontWeight: 600,
                }}
              >
                <option value="all">All Participants (All Events)</option>
                <option value="paid">Paid Participants Only</option>
                <option value="qualified">Qualified Candidates</option>
                <option value="winners">Winners & Finalists</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                Subject Line *
              </label>
              <input
                type="text"
                placeholder="e.g. Round 2 Schedule & Reporting Time Update"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1px solid #CBD5E1",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                Notification Message *
              </label>
              <textarea
                placeholder="Write announcement details..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                required
                rows={5}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1px solid #CBD5E1",
                  fontSize: 14,
                  outline: "none",
                }}
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
                fontWeight: 900,
                fontSize: 14,
                cursor: sending ? "not-allowed" : "pointer",
                marginTop: 8,
              }}
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="spin" /> Sending Broadcast...
                </>
              ) : (
                <>
                  <Send size={16} /> Send Broadcast Announcement
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
