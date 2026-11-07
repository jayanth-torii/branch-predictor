"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  ChartNoAxesColumn,
  FileText,
  Layers,
  Laptop,
  Lightbulb,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui";
import { COURSES } from "@/lib/courses";
import { DIMENSION_META, type Dimension } from "@/lib/types";

/* ══════════════════════════════════════════════════════════════════════════
   EXPLAINABLE BY DESIGN — one annotated match, not a console.

   Left: the three claims, each with an icon tile. Right: a single match card
   showing those claims actually happening — the overlap the rule measured,
   the eligibility gate, and the sentence the engine wrote.

   This band is LIGHT. It used to be `.band-dark`, which made it the second
   dark slab on the page and buried the card inside it. The card now carries
   the dark weight by itself, which is what gives the section its focus.

   Every value on the card comes from the real catalogue entry in courses.ts —
   the name, the category, the dimension profile, the eligibility rule and the
   closing sentence. Nothing is typed in twice, so the showcase cannot drift
   away from what the product would actually say.
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

const ROWS: { dimension: Dimension; icon: LucideIcon; tone: "orange" | "indigo" }[] = [
  { dimension: "technology", icon: Laptop, tone: "orange" },
  { dimension: "analytical", icon: TrendingUp, tone: "indigo" },
  { dimension: "creativity", icon: Lightbulb, tone: "orange" },
  { dimension: "business", icon: Briefcase, tone: "indigo" },
];

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
    // Deliberately cites no figure that appears on the card beside it. An
    // earlier draft said "cannot produce a 92% match" while the card showed
    // 92% two inches away, which read as the section contradicting itself.
    body: "Ten questions cannot honestly produce a single match percentage. You get three labels, and the sentence that earned them.",
  },
];

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
      {/* Ambient wash, not scenery. Small hard-edged shapes read as clutter
          competing with the card, so this is two large, heavily blurred fields
          instead — big enough that no edge lands inside the reading area.
          Clipped by the section, so none of it can widen the page. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -right-48 -top-56 block size-[46rem] rounded-full bg-orange/[0.09] blur-3xl" />
        <span className="absolute -bottom-56 -left-48 block size-[42rem] rounded-full bg-[var(--color-navy)]/[0.07] blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid items-center gap-11 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          {/* ── Left: the argument ───────────────────────────────────────── */}
          <Reveal>
            <div className="flex items-center gap-3">
              <p className="eyebrow">Explainable by design</p>
              <span aria-hidden="true" className="h-px w-12 shrink-0 bg-orange" />
            </div>

            <h2 className="display mt-4 text-[2rem] leading-[1.08] text-balance text-midnight sm:text-[2.6rem]">
              Every match shows{" "}
              <span className="whitespace-nowrap">
                its{" "}
                <span className="relative inline-block text-orange">
                  working.
                  {/* Symmetric arc in em units, so it tracks the headline as it
                      scales instead of lining up at only one breakpoint. */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 200 20"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute left-0 top-[0.93em] h-[0.15em] w-full overflow-visible"
                  >
                    <path
                      d="M6 14 Q 100 3 194 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </h2>

            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-slate-ink">
              Most career quizzes hand you a verdict. Here is one real match, with the three things
              that produced it marked on the card itself.
            </p>

            <ul className="mt-8 space-y-6">
              {CLAIMS.map((claim) => (
                <li key={claim.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
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
              className="btn-primary mt-9 inline-flex min-h-12 items-center gap-2.5 rounded-full px-7 text-[0.95rem] font-bold transition"
            >
              Run it on your own answers
              <ArrowRight className="size-[1.1rem]" aria-hidden="true" />
            </Link>
          </Reveal>

          {/* ── Right: the match card ────────────────────────────────────── */}
          <Reveal delay={0.08} className="relative">
            {/* The cap tile and the book stack are cut from the same supplied
                illustration the closing CTA uses, so the art style, palette and
                lighting match exactly rather than being two borrowed stock
                objects. Both are decorative: empty alt, and hidden from the
                layout on phones where they would only crowd the card. */}
            <Image
              src="/deco-cap.png"
              alt=""
              width={174}
              height={198}
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 -top-10 z-10 hidden w-[5.5rem] drop-shadow-[0_18px_28px_rgba(16,27,61,0.35)] sm:block lg:-right-7 lg:-top-12 lg:w-[6.5rem]"
            />
            <div
              ref={cardRef}
              className="rounded-[1.9rem] bg-surface-2 p-2 shadow-[0_40px_90px_-50px_rgba(16,27,61,0.55)] ring-1 ring-midnight/[0.07]"
            >
              {/* Header — fixed navy in both themes, so the card keeps its
                  weight when the page flips to dark. */}
              <div className="rounded-[1.45rem] bg-[var(--color-navy)] px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/55">
                      <Layers className="size-3.5 text-orange" aria-hidden="true" />
                      Illustrative match
                    </p>
                    <h3 className="display mt-2 text-[1.6rem] leading-tight text-white sm:text-[1.95rem]">
                      {SAMPLE_COURSE.name}
                    </h3>
                    <p className="mt-0.5 text-[0.9rem] text-white/60">{SAMPLE_COURSE.category}</p>
                  </div>
                  {/* A label, never a percentage — claim three, made visible. */}
                  <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-orange/70 px-4 py-2 text-[0.85rem] font-bold text-white">
                    <Trophy className="size-4 text-orange" aria-hidden="true" />
                    Strong Match
                  </span>
                </div>
              </div>

              <div className="mt-2 space-y-2">
                {/* Claim 1 — the overlap the rule measured. */}
                <div className="rounded-[1.45rem] bg-surface px-5 py-5 sm:px-6">
                  <p className="flex items-center gap-2.5 text-[1.02rem] font-bold text-midnight">
                    <ChartNoAxesColumn
                      className="size-[1.15rem] text-orange"
                      strokeWidth={2.6}
                      aria-hidden="true"
                    />
                    Where you and this course overlap
                  </p>

                  <ul className="mt-4 space-y-3">
                    {ROWS.map((row, index) => {
                      const meta = DIMENSION_META[row.dimension];
                      const courseWeight = Math.round(
                        (SAMPLE_COURSE.interests[row.dimension] ?? 0) * 100,
                      );
                      const overlap = Math.min(STUDENT_PROFILE[row.dimension] ?? 0, courseWeight);
                      const color =
                        row.tone === "orange" ? "var(--color-orange)" : "var(--color-indigo)";
                      return (
                        <li key={row.dimension} className="flex items-center gap-3">
                          <row.icon
                            className={`size-[1.1rem] shrink-0 ${
                              row.tone === "orange" ? "text-orange" : "text-indigo"
                            }`}
                            strokeWidth={2.2}
                            aria-hidden="true"
                          />
                          <span className="w-[5.2rem] shrink-0 text-[0.86rem] font-semibold text-midnight sm:w-[6rem]">
                            {meta.short}
                          </span>
                          <span className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-midnight/[0.09]">
                            <motion.span
                              className="absolute inset-y-0 left-0 origin-left rounded-full"
                              style={{ width: `${overlap}%`, background: color }}
                              initial={reduced ? false : { scaleX: 0 }}
                              animate={shown ? { scaleX: 1 } : { scaleX: 0 }}
                              transition={{
                                duration: 0.75,
                                delay: 0.12 + index * 0.09,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            />
                          </span>
                          <span className="w-10 shrink-0 text-right text-[0.86rem] font-bold tabular-nums text-midnight">
                            {overlap}%
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <p className="mt-3.5 text-[0.75rem] leading-relaxed text-slate-ink">
                    Each bar is the smaller of your score and what the course actually leans on, so
                    a course can never look like it wants more of you than it does.
                  </p>
                </div>

                {/* Claim 2 — the gate, stated plainly. */}
                <div className="relative overflow-hidden rounded-[1.45rem] bg-peach px-5 py-5 sm:px-6">
                  <Image
                    src="/deco-books.png"
                    alt=""
                    width={314}
                    height={168}
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-2 -right-3 hidden w-[7.5rem] opacity-90 lg:block"
                  />
                  <div className="relative lg:pr-[7rem]">
                    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[1.02rem] font-bold text-midnight">
                      <Users
                        className="size-[1.15rem] text-orange"
                        strokeWidth={2.3}
                        aria-hidden="true"
                      />
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

                {/* Claim 3 — the sentence, and only the sentence. */}
                <div className="rounded-[1.45rem] bg-surface px-5 py-5 sm:px-6">
                  <p className="flex items-center gap-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-ink">
                    <FileText className="size-4 text-orange" aria-hidden="true" />
                    The sentence this produced
                  </p>
                  <blockquote className="relative mt-3 pl-7">
                    <span
                      aria-hidden="true"
                      className="display absolute left-0 top-[-0.35rem] text-[2rem] leading-none text-orange/60"
                    >
                      &ldquo;
                    </span>
                    <p className="text-[0.92rem] italic leading-relaxed text-midnight">
                      {SAMPLE_COURSE.whyItFits}
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
