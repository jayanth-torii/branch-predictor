"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, Code2, Palette, Sigma, Users, Wrench } from "lucide-react";
import { DIMENSION_META, type InterestProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

const ORBIT_ICONS = [
  { Icon: Code2, angle: 0, label: "Technology" },
  { Icon: Palette, angle: 60, label: "Design" },
  { Icon: Wrench, angle: 120, label: "Engineering" },
  { Icon: Briefcase, angle: 180, label: "Business" },
  { Icon: Users, angle: 240, label: "People" },
  { Icon: Sigma, angle: 300, label: "Analytics" },
];

export function OrbitScene({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div
      className={cn("relative aspect-square w-full max-w-[300px] sm:max-w-[460px]", className)}
      aria-hidden="true"
    >
      <div className="absolute inset-[16%] rounded-full bg-orange/10 blur-2xl" />
      <div className="absolute inset-[24%] rounded-full border border-midnight/[0.08]" />
      <div className="absolute inset-[8%] rounded-full border border-dashed border-midnight/[0.12]" />
      <div className="absolute inset-[2%] rounded-full border border-midnight/[0.05]" />

      {/* Orbiting glyphs */}
      <div className={cn("absolute inset-0", !reduced && "animate-orbit")}>
        {ORBIT_ICONS.map(({ Icon, angle, label }, index) => {
          const radius = 46;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + radius * Math.cos(rad);
          const y = 50 + radius * Math.sin(rad);
          return (
            <div
              key={label}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
            >
              <div
                className="grid size-10 place-items-center rounded-2xl border border-midnight/[0.07] bg-surface/90 text-indigo shadow-soft sm:size-11 md:backdrop-blur-sm"
                style={{
                  animation: reduced ? undefined : `orbit-spin ${22 + index * 2}s linear infinite reverse`,
                }}
              >
                <Icon className="size-[18px]" strokeWidth={1.6} />
              </div>
            </div>
          );
        })}
      </div>

      {/*
        The profile core. This was a flat orange gradient sphere — a featureless
        ball sitting where the product should be, and the single thing making
        the hero look cheap. It is now the real artefact: a dark glass disc with
        the six-dimension radar forming inside it, which is literally what the
        app builds. Dark on a light page also gives the hero the contrast the
        whole composition was missing.
      */}
      <motion.div
        className="absolute left-1/2 top-1/2 size-[54%] -translate-x-1/2 -translate-y-1/2"
        animate={reduced ? undefined : { y: ["-51%", "-49%", "-51%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="relative grid size-full place-items-center rounded-full"
          style={{
            background:
              "radial-gradient(130% 130% at 30% 18%, #22305A 0%, #141F3E 42%, #0B1226 100%)",
            boxShadow:
              "0 48px 90px -34px rgba(11,18,38,0.65), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -30px 60px rgba(0,0,0,0.45)",
          }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-[6%] rounded-full"
            style={{
              background:
                "radial-gradient(70% 70% at 50% 120%, rgba(255,107,53,0.38) 0%, transparent 70%)",
            }}
          />
          <RadarCore reduced={reduced} />
        </div>
      </motion.div>

      {/* Floating insight card */}
      <motion.div
        className="absolute -left-2 top-[16%] w-[150px] rounded-2xl border border-[var(--glass-line)] bg-[var(--glass-bg)] p-3 shadow-soft sm:-left-6 sm:w-[168px] sm:p-3.5 md:backdrop-blur-md"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
      >
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-ink">
          Interest signal
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-peach text-orange">
            <Code2 className="size-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-midnight">Technology</p>
            <p className="text-[0.65rem] text-slate-ink">rising · 4th answer</p>
          </div>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-midnight/[0.08]">
          <div className="h-full w-[78%] rounded-full bg-orange" />
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-1 bottom-[20%] rounded-2xl border border-[var(--glass-line)] bg-[var(--glass-bg)] px-3 py-2 shadow-soft sm:-right-4 sm:px-3.5 sm:py-2.5 md:backdrop-blur-md"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.7 }}
      >
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-ink">
          Matches found
        </p>
        <p className="display text-lg text-midnight">
          14 <span className="text-sm font-semibold text-slate-ink">possible paths</span>
        </p>
      </motion.div>
    </div>
  );
}

export function OrbitCompanion({
  profile,
  step,
  total,
}: {
  profile: InterestProfile;
  step: number;
  total: number;
}) {
  const strongest = (Object.keys(profile) as (keyof InterestProfile)[]).sort(
    (a, b) => profile[b] - profile[a],
  )[0];
  const meta = DIMENSION_META[strongest];
  const hasSignal = profile[strongest] > 0;

  return (
    <aside className="relative hidden w-full max-w-[300px] flex-col gap-5 lg:flex">
      <div className="relative mx-auto aspect-square w-full max-w-[220px]">
        <div className="absolute inset-[18%] rounded-full bg-orange/10 blur-xl" />
        <div className="absolute inset-[4%] rounded-full border border-dashed border-midnight/10 animate-orbit" />
        <div
          className="absolute inset-[22%] rounded-full"
          style={{
            background:
              "radial-gradient(120% 120% at 32% 24%, #FFC9B3 0%, #FF8D5F 34%, #FF6B35 68%, #E1481A 100%)",
            boxShadow:
              "0 26px 50px -22px rgba(255,107,53,0.55), inset -12px -16px 28px rgba(129,36,8,0.25), inset 8px 10px 20px rgba(255,255,255,0.4)",
          }}
        />
        <div className="absolute left-1/2 top-[52%] h-[2px] w-[34%] -translate-x-1/2 rounded-full bg-white/40" />
      </div>
      <div className="card !rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Orbit · live read</p>
          <span className="text-[0.65rem] font-semibold text-slate-ink">
            {step}/{total}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-ink">
          {hasSignal ? (
            <>
              Your strongest signal so far is{" "}
              <span className="font-semibold text-midnight">{meta.short}</span>. Keep going — the
              picture changes as you answer.
            </>
          ) : (
            <>Answer the first question and I will start mapping your interest pattern here.</>
          )}
        </p>
        {hasSignal && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-midnight/[0.08]">
            <motion.div
              className="h-full rounded-full bg-orange"
              initial={false}
              animate={{ width: `${Math.max(8, profile[strongest])}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        )}
      </div>
      <p className="px-2 text-[0.68rem] leading-relaxed text-slate-ink/80">
        Orbit is a visual companion, not an AI personality. Your profile is computed from your
        answers using a fixed, transparent scoring model.
      </p>
    </aside>
  );
}

/**
 * The six-dimension radar that sits inside the profile core. Drawn by hand
 * rather than with Recharts so it stays cheap, needs no resolvable parent
 * width, and can animate its polygon without a chart library re-layout.
 */
const CORE_VALUES = [82, 64, 48, 36, 42, 76];

function RadarCore({ reduced }: { reduced: boolean | null }) {
  const point = (index: number, radius: number) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius] as const;
  };
  const ring = (radius: number) =>
    CORE_VALUES.map((_, i) => point(i, radius).join(",")).join(" ");
  const shape = CORE_VALUES.map((v, i) => point(i, (v / 100) * 38).join(",")).join(" ");

  return (
    <svg viewBox="0 0 100 100" className="relative size-[72%]" aria-hidden="true">
      {[38, 27, 16].map((r) => (
        <polygon
          key={r}
          points={ring(r)}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.14"
          strokeWidth="0.6"
        />
      ))}
      {CORE_VALUES.map((_, i) => {
        const [x, y] = point(i, 38);
        return (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={x}
            y2={y}
            stroke="#fff"
            strokeOpacity="0.1"
            strokeWidth="0.6"
          />
        );
      })}
      <motion.polygon
        points={shape}
        fill="#FF6B35"
        fillOpacity="0.3"
        stroke="#FF8A5F"
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={reduced ? false : { scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "50% 50%" }}
      />
      {CORE_VALUES.map((v, i) => {
        const [x, y] = point(i, (v / 100) * 38);
        return <circle key={i} cx={x} cy={y} r="1.7" fill="#FFB08A" />;
      })}
    </svg>
  );
}
