"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Banner } from "@/types/banner";
import { BannerSlide } from "./BannerSlide";
import { BannerNavigation } from "./BannerNavigation";

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const total = banners.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Touch Swipe Refs
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Navigate Next Slide
  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Navigate Previous Slide
  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Select Slide directly by Dot
  const handleSelectDot = useCallback(
    (index: number) => {
      if (total <= 1) return;
      setCurrentIndex(index);
    },
    [total]
  );

  // Autoplay Timer: 3 seconds (3000ms), pauses on hover, resumes on mouse leave
  useEffect(() => {
    if (total <= 1 || isHovered) return;

    const timer = setInterval(() => {
      handleNext();
    }, 3000);

    return () => clearInterval(timer);
  }, [total, isHovered, handleNext, currentIndex]);

  // Touch Swipe Handlers for mobile & touch viewports
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrev();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  if (!banners || total === 0) return null;

  return (
    <div
      className="cgs-hero-carousel-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Homepage Hero Carousel"
    >
      <div
        className="cgs-single-viewport"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Stacked Slides Layer (Only ONE Slide Active & Visible at any moment) */}
        <div className="cgs-slides-wrapper">
          {banners.map((banner, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={`${banner.id}-${idx}`}
                className={`cgs-slide-frame ${isActive ? "is-active" : "is-inactive"}`}
              >
                <BannerSlide banner={banner} isActive={isActive} slideIndex={idx} />
              </div>
            );
          })}
        </div>


      </div>

      {/* Styled Scoped CSS for Single-Slide Hero Carousel */}
      <style jsx>{`
        .cgs-hero-carousel-container {
          width: 93%;
          max-width: 1450px;
          margin: 0 auto;
          position: relative;
          outline: none;
        }

        .cgs-single-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 2.7 / 1;
          max-height: 420px;
          border-radius: 20px;
          overflow: hidden;
          background: #0f172a;
          box-shadow: 0 14px 34px -8px rgba(0, 0, 0, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.08);
        }

        @media (max-width: 1024px) {
          .cgs-hero-carousel-container {
            width: 95%;
          }
          .cgs-single-viewport {
            aspect-ratio: 2.4 / 1;
            max-height: 360px;
            border-radius: 18px;
          }
        }

        @media (max-width: 640px) {
          .cgs-hero-carousel-container {
            width: 100%;
            padding: 0 16px;
          }
          .cgs-single-viewport {
            aspect-ratio: 2 / 1;
            max-height: 240px;
            border-radius: 16px;
          }
        }

        .cgs-slides-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .cgs-slide-frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 600ms ease-in-out, transform 600ms ease-in-out;
          transform: scale(1.015);
        }

        .cgs-slide-frame.is-active {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          z-index: 5;
          transform: scale(1);
        }

        /* Banner Slide Inner Styling */
        :global(.cgs-single-slide) {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        :global(.cgs-slide-card) {
          position: relative;
          width: 100%;
          height: 100%;
        }

        :global(.cgs-slide-img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        :global(.cgs-slide-overlay) {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 50%,
            rgba(0, 0, 0, 0.25) 80%,
            rgba(0, 0, 0, 0.5) 100%
          );
          pointer-events: none;
        }

        /* Explore Events CTA Button Overlay Styling */
        :global(.cgs-cta-overlay) {
          position: absolute;
          bottom: 32px;
          left: 36px;
          z-index: 15;
        }

        @media (max-width: 1024px) {
          :global(.cgs-cta-overlay) {
            bottom: 24px;
            left: 24px;
          }
        }

        @media (max-width: 640px) {
          :global(.cgs-cta-overlay) {
            bottom: 18px;
            left: 18px;
          }
        }

        :global(.cgs-explore-btn) {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          color: #1e1b4b;
          font-weight: 700;
          font-size: 15px;
          padding: 12px 24px;
          border-radius: 9999px;
          box-shadow: 0 8px 20px -3px rgba(0, 0, 0, 0.28), 0 4px 8px -2px rgba(0, 0, 0, 0.12);
          text-decoration: none;
          transition: all 250ms ease;
          outline: none;
        }

        :global(.cgs-explore-btn:hover) {
          background: #ffffff;
          color: #4f46e5;
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 12px 26px -4px rgba(0, 0, 0, 0.35);
        }

        :global(.cgs-explore-btn:hover .cgs-btn-arrow) {
          transform: translateX(4px);
        }

        :global(.cgs-btn-arrow) {
          width: 18px;
          height: 18px;
          stroke-width: 2.5;
          transition: transform 250ms ease;
        }

        @media (max-width: 640px) {
          :global(.cgs-explore-btn) {
            padding: 8px 16px;
            font-size: 13px;
            gap: 6px;
          }
          :global(.cgs-btn-arrow) {
            width: 15px;
            height: 15px;
          }
        }

      `}</style>
    </div>
  );
}
