import prisma from "../../../../lib/prisma.js";
import { getRequiredSkillsForRole } from "../../career-alignment/services/career-skills.map.js";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";

export type AdaptiveDecisionType = 
  | "INITIAL_DIAGNOSTIC"
  | "REMEDIATE_GAP"
  | "PRACTICE_ASSESSMENT"
  | "BUILD_PROJECT_EVIDENCE"
  | "ACCELERATE_MILESTONE"
  | "MOCK_INTERVIEW"
  | "CONTINUE_ROADMAP";

export interface AdaptiveLearningDecision {
  type: AdaptiveDecisionType;
  title: string;
  recommendation: string;
  reason: string;
  evidenceBasis: string;
  targetSkill?: string;
  targetMilestone?: {
    id: string;
    title: string;
  };
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  actionLabel: string;
  href: string;
}

export const getAdaptiveLearningDecision = async (userId: string): Promise<AdaptiveLearningDecision> => {
  const [profile, skillStates, roadmap, latestAttempt, projects, interviewSessions] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.skillState.findMany({ where: { userId } }),
    prisma.roadmap.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { milestones: { orderBy: { order: "asc" } } }
    }),
    prisma.diagnosticAttempt.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" }
    }),
    prisma.project.findMany({ where: { userId } }),
    prisma.interviewSession.findMany({ where: { userId } })
  ]);

  const targetRole = profile?.targetRoleName || profile?.targetRole || "Software Engineer";
  const requiredSkills = getRequiredSkillsForRole(targetRole);

  // 1. Initial Diagnostic needed if no completed diagnostic exists
  if (!latestAttempt) {
    return {
      type: "INITIAL_DIAGNOSTIC",
      title: "Complete Skill Diagnostic",
      recommendation: "Take your baseline assessment to diagnose your current technical depth.",
      reason: "An accurate baseline is required to personalize your roadmap and milestones.",
      evidenceBasis: "No diagnostic attempt recorded.",
      urgency: "CRITICAL",
      actionLabel: "Start Diagnostic",
      href: "/diagnostic"
    };
  }

  // 2. Critical Knowledge Gap (< 40% in critical career skill) -> Remediate
  const criticalGaps = skillStates.filter(s => {
    const isReqCritical = requiredSkills.some(r => isMatchingSkill(r.skill, s.skillName) && r.critical);
    return s.knowledgeScore < 40 && (isReqCritical || s.knowledgeScore === 0);
  });

  if (criticalGaps.length > 0) {
    const gap = criticalGaps[0]!;
    return {
      type: "REMEDIATE_GAP",
      title: `Remediate Prerequisite: ${gap.skillName}`,
      recommendation: `Focus immediately on reviewing fundamental concepts in ${gap.skillName}.`,
      reason: `Your knowledge score in ${gap.skillName} is critically low (${Math.round(gap.knowledgeScore)}%). Proceeding without fundamentals causes compounding learning debt.`,
      evidenceBasis: `Diagnostic / Assessment score: ${Math.round(gap.knowledgeScore)}%`,
      targetSkill: gap.skillName,
      urgency: "CRITICAL",
      actionLabel: "Fix Skill Gap",
      href: "/dashboard/learner/skill-gaps"
    };
  }

  // 3. Knowledge is high (>= 70%) but Evidence is zero (< 20%) -> Project reinforcement
  const missingEvidenceSkills = skillStates.filter(s => s.knowledgeScore >= 70 && s.evidenceScore < 20);
  if (missingEvidenceSkills.length > 0) {
    const skill = missingEvidenceSkills[0]!;
    return {
      type: "BUILD_PROJECT_EVIDENCE",
      title: `Prove Skill: Build ${skill.skillName} Project`,
      recommendation: `Create a verifiable GitHub project or live deployment demonstrating ${skill.skillName}.`,
      reason: `You have strong conceptual knowledge (${Math.round(skill.knowledgeScore)}%) but no verifiable evidence in your portfolio.`,
      evidenceBasis: `Knowledge score is ${Math.round(skill.knowledgeScore)}%, but evidence score is ${Math.round(skill.evidenceScore)}%.`,
      targetSkill: skill.skillName,
      urgency: "HIGH",
      actionLabel: "Add Project Evidence",
      href: "/dashboard/learner/portfolio"
    };
  }

  // 4. Knowledge is intermediate (>= 60%) but Practice is low (< 40%) -> Practice assessment
  const practiceGapSkills = skillStates.filter(s => s.knowledgeScore >= 60 && s.practiceScore < 40);
  if (practiceGapSkills.length > 0) {
    const skill = practiceGapSkills[0]!;
    return {
      type: "PRACTICE_ASSESSMENT",
      title: `Reinforce Practice: ${skill.skillName}`,
      recommendation: `Complete interactive scenario problems and assessments for ${skill.skillName}.`,
      reason: "Bridging the gap between conceptual reading and active problem solving is required for production competency.",
      evidenceBasis: `Practice score: ${Math.round(skill.practiceScore)}% vs Knowledge: ${Math.round(skill.knowledgeScore)}%`,
      targetSkill: skill.skillName,
      urgency: "MEDIUM",
      actionLabel: "Take Assessment",
      href: "/dashboard/learner/assessments"
    };
  }

  // 5. High Mastery across all skills (>= 80%) and Verified Projects -> Recommend Mock Interview
  const allSkillsStrong = skillStates.length >= 3 && skillStates.every(s => s.knowledgeScore >= 70);
  const hasVerifiedProjects = projects.some(p => p.isVerified);
  const hasCompletedInterview = interviewSessions.some(s => s.status === "COMPLETED");

  if (allSkillsStrong && hasVerifiedProjects && !hasCompletedInterview) {
    return {
      type: "MOCK_INTERVIEW",
      title: "Test Career Readiness: AI Mock Interview",
      recommendation: `Validate your real-time communication and architectural reasoning for ${targetRole}.`,
      reason: "Your technical foundation and portfolio are solid. Now prove your interview articulation.",
      evidenceBasis: "Strong skill states and verified projects confirmed.",
      urgency: "HIGH",
      actionLabel: "Start Mock Interview",
      href: "/dashboard/learner/interview"
    };
  }

  // 6. Acceleration check: If current milestone skills are already all strong (>= 80%) -> Accelerate
  const currentMilestone = roadmap?.milestones.find(m => m.status === "CURRENT") || roadmap?.milestones[0];
  if (currentMilestone && currentMilestone.unlocks && currentMilestone.unlocks.length > 0) {
    const milestoneSkills = skillStates.filter(s => 
      currentMilestone.unlocks.some(u => u.toLowerCase() === s.skillName.toLowerCase())
    );
    const isAccelerated = milestoneSkills.length > 0 && milestoneSkills.every(s => s.knowledgeScore >= 80);

    if (isAccelerated) {
      return {
        type: "ACCELERATE_MILESTONE",
        title: `Accelerate: ${currentMilestone.title}`,
        recommendation: `You've demonstrated advanced proficiency in all skills for this milestone. Complete it now to advance.`,
        reason: `Your verified proficiency in ${milestoneSkills.map(s => s.skillName).join(", ")} exceeds 80%.`,
        evidenceBasis: `Verified skill average: ${Math.round(milestoneSkills.reduce((a, b) => a + b.knowledgeScore, 0) / milestoneSkills.length)}%`,
        targetMilestone: {
          id: currentMilestone.id,
          title: currentMilestone.title
        },
        urgency: "LOW",
        actionLabel: "Advance Milestone",
        href: "/dashboard/learner/learning-path"
      };
    }
  }

  // 7. Default: Continue current milestone progression
  if (currentMilestone) {
    return {
      type: "CONTINUE_ROADMAP",
      title: `Continue: ${currentMilestone.title}`,
      recommendation: currentMilestone.description || "Continue working through your active milestone curriculum.",
      reason: "Steady consistent progress on your structured learning path maintains optimal learning momentum.",
      evidenceBasis: "Active roadmap milestone in progress.",
      targetMilestone: {
        id: currentMilestone.id,
        title: currentMilestone.title
      },
      urgency: "LOW",
      actionLabel: "Continue Learning",
      href: "/dashboard/learner/learning-path"
    };
  }

  return {
    type: "CONTINUE_ROADMAP",
    title: "On Track",
    recommendation: "Continue with your personalized curriculum.",
    reason: "All skills and milestones are operating within target parameters.",
    evidenceBasis: "Stable learning telemetry.",
    urgency: "LOW",
    actionLabel: "View Roadmap",
    href: "/dashboard/learner/learning-path"
  };
};
