import React from "react";
import {
  Briefcase,
  HelpCircle,
  Award,
  Video,
} from "lucide-react";

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
    description: "No recovery mechanisms or micro catch-up plans when falling behind.",
  },
  {
    icon: Briefcase,
    title: "Unchecked job readiness",
    description: "No validation against actual job description requirements before applying.",
  },
];

const LeftSideCard = () => {
  return (
    <div className="h-full w-full max-w-2xl overflow-hidden rounded-md border border-zinc-300 bg-[linear-gradient(to_bottom,#f4ffd6_0%,#eaffbd_45%,#dff5a5_100%)] p-2 dark:border-white/15 dark:bg-[linear-gradient(to_bottom,#0f2a02_0%,#1a3a05_28%,#304c0a_55%,#6b861c_100%)]">
      {/* Brand Header */}
      <div className="rounded-md border border-black/10 bg-card px-4 py-3 dark:border-white/15">
        <h2 className="text-center text-lg font-bold text-foreground">
          Traditional Course Platforms
        </h2>
      </div>

      {/* Features */}
      <div className="px-2 py-2 md:px-3 md:py-3">
        <div className="relative space-y-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="relative flex items-center gap-3 rounded-md border border-black/10 bg-white/50 p-3 dark:border-white/10 dark:bg-black/25"
              >
                {/* Feature Icon */}
                <div
                  className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                    index < 2
                      ? "border-primary bg-primary text-secondary"
                      : "border-black/20 bg-white/60 text-black dark:border-white/20 dark:bg-white/10 dark:text-primary"
                  }`}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </div>

                {/* Feature Content */}
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold leading-tight text-foreground">
                    {feature.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-zinc-700 dark:text-white/70">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeftSideCard;