"use client"

import { ReactNode, useCallback, useRef } from "react";
import { cn } from "@/src/utils/cn";

export function Card({ className, children, mouseGlow = false }: { className?: string; children: ReactNode; mouseGlow?: boolean }) {
  const glowRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!glowRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    glowRef.current.style.opacity = "1";
    glowRef.current.style.background = `radial-gradient(600px circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(159,84,247,0.10), transparent 40%)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    if (!glowRef.current) return;
    glowRef.current.style.opacity = "0";
  }, []);

  return (
    <div
      className={cn("dashboard-card flex flex-col relative overflow-hidden", className)}
      onMouseMove={mouseGlow ? onMouseMove : undefined}
      onMouseLeave={mouseGlow ? onMouseLeave : undefined}
    >
      {mouseGlow && (
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300"
        />
      )}
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <h3 className={cn("font-bold tracking-tight text-lg text-foreground uppercase", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex-1", className)}>
      {children}
    </div>
  );
}
