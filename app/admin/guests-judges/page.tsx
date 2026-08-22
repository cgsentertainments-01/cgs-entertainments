"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  GuestJudge,
  GuestJudgeRole,
  GuestJudgeFormData,
  GuestJudgeFilterState,
  GuestJudgeStats,
} from "@/types/guest-judge";
import {
  fetchGuestsJudges,
  createGuestJudge,
  updateGuestJudge,
  deleteGuestJudge,
  reorderGuestsJudges,
  uploadGuestPhoto,
} from "@/services/guest-judge.service";
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Globe,
  Award,
  Crown,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminGuestsJudgesPage() {
  const [items, setItems] = useState<GuestJudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [filters, setFilters] = useState<GuestJudgeFilterState>({
    search: "",
    role: "all",
    status: "all",
  });

  // Modal State for Add / Edit
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GuestJudge | null>(null);

  // Modal State for Delete Confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<GuestJudge | null>(null);

  // Form State
  const [formData, setFormData] = useState<GuestJudgeFormData>({
    name: "",
    role: "Judge",
    designation: "",
    organization: "",
    bio: "",
    photo_url: "",
    social_links: {
      instagram: "",
      youtube: "",
      twitter: "",
      linkedin: "",
    },
    display_order: 1,
    is_active: true,
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Data from API
  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await fetchGuestsJudges("admin");
      setItems(data);
    } catch (err: any) {
      console.error("Failed to load guests & judges:", err);
      showToast(err.message || "Failed to load records from server", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Statistics calculation
  const stats: GuestJudgeStats = useMemo(() => {
    const total = items.length;
    let judges = 0;
    let guests = 0;
    let chiefGuests = 0;
    let active = 0;
    let inactive = 0;

    items.forEach((item) => {
      if (item.role === "Judge") judges++;
      else if (item.role === "Guest") guests++;
      else if (item.role === "Chief Guest") chiefGuests++;

      if (item.is_active) active++;
      else inactive++;
    });

    return { total, judges, guests, chiefGuests, active, inactive };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(query);
        const desigMatch = item.designation?.toLowerCase().includes(query) || false;
        const orgMatch = item.organization?.toLowerCase().includes(query) || false;
        const bioMatch = item.bio?.toLowerCase().includes(query) || false;

        if (!nameMatch && !desigMatch && !orgMatch && !bioMatch) {
          return false;
        }
      }

      // Role filter
      if (filters.role !== "all" && item.role !== filters.role) {
        return false;
      }

      // Status filter
      if (filters.status === "active" && !item.is_active) return false;
      if (filters.status === "inactive" && item.is_active) return false;

      return true;
    });
  }, [items, filters]);

  // Open Form Modal for Create
  const handleOpenAddModal = () => {
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order)) + 1 : 1;
    setEditingItem(null);
    setFormData({
      name: "",
      role: "Judge",
      designation: "",
      organization: "",
      bio: "",
      photo_url: "",
      social_links: { instagram: "", youtube: "", twitter: "", linkedin: "" },
      display_order: nextOrder,
      is_active: true,
    });
    setFormError(null);
    setFormModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleOpenEditModal = (item: GuestJudge) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      designation: item.designation || "",
      organization: item.organization || "",
      bio: item.bio || "",
      photo_url: item.photo_url || "",
      social_links: {
        instagram: item.social_links?.instagram || "",
        youtube: item.social_links?.youtube || "",
        twitter: item.social_links?.twitter || "",
        linkedin: item.social_links?.linkedin || "",
      },
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setFormError(null);
    setFormModalOpen(true);
  };

  // Toggle Active/Inactive directly from table
  const handleToggleActive = async (item: GuestJudge) => {
    try {
      const updated = await updateGuestJudge(item.id, { is_active: !item.is_active });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      showToast(
        `"${item.name}" is now ${updated.is_active ? "Active (visible on website)" : "Inactive (hidden on website)"}`
      );
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // Move Display Order Up/Down
  const handleMoveOrder = async (item: GuestJudge, direction: "up" | "down") => {
    const currentIndex = items.findIndex((i) => i.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newList = [...items];
    const targetItem = newList[targetIndex];

    // Swap order values
    const tempOrder = item.display_order;
    newList[currentIndex] = { ...item, display_order: targetItem.display_order };
    newList[targetIndex] = { ...targetItem, display_order: tempOrder };

    setItems(newList);

    try {
      await reorderGuestsJudges(
        newList.map((g, idx) => ({ id: g.id, display_order: idx + 1 }))
      );
      showToast("Display order updated!");
    } catch (err: any) {
      showToast("Failed to save reorder", "error");
    }
  };

  // Handle Photo File Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError(null);
    try {
      const url = await uploadGuestPhoto(file);
      setFormData((prev) => ({ ...prev, photo_url: url }));
      showToast("Photo uploaded successfully!");
    } catch (err: any) {
      setFormError(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  // Save Form (Create or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Full Name is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const updated = await updateGuestJudge(editingItem.id, formData);
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
        showToast(`"${updated.name}" updated successfully!`);
      } else {
        const created = await createGuestJudge(formData);
        setItems((prev) => [...prev, created]);
        showToast(`"${created.name}" added successfully!`);
      }
      setFormModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save record");
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteGuestJudge(deletingItem.id);
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      showToast(`"${deletingItem.name}" deleted successfully!`);
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (err: any) {
      showToast(err.message || "Failed to delete record", "error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F0720", color: "#fff", padding: "32px 28px" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            padding: "14px 22px",
            borderRadius: 14,
            background: toast.type === "success" ? "#10B981" : "#EF4444",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            animation: "slideIn 0.3s ease",
          }}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 18px rgba(124, 58, 237, 0.4)",
              }}
            >
              <UserCheck size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0 }}>
                Guests &amp; Judges Management
              </h1>
              <p style={{ fontSize: 13, color: "#A78BFA", margin: "2px 0 0" }}>
                Add, edit, reorder, and manage public visibility of guests and judges.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => loadData(false)}
            disabled={refreshing}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#C4B5FD",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <RefreshCw size={15} className={refreshing ? "spin-icon" : ""} />
            Refresh
          </button>

          <button
            onClick={handleOpenAddModal}
            style={{
              padding: "11px 22px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
            }}
          >
            <Plus size={18} />
            Add New Guest / Judge
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, marginBottom: 28 }}>
        <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" }}>Total Records</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginTop: 4 }}>{stats.total}</div>
        </div>
        <div style={{ background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.3)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#C4B5FD", textTransform: "uppercase" }}>Judges</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#DDD6FE", marginTop: 4 }}>{stats.judges}</div>
        </div>
        <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6EE7B7", textTransform: "uppercase" }}>Guests</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#A7F3D0", marginTop: 4 }}>{stats.guests}</div>
        </div>
        <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#FCD34D", textTransform: "uppercase" }}>Chief Guests</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FDE68A", marginTop: 4 }}>{stats.chiefGuests}</div>
        </div>
        <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#93C5FD", textTransform: "uppercase" }}>Active (Public)</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#BFDBFE", marginTop: 4 }}>{stats.active}</div>
        </div>
        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5", textTransform: "uppercase" }}>Inactive</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FECACA", marginTop: 4 }}>{stats.inactive}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 18, padding: "18px 24px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={17} color="#9CA3AF" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search name, designation, organization..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            style={{
              width: "100%",
              padding: "10px 14px 10px 42px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#fff",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value as any }))}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "#1E1338",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              outline: "none",
            }}
          >
            <option value="all">All Roles</option>
            <option value="Judge">Judges Only</option>
            <option value="Guest">Guests Only</option>
            <option value="Chief Guest">Chief Guests Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "#1E1338",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              outline: "none",
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 20, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#A78BFA", fontWeight: 700 }}>
            Loading guests &amp; judges...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎭</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>No Guests or Judges Found</h3>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>
              Try clearing filters or add a new record.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.05)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#C4B5FD", fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.5 }}>
                  <th style={{ padding: "16px 20px" }}>Photo</th>
                  <th style={{ padding: "16px 20px" }}>Name</th>
                  <th style={{ padding: "16px 20px" }}>Role</th>
                  <th style={{ padding: "16px 20px" }}>Designation</th>
                  <th style={{ padding: "16px 20px" }}>Status</th>
                  <th style={{ padding: "16px 20px" }}>Order</th>
                  <th style={{ padding: "16px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === filteredItems.length - 1;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background 0.2s ease",
                      }}
                      className="table-row-hover"
                    >
                      {/* Photo */}
                      <td style={{ padding: "14px 20px" }}>
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "2px solid rgba(124, 58, 237, 0.4)",
                            background: "#1E1338",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.photo_url ? (
                            <img src={item.photo_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontWeight: 800, color: "#C4B5FD", fontSize: 16 }}>{item.name.charAt(0)}</span>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>{item.name}</div>
                        {item.organization && (
                          <div style={{ fontSize: 11.5, color: "#A78BFA", marginTop: 2 }}>{item.organization}</div>
                        )}
                      </td>

                      {/* Role */}
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontSize: 11.5,
                            fontWeight: 800,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background:
                              item.role === "Chief Guest"
                                ? "rgba(245, 158, 11, 0.18)"
                                : item.role === "Judge"
                                ? "rgba(124, 58, 237, 0.2)"
                                : "rgba(16, 185, 129, 0.18)",
                            color:
                              item.role === "Chief Guest"
                                ? "#FBBF24"
                                : item.role === "Judge"
                                ? "#C4B5FD"
                                : "#34D399",
                            border:
                              item.role === "Chief Guest"
                                ? "1px solid rgba(245, 158, 11, 0.4)"
                                : item.role === "Judge"
                                ? "1px solid rgba(124, 58, 237, 0.4)"
                                : "1px solid rgba(16, 185, 129, 0.4)",
                          }}
                        >
                          {item.role === "Chief Guest" && <Crown size={12} />}
                          {item.role === "Judge" && <Award size={12} />}
                          {item.role === "Guest" && <UserCheck size={12} />}
                          {item.role}
                        </span>
                      </td>

                      {/* Designation */}
                      <td style={{ padding: "14px 20px", color: "#D1D5DB" }}>
                        {item.designation || "—"}
                      </td>

                      {/* Status Toggle */}
                      <td style={{ padding: "14px 20px" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "5px 12px",
                            borderRadius: 14,
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                            background: item.is_active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: item.is_active ? "#10B981" : "#EF4444",
                            border: item.is_active ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                          }}
                        >
                          {item.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                          {item.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Display Order */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 800, color: "#fff", minWidth: 20 }}>#{item.display_order}</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <button
                              disabled={isFirst}
                              onClick={() => handleMoveOrder(item, "up")}
                              style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "none",
                                borderRadius: 4,
                                color: isFirst ? "#4B5563" : "#fff",
                                cursor: isFirst ? "default" : "pointer",
                                padding: 2,
                              }}
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              disabled={isLast}
                              onClick={() => handleMoveOrder(item, "down")}
                              style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "none",
                                borderRadius: 4,
                                color: isLast ? "#4B5563" : "#fff",
                                cursor: isLast ? "default" : "pointer",
                                padding: 2,
                              }}
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Record"
                            style={{
                              padding: "8px 12px",
                              borderRadius: 10,
                              background: "rgba(124, 58, 237, 0.15)",
                              border: "1px solid rgba(124, 58, 237, 0.3)",
                              color: "#C4B5FD",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            <Edit2 size={13} />
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              setDeletingItem(item);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete Record"
                            style={{
                              padding: "8px 12px",
                              borderRadius: 10,
                              background: "rgba(239, 68, 68, 0.15)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              color: "#FCA5A5",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {formModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#150A2D",
              border: "1.5px solid rgba(124, 58, 237, 0.3)",
              borderRadius: 24,
              width: "100%",
              maxWidth: 640,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 28,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              color: "#fff",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserCheck size={20} color="#fff" />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: "#fff" }}>
                  {editingItem ? `Edit: ${editingItem.name}` : "Add New Guest / Judge"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: 8, padding: 6, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5", fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Full Name & Role */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD", display: "block", marginBottom: 6 }}>
                    Full Name <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shiamak Davar"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontSize: 13.5,
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD", display: "block", marginBottom: 6 }}>
                    Role <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as GuestJudgeRole }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "#1E1338",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: 13.5,
                      fontWeight: 700,
                      outline: "none",
                    }}
                  >
                    <option value="Judge">Judge</option>
                    <option value="Guest">Guest</option>
                    <option value="Chief Guest">Chief Guest</option>
                  </select>
                </div>
              </div>

              {/* Designation & Organization */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD", display: "block", marginBottom: 6 }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. International Choreographer"
                    value={formData.designation || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontSize: 13.5,
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD", display: "block", marginBottom: 6 }}>
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shiamak Davar Academy"
                    value={formData.organization || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, organization: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontSize: 13.5,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD", display: "block", marginBottom: 6 }}>
                  Profile Photo
                </label>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  {formData.photo_url ? (
                    <div style={{ position: "relative", width: 54, height: 54, borderRadius: "50%", overflow: "hidden", border: "2px solid #7C3AED", flexShrink: 0 }}>
                      <img src={formData.photo_url} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", flexShrink: 0 }}>
                      <UserCheck size={20} />
                    </div>
                  )}

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Photo Image URL (https://...)"
                      value={formData.photo_url || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, photo_url: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#fff",
                        fontSize: 12.5,
                        outline: "none",
                      }}
                    />
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 14px",
                        borderRadius: 10,
                        background: "rgba(124, 58, 237, 0.2)",
                        border: "1px solid rgba(124, 58, 237, 0.4)",
                        color: "#DDD6FE",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        width: "fit-content",
                      }}
                    >
                      <Upload size={14} />
                      {uploading ? "Uploading..." : "Upload Photo File"}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Short Bio */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD", display: "block", marginBottom: 6 }}>
                  Short Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="A brief biography or summary..."
                  value={formData.bio || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Social Links */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD", display: "block", marginBottom: 8 }}>
                  Social Links (Optional)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", padding: "6px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Instagram size={15} color="#E1306C" />
                    <input
                      type="url"
                      placeholder="Instagram URL"
                      value={formData.social_links?.instagram || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          social_links: { ...prev.social_links, instagram: e.target.value },
                        }))
                      }
                      style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: 12, outline: "none" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", padding: "6px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Youtube size={15} color="#FF0000" />
                    <input
                      type="url"
                      placeholder="YouTube URL"
                      value={formData.social_links?.youtube || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          social_links: { ...prev.social_links, youtube: e.target.value },
                        }))
                      }
                      style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: 12, outline: "none" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", padding: "6px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Twitter size={15} color="#1DA1F2" />
                    <input
                      type="url"
                      placeholder="Twitter/X URL"
                      value={formData.social_links?.twitter || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          social_links: { ...prev.social_links, twitter: e.target.value },
                        }))
                      }
                      style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: 12, outline: "none" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", padding: "6px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Linkedin size={15} color="#0A66C2" />
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={formData.social_links?.linkedin || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          social_links: { ...prev.social_links, linkedin: e.target.value },
                        }))
                      }
                      style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: 12, outline: "none" }}
                    />
                  </div>
                </div>
              </div>

              {/* Display Order & Active Toggle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD", display: "block", marginBottom: 6 }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.display_order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontSize: 13.5,
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD", display: "block", marginBottom: 6 }}>
                    Visibility Status
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: "#7C3AED" }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 700, color: formData.is_active ? "#10B981" : "#EF4444" }}>
                      {formData.is_active ? "Active (Visible on Website)" : "Inactive (Hidden)"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 13.5,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(124, 58, 237, 0.4)",
                  }}
                >
                  {submitting ? "Saving..." : editingItem ? "Save Changes" : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && deletingItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#150A2D",
              border: "1.5px solid rgba(239, 68, 68, 0.4)",
              borderRadius: 22,
              width: "100%",
              maxWidth: 440,
              padding: 24,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              color: "#fff",
              textAlign: "center",
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(239, 68, 68, 0.15)", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>
              Delete Guest/Judge?
            </h3>
            <p style={{ fontSize: 14, color: "#D1D5DB", margin: "0 0 20px", lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{deletingItem.name}</strong>? This action will permanently remove the record.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: "10px 24px",
                  borderRadius: 12,
                  background: "#EF4444",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(239, 68, 68, 0.4)",
                }}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .table-row-hover:hover { background: rgba(255, 255, 255, 0.05) !important; }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
