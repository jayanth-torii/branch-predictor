"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowLeftRight, Check, Clock, TriangleAlert } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { useClientSearchParams } from "@/lib/client-hooks";
import { Reveal } from "@/components/ui";
import { COURSES, getCourse } from "@/lib/courses";
import { compareCourses, matchTone, topCourse } from "@/lib/scoring";
import { usePathora } from "@/lib/store";
import type { Course } from "@/lib/types";
import { DIMENSIONS, DIMENSION_META, type InterestProfile } from "@/lib/types";

export default function ComparePage() {
  const result = usePathora((state) => state.result);
  const student = usePathora((state) => state.student);
  const searchParams = useClientSearchParams();
  const [overrideA, setOverrideA] = useState<string | null>(null);
  const [overrideB, setOverrideB] = useState<string | null>(null);

  const withParam = searchParams.get("with");
  const againstParam = searchParams.get("against");
  const topSlug = result?.matches.find((match) => match.eligible)?.course.slug ?? "bca";
  const secondSlug =
    result?.matches.find((match) => match.eligible && match.course.slug !== topSlug)?.course.slug ??
    "btech-cse";
  const slugA = overrideA ?? (withParam && getCourse(withParam) ? withParam : topSlug);
  const slugB =
    overrideB ?? (againstParam && getCourse(againstParam) ? againstParam : secondSlug === slugA ? "bba" : secondSlug);

  function setSlugA(value: string) {
    setOverrideA(value);
  }

  function setSlugB(value: string) {
    setOverrideB(value);
  }

  const courseA = getCourse(slugA)!;
  const courseB = getCourse(slugB)!;
  const profile = result?.profile ?? null;
  const comparison = useMemo(
    () => compareCourses(courseA, courseB, profile, student.stream),
    [courseA, courseB, profile, student.stream],
  );

  const matchA = result?.matches.find((m) => m.course.slug === slugA);
  const matchB = result?.matches.find((m) => m.course.slug === slugB);

  function swap() {
    setSlugA(slugB);
    setSlugB(slugA);
  }

  return (
    <main>
      <section className="border-b border-midnight/[0.07] bg-surface">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="eyebrow">What-if mode</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-[1.04] text-balance text-midnight sm:text-[2.9rem]">
            Two futures, compared honestly.
          </h1>
          <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-slate-ink">
            Compare duration, eligibility, skills and career routes. If you have completed the
            assessment, each option is also ranked against your actual interest profile.
          </p>
          {!result && (
            <Link href="/discover" className="btn btn-primary mt-6">
              Personalise the comparison
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:p-5">
          <CourseSelect label="Course A" value={slugA} onChange={setSlugA} />
          <button
            type="button"
            onClick={swap}
            className="mx-auto grid size-11 shrink-0 place-items-center rounded-full border border-midnight/10 bg-arctic text-midnight transition hover:border-orange hover:text-orange sm:mb-1 md:size-10"
            aria-label="Swap courses"
          >
            <ArrowLeftRight className="size-4" />
          </button>
          <CourseSelect label="Course B" value={slugB} onChange={setSlugB} />
        </div>

        {/* Phones: one aligned, attribute-by-attribute table so the two options
            stay genuinely side by side instead of becoming two long cards. */}
        <Reveal className="mt-6 md:hidden">
          <CompareTable
            courseA={courseA}
            courseB={courseB}
            matchA={matchA}
            matchB={matchB}
            eligibleA={comparison.eligibleA}
            eligibleB={comparison.eligibleB}
            profile={profile}
          />
        </Reveal>

        <div className="mt-6 hidden gap-4 md:grid lg:grid-cols-2">
          <Reveal className="h-full">
          <CompareCard
            course={courseA}
            match={matchA}
            eligible={comparison.eligibleA}
            stream={student.stream}
            profile={profile}
          />
          </Reveal>
          <Reveal className="h-full" delay={0.08}>
          <CompareCard
            course={courseB}
            match={matchB}
            eligible={comparison.eligibleB}
            stream={student.stream}
            profile={profile}
          />
          </Reveal>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="card h-full p-6">
              <p className="eyebrow">Shared ground</p>
              <h2 className="display mt-2 text-lg text-midnight">Skills both build</h2>
              {comparison.shared.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {comparison.shared.map((skill) => (
                    <span
                      key={skill}
                      className="chip !border-[light-dark(#1F9D8B,#4FD1BE)]/30 !bg-[light-dark(#e8f6f3,#0f322e)] chip-sm !text-[light-dark(#0f6252,#5fd8c4)]"
                    >
                      <Check className="size-3" aria-hidden="true" />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-slate-ink">
                  These two programmes do not share explicit skill labels. That usually means they
                  diverge early — read the first-year subjects closely.
                </p>
              )}
              <div className="mt-5 border-t border-midnight/[0.07] pt-4">
                <p className="text-[0.62rem] font-bold uppercase tracking-wide text-slate-ink">
                  Career overlap
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-midnight">
                  {courseA.careers.filter((career) => courseB.careers.includes(career)).join(" · ") ||
                    "No direct overlap in the listed career routes."}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="card h-full p-6">
              <p className="eyebrow">The real differences</p>
              <h2 className="display mt-2 text-lg text-midnight">Where they split</h2>
              <ul className="mt-3 space-y-2.5">
                {comparison.differences.map((difference, index) => (
                  <li key={index} className="flex items-start gap-2 text-[0.8rem] leading-relaxed text-slate-ink">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-orange" />
                    {difference}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-6">
          <div className="card-dark p-6 sm:p-8">
            <p className="eyebrow text-orange-soft">My read</p>
            <h2 className="display mt-2 text-2xl text-white">
              {result
                ? matchA && matchB
                  ? `For your profile, ${(matchA.finalScore ?? 0) >= (matchB.finalScore ?? 0) ? courseA.name : courseB.name} is the tighter interest fit today.`
                  : "Run the assessment to see which one aligns more closely."
                : "A comparison without your profile can only cover the curriculum."}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65">
              {result
                ? `Fit labels are relative: ${courseA.name} is “${matchA?.label ?? "unranked"}” and ${courseB.name} is “${matchB?.label ?? "unranked"}”. That does not make one course better — it means one currently overlaps more with the interests you described. Choose the environment and daily work you would actually enjoy for three or four years.`
                : "Complete the quest and this section will rank both courses against your six interest dimensions, with eligibility respected."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/mentor" className="btn btn-primary !py-2.5 !text-xs">
                Ask the mentor about this choice
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              {!result && (
                <Link
                  href="/discover"
                  className="btn border border-white/20 !py-2.5 !text-xs text-white hover:bg-white/10"
                >
                  Start the assessment
                </Link>
              )}
            </div>
          </div>
        </Reveal>

        <p className="mt-6 flex items-start gap-2 text-[0.68rem] leading-relaxed text-slate-ink">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-[light-dark(#b57f00,#FFC94A)]" aria-hidden="true" />
          Eligibility and course content vary by university. This comparison uses catalog-level
          information — verify the actual syllabus and admission rules before deciding.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}

function CourseSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex-1">
      <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-slate-ink">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-xl border border-midnight/10 bg-surface px-3.5 py-2.5 text-sm font-semibold text-midnight outline-none transition focus:border-orange"
      >
        {COURSES.map((course) => (
          <option key={course.slug} value={course.slug}>
            {course.name} — {course.short}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompareCard({
  course,
  match,
  eligible,
  stream,
  profile,
}: {
  course: Course;
  match: ReturnType<typeof topCourse> | undefined;
  eligible: boolean;
  stream: string;
  profile: { technology: number; creativity: number; engineering: number; business: number; communication: number; analytical: number } | null;
}) {
  const tone = match ? matchTone(match.label) : null;

  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide text-white"
          style={{ background: course.accent }}
        >
          {course.category}
        </span>
        {match && tone ? (
          <span
            className={`rounded-full border px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide ${tone.bg} ${tone.text} ${tone.border}`}
          >
            {match.label}
          </span>
        ) : (
          <span className="text-[0.6rem] font-semibold text-slate-ink">Not personalised yet</span>
        )}
      </div>
      <h2 className="display mt-3 text-2xl text-midnight">{course.name}</h2>
      <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-wide text-slate-ink">
        {course.degree} · {course.duration}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-ink">{course.tagline}</p>

      <div className="mt-4 rounded-xl bg-arctic px-3.5 py-2.5">
        <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-midnight">
          <Clock className="size-3.5 text-orange" aria-hidden="true" />
          {course.duration} · {course.streams.length >= 5 ? "open to all streams" : course.streams.join(", ")}
        </p>
        {!eligible && (
          <p className="mt-1.5 flex items-start gap-1.5 text-[0.66rem] text-[light-dark(#8a5b00,#FFD98A)]">
            <TriangleAlert className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
            {stream} may not meet the usual subject requirements.
          </p>
        )}
      </div>

      {profile && (
        <div className="mt-4">
          <p className="text-[0.6rem] font-bold uppercase tracking-wide text-slate-ink">
            Interest overlap
          </p>
          <div className="mt-2 space-y-1.5">
            {DIMENSIONS.filter((dimension) => (course.interests[dimension] ?? 0) > 0)
              .sort((a, b) => (course.interests[b] ?? 0) - (course.interests[a] ?? 0))
              .slice(0, 3)
              .map((dimension) => (
                <div key={dimension} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 text-[0.62rem] text-slate-ink">
                    {DIMENSION_META[dimension].short}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-midnight/[0.07]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(profile[dimension] * (course.interests[dimension] ?? 0))}%`,
                        background: DIMENSION_META[dimension].color,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-midnight/[0.07] pt-3.5">
        <p className="text-[0.6rem] font-bold uppercase tracking-wide text-slate-ink">Skills</p>
        <p className="mt-1 text-[0.76rem] leading-relaxed text-midnight">
          {course.skills.slice(0, 3).join(" · ")}
        </p>
        <p className="mt-2.5 text-[0.6rem] font-bold uppercase tracking-wide text-slate-ink">
          Career routes
        </p>
        <p className="mt-1 text-[0.76rem] leading-relaxed text-midnight">
          {course.careers.slice(0, 3).join(" · ")}
        </p>
      </div>

      <Link
        href={`/courses/${course.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-orange hover:underline"
      >
        Full course details
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </article>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   Phone comparison table (<768px).

   Two stacked CompareCards lose the whole point of this page: you cannot hold
   a 500px card in your head while you scroll to the next one. This renders the
   same catalog facts as an aligned grid — a full-width attribute label with
   the two course values on one row beneath it — so every comparison is a
   single horizontal glance at 390px. It never computes a match label; it
   reuses the labels already on the match objects.
   ─────────────────────────────────────────────────────────────────────────── */

function CompareTable({
  courseA,
  courseB,
  matchA,
  matchB,
  eligibleA,
  eligibleB,
  profile,
}: {
  courseA: Course;
  courseB: Course;
  matchA: ReturnType<typeof topCourse> | undefined;
  matchB: ReturnType<typeof topCourse> | undefined;
  eligibleA: boolean;
  eligibleB: boolean;
  profile: InterestProfile | null;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-midnight/[0.07]">
        <CompareHead course={courseA} match={matchA} />
        <CompareHead course={courseB} match={matchB} />
      </div>

      <CompareRow
        label="In one line"
        a={courseA.tagline}
        b={courseB.tagline}
      />
      <CompareRow label="Degree" a={courseA.degree} b={courseB.degree} />
      <CompareRow
        label="Duration"
        a={
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Clock className="size-3 shrink-0 text-orange" aria-hidden="true" />
            {courseA.duration}
          </span>
        }
        b={
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Clock className="size-3 shrink-0 text-orange" aria-hidden="true" />
            {courseB.duration}
          </span>
        }
      />
      <CompareRow
        label="Streams"
        a={<StreamCell course={courseA} eligible={eligibleA} />}
        b={<StreamCell course={courseB} eligible={eligibleB} />}
      />
      {profile && (
        <CompareRow
          label="Interest overlap"
          a={<OverlapCell course={courseA} profile={profile} />}
          b={<OverlapCell course={courseB} profile={profile} />}
        />
      )}
      <CompareRow
        label="Skills you build"
        a={<ListCell items={courseA.skills.slice(0, 3)} />}
        b={<ListCell items={courseB.skills.slice(0, 3)} />}
      />
      <CompareRow
        label="Career routes"
        a={<ListCell items={courseA.careers.slice(0, 3)} />}
        b={<ListCell items={courseB.careers.slice(0, 3)} />}
      />
      <CompareRow
        label=""
        a={<DetailsLink course={courseA} />}
        b={<DetailsLink course={courseB} />}
      />
    </div>
  );
}

function CompareHead({
  course,
  match,
}: {
  course: Course;
  match: ReturnType<typeof topCourse> | undefined;
}) {
  const tone = match ? matchTone(match.label) : null;

  return (
    <div className="min-w-0 px-3 py-3.5">
      <span
        className="block h-1 w-8 rounded-full"
        style={{ background: course.accent }}
        aria-hidden="true"
      />
      <h2 className="display mt-2 text-[1.05rem] leading-tight text-midnight">{course.name}</h2>
      <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-wide text-slate-ink">
        {course.short}
      </p>
      {match && tone ? (
        <span
          className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide ${tone.bg} ${tone.text} ${tone.border}`}
        >
          {match.label}
        </span>
      ) : (
        <span className="mt-2 inline-block text-[0.6rem] font-semibold text-slate-ink">
          Not personalised yet
        </span>
      )}
    </div>
  );
}

function CompareRow({ label, a, b }: { label: string; a: ReactNode; b: ReactNode }) {
  return (
    <div className="border-t border-midnight/[0.07]">
      {label && (
        <p className="bg-arctic px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-slate-ink">
          {label}
        </p>
      )}
      <div className="grid grid-cols-2 divide-x divide-midnight/[0.07]">
        <div className="min-w-0 break-words px-3 py-2.5 text-[0.74rem] leading-relaxed text-midnight">
          {a}
        </div>
        <div className="min-w-0 break-words px-3 py-2.5 text-[0.74rem] leading-relaxed text-midnight">
          {b}
        </div>
      </div>
    </div>
  );
}

function StreamCell({ course, eligible }: { course: Course; eligible: boolean }) {
  return (
    <>
      <span>
        {course.streams.length >= 5 ? "Open to all streams" : course.streams.join(", ")}
      </span>
      {eligible ? (
        <span className="mt-1.5 flex items-start gap-1.5 text-[0.68rem] font-semibold text-[light-dark(#0f6252,#5fd8c4)]">
          <Check className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
          Your stream fits
        </span>
      ) : (
        <span className="mt-1.5 flex items-start gap-1.5 text-[0.68rem] text-[light-dark(#8a5b00,#FFD98A)]">
          <TriangleAlert className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
          May need other subjects
        </span>
      )}
    </>
  );
}

function OverlapCell({ course, profile }: { course: Course; profile: InterestProfile }) {
  const dimensions = DIMENSIONS.filter((dimension) => (course.interests[dimension] ?? 0) > 0)
    .sort((a, b) => (course.interests[b] ?? 0) - (course.interests[a] ?? 0))
    .slice(0, 3);

  if (dimensions.length === 0) {
    return <span className="text-slate-ink">No mapped dimensions</span>;
  }

  return (
    <div className="space-y-1.5">
      {dimensions.map((dimension) => (
        <div key={dimension}>
          <p className="text-[0.62rem] text-slate-ink">{DIMENSION_META[dimension].short}</p>
          <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-midnight/[0.07]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round(profile[dimension] * (course.interests[dimension] ?? 0))}%`,
                background: DIMENSION_META[dimension].color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListCell({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-1.5">
          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-orange" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function DetailsLink({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-orange hover:underline"
    >
      Full details
      <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
    </Link>
  );
}
