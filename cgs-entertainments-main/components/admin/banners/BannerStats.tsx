import React from "react";
import { BannerStats as BannerStatsType } from "@/types/banner";
import { Layers, CheckCircle2, Calendar, EyeOff } from "lucide-react";

interface BannerStatsProps {
  stats: BannerStatsType;
}

export function BannerStats({ stats }: BannerStatsProps) {
  const cards = [
    {
      title: "Total Banners",
      count: stats.total,
      icon: Layers,
      color: "#7C3AED",
      bg: "rgba(124, 58, 237, 0.08)",
      borderColor: "rgba(124, 58, 237, 0.18)",
    },
    {
      title: "Active Banners",
      count: stats.active,
      icon: CheckCircle2,
      color: "#16A34A",
      bg: "rgba(22, 163, 74, 0.08)",
      borderColor: "rgba(22, 163, 74, 0.18)",
    },
    {
      title: "Scheduled",
      count: stats.scheduled,
      icon: Calendar,
      color: "#2563EB",
      bg: "rgba(37, 99, 235, 0.08)",
      borderColor: "rgba(37, 99, 235, 0.18)",
    },
    {
      title: "Inactive / Draft",
      count: stats.inactive + stats.expired + stats.draft,
      icon: EyeOff,
      color: "#D97706",
      bg: "rgba(217, 119, 6, 0.08)",
      borderColor: "rgba(217, 119, 6, 0.18)",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
      }}
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: "20px 22px",
              border: `1px solid ${card.borderColor}`,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "transform 0.2s ease, boxShadow 0.2s ease",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", lineHeight: 1 }}>
                {card.count}
              </div>
            </div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: card.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={24} color={card.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
