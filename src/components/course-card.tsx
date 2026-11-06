import Link from "next/link";
import { ArrowUpRight, Clock, Flag, Sparkles, TriangleAlert } from "lucide-react";
import { matchTone } from "@/lib/scoring";
import type { CourseMatch } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CourseCard({
  match,
  featured = false,
}: {
  match: CourseMatch;
  featured?: boolean;
}) {
  const { course, label, eligible, explanation, marksFit, marksNote } = match;
  const tone = matchTone(label);

  return (
    <article
      className={cn(
        "card flex h-full flex-col p-5 transition-all duration-300 sm:p-6 hover:-translate-y-1 hover:shadow-lift",
        featured && "ring-1 ring-orange/15",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide",
            tone.bg,
            tone.text,
            tone.border,
          )}
        >
          {label === "Strong Match" && <Sparkles className="size-3" aria-hidden="true" />}
          {label}
        </span>
        <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-slate-ink">
          <Clock className="size-3.5" aria-hidden="true" />
          {course.duration}
        </span>
      </div>

      <div className="mt-3.5">
        <h3 className="display text-xl leading-tight text-midnight">{course.name}</h3>
        <p className="mt-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-ink">
          {course.short} · {course.category}
        </p>
      </div>

      {!eligible && (
        <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-[light-dark(#FFF7E6,#2a2010)] px-3 py-2 text-[0.68rem] leading-relaxed text-[light-dark(#8a5b00,#FFD98A)]">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Your stream may not meet the usual subject requirements. Verify before applying.
        </p>
      )}

      {/* A second, separate reason a course may be a stretch — marks, not
          subjects. Deliberately a different colour, icon and voice from the
          stream warning above so the two never read as one rejection, and both
          can appear together. It changes nothing about the match or ranking. */}
      {!marksFit && marksNote && (
        <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-[light-dark(#EEF2FE,#171f3a)] px-3 py-2 text-[0.68rem] leading-relaxed text-[light-dark(#3b4d8f,#AFC2FF)]">
          <Flag className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-bold">Worth keeping on your list — just a stretch.</span>{" "}
            {marksNote}
          </span>
        </p>
      )}

      <p className="mt-3 flex-1 text-[0.82rem] leading-relaxed text-slate-ink">{explanation}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {course.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="chip !px-2.5 !py-1 chip-xs">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 border-t border-midnight/[0.07] pt-3.5">
        <p className="text-[0.62rem] font-bold uppercase tracking-wide text-slate-ink">
          Career possibilities
        </p>
        <p className="mt-1 text-[0.76rem] leading-relaxed text-midnight">
          {course.careers.slice(0, 3).join(" · ")}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2 md:mt-3.5">
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-orange hover:underline md:min-h-0"
          >
            Explore this course
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
          <Link
            href={`/compare?with=${course.slug}`}
            className="inline-flex min-h-11 items-center text-[0.66rem] font-semibold text-slate-ink hover:text-midnight hover:underline md:min-h-0"
          >
            Compare
          </Link>
        </div>
      </div>
    </article>
  );
}
