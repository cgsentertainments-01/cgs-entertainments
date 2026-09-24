"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Users, Award, MapPin } from "lucide-react";

export type StatType = {
  id: string;
  rawNum: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
};

const STATS: StatType[] = [
  { id: "s1", rawNum: 150, suffix: "+", label: "Events Organized", icon: <Trophy size={38} color="#6D28D9" strokeWidth={1.8} /> },
  { id: "s2", rawNum: 25, suffix: "K+", label: "Participants", icon: <Users size={38} color="#EC4899" strokeWidth={1.8} /> },
  { id: "s3", rawNum: 20, suffix: "K+", label: "Certificates Issued", icon: <Award size={38} color="#D97706" strokeWidth={1.8} /> },
  { id: "s4", rawNum: 10, suffix: "+", label: "Cities Covered", icon: <MapPin size={38} color="#2563EB" strokeWidth={1.8} /> },
];

function useCountUp(target: number, duration = 1600, triggerKey = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, triggerKey]);

  return count;
}

function StatCard({ s }: { s: StatType }) {
  const [h, setH] = useState(false);
  const [triggerKey, setTriggerKey] = useState(0);
  const count = useCountUp(s.rawNum, 1600, triggerKey);

  return (
    <div
      onMouseEnter={() => {
        setH(true);
        setTriggerKey((k) => k + 1);
      }}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "24px 20px",
        background: h ? "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)" : "#fff",
        border: `1.5px solid ${h ? "#C4B5FD" : "#E5E7EB"}`,
        borderRadius: 18,
        boxShadow: h
          ? "0 14px 36px rgba(109,40,217,0.15), 0 2px 8px rgba(0,0,0,0.04)"
          : "0 1px 6px rgba(0,0,0,0.04)",
        transform: h ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          flexShrink: 0,
          background: h ? "#EDE9FE" : "#F9FAFB",
          border: `1.5px solid ${h ? "#A78BFA" : "#F3F4F6"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.28s",
          transform: h ? "scale(1.1) rotate(-4deg)" : "scale(1) rotate(0deg)",
          boxShadow: h ? "0 4px 16px rgba(109,40,217,0.18)" : "none",
        }}
      >
        {s.icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: h ? "#6D28D9" : "#111827",
            lineHeight: 1.1,
            fontVariantNumeric: "tabular-nums",
            transition: "color 0.2s",
          }}
        >
          {count}
          {s.suffix}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: h ? "#7C3AED" : "#6B7280",
            marginTop: 4,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            transition: "color 0.2s",
          }}
        >
          {s.label}
        </div>
      </div>
    </div>
  );
}

export function Statistics() {
  return (
    <section style={{ padding: "32px 0 44px", background: "#FAFAFA" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
          }}
          className="stats-grid"
        >
          {STATS.map((s) => (
            <StatCard key={s.id} s={s} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
