"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  careerTracks,
  type CareerTrackCategory,
} from "@/src/components/onboarding/careerTracks";

import { authClient } from "@/src/lib/auth-client";

import {
  onboardingCareerProfile,
  type CareerProfilePayload,
} from "@/src/lib/actions/career-profile";

import { OnboardingHeader } from "./OnboardingHeader";
import { CareerGoalSection } from "./CareerGoalSection";
import { ExperienceSection, type ExperienceLevel } from "./ExperienceSection";
import { CareerOSPreview } from "./CareerOSPreview";
import { OnboardingActionBar } from "./OnboardingActionBar";
import { OnboardingFooter } from "./OnboardingFooter";

export default function OnboardingPage() {
  // ============================================================
  // ROUTER
  // ============================================================

  const router = useRouter();

  // ============================================================
  // AUTH SESSION
  // ============================================================

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  // ============================================================
  // STATE
  // ============================================================

  const [selectedTrack, setSelectedTrack] = useState<string>("");

  const [experience, setExperience] = useState<ExperienceLevel | "">("");

  const [showAllTracks, setShowAllTracks] = useState(false);

  const [activeCategory, setActiveCategory] = useState<
    CareerTrackCategory | "all"
  >("all");

  const [searchQuery, setSearchQuery] = useState("");

  const [showCustomGoal, setShowCustomGoal] = useState(false);

  const [customGoal, setCustomGoal] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // ============================================================
  // SELECTED TRACK
  // ============================================================

  const selectedTrackData = careerTracks.find(
    (track) => track.id === selectedTrack,
  );

  // ============================================================
  // FILTER CAREER TRACKS
  // ============================================================

  const filteredTracks = useMemo(() => {
    let tracks = careerTracks;

    // Category filter
    if (activeCategory !== "all") {
      tracks = tracks.filter((track) => track.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      tracks = tracks.filter(
        (track) =>
          track.title.toLowerCase().includes(query) ||
          track.description.toLowerCase().includes(query),
      );
    }

    return tracks;
  }, [activeCategory, searchQuery]);

  // ============================================================
  // CAN CONTINUE?
  // ============================================================

  const canContinue =
    Boolean(experience) && Boolean(selectedTrack || customGoal.trim());

  // ============================================================
  // SELECT CAREER TRACK
  // ============================================================

  function handleTrackSelect(trackId: string) {
    setSelectedTrack(trackId);
    setCustomGoal("");
    setShowCustomGoal(false);
  }

  // ============================================================
  // CUSTOM CAREER GOAL
  // ============================================================

  function handleCustomGoalSelect() {
    setSelectedTrack("");
    setShowCustomGoal(true);
  }

  // ============================================================
  // CONTINUE
  // ============================================================

  async function handleContinue() {
    if (!canContinue || isSaving) {
      return;
    }

    // ----------------------------------------------------------
    // Get authenticated user ID
    // ----------------------------------------------------------

    const userId = session?.user?.id;

    if (!userId) {
      console.error("User session not found.");
      return;
    }

    if (!experience) {
      return;
    }

    // ----------------------------------------------------------
    // Build Career Profile payload
    // ----------------------------------------------------------

    const onboardingData: CareerProfilePayload = {
      userId,
      targetRole: selectedTrack || "custom",
      targetRoleName: customGoal.trim() || selectedTrackData?.title || "",
      experienceLevel: experience === "beginner" ? "BEGINNER" : "INTERMEDIATE",
    };

    // ----------------------------------------------------------
    // Save Career Profile
    // ----------------------------------------------------------

    try {
      setIsSaving(true);

      const response = await onboardingCareerProfile(onboardingData);

      console.log("Career profile saved successfully:", response);

      // --------------------------------------------------------
      // FINAL ONBOARDING FLOW
      //
      // Onboarding
      //     ↓
      // Career Profile Saved
      //     ↓
      // Diagnostic
      // --------------------------------------------------------

      router.push("/onboarding/diagnostic");
    } catch (error: unknown) {
      console.error("Failed to save career profile:", error);
    } finally {
      setIsSaving(false);
    }
  }

  // ============================================================
  // CURRENT PROFILE LABEL
  // ============================================================

  const currentRole =
    customGoal.trim() || selectedTrackData?.title || "Not selected";

  const currentExperience = experience
    ? experience.charAt(0).toUpperCase() + experience.slice(1)
    : "Not selected";

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* ====================================================== */}
      {/* PREMIUM BACKGROUND */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main green glow */}

        <div className="absolute left-1/2 top-[-280px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[120px]" />

        {/* Left glow */}

        <div className="absolute -left-64 top-[30%] h-[500px] w-[500px] rounded-full bg-primary/[0.035] blur-[100px]" />

        {/* Right glow */}

        <div className="absolute -right-64 bottom-[10%] h-[500px] w-[500px] rounded-full bg-primary/[0.025] blur-[100px]" />

        {/* Subtle grid */}

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      {/* ====================================================== */}
      {/* PAGE CONTAINER */}
      {/* ====================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <OnboardingHeader />

        {/* ==================================================== */}
        {/* MAIN GRID */}
        {/* ==================================================== */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <CareerGoalSection
              selectedTrack={selectedTrack}
              showAllTracks={showAllTracks}
              setShowAllTracks={setShowAllTracks}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showCustomGoal={showCustomGoal}
              setShowCustomGoal={setShowCustomGoal}
              customGoal={customGoal}
              setCustomGoal={setCustomGoal}
              filteredTracks={filteredTracks}
              handleTrackSelect={handleTrackSelect}
              handleCustomGoalSelect={handleCustomGoalSelect}
            />

            <ExperienceSection
              experience={experience}
              setExperience={setExperience}
            />
          </div>

          <CareerOSPreview
            currentRole={currentRole}
            currentExperience={currentExperience}
            canContinue={canContinue}
            selectedTrack={selectedTrack}
            customGoal={customGoal}
            experience={experience}
          />
        </div>

        {/* ==================================================== */}
        {/* ACTION BAR */}
        {/* ==================================================== */}

        <OnboardingActionBar
          canContinue={canContinue && !isSaving && !isSessionLoading}
          handleContinue={handleContinue}
        />

        <OnboardingFooter />
      </div>
    </main>
  );
}
