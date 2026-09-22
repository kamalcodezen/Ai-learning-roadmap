# Security Audit: AI Pather

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Auditor**: Senior Security Engineer  
> **Standard**: OWASP Top 10 & CWE Threat Analysis

---

## 1. Executive Summary

A comprehensive static security audit of the AI Pather repository identified **2 Critical/High Vulnerabilities** and **2 Medium Vulnerabilities** requiring immediate remediation prior to enterprise production deployment.

---

## 2. Vulnerability Findings & Evidence

### Vulnerability 1: BOLA / Authentication Bypass in Admin Operations
- **Severity**: **CRITICAL (CVSS 9.1)**
- **CWE**: CWE-306 (Missing Authentication for Critical Function) / CWE-639 (Authorization Bypass Through User-Controlled Key)
- **Affected File**: [`backend/src/middlewares/admin.middleware.ts:L21-L52`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/middlewares/admin.middleware.ts#L21-L52)
- **Mount Point**: [`backend/src/modules/admin/admin.routes.ts:L31`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/admin.routes.ts#L31) (`router.use(requireAdmin)`)
- **Code Evidence**:
  ```typescript
  const userId = (req.query.userId || req.body.userId) as string;
  if (!userId) return res.status(401).json({ ... });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if ((user.role || "").toUpperCase() !== "ADMIN") return res.status(403).json({ ... });
  req.adminId = userId;
  next();
  ```
- **Analysis**:
  The `requireAdmin` middleware relies entirely on an unauthenticated `userId` passed as a query or body parameter. It does not verify the caller's session cookie before granting administrative access. Any actor who discovers the UUID of an administrator can invoke all 21 admin endpoints (including user deletion, role modification, and database exports).
- **Mitigation**:
  Enforce `requireAuth` as a prerequisite middleware on all admin routes. Bind admin authorization exclusively to `req.userId` established by the session cookie:
  ```typescript
  router.use(requireAuth);
  router.use(requireAdmin);
  // Inside requireAdmin:
  const userId = req.userId;
  ```

---

### Vulnerability 2: Unverified Subscription Upgrade Bypass
- **Severity**: **HIGH (CVSS 8.5)**
- **CWE**: CWE-285 (Improper Authorization / Business Logic Bypass)
- **Affected File**: [`backend/src/modules/learner/subscription/subscription.routes.ts:L64-L90`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/subscription/subscription.routes.ts#L64-L90)
- **Code Evidence**:
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
    return res.json({ success: true, data: updatedUser });
  });
  ```
- **Analysis**:
  Any authenticated user can elevate their account to `PRO` simply by posting `{ "plan": "PRO" }` to `/api/subscription/sync`. No Stripe session token, payment intent, or invoice verification is performed.
- **Mitigation**:
  Deprecate and delete `/api/subscription/sync`. Subscription status updates must be restricted to verified Stripe webhook events.

---

### Vulnerability 3: Insecure Stripe Webhook Fallback
- **Severity**: **HIGH (CVSS 7.8)**
- **CWE**: CWE-354 (Improper Validation of Integrity Check-value)
- **Affected File**: [`frontend/src/app/api/stripe/webhook/route.ts:L13-L20`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/app/api/stripe/webhook/route.ts#L13-L20)
- **Code Evidence**:
  ```typescript
  if (webhookSecret && signature) {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } else {
    event = JSON.parse(body) as Stripe.Event;
  }
  ```
- **Analysis**:
  If the `STRIPE_WEBHOOK_SECRET` environment variable is not configured, the webhook handler bypasses signature verification and processes unverified JSON payloads, allowing attackers to forge payment completions.
- **Mitigation**:
  Reject requests immediately with HTTP 500 if `STRIPE_WEBHOOK_SECRET` is missing in production environments.

---

### Vulnerability 4: Hardcoded Fallback HMAC Secret in Proof Graph
- **Severity**: **MEDIUM (CVSS 5.3)**
- **CWE**: CWE-798 (Use of Hard-coded Credentials)
- **Affected File**: [`backend/src/modules/learner/proof-graph/services/proof-graph.service.ts:L273`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/proof-graph/services/proof-graph.service.ts#L273)
- **Code Evidence**:
  ```typescript
  const SHARE_SECRET = process.env.AUTH_SECRET || "careeros-proof-graph-share-token-secret";
  ```
- **Analysis**:
  Because `AUTH_SECRET` is not declared in `backend/src/config/env.ts`, the application defaults to the hardcoded string `"careeros-proof-graph-share-token-secret"`, enabling attackers to forge valid proof tokens.
- **Mitigation**:
  Bind `SHARE_SECRET` to `env.BETTER_AUTH_SECRET` and fail server startup if empty.
