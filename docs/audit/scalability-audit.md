# Scalability Audit: AI Pather

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Evaluation Area**: Concurrency, Horizontal Scaling, Database Limits, and Traffic Growth

---

## 1. Concurrency & Horizontal Scaling Obstacles

### 1. In-Memory Cooldown State (`modelCooldowns`)
- **Finding**: Circuit breaker timestamps are stored in an in-process JavaScript `Map` ([chat.service.ts:L63](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts#L63)).
- **Scaling Limit**: When scaling horizontally to multiple container replicas behind a load balancer, each replica maintains its own isolated cooldown state. If Container A triggers a 429 rate limit on Groq Key 1, Container B has no awareness and will continue sending requests to Key 1 until it also fails.
- **Remediation**: Migrate circuit-breaker keys and timestamps to Redis.

### 2. Lack of Asynchronous Background Job Queues
- **Finding**: Heavy operations—such as GitHub repository crawling ([github-inspector.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/projects/services/github-inspector.service.ts)) and comprehensive ATS resume keyword analysis—execute synchronously within HTTP request-response cycles.
- **Scaling Limit**: If multiple users import repositories simultaneously, Node.js event loop capacity will saturate, causing HTTP timeouts for other concurrent requests.
- **Remediation**: Offload heavy parsing tasks to an asynchronous background worker queue (e.g. BullMQ with Redis).

---

## 2. Database Connection Pool Saturation

- **Finding**: The database pool is configured with `max: 10` connections ([prisma.ts:L26](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/lib/prisma.ts#L26)).
- **Scaling Limit**: In serverless cloud deployments where multiple server instances spin up dynamically, 10 connections per instance can quickly exceed the maximum connection threshold of the PostgreSQL serverless database.
- **Remediation**: Implement an external connection pooler such as **PgBouncer** or Neon's connection pooling proxy (`pooler.neon.tech`).

---

## 3. Unpartitioned Telemetry Growth

- **Finding**: `AiUsageLog`, `ErrorLog`, and `ActivityLog` append records on every user action and AI inference without retention policies or archival mechanisms.
- **Scaling Limit**: Over months of operation, these tables will grow to millions of rows, increasing database disk usage and slowing down admin query filters on `createdAt`.
- **Remediation**: Introduce automated monthly table partitioning in PostgreSQL and an automated cron archiving policy for logs older than 90 days.
