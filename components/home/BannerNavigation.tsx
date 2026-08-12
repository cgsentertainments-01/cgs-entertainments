"use client";

import React from "react";

interface BannerNavigationProps {
  total: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function BannerNavigation({
  total,
  activeIndex,
  onSelect,
}: BannerNavigationProps) {
  if (total <= 1) return null;

  return (
    <div className="cgs-dots-container" role="tablist" aria-label="Banner slide pagination">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={`dot-indicator-${idx}`}
          type="button"
          role="tab"
          aria-selected={idx === activeIndex}
          aria-label={`Go to banner slide ${idx + 1}`}
          onClick={() => onSelect(idx)}
          className={`cgs-indicator-dot ${idx === activeIndex ? "is-active" : ""}`}
        />
      ))}
    </div>
  );
}
