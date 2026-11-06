"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
  y = 22,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className={cn("eyebrow", dark && "text-orange-soft")}>{eyebrow}</p>
      )}
      <h2
        className={cn(
          "display mt-2.5 text-3xl leading-[1.08] text-balance sm:text-[2.6rem]",
          dark ? "text-white" : "text-midnight",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-[0.98rem] leading-relaxed",
            dark ? "text-white/70" : "text-slate-ink",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export function ProgressBar({
  value,
  className,
  dark = false,
}: {
  value: number;
  className?: string;
  dark?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full",
        dark ? "bg-white/15" : "bg-midnight/10",
        className,
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full bg-orange"
        initial={false}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export function MeterRow({
  label,
  value,
  color,
  suffix,
}: {
  label: string;
  value: number;
  color?: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-ink">{label}</p>
        <p className="text-xs font-semibold tabular-nums text-midnight">
          {value}
          {suffix ?? ""}
        </p>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-midnight/[0.08]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(2, Math.min(100, value))}%`, background: color ?? "var(--color-orange)" }}
        />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-8 py-16 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-peach text-orange">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-2 5-5 2 2-5z" />
        </svg>
      </div>
      <h3 className="display text-xl text-midnight">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-slate-ink">{description}</p>
      {children}
    </div>
  );
}
