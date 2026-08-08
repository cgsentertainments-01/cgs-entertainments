"use client";

import React from "react";
import { HeroContent } from "./HeroContent";
import { HeroImage } from "./HeroImage";

export function Hero() {
  return (
    <section style={{ marginTop: 64, background: "#fff", overflow: "hidden" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          minHeight: 400,
        }}
      >
        <HeroContent />
        <HeroImage />
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-left { width: 100% !important; }
          .hero-right { display: none !important; }
          .hero-h1 { font-size: 48px !important; }
          .hero-h2 { font-size: 48px !important; }
          .feature-badges { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .hero-h1 { font-size: 36px !important; letter-spacing: -1px !important; }
          .hero-h2 { font-size: 36px !important; letter-spacing: -1px !important; }
        }
      `}</style>
    </section>
  );
}
