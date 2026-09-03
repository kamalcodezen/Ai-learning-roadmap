export const baseUrl =
  typeof window === "undefined"
    ? (
        process.env.BACKEND_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000"
      ).replace(/\/+$/, "")
    : "/api/proxy";

const request = async (path: string, options?: RequestInit) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${baseUrl}${normalizedPath}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Something went wrong.");
  }

  return data;
};

// GET requests
export const serverFetch = async (path: string) => {
  return request(path, {
    method: "GET",
  });
};

// POST / PUT / PATCH / DELETE requests
export const serverMutation = async (
  path: string,
  data?: unknown,
  method = "POST",
) => {
  return request(path, {
    method,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
};
