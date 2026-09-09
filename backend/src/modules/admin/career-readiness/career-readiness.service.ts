import prisma from "../../../lib/prisma.js";
import { getCareerReadiness } from "../../learner/readiness/services/readiness.service.js";

export const getAdminCareerReadiness = async () => {
  const [profiles, allSkillStates, allProjects, allDiagnostics] = await Promise.all([
    prisma.careerProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.skillState.findMany({
      select: { userId: true, skillName: true, knowledgeScore: true, practiceScore: true, evidenceScore: true },
    }),
    prisma.project.findMany({
      select: { userId: true, score: true },
    }),
    prisma.diagnosticAttempt.findMany({
      where: { status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      include: {
        answers: {
          where: { question: { order: { in: [4, 6] } } },
          include: { question: true },
        },
      },
    }),
  ]);

  // Group by userId for efficient O(N) lookup without N+1 queries
  const skillStatesByUser = new Map<string, typeof allSkillStates>();
  for (const s of allSkillStates) {
    const list = skillStatesByUser.get(s.userId) || [];
    list.push(s);
    skillStatesByUser.set(s.userId, list);
  }

  const projectsByUser = new Map<string, typeof allProjects>();
  for (const p of allProjects) {
    const list = projectsByUser.get(p.userId) || [];
    list.push(p);
    projectsByUser.set(p.userId, list);
  }

  const diagnosticByUser = new Map<string, (typeof allDiagnostics)[0]>();
  for (const d of allDiagnostics) {
    if (!diagnosticByUser.has(d.userId)) {
      diagnosticByUser.set(d.userId, d);
    }
  }

  let ready = 0, almost = 0, needsWork = 0, early = 0;

  const readinessData = await Promise.all(
    profiles.map(async (p: any) => {
      const userSkills = skillStatesByUser.get(p.userId) || [];
      const userProjects = projectsByUser.get(p.userId) || [];
      const userDiagnostic = diagnosticByUser.get(p.userId) || null;

      const readinessResult = await getCareerReadiness(p.userId, {
        profile: p,
        skillStates: userSkills,
        projects: userProjects,
        latestDiagnostic: userDiagnostic,
      });

      const score = readinessResult.score;
      if (score >= 80) ready++;
      else if (score >= 60) almost++;
      else if (score >= 40) needsWork++;
      else early++;

      return {
        ...p,
        score,
        targetRole: p.targetRoleName || p.targetRole || "Unknown Role",
      };
    })
  );

  return {
    summary: { ready, almost, needsWork, early, total: profiles.length },
    profiles: readinessData.sort((a: any, b: any) => b.score - a.score).slice(0, 20),
  };
};
