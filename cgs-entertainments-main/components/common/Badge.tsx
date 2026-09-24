import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  theme?: "purple" | "blue" | "orange" | "pink" | "default";
  className?: string;
}

export function Badge({ children, theme = "default", className }: BadgeProps) {
  const themes = {
    purple: "bg-indigo-950 text-white",
    blue: "bg-blue-600 text-white",
    orange: "bg-amber-600 text-white",
    pink: "bg-pink-600 text-white",
    default: "bg-purple-100 text-purple-800 border border-purple-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-md text-[11px] font-extrabold tracking-wider uppercase shadow-xs",
        themes[theme],
        className
      )}
    >
      {children}
    </span>
  );
}
