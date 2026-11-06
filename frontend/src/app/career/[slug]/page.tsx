"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Compass,
  Sunrise,
  TrendingUp,
} from "lucide-react";
import { Suspense, useEffect } from "react";
import { SiteFooter } from "@/components/site-footer";
import { EmptyState, Reveal } from "@/components/ui";
import { CAREERS, getCareer } from "@/lib/careers";
import { getCourse } from "@/lib/courses";
import { usePathora } from "@/lib/store";
import { DIMENSION_META } from "@/lib/types";

export default function CareerPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-[60vh] place-items-center">
          <div className="size-10 animate-pulse rounded-full bg-orange/20" />
        </main>
      }
    >
      <CareerContent />
    </Suspense>
  );
}

function CareerContent() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const career = getCareer(slug ?? "");
  const result = usePathora((state) => state.result);

  useEffect(() => {
    if (career) document.title = `${career.title} · Pathora AI`;
  }, [career]);

  if (!career) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-8">
        <EmptyState
          title="Career not found"
          description="That career is not in the current catalog. Explore the constellation on your results page or browse courses instead."
        >
          <Link href="/results" className="btn btn-primary mt-2">
            Open my results
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </EmptyState>
      </main>
    );
  }

  const meta = DIMENSION_META[career.core];
  const courses = career.courseSlugs.map((courseSlug) => getCourse(courseSlug)).filter(Boolean);
  const others = CAREERS.filter(
    (entry) => entry.slug !== career.slug && entry.core === career.core,
  ).slice(0, 3);
  const inProfile = result?.topCareers.some((entry) => entry.slug === career.slug);

  return (
    <main>
      <section className="border-b border-midnight/[0.07] bg-surface">
        <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
          <Link
            href="/results"
            className="-my-3.5 inline-flex items-center gap-1.5 py-3.5 text-xs font-semibold text-slate-ink hover:text-midnight md:my-0 md:py-0"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to my profile
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-white"
              style={{ background: meta.color }}
            >
              {meta.short}
            </span>
            {inProfile && (
              <span className="chip !border-orange/25 !bg-peach chip-xs !text-orange">
                <Compass className="size-3" aria-hidden="true" />
                In your constellation
              </span>
            )}
          </div>
          <h1 className="display mt-4 max-w-2xl text-4xl leading-[1.03] text-balance text-midnight sm:text-[3rem]">
            {career.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-slate-ink">{career.blurb}</p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-5xl gap-6 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Reveal>
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <Sunrise className="size-4 text-orange" aria-hidden="true" />
              <p className="eyebrow">A realistic day</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-ink">{career.dayInLife}</p>
            <div className="mt-4 rounded-xl bg-arctic px-3.5 py-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-wide text-slate-ink">
                Reality check
              </p>
              <p className="mt-1 text-[0.78rem] leading-relaxed text-midnight">{career.growthNote}</p>
            </div>
          </div>
          </Reveal>

          <Reveal delay={0.06}>
          <div className="card p-6">
            <p className="eyebrow">Skills that matter</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {career.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-start gap-2 rounded-xl bg-arctic px-3 py-2.5 text-[0.8rem] font-medium text-midnight"
                >
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[light-dark(#1F9D8B,#4FD1BE)]" strokeWidth={3} aria-hidden="true" />
                  {skill}
                </div>
              ))}
            </div>
          </div>
          </Reveal>

          <Reveal delay={0.12}>
          <div className="card p-6">
            <p className="eyebrow">How people usually get here</p>
            <h2 className="display mt-2 text-xl text-midnight">Courses that open this door</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-ink">
              There is rarely one correct degree. These programmes build relevant foundations — check
              eligibility against your own stream.
            </p>
            <div className="mt-4 space-y-2">
              {courses.map((course) => {
                if (!course) return null;
                return (
                  <Link
                    key={course.slug}
                    href={`/courses/${course.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-midnight/[0.08] px-4 py-3 transition hover:border-midnight/20 hover:bg-arctic"
                  >
                    <div>
                      <p className="text-sm font-bold text-midnight">{course.name}</p>
                      <p className="text-[0.68rem] text-slate-ink">
                        {course.category} · {course.duration}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 text-midnight/25 group-hover:text-orange" />
                  </Link>
                );
              })}
            </div>
          </div>
          </Reveal>
        </div>

        <aside className="space-y-4">
          <Reveal>
          <div className="card-dark p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-orange" aria-hidden="true" />
              <p className="eyebrow text-orange-soft">Direction</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{meta.blurb}</p>
            <p className="mt-4 border-t border-white/10 pt-4 text-[0.7rem] leading-relaxed text-white/60">
              Career outcomes are not guaranteed by a course. Treat this as a map of typical routes,
              not a promise of employment.
            </p>
            <Link href="/mentor" className="btn btn-primary mt-5 w-full !py-2.5 !text-xs">
              Ask about this path
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          </Reveal>

          {others.length > 0 && (
            <div className="card p-5">
              <p className="eyebrow">Nearby paths</p>
              <div className="mt-3 space-y-1.5">
                {others.map((other) => (
                  <Link
                    key={other.slug}
                    href={`/career/${other.slug}`}
                    className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-[0.78rem] font-semibold text-midnight transition hover:bg-arctic md:min-h-0"
                  >
                    {other.title}
                    <ArrowUpRight className="size-3.5 text-midnight/25" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link href="/courses" className="btn btn-ghost w-full !py-2.5 !text-xs">
            Browse all courses
          </Link>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
