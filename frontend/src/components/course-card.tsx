import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Briefcase,
  Clock,
  Code2,
  Cog,
  Database,
  Flag,
  FlaskConical,
  Globe,
  Palette,
  Settings2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { matchTone } from "@/lib/scoring";
import type { CourseMatch } from "@/lib/types";
import { cn } from "@/lib/utils";

/** The corner tab's icon, by course family. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Technology & Computing": Code2,
  "Engineering & Innovation": Cog,
  "Business & Commerce": Briefcase,
  "Science & Mathematics": FlaskConical,
};

/**
 * Picks a skill icon by keyword.
 *
 * There are 79 distinct skill strings across the catalogue, so a hand-written
 * map would rot the moment a course is edited. Matching on words keeps new
 * skills working, and anything unmatched falls back rather than breaking.
 */
const SKILL_ICONS: { match: RegExp; icon: LucideIcon }[] = [
  { match: /machine learning|neural|pattern recognition|language processing|vision|\bai\b/i, icon: BrainCircuit },
  { match: /security|cyber|cryptograph|ethical hacking|network/i, icon: ShieldCheck },
  { match: /database|storage|retrieval|sql|data mining/i, icon: Database },
  { match: /data|statistic|visuali|analytic|intelligence|aggregation/i, icon: BarChart3 },
  { match: /web|mern|android|application|flask|cloud/i, icon: Globe },
  { match: /program|software|algorithm|code|problem solving|development/i, icon: Code2 },
  { match: /design|creative|visual|media/i, icon: Palette },
  { match: /business|management|finance|market|account/i, icon: Briefcase },
  { match: /system|operating|tool|process|manufactur/i, icon: Settings2 },
];

function skillIcon(skill: string): LucideIcon {
  return SKILL_ICONS.find((entry) => entry.match.test(skill))?.icon ?? Sparkles;
}

export function CourseCard({
  match,
  featured = false,
}: {
  match: CourseMatch;
  featured?: boolean;
}) {
  const { course, label, eligible, explanation, marksFit, marksNote } = match;
  const tone = matchTone(label);
  const CategoryIcon = CATEGORY_ICONS[course.category] ?? Sparkles;
  const accent = course.accent || "var(--color-orange)";

  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        featured ? "border-orange/45 bg-peach/30" : "border-midnight/[0.08]",
      )}
    >
      {/* Corner tab, in the course family's own accent colour. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 grid size-[3.4rem] place-items-center rounded-br-[1.5rem] rounded-tl-[1.5rem]"
        style={{ background: accent }}
      >
        <CategoryIcon className="size-[1.3rem] text-white" strokeWidth={2.3} />
      </span>

      {/* Offset clears the tab so the pills never sit on top of it. */}
      <div className="flex flex-wrap items-center justify-end gap-2 py-3.5 pl-[4rem] pr-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em]",
            tone.bg,
            tone.text,
            tone.border,
          )}
        >
          {label === "Strong Match" && <Sparkles className="size-3" aria-hidden="true" />}
          {label}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[0.72rem] font-semibold text-slate-ink">
          <Clock className="size-3.5" aria-hidden="true" />
          {course.duration}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5">
        <h3 className="display text-[1.3rem] leading-tight text-midnight">{course.name}</h3>
        <p className="mt-1 text-[0.68rem] font-bold uppercase leading-snug tracking-[0.08em] text-slate-ink">
          {course.short} · {course.category}
        </p>

        {/* Two separate reasons a course may be a stretch — subjects, and
            marks. Deliberately different colours, icons and voices so neither
            reads as the other, and both can appear together. Neither changes
            the match or the ranking. */}
        {!eligible && (
          <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-[light-dark(#FFF7E6,#2a2010)] px-3 py-2 text-[0.7rem] leading-relaxed text-[light-dark(#8a5b00,#FFD98A)]">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Your stream may not meet the usual subject requirements. Verify before applying.
          </p>
        )}
        {!marksFit && marksNote && (
          <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-[light-dark(#EEF2FE,#171f3a)] px-3 py-2 text-[0.7rem] leading-relaxed text-[light-dark(#3b4d8f,#AFC2FF)]">
            <Flag className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              <span className="font-bold">Worth keeping on your list — just a stretch.</span>{" "}
              {marksNote}
            </span>
          </p>
        )}

        <p className="mt-3 text-[0.84rem] leading-relaxed text-slate-ink">{explanation}</p>

        <ul className="mt-4 space-y-2">
          {course.skills.slice(0, 3).map((skill) => {
            const Icon = skillIcon(skill);
            return (
              <li
                key={skill}
                className="flex items-center gap-2.5 rounded-full border border-midnight/[0.08] bg-surface py-1.5 pl-1.5 pr-3.5"
              >
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-peach text-orange"
                >
                  <Icon className="size-[0.85rem]" strokeWidth={2.4} />
                </span>
                <span className="min-w-0 text-[0.78rem] font-semibold leading-snug text-midnight">
                  {skill}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Pushed to the bottom so every card in a row ends level. */}
        <div className="mt-auto">
          <div className="mt-4 rounded-2xl bg-peach/70 px-3.5 py-3">
            <p className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-slate-ink">
              <Briefcase className="size-3.5 shrink-0 text-orange" aria-hidden="true" />
              Career possibilities
            </p>
            <p className="mt-1 text-[0.78rem] leading-relaxed text-midnight">
              {course.careers.slice(0, 3).join(" · ")}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <Link
              href={`/courses/${course.slug}`}
              className="btn-primary inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-[0.82rem] font-bold transition"
            >
              Explore this course
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={`/compare?with=${course.slug}`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-midnight/12 bg-surface px-5 text-[0.82rem] font-bold text-midnight transition hover:border-orange/50 hover:text-orange"
            >
              Compare
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
