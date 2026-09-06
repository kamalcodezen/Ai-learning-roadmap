import prisma from "../../../../lib/prisma.js";

export const getProofGraph = async (userId: string) => {
  const [
    skillStates,
    profile,
    projectEvidence,
    projects,
    diagnosticAttempts,
    interviewSessions,
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
  ]);

  const safeSkillStates = skillStates || [];
  const safeProjects = projects || [];
  const safeProjectEvidence = projectEvidence || [];
  const safeDiagnosticAttempts = diagnosticAttempts || [];
  const safeInterviewSessions = interviewSessions || [];

  const totalScore = safeSkillStates.length
    ? safeSkillStates.reduce(
        (a, s) =>
          a +
          ((s.knowledgeScore || 0) * 0.35 +
            (s.practiceScore || 0) * 0.3 +
            (s.projectScore || 0) * 0.2 +
            (s.evidenceScore || 0) * 0.15),
        0,
      ) / safeSkillStates.length
    : 0;

  const nodes: any[] = [];
  const edges: any[] = [];

  safeSkillStates.forEach((s) => {
    if (!s || !s.skillName) return;
    const skillNodeId = `skill-${s.id}`;
    const compositeScore = Math.round(
      (s.knowledgeScore || 0) * 0.4 + (s.practiceScore || 0) * 0.3 + (s.projectScore || 0) * 0.3,
    );

    // SKILL NODE
    nodes.push({
      id: skillNodeId,
      type: "skill",
      title: s.skillName,
      status: compositeScore >= 70 ? "verified" : compositeScore > 0 ? "pending" : "missing",
      description: `Core skill node for ${s.skillName} (Mastery: ${compositeScore}%)`,
      score: compositeScore,
    });

    // PROJECT EVIDENCE NODES (explicit join table)
    const relatedEvidence = safeProjectEvidence.filter(
      (e) => e && e.skillName && e.skillName.toLowerCase() === s.skillName.toLowerCase(),
    );

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
          ? `Verified via ${evidence.url || evidence.evidenceType || "project URL"}`
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

    // If no explicit evidence records, check standalone projects matching tech stack
    if (relatedEvidence.length === 0) {
      const matchingProjects = safeProjects.filter(
        (p) =>
          p &&
          Array.isArray(p.techStack) &&
          p.techStack.some(
            (tech) =>
              typeof tech === "string" &&
              (tech.toLowerCase().includes(s.skillName.toLowerCase()) ||
                s.skillName.toLowerCase().includes(tech.toLowerCase())),
          ),
      );

      matchingProjects.forEach((proj) => {
        if (!proj || !proj.id) return;
        const projectNodeId = `project-${proj.id}`;
        const isVerified = Boolean(proj.isVerified);
        if (!nodes.find((n) => n.id === projectNodeId)) {
          nodes.push({
            id: projectNodeId,
            type: "project",
            title: proj.title || "Untitled Project",
            status: isVerified ? "verified" : "pending",
            description: proj.description || `Practical implementation using ${s.skillName}`,
            score: typeof proj.score === "number" ? proj.score : undefined,
            metadata: {
              githubUrl: proj.repositoryUrl || undefined,
              liveUrl: proj.liveUrl || undefined,
            },
          });
        }
        edges.push({ source: skillNodeId, target: projectNodeId, label: "applied in" });
      });
    }

    // DIAGNOSTIC EVIDENCE NODES
    const relevantCorrectAnswers = safeDiagnosticAttempts.flatMap((attempt) =>
      (attempt?.answers || []).filter(
        (ans) =>
          ans &&
          ans.isCorrect &&
          ans.question &&
          typeof ans.question.skill === "string" &&
          ans.question.skill.toLowerCase() === s.skillName.toLowerCase(),
      ),
    );

    if (relevantCorrectAnswers.length > 0) {
      const diagNodeId = `diag-${s.id}`;
      nodes.push({
        id: diagNodeId,
        type: "diagnostic",
        title: "Diagnostic Assessment",
        status: "verified",
        description: `${relevantCorrectAnswers.length} verified answers`,
      });
      edges.push({ source: skillNodeId, target: diagNodeId, label: "validated by" });
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

  return {
    primarySkill: profile?.targetRoleName || profile?.targetRole || "Software Engineering",
    overallProofScore: Math.round(totalScore),
    nodes,
    edges,
  };
};
