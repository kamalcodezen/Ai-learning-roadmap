/**
 * Conversation State Management for AI Pather Copilot
 * 
 * Tracks multi-turn conversational context, user career goals, active roadmap milestones,
 * skill gaps, and referenced entities across turns.
 */

export interface ConversationState {
  userId?: string | undefined;
  isAuthenticated: boolean;
  userPreferences: {
    language?: ("en" | "bn" | "mixed") | undefined;
    targetRole?: string | undefined;
    targetRoleName?: string | undefined;
    experienceLevel?: ("BEGINNER" | "INTERMEDIATE" | "ADVANCED" | string) | undefined;
    weeklyHours?: number | undefined;
  };
  learnerContext?: {
    activeRoadmapTitle?: string | undefined;
    activeRoadmapStatus?: string | undefined;
    currentMilestoneTitle?: string | undefined;
    currentMilestoneDescription?: string | undefined;
    currentMilestoneOrder?: number | undefined;
    completedMilestones?: string[] | undefined;
    upcomingMilestones?: string[] | undefined;
    activeSkillGaps?: string[] | undefined;
    strongSkills?: string[] | undefined;
    recentProjects?: Array<{
      title: string;
      techStack: string[];
      isVerified: boolean;
      score: number;
    }> | undefined;
    careerTwinScore?: number | undefined;
    resumeScore?: number | undefined;
    interviewScore?: number | undefined;
  } | undefined;
  activeReference?: {
    type?: ("milestone" | "skill" | "project" | "assessment" | "role" | "tool") | undefined;
    name?: string | undefined;
    index?: number | undefined;
  } | undefined;
  topicHistory: string[];
  currentTopic?: string | undefined;
}

export function createInitialConversationState(
  userId?: string,
  isAuthenticated: boolean = false,
  language: "en" | "bn" | "mixed" = "en"
): ConversationState {
  return {
    userId,
    isAuthenticated,
    userPreferences: {
      language,
    },
    topicHistory: [],
  };
}

export function summarizeStateForAI(state: ConversationState): string {
  const parts: string[] = [];

  // 1. User & Goal Profile
  const role = state.userPreferences.targetRoleName || state.userPreferences.targetRole;
  const level = state.userPreferences.experienceLevel;
  const hours = state.userPreferences.weeklyHours;

  const profileChunks: string[] = [];
  if (role) profileChunks.push(`Target Role: ${role}`);
  if (level) profileChunks.push(`Experience: ${level}`);
  if (hours) profileChunks.push(`Weekly Commitment: ${hours} hrs/week`);
  if (state.userPreferences.language) profileChunks.push(`Language Preference: ${state.userPreferences.language}`);

  if (profileChunks.length > 0) {
    parts.push(`- User Profile: ${profileChunks.join(" | ")}`);
  }

  // 2. Active Roadmap Context
  if (state.learnerContext?.activeRoadmapTitle) {
    let roadmapSummary = `- Active Roadmap: "${state.learnerContext.activeRoadmapTitle}" (${state.learnerContext.activeRoadmapStatus || "ACTIVE"})`;
    if (state.learnerContext.currentMilestoneTitle) {
      roadmapSummary += ` -> Current Milestone: "${state.learnerContext.currentMilestoneTitle}"`;
      if (state.learnerContext.currentMilestoneOrder) {
        roadmapSummary += ` (Milestone #${state.learnerContext.currentMilestoneOrder})`;
      }
    }
    parts.push(roadmapSummary);
  }

  if (state.learnerContext?.completedMilestones && state.learnerContext.completedMilestones.length > 0) {
    parts.push(`- Completed Milestones: ${state.learnerContext.completedMilestones.join(", ")}`);
  }

  // 3. Skills & Gaps
  if (state.learnerContext?.activeSkillGaps && state.learnerContext.activeSkillGaps.length > 0) {
    parts.push(`- Active Skill Gaps (Need Improvement): ${state.learnerContext.activeSkillGaps.join(", ")}`);
  }

  if (state.learnerContext?.strongSkills && state.learnerContext.strongSkills.length > 0) {
    parts.push(`- Verified Strengths: ${state.learnerContext.strongSkills.join(", ")}`);
  }

  // 4. Benchmarks & Scores
  const scoreChunks: string[] = [];
  if (state.learnerContext?.careerTwinScore !== undefined) {
    scoreChunks.push(`Career Twin Readiness: ${state.learnerContext.careerTwinScore}%`);
  }
  if (state.learnerContext?.resumeScore !== undefined) {
    scoreChunks.push(`ATS Resume Score: ${state.learnerContext.resumeScore}%`);
  }
  if (state.learnerContext?.interviewScore !== undefined) {
    scoreChunks.push(`Mock Interview Score: ${state.learnerContext.interviewScore}%`);
  }
  if (scoreChunks.length > 0) {
    parts.push(`- Performance Scores: ${scoreChunks.join(" | ")}`);
  }

  // 5. Active Reference
  if (state.activeReference?.name) {
    parts.push(`- Active Reference: ${state.activeReference.type || "item"} "${state.activeReference.name}"${state.activeReference.index ? ` (item #${state.activeReference.index})` : ""}`);
  }

  // 6. Current Topic
  if (state.currentTopic) {
    parts.push(`- Current Discussion Topic: ${state.currentTopic}`);
  }

  return parts.join("\n");
}
