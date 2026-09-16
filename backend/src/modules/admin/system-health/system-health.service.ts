import prisma from "../../../lib/prisma.js";
import { ChatService } from "../../learner/copilot/services/chat.service.js";

export interface SystemHealthStatus {
  backend: string;
  database: string;
  auth: string;
  ai: string;
}

/**
 * Performs live ping and latency telemetry checks across Database, Auth, Backend, and AI gateways.
 */
export const getSystemHealth = async (): Promise<SystemHealthStatus> => {
  const health: SystemHealthStatus = {
    backend: "✓",
    database: "✗",
    auth: "✗",
    ai: "✗",
  };

  // 1. DB Health
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.database = `✓ (${Date.now() - start}ms)`;
  } catch (error) {
    health.database = "✗ Failed";
    console.error("Database health check failed", error);
  }

  // 2. Auth Health
  try {
    const start = Date.now();
    await prisma.session.findFirst();
    health.auth = `✓ (${Date.now() - start}ms)`;
  } catch (error) {
    health.auth = "✗ Failed";
    console.error("Auth health check failed", error);
  }

  // 3. AI Health
  const aiHealth = await ChatService.checkHealth();
  health.ai = aiHealth.status;
  if (aiHealth.responseTime) {
    health.ai += ` (${aiHealth.responseTime}ms)`;
  }

  return health;
};
