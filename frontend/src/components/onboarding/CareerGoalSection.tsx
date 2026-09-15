"use client";

import { useMemo, useState } from "react";
import { Check, Compass, Sparkles, Target } from "lucide-react";

import { popularCareerTracks } from "@/src/components/onboarding/careerTracks";

import { Card } from "@/src/components/ui/Card";
import { BorderBeam } from "@/src/components/ui/border-beam";

interface CareerGoalSectionProps {
  selectedTrack: string;
  customGoal: string;
  setCustomGoal: (goal: string) => void;
  handleTrackSelect: (trackId: string) => void;
}

interface TrackCardProps {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: (trackId: string) => void;
}

function TrackCard({ id, title, description, selected, onSelect }: TrackCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const active = selected || isHovered;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
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
        <>
          <BorderBeam
            duration={6}
            size={240}
            borderWidth={2}
            colorFrom="#9F54F7"
            colorTo="#c084fc"
          />
        </>
      )}

      <div className="relative flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
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

        <div>
          <h3 className="font-poppins text-sm font-semibold text-foreground sm:text-base">
            {title}
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export function CareerGoalSection({
  selectedTrack,
  customGoal,
  setCustomGoal,
  handleTrackSelect,
}: CareerGoalSectionProps) {
  const query = customGoal.trim().toLowerCase();

  const recommended = useMemo(() => {
    if (!query) return popularCareerTracks;
    return popularCareerTracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.description.toLowerCase().includes(query),
    );
  }, [query]);

  return (
    <Card
      mouseGlow
      className="group relative overflow-hidden rounded-md border-2 border-background shadow-none"
    >
      <div className="relative z-10 space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.06]">
            <Target className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="font-poppins text-xl font-semibold text-foreground">
              What are you preparing for?
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Pick a recommended track or type your own goal — AI Pather will
              build your path around it.
            </p>
          </div>
        </div>

        <div className="relative">
          <Compass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={customGoal}
            onChange={(event) => setCustomGoal(event.target.value)}
            placeholder="Where would you like to go? e.g. AI Engineer"
            maxLength={100}
            className="input-field pl-11"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Recommended tracks
            </span>
            <span className="text-[11px] text-muted-foreground">
              {recommended.length} available
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((track) => (
              <TrackCard
                key={track.id}
                id={track.id}
                title={track.title}
                description={track.description}
                selected={selectedTrack === track.id}
                onSelect={handleTrackSelect}
              />
            ))}
          </div>

          {recommended.length === 0 && (
            <div className="soft-card rounded-xl p-6 text-center text-sm text-muted-foreground">
              No matching track yet — your custom goal is all set.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}