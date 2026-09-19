# ADR-004: Prisma ORM with Neon PostgreSQL Connection Pooling

> **Document Status**: Reconstructed from the implemented system.  
> **Original Decision Rationale**: Original decision rationale could not be verified from the codebase. Reconstructed based on repository structure.

---

## Context & Problem
AI Pather manages complex relational domains: users, sessions, diagnostic attempts, multi-dimensional skill states, roadmaps, milestones, portfolio evidence, and audit logs. The system utilizes cloud PostgreSQL (Neon Serverless).

Serverless PostgreSQL platforms automatically close idle connections to manage cloud resources. If a standard connection pool maintains connections beyond this window, subsequent queries encounter broken pipe exceptions (`unexpected EOF on client connection`), terminating server processes.

---

## Decision
1. Utilize **Prisma 7.9** as the primary ORM for type-safe relational modeling, migrations, and query generation.
2. Employ `@prisma/adapter-pg` driven by `pg.Pool` ([prisma.ts:L21-L43](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/lib/prisma.ts#L21-L43)):
   ```typescript
   const pool = new pg.Pool({
     connectionString: cleanDatabaseUrl,
     ssl: isNeonOrSsl ? { rejectUnauthorized: false } : undefined,
     max: 10,
     idleTimeoutMillis: 10000, // Closes before Neon drops them
   });
   ```
3. Attach an explicit error listener (`pool.on("error", ...)`) to catch idle connection termination gracefully.
4. Clean connection URLs by regex-stripping query string `sslmode` to silence Node-Postgres libpq deprecation warnings while applying explicit SSL configuration objects.

---

## Consequences & Trade-offs

### Positive Consequences:
- **Resilient Connection Pool**: The application avoids abrupt server crashes caused by Neon serverless connection drops.
- **Strict Schema Integrity**: 28 relational models with foreign-key cascades ensure relational consistency across users, attempts, milestones, and evidence.

### Negative Consequences:
- **Prisma Engine Overhead**: Prisma's query engine consumes additional memory compared to bare SQL drivers like Kysely or raw `pg`.
- **SSL Verification Disabled**: `rejectUnauthorized: false` permits connections to cloud databases with self-signed or proxy certificates, which introduces potential MitM vulnerability if traffic leaves secure cloud networks.
