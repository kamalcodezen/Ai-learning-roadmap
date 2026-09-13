import prisma from "../../../lib/prisma.js";
import { getRequiredSkillsForRole } from "../career-alignment/services/career-skills.map.js";
import { isMatchingSkill } from "../assessments/services/skill-simulation.service.js";
import { ChatService } from "../copilot/services/chat.service.js";

// Cache for job listings & market analysis
interface CacheEntry {
  timestamp: number;
  rawJobs: any[];
  relevantJobs: any[];
  aiAnalysis: any | null;
}

const marketCache = new Map<string, CacheEntry>();
export const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const getCacheKey = (role: string, location?: string): string => {
  const normRole = (role || "").toLowerCase().trim();
  const normLoc = (location || "all").toLowerCase().trim();
  return `${normRole}:${normLoc}`;
};

export const clearMarketCache = () => {
  marketCache.clear();
};

export const getMarketCacheEntry = (role: string, location?: string) => {
  const key = getCacheKey(role, location);
  const entry = marketCache.get(key);
  if (entry) return entry;
  // Fallback for legacy key format (role only)
  return marketCache.get(role.toLowerCase().trim());
};

export const setMarketCacheEntry = (
  role: string,
  data: any,
  timestamp = Date.now(),
  location?: string
) => {
  const key = getCacheKey(role, location);
  const rawJobs = Array.isArray(data) ? data : data?.rawJobs || [];
  const relevantJobs = Array.isArray(data) ? data : data?.relevantJobs || rawJobs;
  const aiAnalysis = Array.isArray(data) ? null : data?.aiAnalysis || null;
  const entry: CacheEntry = { timestamp, rawJobs, relevantJobs, aiAnalysis };
  marketCache.set(key, entry);
  marketCache.set(role.toLowerCase().trim(), entry);
};

/**
 * Calculates market trend based on listing creation dates for RELEVANT listings only.
 * Requires at least 5 dated relevant listings to compute velocity.
 */
export function calculateMarketTrend(relevantJobs: any[]): "Growing" | "Stable" | "Declining" | "Insufficient Data" {
  if (!relevantJobs || relevantJobs.length < 5) {
    return "Insufficient Data";
  }

  const timestamps = relevantJobs
    .map((j) => {
      if (!j.created_at) return null;
      if (typeof j.created_at === "number") {
        return j.created_at > 1e11 ? j.created_at : j.created_at * 1000;
      }
      const parsed = Date.parse(j.created_at);
      return isNaN(parsed) ? null : parsed;
    })
    .filter((t): t is number => t !== null);

  if (timestamps.length < 5) {
    return "Insufficient Data";
  }

  timestamps.sort((a, b) => a - b);
  const minTime = timestamps[0]!;
  const maxTime = timestamps[timestamps.length - 1]!;
  const timeSpan = maxTime - minTime;

  // Need at least 1 day time span to evaluate trend reliably
  if (timeSpan < 24 * 60 * 60 * 1000) {
    return "Insufficient Data";
  }

  const midpoint = minTime + timeSpan / 2;
  const olderCount = timestamps.filter((t) => t < midpoint).length;
  const newerCount = timestamps.filter((t) => t >= midpoint).length;

  if (olderCount === 0) return "Insufficient Data";

  const velocityRatio = newerCount / olderCount;
  if (velocityRatio >= 1.25) return "Growing";
  if (velocityRatio <= 0.75) return "Declining";
  return "Stable";
}

/**
 * Cleans HTML tags and trims description text for AI prompt efficiency.
 */
function sanitizeDescription(desc: string): string {
  if (!desc) return "";
  return desc
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
}

/**
 * Backward-compatible title relevance helper.
 */
export function isTitleRelevantToRole(title: string, targetRole: string): boolean {
  return isListingRelevantToRole({ title }, targetRole);
}

/**
 * Dynamic role-relevance classifier for job listings.
 * Evaluates job title, description, and target role context.
 * Excludes explicitly unrelated domains (XR, Game Dev, Industrial Automation)
 * and generic skill overlaps (Python-only) that lack target role context.
 */
export function isListingRelevantToRole(job: any, targetRole: string): boolean {
  if (!job || !targetRole) return false;
  const title = String(job.title || "").toLowerCase();
  const desc = String(job.description || "").toLowerCase();
  const tags = Array.isArray(job.tags) ? job.tags.join(" ").toLowerCase() : "";
  const fullText = `${title} ${tags} ${desc}`;
  const roleLower = targetRole.toLowerCase().trim();

  // 1. Explicitly irrelevant titles / domains
  const irrelevantTerms = [
    "xr", "extended reality", "game developer", "game dev", "gaming", "3d animator", "3d graphics",
    "unity developer", "unreal engine", "ar/vr", "industrial automation", "plc programmer",
    "embedded firmware", "robotics engineer", "cad designer", "hardware engineer"
  ];
  if (irrelevantTerms.some((term) => title.includes(term))) {
    return false;
  }

  // 2. Direct title match or target role substring in title
  if (title.includes(roleLower) || roleLower.includes(title)) {
    return true;
  }

  // 3. Dynamic role family matching
  if (roleLower.includes("cloud")) {
    const cloudKeywords = [
      "cloud", "infrastructure", "devops", "platform", "sre", "site reliability",
      "aws", "kubernetes", "k8s", "azure", "gcp", "terraform"
    ];
    const titleMatch = ["cloud", "infrastructure", "devops", "platform", "sre", "site reliability", "systems engineer"].some((kw) => title.includes(kw));
    if (titleMatch) return true;
    const mentions = cloudKeywords.filter((kw) => fullText.includes(kw)).length;
    return mentions >= 2;
  }

  if (roleLower.includes("backend") || roleLower.includes("server")) {
    const backendKeywords = ["backend", "back end", "server", "api", "node", "python", "java", "golang", "go", "postgres", "sql", "microservices"];
    const titleMatch = ["backend", "back end", "server", "api", "node", "python", "java", "golang", "microservices"].some((kw) => title.includes(kw));
    if (titleMatch) return true;
    const mentions = backendKeywords.filter((kw) => fullText.includes(kw)).length;
    return mentions >= 2;
  }

  if (roleLower.includes("frontend") || roleLower.includes("ui")) {
    const frontendKeywords = ["frontend", "front end", "react", "vue", "angular", "ui", "web developer", "typescript", "javascript", "css", "html"];
    const titleMatch = ["frontend", "front end", "react", "vue", "angular", "ui", "web developer"].some((kw) => title.includes(kw));
    if (titleMatch) return true;
    const mentions = frontendKeywords.filter((kw) => fullText.includes(kw)).length;
    return mentions >= 2;
  }

  if (roleLower.includes("devops") || roleLower.includes("sre")) {
    const devopsKeywords = ["devops", "cloud", "infrastructure", "sre", "platform", "ci/cd", "kubernetes", "docker", "terraform"];
    const titleMatch = ["devops", "cloud", "infrastructure", "sre", "platform", "ci/cd"].some((kw) => title.includes(kw));
    if (titleMatch) return true;
    const mentions = devopsKeywords.filter((kw) => fullText.includes(kw)).length;
    return mentions >= 2;
  }

  if (roleLower.includes("data eng")) {
    const dataKeywords = ["data engineer", "etl", "spark", "hadoop", "data warehouse", "airflow", "databricks", "sql"];
    const titleMatch = ["data engineer", "etl", "data warehouse"].some((kw) => title.includes(kw));
    if (titleMatch) return true;
    const mentions = dataKeywords.filter((kw) => fullText.includes(kw)).length;
    return mentions >= 2;
  }

  // Generic fallback: check if title contains non-generic words from targetRole
  const roleWords = roleLower.split(/\s+/).filter((w) => w.length > 3 && w !== "developer" && w !== "engineer");
  if (roleWords.length > 0 && roleWords.some((w) => title.includes(w))) {
    return true;
  }

  if (title.includes("software engineer") || title.includes("software developer")) {
    return true;
  }

  return false;
}

/**
 * Main Job Reality analysis service.
 * Fetches real job listings, applies AI dynamic role relevance classification,
 * filters relevant listings, calculates backend verified evidence metrics against relevant listings ONLY,
 * and compares against learner's verified SkillState without mutating DB records.
 */
export const getLearnerJobReality = async (userId: string, locationFilter?: string) => {
  // 1. Fetch user's profile and target role
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  const targetRole = profile?.targetRoleName || profile?.targetRole;

  if (!targetRole) {
    throw new Error("No target role defined. Please complete onboarding.");
  }

  // 2. Fetch user's current skills (SkillState)
  const skillStates = await prisma.skillState.findMany({
    where: { userId },
  });

  const userSkillMap = new Map<string, number>();
  skillStates.forEach((s: any) => {
    const compositeScore =
      s.projectScore > 0 || s.practiceScore > 0
        ? Math.round(s.knowledgeScore * 0.4 + s.practiceScore * 0.3 + s.projectScore * 0.3)
        : Math.round(s.knowledgeScore);
    userSkillMap.set(s.skillName.toLowerCase(), compositeScore);
  });

  // Baseline skills for target role from static map
  const baselineSkills = getRequiredSkillsForRole(targetRole);

  // 3. Check Cache
  const cacheKey = getCacheKey(targetRole, locationFilter);
  const cached = marketCache.get(cacheKey) || marketCache.get(targetRole.toLowerCase().trim());

  let rawJobs: any[] = [];
  let relevantJobs: any[] = [];
  let isFromCache = false;
  let cachedAiAnalysis: any = null;
  let fetchTimestamp = Date.now();

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    rawJobs = cached.rawJobs || [];
    relevantJobs = cached.relevantJobs || rawJobs;
    cachedAiAnalysis = cached.aiAnalysis || null;
    isFromCache = true;
    fetchTimestamp = cached.timestamp;
  } else {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const sanitizedQuery = encodeURIComponent(targetRole.trim());
      const url = `https://arbeitnow.com/api/job-board-api?search=${sanitizedQuery}`;

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = (await res.json()) as any;
        rawJobs = json.data || [];
      } else {
        console.warn(`Arbeitnow API returned status ${res.status}`);
      }
    } catch (e) {
      console.warn("Failed to fetch market data from Arbeitnow API:", e);
      rawJobs = [];
    }
  }

  // Ensure each raw job has a string ID for robust AI ID mapping
  rawJobs = rawJobs.map((job: any, index: number) => ({
    ...job,
    id: job.id !== undefined && job.id !== null ? String(job.id) : String(job.slug || index + 1),
    numericIndex: index + 1,
  }));

  // Apply location filter if requested
  if (locationFilter && locationFilter !== "all" && rawJobs.length > 0) {
    const locLower = locationFilter.toLowerCase().trim();
    rawJobs = rawJobs.filter((job: any) => {
      const titleLower = String(job.title || "").toLowerCase();
      const locString = String(job.location || "").toLowerCase();
      if (locLower === "remote") {
        return job.remote === true || titleLower.includes("remote") || locString.includes("remote");
      }
      return locString.includes(locLower) || (job.remote === true && locLower === "remote");
    });
  }

  const rawFetchedCount = rawJobs.length;

  // Handle 0 Raw Jobs Returned
  if (rawFetchedCount === 0) {
    if (!isFromCache) {
      setMarketCacheEntry(targetRole, { rawJobs: [], relevantJobs: [], aiAnalysis: null }, fetchTimestamp, locationFilter);
    }

    return {
      targetRole,
      selectedLocation: locationFilter || "all",
      market: {
        demandLevel: "Insufficient Data",
        jobCount: 0,
        rawFetchedCount: 0,
        relevantCount: 0,
        trend: "Insufficient Data",
        updatedAt: new Date(fetchTimestamp).toISOString(),
        sampleStatus: "No data",
        lowSampleSize: true,
      },
      skills: [],
      aiAnalysis: {
        available: false,
        roleSummary: `No market job listings found for "${targetRole}" with location "${locationFilter || "all"}".`,
        recurringExpectations: [],
        commonTools: [],
        experienceExpectations: [],
      },
      insights: [
        `No live job listings were returned by the market provider for ${targetRole} in the selected location.`,
        "Try removing location filters or updating your target role in profile settings.",
      ],
      recommendations: [
        {
          text: "Select 'All Locations' filter to view broader market demand.",
          actionType: "GENERAL",
          href: undefined,
        },
        {
          text: "Continue working on your Learning Path milestones while market data refreshes.",
          actionType: "LEARNING_PATH",
          href: "/dashboard/learner/learning-path",
        },
      ],
      source: {
        provider: "Arbeitnow API",
        fetchedAt: new Date(fetchTimestamp).toISOString(),
        location: locationFilter || "all",
        cached: isFromCache,
        isFallback: false,
        noData: true,
      },
    };
  }

  // 4. AI ROLE RELEVANCE CLASSIFICATION & SKILL EXTRACTION (SINGLE BATCHED CALL)
  let aiExtractedSkills: Array<{ name: string; category?: string; importance?: "high" | "medium" | "low" }> = [];
  let aiRoleSummary: string | undefined;
  let aiRecurringExpectations: string[] = [];
  let aiCommonTools: string[] = [];
  let aiExperienceExpectations: string[] = [];
  let aiInsights: string[] = [];
  let aiAnalysisAvailable = false;

  // Map to store normalized AI classification per job ID
  const classifiedListingsMap = new Map<string, "HIGHLY_RELEVANT" | "RELEVANT" | "WEAKLY_RELEVANT" | "IRRELEVANT">();

  if (cachedAiAnalysis && isFromCache) {
    aiExtractedSkills = cachedAiAnalysis.extractedSkills || [];
    aiRoleSummary = cachedAiAnalysis.roleSummary;
    aiRecurringExpectations = cachedAiAnalysis.recurringExpectations || [];
    aiCommonTools = cachedAiAnalysis.commonTools || [];
    aiExperienceExpectations = cachedAiAnalysis.experienceExpectations || [];
    aiInsights = cachedAiAnalysis.insights || [];
    aiAnalysisAvailable = true;
    relevantJobs = cached?.relevantJobs || rawJobs;
  } else {
    try {
      // Prepare batch of up to 12 job listings for AI classification and extraction
      const batchListings = rawJobs.slice(0, 12).map((job: any) => ({
        id: job.id,
        index: job.numericIndex,
        title: job.title || "Job Listing",
        company: job.company_name || job.company || "Company",
        location: job.location || "Unspecified",
        description: sanitizeDescription(job.description),
        tags: Array.isArray(job.tags) ? job.tags.slice(0, 5) : [],
      }));

      const systemInstruction = `You are a Principal Technical Recruiter & Market Intelligence Analyst.
Analyze the provided job listings specifically for candidate target role "${targetRole}".

Task:
1. Classify each job listing's relevance to target role "${targetRole}".
   Allowed relevance values: "HIGHLY_RELEVANT", "RELEVANT", "WEAKLY_RELEVANT", "IRRELEVANT".
   RELEVANCE GUIDELINES:
   - For target role "${targetRole}", listings with titles like Cloud Infrastructure Engineer, Cloud Platform Engineer, DevOps Engineer, Site Reliability Engineer (SRE), Platform Engineer, or Infrastructure Engineer ARE RELEVANT when their actual description focuses on cloud/infrastructure/container/CI-CD duties.
   - Unrelated titles such as XR Game Developer, 3D Animator, Industrial Automation Engineer, Embedded Firmware, or Hardware Engineer ARE IRRELEVANT.
   - Generic skill overlap alone (e.g., a Game Developer job mentioning Python or Git) is NOT enough to classify a listing as relevant.
2. Extract top technical skills, tools, and expectations ONLY from job listings classified as "HIGHLY_RELEVANT" or "RELEVANT". Completely ignore IRRELEVANT and WEAKLY_RELEVANT listings for skill extraction.

Return ONLY valid JSON matching this exact schema:
{
  "classifiedListings": [
    { "id": "1", "relevance": "HIGHLY_RELEVANT", "reason": "Direct Cloud Infrastructure Engineer role" },
    { "id": "2", "relevance": "IRRELEVANT", "reason": "XR Game Developer position focusing on 3D game engines" }
  ],
  "extractedSkills": [
    { "name": "Docker", "category": "technical", "importance": "high" }
  ],
  "roleSummary": "Employers seeking Cloud Engineers strongly emphasize containerization, cloud infrastructure, and CI/CD automation.",
  "recurringExpectations": ["Production microservices experience", "Infrastructure as Code"],
  "commonTools": ["Docker", "Kubernetes", "AWS", "Git"],
  "experienceExpectations": ["3+ years container management", "Cloud environment setup"],
  "insights": [
    "Containerization tools (Docker/Kubernetes) appear in the majority of relevant listings."
  ]
}`;

      const userPrompt = `Target Role: "${targetRole}"
Job Listings Batch (${batchListings.length} listings):
${JSON.stringify(batchListings, null, 2)}`;

      const aiRes = await ChatService.processJsonCompletion(systemInstruction, userPrompt, 12000);
      let rawJson = (aiRes.reply || "").trim();
      const firstBrace = rawJson.indexOf("{");
      const lastBrace = rawJson.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        rawJson = rawJson.slice(firstBrace, lastBrace + 1);
      }
      const parsedAi = JSON.parse(rawJson);

      if (parsedAi && Array.isArray(parsedAi.classifiedListings)) {
        parsedAi.classifiedListings.forEach((item: any) => {
          if (item) {
            const rawId = item.id !== undefined ? item.id : (item.listingId !== undefined ? item.listingId : item.index);
            if (rawId !== undefined && rawId !== null) {
              const key = String(rawId).trim();
              const relStr = String(item.relevance || item.classification || "").toUpperCase().replace(/[\s-]/g, "_");
              let enumVal: "HIGHLY_RELEVANT" | "RELEVANT" | "WEAKLY_RELEVANT" | "IRRELEVANT" = "IRRELEVANT";
              if (relStr.includes("HIGHLY")) enumVal = "HIGHLY_RELEVANT";
              else if (relStr === "RELEVANT") enumVal = "RELEVANT";
              else if (relStr.includes("WEAK")) enumVal = "WEAKLY_RELEVANT";
              else enumVal = "IRRELEVANT";

              classifiedListingsMap.set(key, enumVal);
            }
          }
        });
      }

      // Filter rawJobs using hybrid classification: AI classification if present, fallback matcher otherwise
      relevantJobs = rawJobs.filter((job: any) => {
        const keyId = String(job.id).trim();
        const keyIndex = String(job.numericIndex).trim();

        const aiRel = classifiedListingsMap.get(keyId) || classifiedListingsMap.get(keyIndex);
        if (aiRel) {
          return aiRel === "HIGHLY_RELEVANT" || aiRel === "RELEVANT";
        }
        // Fallback for listings not in AI batch or omitted AI ID
        return isListingRelevantToRole(job, targetRole);
      });

      if (parsedAi && Array.isArray(parsedAi.extractedSkills)) {
        aiExtractedSkills = parsedAi.extractedSkills;
        aiRoleSummary = parsedAi.roleSummary;
        aiRecurringExpectations = parsedAi.recurringExpectations || [];
        aiCommonTools = parsedAi.commonTools || [];
        aiExperienceExpectations = parsedAi.experienceExpectations || [];
        aiInsights = parsedAi.insights || [];
        aiAnalysisAvailable = true;
      }
    } catch (err: any) {
      console.warn("[Job Reality AI Relevance Classification Failed - using fallback title matcher]:", err.message);
      aiAnalysisAvailable = false;
      // Fallback relevance filtering using semantic title/description matcher
      relevantJobs = rawJobs.filter((job: any) => isListingRelevantToRole(job, targetRole));
    }
  }

  const totalRelevantCount = relevantJobs.length;

  // Update Cache
  if (!isFromCache) {
    setMarketCacheEntry(
      targetRole,
      {
        rawJobs,
        relevantJobs,
        aiAnalysis: aiAnalysisAvailable
          ? {
              extractedSkills: aiExtractedSkills,
              roleSummary: aiRoleSummary,
              recurringExpectations: aiRecurringExpectations,
              commonTools: aiCommonTools,
              experienceExpectations: aiExperienceExpectations,
              insights: aiInsights,
            }
          : null,
      },
      fetchTimestamp,
      locationFilter
    );
  }

  // 5. HANDLE 0 RELEVANT JOBS (CASE B: Provider returned jobs but none are relevant)
  if (totalRelevantCount === 0) {
    return {
      targetRole,
      selectedLocation: locationFilter || "all",
      market: {
        demandLevel: "Insufficient Data",
        jobCount: 0,
        rawFetchedCount,
        relevantCount: 0,
        trend: "Insufficient Data",
        updatedAt: new Date(fetchTimestamp).toISOString(),
        sampleStatus: "No data",
        lowSampleSize: true,
      },
      skills: [],
      aiAnalysis: {
        available: aiAnalysisAvailable,
        roleSummary: `No sufficiently relevant market job listings were found for "${targetRole}".`,
        recurringExpectations: [],
        commonTools: [],
        experienceExpectations: [],
      },
      insights: [
        `No sufficiently relevant job listings were found for ${targetRole} among the ${rawFetchedCount} fetched market results.`,
        "Try removing location filters or refining your target role in profile settings.",
      ],
      recommendations: [
        {
          text: "Select 'All Locations' filter to view broader market demand.",
          actionType: "GENERAL",
          href: undefined,
        },
        {
          text: "Continue working on your Learning Path milestones.",
          actionType: "LEARNING_PATH",
          href: "/dashboard/learner/learning-path",
        },
      ],
      source: {
        provider: "Arbeitnow API",
        fetchedAt: new Date(fetchTimestamp).toISOString(),
        location: locationFilter || "all",
        cached: isFromCache,
        isFallback: false,
        noData: true,
      },
    };
  }

  // Sample status for relevant jobs
  const lowSampleSize = totalRelevantCount < 5;
  const sampleStatus = lowSampleSize
    ? `Limited market sample (${totalRelevantCount} relevant listings)`
    : "Representative";

  // Calculate Trend using ONLY RELEVANT listings
  const trend = calculateMarketTrend(relevantJobs);

  // Derive Market Demand Level using ONLY RELEVANT listings count
  let demandLevel: "High" | "Medium" | "Low" | "Insufficient Data" = "Low";
  if (totalRelevantCount >= 15) demandLevel = "High";
  else if (totalRelevantCount >= 5) demandLevel = "Medium";
  else demandLevel = "Low";

  // 6. PROGRAMMATIC RECALCULATION & DENOMINATOR PROTECTION
  // Build candidate skills set combining baseline role skills and AI extracted skills
  const candidateSkillsMap = new Map<string, { name: string; importance: "high" | "medium" | "low" }>();

  // Add baseline skills first
  baselineSkills.forEach((bs) => {
    candidateSkillsMap.set(bs.skill.toLowerCase(), {
      name: bs.skill,
      importance: bs.critical ? "high" : "medium",
    });
  });

  // Merge AI extracted skills (from relevant listings only)
  aiExtractedSkills.forEach((aiSkill) => {
    if (!aiSkill || !aiSkill.name) return;
    const cleanName = aiSkill.name.trim();
    const key = cleanName.toLowerCase();

    // Check if matching skill already exists in candidate map
    let existingKey: string | null = null;
    for (const k of candidateSkillsMap.keys()) {
      if (isMatchingSkill(k, key)) {
        existingKey = k;
        break;
      }
    }

    if (existingKey) {
      const existing = candidateSkillsMap.get(existingKey)!;
      if (aiSkill.importance === "high") existing.importance = "high";
    } else {
      candidateSkillsMap.set(key, {
        name: cleanName,
        importance: aiSkill.importance || "medium",
      });
    }
  });

  // Count exact occurrences across RELEVANT JOBS ONLY using totalRelevantCount as denominator
  const analyzedSkills: Array<{
    name: string;
    normalizedName: string;
    jobsMentioning: number;
    totalJobs: number;
    demandScore: number; // percentage
    learnerScore: number;
    gap: number;
    importance: "high" | "medium" | "low";
    status: "Ready" | "Critical Gap" | "High Gap" | "Moderate Gap";
  }> = [];

  let highestGapSkill = "";
  let highestGapValue = -1;
  let highestDemandSkill = "";
  let highestDemandValue = -1;

  for (const skillObj of candidateSkillsMap.values()) {
    const skillName = skillObj.name;
    const kw = skillName.toLowerCase();

    // Count occurrences ONLY in relevantJobs
    let jobsMentioning = 0;
    relevantJobs.forEach((job: any) => {
      const textToSearch = `${job.description || ""} ${job.title || ""} ${(job.tags || []).join(" ")}`.toLowerCase();

      if (
        textToSearch.includes(kw) ||
        isMatchingSkillInText(textToSearch, skillName)
      ) {
        jobsMentioning++;
      }
    });

    // Exclude zero-mention AI skills that are not baseline skills
    const isBaseline = baselineSkills.some((bs) => isMatchingSkill(bs.skill, skillName));
    if (jobsMentioning === 0 && !isBaseline) {
      continue;
    }

    // Programmatically calculate exact market demand percentage using totalRelevantCount
    const demandScore = Math.round((jobsMentioning / totalRelevantCount) * 100);

    // Retrieve user score from SkillState without mutating DB
    const matchingState = skillStates.find((s: any) => isMatchingSkill(s.skillName, skillName));
    const learnerScore = matchingState
      ? matchingState.projectScore > 0 || matchingState.practiceScore > 0
        ? Math.round(matchingState.knowledgeScore * 0.4 + matchingState.practiceScore * 0.3 + matchingState.projectScore * 0.3)
        : Math.round(matchingState.knowledgeScore)
      : 0;

    const gap = Math.max(0, demandScore - learnerScore);

    if (gap > highestGapValue) {
      highestGapValue = gap;
      highestGapSkill = skillName;
    }

    if (demandScore > highestDemandValue) {
      highestDemandValue = demandScore;
      highestDemandSkill = skillName;
    }

    let status: "Ready" | "Critical Gap" | "High Gap" | "Moderate Gap" = "Ready";
    if (learnerScore >= demandScore || gap === 0) {
      status = "Ready";
    } else if (gap > 40 && skillObj.importance === "high") {
      status = "Critical Gap";
    } else if (gap > 20) {
      status = "High Gap";
    } else {
      status = "Moderate Gap";
    }

    analyzedSkills.push({
      name: skillName,
      normalizedName: skillName,
      jobsMentioning,
      totalJobs: totalRelevantCount,
      demandScore,
      learnerScore,
      gap,
      importance: skillObj.importance,
      status,
    });
  }

  // Sort skills by gap descending, then demandScore descending
  analyzedSkills.sort((a, b) => b.gap - a.gap || b.demandScore - a.demandScore);

  // 7. Grounded Insights & Recommendations
  const insights: string[] = [];

  if (highestDemandSkill && highestDemandValue > 0) {
    const topSkillObj = analyzedSkills.find((s) => s.name === highestDemandSkill);
    const mentions = topSkillObj ? topSkillObj.jobsMentioning : 0;
    insights.push(
      `"${highestDemandSkill}" is requested in ${mentions} out of ${totalRelevantCount} relevant listings (${highestDemandValue}% market demand).`
    );
  }

  if (highestGapSkill && highestGapValue > 25) {
    insights.push(
      `Your verified score for "${highestGapSkill}" is low compared to relevant market demand (${highestGapValue}% gap).`
    );
  }

  if (aiAnalysisAvailable && aiInsights.length > 0) {
    aiInsights.forEach((insight) => {
      if (!insights.includes(insight) && insights.length < 4) {
        insights.push(insight);
      }
    });
  }

  if (insights.length === 0) {
    insights.push("Your verified skills match baseline market expectations for this target role.");
  }

  // Build Personalized Recommended Actions
  const recommendations: Array<{
    text: string;
    actionType: "LEARNING_PATH" | "GENERATE_PROJECT" | "SIMULATION" | "GENERAL";
    targetSkill?: string;
    href?: string;
  }> = [];

  if (highestGapSkill && highestGapValue > 20) {
    recommendations.push({
      text: `Prioritize ${highestGapSkill} in your Learning Path milestones`,
      actionType: "LEARNING_PATH",
      targetSkill: highestGapSkill,
      href: "/dashboard/learner/learning-path",
    });
    recommendations.push({
      text: `Build a project demonstrating your practical ability with ${highestGapSkill}`,
      actionType: "GENERATE_PROJECT",
      targetSkill: highestGapSkill,
      href: "/dashboard/learner/portfolio",
    });
  } else {
    recommendations.push({
      text: "Continue completing Learning Path milestones to maintain market readiness",
      actionType: "LEARNING_PATH",
      href: "/dashboard/learner/learning-path",
    });
  }

  return {
    targetRole,
    selectedLocation: locationFilter || "all",
    market: {
      demandLevel,
      jobCount: totalRelevantCount,
      rawFetchedCount,
      relevantCount: totalRelevantCount,
      trend,
      updatedAt: new Date(fetchTimestamp).toISOString(),
      sampleStatus,
      lowSampleSize,
    },
    skills: analyzedSkills,
    aiAnalysis: {
      available: aiAnalysisAvailable,
      roleSummary: aiRoleSummary || `Real-market requirement analysis for ${targetRole}.`,
      recurringExpectations: aiRecurringExpectations,
      commonTools: aiCommonTools,
      experienceExpectations: aiExperienceExpectations,
    },
    insights,
    recommendations,
    source: {
      provider: "Arbeitnow API",
      fetchedAt: new Date(fetchTimestamp).toISOString(),
      location: locationFilter || "all",
      cached: isFromCache,
      isFallback: false,
    },
  };
};

/**
 * Helper to check if text contains matching variations for common tech skills.
 */
function isMatchingSkillInText(text: string, skillName: string): boolean {
  const norm = skillName.toLowerCase().trim();
  if (text.includes(norm)) return true;

  if (norm === "docker") return text.includes("container") || text.includes("docker");
  if (norm === "kubernetes") return text.includes("k8s") || text.includes("kubernetes");
  if (norm === "aws" || norm === "aws / cloud") return text.includes("aws") || text.includes("amazon web services");
  if (norm === "ci/cd") return text.includes("ci/cd") || text.includes("continuous integration") || text.includes("jenkins");
  if (norm === "node.js" || norm === "node") return text.includes("node") || text.includes("nodejs");
  if (norm === "typescript") return text.includes("ts") || text.includes("typescript");
  if (norm === "react") return text.includes("react.js") || text.includes("reactjs") || text.includes("react");
  if (norm === "postgresql") return text.includes("postgres") || text.includes("postgresql");
  if (norm === "sql") return text.includes("sql") || text.includes("relational database");

  return false;
}
