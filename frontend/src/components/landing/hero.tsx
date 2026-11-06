"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  ChartColumn,
  CodeXml,
  FlaskConical,
  GraduationCap,
  Layers,
  Lightbulb,
  Lock,
  Palette,
  Play,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   HERO — built to the supplied reference.

   Left: badge pill, oversized headline with a hand-drawn underline under YOU,
   supporting line, two CTAs, then four inline proof stats with hairline
   dividers. Right: an orange disc with category cards floating around it on
   dashed connector paths, under a lightbulb. A full-width stat bar sits across
   the bottom, overlapping the fold.

   The student is a supplied transparent PNG at `public/hero-student.png`,
   rendered through next/image with `priority` because it is the largest
   above-the-fold paint. It is purely decorative — the headline beside it
   carries the meaning — so its alt is intentionally empty.
   ══════════════════════════════════════════════════════════════════════════ */

const ARCHETYPES = [
  "a Systems Builder",
  "a Digital Innovator",
  "a Visual Storyteller",
  "a Venture Strategist",
  "a People Connector",
  "a Pattern Analyst",
];

/** The five category cards orbiting the disc, positioned as in the reference. */
const CATEGORY_CARDS = [
  { icon: CodeXml, title: "Technology", sub: "& Engineering", at: "left-[-2%] top-[12%]", delay: 0.1 },
  { icon: FlaskConical, title: "Science", sub: "& Research", at: "right-[-4%] top-[6%]", delay: 0.18 },
  { icon: ChartColumn, title: "Business", sub: "& Management", at: "left-[-6%] top-[40%]", delay: 0.26 },
  { icon: Palette, title: "Design", sub: "& Creativity", at: "right-[-6%] top-[40%]", delay: 0.34 },
  { icon: Users, title: "Humanities", sub: "& Social Sciences", at: "right-[-2%] top-[68%]", delay: 0.42 },
];

/** Inline proof points under the CTAs. Every figure here is real. */
const PROOF = [
  { icon: GraduationCap, value: "34", label: "Non-biology\nUG Courses" },
  { icon: Layers, value: "6", label: "Interest\nDimensions" },
  { icon: Zap, value: "20", label: "Thoughtful\nQuestions" },
  { icon: Lock, value: "No Login", label: "Required" },
];

/**
 * The bottom bar. The reference showed "10K+ Students Guided" and "95%
 * Satisfaction Rate" — invented social proof for a product with no users and
 * no survey behind it, so those are replaced with figures the catalogue can
 * actually back.
 */
const BAR = [
  { icon: GraduationCap, value: "34", label: "UG Courses" },
  { icon: Target, value: "20", label: "Career Paths" },
  { icon: Layers, value: "6", label: "Interest Dimensions" },
  { icon: Award, value: "Free", label: "No Account Needed" },
];

export function Hero({ courseCount }: { courseCount: number }) {
  const reduced = useReducedMotion();
  const [archetype, setArchetype] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setArchetype((current) => (current + 1) % ARCHETYPES.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <section className="relative isolate overflow-hidden pb-28 sm:pb-32">
      <div className="aurora opacity-70" aria-hidden="true" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-10 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
        {/* ── Left column ──────────────────────────────────────────────── */}
        <div className="max-w-xl">
          <span className="rise glass inline-flex items-center gap-2.5 !rounded-full px-4 py-2 text-[0.78rem] font-semibold text-midnight">
            <Sparkles className="size-4 text-orange" aria-hidden="true" />
            Built for PU Students
            <Dot />
            {courseCount >= 0 ? "25 Questions" : ""}
            <Dot />
            No Timer
          </span>

          <h1
            className="display mt-6 text-[2.7rem] leading-[1.04] text-midnight sm:text-[3.6rem] lg:text-[4.1rem]"
            aria-label="Discover the course that feels like you."
          >
            <span className="rise block" style={{ "--rise-delay": "60ms" } as CSSProperties}>
              Discover the
            </span>
            <span className="rise block" style={{ "--rise-delay": "140ms" } as CSSProperties}>
              course that
            </span>
            <span
              className="rise block whitespace-nowrap"
              style={{ "--rise-delay": "220ms" } as CSSProperties}
            >
              feels like{" "}
              <span className="relative inline-block text-orange">
                YOU
                {/* Hand-drawn underline + spark ticks, as in the reference. */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 26"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2 left-0 h-[0.3em] w-full overflow-visible"
                >
                  <path
                    d="M4 17 C 46 4, 128 4, 193 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  aria-hidden="true"
                  className="absolute -right-5 -top-2 text-[0.3em] leading-none text-orange"
                >
                  <span className="block h-[1.4em] w-[0.22em] -rotate-12 rounded-full bg-current" />
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -right-8 top-[0.9em] text-[0.3em] leading-none text-orange"
                >
                  <span className="block h-[1.1em] w-[0.22em] rotate-[32deg] rounded-full bg-current" />
                </span>
              </span>
            </span>
          </h1>

          <p
            className="rise mt-6 max-w-lg text-[1.02rem] leading-relaxed text-slate-ink"
            style={{ "--rise-delay": "320ms" } as CSSProperties}
          >
            Last term you were undecided. Today you might be{" "}
            <span className="relative inline-block h-[1.5em] w-[13.5ch] align-bottom text-left font-bold text-midnight">
              {ARCHETYPES.map((name, index) => (
                <motion.span
                  key={name}
                  className="absolute inset-0 flex items-center whitespace-nowrap"
                  initial={false}
                  animate={
                    reduced
                      ? { opacity: index === 0 ? 1 : 0 }
                      : { opacity: index === archetype ? 1 : 0, y: index === archetype ? 0 : 7 }
                  }
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {name}
                </motion.span>
              ))}
            </span>
            . Explore courses, find your interests, and get a clear path for your future.
          </p>

          <div
            className="rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ "--rise-delay": "420ms" } as CSSProperties}
          >
            <Link
              href="/discover"
              className="group inline-flex min-h-[3.1rem] items-center justify-center gap-2.5 rounded-full bg-orange px-6 text-[0.92rem] font-bold text-white shadow-[0_16px_38px_-14px_rgba(255,107,53,0.85)] transition hover:bg-[#f25a24]"
            >
              Start My Journey
              <span className="grid size-7 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
            <Link
              href="/#journey"
              className="group inline-flex min-h-[3.1rem] items-center justify-center gap-2.5 rounded-full border border-midnight/12 bg-surface px-5 text-[0.92rem] font-bold text-midnight transition hover:border-orange/40"
            >
              <span className="grid size-8 place-items-center rounded-full border border-midnight/12 text-orange">
                <Play className="size-3.5 fill-current" aria-hidden="true" />
              </span>
              Watch How It Works
            </Link>
          </div>

          <ul
            className="rise mt-8 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4"
            style={{ "--rise-delay": "520ms" } as CSSProperties}
          >
            {PROOF.map((item, index) => (
              <li
                key={item.value + item.label}
                className={`flex items-center gap-2 ${
                  index > 0 ? "sm:border-l sm:border-midnight/10 sm:pl-4" : ""
                }`}
              >
                <item.icon
                  className="size-[1.1rem] shrink-0 text-orange"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <p className="min-w-0 text-[0.68rem] leading-[1.3] text-slate-ink">
                  <span className="font-bold text-midnight">{item.value}</span>{" "}
                  {item.label.split("\n").map((line, i) => (
                    <span key={line} className={i === 0 ? "" : "block"}>
                      {line}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right column: the disc ───────────────────────────────────── */}
        <div className="relative mx-auto aspect-square w-full max-w-[30rem] lg:max-w-none">
          {/* A single complete, evenly dashed orbit ring. Three partial curves
              here previously clipped the disc edge and read as a broken circle
              rather than as connectors. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 400 400"
            className="absolute inset-0 size-full text-midnight/20"
          >
            <circle
              cx="200"
              cy="212"
              r="150"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="3 9"
              strokeLinecap="round"
            />
          </svg>

          {/* The lightbulb that the paths radiate from. */}
          <div className="absolute left-1/2 top-[1%] z-20 -translate-x-1/2">
            <span className="relative grid size-12 place-items-center">
              <Lightbulb className="size-7 text-orange" strokeWidth={2} aria-hidden="true" />
              <span aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-orange/20 blur-xl" />
              {[-40, -20, 0, 20, 40].map((deg) => (
                <span
                  key={deg}
                  aria-hidden="true"
                  className="absolute top-[-0.55rem] h-2 w-[2px] origin-bottom rounded-full bg-orange/70"
                  style={{ transform: `rotate(${deg}deg) translateY(-0.5rem)` }}
                />
              ))}
            </span>
          </div>

          {/* The orange disc. */}
          <div
            className="absolute left-1/2 top-[16%] size-[64%] -translate-x-1/2 rounded-full"
            style={{
              background: "linear-gradient(160deg, #FF8A3D 0%, #FF6B35 55%, #F0531B 100%)",
            }}
            aria-hidden="true"
          />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[13%] size-[74%] -translate-x-1/2 rounded-full border border-midnight/[0.06] bg-fog/40"
            style={{ zIndex: -1 }}
          />

          {/* The figure sits in front of the disc, feet near its lower edge. */}
          <motion.div
            className="absolute inset-x-[6%] bottom-[2%] z-10"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src="/hero-student.png"
              alt=""
              width={1324}
              height={1188}
              priority
              sizes="(max-width: 1023px) 92vw, 46vw"
              className="h-auto w-full"
            />
          </motion.div>

          {CATEGORY_CARDS.map((card) => (
            <motion.div
              key={card.title}
              className={`absolute z-20 ${card.at}`}
              initial={reduced ? false : { opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: card.delay, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-2.5 rounded-2xl border border-midnight/[0.07] bg-surface/95 py-2.5 pl-2.5 pr-3 shadow-[0_18px_40px_-26px_rgba(16,27,61,0.5)] backdrop-blur-sm">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-peach text-orange">
                  <card.icon className="size-4.5" strokeWidth={2} aria-hidden="true" />
                </span>
                <p className="text-[0.76rem] font-bold leading-[1.2] text-midnight">
                  {card.title}
                  <span className="block font-semibold text-slate-ink">{card.sub}</span>
                </p>
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-midnight/10 text-midnight/50">
                  <ArrowRight className="size-3" aria-hidden="true" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Bottom stat bar, overlapping the fold ────────────────────────── */}
      <div className="relative mx-auto -mb-20 w-full max-w-5xl px-5 sm:px-8">
        <div className="glass glass-sheen grid grid-cols-2 gap-y-5 rounded-[1.6rem] px-5 py-6 sm:px-8 lg:grid-cols-4">
          {BAR.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-center justify-center gap-3 ${
                index > 0 ? "lg:border-l lg:border-midnight/10" : ""
              }`}
            >
              <item.icon className="size-7 shrink-0 text-orange" strokeWidth={1.8} aria-hidden="true" />
              <p className="leading-tight">
                <span className="display block text-[1.35rem] text-midnight">{item.value}</span>
                <span className="text-[0.78rem] text-slate-ink">{item.label}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return (
    <span aria-hidden="true" className="size-1 rounded-full bg-orange/60" />
  );
}

