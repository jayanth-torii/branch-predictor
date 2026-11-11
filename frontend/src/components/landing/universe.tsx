"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Code2,
  Layers,
  Map as MapIcon,
  Palette,
  ShieldCheck,
  Sigma,
  Target,
  Users,
  Wrench,
} from "lucide-react";
import { Reveal } from "@/components/ui";
import { COURSES, COURSE_CATEGORIES } from "@/lib/courses";
import type { CourseCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<CourseCategory, typeof Code2> = {
  "Technology & Computing": Code2,
  "Engineering & Innovation": Wrench,
  "Business & Commerce": Briefcase,
  "Creative & Design": Palette,
  "Humanities & Communication": Users,
  "Science & Mathematics": Sigma,
};

/* One hue per cluster, fixed in both themes. The node is a tinted glass tile
   rather than a plain circle, so the hue has to carry the icon, the ring and
   the wash — three alphas of one colour instead of three unrelated tokens. */
const CATEGORY_TONE: Record<CourseCategory, string> = {
  "Technology & Computing": "#3C7DF2",
  "Engineering & Innovation": "#1F9D8B",
  "Business & Commerce": "#FF6B35",
  "Creative & Design": "#C94B7C",
  "Humanities & Communication": "#E0A400",
  "Science & Mathematics": "#7C6BF5",
};

/* ── Map geometry ──────────────────────────────────────────────────────────
   The clusters are laid out as a two-ring constellation, and both spatial
   variables carry meaning rather than decoration:

     tile size      → programmes in the cluster (92px … 124px)
     ring distance  → the densest half of the clusters sit on the INNER ring

   Slots are generated from the cluster count, not hardcoded, so adding a
   category to the catalog re-spaces the field instead of overlapping a node.
   Rank 0 — the densest cluster — takes the first slot at BASE_ANGLE, the
   prime upper-right position. All of it is derived once at module scope: the
   component renders no geometry maths, and nothing here touches Date or
   Math.random. */
const BASE_ANGLE = -35;
const INNER_RADIUS = 31;
const OUTER_RADIUS = 39;
const CORE_RADIUS = 17;
const ORBIT_RADIUS = 47;
const SPIN_SECONDS = 110;

const ENTRIES = COURSE_CATEGORIES.map((category) => {
  const list = COURSES.filter((course) => course.category === category);
  return {
    category,
    count: list.length,
    examples: list.slice(0, 3).map((course) => course.name),
  };
});

const COUNTS = ENTRIES.map((entry) => entry.count);
const MIN_COUNT = Math.min(...COUNTS);
const COUNT_SPAN = Math.max(1, Math.max(...COUNTS) - MIN_COUNT);

/** Densest first. Ties keep catalogue order, so the layout is deterministic. */
const RANKED = [...ENTRIES].sort((a, b) => b.count - a.count);
const INNER_SLOTS = Math.ceil(RANKED.length / 2);

const NODES = RANKED.map((entry, rank) => {
  const inner = rank < INNER_SLOTS;
  const angle = BASE_ANGLE + (rank * 360) / RANKED.length;
  const radians = (angle * Math.PI) / 180;
  const radius = inner ? INNER_RADIUS : OUTER_RADIUS;
  return {
    ...entry,
    inner,
    tone: CATEGORY_TONE[entry.category],
    x: 50 + radius * Math.cos(radians),
    y: 50 + radius * Math.sin(radians),
    /* Where the connector meets the core and where it meets the tile. The
       tile is a square, so its edge along the diagonal sits short of
       `radius`; 10 is the measured inset that lands the dot on the border. */
    coreX: 50 + (CORE_RADIUS + 0.8) * Math.cos(radians),
    coreY: 50 + (CORE_RADIUS + 0.8) * Math.sin(radians),
    edgeX: 50 + (radius - 10) * Math.cos(radians),
    edgeY: 50 + (radius - 10) * Math.sin(radians),
    size: 92 + Math.round(((entry.count - MIN_COUNT) / COUNT_SPAN) * 32),
  };
});

/** Glowing markers riding the dashed orbit. Evenly spaced, offset off-axis so
    they never sit directly behind a node tile. */
const ORBIT_DOTS = [18, 92, 166, 240, 314].map((angle) => {
  const radians = (angle * Math.PI) / 180;
  return {
    angle,
    x: 50 + ORBIT_RADIUS * Math.cos(radians),
    y: 50 + ORBIT_RADIUS * Math.sin(radians),
  };
});

const TOTAL = COURSES.length;
const CLUSTER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"];
/* "Four clusters orbit…" — written from the catalogue, not typed in. An
   earlier draft said "Six", which was the size of the CourseCategory union
   rather than the number of clusters that actually hold a programme. */
const CLUSTER_WORD = (CLUSTER_WORDS[NODES.length] ?? String(NODES.length)).toLowerCase();

export function UniverseSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.2 });
  const reduced = useReducedMotion();
  const [active, setActive] = useState<CourseCategory | null>(null);

  /* Ambient motion runs only when the map is on screen, motion is allowed, and
     nothing is being inspected — grabbing a node stops the field so it can be
     read and clicked. Only the orbit ring turns now: the tiles hold still, so
     labels stay upright without a counter-rotation on every node. */
  const running = inView && !reduced && active === null;

  const spin: CSSProperties | undefined = reduced
    ? undefined
    : {
        animationName: "orbit-spin",
        animationDuration: `${SPIN_SECONDS}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationPlayState: running ? "running" : "paused",
        willChange: "transform",
      };

  const detail = NODES.find((node) => node.category === active) ?? null;
  const DetailIcon = detail ? CATEGORY_ICONS[detail.category] : null;

  return (
    <section id="course-universe" className="relative isolate overflow-hidden">
      <div className="aurora opacity-70" aria-hidden="true" />

      {/* The two corner waves from the print layout, clipped by the section. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <svg
          viewBox="0 0 400 220"
          preserveAspectRatio="none"
          className="absolute -right-10 -top-8 h-44 w-[26rem] opacity-70 sm:h-56"
        >
          <path d="M140 0 C 220 46 256 14 400 78 L400 0 Z" fill="var(--color-orange)" opacity="0.4" />
          <path d="M214 0 C 280 48 308 28 400 104 L400 0 Z" fill="var(--color-orange-soft)" opacity="0.35" />
        </svg>
        <svg
          viewBox="0 0 400 180"
          preserveAspectRatio="none"
          className="absolute -bottom-8 -right-10 h-36 w-[24rem] opacity-70 sm:h-44"
        >
          <path d="M400 40 C 300 70 250 130 170 180 L400 180 Z" fill="var(--color-navy)" opacity="0.35" />
          <path d="M400 96 C 330 112 300 146 250 180 L400 180 Z" fill="var(--color-orange)" opacity="0.35" />
        </svg>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          {/* ── Narrative column ─────────────────────────────────────────── */}
          <Reveal className="md:col-span-5">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-surface py-2 pl-3 pr-4 shadow-soft ring-1 ring-midnight/[0.07]">
              <span className="grid size-6 place-items-center rounded-lg bg-peach text-orange">
                <Layers className="size-[0.95rem]" strokeWidth={2.6} aria-hidden="true" />
              </span>
              <span className="text-[0.76rem] font-bold uppercase tracking-[0.1em] text-midnight">
                The course universe
              </span>
            </span>

            <h2 className="display mt-5 text-[2rem] leading-[1.08] text-balance text-midnight sm:text-[2.6rem]">
              <span className="relative inline-block">
                {TOTAL} undergraduate directions.
                {/* Three sparks off the opening line, echoing the band above. */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 40 40"
                  className="pointer-events-none absolute -right-2 -top-[0.5em] h-[1.05em] w-[1.05em] overflow-visible text-orange"
                  stroke="currentColor"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                >
                  <path d="M4 22 L16 16" />
                  <path d="M12 6 L19 17" />
                  <path d="M28 2 L26 15" />
                </svg>
              </span>{" "}
              <span className="relative inline-block text-orange">
                Zero
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute left-0 top-[0.98em] h-[0.14em] w-full overflow-visible"
                >
                  <path
                    d="M6 14 Q 100 4 194 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              biology courses.
            </h2>

            <p className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-slate-ink">
              {CLUSTER_WORD.charAt(0).toUpperCase() + CLUSTER_WORD.slice(1)} clusters orbit one
              catalog. The bigger the node, the more programmes it holds — and the inner ring is
              where the catalog runs densest.
            </p>

            {/* Hover/focus readout. A visual echo of the focused node, so it is
                hidden from assistive tech: the link itself carries the name. */}
            <div
              className="mt-7 hidden min-h-[172px] rounded-[1.6rem] bg-surface/75 p-5 shadow-soft ring-1 ring-midnight/[0.06] backdrop-blur-sm md:block"
              aria-hidden="true"
            >
              {detail && DetailIcon ? (
                <div key={detail.category} className="rise">
                  <div className="flex gap-4">
                    <span
                      className="grid size-12 shrink-0 place-items-center rounded-2xl"
                      style={{
                        background: `color-mix(in oklab, ${detail.tone} 14%, transparent)`,
                        color: detail.tone,
                      }}
                    >
                      <DetailIcon className="size-[1.4rem]" strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0">
                      <p className="display text-[1.05rem] leading-snug text-midnight">
                        {detail.category}
                      </p>
                      <p className="mt-1 text-[0.78rem] font-bold uppercase tracking-[0.1em] text-orange">
                        {detail.count} programmes ·{" "}
                        {detail.inner ? "inner ring" : "outer ring"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[0.82rem] leading-relaxed text-slate-ink">
                    {detail.examples.join(" · ")}
                  </p>
                </div>
              ) : (
                <div key="idle" className="rise">
                  <div className="flex gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-peach text-orange">
                      <MapIcon className="size-[1.4rem]" strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0">
                      <p className="display text-[1.05rem] leading-snug text-midnight">
                        Reading the Map
                      </p>
                      <p className="mt-1.5 text-[0.86rem] leading-relaxed text-slate-ink">
                        Hover or tab through a node to bring it forward. Every node opens the
                        catalog already filtered to that cluster.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-fog px-3.5 py-2 text-[0.8rem] font-semibold text-midnight">
                      <Layers className="size-4 text-indigo" strokeWidth={2.2} />
                      Size = programme count
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-peach px-3.5 py-2 text-[0.8rem] font-semibold text-midnight">
                      <Target className="size-4 text-orange" strokeWidth={2.2} />
                      Inner ring = densest
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-7 flex gap-3">
              <ShieldCheck className="mt-0.5 size-[1.15rem] shrink-0 text-orange" aria-hidden="true" />
              <p className="border-l-2 border-midnight/10 pl-4 text-[0.84rem] leading-relaxed text-slate-ink">
                Biology-focused programmes are excluded from this catalog. Courses with specific
                subject requirements are flagged, never silently recommended.
              </p>
            </div>

            <Link
              href="/courses"
              className="btn-primary mt-7 inline-flex min-h-13 items-center gap-3 rounded-full px-7 text-[1rem] font-bold transition"
            >
              Browse all {TOTAL} courses
              <ArrowRight className="size-[1.15rem]" strokeWidth={2.6} aria-hidden="true" />
            </Link>
          </Reveal>

          {/* ── The map ──────────────────────────────────────────────────── */}
          <div ref={stageRef} className="md:col-span-7">
            {/* Desktop: the full orbital field. */}
            <div className="hidden px-6 py-6 md:block">
              <div className="relative mx-auto aspect-square w-full max-w-[460px] lg:max-w-[540px]">
                {/* Static backdrop: the two meaning-bearing rings plus the
                    concentric wash behind the core. */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 size-full overflow-visible"
                  aria-hidden="true"
                >
                  {[21, 25.5, 30, 35].map((r) => (
                    <circle
                      key={r}
                      cx="50"
                      cy="50"
                      r={r}
                      fill="none"
                      className="stroke-midnight/[0.07]"
                      strokeWidth="0.3"
                    />
                  ))}
                  <circle
                    cx="50"
                    cy="50"
                    r={INNER_RADIUS}
                    fill="none"
                    className="stroke-midnight/15"
                    strokeWidth="0.26"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={OUTER_RADIUS}
                    fill="none"
                    className="stroke-midnight/[0.12]"
                    strokeWidth="0.26"
                    strokeDasharray="1.2 1.8"
                  />

                  {/* Connectors: a soft halo under a light stroke, so the line
                      survives both the pale band and the dark page. */}
                  {NODES.map((node) => (
                    <g key={node.category}>
                      <line
                        x1={node.coreX}
                        y1={node.coreY}
                        x2={node.edgeX}
                        y2={node.edgeY}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        className="stroke-midnight/[0.06]"
                      />
                      <line
                        x1={node.coreX}
                        y1={node.coreY}
                        x2={node.edgeX}
                        y2={node.edgeY}
                        strokeWidth="1"
                        strokeLinecap="round"
                        className={cn(
                          "transition-all duration-300",
                          active === node.category ? "stroke-orange" : "stroke-midnight/25",
                        )}
                      />
                      <circle
                        cx={node.coreX}
                        cy={node.coreY}
                        r="1.5"
                        className="fill-surface stroke-midnight/20"
                        strokeWidth="0.3"
                      />
                      <circle
                        cx={node.edgeX}
                        cy={node.edgeY}
                        r="1.5"
                        className="fill-surface stroke-midnight/20"
                        strokeWidth="0.3"
                      />
                    </g>
                  ))}
                </svg>

                {/* Rotating orbit: the dashed outer ring and its markers are
                    the only things that move, so nothing has to be spun back
                    upright and no focus ring drifts off a node. */}
                <div className="absolute inset-0" style={spin}>
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 size-full overflow-visible"
                    aria-hidden="true"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r={ORBIT_RADIUS}
                      fill="none"
                      className="stroke-midnight/20"
                      strokeWidth="0.26"
                      strokeDasharray="2 2.6"
                    />
                    {ORBIT_DOTS.map((dot) => (
                      <g key={dot.angle}>
                        <circle cx={dot.x} cy={dot.y} r="2.4" fill="var(--color-orange)" opacity="0.18" />
                        <circle cx={dot.x} cy={dot.y} r="1" fill="var(--color-orange)" />
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Cluster tiles. */}
                {NODES.map((node) => {
                  const Icon = CATEGORY_ICONS[node.category];
                  const isActive = active === node.category;
                  const dimmed = active !== null && !isActive;
                  return (
                    <div
                      key={node.category}
                      className={cn("absolute", isActive ? "z-20" : "z-10")}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <Link
                        href={`/courses?category=${encodeURIComponent(node.category)}`}
                        aria-label={`${node.category} — ${node.count} programmes`}
                        onPointerEnter={() => setActive(node.category)}
                        onPointerLeave={() => setActive(null)}
                        onFocus={() => setActive(node.category)}
                        onBlur={() => setActive(null)}
                        className={cn(
                          /* Tailwind v4 compiles `scale-*` to the standalone
                             `scale` property rather than `transform`, so the
                             -50%/-50% centring here is never overwritten by
                             the hover pop. */
                          "block -translate-x-1/2 -translate-y-1/2 rounded-[1.4rem] transition-[scale,opacity,box-shadow] duration-300 ease-[var(--ease-spring)]",
                          isActive && "scale-[1.07]",
                          dimmed && "opacity-45",
                        )}
                        style={{ width: node.size, height: node.size }}
                      >
                        <span
                          className="grid size-full place-items-center rounded-[1.4rem] bg-surface/90 px-2 text-center backdrop-blur-sm transition-shadow duration-300"
                          style={{
                            boxShadow: isActive
                              ? `0 22px 48px -20px color-mix(in oklab, ${node.tone} 60%, transparent), inset 0 0 0 1.5px color-mix(in oklab, ${node.tone} 55%, transparent), inset 0 -36px 44px -28px ${node.tone}`
                              : `0 16px 36px -22px color-mix(in oklab, ${node.tone} 45%, transparent), inset 0 0 0 1px color-mix(in oklab, ${node.tone} 28%, transparent), inset 0 -36px 44px -30px ${node.tone}`,
                          }}
                        >
                          <span className="grid gap-0.5">
                            <Icon
                              className="mx-auto size-[1.35rem]"
                              style={{ color: node.tone }}
                              strokeWidth={2.3}
                              aria-hidden="true"
                            />
                            <span className="display text-[1.5rem] leading-none text-midnight">
                              {node.count}
                            </span>
                            <span className="mx-auto block max-w-[7.5rem] text-[0.68rem] font-semibold leading-tight text-slate-ink">
                              {node.category.replace(" & ", " & ")}
                            </span>
                          </span>
                        </span>
                      </Link>
                    </div>
                  );
                })}

                {/* Core: the anchor the whole catalog hangs off. */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ width: `${CORE_RADIUS * 2}%`, height: `${CORE_RADIUS * 2}%` }}
                  aria-hidden="true"
                >
                  <span className="absolute inset-[-9%] rounded-full bg-orange/35 blur-xl" />
                  <span
                    className="animate-pulse-soft absolute inset-[-4%] rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 210deg, var(--color-orange), var(--color-orange-soft), rgba(255,107,53,0.15), var(--color-orange))",
                      animationPlayState: running ? "running" : "paused",
                    }}
                  />
                  <div className="absolute inset-0 grid place-items-center rounded-full bg-[var(--color-navy)] text-center shadow-[inset_0_-30px_60px_-30px_rgba(255,107,53,0.55)]">
                    <div>
                      <p className="display text-[2.4rem] leading-none text-white lg:text-[2.8rem]">
                        {TOTAL}
                      </p>
                      <p className="mt-2 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white/65">
                        courses mapped
                      </p>
                      <p className="mt-3 inline-block rounded-full bg-orange px-3.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white">
                        0 biology
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone: the field collapses to a compact core plus a snap rail.
                Orbiting labels never fit 390px legibly, so the nodes become
                swipeable cards and only the core keeps the ambient motion. */}
            <div className="md:hidden">
              <div className="relative mx-auto aspect-square w-[200px]" aria-hidden="true">
                <div className="absolute inset-0" style={spin}>
                  <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
                    <circle
                      cx="50"
                      cy="50"
                      r={ORBIT_RADIUS}
                      fill="none"
                      className="stroke-midnight/20"
                      strokeWidth="0.5"
                      strokeDasharray="2 2.6"
                    />
                    {ORBIT_DOTS.map((dot) => (
                      <circle
                        key={dot.angle}
                        cx={dot.x}
                        cy={dot.y}
                        r="1.6"
                        fill="var(--color-orange)"
                      />
                    ))}
                  </svg>
                </div>
                <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
                  {[24, 30, 36].map((r) => (
                    <circle
                      key={r}
                      cx="50"
                      cy="50"
                      r={r}
                      fill="none"
                      className="stroke-midnight/10"
                      strokeWidth="0.5"
                    />
                  ))}
                </svg>
                <div className="absolute left-1/2 top-1/2 size-[42%] -translate-x-1/2 -translate-y-1/2">
                  <span className="absolute inset-[-12%] rounded-full bg-orange/35 blur-lg" />
                  <span
                    className="absolute inset-[-5%] rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 210deg, var(--color-orange), var(--color-orange-soft), rgba(255,107,53,0.15), var(--color-orange))",
                    }}
                  />
                  <div className="absolute inset-0 grid place-items-center rounded-full bg-[var(--color-navy)]">
                    <div className="text-center">
                      <p className="display text-xl leading-none text-white">{TOTAL}</p>
                      <p className="mt-1 text-[0.48rem] font-bold uppercase tracking-[0.12em] text-white/60">
                        mapped
                      </p>
                      <p className="mt-1.5 inline-block rounded-full bg-orange px-2 py-0.5 text-[0.46rem] font-bold uppercase tracking-[0.1em] text-white">
                        0 biology
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="m-scroll-x -mx-5 mt-7 flex list-none gap-3 overflow-x-auto px-5 pb-2">
                {NODES.map((node) => {
                  const Icon = CATEGORY_ICONS[node.category];
                  return (
                    <li key={node.category} className="shrink-0">
                      <Link
                        href={`/courses?category=${encodeURIComponent(node.category)}`}
                        aria-label={`${node.category} — ${node.count} programmes`}
                        className="flex h-full min-h-[132px] w-[70vw] max-w-[248px] flex-col justify-between gap-4 rounded-[1.4rem] bg-surface/90 p-4"
                        style={{
                          boxShadow: `0 16px 36px -22px color-mix(in oklab, ${node.tone} 45%, transparent), inset 0 0 0 1px color-mix(in oklab, ${node.tone} 28%, transparent), inset 0 -40px 50px -34px ${node.tone}`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className="grid size-11 shrink-0 place-items-center rounded-2xl"
                            style={{
                              background: `color-mix(in oklab, ${node.tone} 14%, transparent)`,
                              color: node.tone,
                            }}
                          >
                            <Icon className="size-[1.2rem]" strokeWidth={2.2} aria-hidden="true" />
                          </span>
                          <span className="display text-[1.5rem] leading-none text-midnight">
                            {node.count}
                          </span>
                        </div>
                        <div>
                          <h3 className="display text-[0.95rem] leading-snug text-midnight">
                            {node.category}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-ink">
                            {node.inner ? "Inner ring" : "Outer ring"}
                            <ArrowUpRight className="size-3.5 text-orange" aria-hidden="true" />
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
