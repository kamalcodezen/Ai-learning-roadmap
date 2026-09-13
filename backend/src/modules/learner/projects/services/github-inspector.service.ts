export interface GithubInspectionResult {
  isAccessible: boolean;
  repoName?: string;
  owner?: string;
  description?: string;
  primaryLanguage?: string;
  languages: string[];
  hasReadme: boolean;
  readmeSnippet?: string;
  hasDockerfile: boolean;
  hasDockerCompose: boolean;
  hasCiCd: boolean;
  ciCdDetails?: string[];
  hasTests: boolean;
  testFrameworks?: string[];
  hasTerraformOrK8s: boolean;
  detectedFiles: string[];
  fileTreeSummary?: string;
  commitCount?: number;
  errorMessage?: string;
}

export const parseGithubUrl = (url: string | null | undefined): { owner: string; repo: string } | null => {
  if (!url || typeof url !== "string") return null;
  try {
    const cleaned = url.trim().replace(/\/+$/, "");
    const parsed = new URL(cleaned);
    if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1] ? parts[1].replace(/\.git$/i, "") : "";
    if (!owner || !repo) return null;

    return { owner, repo };
  } catch {
    return null;
  }
};

export const inspectGithubRepository = async (url: string | null | undefined): Promise<GithubInspectionResult> => {
  const parsed = parseGithubUrl(url);
  if (!parsed) {
    return {
      isAccessible: false,
      languages: [],
      hasReadme: false,
      hasDockerfile: false,
      hasDockerCompose: false,
      hasCiCd: false,
      hasTests: false,
      hasTerraformOrK8s: false,
      detectedFiles: [],
      errorMessage: "Invalid GitHub repository URL",
    };
  }

  const { owner, repo } = parsed;
  const headers: Record<string, string> = {
    "User-Agent": "AI-Pather-Inspector/1.0",
    "Accept": "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      signal: controller.signal,
    });

    if (!repoRes.ok) {
      clearTimeout(timeoutId);
      if (repoRes.status === 404 || repoRes.status === 401 || repoRes.status === 403) {
        return {
          isAccessible: false,
          owner,
          repoName: repo,
          languages: [],
          hasReadme: false,
          hasDockerfile: false,
          hasDockerCompose: false,
          hasCiCd: false,
          hasTests: false,
          hasTerraformOrK8s: false,
          detectedFiles: [],
          errorMessage: `Repository is private, missing, or rate-limited (HTTP ${repoRes.status}).`,
        };
      }
      return {
        isAccessible: false,
        owner,
        repoName: repo,
        languages: [],
        hasReadme: false,
        hasDockerfile: false,
        hasDockerCompose: false,
        hasCiCd: false,
        hasTests: false,
        hasTerraformOrK8s: false,
        detectedFiles: [],
        errorMessage: `HTTP ${repoRes.status} returned from GitHub API`,
      };
    }

    const repoData: any = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    let rootItems: any[] = [];
    try {
      const contentsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents?ref=${defaultBranch}`,
        { headers, signal: controller.signal }
      );
      if (contentsRes.ok) {
        const json: unknown = await contentsRes.json();
        if (Array.isArray(json)) {
          rootItems = json;
        }
      }
    } catch {
      // Non-blocking
    }

    let languages: string[] = [];
    try {
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers,
        signal: controller.signal,
      });
      if (langRes.ok) {
        const langData: any = await langRes.json();
        languages = Object.keys(langData || {});
      }
    } catch {
      // Non-blocking
    }
    if (languages.length === 0 && repoData.language) {
      languages = [repoData.language];
    }

    let hasReadme = false;
    let readmeSnippet = "";
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers,
        signal: controller.signal,
      });
      if (readmeRes.ok) {
        const readmeData: any = await readmeRes.json();
        hasReadme = true;
        if (readmeData.content && readmeData.encoding === "base64") {
          const rawText = Buffer.from(readmeData.content, "base64").toString("utf-8");
          readmeSnippet = rawText.slice(0, 1200);
        }
      }
    } catch {
      // Non-blocking
    }

    let hasCiCd = false;
    let ciCdDetails: string[] = [];
    try {
      const workflowRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows?ref=${defaultBranch}`,
        { headers, signal: controller.signal }
      );
      if (workflowRes.ok) {
        const json: unknown = await workflowRes.json();
        if (Array.isArray(json)) {
          hasCiCd = json.length > 0;
          ciCdDetails = json.map((wf: any) => wf.name || wf.path || "workflow");
        }
      }
    } catch {
      // Non-blocking
    }

    clearTimeout(timeoutId);

    const fileNames = rootItems.map((item) => String(item.name || ""));

    const hasDockerfile = fileNames.some(
      (f) => f.toLowerCase() === "dockerfile" || f.toLowerCase().startsWith("dockerfile.")
    );
    const hasDockerCompose = fileNames.some(
      (f) =>
        f.toLowerCase() === "docker-compose.yml" ||
        f.toLowerCase() === "docker-compose.yaml" ||
        f.toLowerCase() === "compose.yaml" ||
        f.toLowerCase() === "compose.yml"
    );

    const hasTests = fileNames.some(
      (f) =>
        f.toLowerCase().includes("test") ||
        f.toLowerCase().includes("spec") ||
        f.toLowerCase() === "jest.config.js" ||
        f.toLowerCase() === "vitest.config.ts" ||
        f.toLowerCase() === "pytest.ini"
    );

    const hasTerraformOrK8s = fileNames.some(
      (f) =>
        f.toLowerCase().endsWith(".tf") ||
        f.toLowerCase().includes("k8s") ||
        f.toLowerCase().includes("kubernetes") ||
        f.toLowerCase().includes("helm")
    );

    const testFrameworks: string[] = [];
    if (fileNames.some((f) => f.toLowerCase().includes("jest"))) testFrameworks.push("Jest");
    if (fileNames.some((f) => f.toLowerCase().includes("vitest"))) testFrameworks.push("Vitest");
    if (fileNames.some((f) => f.toLowerCase().includes("pytest"))) testFrameworks.push("Pytest");

    const fileTreeSummary = fileNames.join(", ");

    return {
      isAccessible: true,
      owner,
      repoName: repo,
      description: repoData.description || undefined,
      primaryLanguage: repoData.language || languages[0] || undefined,
      languages,
      hasReadme,
      readmeSnippet,
      hasDockerfile,
      hasDockerCompose,
      hasCiCd,
      ciCdDetails,
      hasTests,
      testFrameworks,
      hasTerraformOrK8s,
      detectedFiles: fileNames,
      fileTreeSummary,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      isAccessible: false,
      owner,
      repoName: repo,
      languages: [],
      hasReadme: false,
      hasDockerfile: false,
      hasDockerCompose: false,
      hasCiCd: false,
      hasTests: false,
      hasTerraformOrK8s: false,
      detectedFiles: [],
      errorMessage: err.name === "AbortError" ? "GitHub API request timed out" : err.message || "Failed to inspect GitHub repository",
    };
  }
};
