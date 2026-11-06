"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { useClientSearchParams, useHydrated } from "@/lib/client-hooks";
import { EmptyState, Reveal } from "@/components/ui";
import { COURSES, COURSE_CATEGORIES } from "@/lib/courses";
import { matchTone } from "@/lib/scoring";
import { usePathora } from "@/lib/store";
import type { CourseCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function CoursesPage() {
  const mounted = useHydrated();
  const searchParams = useClientSearchParams();
  const [query, setQuery] = useState("");
  const [categoryOverride, setCategoryOverride] = useState<CourseCategory | "All" | null>(null);
  const [streamOnly, setStreamOnly] = useState(true);
  const result = usePathora((state) => state.result);
  const student = usePathora((state) => state.student);

  const paramCategory = searchParams.get("category");
  const category: CourseCategory | "All" =
    categoryOverride ??
    (paramCategory && COURSE_CATEGORIES.includes(paramCategory as CourseCategory)
      ? (paramCategory as CourseCategory)
      : "All");

  const stream = student.stream;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return COURSES.filter((course) => {
      if (category !== "All" && course.category !== category) return false;
      if (streamOnly && stream && !course.streams.includes(stream)) return false;
      if (!term) return true;
      return (
        course.name.toLowerCase().includes(term) ||
        course.short.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term) ||
        course.skills.some((skill) => skill.toLowerCase().includes(term)) ||
        course.careers.some((career) => career.toLowerCase().includes(term))
      );
    });
  }, [query, category, streamOnly, stream]);

  return (
    <main>
      <section className="border-b border-midnight/[0.07] bg-surface">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="eyebrow">Course universe</p>
          <h1 className="display mt-3 max-w-2xl text-4xl leading-[1.05] text-balance text-midnight sm:text-[3rem]">
            {COURSES.length} undergraduate directions. No biology required.
          </h1>
          <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-slate-ink">
            Technology, engineering, commerce, design, humanities and quantitative science. Filter by
            your stream to see what is usually open to you — then verify the details with the
            institution before applying.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2 text-[0.7rem] font-medium text-slate-ink">
            <span className="chip">
              <ShieldCheck className="size-3.5 text-[light-dark(#1F9D8B,#4FD1BE)]" aria-hidden="true" />
              Biology courses excluded
            </span>
            <span className="chip">
              <Clock className="size-3.5 text-orange" aria-hidden="true" />
              3–4 year programmes
            </span>
            {stream && (
              <span className="chip !border-orange/25 !bg-peach !text-orange">
                Showing stream {stream}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div className="card p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-ink/60"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses, skills or careers — try “data”, “design”, “finance”"
                aria-label="Search courses"
                className="w-full rounded-2xl border border-midnight/10 bg-arctic py-3 pl-11 pr-4 text-sm text-midnight outline-none transition placeholder:text-slate-ink/50 focus:border-orange focus:bg-surface"
              />
            </div>
            <div className="m-scroll-x hide-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto scroll-pl-4 px-4 pb-1 sm:mx-0 sm:scroll-pl-0 sm:px-0">
              <span className="mr-1 inline-flex shrink-0 items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-wide text-slate-ink">
                <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                Filter
              </span>
              {(["All", ...COURSE_CATEGORIES] as (CourseCategory | "All")[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategoryOverride(option)}
                  className={cn(
                    "inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 text-[0.7rem] font-semibold transition md:min-h-0 md:py-1.5",
                    category === option
                      ? "border-midnight bg-navy text-white"
                      : "border-midnight/10 bg-surface text-slate-ink hover:border-midnight/25",
                  )}
                  aria-pressed={category === option}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex flex-col items-start gap-2 border-t border-midnight/[0.07] pt-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3">
              <label className="inline-flex min-h-11 cursor-pointer items-start gap-2 py-1 text-xs font-medium text-slate-ink md:min-h-0 md:items-center md:py-0">
                <input
                  type="checkbox"
                  checked={streamOnly}
                  onChange={(event) => setStreamOnly(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-orange md:mt-0"
                  disabled={!stream}
                />
                <span>
                  Only show courses usually open to my stream
                  {!stream && <span className="text-slate-ink/50"> (set your stream first)</span>}
                </span>
              </label>
              <p className="text-[0.7rem] font-semibold text-slate-ink">
                {filtered.length} {filtered.length === 1 ? "course" : "courses"}
              </p>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No courses match that filter"
              description="Try a broader search, a different category, or turn off the stream filter to see the full catalog."
            >
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategoryOverride("All");
                  setStreamOnly(false);
                }}
                className="btn btn-ghost mt-2"
              >
                Reset filters
              </button>
            </EmptyState>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course, index) => {
              const match = result?.matches.find((entry) => entry.course.slug === course.slug);
              const eligible = !stream || course.streams.includes(stream);
              const tone = match ? matchTone(match.label) : null;
              return (
                <Reveal key={course.slug} delay={Math.min(index, 8) * 0.03}>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="group card flex h-full flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="grid size-10 place-items-center rounded-xl text-sm font-black text-white"
                        style={{ background: course.accent }}
                      >
                        {course.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[0.64rem] font-semibold text-slate-ink">
                          <Clock className="size-3" aria-hidden="true" />
                          {course.duration}
                        </span>
                        {match && tone && (
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide",
                              tone.bg,
                              tone.text,
                              tone.border,
                            )}
                          >
                            {match.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <h2 className="display mt-4 text-lg leading-tight text-midnight">{course.name}</h2>
                    <p className="mt-0.5 text-[0.66rem] font-semibold uppercase tracking-wide text-slate-ink">
                      {course.short} · {course.category}
                    </p>
                    <p className="mt-2.5 flex-1 text-[0.8rem] leading-relaxed text-slate-ink">
                      {course.tagline}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {course.skills.slice(0, 2).map((skill) => (
                        <span key={skill} className="chip !px-2 !py-0.5 chip-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                    {!eligible && (
                      <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-[light-dark(#FFF7E6,#2a2010)] px-2.5 py-1.5 text-[0.62rem] text-[light-dark(#8a5b00,#FFD98A)]">
                        <TriangleAlert className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                        May require other subjects
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-midnight/[0.07] pt-3">
                      <span className="inline-flex items-center gap-1 text-[0.64rem] font-semibold text-[light-dark(#0f6252,#5fd8c4)]">
                        <Check className="size-3" aria-hidden="true" />
                        {course.streams.length >= 5 ? "Open to all streams" : `${course.streams.length} science streams`}
                      </span>
                      <ArrowUpRight className="size-4 text-midnight/25 transition-colors group-hover:text-orange" />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}

        <p className="mt-8 flex items-start gap-2 text-[0.68rem] leading-relaxed text-slate-ink">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-[light-dark(#b57f00,#FFC94A)]" aria-hidden="true" />
          {mounted && stream
            ? `Eligibility shown is based on your ${stream} stream and typical university requirements. Individual institutions may add subject, percentage or entrance-exam conditions.`
            : "Eligibility filters require your stream. Complete onboarding to see a personalised view, or treat the catalog as a starting list."}
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
