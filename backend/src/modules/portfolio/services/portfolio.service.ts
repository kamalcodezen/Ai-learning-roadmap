import prisma from "../../../lib/prisma.js";

export const getPortfolio = async (userId: string) => {
  // 1. Fetch real projects for this user
  const projects = await prisma.project.findMany({
    where: { userId },
  });

  const projectCount = projects.length;

  // 2. Calculate average technical depth using the real Project.score field
  let technicalDepth = 0;
  if (projectCount > 0) {
    const totalScore = projects.reduce((acc, p) => acc + p.score, 0);
    technicalDepth = Math.round(totalScore / projectCount);
  }

  return {
    overallStrength: technicalDepth,
    projects: projects.map(p => ({
      id: p.id,
      name: p.title || "Project",
      description: p.description || "No description provided.",
      techStack: [], // Empty state since Prisma model doesn't have it yet
      githubUrl: p.repositoryUrl || undefined,
      liveDemoUrl: p.liveUrl || undefined,
      metrics: {
        technicalDepth: p.score,
        explanationQuality: null, // Empty state

        evidence: "verified"
      }
    }))
  };
};
