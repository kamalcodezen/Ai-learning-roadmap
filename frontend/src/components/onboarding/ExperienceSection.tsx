"use client";

import { useState } from "react";
import { BrainCircuit, Check, Zap } from "lucide-react";

import { Card } from "@/src/components/ui/Card";
import { BorderBeam } from "@/src/components/ui/border-beam";

export type ExperienceLevel = "beginner" | "intermediate";

export const experienceLevels: {
  id: ExperienceLevel;
  title: string;
  description: string;
  icon: typeof BrainCircuit;
}[] = [
  {
    id: "beginner",
    title: "Beginner",
    description: "I'm still building my fundamentals.",
    icon: BrainCircuit,
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description:
      "I can build projects but want stronger production and job readiness.",
    icon: Zap,
  },
];

interface ExperienceSectionProps {
  experience: ExperienceLevel | "";
  setExperience: (level: ExperienceLevel | "") => void;
}

interface LevelOptionProps {
  level: (typeof experienceLevels)[number];
  icon: typeof BrainCircuit;
  selected: boolean;
  onSelect: (level: ExperienceLevel) => void;
}

function LevelOption({ level, icon: Icon, selected, onSelect }: LevelOptionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const active = selected || isHovered;

  return (
    <button
      type="button"
      onClick={() => onSelect(level.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        dashboard-card group relative overflow-hidden rounded-md border text-left transition-all duration-300
        ${
          selected
            ? "border-primary/60 bg-primary/[0.08]"
            : "border-border hover:border-primary/40"
        }
      `}
    >
      {active && (
        <BorderBeam
          duration={6}
          size={220}
          borderWidth={2}
          colorFrom="#9F54F7"
          colorTo="#c084fc"
        />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div
            className={`
              mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-colors
              ${selected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}
            `}
          >
            <Icon className="h-5 w-5" />
          </div>

          <h3 className="font-poppins text-base font-semibold text-foreground">
            {level.title}
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            {level.description}
          </p>
        </div>

        <span
          className={`
            flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition
            ${selected ? "border-primary bg-primary text-white" : "border-border"}
          `}
        >
          {selected && <Check className="h-3 w-3" />}
        </span>
      </div>
    </button>
  );
}

export function ExperienceSection({ experience, setExperience }: ExperienceSectionProps) {
  return (
    <Card
      mouseGlow
      className="group relative overflow-hidden rounded-md border-2 border-background shadow-none"
    >
      <div className="relative z-10">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.06]">
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="font-poppins text-xl font-semibold text-foreground">
              Where are you right now?
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              This calibrates your initial diagnostic so every recommendation
              matches your starting point.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {experienceLevels.map((level) => (
            <LevelOption
              key={level.id}
              level={level}
              icon={level.icon}
              selected={experience === level.id}
              onSelect={setExperience}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}