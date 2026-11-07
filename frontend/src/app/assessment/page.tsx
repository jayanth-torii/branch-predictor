"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Gift,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useHydrated } from "@/lib/client-hooks";
import { Logo } from "@/components/logo";
import { OptionGlyph } from "@/components/option-glyph";
import { OrbitCompanion } from "@/components/orbit-scene";
import { ProgressBar } from "@/components/ui";
import { useQuestionBank } from "@/lib/question-source";
import { computeInterestProfile } from "@/lib/scoring";
import { usePathora } from "@/lib/store";
import { cn } from "@/lib/utils";

const MYSTERY_FACTS = [
  "BCA graduates and B.Tech engineers often work on the same product teams. The degree shapes the entry route; your portfolio shapes the ceiling.",
  "UCEED and NID DAT accept students from every stream. Design schools are usually more interested in how you think than in which subjects you took.",
  "B.Sc. Statistics is one of the most direct non-engineering routes into data science and analytics work.",
  "A B.Com can run alongside CA or CS Foundation study. That combination changes the economics of the decision considerably.",
  "Mechatronics is one of the few degrees that genuinely spans mechanical design, electronics and code — useful if you cannot pick one.",
  "Most psychology careers in India require a master's and supervised practice. Plan for the full path, not just the UG degree.",
];

export default function AssessmentPage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const mounted = useHydrated();
  const [boxOpen, setBoxOpen] = useState(false);

  const student = usePathora((state) => state.student);
  const answers = usePathora((state) => state.answers);
  const currentIndex = usePathora((state) => state.currentIndex);
  const xp = usePathora((state) => state.xp);
  const lastFeedback = usePathora((state) => state.lastFeedback);
  const selectAnswer = usePathora((state) => state.selectAnswer);
  const nextQuestion = usePathora((state) => state.nextQuestion);
  const skipQuestion = usePathora((state) => state.skipQuestion);
  const goToQuestion = usePathora((state) => state.goToQuestion);

  useEffect(() => {
    if (mounted && !student.name) {
      router.replace("/discover");
    }
  }, [mounted, student.name, router]);

  // The live bank: the database's version when one exists, the bundled bank
  // otherwise. Published to the store so finishAssessment scores against the
  // same questions the student just answered.
  const bank = useQuestionBank();
  const QUESTIONS = bank.core;
  const setQuestionBanks = usePathora((state) => state.setQuestionBanks);
  useEffect(() => {
    setQuestionBanks(bank.source === "server" ? bank.core : null, null);
  }, [bank.source, bank.core, setQuestionBanks]);

  const question = QUESTIONS[currentIndex];
  const selected = answers[question?.id ?? ""] ?? "";
  const answeredCount = Object.keys(answers).length;
  const profile = useMemo(() => computeInterestProfile(answers), [answers]);
  const isLast = currentIndex === QUESTIONS.length - 1;
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const fact = MYSTERY_FACTS[Math.max(0, Math.min(MYSTERY_FACTS.length - 1, currentIndex - 2))];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!question) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const digit = Number(event.key);
      if (digit >= 1 && digit <= question.options.length) {
        selectAnswer(question.id, question.options[digit - 1].id);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [question, selectAnswer]);

  /**
   * Stage 1 no longer finishes the assessment. It hands off to the stream round,
   * which owns `finishAssessment()` — so the result is built once, after both
   * stages, and never twice.
   */
  function handleContinue() {
    if (!question) return;
    if (isLast) {
      router.push("/assessment/stream");
      return;
    }
    setBoxOpen(false);
    nextQuestion();
  }

  function handleSkip() {
    if (!question) return;
    if (isLast) {
      router.push("/assessment/stream");
      return;
    }
    setBoxOpen(false);
    skipQuestion();
  }

  if (!mounted || !student.name || !question) {
    return (
      <main className="grid min-h-dvh place-items-center bg-arctic px-6">
        <div className="text-center">
          <div className="mx-auto size-10 animate-pulse rounded-full bg-orange/20" />
          <p className="mt-4 text-sm text-slate-ink">Setting up your quest…</p>
        </div>
      </main>
    );
  }

  return (
    // pb-32 on phones keeps the closing links clear of the pinned action bar.
    <main className="min-h-dvh bg-arctic pb-32 md:pb-16">
      <header className="border-b border-midnight/[0.07] bg-arctic/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Logo compact />
          <div className="hidden text-center sm:block">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-slate-ink">
              Question <span className="text-midnight">{String(currentIndex + 1).padStart(2, "0")}</span>{" "}
              / 10
            </p>
            <ProgressBar value={progress} className="mt-1.5 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <span className="chip !border-orange/25 !bg-peach !text-orange">
              <Zap className="size-3.5" aria-hidden="true" />
              {xp} XP
            </span>
            {/* `.chip` is declared outside Tailwind's utility layer, so its
                `display: inline-flex` beats the `hidden` utility and this chip
                stayed visible on phones — 16px of horizontal overflow at 390px.
                An unstyled wrapper carries the breakpoint instead. */}
            <span className="hidden sm:inline-flex">
              <span className="chip">
                <Trophy className="size-3.5 text-[light-dark(#1F9D8B,#4FD1BE)]" aria-hidden="true" />
                {answeredCount}/10 answered
              </span>
            </span>
          </div>
        </div>
        {/* The desktop header shows "Question 05 / 10" above the bar; phones
            drop that block, so the count rides alongside the bar instead. */}
        <div className="flex items-center gap-3 px-5 pb-3 sm:hidden">
          <ProgressBar value={progress} className="flex-1" />
          <span className="shrink-0 text-[0.68rem] font-bold tabular-nums text-slate-ink">
            {currentIndex + 1}
            <span className="text-slate-ink/50">/10</span>
          </span>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 pt-8 sm:px-8 sm:pt-10 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-ink">
              <span className="grid size-6 place-items-center rounded-lg bg-navy text-[0.6rem] text-white">
                {String(currentIndex + 1).padStart(2, "0")}
              </span>
              {question.kicker}
            </div>
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex - 1)}
                /* min-h-11 gives the 44px hit area; the negative block margin
                   keeps the kicker row the same visual height as before. */
                className="-my-2.5 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-slate-ink transition-colors hover:text-midnight md:my-0 md:min-h-0"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Back
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="display mt-4 max-w-2xl text-[1.85rem] leading-[1.12] text-balance text-midnight sm:text-[2.35rem]">
                {question.title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-ink">
                {question.description}
              </p>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2 md:mt-7">
                {question.options.map((option) => {
                  const active = selected === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => selectAnswer(question.id, option.id)}
                      aria-pressed={active}
                      whileHover={reduced ? undefined : { y: -2 }}
                      whileTap={reduced ? undefined : { scale: 0.99 }}
                      className={cn(
                        // Phones carry six to seven of these in a single column,
                        // so the card runs a little tighter there; from 768px up
                        // the two-column grid keeps the original p-4/gap-3.5.
                        "group relative flex items-start gap-3 rounded-2xl border bg-surface p-3.5 text-left transition-colors duration-200 md:gap-3.5 md:p-4",
                        active
                          ? "border-orange shadow-[0_18px_40px_-26px_rgba(255,107,53,0.9)]"
                          : "border-midnight/[0.09] hover:border-midnight/25",
                        option.id === "G" && "sm:col-span-2",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-xl transition-colors md:size-10",
                          active ? "bg-orange text-white" : "bg-arctic text-indigo group-hover:bg-fog",
                        )}
                      >
                        <OptionGlyph icon={option.icon} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-[0.9rem] font-bold leading-snug text-midnight">
                            {option.label}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border text-[0.55rem] font-bold",
                              active
                                ? "border-orange bg-orange text-white"
                                : "border-midnight/15 text-slate-ink/60",
                            )}
                          >
                            {active ? <Check className="size-2.5" strokeWidth={4} /> : option.id}
                          </span>
                        </span>
                        <span className="mt-1 block text-[0.72rem] leading-relaxed text-slate-ink">
                          {option.detail}
                        </span>
                      </span>
                      <span className="absolute inset-x-4 bottom-0 h-px bg-orange/0 transition-colors group-hover:bg-orange/20" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 min-h-[52px] md:mt-5">
            <AnimatePresence mode="wait">
              {selected && lastFeedback ? (
                <motion.div
                  key={`${question.id}-${selected}`}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  className="flex items-start gap-2.5 rounded-2xl border border-orange/20 bg-peach/70 px-4 py-3"
                  role="status"
                >
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-orange" aria-hidden="true" />
                  <p className="text-[0.8rem] font-medium leading-relaxed text-midnight">
                    {lastFeedback}
                    <span className="ml-2 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-[0.62rem] font-bold text-orange">
                      +100 XP
                    </span>
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  key="hint"
                  initial={false}
                  className="px-1 pt-2 text-[0.7rem] text-slate-ink"
                >
                  Measures: {question.measures}. Press 1–{question.options.length} on a keyboard to
                  choose.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Phones pin the primary action to the bottom of the viewport: the
              feedback line pushes it past the fold otherwise, and the step is
              "answer, then advance" on every one of the ten screens. From 768px
              up it returns to its inline place under the options. */}
          {/* A fixed bar is positioned against the viewport, not the body, so it
              ignores the body's safe-area padding — hence the explicit insets
              here for landscape notched phones. */}
          <div className="m-pinned-bar fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-midnight/[0.07] bg-arctic/95 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-3 backdrop-blur-xl md:static md:mt-6 md:bg-transparent md:px-0 md:pb-0 md:pt-5 md:backdrop-blur-none">
            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex min-h-11 shrink-0 items-center text-xs font-semibold text-slate-ink underline-offset-4 hover:text-midnight hover:underline md:min-h-0"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selected && !isLast}
              className="btn btn-primary flex-1 md:flex-none md:min-w-[190px]"
            >
              {isLast ? "Continue to stage 2" : selected ? "Continue" : "Choose an answer"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setBoxOpen((value) => !value)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-midnight/20 px-3.5 py-2 text-[0.7rem] font-semibold text-slate-ink transition hover:border-orange hover:text-orange md:min-h-0"
              aria-expanded={boxOpen}
            >
              <Gift className="size-3.5" aria-hidden="true" />
              Career mystery box
            </button>
            <AnimatePresence>
              {boxOpen && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduced ? undefined : { opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 max-w-xl rounded-2xl bg-fog/70 px-4 py-3 text-[0.78rem] leading-relaxed text-indigo">
                    {fact}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <OrbitCompanion profile={profile} step={currentIndex + 1} total={QUESTIONS.length} />
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 sm:px-8">
        <Link
          href="/discover"
          className="inline-flex min-h-11 items-center gap-1 text-[0.7rem] text-slate-ink hover:text-midnight md:min-h-0"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Change my details
        </Link>
        <p className="text-[0.68rem] text-slate-ink">
          There is no timer. Answer honestly, not impressively.
        </p>
      </div>
    </main>
  );
}
