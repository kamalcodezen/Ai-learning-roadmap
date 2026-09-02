import prisma from "../../../lib/prisma.js";
import { CAREER_SKILLS_MAP, FALLBACK_SKILLS } from "../career-alignment/services/career-skills.map.js";

// Basic in-memory cache to avoid spamming the free API
interface CacheEntry {
  timestamp: number;
  data: any;
}
const marketCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export const getLearnerJobReality = async (userId: string) => {
  // 1. Fetch user's profile and target role
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  const targetRole = profile?.targetRoleName || profile?.targetRole;

  if (!targetRole) {
    throw new Error("No target role defined. Please complete onboarding.");
  }

  // 2. Fetch user's current skills
  const skillStates = await prisma.skillState.findMany({
    where: { userId },
  });

  const userSkillMap = new Map<string, number>();
  skillStates.forEach((s: any) => {
    // Total technical capability representation
    const avgScore = (s.knowledgeScore + s.practiceScore) / 2;
    userSkillMap.set(s.skillName.toLowerCase(), avgScore);
  });

  // 3. Determine required skills based on map
  let requiredSkills = CAREER_SKILLS_MAP[targetRole] || FALLBACK_SKILLS;

  // 4. Fetch market data from Arbeitnow API
  const cacheKey = targetRole.toLowerCase();
  const cached = marketCache.get(cacheKey);
  
  let rawJobs: any[] = [];
  let isFromCache = false;

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    rawJobs = cached.data;
    isFromCache = true;
  } else {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      // Query arbeitnow for jobs. It doesn't support complex querying easily,
      // so we fetch latest jobs and just analyze them, or search by role text if supported.
      const url = `https://arbeitnow.com/api/job-board-api?search=${encodeURIComponent(targetRole)}`;
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json() as any;
        rawJobs = json.data || [];
        marketCache.set(cacheKey, { timestamp: Date.now(), data: rawJobs });
      } else {
        console.warn(`Arbeitnow API returned status ${res.status}`);
      }
    } catch (e) {
      console.error("Failed to fetch market data:", e);
      // Fail gracefully: rawJobs remains empty
    }
  }

  // 5. Analyze the job descriptions for skill demand
  const skillFrequencies = new Map<string, number>();
  
  if (rawJobs.length > 0) {
    rawJobs.forEach((job: any) => {
      const textToSearch = (job.description + " " + job.title + " " + (job.tags ? job.tags.join(" ") : "")).toLowerCase();
      
      requiredSkills.forEach((reqSkill: any) => {
        const kw = reqSkill.skill.toLowerCase();
        if (textToSearch.includes(kw)) {
          skillFrequencies.set(kw, (skillFrequencies.get(kw) || 0) + 1);
        }
      });
    });
  }

  // 6. Build normalized skill comparisons
  const analyzedSkills: any[] = [];
  let highestGapSkill = "";
  let highestGapValue = -1;
  let highestDemandSkill = "";
  let highestDemandValue = -1;

  requiredSkills.forEach((reqSkill: any) => {
    const kw = reqSkill.skill.toLowerCase();
    const frequency = skillFrequencies.get(kw) || 0;
    
    // Normalize demand score (0 to 100) based on frequency relative to total jobs fetched
    // E.g., if a skill appears in 50% of the returned jobs, demand is 50.
    const rawPercentage = rawJobs.length > 0 ? (frequency / rawJobs.length) * 100 : 0;
    
    // Smooth the demand score
    let demandScore = Math.round(rawPercentage);
    
    if (rawJobs.length === 0) {
      // Fallback deterministic logic if API fails completely
      demandScore = reqSkill.critical ? 85 : 50;
    } else {
       // Cap or smooth if necessary
       if (demandScore > 100) demandScore = 100;
       if (reqSkill.critical && demandScore < 40) demandScore = 40; // baseline for critical skills
    }

    const learnerScore = Math.round(userSkillMap.get(kw) || 0);
    const gap = Math.max(0, demandScore - learnerScore);

    if (gap > highestGapValue) {
      highestGapValue = gap;
      highestGapSkill = reqSkill.skill;
    }

    if (demandScore > highestDemandValue) {
      highestDemandValue = demandScore;
      highestDemandSkill = reqSkill.skill;
    }

    analyzedSkills.push({
      name: reqSkill.skill,
      demandScore,
      learnerScore,
      importance: reqSkill.critical ? "high" : "medium",
      gap
    });
  });

  // Sort skills by gap descending
  analyzedSkills.sort((a, b) => b.gap - a.gap);

  // 7. Derive overall market demand level
  let demandLevel = "Unknown";
  let trend = "Stable";
  if (rawJobs.length > 0) {
    if (rawJobs.length >= 20) {
      demandLevel = "High";
      trend = "Growing";
    } else if (rawJobs.length >= 5) {
      demandLevel = "Medium";
      trend = "Stable";
    } else {
      demandLevel = "Low";
      trend = "Flat";
    }
  }

  // 8. Generate Actionable Insights
  const insights: string[] = [];
  if (highestDemandSkill) {
    insights.push(`${highestDemandSkill} appears frequently in current role requirements.`);
  }
  if (highestGapSkill && highestGapValue > 30) {
    insights.push(`${highestGapSkill} represents a meaningful skill gap compared to market expectations.`);
  }
  
  if (insights.length === 0) {
    insights.push("Your skill profile generally aligns well with baseline market expectations.");
  }

  // 9. Generate Recommendations
  const recommendations: string[] = [];
  if (highestGapSkill && highestGapValue > 30) {
    recommendations.push(`Prioritize ${highestGapSkill} in your Learning Path milestones.`);
    recommendations.push(`Build a project demonstrating your practical ability with ${highestGapSkill}.`);
  } else {
    recommendations.push(`Keep completing milestones to strengthen your core technical base.`);
  }

  return {
    targetRole,
    market: {
      demandLevel: rawJobs.length > 0 ? demandLevel : "Unknown",
      jobCount: rawJobs.length > 0 ? rawJobs.length : null, // Not a perfect global count, but represents recent listings
      trend: rawJobs.length > 0 ? trend : null,
      updatedAt: new Date().toISOString()
    },
    skills: analyzedSkills,
    insights,
    recommendations,
    source: {
      provider: rawJobs.length > 0 ? "Arbeitnow API" : "Deterministic Fallback",
      fetchedAt: new Date().toISOString(),
      cached: isFromCache
    }
  };
};
