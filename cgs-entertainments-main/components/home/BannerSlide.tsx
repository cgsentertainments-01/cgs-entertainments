"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Banner } from "@/types/banner";

interface BannerSlideProps {
  banner: Banner;
  isActive: boolean;
  slideIndex: number;
}

export function BannerSlide({ banner, isActive, slideIndex }: BannerSlideProps) {
  // Determine CTA text and destination URL
  const ctaText =
    banner.button_text && banner.button_text.trim()
      ? banner.button_text.trim()
      : "Explore Events";
      
  const ctaUrl =
    banner.link_url && banner.link_url.trim()
      ? banner.link_url.trim()
      : "/events";

  const isExternal = banner.target_blank || ctaUrl.startsWith("http://") || ctaUrl.startsWith("https://");

  return (
    <div
      className={`cgs-single-slide ${isActive ? "is-active" : "is-inactive"}`}
      aria-hidden={!isActive}
    >
      <div className="cgs-slide-card">
        {/* Banner Image */}
        <img
          src={banner.image_url}
          alt={banner.title || "CGS Promotional Event Banner"}
          className="cgs-slide-img"
          loading={slideIndex === 0 ? "eager" : "lazy"}
        />

        {/* Subtle Bottom Gradient Overlay for High Contrast */}
        <div className="cgs-slide-overlay" />

        {/* Explore Events CTA Button Positioned Over Banner Image */}
        <div className="cgs-cta-overlay">
          {isExternal ? (
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cgs-explore-btn"
              tabIndex={isActive ? 0 : -1}
            >
              <span>{ctaText}</span>
              <ArrowRight className="cgs-btn-arrow" />
            </a>
          ) : (
            <Link
              href={ctaUrl}
              className="cgs-explore-btn"
              tabIndex={isActive ? 0 : -1}
            >
              <span>{ctaText}</span>
              <ArrowRight className="cgs-btn-arrow" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
