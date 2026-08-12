import React, { useState } from "react";
import { Banner } from "@/types/banner";
import { X, Monitor, Smartphone, ExternalLink, Calendar, MapPin } from "lucide-react";

interface BannerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: Banner | null;
}

export function BannerPreviewModal({ isOpen, onClose, banner }: BannerPreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");

  if (!isOpen || !banner) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
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
          maxWidth: deviceMode === "desktop" ? 1100 : 420,
          background: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          maxHeight: "92vh",
        }}
      >
        {/* Preview Top Header Bar */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F8FAFC",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>
              Live Banner Website Preview
            </div>
            <div style={{ fontSize: 12, color: "#64748B" }}>
              Simulates how website visitors will experience this promotional banner.
            </div>
          </div>

          {/* Toggle Device View Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                background: "#E2E8F0",
                borderRadius: 12,
                padding: 3,
                display: "flex",
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 9,
                  border: "none",
                  background: deviceMode === "desktop" ? "#ffffff" : "transparent",
                  color: deviceMode === "desktop" ? "#7C3AED" : "#64748B",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: deviceMode === "desktop" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <Monitor size={15} /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 9,
                  border: "none",
                  background: deviceMode === "mobile" ? "#ffffff" : "transparent",
                  color: deviceMode === "mobile" ? "#7C3AED" : "#64748B",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: deviceMode === "mobile" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <Smartphone size={15} /> Mobile
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#ffffff",
                border: "1px solid #CBD5E1",
                padding: 7,
                borderRadius: 10,
                color: "#64748B",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Live Customer Website Preview Container */}
        <div
          style={{
            padding: deviceMode === "desktop" ? 32 : 16,
            background: "#F1F5F9",
            overflowY: "auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {deviceMode === "desktop" ? (
            /* Desktop Layout matching customer Hero section */
            <div
              style={{
                width: "100%",
                background: "#ffffff",
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                display: "flex",
                minHeight: 400,
              }}
            >
              {/* Left Content Side */}
              <div
                style={{
                  width: "45%",
                  padding: "44px 32px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#6D28D9",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  {banner.subtitle || "CGS ENTERTAINMENTS"}
                </p>

                <h1
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: "#0F0F0F",
                    lineHeight: 1.05,
                    margin: "0 0 16px",
                    letterSpacing: -1.5,
                  }}
                >
                  {banner.title}
                </h1>

                {banner.description && (
                  <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, marginBottom: 24, lineHeight: 1.5 }}>
                    {banner.description}
                  </p>
                )}

                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <a
                    href={banner.link_url || "#"}
                    target={banner.target_blank ? "_blank" : "_self"}
                    rel="noreferrer"
                    style={{
                      padding: "12px 24px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                      color: "#ffffff",
                      fontSize: 14,
                      fontWeight: 800,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
                    }}
                  >
                    {banner.button_text || "Explore Events"} <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              {/* Right Hero Image Side */}
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  backgroundImage: `url(${banner.image_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  minHeight: 400,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 12%, rgba(255,255,255,0) 30%)",
                  }}
                />
              </div>
            </div>
          ) : (
            /* Mobile Responsive Layout */
            <div
              style={{
                width: 360,
                background: "#ffffff",
                borderRadius: 24,
                overflow: "hidden",
                border: "8px solid #0F172A",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Mobile Image */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 10",
                  backgroundImage: `url(${banner.mobile_image_url || banner.image_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)",
                  }}
                />
              </div>

              {/* Mobile Text Content */}
              <div style={{ padding: "20px 18px", textAlign: "center" }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#6D28D9", textTransform: "uppercase", marginBottom: 6 }}>
                  {banner.subtitle || "CGS ENTERTAINMENTS"}
                </p>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", lineHeight: 1.15, margin: "0 0 10px" }}>
                  {banner.title}
                </h2>
                {banner.description && (
                  <p style={{ fontSize: 12.5, color: "#64748B", marginBottom: 18, lineHeight: 1.4 }}>
                    {banner.description}
                  </p>
                )}
                <a
                  href={banner.link_url || "#"}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                    color: "#ffffff",
                    fontSize: 13.5,
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  {banner.button_text || "Explore Events"}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
