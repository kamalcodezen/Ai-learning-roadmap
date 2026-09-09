import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import prisma from "../../../lib/prisma.js";
import {
  getLearnerJobReality,
  clearMarketCache,
  setMarketCacheEntry,
  isListingRelevantToRole,
} from "./job-reality.service.js";

describe("Job Reality Service — Role Relevance Debug & Verification Tests", () => {
  beforeEach(() => {
    clearMarketCache();
  });

  it("1. Verifies genuinely relevant Cloud/DevOps/SRE listings are included", () => {
    const cloudRole = "Cloud Engineer";

    const cloudJob = { title: "Cloud Infrastructure Engineer", description: "AWS Kubernetes Terraform", tags: ["AWS"] };
    const devopsJob = { title: "DevOps Engineer", description: "CI/CD Docker Kubernetes", tags: ["DevOps"] };
    const sreJob = { title: "Site Reliability Engineer (SRE)", description: "AWS Monitoring Linux", tags: ["SRE"] };
    const platformJob = { title: "Platform Engineer", description: "Kubernetes Docker Cloud", tags: ["Platform"] };

    assert.strictEqual(isListingRelevantToRole(cloudJob, cloudRole), true);
    assert.strictEqual(isListingRelevantToRole(devopsJob, cloudRole), true);
    assert.strictEqual(isListingRelevantToRole(sreJob, cloudRole), true);
    assert.strictEqual(isListingRelevantToRole(platformJob, cloudRole), true);
  });

  it("2. Verifies XR, Game Dev, Industrial Automation, and Generic Python jobs are excluded", () => {
    const cloudRole = "Cloud Engineer";

    const xrJob = { title: "XR Game Developer", description: "Unity 3D and Python", tags: ["XR", "Unity"] };
    const automationJob = { title: "Industrial Automation Engineer", description: "PLC and C++", tags: ["Automation"] };
    const pythonJob = { title: "Python Developer", description: "Django Flask Pandas", tags: ["Python"] };

    assert.strictEqual(isListingRelevantToRole(xrJob, cloudRole), false);
    assert.strictEqual(isListingRelevantToRole(automationJob, cloudRole), false);
    assert.strictEqual(isListingRelevantToRole(pythonJob, cloudRole), false);
  });

  it("3. Verifies hybrid dataset classification produces non-zero relevant dataset from 250 mixed raw jobs", async () => {
    const testUserId = `jr-test-250mixed-${Date.now()}`;
    try {
      await prisma.user.create({
        data: {
          id: testUserId,
          name: "Mixed Dataset Tester",
          email: `jr-mixed-${Date.now()}@example.com`,
          emailVerified: true,
          role: "LEARNER",
        },
      });

      await prisma.careerProfile.create({
        data: {
          userId: testUserId,
          targetRole: "CLOUD_ENGINEER",
          targetRoleName: "Cloud Engineer",
          experienceLevel: "BEGINNER",
          onboardingCompleted: true,
        },
      });

      // Construct dataset of 250 jobs: 150 relevant Cloud/DevOps jobs + 100 irrelevant XR/Automation jobs
      const rawJobs = Array.from({ length: 250 }).map((_, i) => {
        if (i < 150) {
          return {
            id: String(i + 1),
            title: i % 2 === 0 ? "Cloud Infrastructure Engineer" : "DevOps Engineer",
            description: i % 3 === 0 ? "AWS Kubernetes Docker Terraform" : "Linux CI/CD Cloud Docker",
            location: "Remote",
          };
        }
        return {
          id: String(i + 1),
          title: i % 2 === 0 ? "XR Game Developer" : "Industrial Automation Engineer",
          description: "Unity 3D PLC Python C++",
          location: "Remote",
        };
      });

      // Set market cache with 250 raw jobs, 150 relevant jobs
      setMarketCacheEntry(
        "Cloud Engineer",
        { rawJobs, relevantJobs: rawJobs.slice(0, 150) },
        Date.now(),
        "all"
      );

      const res = await getLearnerJobReality(testUserId);
      assert.strictEqual(res.market.relevantCount, 150);
      assert.strictEqual(res.market.rawFetchedCount, 250);
      assert.strictEqual(res.market.jobCount, 150);
      assert.strictEqual(res.market.demandLevel, "High");
      assert.ok(res.skills.length > 0);

      // Verify Docker demand score uses denominator = 150 (not 250)
      const dockerSkill = res.skills.find((s: any) => s.name.toLowerCase() === "docker");
      assert.ok(dockerSkill);
      assert.strictEqual(dockerSkill.totalJobs, 150);
    } finally {
      await prisma.careerProfile.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
  });

  it("4. Verifies missing AI classification does not silently zero out the relevant dataset", async () => {
    const testUserId = `jr-test-noaizero-${Date.now()}`;
    try {
      await prisma.user.create({
        data: {
          id: testUserId,
          name: "No AI Zero Tester",
          email: `jr-noaizero-${Date.now()}@example.com`,
          emailVerified: true,
          role: "LEARNER",
        },
      });

      await prisma.careerProfile.create({
        data: {
          userId: testUserId,
          targetRole: "CLOUD_ENGINEER",
          targetRoleName: "Cloud Engineer",
          experienceLevel: "BEGINNER",
          onboardingCompleted: true,
        },
      });

      // 10 jobs without pre-cached AI analysis
      const rawJobs = Array.from({ length: 10 }).map((_, i) => ({
        id: String(i + 1),
        title: i < 7 ? "Cloud Engineer" : "XR Game Developer",
        description: i < 7 ? "AWS Docker Kubernetes Terraform Linux" : "3D Unity Python",
        location: "Remote",
      }));

      // Cache rawJobs without AI analysis to force backend classification
      setMarketCacheEntry("Cloud Engineer", { rawJobs, aiAnalysis: null }, Date.now(), "all");

      const res = await getLearnerJobReality(testUserId);
      assert.strictEqual(res.market.relevantCount, 7);
      assert.strictEqual(res.market.rawFetchedCount, 10);
      assert.strictEqual(res.market.jobCount, 7);

      // Verify irrelevant skills do NOT appear
      const skillNames = res.skills.map((s: any) => s.name.toLowerCase());
      assert.strictEqual(skillNames.includes("extended reality (xr)"), false);
      assert.strictEqual(skillNames.includes("unity"), false);
    } finally {
      await prisma.careerProfile.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
  });

  it("5. Verifies Job Reality does NOT mutate user SkillState", async () => {
    const testUserId = `jr-test-nomutate-${Date.now()}`;
    try {
      await prisma.user.create({
        data: {
          id: testUserId,
          name: "No Mutation Tester",
          email: `jr-nomutate-${Date.now()}@example.com`,
          emailVerified: true,
          role: "LEARNER",
        },
      });

      await prisma.careerProfile.create({
        data: {
          userId: testUserId,
          targetRole: "BACKEND_DEVELOPER",
          targetRoleName: "Backend Developer",
          experienceLevel: "BEGINNER",
          onboardingCompleted: true,
        },
      });

      const initialSkill = await prisma.skillState.create({
        data: {
          userId: testUserId,
          skillName: "Node.js",
          knowledgeScore: 40,
          practiceScore: 30,
          projectScore: 0,
        },
      });

      const rawJobs = [
        { id: "1", title: "Backend Dev", description: "Node.js and PostgreSQL required", location: "Remote" },
      ];
      setMarketCacheEntry("Backend Developer", { rawJobs, relevantJobs: rawJobs }, Date.now(), "all");

      await getLearnerJobReality(testUserId);

      const afterSkill = await prisma.skillState.findUnique({
        where: { id: initialSkill.id },
      });

      assert.strictEqual(afterSkill?.knowledgeScore, 40);
      assert.strictEqual(afterSkill?.practiceScore, 30);
    } finally {
      await prisma.skillState.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.careerProfile.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
  });
});
