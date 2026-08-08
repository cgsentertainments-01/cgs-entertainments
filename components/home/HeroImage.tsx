"use client";

import React from "react";
import Image from "next/image";

export function HeroImage() {
  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }} className="hero-right">
      <Image
        src="/images/hero/hero-dancer.png"
        alt="Dance Competition 2026 performer on stage"
        fill
        priority
        sizes="59vw"
        style={{ objectFit: "cover", objectPosition: "center top" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 10%, rgba(255,255,255,0) 28%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
