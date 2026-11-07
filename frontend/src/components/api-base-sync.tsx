"use client";

import { useEffect } from "react";
import { apiBaseUrl } from "@/lib/api-base";
import { usePathora } from "@/lib/store";

/**
 * Publishes the API base into the store on every page, for every visitor.
 *
 * Before this existed, `setApiBase` was called from exactly one place — the
 * admin layout. A student never opens /admin, so `apiBase` stayed null for
 * their whole session, and the guard in `finishAssessment`
 *
 *     if (apiBase && !isSampleOnly) syncSubmissionToBackend(...)
 *
 * was false every time. No finished assessment was ever sent to the server:
 * results lived only in that one browser's localStorage. The database being
 * unconfigured was the second problem, not the first.
 *
 * Mounted in the root layout. It renders nothing and only writes when the
 * value actually changes, so it cannot loop.
 */
export function ApiBaseSync() {
  const setApiBase = usePathora((state) => state.setApiBase);

  useEffect(() => {
    const base = apiBaseUrl();
    // Reading through getState avoids subscribing to apiBase and re-running
    // this effect on its own write.
    if (usePathora.getState().apiBase !== base) {
      setApiBase(base || null);
    }
  }, [setApiBase]);

  return null;
}
