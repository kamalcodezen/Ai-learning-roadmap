export type ExportEntityOption =
  | "users"
  | "roadmaps"
  | "assessments"
  | "projects"
  | "ai-usage"
  | "audit-logs"
  | "skill-proof"
  | "error-logs"
  | "learning-debt"
  | "skill-health"
  | "career-readiness"
  | "job-reality"
  | "activity";

/**
 * Downloads a platform data export CSV directly to the browser.
 */
export const exportAdminData = async (userId: string, entity: ExportEntityOption | string) => {
  const normalizedBase =
    typeof window === "undefined"
      ? (
          process.env.BACKEND_API_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000"
        ).replace(/\/+$/, "")
      : "/api/proxy";

  const url = `${normalizedBase}/api/admin/export/${entity}?userId=${userId}`;
  const response = await fetch(url, {
    credentials: "include",
  });
  
  if (!response.ok) {
    let errorMsg = "Failed to export data";
    try {
      const errJson = await response.json();
      if (errJson?.message) errorMsg = errJson.message;
    } catch {}
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `${entity}-export.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
