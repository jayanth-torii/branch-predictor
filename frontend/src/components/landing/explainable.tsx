"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  ChartNoAxesColumn,
  Code2,
  Layers,
  Lightbulb,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui";
import { GateChecklist, LaurelCrest, StudyScene } from "@/components/landing/landing-art";
import { COURSES } from "@/lib/courses";
import { DIMENSION_META, type Dimension } from "@/lib/types";

/* ══════════════════════════════════════════════════════════════════════════
   EXPLAINABLE BY DESIGN — one annotated match, not a console.

   Left: the badge, the claim, the study scene and the three rules the engine
   actually follows. Right: a single match card showing those rules happening
   — the crest, the headline score, the overlap the rule measured, the
   eligibility gate and the sentence the engine wrote.

   The band is LIGHT; the card carries the dark weight by itself. Two dark
   slabs stacked on one page buries the card, which is the thing worth
   looking at.

   Every value on the card comes from the real catalogue entry in courses.ts —
   the name, the category, the dimension profile, the eligibility rule and the
   closing sentence. Nothing is typed in twice, so the showcase cannot drift
   away from what the product would actually say. The headline figure is the
   strongest overlap on the card, derived, not keyed in beside bars that would
   then be free to disagree with it.
   ══════════════════════════════════════════════════════════════════════════ */

const SAMPLE_COURSE = COURSES.find((course) => course.slug === "bca") ?? COURSES[0];

/**
 * One illustrative student profile. The bar draws the OVERLAP — the smaller of
 * what the student scored and what the course actually leans on — so a course
 * can never appear to want more of you than it does.
 */
const STUDENT_PROFILE: Partial<Record<Dimension, number>> = {
  technology: 94,
  analytical: 78,
  creativity: 67,
  business: 54,
};

const ROW_DIMENSIONS: { dimension: Dimension; icon: LucideIcon }[] = [
  { dimension: "technology", icon: Code2 },
  { dimension: "analytical", icon: TrendingUp },
  { dimension: "creativity", icon: Lightbulb },
  { dimension: "business", icon: Briefcase },
];

const ROWS = ROW_DIMENSIONS.map(({ dimension, icon }) => {
  const courseWeight = Math.round((SAMPLE_COURSE.interests[dimension] ?? 0) * 100);
  return {
    dimension,
    icon,
    label: DIMENSION_META[dimension].short,
    color: DIMENSION_META[dimension].color,
    overlap: Math.min(STUDENT_PROFILE[dimension] ?? 0, courseWeight),
  };
});

/** The ring reports the strongest overlap, so it can never contradict a bar. */
const HEADLINE_SCORE = Math.max(...ROWS.map((row) => row.overlap));

const CLAIMS: { icon: LucideIcon; tint: "peach" | "fog"; title: string; body: string }[] = [
  {
    icon: Target,
    tint: "peach",
    title: "A rule decides it, not a mood",
    body: "Your six dimension scores are weighed against each course's own profile by one fixed formula. Same answers in, same result out, every time.",
  },
  {
    icon: Layers,
    tint: "fog",
    title: "Eligibility gates, it never flatters",
    body: "If your stream does not usually meet the subject requirement, the course is marked — not quietly re-ranked, and never hidden from you.",
  },
  {
    icon: ShieldCheck,
    tint: "peach",
    title: "No invented precision",
    body: "Every figure on the card is an overlap you can trace back to an answer. Nothing is rounded up to sound more certain than it is.",
  },
];

/* Ring geometry. r is chosen so the 14px stroke sits inside the 128 box with
   room for the glow; the circumference is derived rather than measured. */
const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;

export function ExplainableSection() {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.25 });
  const shown = reduced || inView;

  return (
    <section
      id="recommendation"
      className="relative isolate overflow-hidden border-y border-midnight/[0.07] bg-arctic"
    >
      {/* Ambient wash. Two large, heavily blurred fields plus the two corner
          waves from the print layout — big enough that no edge lands inside
          the reading area, and clipped by the section so none of it can
          widen the page. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -right-48 -top-56 block size-[46rem] rounded-full bg-orange/[0.09] blur-3xl" />
        <span className="absolute -bottom-56 -left-48 block size-[42rem] rounded-full bg-[var(--color-navy)]/[0.07] blur-3xl" />
        <svg
          viewBox="0 0 400 220"
          preserveAspectRatio="none"
          className="absolute -right-10 -top-6 h-40 w-[26rem] opacity-80 sm:h-52"
        >
          <path d="M120 0 C 210 40 250 10 400 70 L400 0 Z" fill="var(--color-orange)" opacity="0.5" />
          <path d="M196 0 C 268 44 300 24 400 96 L400 0 Z" fill="var(--color-orange-soft)" opacity="0.4" />
        </svg>
        <svg
          viewBox="0 0 400 160"
          preserveAspectRatio="none"
          className="absolute -bottom-6 -left-10 h-28 w-[24rem] opacity-70 sm:h-36"
        >
          <path d="M0 60 C 90 110 150 70 280 160 L0 160 Z" fill="var(--color-orange)" opacity="0.4" />
          <path d="M0 110 C 70 140 110 118 190 160 L0 160 Z" fill="var(--color-orange-soft)" opacity="0.4" />
        </svg>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid items-center gap-11 lg:grid-cols-[0.84fr_1.16fr] lg:gap-14">
          {/* ── Left: the argument ───────────────────────────────────────── */}
          <Reveal>
            {/* Badge. A raised pill rather than the bare eyebrow the other
                bands use — this is the section's own mark, and it needs to
                survive sitting on top of the corner wave. */}
            <span className="inline-flex items-center gap-2.5 rounded-full bg-surface py-2 pl-3 pr-4 shadow-soft ring-1 ring-midnight/[0.07]">
              <span className="grid size-6 place-items-center rounded-lg bg-peach text-orange">
                <Layers className="size-[0.95rem]" strokeWidth={2.6} aria-hidden="true" />
              </span>
              <span className="text-[0.82rem] font-bold tracking-tight text-midnight">
                Explained by Design
              </span>
              <span aria-hidden="true" className="size-2 rounded-full bg-orange" />
            </span>

            <h2 className="display mt-5 text-[2.1rem] leading-[1.06] text-balance text-midnight sm:text-[2.7rem]">
              Every match shows its{" "}
              <span className="relative inline-block text-orange">
                Working.
                {/* Symmetric arc in em units, so it tracks the headline as it
                    scales instead of lining up at only one breakpoint. */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute left-0 top-[0.95em] h-[0.15em] w-full overflow-visible"
                >
                  <path
                    d="M6 14 Q 100 3 194 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Three sparks off the last word, echoed in the study scene. */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 40 40"
                  className="pointer-events-none absolute -right-[1.6em] -top-[0.35em] h-[1.1em] w-[1.1em] overflow-visible"
                  stroke="currentColor"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                >
                  <path d="M4 20 L16 14" />
                  <path d="M10 6 L18 16" />
                  <path d="M26 2 L24 14" />
                </svg>
              </span>
            </h2>

            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-slate-ink">
              Most career quizzes hand you a verdict. Here is one real match, with the three things
              that produced it marked on the card itself.
            </p>

            <StudyScene className="mt-6 w-full max-w-sm" />

            <ul className="mt-6 space-y-5">
              {CLAIMS.map((claim) => (
                <li key={claim.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className={`grid size-12 shrink-0 place-items-center rounded-2xl shadow-soft ring-1 ring-midnight/[0.05] ${
                      claim.tint === "peach" ? "bg-peach text-orange" : "bg-fog text-indigo"
                    }`}
                  >
                    <claim.icon className="size-[1.35rem]" strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[1.02rem] font-bold leading-snug text-midnight">
                      {claim.title}
                    </p>
                    <p className="mt-1.5 text-[0.86rem] leading-relaxed text-slate-ink">
                      {claim.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/discover"
              className="btn-primary mt-9 inline-flex min-h-14 items-center gap-4 rounded-full py-2 pl-7 pr-2 text-[1rem] font-bold transition"
            >
              Run it on your own answers
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20"
              >
                <ArrowRight className="size-[1.15rem]" strokeWidth={2.6} />
              </span>
            </Link>
          </Reveal>

          {/* ── Right: the match card ────────────────────────────────────── */}
          <Reveal delay={0.08} className="relative">
            <div
              ref={cardRef}
              className="rounded-[1.9rem] bg-[var(--color-navy)] p-2 shadow-[0_40px_90px_-50px_rgba(16,27,61,0.65)] ring-1 ring-midnight/[0.08]"
            >
              {/* ── Header: who this card is about, and the crest ───────── */}
              <div className="relative overflow-hidden rounded-[1.45rem] px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
                <LaurelCrest className="pointer-events-none absolute -top-1 right-2 hidden w-[7.5rem] opacity-95 sm:block lg:w-[8.5rem]" />
                <div className="relative sm:pr-32 lg:pr-36">
                  <p className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/55">
                    <Layers className="size-3.5 text-orange" aria-hidden="true" />
                    Illustrative match
                  </p>
                  <h3 className="display mt-2 text-[1.7rem] leading-tight text-white sm:text-[2.05rem]">
                    {SAMPLE_COURSE.name}
                  </h3>
                  <p className="mt-0.5 text-[0.9rem] text-white/60">{SAMPLE_COURSE.category}</p>
                </div>
              </div>

              {/* ── Headline score ──────────────────────────────────────── */}
              <div className="mx-2 mb-2 rounded-[1.4rem] border border-orange/40 bg-white/[0.045] px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
                  <div className="relative grid size-[7.4rem] shrink-0 place-items-center">
                    <span
                      aria-hidden="true"
                      className="absolute inset-3 rounded-full bg-orange/25 blur-xl"
                    />
                    <svg viewBox="0 0 128 128" className="absolute inset-0 -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r={RING_R}
                        fill="none"
                        stroke="#ffffff"
                        strokeOpacity="0.12"
                        strokeWidth="13"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r={RING_R}
                        fill="none"
                        stroke="var(--color-orange)"
                        strokeWidth="13"
                        strokeLinecap="round"
                        strokeDasharray={RING_C}
                        initial={reduced ? false : { strokeDashoffset: RING_C }}
                        animate={{
                          strokeDashoffset: shown
                            ? RING_C * (1 - HEADLINE_SCORE / 100)
                            : RING_C,
                        }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                      />
                    </svg>
                    <span className="relative text-center">
                      <span className="display block text-[1.7rem] leading-none text-white">
                        {HEADLINE_SCORE}%
                      </span>
                      <span className="mt-1 block text-[0.72rem] font-semibold text-white/65">
                        Overlap
                      </span>
                    </span>
                  </div>

                  <span
                    aria-hidden="true"
                    className="hidden h-[5.5rem] w-px shrink-0 bg-white/15 sm:block"
                  />

                  <div className="min-w-[12rem] flex-1">
                    {/* A label, never a verdict dressed as a decimal. */}
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange px-4 py-2 text-[0.88rem] font-bold text-white">
                      <Trophy className="size-4" aria-hidden="true" />
                      Strong Match
                    </span>
                    <p className="mt-2.5 text-[0.88rem] leading-relaxed text-white/70">
                      High alignment with your profile and interest pattern.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Claim 1: the overlap the rule measured ──────────────── */}
              <div className="mx-2 mb-2 rounded-[1.4rem] bg-surface px-5 py-5 sm:px-6">
                <p className="flex items-center gap-2.5 text-[1.02rem] font-bold text-midnight">
                  <ChartNoAxesColumn
                    className="size-[1.15rem] text-orange"
                    strokeWidth={2.6}
                    aria-hidden="true"
                  />
                  Where you and this course overlap
                </p>

                <ul className="mt-4 space-y-3">
                  {ROWS.map((row, index) => (
                    <li key={row.dimension} className="flex items-center gap-3">
                      <row.icon
                        className="size-[1.1rem] shrink-0"
                        style={{ color: row.color }}
                        strokeWidth={2.3}
                        aria-hidden="true"
                      />
                      <span className="w-[5.2rem] shrink-0 text-[0.86rem] font-semibold text-midnight sm:w-[6rem]">
                        {row.label}
                      </span>
                      <span className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-midnight/[0.09]">
                        <motion.span
                          className="absolute inset-y-0 left-0 origin-left rounded-full"
                          style={{ width: `${row.overlap}%`, background: row.color }}
                          initial={reduced ? false : { scaleX: 0 }}
                          animate={shown ? { scaleX: 1 } : { scaleX: 0 }}
                          transition={{
                            duration: 0.75,
                            delay: 0.12 + index * 0.09,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      </span>
                      <span className="shrink-0 rounded-lg bg-fog px-2.5 py-1 text-[0.8rem] font-bold tabular-nums text-midnight">
                        {row.overlap}%
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-3.5 text-[0.75rem] leading-relaxed text-slate-ink">
                  Each bar is the smaller of your score and what the course actually leans on, so a
                  course can never look like it wants more of you than it does.
                </p>
              </div>

              {/* ── Claim 2: the gate, stated plainly ───────────────────── */}
              <div className="relative mx-2 mb-2 overflow-hidden rounded-[1.4rem] bg-peach px-5 py-5 sm:px-6">
                <GateChecklist className="pointer-events-none absolute -bottom-2 right-3 hidden w-[6.5rem] drop-shadow-[0_12px_22px_rgba(16,27,61,0.14)] lg:block" />
                <div className="relative lg:pr-[7.5rem]">
                  <p className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[1.02rem] font-bold text-midnight">
                    <Users className="size-[1.15rem] text-orange" strokeWidth={2.3} aria-hidden="true" />
                    Stream gate:
                    <span className="rounded-full bg-orange px-3 py-0.5 text-[0.8rem] font-bold text-white">
                      Open
                    </span>
                  </p>
                  <p className="mt-2.5 text-[0.84rem] leading-relaxed text-slate-ink">
                    {SAMPLE_COURSE.eligibilityNotes}
                  </p>
                </div>
              </div>

              {/* ── Claim 3: the sentence, and only the sentence ────────── */}
              <div className="mx-2 mb-2 rounded-[1.4rem] bg-fog px-5 py-5 sm:px-6">
                <p className="flex items-center gap-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-ink">
                  <span aria-hidden="true" className="h-px w-5 bg-orange" />
                  The sentence this produced
                </p>
                <blockquote className="relative mt-3 px-7">
                  <span
                    aria-hidden="true"
                    className="display absolute left-0 top-[-0.4rem] text-[2.1rem] leading-none text-indigo/40"
                  >
                    &ldquo;
                  </span>
                  <p className="text-[0.92rem] italic leading-relaxed text-midnight">
                    {SAMPLE_COURSE.whyItFits}
                  </p>
                  <span
                    aria-hidden="true"
                    className="display absolute -bottom-3 right-0 text-[2.1rem] leading-none text-indigo/40"
                  >
                    &rdquo;
                  </span>
                </blockquote>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
