import { createAuthClient } from "better-auth/react";
import { twoFactorClient, emailOTPClient } from "better-auth/client/plugins";

let activeSessionFetch: Promise<Response> | null = null;

export const authClient = createAuthClient({
  plugins: [twoFactorClient(), emailOTPClient()],
  fetchOptions: {
    customFetchImpl: async (url, init) => {
      // Intercept and deduplicate concurrent session fetches triggered by React mounts
      if (
        url.toString().includes("/api/auth/get-session") &&
        (!init?.method || init.method.toUpperCase() === "GET")
      ) {
        if (activeSessionFetch) {
          // Clone the response so multiple subscribers don't consume the same body stream
          const res = await activeSessionFetch;
          return res.clone();
        }
        
        activeSessionFetch = fetch(url, init).finally(() => {
          // Clear the lock immediately after resolution so future explicit refetches work
          setTimeout(() => { activeSessionFetch = null; }, 50);
        });
        
        const res = await activeSessionFetch;
        return res.clone();
      }
      
      return fetch(url, init);
    },
  },
  sessionOptions: {
    refetchOnWindowFocus: false,
  },
});