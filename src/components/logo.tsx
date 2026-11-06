import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex min-h-11 items-center gap-2.5 md:min-h-0" aria-label="Pathora AI home">
      <span className="relative grid size-9 place-items-center text-midnight">
        <span className="absolute inset-0 rounded-full bg-orange/15 transition group-hover:bg-orange/25" />
        <svg viewBox="0 0 24 24" className="relative size-6" aria-hidden="true">
          <circle cx="12" cy="12" r="5.5" fill="#FF6B35" />
          <ellipse
            cx="12"
            cy="12"
            rx="10.5"
            ry="4.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeOpacity="0.55"
            transform="rotate(-28 12 12)"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="display whitespace-nowrap text-[1.05rem] text-midnight">
          Pathora<span className="text-orange"> AI</span>
        </span>
        {!compact && (
          <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-slate-ink">
            Discover your path
          </span>
        )}
      </span>
    </Link>
  );
}
