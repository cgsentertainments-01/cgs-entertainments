"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Banner, BannerFilterState, BannerFormData, BannerStats as BannerStatsType } from "@/types/banner";
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  duplicateBanner,
  reorderBanners,
} from "@/services/banner.service";
import { deriveBannerStatus } from "@/lib/utils/banner-status";

import { BannerStats } from "@/components/admin/banners/BannerStats";
import { BannerFilters } from "@/components/admin/banners/BannerFilters";
import { BannerGrid } from "@/components/admin/banners/BannerGrid";
import { BannerFormModal } from "@/components/admin/banners/BannerFormModal";
import { BannerPreviewModal } from "@/components/admin/banners/BannerPreviewModal";
import { DeleteBannerDialog } from "@/components/admin/banners/DeleteBannerDialog";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<BannerFilterState>({
    search: "",
    status: "all",
    placement: "all",
  });

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBannerState, setDeletingBannerState] = useState<Banner | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Banners from API
  const loadBanners = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await fetchBanners("admin");
      setBanners(data);
    } catch (err: any) {
      console.error("Failed to load banners:", err);
      showToast(err.message || "Failed to load banners from server", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBanners(true);
  }, [loadBanners]);

  // Statistics calculation based on derived status
  const stats: BannerStatsType = useMemo(() => {
    const total = banners.length;
    let active = 0;
    let scheduled = 0;
    let expired = 0;
    let inactive = 0;
    let draft = 0;

    banners.forEach((b) => {
      const derived = deriveBannerStatus(b);
      if (derived === "active") active++;
      else if (derived === "scheduled") scheduled++;
      else if (derived === "expired") expired++;
      else if (derived === "inactive") inactive++;
      else if (derived === "draft") draft++;
    });

    return { total, active, scheduled, expired, inactive, draft };
  }, [banners]);

  // Filtered & Searched Banners
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      // Search match
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const titleMatch = b.title.toLowerCase().includes(query);
        const subtitleMatch = b.subtitle?.toLowerCase().includes(query) || false;
        const descMatch = b.description?.toLowerCase().includes(query) || false;
        const buttonMatch = b.button_text?.toLowerCase().includes(query) || false;
        if (!titleMatch && !subtitleMatch && !descMatch && !buttonMatch) {
          return false;
        }
      }

      // Placement filter
      if (filters.placement !== "all" && b.banner_type !== filters.placement) {
        return false;
      }

      // Status filter
      if (filters.status !== "all") {
        const derived = deriveBannerStatus(b);
        if (derived !== filters.status) return false;
      }

      return true;
    });
  }, [banners, filters]);

  // Handlers
  const handleCreateClick = () => {
    setEditingBanner(null);
    setFormModalOpen(true);
  };

  const handleEditClick = (banner: Banner) => {
    setEditingBanner(banner);
    setFormModalOpen(true);
  };

  const handlePreviewClick = (banner: Banner) => {
    setPreviewBanner(banner);
    setPreviewModalOpen(true);
  };

  const handleDeleteClick = (banner: Banner) => {
    setDeletingBannerState(banner);
    setDeleteDialogOpen(true);
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const updated = await updateBanner(banner.id, { is_active: !banner.is_active });
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
      showToast(`Banner "${banner.title}" is now ${updated.is_active ? "Active" : "Inactive"}`);
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  const handleDuplicateClick = async (banner: Banner) => {
    try {
      const duplicated = await duplicateBanner(banner.id);
      setBanners((prev) => [...prev, duplicated]);
      showToast(`Duplicated banner as "${duplicated.title}"`);
    } catch (err: any) {
      showToast(err.message || "Failed to duplicate banner", "error");
    }
  };

  const handleSaveBanner = async (formData: BannerFormData) => {
    if (editingBanner) {
      const updated = await updateBanner(editingBanner.id, formData);
      setBanners((prev) => prev.map((b) => (b.id === editingBanner.id ? updated : b)));
      showToast("Banner updated successfully!");
    } else {
      const created = await createBanner(formData);
      setBanners((prev) => [...prev, created]);
      showToast("New banner published successfully!");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBannerState) return;
    try {
      await deleteBanner(deletingBannerState.id);
      setBanners((prev) => prev.filter((b) => b.id !== deletingBannerState.id));
      showToast("Banner deleted successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to delete banner", "error");
    }
  };

  const handleReorder = async (reorderedList: Banner[]) => {
    setBanners(reorderedList);
    try {
      const itemsPayload = reorderedList.map((b, i) => ({
        id: b.id,
        display_order: i + 1,
      }));
      await reorderBanners(itemsPayload);
      showToast("Banner order updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to persist reorder", "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1400, margin: "0 auto", paddingBottom: 40 }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 999999,
            padding: "14px 22px",
            borderRadius: 14,
            background: toast.type === "success" ? "#0F172A" : "#7F1D1D",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
            animation: "fadeInUp 0.2s ease",
          }}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} color="#22C55E" /> : <AlertCircle size={18} color="#F87171" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
          Banners
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
          Manage promotional banners, hero sliders, and announcement popups displayed across your website.
        </p>
      </div>

      {/* Statistics Cards */}
      <BannerStats stats={stats} />

      {/* Search & Filter Controls */}
      <BannerFilters
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        onRefresh={() => loadBanners(false)}
        onCreateClick={handleCreateClick}
        isRefreshing={refreshing}
      />

      {/* Main Banner Visual Grid */}
      <BannerGrid
        banners={filteredBanners}
        loading={loading}
        onEdit={handleEditClick}
        onDuplicate={handleDuplicateClick}
        onDelete={handleDeleteClick}
        onPreview={handlePreviewClick}
        onToggleActive={handleToggleActive}
        onReorder={handleReorder}
        onCreateClick={handleCreateClick}
      />

      {/* Create / Edit Form Drawer Modal */}
      <BannerFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveBanner}
        initialBanner={editingBanner}
        maxDisplayOrder={banners.length + 1}
      />

      {/* Live Preview Modal */}
      <BannerPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        banner={previewBanner}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteBannerDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        banner={deletingBannerState}
      />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
