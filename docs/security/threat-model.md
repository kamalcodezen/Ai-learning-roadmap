# Threat Model & Vulnerability Analysis: AI Pather

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Methodology**: STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)

---

## 1. Verified High & Critical Vulnerability Findings

### Finding 1: Broken Object Level Authorization / Authentication Bypass in Admin API
- **Severity**: **CRITICAL**
- **Category**: Elevation of Privilege (STRIDE: E) / Broken Access Control (OWASP Top 10 A01:2021)
- **Evidence File**: [`backend/src/middlewares/admin.middleware.ts:L21-L52`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/middlewares/admin.middleware.ts#L21-L52)
- **Code Analysis**:
  ```typescript
  export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId || req.body.userId) as string;
      if (!userId) return res.status(401).json({ ... });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user || (user.role || "").toUpperCase() !== "ADMIN") {
        return res.status(403).json({ ... });
      }

      req.adminId = userId;
      next();
    } ...
  };
  ```
- **Vulnerability Mechanism**:
  `admin.routes.ts` mounts `router.use(requireAdmin)` without executing `requireAuth` first. The middleware directly trusts `req.query.userId` or `req.body.userId`.
- **Exploitation Scenario**:
  An unauthenticated attacker who discovers or guesses an admin's UUID can append `?userId=<admin_id>` to any admin endpoint (e.g. `GET /api/admin/users?userId=<admin_id>`, `DELETE /api/admin/users/:id?userId=<admin_id>`, or `PATCH /api/admin/users/:id/role?userId=<admin_id>`). The middleware verifies the database role for that `userId`, finds `ADMIN`, and permits the request without checking if the caller possesses an active admin session cookie.
- **Recommended Mitigation**:
  Chain `requireAuth` before `requireAdmin` across all admin routes, and inspect `req.userId` established by the validated session rather than reading unverified query/body parameters:
  ```typescript
  const userId = req.userId; // From validated session cookie
  ```

---

### Finding 2: Unverified Subscription Upgrade Bypass (`/api/subscription/sync`)
- **Severity**: **HIGH**
- **Category**: Tampering / Business Logic Flaw (STRIDE: T)
- **Evidence File**: [`backend/src/modules/learner/subscription/subscription.routes.ts:L64-L90`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/subscription/subscription.routes.ts#L64-L90)
- **Code Analysis**:
  ```typescript
  router.post("/sync", async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId as string;
    const requestedPlan = (req.body?.plan || "").toUpperCase();
    const validPlans = ["FREE", "PLUS", "PRO"];
    const newPlan = validPlans.includes(requestedPlan) ? requestedPlan : "PLUS";

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan: newPlan },
    });
    ...
  });
  ```
- **Vulnerability Mechanism**:
  Any authenticated user can issue a `POST /api/subscription/sync` with payload `{ "plan": "PRO" }`. The server unconditionally updates `user.plan` in PostgreSQL to `PRO` without verifying a Stripe payment session, checkout ID, or webhook receipt.
- **Recommended Mitigation**:
  Remove client-driven subscription sync. Update `user.plan` solely via verified server-side Stripe webhook events (`checkout.session.completed`, `customer.subscription.updated`).

---

### Finding 3: Insecure Webhook Signature Verification Fallback
- **Severity**: **HIGH**
- **Category**: Spoofing / Tampering (STRIDE: S, T)
- **Evidence File**: [`frontend/src/app/api/stripe/webhook/route.ts:L13-L20`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/app/api/stripe/webhook/route.ts#L13-L20)
- **Code Analysis**:
  ```typescript
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret && signature) {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } else {
    // In local development or testing without webhook secret configured
    event = JSON.parse(body) as Stripe.Event;
  }
  ```
- **Vulnerability Mechanism**:
  If `STRIPE_WEBHOOK_SECRET` is omitted from environment variables in production, the webhook endpoint skips cryptographic HMAC signature verification and directly parses raw unverified JSON from request bodies.
- **Exploitation Scenario**:
  An attacker posts a fabricated `checkout.session.completed` event with arbitrary customer emails, granting themselves unlimited PRO subscriptions.
- **Recommended Mitigation**:
  Enforce strict signature verification. If `STRIPE_WEBHOOK_SECRET` is missing in production, reject incoming webhook requests with HTTP 500.

---

### Finding 4: Hardcoded Fallback Secret for Proof Graph HMAC Tokens
- **Severity**: **MEDIUM**
- **Category**: Tampering / Spoofing (STRIDE: T)
- **Evidence File**: [`backend/src/modules/learner/proof-graph/services/proof-graph.service.ts:L273`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/proof-graph/services/proof-graph.service.ts#L273)
- **Code Analysis**:
  ```typescript
  const SHARE_SECRET = process.env.AUTH_SECRET || "careeros-proof-graph-share-token-secret";
  ```
- **Vulnerability Mechanism**:
  In `env.ts` and `.env.example`, the Better-Auth secret is named `BETTER_AUTH_SECRET`, while this service checks `process.env.AUTH_SECRET`. If `AUTH_SECRET` is unset, it falls back to a publicly known hardcoded secret string.
- **Recommended Mitigation**:
  Bind `SHARE_SECRET` to `env.BETTER_AUTH_SECRET` via `backend/src/config/env.ts` and throw a startup error if empty.

---

## 2. STRIDE Threat Matrix Summary

| Threat Category | Potential Attack Vector | Platform Countermeasure | Current Implementation Status |
| :--- | :--- | :--- | :--- |
| **S** (Spoofing) | Forging session tokens | Better-Auth cryptographically signed session tokens in HttpOnly cookies | **IMPLEMENTED** |
| **T** (Tampering) | Modifying user subscription tier | Endpoint `/api/subscription/sync` accepts arbitrary plan parameters | **PARTIALLY IMPLEMENTED (VULNERABLE)** |
| **R** (Repudiation) | Denying admin actions | `AdminAuditLog` records adminId, action, and target | **IMPLEMENTED** |
| **I** (Information Disclosure) | Error stack traces leaked | Centralized `error.middleware` catches errors and returns generic message | **IMPLEMENTED** |
| **D** (Denial of Service) | Exhausting AI provider tokens | Rate limiter on `/api/chat` (20 req/min); missing on other AI endpoints | **PARTIALLY IMPLEMENTED** |
| **E** (Elevation of Privilege) | Accessing admin dashboard | `requireAdmin` trusts unauthenticated `req.query.userId` | **PARTIALLY IMPLEMENTED (VULNERABLE)** |
