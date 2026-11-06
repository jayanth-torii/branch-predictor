"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, GraduationCap, LayoutDashboard, Lock, LogOut, Users } from "lucide-react";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useHydrated } from "@/lib/client-hooks";
import { SiteFooter } from "@/components/site-footer";
import { usePathora } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  clearAdminSession,
  fetchAdminSession,
  postAdminLogin,
} from "@/lib/api";

export const ADMIN_PASSCODE_ENV = "pathora-demo";

const TABS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/batches", label: "Batches", icon: GraduationCap },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
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
  const [passcode, setPasscode] = useState("");
  const [failure, setFailure] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submissions = state.admin.submissions;

  async function verifyServerSession() {
    const base = windowLocationOrigin();
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
      throw new Error(session?.error ?? "Not authenticated");
    } catch (error) {
      setMode(unlockedCandidate(error) ? "unlocked" : "error");
      if (unlockedCandidate(error)) {
        isUnlocked.current = true;
        sessionStorage.setItem("pathora-admin-unlocked", "1");
        await refreshAdminData(baseFromState());
      }
    }
  }


  // Detect a stale client session best-effort, then verify with the server.
  useEffect(() => {
    if (!mounted) return;
    const hadLocalSession =
      typeof window !== "undefined" &&
      sessionStorage.getItem("pathora-admin-unlocked") === "1";
    if (!hadLocalSession) return;
    // Deferred to a macrotask: calling setMode straight from the effect body
    // trips react-hooks/set-state-in-effect and cascades a render.
    const start = setTimeout(() => {
      setMode("checking");
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
      return;
    }
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
      if (message !== "Backend not configured") {
        state.setAdminSyncError(message);
      }
    }
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passcode.trim()) return;
    setSubmitting(true);
    setFailure(null);
    const base = windowLocationOrigin();
    state.setApiBase(base);
    try {
      const login = await postAdminLogin(base, passcode.trim());
      if (login?.ok) {
        isUnlocked.current = true;
        sessionStorage.setItem("pathora-admin-unlocked", "1");
        setMode("unlocked");
        setPasscode("");
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
    const base = windowLocationOrigin();
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
    setPasscode("");
    setFailure(null);
  }

  function windowLocationOrigin(): string {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }

  function baseFromState(): string | null {
    return state.apiBase;
  }

  if (!mounted) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="size-10 animate-pulse rounded-full bg-orange/20" />
      </main>
    );
  }

  if (mode === "checking" || mode === "error") {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-col justify-center px-5 py-16 sm:py-24">
        <div className="card p-7 sm:p-9">
          <span className="grid size-11 place-items-center rounded-2xl bg-peach text-orange">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <p className="eyebrow mt-5">Educator workspace</p>
          <h1 className="display mt-2 text-2xl text-midnight">Restricted to trainers &amp; admins</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-ink">
            {mode === "checking"
              ? "Checking your admin session against the server…"
              : "That access code did not unlock this workspace."}
          </p>
          <form onSubmit={login} className="mt-6 space-y-3">
            <label htmlFor="passcode" className="text-xs font-semibold uppercase tracking-wide text-slate-ink">
              Access code
            </label>
            <input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              placeholder="Enter access code"
              autoComplete="off"
              className="w-full rounded-2xl border border-midnight/12 bg-arctic px-4 py-3 text-sm text-midnight outline-none transition focus:border-orange focus:bg-surface"
            />
            {failure && (
              <p role="alert" className="rounded-xl bg-orange/10 px-3 py-2 text-xs font-semibold text-orange">
                {failure}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? "Verifying…" : "Unlock dashboard"}
            </button>
          </form>
          <div className="mt-4 rounded-xl bg-fog px-3.5 py-2.5 text-[0.72rem] text-indigo">
            Demo access code: <code className="font-bold">pathora-demo</code>
          </div>
          <p className="mt-4 text-[0.66rem] leading-relaxed text-slate-ink">
            The access code is verified server-side. Batches and student records are stored in MongoDB
            when the backend is configured; the browser keeps a short-lived read cache only.
          </p>
          <Link href="/" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-slate-ink hover:text-midnight md:mt-5 md:min-h-0">
            ← Back to Pathora AI
          </Link>
        </div>
      </main>
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
      {children}
      <SiteFooter />
    </main>
  );
}
