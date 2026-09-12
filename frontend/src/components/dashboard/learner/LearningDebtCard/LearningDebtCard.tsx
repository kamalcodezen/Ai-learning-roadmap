"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import { DashboardData } from "@/src/app/(dashboard)/dashboard/types";
import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface Props {
  data: DashboardData["learningDebt"];
}

export default function LearningDebtCard({ data }: Props) {
  const debtScrollRef = useRef<HTMLDivElement>(null);
  const debtContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (!debtScrollRef.current || !debtContentRef.current) return;

    const lenis = new Lenis({
      wrapper: debtScrollRef.current,
      content: debtContentRef.current,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <Card className="h-[310px]">
        <CardHeader>
          <CardTitle>Learning Debt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No unresolved gaps. You&apos;re doing great!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card mouseGlow className="h-[310px]">
      <CardHeader className="shrink-0">
        <CardTitle className="flex justify-between items-center">
          <span>Learning Debt</span>
          <span className="text-sm font-normal text-muted-foreground">
            {data.length} gap{data.length !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full min-h-0">
        <div ref={debtScrollRef} className="min-h-0 flex-1 mb-6 overflow-y-scroll">
          <div ref={debtContentRef} className="min-h-full space-y-4">
          {data.map((debt, index) => (
            <div key={index} className="flex gap-3">
              <AlertTriangle
                className={`w-5 h-5 shrink-0 ${debt.severity === "HIGH" ? "text-red-500" : "text-amber-500"}`}
              />
              <div>
                <h4 className="font-semibold text-foreground text-sm">
                  {debt.skill}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {debt.reason}
                </p>
              </div>
            </div>
          ))}
          </div>
        </div>
        <Link
          href="/dashboard/learner/skill-gaps"
          className="w-full mt-auto flex items-center justify-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          Fix Debt <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
