import React from "react";
import {
  BrainCircuit,
  Route,
  ChartNoAxesCombined,
  Sparkles,
} from "lucide-react";
import { BorderBeam } from "@/src/components/ui/border-beam";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Skill Gap Analysis",
    description:
      "Identifies the skills you need to reach your target career.",
  },
  {
    icon: Route,
    title: "Personalized Learning Roadmap",
    description: "Creates a learning path based on your current skills.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Career Trajectory Insights",
    description:
      "Shows how your learning progress connects to your career.",
  },
  {
    icon: Sparkles,
    title: "Adaptive AI Guidance",
    description: "Your roadmap evolves as your skills and goals change.",
  },
];

const RightSideCard = () => {
  return (
    <div className="group relative h-full w-full max-w-2xl overflow-hidden rounded-lg border border-primary/25 bg-gradient-to-b from-[#f3e8ff] via-[#ede5ff] to-[#ddd0ff] p-6 transition-all duration-300 hover:border-primary/40 dark:from-[#0a0015] dark:via-[#120025] dark:to-[#2d1065] dark:hover:border-primary/35">
      {/* Border Beams */}
      <BorderBeam size={250} duration={6} colorFrom="#9F54F7" colorTo="#ffffff" />
      <BorderBeam size={250} duration={6} delay={3} colorFrom="#ffffff" colorTo="#9F54F7" reverse />

      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Brand Header */}
      <h2 className="mb-6 text-center text-2xl font-semibold text-brand md:text-3xl">
        AI Pather
      </h2>

      {/* Divider */}
      <div className="mb-5 h-px bg-primary/20" />

      {/* Feature List */}
      <div className="space-y-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 dark:bg-primary/15">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{feature.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RightSideCard;