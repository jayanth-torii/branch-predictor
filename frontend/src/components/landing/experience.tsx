"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Compass, Layers, Sparkles, Target } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * THE EXPERIENCE — scroll-driven sticky narrative.
 *
 * Deliberately NOT the eyebrow → title → card-grid template the rest of the
 * page used to repeat. A tall track pins one panel while four steps advance
 * with scroll position: the number, title and body swap, a segmented rail
 * fills, and a bespoke visual on the right changes per step.
 *
 * Three renderings, chosen by CSS media queries (not JS) so there is no
 * hydration mismatch and no flash:
 *   - >= md AND motion allowed  → the pinned scroll narrative
 *   - < md (phones)             → a vertical journey rail, same content
 *   - prefers-reduced-motion    → that same vertical rail at every width
 */

const STEPS = [
  {
    kicker: "Start",
    icon: Compass,
    title: "Set your starting point",
    body: "Name, PU stream and year. No phone number, no email, no account. Thirty seconds, then straight into the game.",
  },
  {
    kicker: "Play",
    icon: Sparkles,
    title: "Play the discovery quest",
    body: "Ten scenario questions with six paths each, then ten more from your own stream subjects. Every answer adds XP.",
  },
  {
    kicker: "Form",
    icon: Layers,
    title: "Watch your profile form",
    body: "A live radar tracks six dimensions while you play. Your answers become a career personality, not a score out of ten.",
  },
  {
    kicker: "Match",
    icon: Target,
    title: "Open your matched courses",
    body: "Courses ranked against your interests, filtered by your stream's real subject requirements, with the reasoning shown.",
  },
] as const;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/* ─────────────────────────────────────────────────────────────────────────
   Step visuals — one per step, reused by both the pinned panel and the
   phone rail. Decorative: the meaning lives in the step copy, so the
   containers mark them aria-hidden.
   ───────────────────────────────────────────────────────────────────────── */

function Pill({ on = false, children }: { on?: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[0.64rem] font-semibold ring-1 transition-colors",
        on
          ? "bg-orange text-white ring-orange/40"
          : "bg-surface/70 text-slate-ink ring-midnight/10",
      )}
    >
      {children}
    </span>
  );
}

function VisualStart() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-4 sm:p-5">
      <div className="rounded-2xl border border-midnight/10 bg-surface/70 px-3.5 py-2.5">
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-slate-ink">
          Your name
        </p>
        <p className="display mt-0.5 text-base text-midnight">
          Ananya
          <span className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[0.12em] rounded-full bg-orange align-middle animate-pulse-soft" />
        </p>
      </div>
      <div>
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-slate-ink">
          PU stream
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Pill on>Science</Pill>
          <Pill>Commerce</Pill>
          <Pill>Arts</Pill>
        </div>
      </div>
      <div>
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-slate-ink">
          Year
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Pill>PU 1</Pill>
          <Pill on>PU 2</Pill>
        </div>
      </div>
      <p className="mt-1 text-[0.62rem] font-medium text-slate-ink">
        no email · no password · no account
      </p>
    </div>
  );
}

const QUEST_OPTIONS = ["Build it", "Explain it", "Design it", "Fix it", "Sell it", "Study it"];

function VisualQuest() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-slate-ink">
          Question 4 of 10
        </span>
        <span className="rounded-full bg-peach px-2 py-0.5 text-[0.6rem] font-bold text-orange">
          +40 XP
        </span>
      </div>
      <p className="display text-[0.95rem] leading-snug text-midnight">
        A robot on your table stops working. You&apos;d rather…
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {QUEST_OPTIONS.map((option, index) => (
          <span
            key={option}
            className={cn(
              "rounded-xl px-2.5 py-2 text-[0.66rem] font-semibold ring-1",
              index === 3
                ? "bg-orange/12 text-orange ring-orange/45"
                : "bg-surface/60 text-slate-ink ring-midnight/[0.07]",
            )}
          >
            {option}
          </span>
        ))}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-midnight/10">
        <span className="block h-full w-[40%] rounded-full bg-orange" />
      </div>
    </div>
  );
}

const RADAR_AXES = ["Build", "Analyse", "Create", "Help", "Lead", "Explore"];

function VisualRadar() {
  const point = (angleIndex: number, radius: number) => {
    const angle = (Math.PI / 3) * angleIndex - Math.PI / 2;
    return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius] as const;
  };
  const ring = (radius: number) =>
    RADAR_AXES.map((_, i) => point(i, radius).join(",")).join(" ");
  const values = [38, 30, 41, 22, 27, 35];

  return (
    <div className="flex h-full items-center justify-center gap-3 p-4 sm:gap-4 sm:p-5">
      <svg viewBox="0 0 100 100" className="size-36 shrink-0 md:size-52">
        {[42, 30, 18].map((r) => (
          <polygon
            key={r}
            points={ring(r)}
            fill="none"
            stroke="var(--color-midnight)"
            strokeOpacity="0.12"
            strokeWidth="0.7"
          />
        ))}
        {RADAR_AXES.map((axis, i) => {
          const [x, y] = point(i, 42);
          return (
            <line
              key={axis}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="var(--color-midnight)"
              strokeOpacity="0.1"
              strokeWidth="0.7"
            />
          );
        })}
        <polygon
          points={values.map((v, i) => point(i, v).join(",")).join(" ")}
          fill="var(--color-orange)"
          fillOpacity="0.22"
          stroke="var(--color-orange)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {values.map((v, i) => {
          const [x, y] = point(i, v);
          return <circle key={RADAR_AXES[i]} cx={x} cy={y} r="1.6" fill="var(--color-orange)" />;
        })}
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {RADAR_AXES.map((axis, i) => (
          <li key={axis} className="flex items-center gap-2">
            <span className="w-[3.6rem] shrink-0 text-[0.62rem] font-semibold text-slate-ink">
              {axis}
            </span>
            <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-midnight/10">
              <span
                className="block h-full rounded-full bg-orange"
                style={{ width: `${Math.round((values[i] / 45) * 100)}%` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The three real match labels — never a percentage. "No fake precision" is a
 * product rule and one of the three principles the next section states out
 * loud, so a "92%" here would contradict the page two screens later. The bar
 * is relative fit only, which is why it carries no number.
 */
const MATCHES = [
  { name: "B.Tech — Computer Science", label: "Strong Match", fit: 92, why: "Build + Explore" },
  { name: "B.Sc — Data Science", label: "Strong Match", fit: 86, why: "Analyse" },
  { name: "B.Des — Product Design", label: "Explore Further", fit: 74, why: "Create" },
];

function VisualMatches() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-4 sm:p-5">
      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-slate-ink">
        Ranked for you · Science stream
      </p>
      {MATCHES.map((match, index) => (
        <div
          key={match.name}
          className={cn(
            "rounded-xl px-3 py-2 ring-1",
            index === 0
              ? "bg-orange/10 ring-orange/35"
              : "bg-surface/60 ring-midnight/[0.07]",
          )}
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[0.72rem] font-bold text-midnight">{match.name}</p>
            <p
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.56rem] font-bold uppercase tracking-wide",
                index === 0 ? "bg-orange text-white" : "bg-fog text-indigo",
              )}
            >
              {match.label}
            </p>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-midnight/10">
            <span
              className="block h-full rounded-full bg-orange"
              style={{ width: `${match.fit}%` }}
            />
          </div>
          <p className="mt-1 text-[0.6rem] font-medium text-slate-ink">matched on {match.why}</p>
        </div>
      ))}
    </div>
  );
}

function StepVisual({ index }: { index: number }) {
  if (index === 0) return <VisualStart />;
  if (index === 1) return <VisualQuest />;
  if (index === 2) return <VisualRadar />;
  return <VisualMatches />;
}

/* ─────────────────────────────────────────────────────────────────────────
   Pinned narrative pieces
   ───────────────────────────────────────────────────────────────────────── */

function StepTab({
  index,
  label,
  active,
  progress,
  onSelect,
}: {
  index: number;
  label: string;
  active: boolean;
  progress: MotionValue<number>;
  onSelect: (index: number) => void;
}) {
  // Each tab owns one quarter of the track: 0 → 1 as scroll crosses its band.
  const fill = useTransform(progress, (value) => clamp01(value * STEPS.length - index));

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-current={active ? "step" : undefined}
      className="group min-h-11 flex-1 cursor-pointer text-left"
    >
      <span className="block h-[3px] w-full overflow-hidden rounded-full bg-midnight/10">
        <motion.span
          className="block h-full origin-left rounded-full bg-orange"
          style={{ scaleX: fill }}
        />
      </span>
      <span
        className={cn(
          "mt-2 block text-[0.62rem] font-bold uppercase tracking-[0.16em] transition-colors",
          active ? "text-midnight" : "text-slate-ink group-hover:text-midnight",
        )}
      >
        <span className="tabular-nums">0{index + 1}</span> {label}
      </span>
    </button>
  );
}

function PinnedNarrative() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(
      STEPS.length - 1,
      Math.max(0, Math.floor(clamp01(value) * STEPS.length)),
    );
    setActive((current) => (current === next ? current : next));
  });

  // Gentle counter-drift on the visual so the panel breathes while pinned.
  const visualY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const auroraX = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

  const goToStep = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const span = Math.max(0, track.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: top + span * ((index + 0.45) / STEPS.length),
      behavior: "smooth",
    });
  }, []);

  const step = STEPS[active];
  const Icon = step.icon;

  // 400vh made this one section 4 full screens of scrolling to deliver four
  // short steps — the page read as endless and empty. 200vh gives each step
  // half a screen of travel, enough for the crossfade to land without the
  // reader wondering whether anything is happening.
  return (
    <div ref={trackRef} className="relative h-[200vh]">
      <div className="sticky top-[72px] flex h-[calc(100vh-72px)] items-center overflow-hidden">
        <motion.span
          aria-hidden="true"
          style={{ x: auroraX }}
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--glow-orange)] opacity-50 blur-[90px]"
        />

        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-center gap-8 px-8 lg:gap-14">
          {/* ── Narration column ─────────────────────────────────────── */}
          <div className="min-w-0">
            <p className="eyebrow">The experience</p>
            <h2 className="display mt-2 text-[1.9rem] leading-[1.05] text-balance text-midnight lg:text-[2.5rem]">
              Twenty-five questions that feel like a game, not an admission form.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-ink">
              No timer. No pass mark. Skipping a question is allowed — the point is to notice
              what you are naturally drawn to.
            </p>

            <div className="mt-8 h-px w-full bg-gradient-to-r from-orange/40 via-midnight/10 to-transparent" />

            <div className="relative mt-6 min-h-[11rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.38, ease: EASE }}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-peach text-orange ring-1 ring-orange/25">
                      <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="display text-[2.6rem] leading-none text-orange/25 tabular-nums">
                      0{active + 1}
                    </span>
                  </div>
                  <h3 className="display mt-4 text-xl text-midnight lg:text-2xl">{step.title}</h3>
                  <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-slate-ink">
                    {step.body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-start gap-3">
              {STEPS.map((item, index) => (
                <StepTab
                  key={item.title}
                  index={index}
                  label={item.kicker}
                  active={index === active}
                  progress={scrollYProgress}
                  onSelect={goToStep}
                />
              ))}
            </div>
          </div>

          {/* ── Visual column ────────────────────────────────────────── */}
          <motion.div
            aria-hidden="true"
            style={{ y: visualY }}
            // One fixed height so all four visuals share a panel and nothing
            // jumps between steps. Trimmed from 22/24rem: the tallest visual
            // only needs this much, and the surplus read as an empty box.
            className="glass glass-sheen relative h-[18rem] overflow-hidden lg:h-[19.5rem]"
          >
            {STEPS.map((item, index) => (
              <motion.div
                key={item.title}
                className="absolute inset-0"
                initial={false}
                animate={{
                  opacity: index === active ? 1 : 0,
                  y: index === active ? 0 : 22,
                  scale: index === active ? 1 : 0.97,
                }}
                transition={{ duration: 0.5, ease: EASE }}
                style={{ pointerEvents: "none" }}
              >
                <StepVisual index={index} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Phone / reduced-motion rendering: the same journey as a vertical rail.
   Nothing is hidden behind scroll maths — every step is plain, stacked and
   reachable.
   ───────────────────────────────────────────────────────────────────────── */

function JourneyRail({ reduced }: { reduced: boolean }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="eyebrow">The experience</p>
      <h2 className="display mt-2 text-[1.75rem] leading-[1.08] text-balance text-midnight sm:text-[2.2rem]">
        Twenty-five questions that feel like a game, not an admission form.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-ink">
        No timer. No pass mark. Skipping a question is allowed — the point is to notice what you
        are naturally drawn to.
      </p>

      <ol className="relative mt-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-[1.375rem] top-6 w-px bg-gradient-to-b from-orange/50 via-orange/20 to-transparent"
        />
        {STEPS.map((step, index) => (
          <motion.li
            key={step.title}
            className="relative pb-9 pl-[4.25rem] last:pb-0"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <span className="absolute left-0 top-0 grid size-11 place-items-center rounded-2xl bg-peach text-orange ring-1 ring-orange/25">
              <step.icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <p className="eyebrow">
              <span className="tabular-nums">0{index + 1}</span> · {step.kicker}
            </p>
            <h3 className="display mt-1.5 text-lg text-midnight">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-ink">{step.body}</p>
            <div aria-hidden="true" className="glass glass-sheen mt-4 overflow-hidden">
              <StepVisual index={index} />
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export function ExperienceSection() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section id="journey" className="relative isolate">
      {/* The aurora is clipped by its own wrapper, NOT by the section: an
          `overflow-hidden` ancestor becomes the scroll container for
          `position: sticky` descendants, which silently kills the pinning. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <span className="aurora" />
      </div>

      {/* Pinned narrative: desktop, motion allowed. CSS-gated, so no flash. */}
      <div className="hidden md:motion-safe:block">
        <PinnedNarrative />
      </div>

      {/* Phones always; every width under prefers-reduced-motion. */}
      <div className="md:motion-safe:hidden">
        <JourneyRail reduced={reduced} />
      </div>
    </section>
  );
}
