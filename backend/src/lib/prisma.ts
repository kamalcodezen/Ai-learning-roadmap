import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

import env from "../config/env.js";
import pg from "pg";

const globalForPool = globalThis as unknown as { pool: pg.Pool };

const isNeonOrSsl =
  env.DATABASE_URL.includes("neon.tech") ||
  env.DATABASE_URL.includes("sslmode=require") ||
  env.DATABASE_URL.includes("ssl=true");

// Strip sslmode from query string to eliminate the node-postgres libpq-ssl deprecation warning,
// and provide explicit ssl configuration object to pg.Pool instead
const cleanDatabaseUrl = env.DATABASE_URL.replace(
  /([?&])sslmode=[^&]+(&|$)/,
  (_match, p1, p2) => (p1 === "?" && p2 ? "?" : "")
);

const pool =
  globalForPool.pool ||
  new pg.Pool({
    connectionString: cleanDatabaseUrl,
    ssl: isNeonOrSsl ? { rejectUnauthorized: false } : undefined,
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
