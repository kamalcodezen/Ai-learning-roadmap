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
    const res = await fetch(url, { method: "HEAD", signal: controller.signal, redirect: "follow" });
    clearTimeout(timeoutId);
    
    const verified = res.ok || res.status === 405 || res.status === 301 || res.status === 302;
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

    // Now update the SkillState for each skill
    for (const skill of project.techStack) {
      // Find all evidence for this skill across all projects for this user
      const allSkillEvidence = await prisma.projectEvidence.findMany({
        where: { userId, skillName: skill }
      });

      // Simple heuristic: 50 points for each piece of verified evidence up to 100.
      const newEvidenceScore = Math.min(allSkillEvidence.length * 50, 100);

      // Find all projects that use this skill
      const allProjectsForSkill = await prisma.project.findMany({
        where: { userId, techStack: { has: skill } }
      });

      const avgProjectScore = allProjectsForSkill.length > 0 
        ? Math.round(allProjectsForSkill.reduce((acc, p) => acc + p.score, 0) / allProjectsForSkill.length)
        : 0;

      // Upsert the SkillState
      const existingSkill = await prisma.skillState.findUnique({
        where: { userId_skillName: { userId, skillName: skill } }
      });

      if (existingSkill) {
        await prisma.skillState.update({
          where: { id: existingSkill.id },
          data: {
            evidenceScore: newEvidenceScore,
            projectScore: avgProjectScore
          }
        });
      } else {
        await prisma.skillState.create({
          data: {
            userId,
            skillName: skill,
            evidenceScore: newEvidenceScore,
            projectScore: avgProjectScore,
            knowledgeScore: 0,
            practiceScore: 0,
          }
        });
      }
    }
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
  if (project.techStack) {
    for (const skill of project.techStack) {
       const allSkillEvidence = await prisma.projectEvidence.findMany({
        where: { userId, skillName: skill }
      });
      const newEvidenceScore = Math.min(allSkillEvidence.length * 50, 100);
      const allProjectsForSkill = await prisma.project.findMany({
        where: { userId, techStack: { has: skill } }
      });
      const avgProjectScore = allProjectsForSkill.length > 0 
        ? Math.round(allProjectsForSkill.reduce((acc, p) => acc + p.score, 0) / allProjectsForSkill.length)
        : 0;
      
      const existingSkill = await prisma.skillState.findUnique({
        where: { userId_skillName: { userId, skillName: skill } }
      });
      if (existingSkill) {
        await prisma.skillState.update({
          where: { id: existingSkill.id },
          data: {
            evidenceScore: newEvidenceScore,
            projectScore: avgProjectScore
          }
        });
      }
    }
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
  
  let reviewJson;
  try {
    const aiResult = await ChatService.processJsonCompletion(systemPrompt, userPrompt);
    // Find the first { and last } in case of markdown block wrappers
    const rawReply = aiResult.reply;
    const startIdx = rawReply.indexOf('{');
    const endIdx = rawReply.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) throw new Error("Invalid JSON format from AI");
    
    reviewJson = JSON.parse(rawReply.slice(startIdx, endIdx + 1));
  } catch (err: any) {
    throw new Error(`AI Review Failed: ${err.message}`);
  }

  // Validate some basic fields to ensure JSON is what we expect
  if (typeof reviewJson.overallScore !== 'number') {
    throw new Error("Invalid AI JSON structure returned");
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
