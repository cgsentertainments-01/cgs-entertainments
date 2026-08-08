import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 active:scale-95 focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/35 hover:scale-105",
    secondary:
      "bg-purple-100 text-purple-900 hover:bg-purple-200 border border-purple-200",
    outline:
      "border border-purple-200 text-purple-700 bg-white hover:bg-purple-600 hover:text-white hover:border-purple-600 shadow-xs",
    ghost: "text-purple-700 hover:bg-purple-50",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
