import prisma from "../../../../lib/prisma.js";

export const getProofGraph = async (userId: string) => {
  const [skillStates, profile, projectEvidence, diagnosticAttempts, interviewSessions] = await Promise.all([
    prisma.skillState.findMany({ where: { userId } }),
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.projectEvidence.findMany({
      where: { userId },
      include: { project: true }
    }),
    prisma.diagnosticAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      include: {
        answers: {
          include: { question: true }
        }
      }
    }),
    prisma.interviewSession.findMany({
      where: { userId, status: "COMPLETED" },
      include: {
        answers: true
      }
    })
  ]);
  
  const totalScore = skillStates.length ? skillStates.reduce((a, s) => a + s.evidenceScore, 0) / skillStates.length : 0;
  
  const nodes: any[] = [];
  const edges: any[] = [];
  
  skillStates.forEach((s) => {
    const skillNodeId = `skill-${s.id}`;
    
    // SKILL NODE
    nodes.push({
      id: skillNodeId,
      type: "skill",
      title: s.skillName,
      status: s.evidenceScore > 50 ? "verified" : "pending",
      description: `Core skill node for ${s.skillName}`,
      score: Math.round(s.evidenceScore)
    });
    
    // PROJECT EVIDENCE NODES
    const relatedEvidence = projectEvidence.filter(e => e.skillName === s.skillName);
    relatedEvidence.forEach(evidence => {
      const evidenceNodeId = `evidence-${evidence.id}`;
      const isProjectVerified = evidence.project.isVerified;
      
      nodes.push({
        id: evidenceNodeId,
        type: "evidence",
        title: `${evidence.evidenceType} Evidence`,
        status: isProjectVerified ? "verified" : "pending",
        description: isProjectVerified ? `Verified via ${evidence.url || evidence.evidenceType}` : `Unverified ${evidence.evidenceType}`
      });
      edges.push({ source: skillNodeId, target: evidenceNodeId, label: "backed by" });
      
      const projectNodeId = `project-${evidence.projectId}`;
      if (!nodes.find(n => n.id === projectNodeId)) {
        nodes.push({
          id: projectNodeId,
          type: "project",
          title: evidence.project.title,
          status: isProjectVerified ? "verified" : "pending",
          description: evidence.project.description,
          score: evidence.project.score,
          metadata: {
            githubUrl: evidence.project.repositoryUrl,
            liveUrl: evidence.project.liveUrl
          }
        });
      }
      edges.push({ source: evidenceNodeId, target: projectNodeId, label: "from" });
    });
    
    // DIAGNOSTIC EVIDENCE NODES
    const relevantCorrectAnswers = diagnosticAttempts.flatMap(attempt => 
      attempt.answers.filter(ans => ans.isCorrect && ans.question.skill === s.skillName)
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
  interviewSessions.forEach(session => {
    const interviewNodeId = `interview-${session.id}`;
    nodes.push({
      id: interviewNodeId,
      type: "interview",
      title: "Interview Validation",
      status: session.score && session.score > 70 ? "verified" : "pending",
      description: session.targetRole ? `Role: ${session.targetRole}` : "General Interview",
      score: session.score ? Math.round(session.score) : undefined
    });
    // Link interview node to the highest scoring skills or globally (we'll just leave it isolated or link to top skills)
    // For simplicity, we just keep it as a standalone root node indicating general interview proof.
  });

  // Fallback if no nodes exist at all
  if (nodes.length === 0) {
    nodes.push({
      id: "empty-state-node",
      type: "skill",
      title: "No Skills Yet",
      status: "missing",
      description: "Complete a diagnostic to build your proof graph."
    });
  }

  return {
    primarySkill: profile?.targetRole || "Software Engineering",
    overallProofScore: Math.round(totalScore),
    nodes,
    edges
  };
};
