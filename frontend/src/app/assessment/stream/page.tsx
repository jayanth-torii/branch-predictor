"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Lightbulb, Sparkles, Target, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmojiBurst, EmojiPath } from "@/components/assessment/emoji-path";
import { Logo } from "@/components/logo";
import { ProgressBar } from "@/components/ui";
import { useHydrated } from "@/lib/client-hooks";
import { useQuestionBank } from "@/lib/question-source";
import { usePathora } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function StreamQuizPage() {
  const router = useRouter();
  const mounted = useHydrated();
  const reduced = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [burstKey, setBurstKey] = useState<string | null>(null);

  const student = usePathora((state) => state.student);
  const xp = usePathora((state) => state.xp);
  const streamAnswers = usePathora((state) => state.streamAnswers);
  const streamIndex = usePathora((state) => state.streamIndex);
  const answerStreamQuestion = usePathora((state) => state.answerStreamQuestion);
  const nextStreamQuestion = usePathora((state) => state.nextStreamQuestion);
  const finishAssessment = usePathora((state) => state.finishAssessment);

  const bank = useQuestionBank();
  // Memoised: a fresh array every render would re-fire the effect below.
  const questions = useMemo(
    () => (student.stream ? (bank.stream[student.stream] ?? []) : []),
    [bank.stream, student.stream],
  );
  const setQuestionBanks = usePathora((state) => state.setQuestionBanks);
  useEffect(() => {
    // Stage 2 is marked against its own correctId, so the bank the student sat
    // has to reach the store before they finish.
    setQuestionBanks(
      bank.source === "server" ? bank.core : null,
      bank.source === "server" ? questions : null,
    );
  }, [bank.source, bank.core, questions, setQuestionBanks]);
  const question = questions[streamIndex];
  const chosenId = question ? streamAnswers[question.id] : undefined;
  const answered = Boolean(chosenId);
  const isCorrect = answered && chosenId === question?.correctId;
  const isLast = streamIndex >= questions.length - 1;
  const answeredCount = questions.filter((q) => streamAnswers[q.id]).length;

  useEffect(() => {
    if (mounted && !student.name) router.replace("/discover");
  }, [mounted, student.name, router]);

  /**
   * A stream with no questions authored yet must not strand the student on a
   * blank screen — finish the assessment and move them on exactly as stage 1
   * used to.
   */
  useEffect(() => {
    if (!mounted || !student.name) return;
    if (questions.length === 0) {
      finishAssessment();
      router.replace("/analyzing");
    }
  }, [mounted, student.name, questions.length, finishAssessment, router]);

  function choose(optionId: string) {
    if (!question || answered) return;
    answerStreamQuestion(question.id, optionId);
    // The question id is key enough: an answer is locked once given, so each
    // question can fire at most one burst. (A timestamp here also trips
    // react-hooks/purity.)
    if (optionId === question.correctId) setBurstKey(question.id);
  }

  function advance() {
    setBurstKey(null);
    if (isLast) {
      finishAssessment();
      router.push("/analyzing");
      return;
    }
    nextStreamQuestion();
  }

  if (!mounted || !student.name || questions.length === 0 || !question) {
    return (
      <main className="grid min-h-dvh place-items-center bg-arctic px-6">
        <div className="text-center">
          <div className="mx-auto size-10 animate-pulse rounded-full bg-orange/20" />
          <p className="mt-4 text-sm text-slate-ink">Loading your stream round…</p>
        </div>
      </main>
    );
  }

  // ── Stage transition ────────────────────────────────────────────────────
  if (!started) {
    return (
      <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-arctic px-5 py-12">
        <div className="aurora" aria-hidden="true" />
        <div className="glass glass-sheen relative w-full max-w-lg p-7 text-center sm:p-10">
          <span className="glow left-1/2 top-0 size-48 -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
          <span className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-peach text-orange">
            <Check className="size-7" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <p className="eyebrow relative mt-5">Stage 1 complete</p>
          <h1 className="display relative mt-2 text-[1.7rem] leading-tight text-balance text-midnight sm:text-[2.1rem]">
            Your interest profile is formed.
          </h1>
          <p className="relative mt-3 text-sm leading-relaxed text-slate-ink">
            Now a different kind of round: {questions.length} quick questions from your{" "}
            <strong className="text-midnight">{student.stream}</strong> subjects. These ones do have
            a right answer — but nothing here changes your profile or your course matches. It is
            just to see how you think, and it is genuinely fun.
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-2">
            <span className="chip chip-sm">
              <Zap className="size-3.5 text-orange" aria-hidden="true" />
              {xp} XP so far
            </span>
            <span className="chip chip-sm">
              <Target className="size-3.5 text-orange" aria-hidden="true" />
              No score shown
            </span>
          </div>
          <button type="button" onClick={() => setStarted(true)} className="btn btn-primary relative mt-7 w-full">
            Start the {student.stream} round
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              finishAssessment();
              router.push("/analyzing");
            }}
            className="relative mt-3 inline-flex min-h-11 w-full items-center justify-center text-xs font-semibold text-slate-ink underline-offset-4 hover:text-midnight hover:underline md:min-h-0"
          >
            Skip to my results
          </button>
        </div>
      </main>
    );
  }

  // ── The quiz ────────────────────────────────────────────────────────────
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-arctic pb-32 md:pb-16">
      <div className="aurora opacity-60" aria-hidden="true" />

      <header className="relative border-b border-midnight/[0.07]">
        <div className="mx-auto flex h-[70px] w-full max-w-4xl items-center justify-between gap-4 px-5 sm:px-8">
          <Logo compact />
          <div className="flex items-center gap-2">
            <span className="chip chip-sm !border-orange/25 !bg-peach !text-orange">
              <Zap className="size-3.5" aria-hidden="true" />
              {xp} XP
            </span>
            <span className="chip chip-sm hidden sm:inline-flex">
              {answeredCount}/{questions.length} done
            </span>
          </div>
        </div>
        <div className="px-5 pb-3 sm:px-8">
          <ProgressBar value={((streamIndex + 1) / questions.length) * 100} />
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-3xl px-5 pt-6 sm:px-8">
        <EmojiPath questions={questions} answers={streamAnswers} currentIndex={streamIndex} />

        <div className="relative mt-6">
          <EmojiBurst fireKey={burstKey} emoji={question.options.find((o) => o.id === chosenId)?.emoji ?? "🎉"} />

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow">
                {question.kicker} · {student.stream}
              </p>
              <h1 className="display mt-2 text-[1.5rem] leading-[1.15] text-balance text-midnight sm:text-[2rem]">
                {question.title}
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-ink">{question.prompt}</p>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {question.options.map((option) => {
                  const picked = chosenId === option.id;
                  const isAnswer = option.id === question.correctId;
                  const reveal = answered && isAnswer;
                  const wrongPick = answered && picked && !isAnswer;
                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      disabled={answered}
                      onClick={() => choose(option.id)}
                      aria-pressed={picked}
                      whileTap={reduced || answered ? undefined : { scale: 0.99 }}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors duration-200",
                        reveal
                          ? "border-orange bg-peach"
                          : wrongPick
                            ? "border-midnight/20 bg-surface-2"
                            : "border-midnight/[0.09] bg-surface",
                        !answered && "hover:border-midnight/25",
                        answered && !reveal && !wrongPick && "opacity-55",
                      )}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-arctic text-xl">
                        <span aria-hidden="true">{option.emoji}</span>
                      </span>
                      <span className="min-w-0 flex-1 text-[0.9rem] font-semibold leading-snug text-midnight">
                        {option.label}
                      </span>
                      {reveal && <Check className="size-4 shrink-0 text-orange" strokeWidth={3} aria-hidden="true" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* One live region announces the outcome, so the decorative burst
                  can stay aria-hidden. */}
              <div className="mt-5 min-h-[86px]" role="status" aria-live="polite">
                <AnimatePresence mode="wait">
                  {answered && (
                    <motion.div
                      key={`${question.id}-explain`}
                      initial={reduced ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? undefined : { opacity: 0 }}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl border px-4 py-3.5",
                        isCorrect ? "border-orange/25 bg-peach/70" : "border-midnight/10 bg-surface",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full",
                          isCorrect ? "bg-orange text-white" : "bg-fog text-indigo",
                        )}
                      >
                        {isCorrect ? (
                          <Sparkles className="size-3.5" aria-hidden="true" />
                        ) : (
                          <Lightbulb className="size-3.5" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.82rem] font-bold text-midnight">
                          {isCorrect ? "Spot on." : "Not quite — here is the idea."}
                        </p>
                        <p className="mt-1 text-[0.82rem] leading-relaxed text-slate-ink">
                          {question.explanation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Phones pin the action; from md it returns inline. Mirrors stage 1. */}
      <div className="m-pinned-bar fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-midnight/[0.07] bg-arctic/95 px-5 pt-3 backdrop-blur-xl md:static md:mx-auto md:mt-8 md:max-w-3xl md:bg-transparent md:px-8 md:pb-0 md:pt-5 md:backdrop-blur-none">
        <Link
          href="/assessment"
          className="shrink-0 text-xs font-semibold text-slate-ink underline-offset-4 hover:text-midnight hover:underline"
        >
          Back to stage 1
        </Link>
        <button
          type="button"
          onClick={advance}
          disabled={!answered}
          className="btn btn-primary flex-1 md:flex-none md:min-w-[200px]"
        >
          {isLast ? "See my results" : answered ? "Next question" : "Pick an answer"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
