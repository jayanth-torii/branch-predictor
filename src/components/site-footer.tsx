"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUp, ArrowUpRight, Compass } from "lucide-react";
import { Logo } from "@/components/logo";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/courses", label: "All UG courses" },
      { href: "/compare", label: "Compare pathways" },
      { href: "/mentor", label: "Career mentor" },
      { href: "/results", label: "My results" },
    ],
  },
  {
    title: "Educators",
    links: [
      { href: "/admin", label: "Batch overview" },
      { href: "/admin/analytics", label: "Interest analytics" },
      { href: "/admin/students", label: "Student records" },
      { href: "/join/PTH-2027", label: "Join a batch" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/#journey", label: "How it works" },
      { href: "/#recommendation", label: "How matching works" },
      { href: "/#privacy", label: "Privacy approach" },
    ],
  },
];

export function SiteFooter() {
  const reduced = useReducedMotion();

  // One reveal recipe, reused by every band so the footer resolves as a single
  // sweep rather than four unrelated animations.
  const rise = (delay: number) => ({
    initial: reduced ? false : ({ opacity: 0, y: 26 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" } as const,
    transition: { duration: 0.65, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    // `bg-arctic` is the PAGE background, so the footer had no background of
    // its own and dissolved into the page in light mode. `fog` is the tinted
    // panel token: clearly a separate band in light, and it flips to a dark
    // panel in dark mode, so the footer reads as the end of the page in both.
    <footer className="band-dark relative isolate mt-16 overflow-hidden sm:mt-24">
      {/* Aurora field + two blooms sit at z-index:-1 inside this isolated,
          clipped parent, so they paint over the footer background and under
          every word of content. */}
      <div className="aurora" aria-hidden="true" />
      <div
        className="glow left-1/2 top-0 h-40 w-[26rem] -translate-x-1/2 -translate-y-1/2 opacity-70 sm:h-56 sm:w-[44rem]"
        aria-hidden="true"
      />
      <div
        className="glow -bottom-24 -left-20 hidden h-56 w-56 opacity-40 md:block"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-8 pt-12 sm:px-8 sm:pb-10 sm:pt-16">
        {/* ── Closing statement ─────────────────────────────────────────── */}
        <motion.section
          {...rise(0)}
          className="glass glass-sheen overflow-hidden px-5 py-9 text-center sm:px-12 sm:py-14"
        >
          <div className="flex justify-center">
            {/* `.chip` is unlayered, so its surface fill needs `!` to give way
                to the glass behind it. */}
            <span className="chip chip-xs !bg-transparent">
              <Compass className="size-3.5 text-orange" aria-hidden="true" />
              Your next step
            </span>
          </div>
          <h2 className="display mx-auto mt-4 max-w-2xl text-balance text-[1.6rem] leading-[1.12] text-midnight sm:text-[2.6rem]">
            Twenty-five questions. One honest map of{" "}
            <span className="relative whitespace-nowrap text-orange">
              what fits you
              <motion.span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-orange/35"
                initial={reduced ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, delay: reduced ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
            .
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-slate-ink">
            No fortune telling, no rankings to memorise — six interest dimensions and a course map
            you can argue with.
          </p>
          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Link href="/discover" className="btn btn-primary group/cta">
              Start the discovery
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link href="/courses" className="btn btn-ghost">
              Browse all courses
            </Link>
          </div>
        </motion.section>

        {/* ── Brand + navigation ────────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 sm:mt-14 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-10">
          <motion.div {...rise(0.08)} className="col-span-2 max-w-sm md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-slate-ink">
              A gamified career discovery experience for PU students. Twenty-five questions, six interest
              dimensions, and an explainable course map — not a fortune teller.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip chip-xs">6 interest dimensions</span>
              <span className="chip chip-xs">Explainable matches</span>
            </div>
          </motion.div>

          {COLUMNS.map((column, index) => (
            <motion.nav
              key={column.title}
              {...rise(0.14 + index * 0.07)}
              aria-label={column.title}
              // The last column would otherwise sit alone in a two-up phone
              // grid with a dead cell beside it; it spans instead and lays its
              // own links out two-up.
              className={index === COLUMNS.length - 1 ? "col-span-2 md:col-span-1" : undefined}
            >
              <p className="eyebrow">{column.title}</p>
              <ul
                className={
                  index === COLUMNS.length - 1
                    ? "mt-1 grid grid-cols-2 gap-x-6 md:mt-4 md:block md:space-y-1"
                    : "mt-1 md:mt-4 md:space-y-1"
                }
              >
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group/link flex min-h-11 items-center gap-1 text-sm text-slate-ink transition-colors hover:text-orange md:min-h-0 md:py-1"
                    >
                      <span className="relative">
                        {link.label}
                        <span
                          aria-hidden="true"
                          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-orange transition-transform duration-300 ease-out group-hover/link:scale-x-100"
                        />
                      </span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-3.5 shrink-0 -translate-x-1 opacity-0 transition duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ))}
        </div>
      </div>

      {/* ── Fine print ──────────────────────────────────────────────────── */}
      <div className="border-t border-midnight/[0.07]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-6 text-xs text-slate-ink sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="order-2 sm:order-1">© Pathora AI · Built for PU students in India.</p>
          <p className="order-1 max-w-xl leading-relaxed sm:order-2">
            Recommendations are guidance, not admission guarantees. Always verify eligibility and
            deadlines with the institution you are applying to.
          </p>
          <button
            type="button"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
            }
            className="group/top order-3 flex min-h-11 items-center gap-1.5 self-start text-xs font-semibold text-slate-ink transition-colors hover:text-orange sm:min-h-0 sm:self-auto"
          >
            Back to top
            <ArrowUp
              aria-hidden="true"
              className="size-3.5 transition-transform duration-300 group-hover/top:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}
