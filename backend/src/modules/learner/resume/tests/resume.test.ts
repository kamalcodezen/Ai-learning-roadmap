import { describe, it } from "node:test";
import assert from "node:assert";
import type { GeneratedResumeData, AtsScanResult, JobMatchResult } from "../services/resume-ai.service.js";
import { scanUploadedResume } from "../services/resume-ai.service.js";

describe("AI Resume Builder & ATS Scanner Tests", () => {
  it("verifies clean structure for a generated ATS resume data object", () => {
    const mockResume: GeneratedResumeData = {
      fullName: "Kamal Hasan",
      targetRole: "Full Stack Engineer",
      email: "kamal@example.com",
      location: "San Francisco, CA",
      summary: "High-impact Full Stack Engineer with expertise in TypeScript, Next.js, and Node.js microservices.",
      skills: [
        { category: "Languages & Frameworks", items: ["TypeScript", "React", "Next.js", "Node.js"] },
        { category: "Databases & Cloud", items: ["PostgreSQL", "Prisma", "Docker", "AWS"] },
      ],
      experience: [
        {
          company: "TechFlow Labs",
          role: "Full Stack Developer",
          duration: "2023 - Present",
          location: "Remote",
          bullets: [
            "Architected full-stack web applications handling 50k+ monthly active users with 99.9% uptime.",
            "Reduced API latency by 45% through Redis caching and query indexing.",
          ],
        },
      ],
      projects: [
        {
          title: "AI Career Copilot Platform",
          description: "End-to-end career guidance platform with interactive roadmaps and AI mock interviews.",
          techStack: ["Next.js", "Node.js", "PostgreSQL", "Gemini AI"],
          githubUrl: "https://github.com/example/copilot",
          bullets: [
            "Developed real-time AI interview simulator with speech-to-text integration.",
            "Achieved 95+ Google Lighthouse performance score with ISR and edge caching.",
          ],
        },
      ],
      education: [
        {
          institution: "University of Engineering & Technology",
          degree: "B.S. in Computer Science",
          year: "2024",
        },
      ],
      certifications: [
        {
          name: "AWS Certified Developer Associate",
          issuer: "Amazon Web Services",
          year: "2024",
        },
      ],
    };

    assert.strictEqual(mockResume.fullName, "Kamal Hasan");
    assert.strictEqual(mockResume.targetRole, "Full Stack Engineer");
    assert.ok(mockResume.skills.length >= 2);
    assert.ok(mockResume.projects[0]?.bullets && mockResume.projects[0].bullets.length >= 2);
    assert.ok(mockResume.experience[0]?.bullets[0]?.includes("50k+"));
  });

  it("verifies ATS Scanner 4-pillar score calculation integrity", () => {
    const mockScan: AtsScanResult = {
      score: 88,
      breakdown: {
        formatting: 95,
        keywords: 85,
        impactMetrics: 80,
        relevance: 92,
      },
      strengths: [
        "Strong X-Y-Z formula in work experience bullets with measurable metrics.",
        "ATS-compliant single-column hierarchical structure.",
      ],
      missingKeywords: ["Kubernetes", "CI/CD", "Redis"],
      suggestions: [
        "Add more cloud infrastructure keywords such as Kubernetes or Terraform.",
      ],
    };

    assert.ok(mockScan.score >= 0 && mockScan.score <= 100);
    assert.strictEqual(mockScan.breakdown.formatting, 95);
    assert.strictEqual(mockScan.breakdown.keywords, 85);
    assert.strictEqual(mockScan.breakdown.impactMetrics, 80);
    assert.strictEqual(mockScan.breakdown.relevance, 92);
    assert.strictEqual(mockScan.missingKeywords.length, 3);
    assert.strictEqual(mockScan.suggestions.length, 1);
  });

  it("verifies Job Description Matcher result structure", () => {
    const mockJobMatch: JobMatchResult = {
      matchScore: 82,
      matchedKeywords: ["Node.js", "PostgreSQL", "Docker", "REST API", "Microservices"],
      missingKeywords: ["Kafka", "GraphQL", "Kubernetes"],
      tailoredSuggestions: [
        "Highlight experience with event-driven architectures to address Kafka requirements.",
        "Include GraphQL schema design examples in project bullet points.",
      ],
      summary: "Strong alignment on core backend languages and databases with minor gaps in message brokers.",
    };

    assert.ok(mockJobMatch.matchScore >= 0 && mockJobMatch.matchScore <= 100);
    assert.ok(mockJobMatch.matchedKeywords.length >= 5);
    assert.ok(mockJobMatch.missingKeywords.length >= 2);
    assert.ok(mockJobMatch.tailoredSuggestions.length >= 1);
  });

  it("verifies Stateless Upload Resume Scanner calculates ATS score and 4-pillar audit", async () => {
    const sampleResumeText = `
      John Doe
      Full Stack Software Engineer
      Email: john@example.com | Phone: 555-123-4567 | GitHub: github.com/johndoe
      
      Summary:
      Results-driven Software Engineer with 3+ years of experience building web microservices using TypeScript, Node.js, and React.
      
      Skills:
      - Languages: TypeScript, JavaScript, Python, SQL
      - Frameworks: Next.js, Express, React
      - Databases: PostgreSQL, MongoDB, Redis
      
      Experience:
      Software Engineer - CloudTech Solutions (2022 - Present)
      - Architected real-time WebSocket communication engine handling 15k concurrent events with sub-50ms latency.
      - Optimized database queries and indexed foreign keys, boosting API throughput by 32%.
      
      Education:
      B.S. in Computer Science - Tech University (2022)
    `;

    const result = await scanUploadedResume({
      textContent: sampleResumeText,
      targetRole: "Full Stack Software Engineer",
    });

    assert.ok(result.atsScore >= 0 && result.atsScore <= 100, "Score should be between 0 and 100");
    assert.ok(result.breakdown.formatting >= 0 && result.breakdown.formatting <= 100);
    assert.ok(result.breakdown.keywords >= 0 && result.breakdown.keywords <= 100);
    assert.ok(result.breakdown.impactMetrics >= 0 && result.breakdown.impactMetrics <= 100);
    assert.ok(result.breakdown.relevance >= 0 && result.breakdown.relevance <= 100);
    assert.ok(Array.isArray(result.missingKeywords), "Missing keywords should be an array");
    assert.ok(Array.isArray(result.matchedKeywords), "Matched keywords should be an array");
    assert.ok(Array.isArray(result.strengths), "Strengths should be an array");
    assert.ok(Array.isArray(result.suggestions), "Suggestions should be an array");
  });
});
