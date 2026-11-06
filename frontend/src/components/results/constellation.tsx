import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { DIMENSION_META, type Career } from "@/lib/types";

export function CareerConstellation({ careers }: { careers: Career[] }) {
  const nodes = careers.slice(0, 8);

  return (
    <div className="card-dark relative overflow-hidden p-6 sm:p-8">
      <div
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-orange/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-orange-soft">Career constellation</p>
          <h3 className="display mt-2 text-2xl text-white">Tap a star to explore a future</h3>
          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-white/55">
            Careers are nodes, not destinations. Each one opens the day-to-day reality, skills and
            courses that lead there.
          </p>
        </div>
        <span className="chip !border-white/15 !bg-white/5 !text-white/70">
          <Sparkles className="size-3.5 text-orange" aria-hidden="true" />
          {careers.length} possibilities
        </span>
      </div>

      <div className="relative mt-6 min-h-[200px] w-full sm:min-h-[260px]" aria-hidden="true">
        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {nodes.map((career, index) => {
            const angleA = (index / nodes.length) * Math.PI * 2;
            const angleB = ((index + 1) / nodes.length) * Math.PI * 2;
            return (
              <line
                key={career.slug}
                x1={50 + 30 * Math.cos(angleA)}
                y1={50 + 30 * Math.sin(angleA)}
                x2={50 + 30 * Math.cos(angleB)}
                y2={50 + 30 * Math.sin(angleB)}
                stroke="#fff"
                strokeOpacity="0.09"
                strokeWidth="0.25"
              />
            );
          })}
          <circle cx="50" cy="50" r="1.2" fill="#FF6B35" />
        </svg>
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="grid size-16 place-items-center rounded-full border border-orange/30 bg-orange/15 text-center text-[0.58rem] font-bold uppercase tracking-wide text-orange-soft backdrop-blur">
            Your
            <br />
            profile
          </div>
        </div>
        {nodes.map((career, index) => (
          <span
            key={career.slug}
            className={`absolute z-0 size-2 rounded-full ${index % 2 === 0 ? "bg-orange/70" : "bg-white/40"}`}
            style={{
              left: `calc(50% + ${(30 * Math.cos((index / nodes.length) * Math.PI * 2))}% * 0.9)`,
              top: `calc(50% + ${(30 * Math.sin((index / nodes.length) * Math.PI * 2))}% * 0.9)`,
            }}
          />
        ))}
      </div>

      <ul className="relative grid gap-2 sm:grid-cols-2">
        {nodes.map((career) => (
          <li key={career.slug}>
            <Link
              href={`/career/${career.slug}`}
              className="group flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 transition-colors hover:border-orange/40 hover:bg-white/[0.08] md:min-h-0"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: DIMENSION_META[career.core].color }}
                />
                <span className="truncate text-xs font-semibold text-white/85">{career.title}</span>
              </span>
              <ArrowUpRight className="size-3.5 shrink-0 text-white/30 transition-colors group-hover:text-orange" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
