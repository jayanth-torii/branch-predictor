"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/ui";
import { CAREERS } from "@/lib/careers";
import { DIMENSIONS, DIMENSION_META, type Dimension } from "@/lib/types";

/* ══════════════════════════════════════════════════════════════════════════
   AFTER THE REVEAL — showcase bands.

   Four features, four full-width bands, each pairing generous copy with a
   MINIATURE ANIMATED MOCK of the real screen. The preview side alternates at
   `md:` via `order-*` so the eye zig-zags; DOM order is always copy-then-
   preview, which is also the phone stack order (read the name, then see it).

   MOTION CONTRACT (`usePreview`): every preview is gated on `useInView(once)`
   so four mocks never animate at the same time and nothing animates off
   screen, and on `useReducedMotion` so a reduced-motion visitor mounts at the
   finished end state — never blank, never mid-flight. Transform and opacity
   only.

   PRODUCT ACCURACY: no percentage match anywhere, only the three real labels
   (Strong Match / Explore Further / Alternative Path). The six interest
   dimensions are read from DIMENSIONS so they cannot drift. Nothing promises
   admission, salary or placement, and every panel showing a student profile is
   tagged "Illustrative".
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Shared motion ─────────────────────────────────────────────────────── */

function usePreview() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return { ref, reduced, state: reduced || inView ? "shown" : "hidden" };
}

const stage: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const pop: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  shown: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
};

const fade: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const riseIn: Variants = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function shiftIn(x: number): Variants {
  return {
    hidden: { opacity: 0, x },
    shown: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  };
}

const growY: Variants = {
  hidden: { scaleY: 0 },
  shown: { scaleY: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const growX: Variants = {
  hidden: { scaleX: 0 },
  shown: { scaleX: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

/* ── 1. Career constellation ───────────────────────────────────────────── */

const STAR_SLUGS = [
  "software-developer",
  "ux-designer",
  "robotics-engineer",
  "product-manager",
  "data-scientist",
  "journalist",
  "graphic-designer",
];

const STARS = STAR_SLUGS.map((slug) => CAREERS.find((career) => career.slug === slug)).filter(
  (career): career is (typeof CAREERS)[number] => Boolean(career),
);

/* One ring, computed once at module scope. The SVG behind the dots uses
   `preserveAspectRatio="none"` on a 0-100 viewBox, so these same numbers work
   unchanged as CSS percentages for the HTML dots sitting on top of the lines. */
const STAR_POINTS = STARS.map((career, index) => {
  const angle = -Math.PI / 2 + (index / STARS.length) * Math.PI * 2;
  return { career, x: 50 + 34 * Math.cos(angle), y: 50 + 34 * Math.sin(angle) };
});

function ConstellationPreview() {
  const { ref, reduced, state } = usePreview();

  return (
    <motion.div
      ref={ref}
      className="card-dark relative isolate overflow-hidden p-4 sm:p-6"
      variants={stage}
      initial={reduced ? false : "hidden"}
      animate={state}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-orange/25 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between gap-3">
        <p className="eyebrow text-orange-soft">Career constellation</p>
        <span className="chip chip-xs !border-white/15 !bg-white/[0.06] !px-2.5 !py-1 !text-white/75">
          <Sparkles className="size-3 text-orange" aria-hidden="true" />
          {CAREERS.length} stars
        </span>
      </div>

      <div className="relative mt-4 aspect-[5/4] w-full sm:aspect-[16/11]" aria-hidden="true">
        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {STAR_POINTS.map((point) => (
            <motion.line
              key={point.career.slug}
              x1="50"
              y1="50"
              x2={point.x}
              y2={point.y}
              stroke="#fff"
              strokeOpacity="0.16"
              strokeWidth="0.3"
              variants={fade}
            />
          ))}
        </svg>

        {STAR_POINTS.map((point, index) => (
          <motion.span
            key={point.career.slug}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            variants={pop}
          >
            <span className="relative grid place-items-center">
              {index % 3 === 0 && (
                <span
                  className="animate-pulse-soft absolute size-5 rounded-full"
                  style={{ background: DIMENSION_META[point.career.core].color, opacity: 0.3 }}
                />
              )}
              <span
                className="relative size-2 rounded-full ring-2 ring-navy sm:size-2.5"
                style={{ background: DIMENSION_META[point.career.core].color }}
              />
            </span>
          </motion.span>
        ))}

        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          variants={pop}
        >
          <span className="grid size-14 place-items-center rounded-full border border-orange/35 bg-orange/15 text-center text-[0.5rem] font-bold uppercase leading-tight tracking-wide text-orange-soft backdrop-blur sm:size-16">
            Your
            <br />
            profile
          </span>
        </motion.div>
      </div>

      <div className="relative mt-3 grid gap-1.5 sm:grid-cols-2">
        {STAR_POINTS.slice(0, 2).map((point) => (
          <motion.span
            key={point.career.slug}
            variants={riseIn}
            className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: DIMENSION_META[point.career.core].color }}
              />
              <span className="truncate text-[0.68rem] font-semibold text-white/85">
                {point.career.title}
              </span>
            </span>
            <ArrowUpRight className="size-3 shrink-0 text-white/35" aria-hidden="true" />
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

/* ── 2. Living interest radar ──────────────────────────────────────────── */

/* Illustrative only — an invented student, labelled as such inside the panel. */
const SAMPLE_PROFILE: Record<Dimension, number> = {
  technology: 0.92,
  creativity: 0.46,
  engineering: 0.62,
  business: 0.3,
  communication: 0.38,
  analytical: 0.78,
};

const HEX = DIMENSIONS.map((dimension, index) => {
  const angle = -Math.PI / 2 + (index / DIMENSIONS.length) * Math.PI * 2;
  return { dimension, cos: Math.cos(angle), sin: Math.sin(angle) };
});

function hexRing(radius: number) {
  return HEX.map((point) => `${(50 + radius * point.cos).toFixed(2)},${(50 + radius * point.sin).toFixed(2)}`).join(
    " ",
  );
}

const PROFILE_POLYGON = HEX.map((point) => {
  const radius = 6 + SAMPLE_PROFILE[point.dimension] * 38;
  return `${(50 + radius * point.cos).toFixed(2)},${(50 + radius * point.sin).toFixed(2)}`;
}).join(" ");

function RadarPreview() {
  const { ref, reduced, state } = usePreview();

  return (
    <motion.div
      ref={ref}
      className="card relative overflow-hidden p-4 sm:p-6"
      variants={stage}
      initial={reduced ? false : "hidden"}
      animate={state}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Interest profile</p>
        <span className="chip chip-xs !border-orange/20 !bg-peach !px-2.5 !py-1 !text-orange">
          Question 7 of 10
        </span>
      </div>

      <div className="mt-3 grid items-center gap-4 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[190px]" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="size-full">
            <polygon
              points={hexRing(44)}
              fill="none"
              stroke="var(--color-midnight)"
              strokeOpacity="0.14"
              strokeWidth="0.6"
            />
            <polygon
              points={hexRing(26)}
              fill="none"
              stroke="var(--color-midnight)"
              strokeOpacity="0.1"
              strokeWidth="0.6"
            />
            {HEX.map((point) => (
              <line
                key={point.dimension}
                x1="50"
                y1="50"
                x2={50 + 44 * point.cos}
                y2={50 + 44 * point.sin}
                stroke="var(--color-midnight)"
                strokeOpacity="0.1"
                strokeWidth="0.5"
              />
            ))}
            {/* The filled shape swells out of the centre as answers land. */}
            <motion.g variants={pop} style={{ transformOrigin: "50px 50px" }}>
              <polygon
                points={PROFILE_POLYGON}
                fill="var(--color-orange)"
                fillOpacity="0.22"
                stroke="var(--color-orange)"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </motion.g>
            {HEX.map((point) => {
              const radius = 6 + SAMPLE_PROFILE[point.dimension] * 38;
              return (
                <motion.circle
                  key={point.dimension}
                  cx={50 + radius * point.cos}
                  cy={50 + radius * point.sin}
                  r="2.2"
                  fill={DIMENSION_META[point.dimension].color}
                  variants={pop}
                />
              );
            })}
          </svg>
        </div>

        <ul className="grid gap-2">
          {DIMENSIONS.map((dimension) => (
            <motion.li key={dimension} variants={riseIn} className="grid gap-1">
              <span className="flex items-center gap-1.5">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: DIMENSION_META[dimension].color }}
                />
                <span className="truncate text-[0.62rem] font-semibold text-midnight">
                  {DIMENSION_META[dimension].short}
                </span>
              </span>
              <span className="block h-1 w-full overflow-hidden rounded-full bg-midnight/[0.08]">
                <motion.span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.round(SAMPLE_PROFILE[dimension] * 100)}%`,
                    background: DIMENSION_META[dimension].color,
                    transformOrigin: "left",
                  }}
                  variants={growX}
                />
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-ink">
        Illustrative profile · the shape keeps moving until question 10
      </p>
    </motion.div>
  );
}

/* ── 3. Future journey map ─────────────────────────────────────────────── */

const JOURNEY = [
  { step: "Today", title: "2nd PU · PCMC", note: "Your stream sets the eligibility gate, not the ceiling." },
  { step: "Next", title: "B.Tech CSE · 4 years", note: "Entrance-led admission. Verify the rules per university." },
  { step: "Build", title: "Algorithms, system design", note: "Projects you can explain beat certificates." },
  { step: "Explore", title: "Software Developer", note: "One possible destination — not the only one." },
];

function JourneyPreview() {
  const { ref, reduced, state } = usePreview();

  return (
    <motion.div
      ref={ref}
      className="card relative overflow-hidden p-4 sm:p-6"
      variants={stage}
      initial={reduced ? false : "hidden"}
      animate={state}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Your pathway</p>
        <span className="chip chip-xs !px-2.5 !py-1">4 steps</span>
      </div>

      <div className="relative mt-4 pl-8">
        {/* The rail draws itself downward, then each stop arrives beside it. */}
        <motion.span
          className="absolute bottom-3 left-[11px] top-3 w-px bg-gradient-to-b from-orange via-orange/40 to-transparent"
          style={{ transformOrigin: "top" }}
          variants={growY}
          aria-hidden="true"
        />
        <ul className="grid gap-3.5">
          {JOURNEY.map((node, index) => (
            <motion.li key={node.step} variants={shiftIn(-14)} className="relative">
              <span
                className="absolute -left-8 top-0.5 grid size-[23px] place-items-center rounded-full border border-orange/35 bg-peach text-[0.58rem] font-bold text-orange"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <p className="text-[0.56rem] font-bold uppercase tracking-[0.16em] text-slate-ink">
                {node.step}
              </p>
              <p className="display mt-0.5 text-[0.92rem] leading-snug text-midnight">{node.title}</p>
              <p className="mt-0.5 text-[0.66rem] leading-relaxed text-slate-ink">{node.note}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/* ── 4. What-if comparison ─────────────────────────────────────────────── */

const COMPARE_ROWS = [
  { label: "Duration", a: "3 years", b: "4 years" },
  { label: "Entry", a: "Maths at 10+2", b: "PCM + entrance" },
  { label: "Skill one", a: "Web development", b: "Algorithms" },
];

function ComparePreview() {
  const { ref, reduced, state } = usePreview();

  return (
    <motion.div
      ref={ref}
      className="card relative overflow-hidden p-4 sm:p-6"
      variants={stage}
      initial={reduced ? false : "hidden"}
      animate={state}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">What-if mode</p>
        <span className="chip chip-xs !px-2.5 !py-1">Side by side</span>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-2.5 sm:gap-x-3">
        {/* The two options slide in from their own sides and meet at the VS. */}
        <motion.div variants={shiftIn(-18)} className="rounded-xl bg-surface-2 px-2.5 py-2 text-center sm:px-3">
          <p className="display text-[0.95rem] leading-none text-midnight">BCA</p>
          <p className="mt-1 text-[0.58rem] leading-tight text-slate-ink">Computer Applications</p>
        </motion.div>
        <motion.span
          variants={pop}
          className="grid size-7 place-items-center rounded-full bg-orange text-[0.56rem] font-bold uppercase tracking-wide text-white"
        >
          vs
        </motion.span>
        <motion.div variants={shiftIn(18)} className="rounded-xl bg-surface-2 px-2.5 py-2 text-center sm:px-3">
          <p className="display text-[0.95rem] leading-none text-midnight">B.Tech CSE</p>
          <p className="mt-1 text-[0.58rem] leading-tight text-slate-ink">Computer Sci. &amp; Engg.</p>
        </motion.div>

        {COMPARE_ROWS.map((row) => (
          <motion.div
            key={row.label}
            variants={riseIn}
            className="col-span-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 border-t border-midnight/[0.07] pt-2.5 sm:gap-x-3"
          >
            <p className="truncate text-center text-[0.66rem] font-semibold text-midnight">{row.a}</p>
            <p className="w-16 shrink-0 text-center text-[0.56rem] font-bold uppercase tracking-[0.12em] text-slate-ink">
              {row.label}
            </p>
            <p className="truncate text-center text-[0.66rem] font-semibold text-midnight">{row.b}</p>
          </motion.div>
        ))}

        {/* Labels only. The product never shows a percentage match. */}
        <motion.span
          variants={pop}
          className="col-start-1 rounded-full border border-orange/25 bg-peach px-1.5 py-1 text-center text-[0.56rem] font-bold uppercase tracking-wide text-orange"
        >
          Strong Match
        </motion.span>
        <span aria-hidden="true" />
        <motion.span
          variants={pop}
          className="col-start-3 rounded-full border border-midnight/10 bg-fog px-1.5 py-1 text-center text-[0.56rem] font-bold uppercase tracking-wide text-indigo"
        >
          Explore Further
        </motion.span>
      </div>

      <p className="mt-4 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-ink">
        Illustrative · the label is relative fit, never a score
      </p>
    </motion.div>
  );
}

/* ── Band shell ────────────────────────────────────────────────────────── */

function Band({
  index,
  label,
  title,
  body,
  href,
  cta,
  preview,
}: {
  index: number;
  label: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  preview: ReactNode;
}) {
  /* Odd bands move the preview to the LEFT at md+. On phones the DOM order
     wins, so every band reads copy first and preview underneath — one
     consistent rhythm rather than an alternating one nobody can follow. */
  const flipped = index % 2 === 1;

  return (
    <div className="grid items-center gap-6 border-t border-midnight/[0.07] pt-9 md:grid-cols-2 md:gap-12 md:pt-14 lg:gap-16">
      <Reveal className={flipped ? "md:order-2" : undefined}>
        <p className="display text-[2.6rem] leading-none text-orange/25 sm:text-[3.2rem]">
          {String(index + 1).padStart(2, "0")}
        </p>
        <p className="eyebrow mt-2">{label}</p>
        <h3 className="display mt-2 max-w-md text-[1.6rem] leading-[1.12] text-balance text-midnight sm:text-[2.05rem]">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-slate-ink">{body}</p>
        <Link
          href={href}
          className="group mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-orange md:min-h-0"
        >
          <span className="underline-offset-4 group-hover:underline">{cta}</span>
          <ArrowUpRight
            className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </Reveal>

      <div className={flipped ? "md:order-1" : undefined}>{preview}</div>
    </div>
  );
}

/* ── Section ───────────────────────────────────────────────────────────── */

export function AfterRevealSection() {
  return (
    <section className="overflow-hidden border-y border-midnight/[0.06] bg-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="After the reveal"
            title="The result is a map, not a verdict."
            description={`${CAREERS.length} career pages, interactive pathways and side-by-side comparisons — so the assessment becomes a starting point you can keep using. Here is what the four screens actually do.`}
          />
        </Reveal>

        <div className="mt-10 grid gap-10 sm:mt-14 md:gap-16">
          <Band
            index={0}
            label="Career constellation"
            title="Careers arrive as a sky, not a shortlist."
            body="Every recommended career becomes a star you can tap — a realistic day in the life, the skills it asks for, and the courses that lead there. Nothing is ranked out of ten."
            href="/results"
            cta="See the results map"
            preview={<ConstellationPreview />}
          />
          <Band
            index={1}
            label="Living interest radar"
            title="Watch the profile form while you answer."
            body="Six interest dimensions — technology, creativity, engineering, business, communication and analytical — reshape with every answer, so you can see what is pulling your direction instead of waiting for a verdict at the end."
            href="/discover"
            cta="Start the assessment"
            preview={<RadarPreview />}
          />
          <Band
            index={2}
            label="Future journey map"
            title="PU to course to skills to career, in one line."
            body="The path is laid out as four concrete stops rather than an abstract suggestion, and each stop opens the real page behind it — course details, the skills worth building, the day-to-day of the career."
            href="/courses"
            cta="Browse UG courses"
            preview={<JourneyPreview />}
          />
          <Band
            index={3}
            label="What-if comparison"
            title="What if I choose BCA instead of B.Tech?"
            body="Put two courses next to each other and compare duration, eligibility, skills and career routes honestly — including where they genuinely split. Fit is shown as a label, never a score."
            href="/compare"
            cta="Open what-if mode"
            preview={<ComparePreview />}
          />
        </div>
      </div>
    </section>
  );
}
