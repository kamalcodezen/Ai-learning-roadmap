"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

import {
  careerCategories,
  popularCareerTracks,
  type CareerTrackCategory,
} from "@/src/components/onboarding/careerTracks";

import { Card } from "@/src/components/ui/Card";
import { BorderBeam } from "@/src/components/ui/border-beam";

interface CareerGoalSectionProps {
  selectedTrack: string;
  showAllTracks: boolean;
  setShowAllTracks: (show: boolean) => void;
  activeCategory: CareerTrackCategory | "all";
  setActiveCategory: (category: CareerTrackCategory | "all") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showCustomGoal: boolean;
  setShowCustomGoal: (show: boolean) => void;
  customGoal: string;
  setCustomGoal: (goal: string) => void;
  filteredTracks: { id: string; title: string; description: string }[];
  handleTrackSelect: (trackId: string) => void;
  handleCustomGoalSelect: () => void;
}

interface TrackCardProps {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: (trackId: string) => void;
}

/**
 * Selectable career track card. Shows the MagicUI border beams running
 * along the edges while hovered (beams mount/unmount on hover).
 */
function TrackCard({ id, title, description, selected, onSelect }: TrackCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(id)}
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        p-5
        text-left
        transition-all
        duration-300
        ${
          selected
            ? "border-primary/50 bg-primary/[0.08] shadow-[0_0_35px_rgba(206,255,31,0.08)]"
            : "border-border bg-card-soft hover:-translate-y-0.5 hover:bg-muted"
        }
      `}
    >
      {isHovered && (
        <>
          <BorderBeam
            duration={6}
            size={300}
            borderWidth={2}
            className="from-transparent via-[#9F54F7] to-transparent"
          />
          <BorderBeam
            duration={6}
            delay={3}
            size={300}
            borderWidth={2}
            className="from-transparent via-[#c084fc] to-transparent"
          />
        </>
      )}

      {selected && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent" />
      )}

      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <div
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              ${
                selected
                  ? "bg-primary text-[#131824]"
                  : "bg-muted text-muted-foreground"
              }
            `}
          >
            <Sparkles className="h-4 w-4" />
          </div>

          <span
            className={`
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              border
              ${
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background"
              }
            `}
          >
            {selected && <Check className="h-3 w-3" />}
          </span>
        </div>

        <h3 className="text-sm font-semibold sm:text-base">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </button>
  );
}

export function CareerGoalSection({
  selectedTrack,
  showAllTracks,
  setShowAllTracks,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  showCustomGoal,

  customGoal,
  setCustomGoal,
  filteredTracks,
  handleTrackSelect,
  handleCustomGoalSelect,
}: CareerGoalSectionProps) {
  return (
    <Card
      mouseGlow
      className="group relative overflow-hidden rounded-md p-5 transition-all duration-300 border-2 border-background hover:border-brand shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)] sm:p-7"
    >
      {/* Corner shape */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />

      <div className="relative z-10">
      <div className="mb-6 flex items-start gap-4">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-primary/15
            bg-primary/[0.06]
          "
        >
          <Target className="h-5 w-5 text-primary" />
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            What do you want to become?
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Choose the career direction AI Pather should optimize your
            learning path for.
          </p>
        </div>
      </div>

      {!showAllTracks && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularCareerTracks.map((track) => {
              const selected = selectedTrack === track.id;

              return (
                <TrackCard
                  key={track.id}
                  id={track.id}
                  title={track.title}
                  description={track.description}
                  selected={selected}
                  onSelect={handleTrackSelect}
                />
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setShowAllTracks(true)}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-border
                bg-card-soft
                px-5
                py-3
                text-sm
                font-medium
                transition
                hover:border-primary/30
                hover:bg-muted
              "
            >
              Explore all career tracks
              <ChevronDown className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleCustomGoalSelect}
              className={`
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                px-5
                py-3
                text-sm
                font-medium
                transition
                ${
                  showCustomGoal
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card-soft hover:border-primary/30 hover:bg-muted"
                }
              `}
            >
              <Plus className="h-4 w-4" />
              Create custom career goal
            </button>
          </div>
        </>
      )}

      {showAllTracks && (
        <div className="rounded-2xl border border-border bg-card-soft p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold">Explore Career Tracks</h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Find the direction that best matches your goal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAllTracks(false)}
              className="flex items-center gap-2 self-start text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Hide tracks
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>

          <div className="relative mb-5">
            <Search
              className="
                absolute
                left-4
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search career tracks..."
              className="
                input-field
                h-12
                pl-11
              "
            />
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`
                whitespace-nowrap
                rounded-full
                border
                px-4
                py-2
                text-xs
                font-medium
                transition
                ${
                  activeCategory === "all"
                    ? "border-transparent bg-[#1c1c1c] text-white dark:bg-[#2d2d2d] dark:text-white"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }
              `}
            >
              All
            </button>

            {careerCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`
                  whitespace-nowrap
                  rounded-full
                  border
                  px-4
                  py-2
                  text-xs
                  font-medium
                  transition
                  ${
                    activeCategory === category.id
                      ? "border-transparent bg-[#1c1c1c] text-white dark:bg-[#2d2d2d] dark:text-white"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }
                `}
              >
                {category.title}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTracks.map((track) => {
              const selected = selectedTrack === track.id;

              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleTrackSelect(track.id)}
                  className={`
                    rounded-xl
                    border
                    p-4
                    text-left
                    transition-all
                    ${
                      selected
                        ? "border-primary/50 bg-primary/[0.08]"
                        : "border-border bg-card hover:border-primary/30"
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold">
                        {track.title}
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {track.description}
                      </p>
                    </div>

                    <span
                      className={`
                        flex
                        h-5
                        w-5
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        ${
                          selected
                            ? "border-primary bg-primary text-white"
                            : "border-border"
                        }
                      `}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredTracks.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No career track found.
              </p>

              <button
                type="button"
                onClick={handleCustomGoalSelect}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                <Plus className="h-4 w-4" />
                Create a custom goal
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCustomGoalSelect}
            className={`
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              px-5
              py-3
              text-sm
              font-medium
              transition
              ${
                showCustomGoal
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-primary/30"
              }
            `}
          >
            <Plus className="h-4 w-4" />
            My goal isn&apos;t listed
          </button>
        </div>
      )}

      {showCustomGoal && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Plus className="h-3.5 w-3.5 text-primary" />
              </div>

              <h3 className="text-base font-semibold">
                Create your custom career goal
              </h3>
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              Describe the role you want. AI Pather will use it as
              context for your personalized diagnostic.
            </p>
          </div>

          <input
            value={customGoal}
            onChange={(event) => setCustomGoal(event.target.value)}
            placeholder="e.g. Python AI Microservices Engineer"
            className="input-field h-12"
            maxLength={100}
          />

          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>Be specific if possible.</span>

            <span>{customGoal.length}/100</span>
          </div>
        </div>
      )}
      </div>
    </Card>
  );
}
