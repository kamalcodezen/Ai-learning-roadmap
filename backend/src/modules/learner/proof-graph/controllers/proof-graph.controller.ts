import type { Request, Response, NextFunction } from "express";
import * as proofgraphService from "../services/proof-graph.service.js";

const getUserId = (req: Request) => {
  const userId = req.userId as string;
  if (!userId) throw new Error("User authentication is required.");
  return userId;
};

export const getProofGraph = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await proofgraphService.getProofGraph(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const generateShareLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const token = proofgraphService.generateProofGraphShareToken(userId);
    res.json({ success: true, data: { shareToken: token } });
  } catch (error) {
    next(error);
  }
};

export const getPublicProofGraph = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const token = req.params.token as string;
    if (!token) {
      return res.status(400).json({ error: "Share token is required" });
    }
    const data = await proofgraphService.getPublicProofGraphByToken(token);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ error: error.message || "Invalid or expired proof verification token." });
  }
};
