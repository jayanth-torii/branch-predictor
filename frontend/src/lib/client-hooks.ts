"use client";

import { useMemo, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * False during server rendering and the hydration pass, true once the client
 * has taken over. Use it to gate anything that reads localStorage.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function subscribeToHistory(callback: () => void): () => void {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

/**
 * Reads the query string without a Suspense boundary, staying hydration-safe.
 * Returns an empty string during server rendering.
 */
export function useClientSearchParams(): URLSearchParams {
  const search = useSyncExternalStore(
    subscribeToHistory,
    () => window.location.search,
    () => "",
  );
  return useMemo(() => new URLSearchParams(search), [search]);
}
