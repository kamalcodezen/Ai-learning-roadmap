import prisma from "../../../lib/prisma.js";

export const getAdminCareerReadiness = async () => {
  const profiles = await prisma.careerProfile.findMany({
    include: { user: { select: { name: true, email: true } } },
  });

  let ready = 0, almost = 0, needsWork = 0, early = 0;
  
  const readinessData = profiles.map((p: any) => {
    const score = ((p.resumeScore || 0) + (p.interviewScore || 0)) / 2;
    if (score >= 80) ready++;
    else if (score >= 60) almost++;
    else if (score >= 40) needsWork++;
    else early++;
    
    return { ...p, score };
  });

  return { 
    summary: { ready, almost, needsWork, early, total: profiles.length },
    profiles: readinessData.sort((a: any, b: any) => b.score - a.score).slice(0, 20)
  };
};
