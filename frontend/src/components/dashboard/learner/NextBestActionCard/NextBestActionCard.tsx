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
import { ArrowRight, Zap } from "lucide-react";

interface Props {
  data: DashboardData["nextAction"];
}

export default function NextBestActionCard({ data }: Props) {
  const reasonScrollRef = useRef<HTMLDivElement>(null);
  const reasonContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (!reasonScrollRef.current || !reasonContentRef.current) return;

    const lenis = new Lenis({
      wrapper: reasonScrollRef.current,
      content: reasonContentRef.current,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  if (!data) {
    return (
      <Card className="h-[365px]">
        <CardHeader>
          <CardTitle>Your Next Best Action</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center py-8">
          <p className="text-muted-foreground">
            You&apos;re all caught up! Explore the learning path for more.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="rounded-xl p-6 h-full lg:h-[365px] border-2 border-background shadow-none dashboard-card"
    >
      <CardHeader className="shrink-0">
        <CardTitle className="text-primary flex items-center gap-2">
          <Zap className="w-5 h-5 fill-primary" /> Your Next Best Action
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-col relative z-10 h-full">
        <h3 className="shrink-0 text-xl font-bold text-foreground">{data.title}</h3>

        <div ref={reasonScrollRef} className="mt-4 lg:h-fit min-h-0 overflow-y-scroll rounded-lg">
          <div ref={reasonContentRef} className="min-h-full">
            <div className="bg-card-soft rounded-lg p-4 border border-border">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Reason
              </span>
              <p className="text-sm text-foreground">{data.reason}</p>
            </div>
          </div>
        </div>

        <Link
          href={data.href}
          className="btn-primary w-full mt-4 shrink-0 flex items-center justify-center gap-2"
        >
          {data.actionLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
