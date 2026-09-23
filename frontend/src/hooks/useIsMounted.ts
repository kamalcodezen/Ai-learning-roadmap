import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * useIsMounted
 * Returns false on the server and during the initial hydration pass,
 * then returns true on the client.
 * Uses useSyncExternalStore (React 18/19 standard) to safely handle
 * client-only state without hydration mismatches or cascading re-renders.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
