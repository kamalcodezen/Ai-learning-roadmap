import crypto from "crypto";
import prisma from "../../../../lib/prisma.js";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";

export const getProofGraph = async (userId: string) => {
  const [
    skillStates,
    profile,
    projectEvidence,
    projects,
    diagnosticAttempts,
    interviewSessions,
    assessmentLogs,
  ] = await Promise.all([
    prisma.skillState.findMany({ where: { userId } }),
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.projectEvidence.findMany({
      where: { userId },
      include: { project: true },
    }),
    prisma.project.findMany({
      where: { userId },
    }),
    prisma.diagnosticAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      include: {
        answers: {
          include: { question: true },
        },
      },
    }),
    prisma.interviewSession.findMany({
      where: { userId, status: "COMPLETED" },
      include: {
        answers: true,
      },
    }),
    prisma.activityLog.findMany({
      where: { userId, type: "ASSESSMENT" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const safeSkillStates = skillStates || [];
  const safeProjects = projects || [];
  const safeProjectEvidence = projectEvidence || [];
  const safeDiagnosticAttempts = diagnosticAttempts || [];
  const safeInterviewSessions = interviewSessions || [];
  const safeAssessmentLogs = assessmentLogs || [];

  const nodes: any[] = [];
  const edges: any[] = [];

  safeSkillStates.forEach((s) => {
    if (!s || !s.skillName) return;
    const skillNodeId = `skill-${s.id}`;

    // 1. DIAGNOSTIC EVIDENCE
    const relevantCorrectAnswers = safeDiagnosticAttempts.flatMap((attempt) =>
      (attempt?.answers || []).filter(
        (ans) =>
          ans &&
          ans.isCorrect &&
          ans.question &&
          typeof ans.question.skill === "string" &&
          isMatchingSkill(ans.question.skill, s.skillName),
      ),
    );

    // 2. SIMULATION EVIDENCE (from completed skill simulations)
    const relevantSimulations = safeAssessmentLogs.filter((log) => {
      const meta = log.metadata as any;
      if (!meta || typeof meta !== "object") return false;
      const isSim = meta.assessmentType === "skill_simulation" || meta.overallScore !== undefined;
      const skill = meta.skill || "";
      return Boolean(isSim && isMatchingSkill(skill, s.skillName));
    });

    // 3. PROJECT EVIDENCE (explicit join table)
    const relatedEvidence = safeProjectEvidence.filter(
      (e) => e && e.skillName && isMatchingSkill(e.skillName, s.skillName),
    );

    // 4. MATCHING PROJECTS (by tech stack)
    const matchingProjects = safeProjects.filter(
      (p) =>
        p &&
        Array.isArray(p.techStack) &&
        p.techStack.some((tech) => isMatchingSkill(tech, s.skillName)),
    );

    // Dynamic Mastery Score calculation based on active evaluated components
    const activeComps: number[] = [];
    if ((s.knowledgeScore || 0) > 0) activeComps.push(s.knowledgeScore);
    if ((s.practiceScore || 0) > 0) activeComps.push(s.practiceScore);
    if ((s.projectScore || 0) > 0) activeComps.push(s.projectScore);
    if ((s.evidenceScore || 0) > 0) activeComps.push(s.evidenceScore);

    const compositeScore = Math.round(
      (s.knowledgeScore || 0) * 0.4 + (s.practiceScore || 0) * 0.3 + (s.projectScore || 0) * 0.3,
    );

    const displayScore =
      activeComps.length > 0
        ? Math.round(activeComps.reduce((a, b) => a + b, 0) / activeComps.length)
        : compositeScore;

    const isVerified =
      displayScore >= 60 ||
      (s.knowledgeScore || 0) >= 70 ||
      (s.practiceScore || 0) >= 60 ||
      (s.evidenceScore || 0) >= 50 ||
      relevantCorrectAnswers.length > 0 ||
      relevantSimulations.length > 0 ||
      relatedEvidence.some((e) => e.project?.isVerified) ||
      matchingProjects.some((p) => p.isVerified);

    // SKILL NODE
    nodes.push({
      id: skillNodeId,
      type: "skill",
      title: s.skillName,
      status: isVerified ? "verified" : displayScore > 0 ? "pending" : "missing",
      description: `Core skill node for ${s.skillName} (Mastery: ${displayScore}%)`,
      score: displayScore,
    });

    // DIAGNOSTIC EVIDENCE NODES
    if (relevantCorrectAnswers.length > 0) {
      const diagNodeId = `diag-${s.id}`;
      nodes.push({
        id: diagNodeId,
        type: "diagnostic",
        title: `${s.skillName} Diagnostic`,
        status: "verified",
        description: `${relevantCorrectAnswers.length} verified diagnostic questions passed`,
      });
      edges.push({ source: skillNodeId, target: diagNodeId, label: "validated by" });
    }

    // SIMULATION ASSESSMENT NODES
    relevantSimulations.forEach((sim, idx) => {
      const meta = sim.metadata as any;
      const simScore = Number(meta?.overallScore) || Number(meta?.score) || 0;
      const simNodeId = `sim-${s.id}-${idx}`;
      nodes.push({
        id: simNodeId,
        type: "assessment",
        title: `${s.skillName} Simulation Assessment`,
        status: simScore >= 60 ? "verified" : "pending",
        description: `Hands-on simulation completed (${simScore}% telemetry score)`,
        score: simScore,
      });
      edges.push({ source: skillNodeId, target: simNodeId, label: "simulated in" });
    });

    // PROJECT & EVIDENCE NODES
    if (relatedEvidence.length > 0) {
      relatedEvidence.forEach((evidence) => {
        if (!evidence || !evidence.id || !evidence.project) return;
        const evidenceNodeId = `evidence-${evidence.id}`;
        const isProjectVerified = Boolean(evidence.project.isVerified);

        nodes.push({
          id: evidenceNodeId,
          type: "evidence",
          title: `${evidence.evidenceType || "Project"} Evidence`,
          status: isProjectVerified ? "verified" : "pending",
          description: isProjectVerified
            ? `Verified via ${evidence.url || evidence.evidenceType || "project repository"}`
            : `Unverified ${evidence.evidenceType || "evidence"}`,
        });
        edges.push({ source: skillNodeId, target: evidenceNodeId, label: "backed by" });

        const projectNodeId = `project-${evidence.projectId}`;
        if (!nodes.find((n) => n.id === projectNodeId)) {
          nodes.push({
            id: projectNodeId,
            type: "project",
            title: evidence.project.title || "Untitled Project",
            status: isProjectVerified ? "verified" : "pending",
            description: evidence.project.description || undefined,
            score: typeof evidence.project.score === "number" ? evidence.project.score : undefined,
            metadata: {
              githubUrl: evidence.project.repositoryUrl || undefined,
              liveUrl: evidence.project.liveUrl || undefined,
            },
          });
        }
        edges.push({ source: evidenceNodeId, target: projectNodeId, label: "from" });
      });
    } else if (matchingProjects.length > 0) {
      matchingProjects.forEach((proj) => {
        if (!proj || !proj.id) return;
        const projectNodeId = `project-${proj.id}`;
        const isVerified = Boolean(proj.isVerified);
        const auditScore = typeof proj.score === "number" ? proj.score : undefined;

        if (!nodes.find((n) => n.id === projectNodeId)) {
          nodes.push({
            id: projectNodeId,
            type: "project",
            title: proj.title || "Untitled Project",
            status: isVerified ? "verified" : "pending",
            description: proj.description || `Practical implementation using ${s.skillName}`,
            score: auditScore,
            metadata: {
              githubUrl: proj.repositoryUrl || undefined,
              liveUrl: proj.liveUrl || undefined,
            },
          });
        }

        const evidenceNodeId = `evidence-proj-${proj.id}-${s.id}`;
        nodes.push({
          id: evidenceNodeId,
          type: "evidence",
          title: proj.aiReview ? "AI Code & Architecture Audit" : "Project Evidence",
          status: isVerified ? "verified" : "pending",
          description: proj.aiReview
            ? `Audited via AI Architectural Review (${auditScore || 0}% score)`
            : isVerified
              ? "Verified repository inspection"
              : `Project implementation: ${proj.title}`,
          score: auditScore,
        });
        edges.push({ source: skillNodeId, target: evidenceNodeId, label: "backed by" });
        edges.push({ source: evidenceNodeId, target: projectNodeId, label: "from" });
      });
    }
  });

  // INTERVIEW NODES (Global to Career)
  safeInterviewSessions.forEach((session) => {
    if (!session || !session.id) return;
    const interviewNodeId = `interview-${session.id}`;
    const scoreVal = typeof session.score === "number" ? Math.round(session.score) : undefined;
    nodes.push({
      id: interviewNodeId,
      type: "interview",
      title: "Interview Validation",
      status: scoreVal !== undefined && scoreVal >= 70 ? "verified" : "pending",
      description: session.targetRole ? `Role: ${session.targetRole}` : "General Interview",
      score: scoreVal,
    });
  });

  // Fallback if no nodes exist at all
  if (nodes.length === 0) {
    nodes.push({
      id: "empty-state-node",
      type: "skill",
      title: "No Skills Yet",
      status: "missing",
      description: "Complete a diagnostic or roadmap milestone to build your proof graph.",
    });
  }

  const skillNodes = nodes.filter((n) => n.type === "skill");
  const overallProofScore =
    skillNodes.length > 0
      ? Math.round(skillNodes.reduce((a, s) => a + (s.score || 0), 0) / skillNodes.length)
      : 0;

  return {
    primarySkill: profile?.targetRoleName || profile?.targetRole || "Software Engineering",
    overallProofScore,
    nodes,
    edges,
  };
};

const SHARE_SECRET = process.env.AUTH_SECRET || "careeros-proof-graph-share-token-secret";

export const generateProofGraphShareToken = (userId: string): string => {
  const payload = Buffer.from(JSON.stringify({ u: userId, t: Date.now() })).toString("base64url");
  const signature = crypto.createHmac("sha256", SHARE_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

export const verifyProofGraphShareToken = (token: string): string | null => {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expectedSig = crypto.createHmac("sha256", SHARE_SECRET).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return decoded.u || null;
  } catch {
    return null;
  }
};

export const getPublicProofGraphByToken = async (token: string) => {
  const userId = verifyProofGraphShareToken(token);
  if (!userId) {
    throw new Error("Invalid or expired proof verification token.");
  }

  const rawGraph = await getProofGraph(userId);
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
    select: {
      targetRole: true,
      targetRoleName: true,
      experienceLevel: true,
      createdAt: true,
    },
  });

  return {
    verifiedCandidate: {
      targetRole: profile?.targetRoleName || profile?.targetRole || "Software Professional",
      experienceLevel: profile?.experienceLevel || "BEGINNER",
      verifiedSince: profile?.createdAt,
    },
    primarySkill: rawGraph.primarySkill,
    overallProofScore: rawGraph.overallProofScore,
    nodes: rawGraph.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      status: n.status,
      description: n.description,
      score: n.score,
    })),
    edges: rawGraph.edges,
  };
};
