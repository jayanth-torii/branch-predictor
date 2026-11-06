"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  Code2,
  Palette,
  ShieldCheck,
  Sigma,
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

/* ── Map geometry ──────────────────────────────────────────────────────────
   The six clusters are laid out as a two-ring constellation, and both spatial
   variables carry meaning rather than decoration:

     node size      → programmes in the cluster (62px … 90px)
     ring distance  → the three densest clusters sit on the INNER ring

   Angles interleave the rings by 60°, so the six nodes read as a hexagon from
   the centre outwards and nothing collides while the field rotates. All of it
   is derived once at module scope: the component renders no geometry maths,
   and nothing here touches Date or Math.random. */
const INNER_ANGLES = [-90, 30, 150];
const OUTER_ANGLES = [-30, 90, 210];
const INNER_RADIUS = 31;
const OUTER_RADIUS = 42;
const SPIN_SECONDS = 96;

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
const DENSEST = new Set(
  [...ENTRIES]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((entry) => entry.category),
);

let innerSlot = 0;
let outerSlot = 0;
const NODES = ENTRIES.map((entry) => {
  const inner = DENSEST.has(entry.category);
  const angle = inner ? INNER_ANGLES[innerSlot++] : OUTER_ANGLES[outerSlot++];
  const radius = inner ? INNER_RADIUS : OUTER_RADIUS;
  const radians = (angle * Math.PI) / 180;
  return {
    ...entry,
    inner,
    x: 50 + radius * Math.cos(radians),
    y: 50 + radius * Math.sin(radians),
    size: 62 + Math.round(((entry.count - MIN_COUNT) / COUNT_SPAN) * 28),
  };
});

const TOTAL = COURSES.length;

export function UniverseSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.2 });
  const reduced = useReducedMotion();
  const [active, setActive] = useState<CourseCategory | null>(null);

  /* Ambient motion runs only when the map is on screen, motion is allowed, and
     nothing is being inspected — grabbing a node stops the field so it can be
     read and clicked, and so a keyboard focus ring never drifts away. */
  const running = inView && !reduced && active === null;

  const spin = (reverse: boolean): CSSProperties | undefined =>
    reduced
      ? undefined
      : {
          animationName: "orbit-spin",
          animationDuration: `${SPIN_SECONDS}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: running ? "running" : "paused",
          willChange: "transform",
        };

  const detail = NODES.find((node) => node.category === active) ?? null;

  return (
    <section id="course-universe" className="relative isolate overflow-hidden">
      <div className="aurora opacity-70" aria-hidden="true" />
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          {/* ── Narrative column ─────────────────────────────────────────── */}
          <Reveal className="md:col-span-5">
            <p className="eyebrow">The course universe</p>
            <h2 className="display mt-2.5 text-3xl leading-[1.08] text-balance text-midnight sm:text-[2.6rem]">
              {TOTAL} undergraduate directions. Zero biology courses.
            </h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-slate-ink">
              Six clusters orbit one catalog. The bigger the node, the more programmes it holds —
              and the inner ring is where the catalog runs densest.
            </p>

            {/* Hover/focus readout. A visual echo of the focused node, so it is
                hidden from assistive tech: the link itself carries the name. */}
            <div className="card mt-6 hidden min-h-[148px] p-5 md:block" aria-hidden="true">
              {detail ? (
                <div key={detail.category} className="rise">
                  <p className="eyebrow text-orange">
                    {detail.inner ? "Inner ring · dense cluster" : "Outer ring"}
                  </p>
                  <p className="display mt-2 text-lg leading-snug text-midnight">
                    {detail.category}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-ink">
                    {detail.count} programmes
                  </p>
                  <p className="mt-2 text-[0.78rem] leading-relaxed text-slate-ink">
                    {detail.examples.join(" · ")}
                  </p>
                </div>
              ) : (
                <div key="idle" className="rise">
                  <p className="eyebrow">Reading the map</p>
                  <p className="mt-2 text-[0.85rem] leading-relaxed text-slate-ink">
                    Hover or tab through a node to bring it forward. Every node opens the catalog
                    already filtered to that cluster.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="chip chip-xs">Size = programme count</span>
                    <span className="chip chip-xs">Inner ring = densest</span>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-6 flex gap-2 text-xs leading-relaxed text-slate-ink">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-orange" aria-hidden="true" />
              <span>
                Biology-focused programmes are excluded from this catalog. Courses with specific
                subject requirements are flagged, never silently recommended.
              </span>
            </p>

            <Link href="/courses" className="btn btn-primary mt-6">
              Browse all {TOTAL} courses
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>

          {/* ── The map ──────────────────────────────────────────────────── */}
          <div ref={stageRef} className="md:col-span-7">
            {/* Desktop: the full orbital field. */}
            <div className="hidden px-4 pb-10 md:block">
              <div className="relative mx-auto aspect-square w-full max-w-[460px] lg:max-w-[520px]">
                {/* Rotating field: rings, connectors and nodes travel together. */}
                <div className="absolute inset-0" style={spin(false)}>
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 size-full overflow-visible"
                    aria-hidden="true"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r={INNER_RADIUS}
                      fill="none"
                      className="stroke-midnight/25"
                      strokeWidth="0.24"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={OUTER_RADIUS}
                      fill="none"
                      className="stroke-midnight/20"
                      strokeWidth="0.24"
                      strokeDasharray="1.4 1.8"
                    />
                    {NODES.map((node) => (
                      <line
                        key={node.category}
                        x1="50"
                        y1="50"
                        x2={node.x}
                        y2={node.y}
                        strokeWidth={active === node.category ? 0.5 : 0.26}
                        className={cn(
                          "transition-all duration-300",
                          active === node.category
                            ? "stroke-orange"
                            : active
                              ? "stroke-midnight/15"
                              : "stroke-midnight/30",
                        )}
                      />
                    ))}
                  </svg>

                  {NODES.map((node) => {
                    const Icon = CATEGORY_ICONS[node.category];
                    const isActive = active === node.category;
                    const dimmed = active !== null && !isActive;
                    return (
                      <div
                        key={node.category}
                        className={cn("absolute", isActive && "z-20")}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                      >
                        <div className="-translate-x-1/2 -translate-y-1/2">
                          {/* Counter-spin keeps every label upright while the
                              field turns; it pivots on the node's own centre. */}
                          <div style={spin(true)}>
                            <Link
                              href={`/courses?category=${encodeURIComponent(node.category)}`}
                              aria-label={`${node.category} — ${node.count} programmes`}
                              onPointerEnter={() => setActive(node.category)}
                              onPointerLeave={() => setActive(null)}
                              onFocus={() => setActive(node.category)}
                              onBlur={() => setActive(null)}
                              className={cn(
                                /* Tailwind v4 compiles `scale-*` to the standalone
                                   `scale` property, not `transform` — which is
                                   what we want (it cannot fight the counter-spin
                                   transform), but it has to be named here or the
                                   pop-forward snaps instead of easing. */
                                "relative block rounded-full transition-[scale,opacity] duration-300 ease-[var(--ease-spring)]",
                                isActive && "scale-[1.12]",
                                dimmed && "opacity-45",
                              )}
                              style={{ width: node.size, height: node.size }}
                            >
                              <span
                                className={cn(
                                  "grid size-full place-items-center gap-0.5 rounded-full border bg-surface text-indigo shadow-soft transition-colors duration-300",
                                  isActive
                                    ? "border-orange/70 text-orange shadow-lift"
                                    : "border-[var(--line-strong)]",
                                )}
                              >
                                <Icon
                                  className="size-[18px] self-end"
                                  strokeWidth={1.7}
                                  aria-hidden="true"
                                />
                                <span className="display self-start text-[0.9rem] leading-none">
                                  {node.count}
                                </span>
                              </span>
                              <span
                                className={cn(
                                  "absolute left-1/2 top-full mt-2.5 block w-[136px] -translate-x-1/2 text-center text-[0.72rem] font-semibold leading-tight transition-colors duration-300",
                                  isActive ? "text-midnight" : "text-slate-ink",
                                )}
                              >
                                {node.category}
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Core: the anchor the whole catalog hangs off. */}
                <div
                  className="animate-pulse-soft pointer-events-none absolute left-1/2 top-1/2 size-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange/30"
                  style={{ animationPlayState: running ? "running" : "paused" }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 size-[26%] -translate-x-1/2 -translate-y-1/2"
                  aria-hidden="true"
                >
                  <div className="glow inset-[-18%]" />
                  <div className="card-dark grid size-full !rounded-full place-items-center text-center">
                    <div>
                      <p className="display text-2xl leading-none text-white">{TOTAL}</p>
                      <p className="mt-1.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white/60">
                        courses mapped
                      </p>
                      <p className="mt-2 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-orange-soft">
                        0 biology
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone: the field collapses to a compact core plus a snap rail.
                Six orbiting labels never fit 390px legibly, so the nodes become
                swipeable cards and only the core keeps the ambient motion. */}
            <div className="md:hidden">
              <div className="relative mx-auto aspect-square w-[188px]" aria-hidden="true">
                <div className="absolute inset-0" style={spin(false)}>
                  <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
                    <circle
                      cx="50"
                      cy="50"
                      r={INNER_RADIUS}
                      fill="none"
                      className="stroke-midnight/25"
                      strokeWidth="0.4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={OUTER_RADIUS}
                      fill="none"
                      className="stroke-midnight/20"
                      strokeWidth="0.4"
                      strokeDasharray="2 2.6"
                    />
                    {NODES.map((node) => (
                      <line
                        key={node.category}
                        x1="50"
                        y1="50"
                        x2={node.x}
                        y2={node.y}
                        strokeWidth="0.4"
                        className="stroke-midnight/25"
                      />
                    ))}
                  </svg>
                  {NODES.map((node) => (
                    <span
                      key={node.category}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line-strong)] bg-surface shadow-soft"
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: Math.round(node.size / 3.2),
                        height: Math.round(node.size / 3.2),
                      }}
                    />
                  ))}
                </div>
                <div className="absolute left-1/2 top-1/2 size-[36%] -translate-x-1/2 -translate-y-1/2">
                  <div className="glow inset-[-20%]" />
                  <div className="card-dark grid size-full !rounded-full place-items-center">
                    <div className="text-center">
                      <p className="display text-lg leading-none text-white">{TOTAL}</p>
                      <p className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-orange-soft">
                        0 biology
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="m-scroll-x -mx-5 mt-6 flex list-none gap-3 overflow-x-auto px-5 pb-2">
                {NODES.map((node) => {
                  const Icon = CATEGORY_ICONS[node.category];
                  return (
                    <li key={node.category} className="shrink-0">
                      <Link
                        href={`/courses?category=${encodeURIComponent(node.category)}`}
                        aria-label={`${node.category} — ${node.count} programmes`}
                        className="glass glass-sheen flex h-full min-h-[128px] w-[70vw] max-w-[248px] flex-col justify-between gap-4 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className="grid shrink-0 place-items-center rounded-full border border-[var(--line-strong)] bg-surface text-indigo"
                            style={{
                              width: Math.round(node.size * 0.62),
                              height: Math.round(node.size * 0.62),
                            }}
                          >
                            <Icon className="size-[17px]" strokeWidth={1.7} aria-hidden="true" />
                          </span>
                          <span className="chip chip-xs">
                            {node.inner ? "Inner ring" : "Outer ring"}
                          </span>
                        </div>
                        <div>
                          <h3 className="display text-[0.95rem] leading-snug text-midnight">
                            {node.category}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-ink">
                            {node.count} programmes
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
