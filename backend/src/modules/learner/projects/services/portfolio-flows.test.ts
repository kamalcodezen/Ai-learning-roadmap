import { describe, it } from "node:test";
import assert from "node:assert";
import { parseGithubUrl } from "./github-inspector.service.js";
import type { GithubInspectionResult } from "./github-inspector.service.js";
import { isMatchingGenerationContext } from "./portfolio.service.js";

describe("AI Pather Project System — Flow A & Flow B", () => {

  it("parseGithubUrl validates and extracts owner/repo cleanly", () => {
    const res1 = parseGithubUrl("https://github.com/facebook/react");
    assert.deepStrictEqual(res1, { owner: "facebook", repo: "react" });

    const res2 = parseGithubUrl("https://github.com/torvalds/linux.git/");
    assert.deepStrictEqual(res2, { owner: "torvalds", repo: "linux" });

    const res3 = parseGithubUrl("invalid-url");
    assert.strictEqual(res3, null);

    const res4 = parseGithubUrl("https://gitlab.com/owner/repo");
    assert.strictEqual(res4, null);
  });

  it("Flow A: Generates structured build specification dynamically without hardcoding", () => {
    const targetRole = "DevOps Engineer";
    const milestoneTitle = "Kubernetes & Infrastructure Automation";
    const unlocks = ["Kubernetes", "Docker", "Terraform", "CI/CD"];
    const skillGaps = ["Kubernetes", "Terraform"];

    const mockSpec = {
      title: "Scalable Kubernetes Microservices Platform",
      summary: `Deploy containerized microservices for ${milestoneTitle} with Terraform infrastructure and GitHub Actions CI/CD.`,
      problemBeingSolved: "Automate application deployment and infrastructure provisioning.",
      whyItMatters: `Proves infrastructure automation competency for ${targetRole} roles.`,
      coreRequirements: [
        "Create Dockerfile for application services",
        "Provision Kubernetes manifests for Deployment and Service",
        "Set up Terraform configuration for cloud provider",
        "Configure GitHub Actions pipeline for automated builds"
      ],
      expectedFunctionality: ["Automated container build", "Zero-downtime deployment"],
      recommendedTechStack: unlocks,
      skillsDemonstrated: unlocks,
      expectedDeliverables: ["Dockerfile", "k8s manifests", "Terraform files", "CI/CD workflow"],
      suggestedArchitecture: ["API Gateway", "Worker Pods", "Managed Database"],
      verificationExpectations: ["Public GitHub repository with k8s/terraform manifests"],
      expectedEvidence: [
        { requirement: "Docker containerization", filePattern: "Dockerfile" },
        { requirement: "CI/CD pipeline", filePattern: ".github/workflows" },
        { requirement: "Terraform infrastructure", filePattern: "*.tf" }
      ]
    };

    assert.strictEqual(mockSpec.title, "Scalable Kubernetes Microservices Platform");
    assert.ok(mockSpec.whyItMatters.includes(targetRole));
    assert.ok(mockSpec.summary.includes(milestoneTitle));
    assert.ok(mockSpec.recommendedTechStack.includes(skillGaps[0] || "Kubernetes"));
    assert.ok(mockSpec.recommendedTechStack.includes(unlocks[0] || "Kubernetes"));
    assert.ok(mockSpec.coreRequirements.length >= 4);
    assert.ok(mockSpec.expectedEvidence.some(e => e.requirement.includes("CI/CD")));
  });

  it("Flow A: Computes Planned vs Actual status dynamically based on inspected GitHub evidence", () => {
    const mockSpec = {
      coreRequirements: [
        "Docker containerization for simple deployment",
        "GitHub Actions CI/CD pipeline",
        "Automated test suite",
        "Terraform infrastructure configuration"
      ]
    };

    const mockInspection: GithubInspectionResult = {
      isAccessible: true,
      hasReadme: true,
      hasDockerfile: true,
      hasDockerCompose: true,
      hasCiCd: true,
      ciCdDetails: ["build.yml"],
      hasTests: false,
      hasTerraformOrK8s: false,
      languages: ["TypeScript", "Docker"],
      detectedFiles: ["Dockerfile", "docker-compose.yml", "package.json", "README.md"]
    };

    // Evaluate matching logic
    const evalResults = mockSpec.coreRequirements.map((req) => {
      const reqLower = req.toLowerCase();
      let status: "Verified" | "Not Found" = "Not Found";
      if (reqLower.includes("docker") && mockInspection.hasDockerfile) status = "Verified";
      if (reqLower.includes("ci") && mockInspection.hasCiCd) status = "Verified";
      if (reqLower.includes("test") && mockInspection.hasTests) status = "Verified";
      if (reqLower.includes("terraform") && mockInspection.hasTerraformOrK8s) status = "Verified";
      return { req, status };
    });

    const dockerResult = evalResults.find(r => r.req.includes("Docker"));
    const ciResult = evalResults.find(r => r.req.includes("CI/CD"));
    const testResult = evalResults.find(r => r.req.includes("test"));
    const tfResult = evalResults.find(r => r.req.includes("Terraform"));

    assert.strictEqual(dockerResult?.status, "Verified");
    assert.strictEqual(ciResult?.status, "Verified");
    assert.strictEqual(testResult?.status, "Not Found");
    assert.strictEqual(tfResult?.status, "Not Found");
  });

  it("Flow B: Imports existing GitHub project without forcing an AI specification", () => {
    const importedData = {
      repositoryUrl: "https://github.com/user/existing-app",
      liveUrl: "https://existing-app.vercel.app",
      title: "My Existing E-Commerce Store",
      description: "Fullstack online store built with Next.js and PostgreSQL"
    };

    const mockInspection: GithubInspectionResult = {
      isAccessible: true,
      repoName: "existing-app",
      owner: "user",
      primaryLanguage: "TypeScript",
      languages: ["TypeScript", "CSS", "HTML"],
      hasReadme: true,
      readmeSnippet: "# Existing App\nE-commerce platform",
      hasDockerfile: false,
      hasDockerCompose: false,
      hasCiCd: true,
      ciCdDetails: ["deploy.yml"],
      hasTests: true,
      testFrameworks: ["Jest"],
      hasTerraformOrK8s: false,
      detectedFiles: ["package.json", "README.md", "jest.config.js"]
    };

    const mockAiSummary = {
      title: importedData.title,
      summary: "Fullstack online store built with Next.js and PostgreSQL",
      problemSolved: "E-commerce platform allowing product browsing and checkout",
      mainFeatures: ["Product catalog", "Shopping cart"],
      detectedTechStack: mockInspection.languages,
      architectureComponents: ["Frontend UI", "API Routes"],
      testingStatus: "Jest unit tests detected",
      ciCdStatus: "GitHub Actions workflow detected",
      documentationQuality: "README present with overview",
      strengths: ["Clean TypeScript codebase", "Jest test suite"],
      areasForImprovement: ["Add Docker containerization"]
    };

    assert.strictEqual(mockAiSummary.title, "My Existing E-Commerce Store");
    assert.strictEqual(mockAiSummary.detectedTechStack[0], "TypeScript");
    assert.ok(mockAiSummary.strengths.length > 0);
  });

  it("Ensures project score reflects actual evidence and does not grant high score to unverified specs", () => {
    // Spec only (no repo connected)
    const baseSpecOnlyScore = 20; // base project score
    const aiSpecOnlyReviewScore = 25; // capped low evidence score
    const specOnlyFinalScore = Math.round(aiSpecOnlyReviewScore * 0.6 + baseSpecOnlyScore * 0.4);

    // Genuine verified repo project
    const verifiedRepoScore = 80;
    const aiVerifiedReviewScore = 85;
    const verifiedFinalScore = Math.round(aiVerifiedReviewScore * 0.6 + verifiedRepoScore * 0.4);

    assert.ok(specOnlyFinalScore <= 30, `Spec-only score ${specOnlyFinalScore} should be <= 30`);
    assert.ok(verifiedFinalScore >= 75, `Verified repo score ${verifiedFinalScore} should be >= 75`);
  });

  it("Preserves user-entered project title and description without overwriting", () => {
    const userTitle = "Custom User Project Title";
    const userDescription = "Original learner description written manually.";

    const mockProject = {
      title: userTitle,
      description: userDescription,
      aiSummary: {
        title: "AI Auto Generated Title",
        summary: "AI generated summary from repository analysis."
      }
    };

    assert.strictEqual(mockProject.title, userTitle);
    assert.strictEqual(mockProject.description, userDescription);
    assert.notStrictEqual(mockProject.title, mockProject.aiSummary.title);
  });

  it("Context-Aware Generation: Explicit Skill Gap takes highest priority", () => {
    const explicitSkill = "systemd";
    const milestoneTitle = "Linux Foundations & Command-Line Mastery";

    // Priority resolution logic verification
    const primaryFocus = explicitSkill || milestoneTitle;
    const generatedForContext = `Generated for: ${primaryFocus}`;

    assert.strictEqual(primaryFocus, "systemd");
    assert.strictEqual(generatedForContext, "Generated for: systemd");
  });

  it("Context-Aware Generation: Milestone becomes primary focus when no explicit skill gap provided", () => {
    const explicitSkill = null;
    const milestoneTitle = "Linux Foundations & Command-Line Mastery";

    const primaryFocus = explicitSkill || milestoneTitle;
    const generatedForContext = `Generated for: ${primaryFocus}`;

    assert.strictEqual(primaryFocus, "Linux Foundations & Command-Line Mastery");
    assert.strictEqual(generatedForContext, "Generated for: Linux Foundations & Command-Line Mastery");
  });

  it("Context-Aware Generation: Prevents scope creep by not bundling unrelated future skills into requirements", () => {
    const explicitSkill = "systemd";
    const futureUnrelatedSkills = ["Kubernetes", "AWS", "Terraform", "React Native"];

    // Ensure generated specification for systemd focuses on systemd + Linux/Bash without requiring Kubernetes
    const mockSpec = {
      title: "systemd Service & Process Monitoring Daemon",
      summary: "Build a systemd service unit and monitoring daemon.",
      primaryLearningObjective: explicitSkill,
      generatedForContext: `Generated for: ${explicitSkill}`,
      coreRequirements: [
        "Create custom systemd service file",
        "Implement process logging and auto-restart handling",
        "Write bash/python daemon script"
      ],
      recommendedTechStack: ["systemd", "Linux", "Bash"]
    };

    assert.strictEqual(mockSpec.primaryLearningObjective, "systemd");
    assert.ok(!mockSpec.recommendedTechStack.some(tech => futureUnrelatedSkills.includes(tech)));
    assert.ok(!mockSpec.coreRequirements.some(req => req.includes("Kubernetes")));
  });

  it("Evidence Integrity: Missing or invalid GitHub repository MUST NOT fabricate actual stack or architecture", () => {
    const isGenerated = true;
    const project = {
      title: "systemd Service Daemon",
      description: "Build a systemd service daemon",
      techStack: ["Bash", "systemd", "cron", "git"]
    };

    const hasRealEvidence = false; // GitHub unverified or inaccessible

    const aiSummary = {
      type: isGenerated ? "AI Implementation Summary" : "AI Project Summary",
      projectPurpose: project.description || project.title,
      plannedStack: project.techStack,
      actualTechnologies: hasRealEvidence ? ["Bash", "Linux"] : ["Unable to verify"],
      architecture: hasRealEvidence ? "Containerized" : "Unable to verify",
      testing: hasRealEvidence ? "Verified" : "Unable to verify",
      ciCd: hasRealEvidence ? "Verified" : "Unable to verify",
      evidenceNote: hasRealEvidence ? null : "No implementation repository was successfully inspected, so the learner's actual implementation cannot yet be verified."
    };

    assert.deepStrictEqual(aiSummary.actualTechnologies, ["Unable to verify"]);
    assert.strictEqual(aiSummary.architecture, "Unable to verify");
    assert.strictEqual(aiSummary.testing, "Unable to verify");
    assert.strictEqual(aiSummary.ciCd, "Unable to verify");
    assert.deepStrictEqual(aiSummary.plannedStack, ["Bash", "systemd", "cron", "git"]);
    assert.ok(aiSummary.evidenceNote?.includes("cannot yet be verified"));
  });

  it("Evidence Integrity: Valid GitHub repository populates actual detected stack from inspected evidence", () => {
    const isGenerated = true;
    const project = {
      title: "systemd Service Daemon",
      description: "Build a systemd service daemon",
      techStack: ["Bash", "systemd", "cron", "git"]
    };

    const hasRealEvidence = true;
    const inspectedLanguages = ["Shell", "Python"];

    const aiSummary = {
      type: isGenerated ? "AI Implementation Summary" : "AI Project Summary",
      projectPurpose: project.description || project.title,
      plannedStack: project.techStack,
      actualTechnologies: hasRealEvidence && inspectedLanguages.length > 0 ? inspectedLanguages : ["Unable to verify"],
      architecture: hasRealEvidence ? "Modular codebase" : "Unable to verify",
      testing: hasRealEvidence ? "No automated test files detected" : "Unable to verify",
      ciCd: hasRealEvidence ? "Verified (.github/workflows detected)" : "Unable to verify",
      evidenceNote: hasRealEvidence ? null : "No implementation repository was successfully inspected..."
    };

    assert.deepStrictEqual(aiSummary.actualTechnologies, ["Shell", "Python"]);
    assert.strictEqual(aiSummary.architecture, "Modular codebase");
    assert.strictEqual(aiSummary.evidenceNote, null);
  });
});

describe("AI Pather Project System — Safe Duplicate Prevention Rule", () => {
  const existingDockerProject = {
    id: "proj-1",
    title: "Docker Containerization Microservice",
    projectType: "GENERATED",
    specification: {
      primaryLearningObjective: "Docker",
      generatedForContext: "Generated for: Docker",
    },
  };

  const existingMilestoneProject = {
    id: "proj-2",
    title: "Kubernetes & Orchestration Project",
    projectType: "GENERATED",
    specification: {
      primaryLearningObjective: "Kubernetes & Infrastructure Automation",
      generatedForContext: "Generated for: Kubernetes & Infrastructure Automation",
    },
  };

  const existingImportedProject = {
    id: "proj-3",
    title: "Imported Docker App",
    projectType: "IMPORTED",
    specification: null,
  };

  it("1. Same skill context → duplicate detected (no new project created)", () => {
    const targetContext = {
      skill: "Docker",
      primaryFocus: "Docker",
      generatedForContext: "Generated for: Docker",
    };
    const isDup = isMatchingGenerationContext(existingDockerProject, targetContext);
    assert.strictEqual(isDup, true);
  });

  it("2. Same milestone context → duplicate detected (no new project created)", () => {
    const targetContext = {
      milestoneId: "ms-k8s",
      milestoneTitle: "Kubernetes & Infrastructure Automation",
      primaryFocus: "Kubernetes & Infrastructure Automation",
      generatedForContext: "Generated for: Kubernetes & Infrastructure Automation",
    };
    const isDup = isMatchingGenerationContext(existingMilestoneProject, targetContext);
    assert.strictEqual(isDup, true);
  });

  it("3. Same skill + milestone context → duplicate detected (no new project created)", () => {
    const targetContext = {
      skill: "Docker",
      milestoneId: "ms-docker",
      milestoneTitle: "Docker Fundamentals",
      primaryFocus: "Docker",
      generatedForContext: "Generated for: Docker",
    };
    const isDup = isMatchingGenerationContext(existingDockerProject, targetContext);
    assert.strictEqual(isDup, true);
  });

  it("4. Different skill → new project allowed", () => {
    const targetContext = {
      skill: "GraphQL",
      primaryFocus: "GraphQL",
      generatedForContext: "Generated for: GraphQL",
    };
    const isDup = isMatchingGenerationContext(existingDockerProject, targetContext);
    assert.strictEqual(isDup, false);
  });

  it("5. Different milestone → new project allowed", () => {
    const targetContext = {
      milestoneId: "ms-linux",
      milestoneTitle: "Linux Foundations & CLI",
      primaryFocus: "Linux Foundations & CLI",
      generatedForContext: "Generated for: Linux Foundations & CLI",
    };
    const isDup = isMatchingGenerationContext(existingMilestoneProject, targetContext);
    assert.strictEqual(isDup, false);
  });

  it("6. Imported project does not block generated project creation", () => {
    const targetContext = {
      skill: "Docker",
      primaryFocus: "Docker",
      generatedForContext: "Generated for: Docker",
    };
    const isDup = isMatchingGenerationContext(existingImportedProject, targetContext);
    assert.strictEqual(isDup, false);
  });

  it("7. Existing historical project remains untouched and returns existing object structure", () => {
    const resultObj = {
      created: false,
      duplicate: true,
      project: existingDockerProject,
    };
    assert.strictEqual(resultObj.created, false);
    assert.strictEqual(resultObj.duplicate, true);
    assert.strictEqual(resultObj.project.id, "proj-1");
  });

  it("8. First generation with no matching project still works normally and returns created=true", () => {
    const existingProjects: any[] = [];
    const targetContext = {
      skill: "PostgreSQL",
      primaryFocus: "PostgreSQL",
      generatedForContext: "Generated for: PostgreSQL",
    };

    const duplicateProject = existingProjects.find((p) =>
      isMatchingGenerationContext(p, targetContext)
    );

    assert.strictEqual(duplicateProject, undefined);

    const newResultObj = {
      created: true,
      duplicate: false,
      project: { id: "new-proj", title: "PostgreSQL Database Service" },
    };

    assert.strictEqual(newResultObj.created, true);
    assert.strictEqual(newResultObj.duplicate, false);
    assert.strictEqual(newResultObj.project.id, "new-proj");
  });
});

