import { serverFetch, serverMutation } from "../../core/server";

export interface ResumeSkillCategory {
  category: string;
  items: string[];
}

export interface ResumeExperience {
  company: string;
  role: string;
  duration: string;
  location?: string;
  bullets: string[];
}

export interface ResumeProject {
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  bullets: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  year: string;
  gpa?: string;
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  year: string;
}

export interface AtsFeedback {
  score: number;
  breakdown: {
    formatting: number;
    keywords: number;
    impactMetrics: number;
    relevance: number;
  };
  strengths: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface ResumeData {
  id?: string;
  userId?: string;
  targetRole: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  summary: string;
  skills: ResumeSkillCategory[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  certifications?: ResumeCertification[];
  atsScore?: number;
  atsFeedback?: AtsFeedback;
}

export const getResume = async () => {
  return serverFetch("/api/resume");
};

export const saveResume = async (data: Partial<ResumeData>) => {
  return serverMutation("/api/resume/save", data);
};

export const generateResume = async () => {
  return serverMutation("/api/resume/generate", {});
};

export const scanResume = async (jobDescription?: string) => {
  return serverMutation("/api/resume/scan", { jobDescription });
};

export const rewriteBullet = async (rawBullet: string) => {
  return serverMutation("/api/resume/rewrite-bullet", { rawBullet });
};

export const matchJobDescription = async (jobDescription: string) => {
  return serverMutation("/api/resume/job-match", { jobDescription });
};

export interface UploadedResumeScanResult {
  atsScore: number;
  detectedName: string;
  detectedRole: string;
  detectedExperienceLevel: string;
  summaryFeedback: string;
  breakdown: {
    formatting: number;
    keywords: number;
    impactMetrics: number;
    relevance: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  redFlags: string[];
  suggestions: string[];
}

export const uploadAndScanResume = async (payload: {
  textContent?: string;
  base64Pdf?: string;
  targetRole?: string;
}) => {
  return serverMutation("/api/resume/upload-scan", payload);
};
