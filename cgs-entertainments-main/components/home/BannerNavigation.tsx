"use client";

import React from "react";

interface BannerNavigationProps {
  total: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function BannerNavigation({}: BannerNavigationProps) {
  // Navigation controls (dots/arrows) removed from banner per requirements
  return null;
}

