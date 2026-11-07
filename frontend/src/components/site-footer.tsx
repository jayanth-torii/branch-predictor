"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  BarChart3,
  ChartPie,
  Compass,
  FileText,
  GraduationCap,
  Info,
  Layers,
  Settings2,
  Shield,
  Target,
  UserPlus,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";

/* ══════════════════════════════════════════════════════════════════════════
   The closing CTA and the footer are two different bands.

   The CTA is LIGHT and sits on the page background; the footer below it is the
   fixed navy slab. They used to be one `.band-dark` block, which made the CTA
   the third dark section in a row and left the illustration nothing to sit on.

   Both still ship from this one component because every page that renders a
   footer today also renders this CTA — splitting them into two imports would
   have meant touching ten route files to keep the page endings identical.
   ══════════════════════════════════════════════════════════════════════════ */

const STATS: { icon: LucideIcon; title: string; sub: string }[] = [
  { icon: Zap, title: "25 Questions", sub: "Quick and focused" },
  { icon: Layers, title: "6 Interest Dimensions", sub: "A well-rounded view" },
  { icon: Target, title: "Explainable Matches", sub: "Know the 'why' behind it" },
];

const COLUMNS: {
  title: string;
  links: { href: string; label: string; icon: LucideIcon }[];
}[] = [
  {
    title: "Explore",
    links: [
      { href: "/courses", label: "All UG courses", icon: GraduationCap },
      { href: "/compare", label: "Compare pathways", icon: Layers },
      { href: "/mentor", label: "Career mentor", icon: Compass },
      { href: "/results", label: "My results", icon: BarChart3 },
    ],
  },
  {
    title: "Educators",
    links: [
      { href: "/admin", label: "Batch overview", icon: Users },
      { href: "/admin/analytics", label: "Interest analytics", icon: ChartPie },
      { href: "/admin/students", label: "Student records", icon: FileText },
      { href: "/join/PTH-2027", label: "Join a batch", icon: UserPlus },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/#journey", label: "How it works", icon: Info },
      { href: "/#recommendation", label: "How matching works", icon: Settings2 },
      { href: "/#privacy", label: "Privacy approach", icon: Shield },
    ],
  },
];

export function SiteFooter() {
  const reduced = useReducedMotion();

  const rise = (delay: number) => ({
    initial: reduced ? false : ({ opacity: 0, y: 26 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" } as const,
    transition: { duration: 0.65, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <>
      {/* ══ Closing CTA — light band ═══════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden bg-arctic">
        {/* Ambient wash rather than discrete shapes — large and heavily blurred
            so the edges never land inside the reading area. Clipped by the
            section so they cannot widen the page. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <span className="absolute -left-56 -top-48 block size-[44rem] rounded-full bg-orange/[0.12] blur-3xl" />
          <span className="absolute -right-56 top-1/4 block size-[48rem] rounded-full bg-orange/[0.09] blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <motion.div {...rise(0)}>
              <span className="chip chip-xs">
                <Target className="size-3.5 text-orange" aria-hidden="true" />
                Your next step
              </span>

              <h2 className="display mt-5 text-[1.9rem] leading-[1.1] text-balance text-midnight sm:text-[2.65rem]">
                Twenty-five questions. One honest map of{" "}
                <span className="relative inline-block whitespace-nowrap text-orange">
                  what fits you.
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 200 20"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute left-0 top-[0.95em] h-[0.14em] w-full overflow-visible"
                  >
                    <path
                      d="M5 13 Q 100 3 195 13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h2>

              <p className="mt-5 max-w-md text-[0.97rem] leading-relaxed text-slate-ink">
                No fortune telling, no rankings to memorise — six interest dimensions and a course
                map you can argue with.
              </p>

              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/discover"
                  className="btn-primary group/cta inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full px-8 text-[1rem] font-bold transition"
                >
                  Start the discovery
                  <ArrowRight
                    className="size-[1.1rem] transition-transform duration-300 group-hover/cta:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex min-h-13 items-center justify-center rounded-full border-2 border-midnight/15 bg-surface px-8 text-[1rem] font-bold text-midnight transition hover:border-orange/50 hover:text-orange"
                >
                  Browse all courses
                </Link>
              </div>

              <ul className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-0">
                {STATS.map((stat, index) => (
                  <li
                    key={stat.title}
                    className={`flex items-center gap-3 sm:flex-1 sm:gap-2.5 ${
                      index > 0 ? "sm:border-l sm:border-midnight/10 sm:pl-4" : "sm:pr-4"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-xl bg-peach text-orange"
                    >
                      <stat.icon className="size-[1.1rem]" strokeWidth={2.4} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.86rem] font-bold leading-tight text-midnight">
                        {stat.title}
                      </span>
                      <span className="block text-[0.78rem] leading-tight text-slate-ink">
                        {stat.sub}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...rise(0.1)} className="order-first lg:order-last">
              <Image
                src="/next-step-student.png"
                alt=""
                width={1536}
                height={1024}
                sizes="(max-width: 1023px) 92vw, 45vw"
                className="h-auto w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ Footer — fixed navy slab ═══════════════════════════════════════ */}
      <footer className="band-dark relative isolate overflow-hidden">
        <div className="aurora" aria-hidden="true" />
        <div
          className="glow left-1/2 top-0 h-40 w-[26rem] -translate-x-1/2 -translate-y-1/2 opacity-70 sm:h-56 sm:w-[44rem]"
          aria-hidden="true"
        />

        <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-10">
            <motion.div {...rise(0.04)} className="col-span-2 max-w-sm md:col-span-1">
              <Logo />
              <p className="mt-5 text-[0.9rem] leading-relaxed text-slate-ink">
                A gamified career discovery experience for PU students. Twenty-five questions, six
                interest dimensions, and an explainable course map — not a fortune teller.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="chip chip-xs">
                  <Users className="size-3.5 text-orange" aria-hidden="true" />
                  6 Interest Dimensions
                </span>
                <span className="chip chip-xs">
                  <BarChart3 className="size-3.5 text-orange" aria-hidden="true" />
                  Explainable Matches
                </span>
              </div>
            </motion.div>

            {COLUMNS.map((column, index) => (
              <motion.nav
                key={column.title}
                {...rise(0.1 + index * 0.06)}
                aria-label={column.title}
                className={index === COLUMNS.length - 1 ? "col-span-2 md:col-span-1" : undefined}
              >
                <p className="eyebrow">{column.title}</p>
                {/* Short rule under each heading, as in the reference. */}
                <span aria-hidden="true" className="mt-2 block h-0.5 w-8 rounded-full bg-orange" />
                <ul
                  className={
                    index === COLUMNS.length - 1
                      ? "mt-3 grid grid-cols-2 gap-x-6 md:mt-4 md:block md:space-y-1"
                      : "mt-3 md:mt-4 md:space-y-1"
                  }
                >
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group/link flex min-h-11 items-center gap-2.5 text-[0.9rem] text-slate-ink transition-colors hover:text-orange md:min-h-0 md:py-1.5"
                      >
                        <link.icon
                          aria-hidden="true"
                          className="size-[1.05rem] shrink-0 text-slate-ink/70 transition-colors group-hover/link:text-orange"
                        />
                        <span className="relative">
                          {link.label}
                          <span
                            aria-hidden="true"
                            className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-orange transition-transform duration-300 ease-out group-hover/link:scale-x-100"
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.nav>
            ))}
          </div>
        </div>

        {/* ── Fine print ──────────────────────────────────────────────────── */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-6 text-xs text-slate-ink sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <p className="order-2 shrink-0 lg:order-1">
              © Pathora AI · Built for PU students in India.
            </p>
            <p className="order-1 max-w-xl leading-relaxed lg:order-2">
              Recommendations are guidance, not admission guarantees. Always verify eligibility and
              deadlines with the institution you are applying to.
            </p>
            <div className="order-3 flex items-center justify-between gap-5 lg:justify-end">
              <span className="flex items-center gap-2.5">
                <span className="shrink-0 font-semibold">Powered by</span>
                {/* The supplied mark is a flat PNG on a near-black field rather
                    than a transparent cut-out. `screen` drops that dark field
                    against the navy slab and keeps the white and orange strokes,
                    which is why this band must stay dark in both themes. */}
                <Image
                  src="/powered-by-jayanth-gowda.png"
                  alt="Jayanth Gowda"
                  width={2172}
                  height={724}
                  sizes="132px"
                  className="h-8 w-auto mix-blend-screen"
                />
              </span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
                className="group/top flex min-h-11 shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-ink transition-colors hover:text-orange sm:min-h-0"
              >
                Back to top
                <ArrowUp
                  aria-hidden="true"
                  className="size-3.5 transition-transform duration-300 group-hover/top:-translate-y-0.5"
                />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
