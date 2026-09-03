import prisma from "../../../lib/prisma.js";

export const getAdminAnalytics = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const users = await prisma.user.count();
  const roadmaps = await prisma.roadmap.count();
  const projects = await prisma.project.count();
  const skills = await prisma.skillState.count();
  const assessments = await prisma.diagnosticAttempt.count();

  // Helper to fetch time series using raw SQL for PostgreSQL
  const getSeries = async (table: string, dateCol: string = '"createdAt"') => {
    try {
      const res = await prisma.$queryRawUnsafe<any[]>(`
        SELECT DATE_TRUNC('day', ${dateCol}) as date, CAST(COUNT(*) AS INTEGER) as count
        FROM "${table}"
        WHERE ${dateCol} >= $1
        GROUP BY DATE_TRUNC('day', ${dateCol})
        ORDER BY date ASC
      `, startDate);
      
      return res.map((r: any) => ({
        date: r.date.toISOString().split('T')[0],
        count: r.count
      }));
    } catch (e) {
      console.error(`Failed to fetch series for ${table}:`, e);
      return [];
    }
  };

  const [usersSeries, roadmapsSeries, projectsSeries, assessmentsSeries] = await Promise.all([
    getSeries('user'),
    getSeries('Roadmap'),
    getSeries('Project'),
    getSeries('DiagnosticAttempt', '"startedAt"')
  ]);

  return {
    overview: { users, roadmaps, projects, skills, assessments },
    timeSeries: {
      users: usersSeries,
      roadmaps: roadmapsSeries,
      projects: projectsSeries,
      assessments: assessmentsSeries
    }
  };
};
