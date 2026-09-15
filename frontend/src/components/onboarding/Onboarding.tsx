"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, ChevronDown, ChevronsUpDown, Sparkles } from "lucide-react";
import Lenis from "lenis";

import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";
import { authClient } from "@/src/lib/auth-client";
import { onboardingCareerProfile, type CareerProfilePayload } from "@/src/lib/actions/learner/career-profile";

import "./onboardingActionButton.css";

// Sample Career Tracks
const CAREER_TRACKS = [
  "Frontend Engineer",
  "Full Stack AI Engineer",
  "Backend Architect",
  "AI Agent Developer",
  "DevOps & MLOps Specialist",
  "Product Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Data Engineer",
  "Cloud Engineer",
  "Mobile Developer",
  "Cybersecurity Analyst",
  "Software Engineer",
  "Data Analyst",
  "QA / Automation Engineer",
  "Embedded / IoT Engineer",
  "Game Developer",
  "Blockchain Developer",
  "UI/UX Designer",
  "Technical Writer",
  "Site Reliability Engineer (SRE)",
  "iOS Developer",
  "Android Developer",
  "Database Administrator",
  "API / Integration Engineer",
  "Web Accessibility Specialist",
];

const VISIBLE_TRACK_COUNT = 6;

export function Onboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const firstName = session?.user?.name?.trim().split(" ")[0] || "there";
  const [step, setStep] = useState<number>(1);
  const [showMoreTracks, setShowMoreTracks] = useState<boolean>(false);
  const tracksScrollRef = useRef<HTMLDivElement>(null);
  const tracksContentRef = useRef<HTMLDivElement>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [customRole, setCustomRole] = useState<string>("");
  const [experience, setExperience] = useState<"beginner" | "intermediate" | "">("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const totalSteps = 4;

  // Route guard: protect onboarding from unauthenticated users
  useEffect(() => {
    if (isSessionLoading) return;
    if (!session?.user) {
      router.replace("/signin");
      return;
    }
    const userRole = ((session.user as { role?: string })?.role || "").toUpperCase();
    if (userRole === "ADMIN") {
      router.replace("/dashboard/admin/dashboard");
    }
  }, [isSessionLoading, session?.user, router]);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    const userId = session?.user?.id;

    if (!userId || !selectedRole || !experience || isSubmitting) {
      return;
    }

    // ----------------------------------------------------------
    // Save Career Profile (same contract as the previous onboarding flow)
    // ----------------------------------------------------------

    const onboardingData: CareerProfilePayload = {
      userId,
      targetRole: selectedRole,
      targetRoleName: selectedRole,
      experienceLevel: experience === "beginner" ? "BEGINNER" : "INTERMEDIATE",
    };

    setIsSubmitting(true);
    try {
      await onboardingCareerProfile(onboardingData);

      // Invalidate routing state so guards know onboarding is done
      queryClient.invalidateQueries({ queryKey: ["routingState"] });

      router.push("/diagnostic");
    } catch (error) {
      console.error("Failed to save career profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lenis smooth scroll for the recommended tracks container (step 2 only)
  useEffect(() => {
    if (step !== 2) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    if (!tracksScrollRef.current || !tracksContentRef.current) return;

    const lenis = new Lenis({
      wrapper: tracksScrollRef.current,
      content: tracksContentRef.current,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, [step]);

  const chevrons = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 66 43"
      aria-hidden="true"
    >
      <polygon points="39.58,4.46 44.11,0 66,21.5 44.11,43 39.58,38.54 56.94,21.5" />
      <polygon points="19.79,4.46 24.32,0 46.21,21.5 24.32,43 19.79,38.54 37.15,21.5" />
      <polygon points="0,4.46 4.53,0 26.42,21.5 4.53,43 0,38.54 17.36,21.5" />
    </svg>
  );

  return (
    <div className="global-pos dashboard-card w-full min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/25">
      {/* Top Header / Progress & Theme Toggle */}
      <header className="w-full flex items-center justify-between px-6 py-6">
        {/* Back or Empty space */}
        <div className="w-24">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : null}
        </div>

        {/* Minimal Step Indicator */}
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300 ${
                  step === i
                    ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
                    : step > i
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > i ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : i}
              </div>
              {i < 4 && (
<div
                  className={`w-8 sm:w-16 h-1 -mr-3 transition-colors duration-300 ${
                    step > i ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Theme Toggle only */}
        <div className="w-24 flex items-center justify-end">
          <AnimatedThemeToggler />
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto w-full text-center my-auto">

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-500 w-full">
            {/* Friendly Host / Avatar Video Container */}
            <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-5 border-primary/40 shadow-lg bg-muted flex items-center justify-center">
              <video
                src="/video/welcome.mp4"
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                <span className="text-primary">Hi {firstName}!</span>
                <br />
                Let&apos;s build your learning roadmap.
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                We tailor your learning journey to your goals.
              </p>
            </div>

            {/* Single Continue action */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={handleNext}
                className="diagnostic-btn h-12 rounded-xl px-6 text-sm"
              >
                <span>Continue</span>
                {chevrons}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Role Selection (Minimalist Clean layout) */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-500 w-full text-left">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Where would you like to go?
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Select from popular tracks below or type your dream role.
              </p>
            </div>

            {/* Custom Role Input */}
            <div className="relative">
              <input
                type="text"
                value={customRole}
                onChange={(e) => {
                  setCustomRole(e.target.value);
                  setSelectedRole(e.target.value);
                }}
                placeholder="Type your target role (e.g. Senior AI Architect)..."
                className="w-full h-12 bg-transparent placeholder:text-foreground/80 border-b-2 border-border focus:border-primary px-2 text-base outline-none transition"
              />
            </div>

            {/* Recommended Tracks List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Or pick a recommended track
              </span>
              <div className="relative">
                <div
                  ref={tracksScrollRef}
                  data-lenis-prevent-wheel
                  className="max-h-[200px] overflow-y-auto pr-1"
                >
                  <div ref={tracksContentRef}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {(showMoreTracks
                        ? CAREER_TRACKS
                        : CAREER_TRACKS.slice(0, VISIBLE_TRACK_COUNT)
                      ).map((track) => {
                        const isSelected = selectedRole === track && !customRole;
                        return (
                          <button
                            key={track}
                            onClick={() => {
                              setCustomRole("");
                              setSelectedRole(track);
                            }}
                            className={`p-4 rounded-xl text-left border transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-primary bg-primary/5 text-primary font-semibold"
                                : "border-border hover:border-primary/40 text-foreground"
                            }`}
                          >
                            <span className="text-sm flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              {track}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Slow bouncing scroll hint */}
                {showMoreTracks && (
                  <div className="pointer-events-none flex animate-bounce [animation-duration:2.2s] text-primary text-[12px] gap-1 items-center absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <ChevronDown className="w-5 h-5" />
                    Scroll down
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowMoreTracks((value) => !value)}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-primary/40 px-5 text-sm font-semibold text-primary transition hover:bg-primary/5"
              >
                <ChevronsUpDown className="h-4 w-4" />
                {showMoreTracks ? "View Less" : "View More Tracks"}
              </button>
              <button
                type="button"
                disabled={!selectedRole}
                onClick={handleNext}
                className="diagnostic-btn h-12 rounded-xl px-6 text-sm"
              >
                <span>Continue</span>
                {chevrons}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Experience Level */}
{step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-500 w-full text-center">
            {/* Friendly Host / Avatar Video Container */}
            <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-5 border-primary/40 shadow-lg bg-muted flex items-center justify-center">
              <video
                src="/video/down.mp4"
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                What is your current experience level?
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                This helps us tune your learning diagnostics accurately.
              </p>
            </div>

            <div className="grid grid-cols-1  gap-3 max-w-lg mx-auto">
              {[
                { id: "beginner", title: "Beginner", desc: "Building fundamentals & core skills" },
                { id: "intermediate", title: "Intermediate", desc: "Building projects, seeking job readiness" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setExperience(lvl.id as "beginner" | "intermediate")}
                  className={`px-4 py-2 rounded-xl text-left border transition-all flex items-center justify-between ${
                    experience === lvl.id
                      ? "border-primary bg-primary/5 text-primary font-semibold"
                      : "border-border hover:border-primary/40 text-foreground"
                  }`}
                >
                  <span className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="flex flex-col text-left">
                      {lvl.title}
                      <span className="text-xs font-normal text-muted-foreground">
                        {lvl.desc}
                      </span>
                    </span>
                  </span>
                  {experience === lvl.id && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-end max-w-lg mx-auto w-full">
              <button
                type="button"
                disabled={!experience}
                onClick={handleNext}
                className="diagnostic-btn h-12 rounded-xl px-6 text-sm"
              >
                <span>Continue</span>
                {chevrons}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Ready to Initialize */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-500 w-full text-center">
            <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-5 border-primary/40 shadow-lg bg-muted flex items-center justify-center">
              <video
                src="/video/thumbsup.mp4"
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Your 
                {" "}
                <span className="text-primary">
                AI Career Twin
                </span>
                {" "}
                 is Ready
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Target Role: <strong className="text-foreground">{selectedRole}</strong> ({experience} level). Click below to launch your diagnostic session.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleComplete}
                className="diagnostic-btn h-12 rounded-xl px-6 text-sm"
              >
                <span>{isSubmitting ? "Initializing..." : "Start Diagnosis"}</span>
                {chevrons}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}