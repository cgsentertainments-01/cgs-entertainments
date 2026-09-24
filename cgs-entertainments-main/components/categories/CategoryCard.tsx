"use client";

import React from "react";
import Link from "next/link";

export interface CategoryCardProps {
  id?: string;
  name: string;
  desc?: string;
  count?: string;
  icon?: React.ReactNode;
  bg?: string;
  iconBg?: string;
  color?: string;
  slug?: string;
}

export function CategoryCard({
  name,
  desc,
  count,
  icon,
  bg = "#F8FAFC",
  iconBg = "#EDE9FE",
  color = "#6D28D9",
  slug = "dance",
}: CategoryCardProps) {
  return (
    <Link
      href={`/categories?type=${slug}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "20px",
        borderRadius: 20,
        background: bg,
        textDecoration: "none",
        border: "1.5px solid #E2E8F0",
        transition: "all 0.25s ease",
      }}
      className="category-card-item"
    >
      {icon && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>{name}</div>
        {desc && <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 2 }}>{desc}</div>}
        {count && <div style={{ fontSize: 11.5, fontWeight: 700, color, marginTop: 4 }}>{count}</div>}
      </div>
    </Link>
  );
}

export default CategoryCard;
