"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { Reveal } from "@/components/ui";
import { COURSES } from "@/lib/courses";
import { DIMENSION_META, type Dimension } from "@/lib/types";

/* ══════════════════════════════════════════════════════════════════════════
   EXPLAINABLE BY DESIGN — one annotated match, not a console.

   The previous version was a looping dashboard: "INPUT", "OUTPUT",
   "Step 6 / 6", "Replay". That is developer language in a generic rectangle,
   and it made the reader watch six states go past before understanding
   anything.

   This shows a SINGLE match and annotates its own reasoning. Three numbered
   claims on the left; the same three numbers marked on the card on the right,
   against the exact part each claim is about. The explanation and the evidence
   become one object, and there is nothing to wait for.
   ══════════════════════════════════════════════════════════════════════════ */

const SAMPLE_COURSE = COURSES.find((course) => course.slug === "bca") ?? COURSES[0];

/** Illustrative overlap between a sample profile and the course's own profile. */
const OVERLAP: { dimension: Dimension; you: number; course: number }[] = [
  { dimension: "technology", you: 82, course: 90 },
  { dimension: "analytical", you: 76, course: 70 },
  { dimension: "creativity", you: 64, course: 45 },
  { dimension: "business", you: 36, course: 40 },
];

const CLAIMS = [
  {
    n: 1,
    title: "A rule decides it, not a mood",
    body: "Your six dimension scores are weighed against each course's own profile by one fixed formula. Same answers in, same result out, every time.",
  },
  {
    n: 2,
    title: "Eligibility gates, it never flatters",
    body: "If your stream does not usually meet the subject requirement, the course is marked — not quietly re-ranked, and never hidden from you.",
  },
  {
    n: 3,
    title: "No invented precision",
    body: "Ten questions cannot honestly produce a 92% match. You get three labels, and the sentence that earned them.",
  },
];

/** Ties a part of the card to a claim on the left. */
function Marker({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-[1.15rem] shrink-0 place-items-center rounded-full bg-orange text-[0.6rem] font-bold text-white ring-2 ring-[var(--color-navy)]"
    >
      {n}
    </span>
  );
}

export function ExplainableSection() {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.3 });
  const shown = reduced || inView;

  return (
    <section
      id="recommendation"
      className="band-dark relative isolate overflow-hidden border-y border-white/10"
    >
      <div className="aurora" aria-hidden="true" />

      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow">Explainable by design</p>
            <h2 className="display mt-2 text-[1.75rem] leading-[1.1] text-balance text-midnight sm:text-[2.2rem]">
              Every match shows its working.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-ink">
              Most career quizzes hand you a verdict. Here is one real match, with the three things
              that produced it marked on the card itself.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
          {/* ── The three claims ─────────────────────────────────────────── */}
          <Reveal>
            <ol className="space-y-5">
              {CLAIMS.map((claim) => (
                <li key={claim.n} className="flex gap-3.5">
                  <Marker n={claim.n} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-midnight">{claim.title}</p>
                    <p className="mt-1 text-[0.82rem] leading-relaxed text-slate-ink">
                      {claim.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/discover"
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-orange hover:underline md:min-h-0"
            >
              Run it on your own answers
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>

          {/* ── The annotated card ───────────────────────────────────────── */}
          <Reveal delay={0.08}>
            <div ref={cardRef} className="glass glass-sheen relative overflow-hidden p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="eyebrow">Illustrative match</p>
                  <h3 className="display mt-1 text-xl text-midnight">{SAMPLE_COURSE.name}</h3>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-ink">
                    {SAMPLE_COURSE.category}
                  </p>
                </div>
                {/* Claim 3 — a label, never a percentage. */}
                <div className="flex shrink-0 items-center gap-2">
                  <Marker n={3} />
                  <span className="rounded-full bg-orange px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wide text-white">
                    Strong Match
                  </span>
                </div>
              </div>

              {/* Claim 1 — the overlap the rule actually measures. */}
              <div className="mt-6 flex items-center gap-2">
                <Marker n={1} />
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-ink">
                  Where you and this course overlap
                </p>
              </div>

              <ul className="mt-3 space-y-2.5">
                {OVERLAP.map((row, index) => {
                  const meta = DIMENSION_META[row.dimension];
                  const overlap = Math.min(row.you, row.course);
                  return (
                    <li key={row.dimension} className="flex items-center gap-3">
                      <span className="w-[5.5rem] shrink-0 text-[0.72rem] font-semibold text-midnight">
                        {meta.short}
                      </span>
                      <span className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-midnight/[0.1]">
                        {/* What the course asks for, as a ghost. */}
                        <span
                          className="absolute inset-y-0 left-0 rounded-full opacity-25"
                          style={{ width: `${row.course}%`, background: meta.color }}
                        />
                        {/* Your signal, drawn over it. */}
                        <motion.span
                          className="absolute inset-y-0 left-0 origin-left rounded-full"
                          style={{ width: `${overlap}%`, background: meta.color }}
                          initial={reduced ? false : { scaleX: 0 }}
                          animate={shown ? { scaleX: 1 } : { scaleX: 0 }}
                          transition={{
                            duration: 0.7,
                            delay: 0.1 + index * 0.08,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2.5 text-[0.68rem] text-slate-ink">
                Solid is your signal, ghost is what the course asks for. Shape, not a score.
              </p>

              {/* Claim 2 — the gate, stated plainly. */}
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-midnight/10 bg-surface-2/60 px-3.5 py-3">
                <Marker n={2} />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[0.78rem] font-bold text-midnight">
                    <Lock className="size-3.5 text-orange" aria-hidden="true" />
                    Stream gate: open
                  </p>
                  <p className="mt-0.5 text-[0.78rem] leading-relaxed text-slate-ink">
                    {SAMPLE_COURSE.eligibilityNotes}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-midnight/10 pt-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-ink">
                  The sentence this produced
                </p>
                <p className="mt-1.5 text-[0.88rem] leading-relaxed text-midnight">
                  &ldquo;{SAMPLE_COURSE.whyItFits}&rdquo;
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
