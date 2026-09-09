import prisma from "../../../../lib/prisma.js";
import { ChatService } from "../../copilot/services/chat.service.js";

export interface CuratedResource {
  id: string;
  title: string;
  type: "DOCUMENTATION" | "TUTORIAL" | "COURSE" | "ARTICLE" | "PRACTICE";
  url: string;
  provider: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  isOfficial: boolean;
}

// Authoritative verified base resources map
export const AUTHORITATIVE_RESOURCE_CATALOG: Record<string, CuratedResource[]> = {
  "typescript": [
    {
      id: "ts-official-docs",
      title: "TypeScript Official Handbook",
      type: "DOCUMENTATION",
      url: "https://www.typescriptlang.org/docs/handbook/intro.html",
      provider: "TypeScript / Microsoft",
      description: "Comprehensive guide to TypeScript syntax, types, interfaces, and compiler configurations.",
      difficulty: "BEGINNER",
      isOfficial: true,
    },
    {
      id: "ts-deep-dive",
      title: "TypeScript Deep Dive",
      type: "TUTORIAL",
      url: "https://basarat.gitbook.io/typescript",
      provider: "Basarat",
      description: "In-depth guide covering advanced type gymnastics, generics, and architectural patterns.",
      difficulty: "INTERMEDIATE",
      isOfficial: false,
    }
  ],
  "javascript": [
    {
      id: "mdn-js-guide",
      title: "MDN Web Docs: JavaScript Guide",
      type: "DOCUMENTATION",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      provider: "Mozilla Developer Network",
      description: "The authoritative guide to JavaScript primitives, asynchronous programming, closures, and DOM.",
      difficulty: "BEGINNER",
      isOfficial: true,
    },
    {
      id: "javascript-info",
      title: "The Modern JavaScript Tutorial",
      type: "TUTORIAL",
      url: "https://javascript.info",
      provider: "javascript.info",
      description: "From fundamentals to advanced topics including event loops, prototypes, and microtasks.",
      difficulty: "BEGINNER",
      isOfficial: false,
    }
  ],
  "react": [
    {
      id: "react-dev-learn",
      title: "React Official Documentation: Quick Start & Hooks",
      type: "DOCUMENTATION",
      url: "https://react.dev/learn",
      provider: "React / Meta",
      description: "Modern React architecture with server components, hooks, state management, and lifecycle.",
      difficulty: "BEGINNER",
      isOfficial: true,
    }
  ],
  "next.js": [
    {
      id: "nextjs-official-docs",
      title: "Next.js App Router Documentation",
      type: "DOCUMENTATION",
      url: "https://nextjs.org/docs",
      provider: "Vercel",
      description: "Complete reference for Next.js App Router, Server Actions, middleware, and caching.",
      difficulty: "INTERMEDIATE",
      isOfficial: true,
    }
  ],
  "node.js": [
    {
      id: "nodejs-official-docs",
      title: "Node.js Official Documentation & Guides",
      type: "DOCUMENTATION",
      url: "https://nodejs.org/en/docs",
      provider: "OpenJS Foundation",
      description: "Authoritative reference for asynchronous I/O, event loop, streams, and core Node modules.",
      difficulty: "BEGINNER",
      isOfficial: true,
    }
  ],
  "node": [
    {
      id: "nodejs-official-docs-alt",
      title: "Node.js Official Documentation & Guides",
      type: "DOCUMENTATION",
      url: "https://nodejs.org/en/docs",
      provider: "OpenJS Foundation",
      description: "Authoritative reference for asynchronous I/O, event loop, streams, and core Node modules.",
      difficulty: "BEGINNER",
      isOfficial: true,
    }
  ],
  "express": [
    {
      id: "express-official-guide",
      title: "Express.js Getting Started & Routing Guide",
      type: "DOCUMENTATION",
      url: "https://expressjs.com/en/starter/installing.html",
      provider: "Express.js",
      description: "Official guide to routing, middleware, template engines, and RESTful service design.",
      difficulty: "BEGINNER",
      isOfficial: true,
    }
  ],
  "python": [
    {
      id: "python-official-tutorial",
      title: "Python Official Tutorial",
      type: "DOCUMENTATION",
      url: "https://docs.python.org/3/tutorial/index.html",
      provider: "Python Software Foundation",
      description: "Official guide to Python syntax, data structures, standard library, and OOP.",
      difficulty: "BEGINNER",
      isOfficial: true,
    }
  ],
  "pytorch": [
    {
      id: "pytorch-official-tutorials",
      title: "PyTorch Official Tutorials: Deep Learning with PyTorch",
      type: "TUTORIAL",
      url: "https://pytorch.org/tutorials/",
      provider: "PyTorch Foundation",
      description: "Hands-on tutorials for tensors, neural networks, autograd, and GPU acceleration.",
      difficulty: "INTERMEDIATE",
      isOfficial: true,
    }
  ],
  "postgresql": [
    {
      id: "pg-official-docs",
      title: "PostgreSQL Official Documentation",
      type: "DOCUMENTATION",
      url: "https://www.postgresql.org/docs/current/",
      provider: "PostgreSQL Global Development Group",
      description: "The definitive reference on relational schema design, indexes, transactions, and performance tuning.",
      difficulty: "INTERMEDIATE",
      isOfficial: true,
    }
  ],
  "sql": [
    {
      id: "sql-w3-tutorial",
      title: "PostgreSQL SQL Language Reference",
      type: "DOCUMENTATION",
      url: "https://www.postgresql.org/docs/current/sql.html",
      provider: "PostgreSQL Global Development Group",
      description: "Complete syntax and query optimization guide for SQL queries, joins, and aggregates.",
      difficulty: "BEGINNER",
      isOfficial: true,
    }
  ],
  "docker": [
    {
      id: "docker-official-docs",
      title: "Docker Get Started & Containerization Guide",
      type: "DOCUMENTATION",
      url: "https://docs.docker.com/get-started/",
      provider: "Docker Inc.",
      description: "Containerization fundamentals, Dockerfile best practices, and multi-stage builds.",
      difficulty: "BEGINNER",
      isOfficial: true,
    }
  ],
  "fastapi": [
    {
      id: "fastapi-official-docs",
      title: "FastAPI User Guide",
      type: "DOCUMENTATION",
      url: "https://fastapi.tiangolo.com/tutorial/",
      provider: "FastAPI",
      description: "Async web API development, Pydantic validation, dependency injection, and OpenAPI specs.",
      difficulty: "INTERMEDIATE",
      isOfficial: true,
    }
  ],
  "git": [
    {
      id: "git-book",
      title: "Pro Git Official Book",
      type: "DOCUMENTATION",
      url: "https://git-scm.com/book/en/v2",
      provider: "Git SCM",
      description: "Comprehensive guide to Git version control, branching workflows, and internal architecture.",
      difficulty: "BEGINNER",
      isOfficial: true,
    }
  ],
  "rest api": [
    {
      id: "rest-api-design-guide",
      title: "Microsoft REST API Guidelines",
      type: "DOCUMENTATION",
      url: "https://github.com/microsoft/api-guidelines",
      provider: "Microsoft",
      description: "Best practices for designing scalable, consistent, and secure RESTful HTTP APIs.",
      difficulty: "INTERMEDIATE",
      isOfficial: true,
    }
  ],
  "tailwind": [
    {
      id: "tailwind-official-docs",
      title: "Tailwind CSS Documentation",
      type: "DOCUMENTATION",
      url: "https://tailwindcss.com/docs",
      provider: "Tailwind Labs",
      description: "Utility-first CSS framework reference for rapid responsive UI development.",
      difficulty: "BEGINNER",
      isOfficial: true,
    }
  ]
};

export const isSafeUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const hostname = url.hostname.toLowerCase();
    
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.includes("[") // IPv6 format
    ) {
      return false;
    }

    // Block 172.16.0.0 - 172.31.255.255
    const parts = hostname.split(".");
    if (parts.length === 4 && parts[0] === "172") {
      const secondOctet = parseInt(parts[1] || "0", 10);
      if (secondOctet >= 16 && secondOctet <= 31) return false;
    }

    return true;
  } catch {
    return false;
  }
};

// In-memory cache for curated milestone resources: milestoneId -> { timestamp, resources }
const MAX_CACHE_ENTRIES = 500;
const resourceCache = new Map<string, { timestamp: number; resources: CuratedResource[] }>();
export const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export const clearResourceCache = () => {
  resourceCache.clear();
};

export const getResourceCacheEntry = (milestoneId: string) => {
  return resourceCache.get(milestoneId);
};

export const setResourceCacheEntry = (milestoneId: string, resources: CuratedResource[], timestamp = Date.now()) => {
  if (resourceCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = resourceCache.keys().next().value;
    if (oldestKey) resourceCache.delete(oldestKey);
  }
  resourceCache.set(milestoneId, { timestamp, resources });
};

export const getCuratedResourcesForMilestone = async (
  userId: string,
  milestoneId: string
): Promise<{ milestoneTitle: string; resources: CuratedResource[] }> => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: true }
  });

  if (!milestone) throw new Error("Milestone not found");
  if (milestone.roadmap.userId !== userId) throw new Error("Unauthorized");

  // Check cache first
  const cached = resourceCache.get(milestoneId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      milestoneTitle: milestone.title,
      resources: cached.resources
    };
  }

  const skillsCovered = milestone.unlocks || [];
  const profile = await prisma.careerProfile.findUnique({ where: { userId } });
  const experienceLevel = (profile?.experienceLevel || "BEGINNER") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

  const directMatchedResources: CuratedResource[] = [];
  const seenUrls = new Set<string>();

  // 1. Authoritative catalog lookup first
  for (const skill of skillsCovered) {
    const skillKey = skill.toLowerCase().trim();
    for (const [catKey, resList] of Object.entries(AUTHORITATIVE_RESOURCE_CATALOG)) {
      if (skillKey === catKey || skillKey.includes(catKey) || catKey.includes(skillKey)) {
        for (const res of resList) {
          if (!seenUrls.has(res.url) && isSafeUrl(res.url)) {
            seenUrls.add(res.url);
            directMatchedResources.push(res);
          }
        }
      }
    }
  }

  // If we already have authoritative catalog matches (>= 2), cache and return immediately without invoking AI
  if (directMatchedResources.length >= 2) {
    setResourceCacheEntry(milestoneId, directMatchedResources);
    return {
      milestoneTitle: milestone.title,
      resources: directMatchedResources
    };
  }

  // 2. Fallback: If catalog coverage is insufficient, use AI to curate validated authoritative resource titles & links
  const systemPrompt = `You are a Senior Technical Curriculum Architect for AI Pather.
For the given milestone and skills, output verified, authoritative learning resources (official documentation, reputable interactive tutorials, or reference guides).
Do NOT hallucinate fake URLs. Only use well-known, high-reputation domains (e.g. mdn, official docs, dev.to, github.com, official foundations).
Output valid JSON matching this schema:
{
  "resources": [
    {
      "title": "Resource title",
      "type": "DOCUMENTATION",
      "url": "https://...",
      "provider": "Provider name",
      "description": "Short description",
      "difficulty": "BEGINNER",
      "isOfficial": true
    }
  ]
}`;

  const userPrompt = `Milestone: ${milestone.title}
Description: ${milestone.description || "Core technical milestone"}
Skills Covered: ${skillsCovered.join(", ") || "Technical fundamentals"}
Learner Level: ${experienceLevel}

Curate up to 4 high-quality, verified learning resources.`;

  try {
    const aiResult = await ChatService.processJsonCompletion(systemPrompt, userPrompt);
    let raw = aiResult.reply || "";
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      const parsed = JSON.parse(raw.slice(start, end + 1));
      if (Array.isArray(parsed.resources)) {
        for (const r of parsed.resources) {
          if (r.url && typeof r.url === "string" && isSafeUrl(r.url) && !seenUrls.has(r.url)) {
            seenUrls.add(r.url);
            directMatchedResources.push({
              id: `res-${Math.random().toString(36).substring(2, 9)}`,
              title: r.title || "Curated Learning Guide",
              type: r.type || "DOCUMENTATION",
              url: r.url,
              provider: r.provider || "Official Documentation",
              description: r.description || "Authoritative reference material.",
              difficulty: r.difficulty || experienceLevel,
              isOfficial: !!r.isOfficial
            });
          }
        }
      }
    }
  } catch (err: any) {
    console.warn("AI resource curation fallback triggered:", err?.message || err);
  }

  // Fallback if still empty: Provide MDN Web Docs reference
  if (directMatchedResources.length === 0) {
    directMatchedResources.push({
      id: "mdn-default",
      title: "MDN Web Docs Reference Guide",
      type: "DOCUMENTATION",
      url: "https://developer.mozilla.org",
      provider: "Mozilla Developer Network",
      description: "Authoritative documentation for modern web and software development standards.",
      difficulty: "BEGINNER",
      isOfficial: true
    });
  }

  setResourceCacheEntry(milestoneId, directMatchedResources);

  return {
    milestoneTitle: milestone.title,
    resources: directMatchedResources
  };
};
