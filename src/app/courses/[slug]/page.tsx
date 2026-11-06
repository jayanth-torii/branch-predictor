"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Flag,
  GraduationCap,
  Layers,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { Suspense, useEffect } from "react";
import { InterestRadar } from "@/components/interest-radar";
import { SiteFooter } from "@/components/site-footer";
import { EmptyState, Reveal } from "@/components/ui";
import { useHydrated } from "@/lib/client-hooks";
import { COURSES, COURSE_BY_SLUG, getCourse } from "@/lib/courses";
import { CAREER_BY_SLUG } from "@/lib/careers";
import { DIMENSIONS, DIMENSION_META, STREAMS } from "@/lib/types";
import { matchTone } from "@/lib/scoring";
import { usePathora } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function CourseDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-[60vh] place-items-center">
          <div className="size-10 animate-pulse rounded-full bg-orange/20" />
        </main>
      }
    >
      <CourseDetailContent />
    </Suspense>
  );
}

function CourseDetailContent() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const course = getCourse(slug ?? "");
  const mounted = useHydrated();
  const result = usePathora((state) => state.result);
  const student = usePathora((state) => state.student);

  useEffect(() => {
    if (course) document.title = `${course.name} · Pathora AI`;
  }, [course]);

  if (!course) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-8">
        <EmptyState
          title="Course not found"
          description={`That link does not match anything in the catalog. Browse the full list of ${COURSES.length} programmes instead.`}
        >
          <Link href="/courses" className="btn btn-primary mt-2">
            Back to courses
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </EmptyState>
      </main>
    );
  }

  const match = result?.matches.find((entry) => entry.course.slug === course.slug);
  const tone = match ? matchTone(match.label) : null;
  const eligible = !student.stream || course.streams.includes(student.stream);
  const related = course.related
    .map((relatedSlug) => COURSE_BY_SLUG[relatedSlug])
    .filter(Boolean);

  return (
    <main>
      <section className="border-b border-midnight/[0.07] bg-surface">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <Link
            href="/courses"
            className="-my-3.5 inline-flex items-center gap-1.5 py-3.5 text-xs font-semibold text-slate-ink hover:text-midnight md:my-0 md:py-0"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            All courses
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-white"
                  style={{ background: course.accent }}
                >
                  {course.category}
                </span>
                <span className="chip chip-xs">{course.degree}</span>
                {match && tone && (
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide",
                      tone.bg,
                      tone.text,
                      tone.border,
                    )}
                  >
                    {match.label} for you
                  </span>
                )}
              </div>
              <h1 className="display mt-4 text-4xl leading-[1.02] text-midnight sm:text-[3.2rem]">
                {course.name}
              </h1>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-ink">
                {course.short}
              </p>
              <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-slate-ink">
                {course.tagline}
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-ink">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-orange" aria-hidden="true" />
                  {course.duration}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="size-3.5 text-orange" aria-hidden="true" />
                  {course.degree}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="size-3.5 text-orange" aria-hidden="true" />
                  {course.streams.length >= 5 ? "All streams" : course.streams.join(" · ")}
                </span>
              </div>
            </div>

            <div className="card p-5">
              <p className="eyebrow">At a glance</p>
              <dl className="mt-3 space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-midnight/[0.06] pb-2.5">
                  <dt className="text-xs text-slate-ink">Typical duration</dt>
                  <dd className="text-xs font-bold text-midnight">{course.duration}</dd>
                </div>
                <div className="flex items-start justify-between gap-3 border-b border-midnight/[0.06] pb-2.5">
                  <dt className="text-xs text-slate-ink">Your eligibility</dt>
                  <dd className={cn("text-xs font-bold", eligible ? "text-[light-dark(#0f6252,#5fd8c4)]" : "text-[light-dark(#8a5b00,#FFD98A)]")}>
                    {student.stream ? (eligible ? `Open to ${student.stream}` : "Check requirements") : "Set your stream"}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-3">
                  <dt className="text-xs text-slate-ink">Common entrance routes</dt>
                  <dd className="text-xs font-semibold text-midnight md:max-w-[60%] md:text-right">
                    {course.entranceExams.join(" · ")}
                  </dd>
                </div>
              </dl>
              <Link
                href={`/compare?with=${course.slug}&against=${course.related[0] ?? ""}`}
                className="btn btn-dark mt-4 w-full !py-2.5 !text-xs"
              >
                Compare this course
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Reveal>
            <div className="card p-6 sm:p-7">
              <p className="eyebrow">Why this might suit you</p>
              <h2 className="display mt-2 text-xl text-midnight">
                {match ? "Based on your profile" : "What this direction is really like"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-ink">
                {match?.explanation ?? course.whyItFits}
              </p>
              {match && (
                <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_1fr]">
                  <div>
                    <p className="text-[0.62rem] font-bold uppercase tracking-wide text-slate-ink">
                      Your profile
                    </p>
                    <div className="mt-2">
                      <InterestRadar profile={result!.profile} height={200} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-bold uppercase tracking-wide text-slate-ink">
                      What this course leans on
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {DIMENSIONS.filter((dimension) => (course.interests[dimension] ?? 0) > 0)
                        .sort(
                          (a, b) =>
                            (course.interests[b] ?? 0) - (course.interests[a] ?? 0),
                        )
                        .slice(0, 4)
                        .map((dimension) => (
                          <div key={dimension}>
                            <div className="flex justify-between gap-2 text-[0.68rem]">
                              <span className="font-semibold text-midnight">
                                {DIMENSION_META[dimension].short}
                              </span>
                              <span className="text-slate-ink">
                                your {result!.profile[dimension]}
                              </span>
                            </div>
                            <div className="relative mt-1 h-1.5 rounded-full bg-midnight/[0.07]">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full opacity-70"
                                style={{
                                  width: `${(course.interests[dimension] ?? 0) * 100}%`,
                                  background: DIMENSION_META[dimension].color,
                                }}
                              />
                              <div
                                className="absolute -top-1 h-3.5 w-[2px] bg-midnight"
                                style={{ left: `${result!.profile[dimension]}%` }}
                                title="Your score"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                    <p className="mt-3 text-[0.62rem] leading-relaxed text-slate-ink">
                      Coloured bar = how much the course uses that dimension. Vertical line = your score.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          <div id="skills" className="scroll-mt-24">
            <Reveal>
              <div className="card p-6 sm:p-7">
              <p className="eyebrow">Skills you would build</p>
              <h2 className="display mt-2 text-xl text-midnight">What you actually practise</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {course.skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-start gap-2 rounded-xl bg-arctic px-3 py-2.5 text-[0.8rem] font-medium text-midnight"
                  >
                    <Check className="mt-0.5 size-3.5 shrink-0 text-[light-dark(#1F9D8B,#4FD1BE)]" strokeWidth={3} aria-hidden="true" />
                    {skill}
                  </div>
                ))}
              </div>
                <p className="mt-4 rounded-xl bg-peach/70 px-3.5 py-3 text-[0.72rem] leading-relaxed text-midnight">
                  <Sparkles className="mr-1 inline size-3.5 text-orange" aria-hidden="true" />
                  You do not need all of these before you start. Pick one, build something small, and
                  let the degree add structure around it.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="card p-6 sm:p-7">
              <p className="eyebrow">Where it can lead</p>
              <h2 className="display mt-2 text-xl text-midnight">Career possibilities</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-ink">
                These are common routes, not guarantees. A degree opens a range; your projects,
                internships and further study shape the outcome.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {course.careers.map((careerName) => {
                  const career = Object.values(CAREER_BY_SLUG).find(
                    (entry) => entry.title === careerName,
                  );
                  return career ? (
                    <Link
                      key={careerName}
                      href={`/career/${career.slug}`}
                      className="group flex min-h-11 items-center justify-between gap-2 rounded-xl border border-midnight/10 px-3 py-2.5 text-[0.8rem] font-semibold text-midnight transition hover:border-orange/40 hover:bg-peach/40 md:min-h-0"
                    >
                      {careerName}
                      <ArrowUpRight className="size-3.5 text-midnight/30 group-hover:text-orange" />
                    </Link>
                  ) : (
                    <span
                      key={careerName}
                      className="flex min-h-11 items-center rounded-xl border border-midnight/10 px-3 py-2.5 text-[0.8rem] font-semibold text-midnight md:min-h-0"
                    >
                      {careerName}
                    </span>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {related.length > 0 && (
            <Reveal>
              <div className="card p-6 sm:p-7">
                <p className="eyebrow">Related directions</p>
                <h2 className="display mt-2 text-xl text-midnight">If this is close, look at these</h2>
                <div className="mt-4 space-y-2">
                  {related.map((relatedCourse) => (
                    <Link
                      key={relatedCourse.slug}
                      href={`/courses/${relatedCourse.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-midnight/[0.08] px-4 py-3 transition hover:border-midnight/20 hover:bg-arctic"
                    >
                      <div>
                        <p className="text-sm font-bold text-midnight">{relatedCourse.name}</p>
                        <p className="text-[0.68rem] text-slate-ink">
                          {relatedCourse.short} · {relatedCourse.duration}
                        </p>
                      </div>
                      <ArrowUpRight className="size-4 text-midnight/25 group-hover:text-orange" />
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <aside className="space-y-4">
          <Reveal>
            <div className="card p-5">
              <p className="eyebrow">Eligibility</p>
              <h2 className="display mt-2 text-lg text-midnight">Check your stream</h2>
              <div className="mt-3 space-y-1.5">
                {STREAMS.map((stream) => {
                  const open = course.streams.includes(stream);
                  const isMine = student.stream === stream;
                  return (
                    <div
                      key={stream}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs",
                        isMine ? "bg-peach/70 font-bold text-midnight" : "bg-arctic text-slate-ink",
                      )}
                    >
                      <span>
                        {stream} {isMine && <span className="text-[0.6rem] text-orange">· you</span>}
                      </span>
                      {open ? (
                        <Check className="size-3.5 text-[light-dark(#1F9D8B,#4FD1BE)]" strokeWidth={3} aria-label="Usually eligible" />
                      ) : (
                        <X className="size-3.5 text-midnight/25" aria-label="Usually requires other subjects" />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[0.68rem] leading-relaxed text-slate-ink">
                {course.eligibilityNotes}
              </p>
              <p className="mt-2 flex items-start gap-1.5 text-[0.62rem] leading-relaxed text-[light-dark(#8a5b00,#FFD98A)]">
                <TriangleAlert className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                Catalog guidance only. Confirm on the institution&apos;s current admission page.
              </p>

              {/* The marks flag is a SECOND, independent reason a course can be
                  a stretch. Separate block, different colour and voice from the
                  stream warning above — both can show at once, and neither
                  affects the match label or the ranking. */}
              {match && !match.marksFit && match.marksNote && (
                <div className="mt-4 rounded-xl bg-[light-dark(#EEF2FE,#171f3a)] px-3.5 py-3">
                  <p className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-wide text-[light-dark(#3b4d8f,#AFC2FF)]">
                    <Flag className="size-3" aria-hidden="true" />
                    Marks: a stretch, not a no
                  </p>
                  <p className="mt-1.5 text-[0.7rem] leading-relaxed text-[light-dark(#3b4d8f,#AFC2FF)]">
                    {match.marksNote}
                  </p>
                  <p className="mt-1.5 text-[0.66rem] leading-relaxed text-[light-dark(#3b4d8f,#AFC2FF)]">
                    This is advisory only. It does not change your match above, and plenty of
                    students reach a course like this through a later entrance score, a different
                    college or a lateral route.
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="card p-5">
              <p className="eyebrow">Admission next steps</p>
              <ul className="mt-3 space-y-2 text-[0.76rem] leading-relaxed text-slate-ink">
                {course.entranceExams.map((exam) => (
                  <li key={exam} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-orange" />
                    {exam}
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-indigo" />
                  Check subject requirements, minimum percentage and application deadlines directly with
                  shortlisted colleges.
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card-dark p-5">
              <p className="eyebrow text-orange-soft">Not sure yet?</p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                Ask the mentor why this course did or did not appear in your matches, or compare it
                against another direction.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/mentor" className="btn btn-primary w-full !py-2.5 !text-xs">
                  Ask the mentor
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href={`/compare?with=${course.slug}`}
                  className="btn w-full border border-white/20 !py-2.5 !text-xs text-white hover:bg-white/10"
                >
                  Compare with another course
                </Link>
              </div>
            </div>
          </Reveal>

          {mounted && !result && (
            <p className="px-1 text-[0.68rem] leading-relaxed text-slate-ink">
              Complete the assessment to see your personal fit, dimension overlap and match label for
              this course.
            </p>
          )}
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
