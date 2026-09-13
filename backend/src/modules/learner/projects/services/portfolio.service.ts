import prisma from "../../../../lib/prisma.js";
import { inspectGithubRepository } from "./github-inspector.service.js";
import type { GithubInspectionResult } from "./github-inspector.service.js";

// Basic logic to determine if evidence is valid
const calculateProjectScore = (hasRepo: boolean, hasLive: boolean, techStackCount: number) => {
  let score = 20; // Base score for having a project specification
  if (hasRepo) {
    score += 40;
    if (techStackCount > 2) score += 20;
  }
  if (hasLive) score += 20;
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
    if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") {
      return { verified: false, message: "Must be a github.com URL" };
    }
    
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
      method: "GET",
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
      const uniqueEvidence = new Map();
      for (const e of evidenceData) {
        if (!uniqueEvidence.has(e.skillName) || e.evidenceType === "LIVE") {
          uniqueEvidence.set(e.skillName, e);
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
        let updatedSkill;
        if (existing) {
          updatedSkill = await prisma.skillState.update({
            where: { id: existing.id },
            data: {
              evidenceScore: newEvidenceScore,
              projectScore: avgProjectScore
            }
          });
        } else {
          updatedSkill = await prisma.skillState.create({
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

        await prisma.skillStateHistory.create({
          data: {
            userId,
            skillName: skill,
            knowledgeScore: updatedSkill.knowledgeScore,
            practiceScore: updatedSkill.practiceScore,
            projectScore: updatedSkill.projectScore,
            evidenceScore: updatedSkill.evidenceScore,
          }
        }).catch((err) => console.error("Failed to record skill state history on project sync:", err));
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
      projectType: data.projectType || "GENERATED",
      score,
      isVerified: githubStatus.verified || liveStatus.verified,
    }
  });

  await syncProjectEvidence(project.id, userId);

  try {
    const { awardXp, evaluateAchievements } = await import("../../gamification/services/gamification.service.js");
    await awardXp(userId, "PROJECT_COMPLETION", project.id, 200, `Created project: ${project.title}`);
    if (project.isVerified) {
      await awardXp(userId, "EVIDENCE_VERIFIED", `evidence-${project.id}`, 100, `Verified repository/live link for: ${project.title}`);
    }
    await evaluateAchievements(userId);
  } catch (err) {
    console.error("Failed to award gamification XP for project:", err);
  }

  try {
    await prisma.activityLog.create({
      data: {
        userId,
        type: "PROJECT",
        description: `Created project: ${project.title}`,
        metadata: { projectId: project.id, title: project.title },
      },
    });
  } catch (err) {
    console.error("Failed to create project activity log:", err);
  }

  try {
    const { createNotification } = await import("../../notifications/services/notification.service.js");
    await createNotification({
      userId,
      type: "PROJECT",
      title: "Project Added",
      message: `You added "${project.title}" to your portfolio.`,
      metadata: { projectId: project.id },
    });
  } catch (err) {
    console.error("Failed to create project notification:", err);
  }

  return project;
};

// FLOW B: IMPORT EXISTING GITHUB PROJECT
export const importExistingProject = async (userId: string, data: {
  repositoryUrl: string;
  liveUrl?: string;
  title?: string;
  description?: string;
  techStack?: string[];
}) => {
  const githubStatus = await verifyGithubUrl(data.repositoryUrl);
  if (!githubStatus.verified) {
    throw new Error(`Invalid or unreachable GitHub repository URL: ${githubStatus.message}`);
  }

  // Safely inspect GitHub repository evidence
  const inspection: GithubInspectionResult = await inspectGithubRepository(data.repositoryUrl);

  // Generate standalone AI Project Summary ("What did this learner actually build?")
  const systemPrompt = `You are a Senior Technical Architect analyzing an imported GitHub repository.
Synthesize the repository evidence into a truthful, dynamic AI Project Summary.
Answer clearly: "What did this learner actually build?"
IMPORTANT: DO NOT assume this project was generated by AI Pather. DO NOT invent a project specification.
Output MUST be valid JSON adhering strictly to this structure:
{
  "title": "Concise descriptive project title",
  "summary": "High-level summary of what was actually built",
  "problemSolved": "Practical problem or objective addressed by this repo",
  "mainFeatures": ["Feature 1", "Feature 2"],
  "detectedTechStack": ["Lang1", "Framework1"],
  "architectureComponents": ["Component 1", "Component 2"],
  "engineeringDecisions": ["Engineering decision or pattern detected"],
  "testingStatus": "Overview of testing evidence found",
  "ciCdStatus": "Overview of CI/CD evidence found",
  "deploymentStatus": "Deployment evidence overview",
  "documentationQuality": "Assessment of README and docs",
  "strengths": ["Key strength 1", "Key strength 2"],
  "areasForImprovement": ["Area to improve 1"]
}`;

  const userPrompt = `Repository URL: ${data.repositoryUrl}
Primary Language: ${inspection.primaryLanguage || "Unknown"}
Languages Detected: ${inspection.languages.join(", ") || "None"}
Has README: ${inspection.hasReadme ? "Yes" : "No"}
README Snippet:
${inspection.readmeSnippet || "None provided"}

Has Dockerfile: ${inspection.hasDockerfile ? "Yes" : "No"}
Has Docker Compose: ${inspection.hasDockerCompose ? "Yes" : "No"}
Has CI/CD: ${inspection.hasCiCd ? "Yes" : "No"} (${inspection.ciCdDetails?.join(", ") || "None"})
Has Tests: ${inspection.hasTests ? "Yes" : "No"} (${inspection.testFrameworks?.join(", ") || "None"})
Detected Root Files: ${inspection.detectedFiles.join(", ") || "None"}

Synthesize this repository evidence into an objective AI Project Summary.`;

  let aiSummary: any = null;
  try {
    const { ChatService } = await import("../../copilot/services/chat.service.js");
    const aiResult = await ChatService.processJsonCompletion(systemPrompt, userPrompt);
    let rawReply = aiResult.reply || "";
    rawReply = rawReply.replace(/```json/gi, "").replace(/```/g, "").trim();
    const startIdx = rawReply.indexOf('{');
    const endIdx = rawReply.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      aiSummary = JSON.parse(rawReply.slice(startIdx, endIdx + 1));
    }
  } catch (err: any) {
    console.warn("AI project summary generation fallback triggered for imported project:", err?.message || err);
    aiSummary = {
      title: inspection.repoName ? `Imported: ${inspection.repoName}` : "Imported GitHub Project",
      summary: inspection.description || `Imported GitHub repository (${inspection.primaryLanguage || "Software Project"}).`,
      problemSolved: "Demonstrates software engineering implementation in repository.",
      mainFeatures: ["Source code repository"],
      detectedTechStack: inspection.languages.length > 0 ? inspection.languages : ["Software Engineering"],
      architectureComponents: ["Modular repository code"],
      engineeringDecisions: ["Source repository structure"],
      testingStatus: inspection.hasTests ? "Automated tests detected in repository." : "No automated tests detected in root.",
      ciCdStatus: inspection.hasCiCd ? "CI/CD workflows detected in .github/workflows." : "No CI/CD workflows detected.",
      deploymentStatus: data.liveUrl ? "Live URL provided." : "No live URL provided.",
      documentationQuality: inspection.hasReadme ? "README file present." : "No README file detected.",
      strengths: inspection.languages.length > 0 ? [`Code written in ${inspection.languages.join(", ")}`] : ["GitHub repository connected"],
      areasForImprovement: inspection.hasTests ? [] : ["Add automated test suite"],
    };
  }

  const finalTitle = data.title?.trim() || aiSummary?.title || inspection.repoName || "Imported Project";
  const finalDescription = data.description?.trim() || aiSummary?.summary || "Imported GitHub Repository";
  const finalTechStack = Array.isArray(data.techStack) && data.techStack.length > 0
    ? data.techStack
    : (Array.isArray(aiSummary?.detectedTechStack) && aiSummary.detectedTechStack.length > 0
        ? aiSummary.detectedTechStack
        : inspection.languages);

  const liveStatus = await verifyLiveUrl(data.liveUrl);

  const initialScore = calculateProjectScore(true, liveStatus.verified, finalTechStack.length);

  const project = await prisma.project.create({
    data: {
      userId,
      title: finalTitle,
      description: finalDescription,
      repositoryUrl: data.repositoryUrl,
      liveUrl: data.liveUrl || null,
      techStack: finalTechStack,
      projectType: "IMPORTED",
      aiSummary,
      score: initialScore,
      isVerified: true,
    }
  });

  await syncProjectEvidence(project.id, userId);

  // Automatically trigger AI Project Review for imported project
  await generateProjectReview(userId, project.id);

  // Gamification & Logging
  try {
    const { awardXp, evaluateAchievements } = await import("../../gamification/services/gamification.service.js");
    await awardXp(userId, "PROJECT_COMPLETION", project.id, 250, `Imported GitHub project: ${project.title}`);
    await awardXp(userId, "EVIDENCE_VERIFIED", `evidence-${project.id}`, 100, `Verified GitHub repository for: ${project.title}`);
    await evaluateAchievements(userId);
  } catch (err) {
    console.error("Failed to award gamification XP for imported project:", err);
  }

  try {
    await prisma.activityLog.create({
      data: {
        userId,
        type: "PROJECT",
        description: `Imported GitHub project: ${project.title}`,
        metadata: { projectId: project.id, title: project.title, repositoryUrl: data.repositoryUrl },
      },
    });
  } catch (err) {
    console.error("Failed to create activity log for imported project:", err);
  }

  return prisma.project.findUnique({ where: { id: project.id } });
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
      projectType: p.projectType || "GENERATED",
      specification: p.specification,
      aiSummary: p.aiSummary,
      plannedVsActual: p.plannedVsActual,
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

// DYNAMIC PLANNED VS ACTUAL EVALUATION FOR FLOW A GENERATED PROJECTS
const evaluatePlannedVsActual = (
  specification: any,
  inspection: GithubInspectionResult,
  liveVerified: boolean
) => {
  if (!specification || typeof specification !== "object") return [];

  const plannedVsActual: Array<{
    requirement: string;
    expected: string;
    evidenceFound: string;
    status: "Verified" | "Partially Verified" | "Not Found" | "Unable to Verify";
  }> = [];

  // 1. Evaluate Core Requirements
  const coreReqs = Array.isArray(specification.coreRequirements) ? specification.coreRequirements : [];
  for (const req of coreReqs) {
    const reqText = typeof req === "string" ? req : String(req);
    const reqLower = reqText.toLowerCase();

    let status: "Verified" | "Partially Verified" | "Not Found" | "Unable to Verify" = "Not Found";
    let evidenceFound = "No matching evidence detected in repository";

    if (!inspection.isAccessible) {
      status = "Unable to Verify";
      evidenceFound = inspection.errorMessage || "Repository access unavailable";
    } else if (reqLower.includes("docker") || reqLower.includes("container")) {
      if (inspection.hasDockerfile || inspection.hasDockerCompose) {
        status = "Verified";
        evidenceFound = `Dockerfile / Docker Compose detected (${inspection.detectedFiles.filter(f => f.toLowerCase().includes("docker") || f.toLowerCase().includes("compose")).join(", ")})`;
      } else {
        status = "Not Found";
        evidenceFound = "No Dockerfile or docker-compose.yml found in root";
      }
    } else if (reqLower.includes("ci") || reqLower.includes("cd") || reqLower.includes("pipeline") || reqLower.includes("action")) {
      if (inspection.hasCiCd) {
        status = "Verified";
        evidenceFound = `GitHub Workflows detected: ${inspection.ciCdDetails?.join(", ") || ".github/workflows"}`;
      } else {
        status = "Not Found";
        evidenceFound = "No .github/workflows directory or pipeline files found";
      }
    } else if (reqLower.includes("test") || reqLower.includes("spec") || reqLower.includes("unittest")) {
      if (inspection.hasTests) {
        status = "Verified";
        evidenceFound = `Test files/frameworks detected (${inspection.testFrameworks?.join(", ") || "test files"})`;
      } else {
        status = "Not Found";
        evidenceFound = "No test files or test configuration found";
      }
    } else if (reqLower.includes("readme") || reqLower.includes("documentation") || reqLower.includes("architecture")) {
      if (inspection.hasReadme) {
        status = "Verified";
        evidenceFound = "README file present in repository root";
      } else {
        status = "Not Found";
        evidenceFound = "No README detected";
      }
    } else if (reqLower.includes("deploy") || reqLower.includes("live") || reqLower.includes("hosting")) {
      if (liveVerified) {
        status = "Verified";
        evidenceFound = "Live URL is verified and accessible";
      } else {
        status = "Partially Verified";
        evidenceFound = "Repository source code present; live URL pending/unverified";
      }
    } else {
      // General requirement check against detected languages/files
      const matchesTech = inspection.languages.some(lang => reqLower.includes(lang.toLowerCase())) ||
                          inspection.detectedFiles.some(f => reqLower.includes(f.toLowerCase()));
      if (matchesTech) {
        status = "Verified";
        evidenceFound = `Matching codebase assets detected in repository`;
      } else if (inspection.detectedFiles.length > 0) {
        status = "Partially Verified";
        evidenceFound = `Repository contains ${inspection.detectedFiles.length} root items; manual verification recommended`;
      }
    }

    plannedVsActual.push({
      requirement: reqText,
      expected: "Required for build specification",
      evidenceFound,
      status,
    });
  }

  // 2. Evaluate Expected Deliverables
  const deliverables = Array.isArray(specification.expectedDeliverables) ? specification.expectedDeliverables : [];
  for (const del of deliverables) {
    const delText = typeof del === "string" ? del : String(del);
    const delLower = delText.toLowerCase();

    if (!plannedVsActual.some(p => p.requirement.toLowerCase() === delLower)) {
      let status: "Verified" | "Partially Verified" | "Not Found" | "Unable to Verify" = "Not Found";
      let evidenceFound = "Deliverable not verified";

      if (!inspection.isAccessible) {
        status = "Unable to Verify";
        evidenceFound = inspection.errorMessage || "Repository access unavailable";
      } else if (delLower.includes("readme") && inspection.hasReadme) {
        status = "Verified";
        evidenceFound = "README file present";
      } else if (delLower.includes("docker") && (inspection.hasDockerfile || inspection.hasDockerCompose)) {
        status = "Verified";
        evidenceFound = "Dockerfile / Compose detected";
      } else if (delLower.includes("ci") && inspection.hasCiCd) {
        status = "Verified";
        evidenceFound = "CI/CD workflow file present";
      } else if (inspection.detectedFiles.length > 0) {
        status = "Partially Verified";
        evidenceFound = "Repository source code available";
      }

      plannedVsActual.push({
        requirement: `Deliverable: ${delText}`,
        expected: "Expected project deliverable",
        evidenceFound,
        status,
      });
    }
  }

  return plannedVsActual;
};

// COMPREHENSIVE AI PROJECT REVIEW FOR FLOW A & FLOW B
export const generateProjectReview = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId },
    include: { evidence: true }
  });

  if (!project) throw new Error("Project not found");

  const isFlowA = (project.projectType || "GENERATED") === "GENERATED";
  const githubStatus = await verifyGithubUrl(project.repositoryUrl);
  const liveStatus = await verifyLiveUrl(project.liveUrl);
  const inspection: GithubInspectionResult = await inspectGithubRepository(project.repositoryUrl);

  let plannedVsActual: any[] = [];
  if (isFlowA && project.specification) {
    plannedVsActual = evaluatePlannedVsActual(project.specification, inspection, liveStatus.verified);
  }

  const hasRealEvidence = Boolean(githubStatus.verified && inspection.isAccessible);

  const reviewSourceLabel = isFlowA
    ? "Compared against your AI-generated project requirements."
    : "Analyzed from your GitHub repository and available evidence.";

  const systemPrompt = `You are a Principal Software Architect conducting an objective, evidence-backed project review.
Review source mode: ${reviewSourceLabel}
Repository Evidence Status: ${hasRealEvidence ? "ACCESSIBLE & VERIFIED" : "UNAVAILABLE / UNVERIFIED"}

CRITICAL EVIDENCE-INTEGRITY RULES:
1. ONLY evaluate based on verified evidence provided. DO NOT invent commits, files, deployment status, architecture, tests, or users.
2. If Repository Evidence Status is UNAVAILABLE / UNVERIFIED (isAccessible = false), the learner's actual implementation CANNOT be verified.
3. For projects without verified repository code, you MUST assign low scores (20-35 max) for technicalQuality, practicalImplementation, architecture, testing, completeness, and evidenceQuality.
4. DO NOT treat the generated specification as evidence that the learner actually built the code.
5. Output MUST be valid JSON adhering strictly to this structure:
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

  const specText = isFlowA && project.specification
    ? JSON.stringify(project.specification, null, 2)
    : "None (Imported Project Flow B)";

  const plannedVsActualText = plannedVsActual.length > 0
    ? plannedVsActual.map(p => `- ${p.requirement}: ${p.status} (${p.evidenceFound})`).join('\n')
    : "N/A";

  const userPrompt = `Project Title: ${project.title}
Project Source Type: ${project.projectType || "GENERATED"}
Learner Description: ${project.description || "None provided"}
Tech Stack: ${project.techStack.join(", ") || "None provided"}
Repository URL: ${project.repositoryUrl || "None provided"} (Reachable: ${githubStatus.verified ? "Yes" : "No"})
Live Demo URL: ${project.liveUrl || "None provided"} (Reachable: ${liveStatus.verified ? "Yes" : "No"})

Repository Evidence Inspected:
- Accessible: ${inspection.isAccessible ? "Yes" : "No / " + (inspection.errorMessage || "Unavailable")}
- Primary Language: ${inspection.primaryLanguage || "None"}
- Languages Detected: ${inspection.languages.join(", ") || "None"}
- Has README: ${inspection.hasReadme ? "Yes" : "No"}
- Has Dockerfile: ${inspection.hasDockerfile ? "Yes" : "No"}
- Has Docker Compose: ${inspection.hasDockerCompose ? "Yes" : "No"}
- Has CI/CD: ${inspection.hasCiCd ? "Yes" : "No"} (${inspection.ciCdDetails?.join(", ") || "None"})
- Has Tests: ${inspection.hasTests ? "Yes" : "No"} (${inspection.testFrameworks?.join(", ") || "None"})
- Detected Files: ${inspection.detectedFiles.join(", ") || "None"}

Flow A Specification:
${specText}

Planned vs Actual Comparison:
${plannedVsActualText}

Evaluate strictly according to empirical evidence.`;

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
    console.warn("AI project review generation failed, using evidence-backed fallback:", err?.message || err);
    const isRich = hasRealEvidence && inspection.hasDockerfile && inspection.hasCiCd && inspection.hasTests;

    reviewJson = {
      technicalQuality: { score: isRich ? 85 : (hasRealEvidence ? 65 : 25), feedback: hasRealEvidence ? "Repository code verified." : "Repository code not verified yet." },
      practicalImplementation: { score: isRich ? 80 : (hasRealEvidence ? 60 : 20), feedback: hasRealEvidence ? "Source code detected in repository." : "Repository evidence unavailable." },
      problemSolving: { score: hasRealEvidence ? 75 : 30, feedback: "Addresses target role project competencies." },
      architecture: { score: hasRealEvidence ? (inspection.hasDockerfile ? 80 : 65) : 20, feedback: hasRealEvidence ? (inspection.hasDockerfile ? "Containerized architecture detected." : "Standard codebase structure.") : "Architecture unverified." },
      documentation: { score: hasRealEvidence && inspection.hasReadme ? 80 : 25, feedback: hasRealEvidence && inspection.hasReadme ? "README file present in repository." : "Missing verified repository documentation." },
      completeness: { score: isRich ? 85 : (hasRealEvidence ? 60 : 20), feedback: hasRealEvidence ? "Code implementation verified." : "Implementation incomplete / unverified." },
      technicalExplanation: { score: hasRealEvidence ? 70 : 30, feedback: "Technical description of project stack." },
      evidenceQuality: { score: hasRealEvidence ? 85 : 15, feedback: hasRealEvidence ? "GitHub repository verified and inspected." : "Missing verified repository evidence." },
      overallScore: isRich ? 83 : (hasRealEvidence ? 68 : 22),
      strengths: hasRealEvidence ? ["Verified GitHub repository link", `Primary language: ${inspection.primaryLanguage || "Detected"}`] : ["Clear project specification"],
      weaknesses: hasRealEvidence ? (inspection.hasTests ? [] : ["Missing automated unit tests"]) : ["No verified GitHub repository evidence"],
      recommendations: hasRealEvidence ? ["Add automated tests", "Add CI/CD pipeline"] : ["Link a public GitHub repository", "Implement core project requirements"]
    };
  }

  if (typeof reviewJson.overallScore !== 'number') {
    reviewJson.overallScore = hasRealEvidence ? 65 : 22;
  }

  // Ensure review includes source metadata
  reviewJson.reviewSource = reviewSourceLabel;
  reviewJson.projectType = project.projectType || "GENERATED";

  // Generate truthful AI Implementation Summary or AI Project Summary strictly based on evidence
  const summaryTitle = isFlowA ? "AI Implementation Summary" : "AI Project Summary";
  const aiSummary = {
    type: summaryTitle,
    projectPurpose: project.description || project.title,
    plannedStack: project.techStack,
    actualTechnologies: hasRealEvidence && inspection.languages.length > 0
      ? inspection.languages
      : ["Unable to verify"],
    mainComponents: hasRealEvidence && inspection.detectedFiles.length > 0
      ? inspection.detectedFiles
      : ["Unable to verify"],
    architecture: hasRealEvidence
      ? (inspection.hasDockerfile ? "Containerized (Dockerfile detected)" : "Modular codebase")
      : "Unable to verify",
    testing: hasRealEvidence
      ? (inspection.hasTests ? `Verified (${inspection.testFrameworks?.join(", ") || "Tests found"})` : "No automated test files detected")
      : "Unable to verify",
    ciCd: hasRealEvidence
      ? (inspection.hasCiCd ? "Verified (.github/workflows detected)" : "No CI/CD pipeline detected")
      : "Unable to verify",
    deployment: liveStatus.verified
      ? "Verified (Live URL reachable)"
      : "Unable to verify",
    documentation: hasRealEvidence && inspection.hasReadme
      ? "Verified (README present)"
      : "Unable to verify",
    strengths: reviewJson.strengths || [],
    missingAreas: reviewJson.weaknesses || [],
    completenessPercentage: hasRealEvidence ? (reviewJson.completeness?.score || reviewJson.overallScore) : 0,
    evidenceNote: hasRealEvidence
      ? null
      : "No implementation repository was successfully inspected, so the learner's actual implementation cannot yet be verified.",
  };

  const baseScore = calculateProjectScore(hasRealEvidence, liveStatus.verified, project.techStack.length);
  // Weight score: 60% AI evidence review score + 40% base URL heuristic
  const newFinalScore = Math.round((reviewJson.overallScore * 0.6) + (baseScore * 0.4));

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      aiReview: reviewJson,
      plannedVsActual: isFlowA ? plannedVsActual : (null as any),
      aiSummary,
      explanationQuality: reviewJson.technicalExplanation?.score || null,
      score: newFinalScore,
      isVerified: hasRealEvidence || liveStatus.verified,
    }
  });

  await syncProjectEvidence(projectId, userId);

  return updatedProject.aiReview;
};

export const getProjectReview = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId }
  });
  if (!project) throw new Error("Project not found");
  return project.aiReview || null;
};

export const reanalyzeProject = async (userId: string, projectId: string) => {
  await verifyProjectUrls(userId, projectId);
  await generateProjectReview(userId, projectId);
  return getProject(userId, projectId);
};

export function isMatchingGenerationContext(
  existingProject: any,
  targetContext: {
    skill?: string | null;
    milestoneId?: string | null;
    milestoneTitle?: string | null;
    primaryFocus: string;
    generatedForContext: string;
  }
): boolean {
  if (!existingProject) return false;
  if ((existingProject.projectType || "GENERATED") !== "GENERATED") {
    return false;
  }

  const spec = existingProject.specification as any;
  if (!spec || typeof spec !== "object") return false;

  const existingFocus = (spec.primaryLearningObjective || "").toLowerCase().trim();
  const existingForContext = (spec.generatedForContext || "").toLowerCase().trim();

  const targetSkill = targetContext.skill?.toLowerCase().trim() || null;
  const targetMilestoneTitle = targetContext.milestoneTitle?.toLowerCase().trim() || null;
  const targetFocus = targetContext.primaryFocus.toLowerCase().trim();
  const targetGeneratedFor = targetContext.generatedForContext.toLowerCase().trim();

  const matchSkillOrContext = (a: string, b: string) => {
    if (!a || !b) return false;
    if (a === b) return true;
    const cleanA = a.replace(/[^a-z0-9]/g, "");
    const cleanB = b.replace(/[^a-z0-9]/g, "");
    return cleanA.length > 0 && cleanA === cleanB;
  };

  if (targetSkill) {
    if (
      matchSkillOrContext(existingFocus, targetSkill) ||
      matchSkillOrContext(existingForContext, `generated for: ${targetSkill}`) ||
      existingForContext.includes(targetSkill)
    ) {
      return true;
    }
  }

  if (targetMilestoneTitle) {
    if (
      matchSkillOrContext(existingFocus, targetMilestoneTitle) ||
      matchSkillOrContext(existingForContext, `generated for: ${targetMilestoneTitle}`) ||
      existingForContext.includes(targetMilestoneTitle)
    ) {
      return true;
    }
  }

  if (!targetSkill && !targetMilestoneTitle && targetFocus) {
    if (
      matchSkillOrContext(existingFocus, targetFocus) ||
      matchSkillOrContext(existingForContext, targetGeneratedFor)
    ) {
      return true;
    }
  }

  return false;
}

// FLOW A: GENERATE AI PROJECT SPECIFICATION FROM ROADMAP MILESTONE / SKILL GAPS
export const generateMilestoneProject = async (
  userId: string,
  milestoneId?: string | null,
  skill?: string | null
) => {
  let milestone: any = null;
  if (milestoneId) {
    milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { roadmap: true }
    });

    if (!milestone) throw new Error("Milestone not found");
    if (milestone.roadmap.userId !== userId) throw new Error("Unauthorized");
  }

  const profile = await prisma.careerProfile.findUnique({ where: { userId } });
  const targetRole = profile?.targetRoleName || profile?.targetRole || milestone?.roadmap?.targetRole || "Software Engineer";
  const experienceLevel = profile?.experienceLevel || "BEGINNER";

  let skillGapsList: string[] = [];
  try {
    const { getSkillGaps } = await import("../../skill-gaps/services/skill-gaps.service.js");
    const gapsData = await getSkillGaps(userId);
    skillGapsList = (gapsData?.gaps || []).map((g: any) => g.skill);
  } catch (e) {
    // Non-blocking
  }

  const primarySkillGap = skill?.trim() || null;
  const milestoneTitle = milestone?.title || null;
  const milestoneDescription = milestone?.description || null;
  const milestoneUnlocksText = milestone?.unlocks?.join(", ") || "Core competencies";

  // Priority resolution:
  // 1. Explicit Skill Gap (if provided)
  // 2. Current Milestone (if provided)
  // 3. First active skill gap or milestone fallback
  const primaryFocus = primarySkillGap || milestoneTitle || skillGapsList[0] || "Foundational Engineering";
  const generatedForContext = primarySkillGap
    ? `Generated for: ${primarySkillGap}`
    : milestoneTitle
      ? `Generated for: ${milestoneTitle}`
      : `Generated for: ${primaryFocus}`;

  const targetContext = {
    skill: primarySkillGap,
    milestoneId: milestoneId || null,
    milestoneTitle,
    primaryFocus,
    generatedForContext,
  };

  // DUPLICATE CHECK: Query existing GENERATED projects for this learner
  const existingProjects = await prisma.project.findMany({
    where: { userId, projectType: "GENERATED" },
    orderBy: { createdAt: "desc" },
  });

  const duplicateProject = existingProjects.find((p) =>
    isMatchingGenerationContext(p, targetContext)
  );

  if (duplicateProject) {
    return {
      created: false,
      duplicate: true,
      project: duplicateProject,
    };
  }

  const relevantSupportingContext = [
    ...(milestone?.unlocks || []),
    ...skillGapsList.filter(g => g !== primarySkillGap && g !== primaryFocus).slice(0, 2)
  ].filter(Boolean);
  const supportingContextText = relevantSupportingContext.length > 0 ? relevantSupportingContext.join(", ") : "Standard engineering fundamentals";

  const systemPrompt = `You are a Lead Software Architect designing practical, production-ready portfolio project build specifications for AI Pather learners.
Generate a dynamic, structured build specification whose PRIMARY PURPOSE is to help the learner practice and demonstrate the primary skill gap or current milestone.

CRITICAL CONTEXT & SCOPING RULES:
1. FOCUS PRIMARILY ON THE PROVIDED PRIMARY SKILL GAP OR MILESTONE (${primaryFocus}).
2. DO NOT attempt to cover the learner's entire roadmap or every remaining skill gap.
3. DO NOT include unrelated future skills (such as Kubernetes, Terraform, AWS, microservices) unless they are genuinely necessary for this specific project.
4. Supporting technologies may be included ONLY when they naturally support the primary learning objective.
5. Scope the project appropriately for the learner's current stage so it can be completed realistically.
6. DO NOT use hardcoded project templates.
7. Output MUST be valid JSON adhering strictly to this schema:
{
  "title": "Clear concise project title",
  "summary": "High-level summary of what the learner must build",
  "primaryLearningObjective": "${primaryFocus}",
  "generatedForContext": "${generatedForContext}",
  "problemBeingSolved": "Realistic problem or business objective being solved",
  "whyItMatters": "Why this project is crucial for target role career readiness",
  "coreRequirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
  "expectedFunctionality": ["Expected feature 1", "Expected feature 2"],
  "recommendedTechStack": ["Tool1", "Tool2"],
  "skillsDemonstrated": ["${primaryFocus}", "Supporting Skill"],
  "expectedDeliverables": ["Source code repository", "README with setup instructions"],
  "suggestedArchitecture": ["Component 1", "Component 2"],
  "verificationExpectations": ["Public GitHub repository", "Working tests"],
  "expectedEvidence": [
    { "requirement": "${primaryFocus} implementation", "filePattern": "src" }
  ]
}`;

  const userPrompt = `PRIMARY SKILL GAP: ${primarySkillGap || "None (Milestone focused)"}
CURRENT MILESTONE: ${milestoneTitle || "None"}
MILESTONE DESCRIPTION: ${milestoneDescription || "N/A"}
MILESTONE SKILLS/UNLOCKS: ${milestoneUnlocksText}
TARGET ROLE: ${targetRole}
EXPERIENCE LEVEL: ${experienceLevel}
RELEVANT SUPPORTING CONTEXT: ${supportingContextText}

INSTRUCTION:
Generate a realistic, buildable project whose PRIMARY PURPOSE is to help the learner practice and demonstrate the provided primary skill gap or current milestone (${primaryFocus}).
Do not attempt to cover the learner's entire roadmap.
Do not include unrelated future skills unless they are genuinely necessary for the project.
Supporting technologies may be included only when they naturally support the primary learning objective.
The project should be appropriately scoped for the learner's current stage.`;

  let parsedSpec: any = null;
  try {
    const { ChatService } = await import("../../copilot/services/chat.service.js");
    const aiResult = await ChatService.processJsonCompletion(systemPrompt, userPrompt);
    let rawReply = aiResult.reply || "";
    rawReply = rawReply.replace(/```json/gi, "").replace(/```/g, "").trim();
    const startIdx = rawReply.indexOf('{');
    const endIdx = rawReply.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      parsedSpec = JSON.parse(rawReply.slice(startIdx, endIdx + 1));
    }
  } catch (err: any) {
    console.warn("AI milestone project specification fallback triggered:", err?.message || err);
    parsedSpec = {
      title: `${primaryFocus}: Practical Implementation`,
      summary: `Build a production-ready application demonstrating practical competency in ${primaryFocus}.`,
      primaryLearningObjective: primaryFocus,
      generatedForContext,
      problemBeingSolved: `Addresses core production challenges in ${primaryFocus}.`,
      whyItMatters: `Proves practical competency for ${targetRole} roles.`,
      coreRequirements: [
        `Implement core application functionality focusing on ${primaryFocus}`,
        "Provide clear code organization and documentation",
        "Add unit tests covering core functionality",
        "Include a comprehensive README with setup instructions"
      ],
      expectedFunctionality: ["Core application implementation", "Interface or CLI"],
      recommendedTechStack: [primaryFocus, ...(milestone?.unlocks || [])].filter(Boolean),
      skillsDemonstrated: [primaryFocus, ...(milestone?.unlocks || [])].filter(Boolean),
      expectedDeliverables: ["GitHub Repository", "README", "Tests"],
      suggestedArchitecture: ["Modular application structure"],
      verificationExpectations: ["Verified GitHub repository", "Clean file structure"],
      expectedEvidence: [
        { requirement: `${primaryFocus} implementation`, filePattern: "src" },
        { requirement: "Documentation", filePattern: "README.md" }
      ]
    };
  }

  if (!parsedSpec.primaryLearningObjective) parsedSpec.primaryLearningObjective = primaryFocus;
  if (!parsedSpec.generatedForContext) parsedSpec.generatedForContext = generatedForContext;

  const techStack = Array.isArray(parsedSpec?.recommendedTechStack) && parsedSpec.recommendedTechStack.length > 0 
    ? parsedSpec.recommendedTechStack 
    : [primaryFocus, ...(milestone?.unlocks || [])].filter(Boolean);

  const project = await prisma.project.create({
    data: {
      userId,
      title: parsedSpec?.title || `${primaryFocus} Project`,
      description: parsedSpec?.summary || parsedSpec?.description || `Practical implementation project for ${primaryFocus}`,
      projectType: "GENERATED",
      specification: parsedSpec,
      techStack,
      score: 20,
      isVerified: false,
    }
  });

  await syncProjectEvidence(project.id, userId);

  try {
    await prisma.activityLog.create({
      data: {
        userId,
        type: "PROJECT",
        description: `Generated AI project specification: ${project.title}`,
        metadata: { projectId: project.id, title: project.title, milestoneId: milestoneId || null, skill: primarySkillGap },
      },
    });
  } catch (err) {
    console.error("Failed to create milestone project activity log:", err);
  }

  try {
    const { createNotification } = await import("../../notifications/services/notification.service.js");
    await createNotification({
      userId,
      type: "PROJECT",
      title: "AI Project Specification Generated",
      message: `Generated build specification for: "${primaryFocus}". Build it and link GitHub repo to verify!`,
      metadata: { projectId: project.id, milestoneId: milestoneId || null, skill: primarySkillGap },
    });
  } catch (err) {
    console.error("Failed to create milestone project notification:", err);
  }

  return {
    created: true,
    duplicate: false,
    project,
  };
};

export const reviewProjectPullRequest = async (userId: string, projectId: string, prUrl: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId },
  });

  if (!project) throw new Error("Project not found or unauthorized.");

  const prRegex = /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/pull\/(\d+)/i;
  const match = prUrl.trim().match(prRegex);

  if (!match) {
    throw new Error("Invalid GitHub Pull Request URL. Expected format: https://github.com/owner/repo/pull/123");
  }

  const owner = match[1];
  const repo = match[2];
  const pullNumber = match[3];

  if (!owner || !repo || !pullNumber) {
    throw new Error("Invalid GitHub Pull Request URL structure.");
  }

  if (project.repositoryUrl) {
    const repoLower = project.repositoryUrl.toLowerCase();
    if (!repoLower.includes(`${owner.toLowerCase()}/${repo.toLowerCase()}`)) {
      throw new Error(`Pull Request must belong to this project's repository (${owner}/${repo}).`);
    }
  }

  let diffContent = "";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const headers: Record<string, string> = {
      "User-Agent": "CareerOS-PR-Reviewer/1.0",
      "Accept": "application/vnd.github.v3.diff",
    };

    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const diffRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (diffRes.ok) {
      diffContent = await diffRes.text();
    } else if (diffRes.status === 404 || diffRes.status === 401) {
      if (!process.env.GITHUB_TOKEN) {
        throw new Error("Repository is private or rate-limited. External configuration required: add GITHUB_TOKEN to backend environment to inspect private PRs.");
      }
    }
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("GitHub PR diff request timed out.");
    }
    throw err;
  }

  if (!diffContent || diffContent.trim().length === 0) {
    try {
      const diffFallback = await fetch(`https://github.com/${owner}/${repo}/pull/${pullNumber}.diff`, {
        headers: { "User-Agent": "CareerOS-PR-Reviewer/1.0" },
      });
      if (diffFallback.ok) {
        diffContent = await diffFallback.text();
      }
    } catch {
      // fallback failed
    }
  }

  if (!diffContent || diffContent.trim().length === 0) {
    throw new Error("Unable to retrieve Pull Request diff. Please ensure the repository is public or GITHUB_TOKEN is configured in backend environment.");
  }

  const truncatedDiff = diffContent.slice(0, 15000);

  const systemPrompt = `You are a Principal Software Engineer conducting a thorough Pull Request code review.
Analyze the provided Git diff for code quality, architectural impact, performance, test coverage, potential bugs, and security risks.
Output strictly valid JSON with this schema:
{
  "prSummary": "Brief overview of what this PR changes",
  "qualityScore": 85,
  "verdict": "APPROVED",
  "positives": ["Clear modular separation", "Effective type safety"],
  "concerns": ["Missing unit tests for edge cases"],
  "actionableSuggestions": ["Add regression test covering boundary conditions"]
}`;

  const userPrompt = `Project: ${project.title}
Target Stack: ${project.techStack.join(", ") || "Fullstack"}
Pull Request: ${prUrl}

Git Diff:
\`\`\`diff
${truncatedDiff}
\`\`\``;

  const { ChatService } = await import("../../copilot/services/chat.service.js");
  const aiResult = await ChatService.processJsonCompletion(systemPrompt, userPrompt);
  
  let rawReply = aiResult.reply || "";
  rawReply = rawReply.replace(/```json/gi, "").replace(/```/g, "").trim();
  const startIdx = rawReply.indexOf('{');
  const endIdx = rawReply.lastIndexOf('}');
  const prReview = JSON.parse(rawReply.slice(startIdx, endIdx + 1));

  const existingReview = typeof project.aiReview === "object" && project.aiReview !== null ? project.aiReview : {};
  await prisma.project.update({
    where: { id: projectId },
    data: {
      aiReview: {
        ...existingReview,
        latestPrReview: {
          prUrl,
          reviewedAt: new Date().toISOString(),
          ...prReview,
        }
      }
    }
  });

  return prReview;
};
