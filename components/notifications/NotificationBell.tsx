"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Trophy, Check, Sparkles, ChevronRight, MessageSquare, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.warn("Error fetching user notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleMarkAsRead = async (id: string, linkUrl?: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setOpen(false);
      if (linkUrl) {
        router.push(linkUrl);
      }
    } catch (e) {
      console.error("Error marking notification read:", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Error marking all read:", e);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSecs < 60) return "Just now";
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recent";
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: open ? "#F3E8FF" : "#FAF5FF",
          border: "1.5px solid #E9D5FF",
          cursor: "pointer",
          transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: open ? "0 4px 12px rgba(109, 40, 217, 0.2)" : "0 2px 6px rgba(0,0,0,0.03)",
        }}
        title="Notifications"
      >
        <Bell size={20} color="#6D28D9" />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "linear-gradient(135deg, #EF4444, #DC2626)",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 900,
              padding: "2px 6px",
              borderRadius: 20,
              minWidth: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #ffffff",
              boxShadow: "0 2px 6px rgba(220, 38, 38, 0.4)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: 360,
            background: "#ffffff",
            border: "1.5px solid #E5E7EB",
            borderRadius: 20,
            boxShadow: "0 20px 48px rgba(15, 10, 40, 0.18), 0 0 20px rgba(109, 40, 217, 0.08)",
            zIndex: 99999,
            overflow: "hidden",
            animation: "fadeInScale 0.2s ease forwards",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "#FAF5FF",
              borderBottom: "1px solid #F3E8FF",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={18} color="#6D28D9" />
              <span style={{ fontSize: 15, fontWeight: 900, color: "#1E1B4B" }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ background: "#6D28D9", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                style={{ background: "none", border: "none", color: "#6D28D9", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#64748B" }}>
                <Sparkles size={28} color="#CBD5E1" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>No notifications yet</div>
                <div style={{ fontSize: 12, marginTop: 2 }}>You are all caught up!</div>
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.link_url)}
                  style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid #F1F5F9",
                    background: n.is_read ? "#ffffff" : "#FAF5FF",
                    cursor: "pointer",
                    transition: "background 0.18s",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: n.notification_type === "result" ? "#FEF3C7" : "#F3E8FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {n.notification_type === "result" ? (
                      <Trophy size={18} color="#D97706" />
                    ) : (
                      <MessageSquare size={18} color="#6D28D9" />
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: n.is_read ? 700 : 900, color: "#0F172A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{n.title}</span>
                      {!n.is_read && (
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6D28D9", flexShrink: 0 }} />
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#475569", marginTop: 3, lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 5, fontWeight: 600 }}>
                      {formatTimeAgo(n.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "12px 18px",
              background: "#F8FAFC",
              borderTop: "1px solid #E2E8F0",
              color: "#6D28D9",
              fontSize: 13,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            View All Notifications <ChevronRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
