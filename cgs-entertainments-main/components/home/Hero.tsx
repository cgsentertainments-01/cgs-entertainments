"use client";

import React, { useState, useEffect } from "react";
import { getBanners } from "@/services/api";
import { Banner } from "@/types/banner";
import { BannerCarousel } from "./BannerCarousel";

export function Hero() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch active promotional/hero banners configured in Admin Panel / Database
  useEffect(() => {
    let isMounted = true;

    getBanners()
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          // Filter active banners (hero or promotional placements, or active banners)
          const activeBanners = data.filter(
            (b) => b.is_active !== false && (!b.banner_type || b.banner_type === "hero" || b.banner_type === "promotional")
          );
          const finalBanners = activeBanners.length > 0 ? activeBanners : data.filter((b) => b.is_active !== false);

          // Sort by configured display_order from Admin Panel
          finalBanners.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

          setBanners(finalBanners);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch banners for homepage carousel:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Render Animated Single-Slide Skeleton Loader matching full hero layout
  if (loading) {
    return (
      <section className="cgs-hero-section" aria-label="Loading Banners">
        <div className="cgs-skeleton-container">
          <div className="cgs-skeleton-single animate-pulse" />
        </div>
        <style jsx>{`
          .cgs-hero-section {
            width: 100%;
            padding-top: 36px;
            padding-bottom: 48px;
            background: #ffffff;
            overflow: hidden;
          }
          .cgs-skeleton-container {
            width: 93%;
            max-width: 1450px;
            margin: 0 auto;
          }
          .cgs-skeleton-single {
            width: 100%;
            aspect-ratio: 2.7 / 1;
            max-height: 420px;
            border-radius: 20px;
            background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          }
          @media (max-width: 1024px) {
            .cgs-skeleton-container {
              width: 95%;
            }
            .cgs-skeleton-single {
              aspect-ratio: 2.4 / 1;
              max-height: 360px;
              border-radius: 18px;
            }
          }
          @media (max-width: 640px) {
            .cgs-skeleton-container {
              width: 100%;
              padding: 0 16px;
            }
            .cgs-skeleton-single {
              aspect-ratio: 2 / 1;
              max-height: 240px;
              border-radius: 16px;
            }
          }
        `}</style>
      </section>
    );
  }

  // Hide hero banner section gracefully if no banners exist
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section className="cgs-hero-section" aria-label="Homepage Banners">
      <BannerCarousel banners={banners} />

      <style jsx>{`
        .cgs-hero-section {
          width: 100%;
          background: #ffffff;
          padding-top: 36px;
          padding-bottom: 48px;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
