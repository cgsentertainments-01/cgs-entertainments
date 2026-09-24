import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12", className)}
      {...props}
    >
      {children}
    </div>
  );
}
