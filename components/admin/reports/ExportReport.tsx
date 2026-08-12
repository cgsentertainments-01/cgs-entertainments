"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown, Check } from "lucide-react";

interface ExportReportProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
  dateRangeLabel?: string;
  eventNameLabel?: string;
  categoryNameLabel?: string;
}

export function ExportReport({
  onExportCSV,
  onExportPDF,
  dateRangeLabel = "All Time",
  eventNameLabel = "All Events",
  categoryNameLabel = "All Categories",
}: ExportReportProps) {
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpenDropdown(!openDropdown)}
        style={{
          padding: "10px 18px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
          color: "#ffffff",
          fontSize: 13.5,
          fontWeight: 800,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
          transition: "all 0.2s ease",
        }}
      >
        <Download size={17} /> Export Report <ChevronDown size={15} />
      </button>

      {openDropdown && (
        <>
          {/* Overlay to dismiss */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setOpenDropdown(false)}
          />

          {/* Dropdown Menu */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "115%",
              width: 260,
              background: "#ffffff",
              borderRadius: 16,
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              padding: 8,
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ padding: "8px 12px 6px", fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Export Options ({dateRangeLabel})
            </div>

            <button
              type="button"
              onClick={() => {
                setOpenDropdown(false);
                onExportCSV();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: "transparent",
                color: "#0F172A",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s ease",
              }}
              className="export-opt-hover"
            >
              <FileSpreadsheet size={18} color="#16A34A" />
              <div>
                <div>Export CSV Spreadsheet</div>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Raw data metrics &amp; event tables</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpenDropdown(false);
                onExportPDF();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: "transparent",
                color: "#0F172A",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s ease",
              }}
              className="export-opt-hover"
            >
              <FileText size={18} color="#DC2626" />
              <div>
                <div>Export Printable PDF</div>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Executive report layout</div>
              </div>
            </button>
          </div>
        </>
      )}

      <style>{`
        .export-opt-hover:hover {
          background: #F1F5F9 !important;
        }
      `}</style>
    </div>
  );
}
