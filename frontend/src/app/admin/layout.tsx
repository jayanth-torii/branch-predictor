"use client";

import Link from "next/link";
import { apiBaseUrl } from "@/lib/api-base";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useHydrated } from "@/lib/client-hooks";
import { AdminLoginScreen } from "@/components/admin/login-screen";
import { SiteFooter } from "@/components/site-footer";
import { usePathora } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  clearAdminSession,
  fetchAdminSession,
  postAdminLogin,
} from "@/lib/api";

const TABS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/batches", label: "Batches", icon: GraduationCap },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/questions", label: "Questions", icon: FileQuestion },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-[60vh] place-items-center">
          <div className="size-10 animate-pulse rounded-full bg-orange/20" />
        </main>
      }
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mounted = useHydrated();
  const state = usePathora();
  const isUnlocked = useRef(false);

  const [mode, setMode] = useState<"locked" | "checking" | "unlocked" | "error">("locked");
  const [failure, setFailure] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submissions = state.admin.submissions;

  async function verifyServerSession() {
    const base = apiBaseUrl();
    state.setApiBase(base);
    try {
      const session = await fetchAdminSession(base);
      if (session?.ok && session?.authenticated) {
        isUnlocked.current = true;
        setMode("unlocked");
        setFailure(null);
        sessionStorage.setItem("pathora-admin-unlocked", "1");
        await refreshAdminData(base);
        return;
      }
      /* Answered, and the answer is "no". That is the LOGIN screen, not an
         error — it is the ordinary state of a browser whose 12-hour cookie
         expired overnight, which is most first visits of a day. The stale
         local flag is cleared so the next mount does not flash "checking". */
      isUnlocked.current = false;
      sessionStorage.removeItem("pathora-admin-unlocked");
      setMode("locked");
      setFailure(null);
    } catch (error) {
      /* The request itself failed — offline, CORS, backend down. That is NOT
         the same as being signed out, so the previous best-effort behaviour
         stands: assume the session may be good and try to load. `base` is
         passed directly; `baseFromState()` read a render-time snapshot of the
         store that `setApiBase` above had not yet updated, so it handed back
         the OLD value — usually null on a first load, which skipped the fetch
         entirely and left the dashboard on its cache. */
      setMode(unlockedCandidate(error) ? "unlocked" : "error");
      if (unlockedCandidate(error)) {
        isUnlocked.current = true;
        sessionStorage.setItem("pathora-admin-unlocked", "1");
        await refreshAdminData(base);
      }
    }
  }


  /**
   * Ask the SERVER whether this browser is signed in, on every mount.
   *
   * This used to return early unless `sessionStorage` held an "unlocked"
   * flag — and sessionStorage is wiped when the browser closes. So the first
   * visit of a new day never checked the session and never fetched anything:
   * the dashboard rendered whatever was in the local cache, which was a
   * snapshot from the last time a fetch happened to run. Students who
   * submitted in between were invisible, which read as "yesterday's data is
   * gone" when nothing had been lost at all.
   *
   * GET /api/admin/session always answers 200 and reports `authenticated`,
   * so asking unconditionally is cheap and the server decides. The
   * sessionStorage flag is now only a hint for which screen to paint first,
   * never a gate on loading data.
   */
  useEffect(() => {
    if (!mounted) return;
    const hadLocalSession =
      typeof window !== "undefined" &&
      sessionStorage.getItem("pathora-admin-unlocked") === "1";
    // Deferred to a macrotask: calling setMode straight from the effect body
    // trips react-hooks/set-state-in-effect and cascades a render.
    const start = setTimeout(() => {
      /* "checking" even without the local flag. A valid 12-hour cookie in a
         NEW tab has no flag, and flashing the login form at someone who is
         already signed in invites them to start typing a password they do
         not need. A brief spinner for a genuinely locked-out visitor is the
         cheaper of the two. */
      setMode("checking");
      void hadLocalSession;
      verifyServerSession();
    }, 0);
    return () => clearTimeout(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function unlockedCandidate(error: unknown): boolean {
    const message =
      error instanceof Error ? error.message : typeof error === "string" ? error : "";
    if (message.includes("Not authenticated") || message.includes("Session check failed")) {
      return false;
    }
    return true;
  }

  async function refreshAdminData(base: string | null) {
    if (!base) {
      state.setAdminHydrated(false);
      state.setAdminSyncError(
        "No backend is configured for this site, so no student records can be loaded.",
      );
      return;
    }
    state.setAdminSyncError(null);
    try {
      const { fetchBatches, fetchSubmissions } = await import("@/lib/api");
      const [batchesRes, submissionsRes] = await Promise.all([
        fetchBatches(base),
        fetchSubmissions(base),
      ]);
      const batches: Parameters<typeof state.setAdminData>[0] =
        (batchesRes as { batches?: Parameters<typeof state.setAdminData>[0] })?.batches ??
        [];
      const submissions: Parameters<typeof state.setAdminData>[1] =
        (submissionsRes as { submissions?: Parameters<typeof state.setAdminData>[1] })?.submissions ??
        [];
      state.setAdminData(batches, submissions);
    } catch (error) {
      const { apiErrorMessage } = await import("@/lib/api");
      const message = apiErrorMessage(error).message;
      /* Always recorded, including "Backend not configured". A refresh that
         failed silently was the other half of this bug: the dashboard kept
         rendering whatever rows it already had, with nothing on screen to say
         they were not current. */
      state.setAdminSyncError(message);
      state.setAdminHydrated(false);
    }
  }

  async function login(email: string, password: string) {
    if (!email || !password) return;
    setSubmitting(true);
    setFailure(null);
    const base = apiBaseUrl();
    state.setApiBase(base);
    try {
      const login = await postAdminLogin(base, email, password);
      if (login?.ok) {
        isUnlocked.current = true;
        sessionStorage.setItem("pathora-admin-unlocked", "1");
        setMode("unlocked");
        await refreshAdminData(base);
        return;
      }
      throw new Error(login?.error ?? "Login failed");
    } catch (error) {
      const { apiErrorMessage } = await import("@/lib/api");
      setFailure(apiErrorMessage(error).message);
      setMode("error");
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    const base = apiBaseUrl();
    try {
      await clearAdminSession(base);
    } catch {
      // Keep UI consistent even if the server is unreachable.
    }
    isUnlocked.current = false;
    sessionStorage.removeItem("pathora-admin-unlocked");
    state.setAdminData(state.admin.batches, []);
    state.setApiBase(null);
    setMode("locked");
    setFailure(null);
  }


  if (!mounted) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="size-10 animate-pulse rounded-full bg-orange/20" />
      </main>
    );
  }

  if (mode === "checking" || mode === "error" || mode === "locked") {
    return (
      <AdminLoginScreen
        onSubmit={(email, password) => void login(email, password)}
        submitting={submitting}
        failure={failure}
        checking={mode === "checking"}
      />
    );
  }

  return (
    <main>
      <div className="border-b border-midnight/[0.07] bg-surface">
        <div className="mx-auto w-full max-w-6xl px-5 pt-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">AI Batch Analyzer</p>
              <h1 className="display mt-1.5 text-2xl text-midnight sm:text-[1.9rem]">
                Educator workspace
              </h1>
              <p className="mt-1 text-xs text-slate-ink">
                {submissions.length} assessment records · aggregate-first by design
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-midnight/10 px-3.5 py-1.5 text-[0.68rem] font-semibold text-slate-ink transition hover:border-midnight/25 hover:text-midnight md:min-h-0"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Lock workspace
            </button>
          </div>

          <nav className="m-scroll-x hide-scrollbar mt-6 flex gap-1 overflow-x-auto" aria-label="Admin sections">
            {TABS.map((tab) => {
              const active =
                tab.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-t-xl border-b-2 px-3.5 text-xs font-semibold transition md:min-h-0 md:py-2.5",
                    active
                      ? "border-orange text-midnight"
                      : "border-transparent text-slate-ink hover:text-midnight",
                  )}
                >
                  <tab.icon className="size-3.5" aria-hidden="true" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* The dashboard shows the DATABASE, or it says why it cannot.
          Previously a failed load left the previous rows on screen with no
          indication they were stale, which is how "yesterday's students
          disappeared" looked from this side of the screen — the records were
          in Mongo the whole time, the page just never managed to ask. */}
      {state.adminSyncError && (
        <div className="mx-auto w-full max-w-6xl px-5 pt-5 sm:px-8">
          <p
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border border-orange/30 bg-orange/10 px-4 py-3 text-[0.8rem] font-semibold leading-relaxed text-orange"
          >
            <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
            <span>
              Student records could not be loaded, so this page is not showing live data.{" "}
              {state.adminSyncError} Nothing has been deleted — reload once the connection is
              back.
            </span>
          </p>
        </div>
      )}

      {children}
      <SiteFooter />
    </main>
  );
}
