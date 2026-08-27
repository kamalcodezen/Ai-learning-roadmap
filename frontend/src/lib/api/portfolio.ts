import { serverFetch } from "../core/server";

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  metrics: {
    technicalDepth: number;
    explanationQuality: number;
    evidence: "verified" | "unverified" | "missing";
  };
}

export interface PortfolioData {
  overallStrength: number;
  projects: ProjectData[];
}

/**
 * Retrieves the Portfolio Strength analysis data.
 */
export const getPortfolio = async (userId: string): Promise<PortfolioData> => {
  try {
    return await serverFetch(`/api/portfolio?userId=${userId}`);
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    throw error;
  }
};
