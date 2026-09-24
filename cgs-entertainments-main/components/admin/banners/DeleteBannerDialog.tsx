import React, { useState } from "react";
import { Banner } from "@/types/banner";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

interface DeleteBannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  banner: Banner | null;
}

export function DeleteBannerDialog({
  isOpen,
  onClose,
  onConfirm,
  banner,
}: DeleteBannerDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !banner) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error handled by caller toast notification
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#ffffff",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "#FEF2F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} color="#DC2626" />
          </div>

          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
              Delete Banner?
            </h3>
            <p style={{ fontSize: 13.5, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
              Are you sure you want to permanently delete{" "}
              <strong style={{ color: "#0F172A" }}>"{banner.title}"</strong>?
            </p>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 8 }}>
              This action cannot be undone. Associated files in Supabase Storage will also be cleaned up.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "1.5px solid #CBD5E1",
              background: "#ffffff",
              fontSize: 13.5,
              fontWeight: 700,
              color: "#475569",
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              background: "#DC2626",
              color: "#ffffff",
              fontSize: 13.5,
              fontWeight: 800,
              border: "none",
              cursor: deleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)",
            }}
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} /> Delete Banner
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
