import { z } from "zod";
import prisma from "../../../../lib/prisma.js";
import { ChatService } from "../../copilot/services/chat.service.js";
import { getRequiredSkillsForRole } from "../../career-alignment/services/career-skills.map.js";

export const CareerAnalysisSchema = z.object({
  role: z.string(),
  domain: z.string(),
  summary: z.string(),
  coreSkills: z.array(z.object({
    name: z.string(),
    importance: z.enum(["CORE", "SUPPORTING"]),
    reason: z.string()
  })),
  supportingSkills: z.array(z.object({
    name: z.string(),
    importance: z.enum(["CORE", "SUPPORTING"]),
    reason: z.string()
  })),
  practicalCompetencies: z.array(z.string()),
  projectExpectations: z.array(z.string()),
  learningPriorities: z.array(z.string())
});

export type CareerAnalysisResult = z.infer<typeof CareerAnalysisSchema>;

export const getCareerAnalysis = async (userId: string): Promise<CareerAnalysisResult | null> => {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId }
  });

  if (!profile) {
    return null;
  }

  if (!profile.aiAnalysis) {
    return null;
  }

  const analysis = profile.aiAnalysis as any;
  const currentRole = profile.targetRoleName || profile.targetRole;
  const analysisRoleNorm = analysis.role ? String(analysis.role).trim().toLowerCase() : "";
  const targetRoleNorm = currentRole ? String(currentRole).trim().toLowerCase() : "";

  // Stale analysis check: if the role changed, the analysis is invalid.
  if (
    analysisRoleNorm !== targetRoleNorm &&
    analysis.role !== profile.targetRoleName &&
    analysis.role !== profile.targetRole
  ) {
    return null;
  }

  try {
    return CareerAnalysisSchema.parse(analysis);
  } catch (err) {
    console.error("Failed to parse cached AI analysis", err);
    return null;
  }
};

export const generateCareerAnalysis = async (userId: string): Promise<CareerAnalysisResult> => {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw new Error("Career profile not found. Please set your career goal first.");
  }

  const targetRole = profile.targetRoleName || profile.targetRole;
  
  // Use normalized canonical skills mapping
  const deterministicSkills = getRequiredSkillsForRole(targetRole);
  
  // Fetch learner's current SkillState for evidence-based personalization with valid DB fields
  const userSkills = await prisma.skillState.findMany({
    where: { userId },
    select: {
      skillName: true,
      knowledgeScore: true,
      practiceScore: true,
      projectScore: true,
      evidenceScore: true
    }
  });

  const systemInstruction = `You are an expert tech career advisor for AI Pather. 
Your goal is to analyze the learner's target role and provide structured career intelligence.
Output must exactly match the expected JSON schema.`;

  const userPrompt = `Target Role: ${targetRole}
Experience Level: ${profile.experienceLevel}

${deterministicSkills.length > 0 ? `Globally required deterministic skills for this role: ${JSON.stringify(deterministicSkills)}` : ""}
${userSkills.length > 0 ? `Learner's current assessed skills & scores: ${JSON.stringify(userSkills.map(s => ({ skill: s.skillName, knowledgeScore: Math.round(s.knowledgeScore), practiceScore: Math.round(s.practiceScore), projectScore: Math.round(s.projectScore) })))}` : ""}

Generate a comprehensive career analysis in JSON format containing:
- role: string (normalized name, matching "${targetRole}")
- domain: string (e.g. Software Engineering, Data Science, etc.)
- summary: string (short role summary)
- coreSkills: array of { name: string, importance: "CORE" | "SUPPORTING", reason: string }
- supportingSkills: array of { name: string, importance: "CORE" | "SUPPORTING", reason: string }
- practicalCompetencies: array of strings describing what a learner should be capable of doing practically
- projectExpectations: array of strings describing practical projects expected from this role
- learningPriorities: array of strings suggesting immediate next learning directions`;

  try {
    const { reply } = await ChatService.processJsonCompletion(systemInstruction, userPrompt);
    
    let cleaned = reply.trim();
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      cleaned = cleaned.slice(startIdx, endIdx + 1);
    }

    const parsedData = JSON.parse(cleaned);
    const validatedData = CareerAnalysisSchema.parse(parsedData);
    
    // Cache the successful validation in the DB
    await prisma.careerProfile.update({
      where: { userId },
      data: {
        aiAnalysis: validatedData
      }
    });

    return validatedData;
  } catch (error: any) {
    console.error("AI Career Goal Analysis failed:", error);
    throw new Error(error.message || "Career analysis is temporarily unavailable. Please try again.");
  }
};
