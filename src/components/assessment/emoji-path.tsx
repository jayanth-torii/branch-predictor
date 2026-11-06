"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { StreamQuestion } from "@/lib/types";

/**
 * The trail across the top of stage 2. Each node is one question: unanswered
 * nodes are hollow, answered ones flip to that option's emoji, and a correct
 * answer lights the connecting segment behind it.
 *
 * It is the "path" half of the reward loop — progress you can see filling in —
 * while `EmojiBurst` below is the moment-of-correctness half.
 */
export function EmojiPath({
  questions,
  answers,
  currentIndex,
}: {
  questions: StreamQuestion[];
  answers: Record<string, string>;
  currentIndex: number;
}) {
  const reduced = useReducedMotion();

  return (
    <ol
      className="m-scroll-x flex items-center gap-1 overflow-x-auto py-1"
      aria-label={`Progress: question ${Math.min(currentIndex + 1, questions.length)} of ${questions.length}`}
    >
      {questions.map((question, index) => {
        const answer = answers[question.id];
        const chosen = question.options.find((option) => option.id === answer);
        const correct = Boolean(answer) && answer === question.correctId;
        const current = index === currentIndex;

        return (
          <li key={question.id} className="flex shrink-0 items-center gap-1">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`h-[2px] w-3 rounded-full transition-colors duration-500 sm:w-5 ${
                  answer ? "bg-orange/60" : "bg-midnight/10"
                }`}
              />
            )}
            <motion.span
              initial={false}
              animate={
                reduced
                  ? undefined
                  : { scale: current ? 1.12 : 1, y: current ? -2 : 0 }
              }
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className={`grid size-8 shrink-0 place-items-center rounded-full border text-sm transition-colors duration-300 sm:size-9 ${
                current
                  ? "border-orange bg-peach"
                  : answer
                    ? "border-orange/30 bg-surface"
                    : "border-midnight/12 bg-surface-2"
              }`}
            >
              {chosen ? (
                <span className="relative">
                  <span aria-hidden="true">{chosen.emoji}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1 -right-1 grid size-3.5 place-items-center rounded-full text-white ${
                      correct ? "bg-orange" : "bg-midnight/35"
                    }`}
                  >
                    {correct ? (
                      <Check className="size-2.5" strokeWidth={4} />
                    ) : (
                      <X className="size-2.5" strokeWidth={4} />
                    )}
                  </span>
                </span>
              ) : (
                <span className="text-[0.7rem] font-bold text-slate-ink">{index + 1}</span>
              )}
            </motion.span>
          </li>
        );
      })}
    </ol>
  );
}

/** Emojis thrown along arcs when an answer is correct. */
const ARCS = [
  { x: -120, y: -90, r: -24, d: 0 },
  { x: -60, y: -130, r: 14, d: 0.04 },
  { x: 0, y: -150, r: -8, d: 0.08 },
  { x: 60, y: -130, r: 20, d: 0.12 },
  { x: 120, y: -90, r: -18, d: 0.16 },
  { x: -90, y: -40, r: 10, d: 0.06 },
  { x: 90, y: -40, r: -12, d: 0.1 },
];

const CONFETTI = ["🎉", "✨", "⭐", "🔥", "💡", "🎯", "🚀"];

/**
 * Fires once per correct answer. Purely decorative, so the whole thing is
 * `aria-hidden` — the result is announced in text by the page's live region.
 * Returns null entirely under reduced motion rather than animating in place.
 */
export function EmojiBurst({ fireKey, emoji }: { fireKey: string | null; emoji: string }) {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex justify-center"
    >
      <AnimatePresence>
        {fireKey && (
          <motion.div key={fireKey} className="relative">
            {ARCS.map((arc, index) => (
              <motion.span
                key={index}
                className="absolute text-2xl"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.4, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: arc.x,
                  y: [0, arc.y, arc.y + 40],
                  scale: [0.4, 1.15, 0.9],
                  rotate: arc.r,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, delay: arc.d, ease: [0.16, 1, 0.3, 1] }}
              >
                {index === 2 ? emoji : CONFETTI[index % CONFETTI.length]}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
