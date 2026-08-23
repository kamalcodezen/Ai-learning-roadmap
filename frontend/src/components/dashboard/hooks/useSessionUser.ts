"use client";

import { authClient } from "@/src/lib/auth-client";

export function useSessionUser() {
  const { data, isPending } = authClient.useSession();

  return { user: data?.user ?? null, isPending };
}
