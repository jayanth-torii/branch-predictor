"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  Info,
  Layers,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/ui";

/* ══════════════════════════════════════════════════════════════════════════
   FOR TRAINERS & PU INSTITUTIONS — the batch pass.

   Two earlier attempts failed the same way: a label/value list, then a chart
   mock. Both were "here is a dashboard", which every B2B band on every landing
   page already says.

   This leads with the actual ritual instead — a trainer puts a code on the
   board and the class joins. The pass is the hero object, the class assembling
   around it is the proof, and the CTA below it is the same code made live.

   The band is LIGHT. It used to be `.band-dark`; the pass now carries the dark
   weight in its own header, which is what gives the card its focus.
   ══════════════════════════════════════════════════════════════════════════ */

const BATCH_CODE = "PTH-2027";

/** The class assembling. Initials only — the aggregate-first promise. */
const JOINERS = ["Aarav", "Sana", "Rhea", "Vikram", "Neha", "Imran", "Divya", "Karan"];
const JOINED_TOTAL = 42;

/** Four pastel chips, cycled. Fixed hexes: the pass reads the same in both
    themes, the way a printed pass would. */
const AVATAR_TINTS = ["#dbe8ff", "#e7e0ff", "#ffe2ea", "#d9f3e4"];

const PROMISES = [
  { icon: Layers, text: "Aggregate by default — the dashboard opens on totals, not individuals" },
  { icon: ShieldCheck, text: "No student accounts, no emails collected" },
];

/* A stylised QR block. The data area is a deterministic function of the cell
   index — no Date, no Math.random — so the pass renders identically on the
   server and the client and never trips hydration. */
const QR_CELLS = 13;
const QR_FINDERS = [
  [0, 0],
  [QR_CELLS - 3, 0],
  [0, QR_CELLS - 3],
];

function isQuietCell(x: number, y: number): boolean {
  // The ring of empty cells each finder square needs to stay legible.
  return QR_FINDERS.some(([fx, fy]) => x >= fx - 1 && x <= fx + 3 && y >= fy - 1 && y <= fy + 3);
}

export function EducatorsSection() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const shown = reduced || inView;
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(BATCH_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // No clipboard permission, or an insecure origin. The code is on screen
      // in 2.6rem type; a failed copy is not worth an error state.
    }
  }

  return (
    <section className="relative isolate overflow-hidden border-y border-midnight/[0.07] bg-arctic">
      <div className="aurora opacity-50" aria-hidden="true" />

      {/* The two corner waves from the print layout, clipped by the section. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <svg
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          className="absolute -bottom-6 -right-8 h-44 w-[28rem] sm:h-56"
        >
          <path d="M400 20 C 300 56 236 120 150 200 L400 200 Z" fill="var(--color-navy)" opacity="0.9" />
          <path d="M400 86 C 330 104 290 146 248 200 L400 200 Z" fill="var(--color-orange)" />
          <path d="M400 142 C 364 152 340 172 316 200 L400 200 Z" fill="var(--color-navy)" opacity="0.5" />
        </svg>
      </div>

      <div
        ref={ref}
        className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.95fr_1.05fr]"
      >
        {/* ── The pitch ────────────────────────────────────────────────── */}
        <Reveal>
          <span className="inline-flex items-center gap-2.5 rounded-full bg-surface py-2 pl-3 pr-4 shadow-soft ring-1 ring-midnight/[0.07]">
            <span className="grid size-6 place-items-center rounded-lg bg-peach text-orange">
              <Layers className="size-[0.95rem]" strokeWidth={2.6} aria-hidden="true" />
            </span>
            <span className="text-[0.82rem] font-bold tracking-tight text-midnight">
              For Trainers &amp; PU Institutions
            </span>
          </span>

          <h2 className="display mt-5 max-w-lg text-[2rem] leading-[1.06] text-balance text-midnight sm:text-[2.6rem]">
            Put one code on the board. Watch the{" "}
            <span className="relative inline-block text-orange">
              batch map itself.
              {/* Symmetric arc in em units, so it tracks the headline as it
                  scales instead of lining up at only one breakpoint. */}
              <svg
                aria-hidden="true"
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
                className="pointer-events-none absolute left-0 top-[0.97em] h-[0.13em] w-full overflow-visible"
              >
                <path
                  d="M4 14 Q 100 3 196 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-slate-ink">
            Students join with a batch code — no accounts, no emails, nothing to set up. You get
            interest distribution, course demand and the students still undecided, aggregated.
          </p>

          <ul className="mt-7 space-y-3.5">
            {PROMISES.map((promise) => (
              <li key={promise.text} className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-2xl bg-peach text-orange shadow-soft ring-1 ring-midnight/[0.05]"
                >
                  <promise.icon className="size-[1.25rem]" strokeWidth={2.3} />
                </span>
                <span className="text-[0.95rem] font-bold leading-snug text-midnight">
                  {promise.text}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/admin"
              className="btn-primary inline-flex min-h-13 items-center gap-3 rounded-full px-7 text-[0.98rem] font-bold transition"
            >
              Open educator dashboard
              <ArrowRight className="size-[1.1rem]" strokeWidth={2.6} aria-hidden="true" />
            </Link>
            <Link
              href={`/join/${BATCH_CODE}`}
              className="inline-flex min-h-13 items-center rounded-full bg-surface px-7 text-[0.98rem] font-bold text-midnight shadow-soft ring-1 ring-midnight/10 transition hover:bg-fog"
            >
              Try this code live
            </Link>
          </div>

          <p className="mt-7 flex max-w-md gap-3 text-[0.78rem] leading-relaxed text-slate-ink">
            <Info className="mt-0.5 size-[1.05rem] shrink-0 text-indigo" aria-hidden="true" />
            <span>
              The pass above is an illustration. A real batch is created in the dashboard, and the
              answers behind it stay with the educator who owns the code — nothing is published,
              and no student account or email is ever collected.
            </span>
          </p>
        </Reveal>

        {/* ── The pass ─────────────────────────────────────────────────── */}
        <Reveal delay={0.1}>
          <div className="relative mx-auto w-full max-w-[28rem]">
            {/* An orange card offset behind, so the pass reads as the top of a
                stack a trainer hands out. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-8 -right-5 left-16 -z-10 rounded-[2.2rem] bg-orange"
            />

            <motion.div
              className="relative overflow-hidden rounded-[1.8rem] bg-surface shadow-lift ring-1 ring-midnight/[0.07]"
              initial={reduced ? false : { opacity: 0, y: 18, rotate: -1.5 }}
              animate={shown ? { opacity: 1, y: 0, rotate: 0 } : undefined}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* ── Stub: fixed navy in both themes ───────────────────── */}
              <div className="relative bg-[var(--color-navy)] px-6 pb-7 pt-6 sm:px-7">
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-orange text-white">
                        <Ticket className="size-[1.1rem]" strokeWidth={2.3} aria-hidden="true" />
                      </span>
                      <span className="display text-[1.5rem] leading-none text-white">
                        Batch Pass
                      </span>
                    </p>
                    <p className="mt-2.5 truncate text-[1rem] text-white/70">PU 2027 · Science</p>
                  </div>

                  {/* Stylised QR. Decorative: it encodes nothing, so it is
                      hidden rather than described as a scannable code. */}
                  <span aria-hidden="true" className="relative shrink-0">
                    <svg viewBox="0 0 70 70" className="size-[4.4rem] sm:size-[5rem]">
                      <rect x="5" y="5" width="60" height="60" rx="3" fill="#ffffff" />
                      {Array.from({ length: QR_CELLS }, (_, y) =>
                        Array.from({ length: QR_CELLS }, (_, x) => {
                          if (isQuietCell(x, y)) return null;
                          const on = (x * 5 + y * 11 + ((x ^ y) * 3)) % 7 < 3;
                          if (!on) return null;
                          return (
                            <rect
                              key={`${x}-${y}`}
                              x={8 + x * 4.2}
                              y={8 + y * 4.2}
                              width="3.4"
                              height="3.4"
                              fill="#0b1226"
                            />
                          );
                        }),
                      )}
                      {QR_FINDERS.map(([fx, fy]) => (
                        <g key={`${fx}-${fy}`}>
                          <rect
                            x={8 + fx * 4.2 - 1}
                            y={8 + fy * 4.2 - 1}
                            width="14.6"
                            height="14.6"
                            fill="none"
                            stroke="#0b1226"
                            strokeWidth="2.6"
                          />
                          <rect
                            x={8 + fx * 4.2 + 3.4}
                            y={8 + fy * 4.2 + 3.4}
                            width="5.8"
                            height="5.8"
                            fill="#0b1226"
                          />
                        </g>
                      ))}
                      {/* Scanner brackets. */}
                      <g
                        fill="none"
                        stroke="var(--color-orange)"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                      >
                        <path d="M2 14 V5 Q2 2 5 2 H14" />
                        <path d="M56 2 H65 Q68 2 68 5 V14" />
                        <path d="M68 56 V65 Q68 68 65 68 H56" />
                        <path d="M14 68 H5 Q2 68 2 65 V56" />
                      </g>
                    </svg>
                  </span>
                </div>

                {/* Perforation — the pass tears here. */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 6"
                  preserveAspectRatio="none"
                  className="absolute inset-x-0 bottom-0 h-3"
                >
                  <path
                    d={`M0 6 ${Array.from(
                      { length: 25 },
                      (_, i) => `L${i * 4 + 2} 0 L${i * 4 + 4} 6`,
                    ).join(" ")} Z`}
                    fill="var(--color-surface)"
                  />
                </svg>
              </div>

              {/* ── Counterfoil ──────────────────────────────────────── */}
              <div className="px-6 pb-6 pt-5 sm:px-7">
                <p className="text-[0.92rem] font-semibold text-slate-ink">Join Code</p>

                <div className="mt-2.5 flex items-center gap-3">
                  <p className="display min-w-0 flex-1 truncate rounded-2xl bg-peach px-5 py-3.5 text-[2.1rem] leading-none tracking-[0.02em] text-midnight sm:text-[2.6rem]">
                    {BATCH_CODE}
                  </p>
                  <button
                    type="button"
                    onClick={copyCode}
                    aria-label={`Copy batch code ${BATCH_CODE}`}
                    className="grid size-[3.6rem] shrink-0 place-items-center rounded-2xl bg-orange text-white shadow-[0_14px_30px_-14px_rgba(255,107,53,0.9)] transition hover:brightness-95"
                  >
                    {copied ? (
                      <Check className="size-[1.3rem]" strokeWidth={2.6} aria-hidden="true" />
                    ) : (
                      <Copy className="size-[1.3rem]" strokeWidth={2.2} aria-hidden="true" />
                    )}
                  </button>
                </div>

                <p className="mt-3.5 text-[0.88rem] leading-relaxed text-slate-ink">
                  Students open Pathora, type the code, and start. Nothing to install.
                </p>

                <span
                  aria-hidden="true"
                  className="my-5 block border-t border-midnight/[0.09]"
                />

                <div className="flex items-center justify-between gap-4">
                  <p className="flex items-center gap-2.5 text-[1rem] font-bold text-midnight">
                    <Users className="size-[1.2rem] text-orange" strokeWidth={2.3} aria-hidden="true" />
                    Joined so far
                  </p>
                  <span className="display rounded-2xl border border-orange/45 px-4 py-1.5 text-[1.25rem] leading-none text-orange">
                    {JOINED_TOTAL}
                  </span>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  {JOINERS.map((name, index) => (
                    <motion.span
                      key={name}
                      title={name}
                      className="grid size-9 place-items-center rounded-full text-[0.9rem] font-bold text-[#101b3d]"
                      style={{ background: AVATAR_TINTS[index % AVATAR_TINTS.length] }}
                      initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                      animate={shown ? { opacity: 1, scale: 1 } : undefined}
                      transition={{
                        duration: 0.35,
                        delay: 0.3 + index * 0.07,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                    >
                      {name.charAt(0)}
                    </motion.span>
                  ))}
                  <motion.span
                    className="rounded-full bg-peach px-3.5 py-2 text-[0.82rem] font-bold text-orange"
                    initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                    animate={shown ? { opacity: 1, scale: 1 } : undefined}
                    transition={{ duration: 0.35, delay: 0.3 + JOINERS.length * 0.07 }}
                  >
                    +{JOINED_TOTAL - JOINERS.length} more
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
