import prisma from "../../../../lib/prisma.js";
import {
  generateResumeFromLearnerProfile,
  scanResumeAtsCompatibility,
  rewriteResumeBullet,
  matchJobDescription,
} from "./resume-ai.service.js";
import type {
  GeneratedResumeData,
  AtsScanResult,
} from "./resume-ai.service.js";

/**
 * Fetch or initialize the user's resume
 */
export const getLearnerResume = async (userId: string) => {
  const [existingResume, profile, userRecord, userSkills, userProjects] = await Promise.all([
    prisma.resume.findUnique({
      where: { userId },
    }),
    prisma.careerProfile.findUnique({
      where: { userId },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    prisma.skillState.findMany({
      where: { userId },
      select: { skillName: true },
      take: 25,
    }),
    prisma.project.findMany({
      where: { userId },
      select: {
        title: true,
        description: true,
        specification: true,
        repositoryUrl: true,
        liveUrl: true,
      },
      take: 5,
    }),
  ]);

  const fullName = userRecord?.name && userRecord.name.trim().length > 0 ? userRecord.name : "Candidate Name";
  const email = userRecord?.email && userRecord.email.trim().length > 0 ? userRecord.email : "candidate@example.com";
  const targetRole = profile?.targetRoleName || profile?.targetRole || "Software Engineer";

  if (existingResume) {
    // If existing resume has generic placeholder name or email, update with real user account info
    if ((existingResume.fullName === "Candidate Name" || existingResume.fullName === "Candidate") && userRecord?.name) {
      existingResume.fullName = userRecord.name;
    }
    if (existingResume.email === "candidate@example.com" && userRecord?.email) {
      existingResume.email = userRecord.email;
    }
    return existingResume;
  }

  // If no resume exists yet, initialize directly from real learner profile, skills & projects
  const skillNames = userSkills.map((s) => s.skillName).filter(Boolean);
  const initialSkills = skillNames.length > 0
    ? [
        {
          category: "Languages & Core Technologies",
          items: skillNames.slice(0, Math.ceil(skillNames.length / 2)),
        },
        {
          category: "Frameworks, Databases & Tools",
          items: skillNames.slice(Math.ceil(skillNames.length / 2)),
        },
      ]
    : [
        { category: "Languages & Frameworks", items: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js"] },
        { category: "Databases & Tools", items: ["PostgreSQL", "Redis", "Docker", "Git", "REST APIs"] },
      ];

  const initialProjects = userProjects.length > 0
    ? userProjects.map((p) => {
        const spec = (p.specification as any) || {};
        const techStack = Array.isArray(spec.techStack)
          ? spec.techStack
          : Array.isArray(spec.stack)
          ? spec.stack
          : [];
        return {
          title: p.title || "Engineering Project",
          description: p.description || "Scalable full-stack application built with modern architecture.",
          techStack: techStack.length > 0 ? techStack : ["TypeScript", "React", "PostgreSQL"],
          githubUrl: p.repositoryUrl || null,
          liveUrl: p.liveUrl || null,
          bullets: [
            `Architected core full-stack features for ${p.title || "the platform"} with emphasis on performance and clean code.`,
            `Integrated resilient database models and optimized API response throughput.`,
          ],
        };
      })
    : [
        {
          title: "Cloud-Native Platform",
          description: "Full-stack scalable web platform with secure authentication.",
          techStack: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
          bullets: [
            "Built modular UI components and resilient backend API routes.",
            "Implemented database migrations and optimized query indexing for high performance.",
          ],
        },
      ];

  return {
    id: "draft",
    userId,
    targetRole,
    fullName,
    email,
    phone: "+1 (555) 019-2834",
    location: "Remote / Open to Relocation",
    website: "https://portfolio.dev",
    github: `https://github.com/${fullName.toLowerCase().replace(/\s+/g, "")}`,
    linkedin: `https://linkedin.com/in/${fullName.toLowerCase().replace(/\s+/g, "")}`,
    summary: `Motivated ${targetRole} with strong foundational engineering skills and hands-on experience building scalable applications.`,
    skills: initialSkills,
    experience: [
      {
        company: "Engineering Lab",
        role: targetRole,
        duration: "2023 - Present",
        location: "Remote",
        bullets: [
          `Developed and optimized full-stack ${targetRole} web features using modern architecture.`,
          "Designed database schemas and implemented caching to reduce response latency by 35%.",
        ],
      },
    ],
    projects: initialProjects,
    education: [
      {
        institution: "University of Technology",
        degree: "B.S. in Computer Science",
        year: "2020 - 2024",
      },
    ],
    certifications: [],
    atsScore: 78,
    atsFeedback: {
      score: 78,
      breakdown: { formatting: 90, keywords: 75, impactMetrics: 72, relevance: 75 },
      strengths: ["Clean section hierarchy", "Clear skill categorization"],
      missingKeywords: ["CI/CD", "Docker", "Unit Testing"],
      suggestions: ["Add more quantitative metrics to your experience bullets."],
    },
  };
};

/**
 * Save / Update user's resume and synchronize ATS score
 */
export const saveLearnerResume = async (
  userId: string,
  resumeData: Partial<GeneratedResumeData> & { atsScore?: number; atsFeedback?: any }
) => {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  const targetRole = resumeData.targetRole || profile?.targetRoleName || profile?.targetRole || "Software Engineer";

  // Scan for ATS score if not provided
  let atsScore = resumeData.atsScore;
  let atsFeedback = resumeData.atsFeedback;

  if (atsScore === undefined || !atsFeedback) {
    const scan = await scanResumeAtsCompatibility(resumeData as GeneratedResumeData, targetRole);
    atsScore = scan.score;
    atsFeedback = scan;
  }

  const fullName = resumeData.fullName || "Candidate Name";
  const email = resumeData.email || "candidate@example.com";
  const summary = resumeData.summary || "";
  const phone = resumeData.phone ?? null;
  const location = resumeData.location ?? null;
  const website = resumeData.website ?? null;
  const github = resumeData.github ?? null;
  const linkedin = resumeData.linkedin ?? null;
  const skills = (resumeData.skills as any) || [];
  const experience = (resumeData.experience as any) || [];
  const projects = (resumeData.projects as any) || [];
  const education = (resumeData.education as any) || [];
  const certifications = (resumeData.certifications as any) || [];

  const savedResume = await prisma.resume.upsert({
    where: { userId },
    create: {
      userId,
      targetRole,
      fullName,
      email,
      phone,
      location,
      website,
      github,
      linkedin,
      summary,
      skills,
      experience,
      projects,
      education,
      certifications,
      atsScore,
      atsFeedback,
    },
    update: {
      targetRole,
      fullName,
      email,
      phone,
      location,
      website,
      github,
      linkedin,
      summary,
      skills,
      experience,
      projects,
      education,
      certifications,
      atsScore,
      atsFeedback,
    },
  });

  // Sync with CareerProfile resumeScore
  try {
    await prisma.careerProfile.update({
      where: { userId },
      data: {
        resumeScore: atsScore,
      },
    });
  } catch (err) {
    console.error("Failed to update careerProfile.resumeScore:", err);
  }

  return savedResume;
};

/**
 * 1-Click Auto-Generate complete resume from learner portfolio and roadmap
 */
export const generateAutoResume = async (userId: string) => {
  const [profile, userRecord, skills, projects, activeRoadmap] = await Promise.all([
    prisma.careerProfile.findUnique({
      where: { userId },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    prisma.skillState.findMany({
      where: { userId },
      select: { skillName: true },
      take: 20,
    }),
    prisma.project.findMany({
      where: { userId },
      select: {
        title: true,
        description: true,
        specification: true,
        repositoryUrl: true,
        liveUrl: true,
      },
      take: 5,
    }),
    prisma.roadmap.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        milestones: { select: { title: true }, take: 8 },
      },
    }),
  ]);

  const targetRole = profile?.targetRoleName || profile?.targetRole || "Full Stack Engineer";
  const experienceLevel = profile?.experienceLevel || "Mid Level";
  const userName = userRecord?.name || "Candidate Name";
  const userEmail = userRecord?.email || "candidate@example.com";

  const skillNames = skills.map((s) => s.skillName).filter(Boolean);
  const milestoneNames = (activeRoadmap?.milestones || []).map((m: { title: string }) => m.title).filter(Boolean);

  // 1. Generate resume data via AI
  const generatedData = await generateResumeFromLearnerProfile({
    userName,
    userEmail,
    targetRole,
    experienceLevel,
    skills: skillNames,
    projects: projects.map((p) => {
      const spec = (p.specification as any) || {};
      const techStack = Array.isArray(spec.techStack)
        ? spec.techStack
        : Array.isArray(spec.stack)
        ? spec.stack
        : [];
      return {
        title: p.title || "Engineering Project",
        description: p.description || "",
        techStack,
        githubUrl: p.repositoryUrl || null,
        liveUrl: p.liveUrl || null,
      };
    }),
    roadmapMilestones: milestoneNames,
  });

  // 2. Run ATS Scan
  const atsScan = await scanResumeAtsCompatibility(generatedData, targetRole);

  // 3. Save to database & sync profile
  const savedResume = await saveLearnerResume(userId, {
    ...generatedData,
    atsScore: atsScan.score,
    atsFeedback: atsScan,
  });

  return {
    resume: savedResume,
    atsScan,
  };
};

/**
 * Scan current resume for ATS score and suggestions
 */
export const scanResumeATS = async (userId: string, customJobDescription?: string) => {
  const resume = await getLearnerResume(userId);
  const scanResult: AtsScanResult = await scanResumeAtsCompatibility(
    resume as unknown as GeneratedResumeData,
    resume.targetRole,
    customJobDescription
  );

  // If scanning without custom job description, persist score to database
  if (!customJobDescription) {
    await prisma.resume.updateMany({
      where: { userId },
      data: {
        atsScore: scanResult.score,
        atsFeedback: scanResult as any,
      },
    });

    try {
      await prisma.careerProfile.update({
        where: { userId },
        data: {
          resumeScore: scanResult.score,
        },
      });
    } catch (err) {
      console.error("Failed to update careerProfile.resumeScore:", err);
    }
  }

  return scanResult;
};

/**
 * Rewrite a single bullet point using Google's X-Y-Z formula
 */
export const rewriteBullet = async (userId: string, rawBullet: string) => {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });
  const targetRole = profile?.targetRoleName || profile?.targetRole || "Software Engineer";

  return await rewriteResumeBullet(rawBullet, targetRole);
};

/**
 * Match current resume against a custom job description
 */
export const matchJob = async (userId: string, jobDescription: string) => {
  const resume = await getLearnerResume(userId);
  return await matchJobDescription(resume as unknown as GeneratedResumeData, jobDescription);
};
