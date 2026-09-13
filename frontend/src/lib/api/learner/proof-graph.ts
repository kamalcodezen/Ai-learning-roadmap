import { serverFetch, serverMutation } from "../../core/server";

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

export interface PublicProofGraphResponse {
  verifiedCandidate: {
    targetRole: string;
    experienceLevel: string;
    verifiedSince?: string;
  };
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

export const generateProofGraphShareLink = async (): Promise<{ shareToken: string }> => {
  const res = await serverMutation("/api/proof-graph/share", {}, "POST");
  return res.data;
};

export const getPublicProofGraph = async (token: string): Promise<PublicProofGraphResponse> => {
  const res = await serverFetch(`/api/proof-graph/public/${token}`);
  return res.data;
};
