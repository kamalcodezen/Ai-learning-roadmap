import prisma from "../../../lib/prisma.js";

export const getProofGraph = async (userId: string) => {
    const skillStates = await prisma.skillState.findMany({ where: { userId } });
    const profile = await prisma.careerProfile.findUnique({ where: { userId } });
    
    const totalScore = skillStates.length ? skillStates.reduce((a, s) => a + s.evidenceScore, 0) / skillStates.length : 0;
    
    const nodes: any[] = [];
    
    skillStates.forEach((s) => {
      nodes.push({
        id: `${s.id}-skill`,
        type: "skill",
        title: s.skillName,
        status: s.evidenceScore > 50 ? "verified" : "pending",
        description: `Core skill node for ${s.skillName}`
      });
      
      nodes.push({
        id: `${s.id}-knowledge`,
        type: "knowledge",
        title: `${s.skillName} Knowledge`,
        status: s.knowledgeScore > 70 ? "verified" : s.knowledgeScore > 0 ? "pending" : "missing",
        score: Math.round(s.knowledgeScore),
        description: `Theoretical understanding`
      });
  
      nodes.push({
        id: `${s.id}-practice`,
        type: "practice",
        title: `${s.skillName} Practice`,
        status: s.practiceScore > 70 ? "verified" : s.practiceScore > 0 ? "pending" : "missing",
        description: `Practical exercises`
      });
    });
  
    // Fallback if no skills exist yet
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
      nodes: nodes
    };
  };