"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/src/utils/cn";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  gradientSize?: number;
  gradientColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function MagicCard({
  children,
  className,
  gradientSize = 240,
  gradientColor = "#262626",
  gradientFrom = "#ffaa40",
  gradientTo = "#9c40ff",
  ...props
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: -gradientSize,
    y: -gradientSize,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn("relative h-full rounded-md", className)}
      {...props}
    >
      {/* Spotlight following the cursor */}
      <div
        className="pointer-events-none absolute inset-0 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
        style={{
          background: `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${gradientFrom}, transparent)`,
        }}
      />
      {/* Gradient border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
        style={
          {
            border: "1px solid transparent",
            background: `linear-gradient(140deg, ${gradientFrom} 0%, ${gradientTo} 50%, ${gradientColor} 100%) border-box`,
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          } as React.CSSProperties
        }
      />
      <div className="relative">{children}</div>
    </div>
  );
}
