"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSimulatorData,
  updateRoadmapPace,
  RoadmapSimulatorOutput,
} from "@/src/lib/api/learner/adaptive-recovery";
import {
  Sliders,
  Calendar,
  Clock,
  CheckCircle2,
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
  Info,
} from "lucide-react";

interface RoadmapSimulatorWidgetProps {
  initialData?: RoadmapSimulatorOutput;
  className?: string;
  defaultExpanded?: boolean;
}

export default function RoadmapSimulatorWidget({
  initialData,
  className = "",
  defaultExpanded = false,
}: RoadmapSimulatorWidgetProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [sliderHours, setSliderHours] = useState<number>(10);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: serverData } = useQuery({
    queryKey: ["roadmapSimulator"],
    queryFn: () => getSimulatorData(),
    initialData,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  const data = serverData || initialData;

  // Synchronize initial slider value with server's stored weekly hours without cascading renders
  const [prevHours, setPrevHours] = useState(data?.weeklyAvailableHours);
  if (data?.weeklyAvailableHours && data.weeklyAvailableHours !== prevHours) {
    setPrevHours(data.weeklyAvailableHours);
    setSliderHours(data.weeklyAvailableHours);
  }

  const remainingHours = data?.remainingEstimatedHours || 120;

  // Real-time recalculation of velocity as the slider moves
  const dynamicProjection = useMemo(() => {
    const hours = Math.max(3, sliderHours);
    const weeksRemaining = Math.max(1, Math.ceil(remainingHours / hours));
    const monthsRemaining = parseFloat((weeksRemaining / 4.33).toFixed(1));

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + weeksRemaining * 7);
    const dateFormatted = targetDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      day: "numeric",
    });

    let category = "RECOMMENDED";
    let label = "Recommended Pace";
    let badgeClass = "bg-primary/10 text-primary border-border";
    let speedGain = "Optimal balance between job velocity and concept retention.";

    if (hours <= 6) {
      category = "STEADY";
      label = "Steady Pace";
      badgeClass = "bg-muted text-muted-foreground border-border";
      speedGain = "Gentle, stress-free learning alongside full-time commitments.";
    } else if (hours <= 14) {
      category = "RECOMMENDED";
      label = "Recommended Pace";
      badgeClass = "bg-primary/10 text-primary border-border";
      speedGain = "Recommended pace for consistent, predictable career transition.";
    } else if (hours <= 25) {
      category = "INTENSIVE";
      label = "Accelerated Sprint";
      badgeClass = "bg-muted text-foreground border-border";
      speedGain = `Accelerates graduation by ~${Math.max(2, Math.round(weeksRemaining * 0.4))} weeks.`;
    } else {
      category = "IMMERSIVE";
      label = "Full-Time Immersive";
      badgeClass = "bg-primary/15 text-primary border-border";
      speedGain = "Daily intensive coding. Direct path to hiring applications.";
    }

    return {
      weeksRemaining,
      monthsRemaining,
      dateFormatted,
      category,
      label,
      badgeClass,
      speedGain,
    };
  }, [sliderHours, remainingHours]);

  const paceMutation = useMutation({
    mutationFn: (hours: number) => updateRoadmapPace(hours),
    onSuccess: (updated) => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      queryClient.setQueryData(["roadmapSimulator"], updated);
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["adaptiveRecovery"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
      queryClient.invalidateQueries({ queryKey: ["gemWallet"] });
      queryClient.invalidateQueries({ queryKey: ["gemHistory"] });
    },
  });

  const handleSave = () => {
    paceMutation.mutate(sliderHours);
  };

  const isModified = data && sliderHours !== data.weeklyAvailableHours;

  return (
    <div
      className={`rounded-xl border border-border bg-card shadow-sm transition-all duration-300 ${className} dashboard-card`}
    >
      {/* Dropdown Accordion Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 md:p-5 cursor-pointer select-none border-b border-border/60 hover:bg-muted/20 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-border shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-base md:text-lg">
                Roadmap Pace Simulator
              </h3>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                Adaptive Velocity
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Simulate weekly study hours and dynamic completion ETA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-sm font-semibold text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>{sliderHours} hrs/week</span>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title={isExpanded ? "Collapse simulator" : "Expand simulator"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 md:p-6 space-y-6">
          {/* Main Controls & Live Dynamic Dial */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 7 cols: Interactive Slider */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-baseline justify-between">
                <label className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Weekly Commitment:
                  <span className="text-xl font-extrabold text-primary">
                    {sliderHours} hours
                  </span>
                  <span className="text-sm text-muted-foreground font-normal">
                    (~{Math.round((sliderHours / 7) * 10) / 10}h / day)
                  </span>
                </label>
                <span
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold border ${dynamicProjection.badgeClass}`}
                >
                  {dynamicProjection.label}
                </span>
              </div>

              {/* Slider Input */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="3"
                  max="40"
                  step="1"
                  value={sliderHours}
                  onChange={(e) => setSliderHours(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground px-1 font-semibold">
                  <span>3h (Casual)</span>
                  <span>10h (Standard)</span>
                  <span>20h (Intensive)</span>
                  <span>40h (Full-time)</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-sm text-muted-foreground font-semibold mr-1">
                  Presets:
                </span>
                {[
                  { label: "5h Steady", val: 5 },
                  { label: "10h Balanced", val: 10 },
                  { label: "18h Sprint", val: 18 },
                  { label: "30h Full-Time", val: 30 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setSliderHours(preset.val)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
                      sliderHours === preset.val
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right 5 cols: Live Velocity Outcome Card */}
            <div className="lg:col-span-5 bg-muted/20 p-4 sm:p-5 rounded-xl border border-border flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    Target Job-Ready Date
                  </span>
                  <span className="text-foreground font-bold">
                    ~{dynamicProjection.weeksRemaining} weeks
                  </span>
                </div>

                <div className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  {dynamicProjection.dateFormatted}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {dynamicProjection.speedGain}
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Curriculum Remaining:</span>
                <span className="font-semibold text-foreground">
                  {data?.remainingMilestones || 0} stages • ~{remainingHours}h
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span>
                Saved pace updates all milestone deadlines & personalized dashboard recommendations.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-sm text-emerald-500 font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pace Synchronized!</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={paceMutation.isPending || (!isModified && !saveSuccess)}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs ${
                  isModified
                    ? "bg-primary hover:bg-primary/90 text-white cursor-pointer"
                    : "bg-muted text-muted-foreground opacity-75 cursor-default"
                }`}
              >
                {paceMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Pace...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>{isModified ? "Apply & Save Schedule" : "Schedule Active"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
