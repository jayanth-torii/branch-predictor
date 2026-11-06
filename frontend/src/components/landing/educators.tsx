"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, EyeOff, QrCode } from "lucide-react";
import { Reveal } from "@/components/ui";

/* ══════════════════════════════════════════════════════════════════════════
   FOR TRAINERS & PU INSTITUTIONS — the batch pass.

   Two earlier attempts failed the same way: a label/value list, then a chart
   mock. Both were "here is a dashboard", which every B2B band on every landing
   page already says.

   This leads with the actual ritual instead — a trainer puts a code on the
   board and the class joins. The pass is the hero object, the class assembling
   around it is the proof, and the CTA below it is the same code made live.
   ══════════════════════════════════════════════════════════════════════════ */

const BATCH_CODE = "PTH-2027";

/** The class assembling. First names only — the aggregate-first promise. */
const JOINERS = ["Aarav", "Sana", "Rhea", "Vikram", "Neha", "Imran", "Divya", "Karan"];

const PROMISES = [
  { icon: EyeOff, text: "Aggregate by default — individual answers stay private" },
  { icon: Check, text: "No student accounts, no emails collected" },
];

export function EducatorsSection() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const shown = reduced || inView;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="band-dark absolute inset-0 -z-10" aria-hidden="true">
        <div className="aurora opacity-70" />
      </div>

      <div
        ref={ref}
        className="band-dark mx-auto grid w-full max-w-6xl items-center gap-12 bg-transparent px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.95fr_1.05fr]"
      >
        {/* ── The pitch ────────────────────────────────────────────────── */}
        <Reveal>
          <p className="eyebrow text-orange-soft">For trainers &amp; PU institutions</p>
          <h2 className="display mt-3 max-w-md text-[1.9rem] leading-[1.06] text-balance text-midnight sm:text-[2.6rem]">
            Put one code on the board. Watch the batch map itself.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-ink">
            Students join with a batch code — no accounts, no emails, nothing to set up. You get
            interest distribution, course demand and the students still undecided, aggregated.
          </p>

          <ul className="mt-6 space-y-2.5">
            {PROMISES.map((promise) => (
              <li key={promise.text} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-orange/15 text-orange">
                  <promise.icon className="size-3" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span className="text-[0.82rem] leading-relaxed text-slate-ink">
                  {promise.text}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/admin" className="btn btn-primary">
              Open educator dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={`/join/${BATCH_CODE}`}
              className="btn border border-white/20 text-midnight hover:bg-white/10"
            >
              Try this code live
            </Link>
          </div>

          <p className="mt-6 max-w-md text-[0.68rem] leading-relaxed text-slate-ink">
            The dashboard runs on local demo data in this build. Sample students are labelled — no
            real student records are included.
          </p>
        </Reveal>

        {/* ── The pass ─────────────────────────────────────────────────── */}
        <Reveal delay={0.1}>
          <div className="relative mx-auto w-full max-w-[26rem]">
            {/* A second pass behind, so it reads as a stack a trainer hands out. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-5 -top-3 h-full rounded-[1.6rem] border border-white/10 bg-white/[0.04]"
            />

            <motion.div
              className="glass glass-sheen relative overflow-hidden !rounded-[1.6rem]"
              initial={reduced ? false : { opacity: 0, y: 18, rotate: -1.5 }}
              animate={shown ? { opacity: 1, y: 0, rotate: 0 } : undefined}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start justify-between gap-4 px-6 pt-6">
                <div className="min-w-0">
                  <p className="eyebrow">Batch pass</p>
                  <p className="display mt-1 truncate text-lg text-midnight">
                    PU 2027 · Science
                  </p>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange/15 text-orange">
                  <QrCode className="size-5" aria-hidden="true" />
                </span>
              </div>

              {/* The code itself — the thing that actually goes on the board. */}
              <div className="px-6 pb-6 pt-5">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-ink">
                  Join code
                </p>
                <p className="display mt-1 text-[2.4rem] leading-none tracking-[0.04em] text-orange sm:text-[2.9rem]">
                  {BATCH_CODE}
                </p>
                <p className="mt-2 text-[0.75rem] text-slate-ink">
                  Students open Pathora, type the code, and start. Nothing to install.
                </p>
              </div>

              {/* Perforation — the pass tears here. */}
              <div className="relative" aria-hidden="true">
                <span className="absolute -left-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-[var(--color-navy)]" />
                <span className="absolute -right-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-[var(--color-navy)]" />
                <span className="mx-6 block border-t border-dashed border-midnight/20" />
              </div>

              {/* The class assembling. */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-ink">
                    Joined so far
                  </p>
                  <span className="display text-base text-midnight">42</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {JOINERS.map((name, index) => (
                    <motion.span
                      key={name}
                      className="rounded-full border border-midnight/10 bg-surface-2/70 px-2.5 py-1 text-[0.68rem] font-semibold text-midnight"
                      initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                      animate={shown ? { opacity: 1, scale: 1 } : undefined}
                      transition={{
                        duration: 0.35,
                        delay: 0.3 + index * 0.07,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                    >
                      {name}
                    </motion.span>
                  ))}
                  <motion.span
                    className="rounded-full bg-orange/15 px-2.5 py-1 text-[0.68rem] font-bold text-orange"
                    initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                    animate={shown ? { opacity: 1, scale: 1 } : undefined}
                    transition={{ duration: 0.35, delay: 0.3 + JOINERS.length * 0.07 }}
                  >
                    +34 more
                  </motion.span>
                </div>

                <p className="mt-4 text-[0.64rem] leading-relaxed text-slate-ink">
                  Illustrative batch. First names shown here only — the dashboard itself is
                  aggregate by default.
                </p>
              </div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
