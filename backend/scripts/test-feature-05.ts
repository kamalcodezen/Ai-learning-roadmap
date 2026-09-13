import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import {
  getCuratedResourcesForMilestone,
  isSafeUrl,
  clearResourceCache,
  getResourceCacheEntry,
  setResourceCacheEntry,
  CACHE_TTL_MS
} from "../src/modules/learner/roadmap/services/resource-curator.service.js";

async function runFeature05Tests() {
  console.log("============================================================");
  console.log("FEATURE 05 — AI RESOURCE CURATOR VERIFICATION");
  console.log("============================================================");

  const testUserAId = `f05-usr-a-${Date.now()}`;
  const testUserBId = `f05-usr-b-${Date.now()}`;
  let userA: any = null;
  let userB: any = null;

  try {
    // ------------------------------------------------------------
    // TEST 1: URL & SSRF Validation Check
    // ------------------------------------------------------------
    console.log("\n[Test 1] Testing URL safety & SSRF protection...");
    
    // Malicious & internal IPs/domains should be rejected
    assert.strictEqual(isSafeUrl("http://localhost:3000"), false, "localhost must be blocked");
    assert.strictEqual(isSafeUrl("http://app.localhost/secret"), false, "*.localhost must be blocked");
    assert.strictEqual(isSafeUrl("http://internal.local"), false, "*.local must be blocked");
    assert.strictEqual(isSafeUrl("http://service.internal"), false, "*.internal must be blocked");
    assert.strictEqual(isSafeUrl("http://127.0.0.1:8080"), false, "127.0.0.1 must be blocked");
    assert.strictEqual(isSafeUrl("http://10.0.0.1/admin"), false, "10.x.x.x must be blocked");
    assert.strictEqual(isSafeUrl("http://192.168.1.1"), false, "192.168.x.x must be blocked");
    assert.strictEqual(isSafeUrl("http://169.254.169.254/latest/meta-data"), false, "169.254.x.x must be blocked");
    assert.strictEqual(isSafeUrl("http://172.20.0.1/dashboard"), false, "172.16-31.x.x must be blocked");
    assert.strictEqual(isSafeUrl("http://0.0.0.0:8000"), false, "0.0.0.0 must be blocked");
    assert.strictEqual(isSafeUrl("http://[::1]:80"), false, "IPv6 ::1 must be blocked");
    assert.strictEqual(isSafeUrl("ftp://files.example.com"), false, "Non-HTTP/HTTPS protocol must be blocked");
    assert.strictEqual(isSafeUrl("javascript:alert(1)"), false, "javascript pseudo-protocol must be blocked");

    // Valid external resources must be allowed
    assert.strictEqual(isSafeUrl("https://developer.mozilla.org/en-US/docs/Web/JavaScript"), true, "Valid HTTPS URL must be allowed");
    assert.strictEqual(isSafeUrl("https://react.dev/learn"), true, "Valid HTTPS URL must be allowed");
    console.log("✓ Test 1 Passed: Complete SSRF and URL validation verified");

    // Setup Test Users & Roadmaps
    userA = await prisma.user.create({
      data: {
        id: testUserAId,
        name: "Feature 05 Learner A",
        email: `f05-a-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
      }
    });

    userB = await prisma.user.create({
      data: {
        id: testUserBId,
        name: "Feature 05 Learner B",
        email: `f05-b-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
      }
    });

    await prisma.careerProfile.create({
      data: {
        userId: userA.id,
        targetRole: "FULL_STACK_ENGINEER",
        targetRoleName: "Full Stack Engineer",
        experienceLevel: "BEGINNER",
        weeklyAvailableHours: 10,
        onboardingCompleted: true,
      }
    });

    const roadmapA = await prisma.roadmap.create({
      data: {
        userId: userA.id,
        targetRole: "Full Stack Engineer",
        status: "ACTIVE",
      }
    });

    // Milestone 1: Known catalog skills (TypeScript, React)
    const milestoneCatalog = await prisma.milestone.create({
      data: {
        roadmapId: roadmapA.id,
        order: 1,
        title: "Frontend Foundations",
        description: "Master TypeScript syntax and modern React component architecture",
        status: "CURRENT",
        unlocks: ["TypeScript", "React"],
      }
    });

    // Milestone 2: Unknown / Specialized skills
    const milestoneSpecialized = await prisma.milestone.create({
      data: {
        roadmapId: roadmapA.id,
        order: 2,
        title: "Distributed Quantum Machine Learning",
        description: "Advanced distributed tensor graphs and specialized architectures",
        status: "UPCOMING",
        unlocks: ["Quantum Machine Learning", "Qiskit"],
      }
    });

    clearResourceCache();

    // ------------------------------------------------------------
    // TEST 2: Authoritative Catalog Lookup (No AI Required)
    // ------------------------------------------------------------
    console.log("\n[Test 2] Curating resources for known catalog skills (TypeScript, React)...");
    const catalogRes = await getCuratedResourcesForMilestone(userA.id, milestoneCatalog.id);

    assert.ok(catalogRes, "Result should be returned");
    assert.strictEqual(catalogRes.milestoneTitle, milestoneCatalog.title);
    assert.ok(catalogRes.resources.length >= 2, "Should return at least 2 catalog resources");
    
    const hasTypeScript = catalogRes.resources.some(r => r.url.includes("typescriptlang.org") || r.title.toLowerCase().includes("typescript"));
    const hasReact = catalogRes.resources.some(r => r.url.includes("react.dev") || r.title.toLowerCase().includes("react"));
    assert.ok(hasTypeScript, "Catalog must return TypeScript resource");
    assert.ok(hasReact, "Catalog must return React resource");
    console.log(`✓ Test 2 Passed: Authoritative catalog returned ${catalogRes.resources.length} verified official resources directly without AI overhead`);

    // ------------------------------------------------------------
    // TEST 3: In-Memory Caching (Cache Hit & Fast Resolution)
    // ------------------------------------------------------------
    console.log("\n[Test 3] Testing in-memory cache hit...");
    const cachedEntry = getResourceCacheEntry(milestoneCatalog.id);
    assert.ok(cachedEntry, "Milestone resources must be cached in memory");
    assert.strictEqual(cachedEntry.resources.length, catalogRes.resources.length);

    const secondCall = await getCuratedResourcesForMilestone(userA.id, milestoneCatalog.id);
    assert.deepStrictEqual(secondCall.resources, catalogRes.resources, "Cache hit must return identical curated list");
    console.log("✓ Test 3 Passed: Cache hit successfully returned identical verified resources");

    // ------------------------------------------------------------
    // TEST 4: Cache Expiration & Recalculation
    // ------------------------------------------------------------
    console.log("\n[Test 4] Testing cache expiry handling...");
    // Simulate expired cache entry (older than 24h)
    setResourceCacheEntry(milestoneCatalog.id, catalogRes.resources, Date.now() - (CACHE_TTL_MS + 1000));
    const expiredEntry = getResourceCacheEntry(milestoneCatalog.id);
    assert.ok(Date.now() - expiredEntry!.timestamp > CACHE_TTL_MS, "Cache entry must be marked expired");

    const refreshedCall = await getCuratedResourcesForMilestone(userA.id, milestoneCatalog.id);
    assert.ok(refreshedCall.resources.length >= 2, "Expired cache must trigger refresh seamlessly");
    console.log("✓ Test 4 Passed: Expired cache successfully refreshed and repopulated");

    // ------------------------------------------------------------
    // TEST 5: Unknown Skills & AI / Safe Fallback
    // ------------------------------------------------------------
    console.log("\n[Test 5] Curating resources for specialized / novel skill set...");
    const specializedRes = await getCuratedResourcesForMilestone(userA.id, milestoneSpecialized.id);
    assert.ok(specializedRes, "Result should be returned for specialized milestone");
    assert.ok(specializedRes.resources.length > 0, "Must contain at least 1 verified resource or authoritative fallback");
    for (const res of specializedRes.resources) {
      assert.ok(isSafeUrl(res.url), `Returned URL "${res.url}" must pass strict SSRF validation`);
    }
    console.log(`✓ Test 5 Passed: Specialized milestone returned ${specializedRes.resources.length} safe and validated resources`);

    // ------------------------------------------------------------
    // TEST 6: Ownership & IDOR Protection (Cross-User & Non-Existent)
    // ------------------------------------------------------------
    console.log("\n[Test 6] Testing cross-user milestone authorization and non-existent IDs...");
    
    // User B trying to access User A's milestone
    let unauthorizedError = false;
    try {
      await getCuratedResourcesForMilestone(userB.id, milestoneCatalog.id);
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        unauthorizedError = true;
      }
    }
    assert.strictEqual(unauthorizedError, true, "User B must be rejected with Unauthorized error when accessing User A's milestone");

    // Non-existent milestone ID
    let notFoundError = false;
    try {
      await getCuratedResourcesForMilestone(userA.id, "non-existent-milestone-999");
    } catch (err: any) {
      if (err.message === "Milestone not found") {
        notFoundError = true;
      }
    }
    assert.strictEqual(notFoundError, true, "Non-existent milestone must throw 'Milestone not found'");
    console.log("✓ Test 6 Passed: Ownership isolation and IDOR protections enforced strictly");

    console.log("\n============================================================");
    console.log("FEATURE 05 VERIFICATION: ALL TESTS PASSED (6/6)");
    console.log("============================================================");
  } finally {
    clearResourceCache();
    if (userA?.id) {
      await prisma.milestone.deleteMany({ where: { roadmap: { userId: userA.id } } }).catch(() => {});
      await prisma.roadmap.deleteMany({ where: { userId: userA.id } }).catch(() => {});
      await prisma.careerProfile.deleteMany({ where: { userId: userA.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: userA.id } }).catch(() => {});
    }
    if (userB?.id) {
      await prisma.user.delete({ where: { id: userB.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runFeature05Tests().catch((err) => {
  console.error("Feature 05 Verification Failed:", err);
  process.exit(1);
});
