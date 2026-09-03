import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

import env from "../config/env.js";
import pg from "pg";

const globalForPool = globalThis as unknown as { pool: pg.Pool };

const pool =
  globalForPool.pool ||
  new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 10000, // Reduced from 30s to 10s so the pool closes connections before Neon drops them
  });

// Handle idle connection errors to prevent uncaught exceptions from Neon terminating idle connections
pool.on("error", (err) => {
  console.error("Unexpected error on idle Prisma pool client:", err.message);
});

if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
