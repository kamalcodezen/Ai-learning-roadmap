import React from "react";
import {
  Briefcase,
  HelpCircle,
  Award,
  Video,
} from "lucide-react";
import { BorderBeam } from "@/src/components/ui/border-beam";

const features = [
  {
    icon: Video,
    title: "Static video playlists",
    description: "Generic tutorial lists with no skill diagnosis.",
  },
  {
    icon: Award,
    title: "Binary percentage certificates",
    description: "Shows completion rates instead of verified proof of work.",
  },
  {
    icon: HelpCircle,
    title: "Zero abandonment support",
    description: "No recovery mechanisms or micro catch-up plans.",
  },
  {
    icon: Briefcase,
    title: "Unchecked job readiness",
    description: "No validation against actual job requirements.",
  },
];

const LeftSideCard = () => {
  return (
    <div className="group relative h-full w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-gradient-to-b from-[#f3e8ff] via-[#ede5ff] to-[#ddd0ff] p-6 transition-all duration-300 hover:border-muted-foreground/30 dark:from-[#0a0015] dark:via-[#120025] dark:to-[#2d1065] dark:hover:border-muted-foreground/20">
      {/* Border Beams */}
      <BorderBeam size={200} duration={8} colorFrom="#9F54F7" colorTo="#B978FF" />
      <BorderBeam size={200} duration={8} delay={4} colorFrom="#B978FF" colorTo="#9F54F7" reverse />

      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-muted-foreground/40 to-transparent" />

      {/* Brand Header */}
      <h2 className="mb-6 text-center text-2xl font-semibold text-foreground/80 md:text-3xl">
        Course platforms
      </h2>

      {/* Divider */}
      <div className="mb-5 h-px bg-border" />

      {/* Feature List */}
      <div className="space-y-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 dark:bg-white/5">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground/70">{feature.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeftSideCard;