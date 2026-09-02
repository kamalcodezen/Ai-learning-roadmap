import { serverFetch } from "../../core/server";

export interface ProofGraphNode {
  id: string;
  type: string;
  title: string;
  status: string;
  description?: string;
  score?: number;
  metadata?: { githubUrl?: string; liveUrl?: string; [key: string]: unknown };
}

export interface ProofGraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface ProofGraphData {
  primarySkill: string;
  overallProofScore: number;
  nodes: ProofGraphNode[];
  edges: ProofGraphEdge[];
}

/**
 * Retrieves the Skill Proof Graph data.
 */
export const getProofGraph = async (): Promise<ProofGraphData> => {
  return await serverFetch(`/api/proof-graph`);
};
