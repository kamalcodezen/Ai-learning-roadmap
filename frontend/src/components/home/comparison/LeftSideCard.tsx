import React from "react";
import {
  ClipboardCheck,
  FolderKanban,
  SearchCheck,
  CircleCheck,
} from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Task created and assigned",
    description: "New project added to board.",
  },
  {
    icon: FolderKanban,
    title: "Project in progress",
    description: 'Project moved to "In progress".',
  },
  {
    icon: SearchCheck,
    title: "Under review",
    description: "Project is being reviewed.",
  },
  {
    icon: CircleCheck,
    title: "Task completed",
    description: "Project completed and delivered.",
  },
];

const LefeSideCard = () => {
  return (
    <div className="h-full w-full max-w-2xl overflow-hidden rounded-[28px] border border-zinc-300 bg-[linear-gradient(to_bottom,#f4ffd6_0%,#eaffbd_45%,#dff5a5_100%)] p-2 dark:border-white/15 dark:bg-[linear-gradient(to_bottom,#0f2a02_0%,#1a3a05_28%,#304c0a_55%,#6b861c_100%)]">
      {/* Brand Header */}
      <div className="rounded-[22px] border border-black/10 bg-card px-6 py-5 dark:border-white/15">
        <h2 className="text-center text-2xl text-foreground md:text-3xl">
          Coursera / Udemy
        </h2>
      </div>

      {/* Features */}
      <div className="px-5 py-7 md:px-7 md:py-8">
        <div className="relative space-y-5">
          {/* Vertical Line */}
          <div className="absolute bottom-6 left-[23px] top-6 w-px bg-black/15 dark:bg-white/25" />

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="relative flex items-center gap-4 rounded-2xl border border-black/10 bg-white/50 p-4 dark:border-white/10 dark:bg-black/25"
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
                  <h3 className="text-base leading-tight text-foreground md:text-lg">
                    {feature.title}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-zinc-700 dark:text-white/70">
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

export default LefeSideCard;