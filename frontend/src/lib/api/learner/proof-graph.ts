import { serverFetch } from "../../core/server";

export interface ProofNode {
  id: string;
  type: "skill" | "knowledge" | "practice" | "assessment" | "project" | "evidence";
  title: string;
  status: "verified" | "pending" | "missing" | "failed";
  description?: string;
  score?: number;
}

export interface ProofGraphData {
  primarySkill: string;
  overallProofScore: number;
  nodes: ProofNode[];
}

/**
 * Retrieves the Skill Proof Graph data.
 */
export const getProofGraph = async (): Promise<ProofGraphData> => {
  return await serverFetch(`/api/proof-graph`);
};
