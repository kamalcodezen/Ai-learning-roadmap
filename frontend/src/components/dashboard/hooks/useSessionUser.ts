"use client";

import { createContext, useContext } from "react";
import { authClient } from "@/src/lib/auth-client";

type User = NonNullable<Awaited<ReturnType<typeof authClient.useSession>>["data"]>["user"];

const SessionContext = createContext<{ user: User | null; isPending: boolean }>({
  user: null,
  isPending: true,
});

export const SessionProvider = SessionContext.Provider;

export function useSessionUser() {
  const context = useContext(SessionContext);
  // If used outside provider, fallback to direct fetch
  if (context === undefined || context.user === null && context.isPending === true) {
    const { data, isPending } = authClient.useSession();
    return { user: data?.user ?? null, isPending };
  }
  return context;
}

export function useDirectSessionFetch() {
  const { data, isPending } = authClient.useSession();
  return { user: data?.user ?? null, isPending };
}
