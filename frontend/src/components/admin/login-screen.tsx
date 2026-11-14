"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN SIGN-IN

   A two-panel card: the left side says whose workspace this is and what is
   behind the door, the right side is the form. On a phone the left panel is
   hidden rather than stacked — a student who lands here by accident does not
   need the pitch, and the form should be the first thing under their thumb.

   This screen deliberately shows NO hint about the credentials. The band it
   replaced printed "Demo access code: pathora-demo" on the page, which was
   fine while the gate was a shared demo code and is not fine now that it
   guards real student records behind a real account.

   Nothing is verified here. The email and password go to
   POST /api/admin/session and the server answers; the only state this holds
   is what the person typed and what the server said back.
   ══════════════════════════════════════════════════════════════════════════ */

const ASSURANCES = [
  {
    icon: ShieldCheck,
    title: "Verified on the server",
    body: "Your password is never checked in the browser and never stored in it.",
  },
  {
    icon: Lock,
    title: "Session, not a saved password",
    body: "Signing in sets a short-lived httpOnly cookie that expires on its own.",
  },
  {
    icon: KeyRound,
    title: "One account",
    body: "Student records are only ever reachable through this door.",
  },
];

export function AdminLoginScreen({
  onSubmit,
  submitting,
  failure,
  checking,
}: {
  onSubmit: (email: string, password: string) => void;
  submitting: boolean;
  failure: string | null;
  checking: boolean;
}) {
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);

  const ready = email.trim().length > 0 && password.length > 0;

  return (
    <main className="relative isolate flex min-h-[80vh] items-center overflow-hidden px-5 py-12 sm:px-8 sm:py-20">
      {/* Ambient wash, clipped by the section so it cannot widen the page. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -right-40 -top-48 block size-[40rem] rounded-full bg-orange/[0.1] blur-3xl" />
        <span className="absolute -bottom-48 -left-40 block size-[36rem] rounded-full bg-[var(--color-navy)]/[0.08] blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[1.9rem] bg-surface shadow-lift ring-1 ring-midnight/[0.07] lg:grid lg:grid-cols-[0.92fr_1.08fr]">
        {/* ── Left: whose door this is ──────────────────────────────────── */}
        <div className="relative hidden flex-col justify-between bg-[var(--color-navy)] p-9 lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-orange/20 blur-3xl"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-white/10 py-2 pl-3 pr-4">
              <span className="grid size-6 place-items-center rounded-lg bg-orange text-white">
                <Lock className="size-[0.9rem]" strokeWidth={2.6} aria-hidden="true" />
              </span>
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white/80">
                Educator workspace
              </span>
            </span>

            <h1 className="display mt-6 text-[1.95rem] leading-[1.1] text-white">
              Sign in to your{" "}
              <span className="relative inline-block text-orange">
                dashboard.
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute left-0 top-[0.97em] h-[0.14em] w-full overflow-visible"
                >
                  <path
                    d="M5 14 Q 100 3 195 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-4 text-[0.88rem] leading-relaxed text-white/60">
              Batches, interest analytics and every student report sit behind this form.
            </p>
          </div>

          <ul className="relative mt-10 space-y-5">
            {ASSURANCES.map((item) => (
              <li key={item.title} className="flex gap-3.5">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-orange"
                >
                  <item.icon className="size-[1.05rem]" strokeWidth={2.3} />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.85rem] font-bold leading-snug text-white">{item.title}</p>
                  <p className="mt-0.5 text-[0.76rem] leading-relaxed text-white/55">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right: the form ───────────────────────────────────────────── */}
        <div className="p-7 sm:p-9">
          {/* Shown only where the left panel is hidden, so the phone still
              says what this screen is before asking for a password. */}
          <span className="inline-flex items-center gap-2.5 rounded-full bg-peach py-2 pl-3 pr-4 lg:hidden">
            <span className="grid size-6 place-items-center rounded-lg bg-orange text-white">
              <Lock className="size-[0.9rem]" strokeWidth={2.6} aria-hidden="true" />
            </span>
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-midnight">
              Educator workspace
            </span>
          </span>

          <h2 className="display mt-5 text-[1.5rem] leading-tight text-midnight lg:mt-0">
            Welcome back
          </h2>
          <p className="mt-1.5 text-[0.88rem] leading-relaxed text-slate-ink">
            {checking
              ? "Checking your session with the server…"
              : "Enter the account that owns this workspace."}
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!ready || submitting) return;
              onSubmit(email.trim(), password);
            }}
            className="mt-7 space-y-4"
          >
            <div>
              <label
                htmlFor={emailId}
                className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-slate-ink"
              >
                Email address
              </label>
              <div className="relative mt-2">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 size-[1.05rem] -translate-y-1/2 text-slate-ink"
                />
                <input
                  id={emailId}
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  spellCheck={false}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@institution.edu"
                  className="min-h-13 w-full rounded-2xl border border-midnight/[0.12] bg-arctic pl-11 pr-4 text-[0.92rem] text-midnight outline-none transition focus:border-orange focus:bg-surface"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={passwordId}
                className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-slate-ink"
              >
                Password
              </label>
              <div className="relative mt-2">
                <KeyRound
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 size-[1.05rem] -translate-y-1/2 text-slate-ink"
                />
                <input
                  id={passwordId}
                  type={reveal ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  className="min-h-13 w-full rounded-2xl border border-midnight/[0.12] bg-arctic pl-11 pr-12 text-[0.92rem] text-midnight outline-none transition focus:border-orange focus:bg-surface"
                />
                {/* A reveal toggle, because a mistyped password on a phone is
                    otherwise invisible and the only feedback is a rejection. */}
                <button
                  type="button"
                  onClick={() => setReveal((value) => !value)}
                  aria-label={reveal ? "Hide password" : "Show password"}
                  aria-pressed={reveal}
                  className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-slate-ink transition hover:bg-fog hover:text-midnight"
                >
                  {reveal ? (
                    <EyeOff className="size-[1.05rem]" aria-hidden="true" />
                  ) : (
                    <Eye className="size-[1.05rem]" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {failure && (
              <p
                role="alert"
                className="flex items-start gap-2.5 rounded-2xl bg-orange/10 px-4 py-3 text-[0.8rem] font-semibold leading-relaxed text-orange"
              >
                <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
                {failure}
              </p>
            )}

            <button
              type="submit"
              disabled={!ready || submitting}
              className="btn-primary inline-flex min-h-13 w-full items-center justify-center gap-2.5 rounded-2xl text-[0.95rem] font-bold transition disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-[1.05rem] animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-[1.05rem]" strokeWidth={2.6} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-[0.72rem] leading-relaxed text-slate-ink">
            Batches and student records live in the database when the backend is configured. The
            browser keeps a short-lived read cache only.
          </p>

          <Link
            href="/"
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-[0.8rem] font-semibold text-slate-ink transition-colors hover:text-orange"
          >
            ← Back to Pathora AI
          </Link>
        </div>
      </div>
    </main>
  );
}
