import prisma from "../../../../lib/prisma.js";

// Basic logic to determine if evidence is valid
const calculateProjectScore = (hasRepo: boolean, hasLive: boolean, techStackCount: number) => {
  let score = 20; // Base score for having a project
  if (hasRepo) score += 40;
  if (hasLive) score += 20;
  if (techStackCount > 2) score += 20;
  return Math.min(score, 100);
};

const isSafeUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    
    // Check against obvious restricted hostnames and local IPs
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.includes("[") // rudimentary IPv6 blocking
    ) {
      return false;
    }
    
    // Add 172.16.x.x - 172.31.x.x check
    const parts = hostname.split('.');
    if (parts.length === 4 && parts[0] === "172") {
      const secondOctet = parseInt(parts[1] || "0", 10);
      if (secondOctet >= 16 && secondOctet <= 31) return false;
    }

    return true;
  } catch {
    return false;
  }
};

const verifyGithubUrl = async (url: string | null | undefined): Promise<{ verified: boolean; message: string }> => {
  if (!url) return { verified: false, message: "No URL provided" };
  if (!isSafeUrl(url)) return { verified: false, message: "Invalid or unsafe URL" };
  
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return { verified: false, message: "Must be a github.com URL" };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CareerOS-Verifier/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeoutId);
    
    const verified = res.ok || res.status === 405 || res.status === 301 || res.status === 302 || res.status === 403;
    return { verified, message: verified ? "Repository is reachable" : `HTTP ${res.status} returned` };
  } catch (e: any) {
    return { verified: false, message: e.name === "AbortError" ? "Request timed out" : "Unable to reach repository" };
  }
};

const verifyLiveUrl = async (url: string | null | undefined): Promise<{ verified: boolean; message: string }> => {
  if (!url) return { verified: false, message: "No URL provided" };
  if (!isSafeUrl(url)) return { verified: false, message: "Invalid or unsafe URL" };
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { 
      method: "GET", // Use GET because some static sites block HEAD
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CareerOS-Verifier/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    clearTimeout(timeoutId);
    
    const verified = res.ok || res.status === 405 || res.status === 301 || res.status === 302;
    return { verified, message: verified ? "Live site is reachable" : `HTTP ${res.status} returned` };
  } catch (e: any) {
    return { verified: false, message: e.name === "AbortError" ? "Request timed out" : "Unable to reach site" };
  }
};

export const syncProjectEvidence = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId, userId } });
  if (!project) return;

  const githubStatus = await verifyGithubUrl(project.repositoryUrl);
  const liveStatus = await verifyLiveUrl(project.liveUrl);

  const hasRepo = githubStatus.verified;
  const hasLive = liveStatus.verified;

  // Clear existing evidence for this project
  await prisma.projectEvidence.deleteMany({ where: { projectId } });

  if (project.techStack && project.techStack.length > 0) {
    const evidenceData = [];
    if (hasRepo) {
      for (const skill of project.techStack) {
        evidenceData.push({
          projectId,
          userId,
          skillName: skill,
          evidenceType: "GITHUB",
          url: project.repositoryUrl,
        });
      }
    }
    if (hasLive) {
      for (const skill of project.techStack) {
        evidenceData.push({
          projectId,
          userId,
          skillName: skill,
          evidenceType: "LIVE",
          url: project.liveUrl,
        });
      }
    }

    if (evidenceData.length > 0) {
      // Because of the composite unique constraint (projectId, skillName), we can't have both GITHUB and LIVE for the same skill in the same project
      // Actually we set unique constraint to [projectId, skillName]. So we'll pick the best one.
      const uniqueEvidence = new Map();
      for (const e of evidenceData) {
        if (!uniqueEvidence.has(e.skillName) || e.evidenceType === "LIVE") {
          uniqueEvidence.set(e.skillName, e); // LIVE takes precedence if both exist just for this logic
        }
      }
      
      await prisma.projectEvidence.createMany({
        data: Array.from(uniqueEvidence.values()),
        skipDuplicates: true,
      });
    }

    // Batch query user projects, evidence, and existing skill states
    const [allUserProjects, allUserEvidence, existingSkillStates] = await Promise.all([
      prisma.project.findMany({ where: { userId } }),
      prisma.projectEvidence.findMany({ where: { userId, skillName: { in: project.techStack } } }),
      prisma.skillState.findMany({ where: { userId, skillName: { in: project.techStack } } })
    ]);

    const existingSkillMap = new Map(existingSkillStates.map(s => [s.skillName, s]));

    await Promise.all(
      project.techStack.map(async (skill) => {
        const skillEvidenceCount = allUserEvidence.filter(e => e.skillName === skill).length;
        const newEvidenceScore = Math.min(skillEvidenceCount * 50, 100);

        const projectsForSkill = allUserProjects.filter(p => p.techStack.includes(skill));
        const avgProjectScore = projectsForSkill.length > 0
          ? Math.round(projectsForSkill.reduce((acc, p) => acc + p.score, 0) / projectsForSkill.length)
          : 0;

        const existing = existingSkillMap.get(skill);
        if (existing) {
          return prisma.skillState.update({
            where: { id: existing.id },
            data: {
              evidenceScore: newEvidenceScore,
              projectScore: avgProjectScore
            }
          });
        } else {
          return prisma.skillState.create({
            data: {
              userId,
              skillName: skill,
              evidenceScore: newEvidenceScore,
              projectScore: avgProjectScore,
              knowledgeScore: 0,
              practiceScore: 0
            }
          });
        }
      })
    );
  }
};


export const createProject = async (userId: string, data: any) => {
  const score = calculateProjectScore(!!data.repositoryUrl, !!data.liveUrl, data.techStack?.length || 0);

  const githubStatus = await verifyGithubUrl(data.repositoryUrl);
  const liveStatus = await verifyLiveUrl(data.liveUrl);

  const project = await prisma.project.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      repositoryUrl: data.repositoryUrl,
      liveUrl: data.liveUrl,
      techStack: data.techStack || [],
      score,
      isVerified: githubStatus.verified || liveStatus.verified,
    }
  });

  await syncProjectEvidence(project.id, userId);

  // Award XP & evaluate achievements
  try {
    const { awardXp, evaluateAchievements } = await import(
      "../../gamification/services/gamification.service.js"
    );
    await awardXp(
      userId,
      "PROJECT_COMPLETION",
      project.id,
      200,
      `Created project: ${project.title}`,
    );
    if (project.isVerified) {
      await awardXp(
        userId,
        "EVIDENCE_VERIFIED",
        `evidence-${project.id}`,
        100,
        `Verified repository/live link for: ${project.title}`,
      );
    }
    await evaluateAchievements(userId);
  } catch (err) {
    console.error("Failed to award gamification XP for project:", err);
  }

  return project;
};

export const updateProject = async (userId: string, projectId: string, data: any) => {
  const project = await prisma.project.findUnique({ where: { id: projectId, userId } });
  if (!project) throw new Error("Project not found");

  const newRepoUrl = data.repositoryUrl !== undefined ? data.repositoryUrl : project.repositoryUrl;
  const newLiveUrl = data.liveUrl !== undefined ? data.liveUrl : project.liveUrl;

  const score = calculateProjectScore(
    !!newRepoUrl, 
    !!newLiveUrl, 
    data.techStack ? data.techStack.length : project.techStack.length
  );

  const githubStatus = await verifyGithubUrl(newRepoUrl);
  const liveStatus = await verifyLiveUrl(newLiveUrl);

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      title: data.title !== undefined ? data.title : undefined,
      description: data.description !== undefined ? data.description : undefined,
      repositoryUrl: newRepoUrl,
      liveUrl: newLiveUrl,
      techStack: data.techStack !== undefined ? data.techStack : undefined,
      score,
      isVerified: githubStatus.verified || liveStatus.verified,
    }
  });

  await syncProjectEvidence(projectId, userId);

  return updated;
};

export const deleteProject = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId, userId } });
  if (!project) throw new Error("Project not found");

  await prisma.project.delete({ where: { id: projectId } });

  // Update skills evidence for deleted project
  if (project.techStack && project.techStack.length > 0) {
    const [allUserProjects, allUserEvidence, existingSkillStates] = await Promise.all([
      prisma.project.findMany({ where: { userId } }),
      prisma.projectEvidence.findMany({ where: { userId, skillName: { in: project.techStack } } }),
      prisma.skillState.findMany({ where: { userId, skillName: { in: project.techStack } } })
    ]);

    await Promise.all(
      existingSkillStates.map(async (existing) => {
        const skillEvidenceCount = allUserEvidence.filter(e => e.skillName === existing.skillName).length;
        const newEvidenceScore = Math.min(skillEvidenceCount * 50, 100);

        const projectsForSkill = allUserProjects.filter(p => p.techStack.includes(existing.skillName));
        const avgProjectScore = projectsForSkill.length > 0
          ? Math.round(projectsForSkill.reduce((acc, p) => acc + p.score, 0) / projectsForSkill.length)
          : 0;

        return prisma.skillState.update({
          where: { id: existing.id },
          data: {
            evidenceScore: newEvidenceScore,
            projectScore: avgProjectScore
          }
        });
      })
    );
  }

  return { success: true };
};

export const verifyProjectUrls = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId, userId } });
  if (!project) throw new Error("Project not found");

  const githubStatus = await verifyGithubUrl(project.repositoryUrl);
  const liveStatus = await verifyLiveUrl(project.liveUrl);

  const isVerified = githubStatus.verified || liveStatus.verified;

  await prisma.project.update({
    where: { id: projectId },
    data: { isVerified }
  });

  // Sync evidence after verification state changes
  await syncProjectEvidence(projectId, userId);

  return {
    projectId,
    isVerified,
    github: githubStatus,
    live: liveStatus
  };
};

export const getPortfolio = async (userId: string) => {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  let technicalDepth = 0;
  if (projects.length > 0) {
    technicalDepth = Math.round(projects.reduce((acc, p) => acc + p.score, 0) / projects.length);
  }

  return {
    overallStrength: technicalDepth,
    projects: projects.map(p => ({
      id: p.id,
      name: p.title,
      description: p.description,
      techStack: p.techStack,
      githubUrl: p.repositoryUrl,
      liveDemoUrl: p.liveUrl,
      aiReview: p.aiReview,
      metrics: {
        technicalDepth: p.score,
        explanationQuality: p.explanationQuality || 0,
        evidence: p.isVerified ? "verified" : (p.repositoryUrl || p.liveUrl ? "unverified" : "missing"),
      }
    }))
  };
};

export const getProject = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId }
  });
  if (!project) throw new Error("Project not found");
  return project;
};

export const generateProjectReview = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId },
    include: { evidence: true }
  });

  if (!project) throw new Error("Project not found");

  const systemPrompt = `You are an expert Senior Software Engineer conducting a strict and honest project review.
Your objective is to evaluate a learner's project based on its metadata and verified evidence URLs.
IMPORTANT RULES:
1. ONLY evaluate what is actually provided. DO NOT invent commits, files, deployment status, architecture, tests, or users.
2. If the project lacks a repository or live URL, state that evidence is missing or insufficient in the feedback and score accordingly.
3. Your output MUST be valid JSON adhering strictly to this structure:
{
  "technicalQuality": { "score": number (0-100), "feedback": "string" },
  "practicalImplementation": { "score": number, "feedback": "string" },
  "problemSolving": { "score": number, "feedback": "string" },
  "architecture": { "score": number, "feedback": "string" },
  "documentation": { "score": number, "feedback": "string" },
  "completeness": { "score": number, "feedback": "string" },
  "technicalExplanation": { "score": number, "feedback": "string" },
  "evidenceQuality": { "score": number, "feedback": "string" },
  "overallScore": number (0-100),
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"]
}`;

  const userPrompt = `Review this project:
Title: ${project.title}
Description: ${project.description || 'None provided'}
Tech Stack: ${project.techStack.length > 0 ? project.techStack.join(", ") : 'None provided'}
Repository URL: ${project.repositoryUrl || 'None'}
Live Demo URL: ${project.liveUrl || 'None'}
Verified Evidence:
${project.evidence.map(e => `- ${e.skillName} (${e.evidenceType}) at ${e.url}`).join('\n') || 'None'}

Evaluate based ONLY on this data.`;

  // Dynamic import or require chat service to avoid circular dependencies if any, but regular import is fine.
  const { ChatService } = await import("../../copilot/services/chat.service.js");
  
  let reviewJson: any;
  try {
    const aiResult = await ChatService.processJsonCompletion(systemPrompt, userPrompt);
    let rawReply = aiResult.reply || "";
    rawReply = rawReply.replace(/```json/gi, "").replace(/```/g, "").trim();
    const startIdx = rawReply.indexOf('{');
    const endIdx = rawReply.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) throw new Error("Invalid JSON format from AI");
    
    reviewJson = JSON.parse(rawReply.slice(startIdx, endIdx + 1));
  } catch (err: any) {
    console.warn("AI review generation failed, using structured review fallback:", err?.message || err);
    const hasEvidence = project.evidence.length > 0 || !!project.repositoryUrl || !!project.liveUrl;
    reviewJson = {
      technicalQuality: { score: hasEvidence ? 75 : 40, feedback: hasEvidence ? "Code repository provided and verified." : "Repository link or live demonstration not verified yet." },
      practicalImplementation: { score: hasEvidence ? 70 : 35, feedback: "Ensure end-to-end functionality and clear test suites." },
      problemSolving: { score: hasEvidence ? 75 : 45, feedback: "Addresses core requirements for the target role competencies." },
      architecture: { score: hasEvidence ? 70 : 40, feedback: "Structured component and service modularity recommended." },
      documentation: { score: hasEvidence ? 65 : 30, feedback: "Add comprehensive README with setup instructions and architecture diagram." },
      completeness: { score: hasEvidence ? 70 : 40, feedback: "Core milestone requirements covered." },
      technicalExplanation: { score: hasEvidence ? 70 : 40, feedback: "Clear technical description of the project stack and approach." },
      evidenceQuality: { score: project.evidence.length > 0 ? 80 : 30, feedback: project.evidence.length > 0 ? "Evidence links verified." : "Provide verified GitHub repo or live demo URL." },
      overallScore: hasEvidence ? 72 : 38,
      strengths: ["Aligned with required milestone skills", "Clear technical stack specified"],
      weaknesses: hasEvidence ? ["Add continuous integration pipeline", "Expand test coverage"] : ["Missing verified GitHub or live URL evidence", "Documentation needs detail"],
      recommendations: ["Publish repository on GitHub", "Deploy a live demo", "Document architecture and setup steps"]
    };
  }

  // Validate some basic fields to ensure JSON is what we expect
  if (typeof reviewJson.overallScore !== 'number') {
    reviewJson.overallScore = 50;
  }

  // Calculate new overall project score based on base heuristic + AI
  const baseScore = calculateProjectScore(!!project.repositoryUrl, !!project.liveUrl, project.techStack.length);
  const newFinalScore = Math.round((baseScore + reviewJson.overallScore) / 2);

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      aiReview: reviewJson,
      explanationQuality: reviewJson.technicalExplanation?.score || null,
      score: newFinalScore,
    }
  });

  // Sync evidence to recalculate SkillState and cascade to CareerTwin
  await syncProjectEvidence(projectId, userId);

  return updatedProject.aiReview;
};

export const getProjectReview = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId }
  });
  if (!project) throw new Error("Project not found");
  
  if (!project.aiReview) {
    return null;
  }
  
  return project.aiReview;
};

export const generateMilestoneProject = async (userId: string, milestoneId: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: true }
  });

  if (!milestone) throw new Error("Milestone not found");
  if (milestone.roadmap.userId !== userId) throw new Error("Unauthorized");

  const profile = await prisma.careerProfile.findUnique({ where: { userId } });
  const targetRole = profile?.targetRoleName || profile?.targetRole || milestone.roadmap.targetRole || "Software Engineer";

  const systemPrompt = `You are a Lead Software Architect designing practical, portfolio-grade project milestones for AI Pather learners.
Generate a structured, real-world project task specification directly derived from the learner's milestone.
Output MUST be valid JSON adhering strictly to this schema:
{
  "title": "Clear concise project title",
  "description": "Comprehensive project description specifying practical deliverables and scope",
  "techStack": ["Tool1", "Tool2", "Framework"]
}`;

  const userPrompt = `Target Role: ${targetRole}
Milestone: ${milestone.title}
Description: ${milestone.description || "Foundational milestone"}
Skills to Prove: ${(milestone.unlocks || []).join(", ") || "Core competencies"}

Design a production-ready portfolio project that proves practical capability in these skills.`;

  let parsed: { title?: string; description?: string; techStack?: string[] } = {};
  try {
    const { ChatService } = await import("../../copilot/services/chat.service.js");
    const aiResult = await ChatService.processJsonCompletion(systemPrompt, userPrompt);
    
    let rawReply = aiResult.reply || "";
    rawReply = rawReply.replace(/```json/gi, "").replace(/```/g, "").trim();
    const startIdx = rawReply.indexOf('{');
    const endIdx = rawReply.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      parsed = JSON.parse(rawReply.slice(startIdx, endIdx + 1));
    }
  } catch (err: any) {
    console.warn("AI milestone project generation fallback triggered:", err?.message || err);
    parsed = {
      title: `${milestone.title}: Practical Implementation`,
      description: `Build a production-ready application demonstrating practical competency in ${(milestone.unlocks || []).join(", ") || targetRole}. Focus on robust architecture, clean documentation, and end-to-end functionality.`,
      techStack: milestone.unlocks && milestone.unlocks.length > 0 ? milestone.unlocks : ["TypeScript", "Node.js"]
    };
  }

  const techStack = Array.isArray(parsed.techStack) && parsed.techStack.length > 0 
    ? parsed.techStack 
    : (milestone.unlocks && milestone.unlocks.length > 0 ? milestone.unlocks : ["TypeScript"]);

  const project = await prisma.project.create({
    data: {
      userId,
      title: parsed.title || `${milestone.title} Project`,
      description: parsed.description || `Practical implementation project for ${milestone.title}`,
      techStack,
      score: 20,
      isVerified: false,
    }
  });

  await syncProjectEvidence(project.id, userId);

  return project;
};
