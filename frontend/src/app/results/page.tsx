"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Brain,
  ChevronDown,
  Compass,
  Download,
  Flame,
  GraduationCap,
  Info,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { CourseCard } from "@/components/course-card";
import { CareerConstellation } from "@/components/results/constellation";
import { DimensionBars } from "@/components/results/dimension-bars";
import { JourneyMap } from "@/components/results/journey-map";
import { InterestRadar } from "@/components/interest-radar";
import { EmptyState, Reveal, SectionHeading } from "@/components/ui";
import { useHydrated } from "@/lib/client-hooks";
import { SiteFooter } from "@/components/site-footer";
import { usePathora } from "@/lib/store";
import { DIMENSION_META } from "@/lib/types";
import { cn, downloadCsv, formatDate } from "@/lib/utils";

export default function ResultsPage() {
  const mounted = useHydrated();
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showIneligible, setShowIneligible] = useState(false);
  const result = usePathora((state) => state.result);

  if (!mounted) {
    return (
      <main className="grid min-h-[70vh] place-items-center">
        <div className="size-10 animate-pulse rounded-full bg-orange/20" />
      </main>
    );
  }

  if (!result) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-8">
        <EmptyState
          title="No profile yet"
          description="Your results appear here after the quest: ten interest questions, then ten from your stream. It takes under ten minutes, and you can skip questions you do not connect with."
        >
          <Link href="/discover" className="btn btn-primary mt-2">
            Start the assessment
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </EmptyState>
      </main>
    );
  }

  const eligible = result.matches.filter((match) => match.eligible);
  const ineligible = result.matches.filter((match) => !match.eligible);
  const strong = eligible.slice(0, 3);
  const further = eligible.slice(3, 6);
  const alternatives = eligible.slice(6, 12);
  const top = strong[0] ?? eligible[0];
  const topCareer = result.topCareers[0];
  const strongest = result.topDimensions[0];
  const firstName = result.student.name.split(/\s+/)[0] || "there";

  const snapshot = result;

  function downloadSummary() {
    const rows: (string | number)[][] = [
      ["Pathora AI — student summary"],
      ["Generated", formatDate(snapshot.createdAt)],
      ["Name", snapshot.student.name],
      ["Stream", snapshot.student.stream],
      ["Class", snapshot.student.puYear],
      ["Profile", snapshot.archetype.title],
      ["XP", snapshot.xp],
      ["Questions answered", `${snapshot.completedCount}/10`],
      [],
      ["Interest dimension", "Score (0-100)"],
      ...snapshot.topDimensions.map((dimension) => [
        DIMENSION_META[dimension].label,
        snapshot.profile[dimension],
      ]),
      [],
      ["Recommended course", "Match label", "Duration", "Why it fits"],
      ...eligible.slice(0, 8).map((match) => [
        match.course.name,
        match.label,
        match.course.duration,
        match.explanation,
      ]),
      [],
      ["Guidance only — verify eligibility and admission rules with each institution."],
    ];
    downloadCsv(`pathora-${snapshot.student.name.toLowerCase().replace(/\s+/g, "-")}.csv`, rows);
  }

  return (
    <main>
      {/* Reveal hero */}
      <section className="relative overflow-hidden bg-navy pb-20 pt-14 text-white sm:pb-24 sm:pt-16">
        <div
          className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-orange/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full bg-[#3C7DF2]/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="eyebrow text-orange-soft">Your future has a direction</p>
            <h1 className="display mt-3 text-3xl leading-[1.05] text-balance sm:text-[2.7rem] lg:text-[3.1rem]">
              {firstName}, meet your <span className="text-orange">{result.archetype.title.replace("The ", "")}</span> profile.
            </h1>
            <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-white/65">
              {result.archetype.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip !border-white/15 !bg-white/5 !text-white/80">
                <Zap className="size-3.5 text-orange" aria-hidden="true" />
                {result.xp} XP
              </span>
              <span className="chip !border-white/15 !bg-white/5 !text-white/80">
                <Target className="size-3.5 text-orange" aria-hidden="true" />
                {result.completedCount}/10 answered
              </span>
              <span className="chip !border-white/15 !bg-white/5 !text-white/80">
                <Compass className="size-3.5 text-orange" aria-hidden="true" />
                {result.student.stream || "Stream not set"}
              </span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/courses/${top?.course.slug ?? "bca"}`} className="btn btn-primary">
                Explore my top course
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <button type="button" onClick={downloadSummary} className="btn border border-white/20 text-white hover:bg-white/10">
                <Download className="size-4" aria-hidden="true" />
                Download summary
              </button>
            </div>
            <p className="mt-5 max-w-md text-[0.68rem] leading-relaxed text-white/60">
              Recommendations are guidance, not admission guarantees. Eligibility is shown per
              course and must be verified with each institution.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/60">
                  Interest fingerprint
                </p>
                <p className="display mt-1 text-lg text-white">
                  {DIMENSION_META[strongest].label}
                </p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-orange/15 text-orange">
                <Brain className="size-4" aria-hidden="true" />
              </span>
            </div>
            <InterestRadar profile={result.profile} dark height={260} />
            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              {result.topDimensions.map((dimension) => (
                <div key={dimension}>
                  <p className="text-[0.58rem] font-semibold uppercase tracking-wide text-white/60">
                    {DIMENSION_META[dimension].short}
                  </p>
                  <p className="display mt-1 text-lg text-white">{result.profile[dimension]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Profile read */}
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Target,
              label: "Strongest interest",
              value: DIMENSION_META[strongest].label,
              note: DIMENSION_META[strongest].blurb,
            },
            {
              icon: GraduationCap,
              label: "Learning style",
              value: result.learningStyle.split(" — ")[0],
              note: result.learningStyle.split(" — ")[1] ?? "How you absorb new material best",
            },
            {
              icon: Sparkles,
              label: "Career personality",
              value: result.archetype.careerPersonality,
              note: result.archetype.tagline,
            },
          ].map((item, index) => (
            <Reveal key={item.label} delay={index * 0.06}>
              <div className="card h-full p-5">
                <div className="flex items-center gap-2 text-slate-ink">
                  <item.icon className="size-4 text-orange" aria-hidden="true" />
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em]">{item.label}</p>
                </div>
                <p className="display mt-2.5 text-lg leading-snug text-midnight">{item.value}</p>
                <p className="mt-1.5 text-[0.74rem] leading-relaxed text-slate-ink">{item.note}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {result.badges.length > 0 && (
          <Reveal className="mt-4">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-midnight/[0.07] bg-surface px-4 py-3">
              <BadgeCheck className="size-4 text-[light-dark(#1F9D8B,#4FD1BE)]" aria-hidden="true" />
              <p className="mr-1 text-[0.66rem] font-bold uppercase tracking-wide text-slate-ink">
                Unlocked
              </p>
              {result.badges.map((badge) => (
                <span key={badge} className="chip !border-orange/20 !bg-peach/60 chip-sm !text-midnight">
                  {badge}
                </span>
              ))}
            </div>
          </Reveal>
        )}

        {/* Stage 2 recap. Deliberately NO tally: the product rule is that the
            student never sees a score. The trail shows which ideas landed and
            which are worth a second look, which is feedback, not a grade. */}
        {result.streamQuiz && result.streamQuiz.total > 0 && (
          <Reveal className="mt-4">
            <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
              <div className="min-w-0">
                <p className="eyebrow">Your {result.student.stream || "stream"} round</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-ink">
                  You worked through {result.streamQuiz.total} subject questions. The ones without a
                  tick are just topics worth a second look — they changed nothing about the matches
                  below.
                </p>
              </div>
              <Link
                href="/assessment/stream"
                className="btn btn-ghost shrink-0 !py-2.5 !text-xs"
              >
                Play the round again
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="card p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">How your profile reads</p>
                  <h2 className="display mt-2 text-xl text-midnight">Six dimensions, one shape</h2>
                </div>
                <Link
                  href="/mentor"
                  className="inline-flex min-h-11 shrink-0 items-center text-xs font-bold text-orange hover:underline md:min-h-0"
                >
                  Ask why
                </Link>
              </div>
              <div className="mt-5">
                <DimensionBars profile={result.profile} />
              </div>
              <p className="mt-5 rounded-xl bg-arctic px-3.5 py-3 text-[0.7rem] leading-relaxed text-slate-ink">
                {result.perspective} These scores come from the interests attached to each answer you
                chose — not from correctness, speed or confidence.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card flex h-full flex-col justify-between gap-5 p-6 sm:p-7">
              <div>
                <p className="eyebrow">Your stated direction</p>
                <h2 className="display mt-2 text-xl capitalize text-midnight">{result.goal}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-ink">
                  The final question carries a little extra weight, but it never overrides the nine
                  answers before it. {result.answers.q10 === "G"
                    ? "You chose to stay open, so the profile relies on your other answers."
                    : "Your profile and your stated goal currently point in compatible directions."}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[0.62rem] font-bold uppercase tracking-wide text-slate-ink">
                  Your strengths to lean on
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.archetype.strengths.map((strength) => (
                    <span key={strength} className="chip chip-sm">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/compare"
                className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-orange hover:underline md:min-h-0"
              >
                Compare two of your matches
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Course matches */}
      <section className="border-y border-midnight/[0.06] bg-surface">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.75fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-orange/35 bg-peach px-3.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-orange">
                  <Compass className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                  Course discovery
                </span>
                <h2 className="display mt-4 text-[1.9rem] leading-[1.08] text-balance text-midnight sm:text-[2.5rem]">
                  Courses that line up with how{" "}
                  <span className="relative inline-block whitespace-nowrap text-orange">
                    you think.
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
                <p className="mt-4 max-w-xl text-[0.92rem] leading-relaxed text-slate-ink">
                  Ranked by interest overlap and filtered by{" "}
                  {result.student.stream || "your"} stream eligibility. Explanations are generated
                  from your actual dimension scores — not from a language model.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Image
                  src="/courses-illustration.png"
                  alt=""
                  width={1410}
                  height={838}
                  sizes="(max-width: 1023px) 70vw, 32vw"
                  className="h-auto w-full max-w-[22rem]"
                />
                <Link
                  href="/courses"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-navy)] px-6 text-[0.88rem] font-bold text-white transition hover:bg-[var(--color-navy)]/90"
                >
                  Full catalog
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Reveal>

          {strong.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-peach text-orange"
                >
                  <Flame className="size-4" strokeWidth={2.4} />
                </span>
                <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-midnight">
                  Strong match
                </h3>
                <span aria-hidden="true" className="h-0.5 w-16 rounded-full bg-orange" />
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {strong.map((match) => (
                  <CourseCard key={match.course.slug} match={match} featured />
                ))}
              </div>
            </div>
          )}

          {further.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-peach text-orange"
                >
                  <Compass className="size-4" strokeWidth={2.4} />
                </span>
                <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-midnight">
                  Explore further
                </h3>
                <span aria-hidden="true" className="h-0.5 w-16 rounded-full bg-orange" />
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {further.map((match) => (
                  <CourseCard key={match.course.slug} match={match} />
                ))}
              </div>
            </div>
          )}

          {/* The qualifier sits beside the controls, not buried under the
              grid: a student reading "Strong match" needs to know in the same
              glance that it is relative to their own answers. */}
          <div className="mt-9 flex flex-col gap-5 border-t border-midnight/[0.07] pt-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="flex flex-wrap items-center gap-4">
            {alternatives.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAlternatives((value) => !value)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-midnight/12 bg-surface px-5 text-[0.85rem] font-bold text-midnight transition hover:border-orange/50 hover:text-orange"
                aria-expanded={showAlternatives}
              >
                {showAlternatives ? "Hide alternative paths" : `Show ${alternatives.length} alternative paths`}
                <ChevronDown
                  aria-hidden="true"
                  className={cn("size-4 transition-transform", showAlternatives && "rotate-180")}
                />
              </button>
            )}
            {ineligible.length > 0 && (
              <button
                type="button"
                onClick={() => setShowIneligible((value) => !value)}
                className="inline-flex min-h-11 items-center text-left text-[0.68rem] font-semibold text-slate-ink underline-offset-4 hover:text-midnight hover:underline md:min-h-0"
                aria-expanded={showIneligible}
              >
                {showIneligible
                  ? "Hide courses outside my stream"
                  : `Show ${ineligible.length} courses that may require other subjects`}
              </button>
            )}
            </div>

            <p className="flex max-w-xl items-start gap-2.5 text-[0.76rem] leading-relaxed text-slate-ink">
              <Info className="mt-0.5 size-4 shrink-0 text-slate-ink/70" aria-hidden="true" />
              Labels are relative to your own results and stream, not an absolute judgement of
              course quality. Admission cut-offs, entrance exams and subject combinations vary by
              institution and year.
            </p>
          </div>

          {showAlternatives && alternatives.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {alternatives.map((match) => (
                <CourseCard key={match.course.slug} match={match} />
              ))}
            </div>
          )}

          {showIneligible && ineligible.length > 0 && (
            <div className="mt-6 rounded-3xl border border-dashed border-[light-dark(#E0A400,#FFC94A)]/40 bg-[light-dark(#FFFBF0,#211a0c)] p-4 sm:p-5">
              <p className="mb-4 text-[0.72rem] leading-relaxed text-[light-dark(#8a5b00,#FFD98A)]">
                These programmes fell outside the usual subject requirements for{" "}
                <strong>{result.student.stream || "your stream"}</strong>. They are shown for
                awareness only — check institution-specific rules before considering them.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ineligible.slice(0, 6).map((match) => (
                  <CourseCard key={match.course.slug} match={match} />
                ))}
              </div>
            </div>
          )}

          <p className="mt-8 text-[0.68rem] leading-relaxed text-slate-ink">
            Labels are relative to your own results and stream, not an absolute judgement of course
            quality. Admission cut-offs, entrance exams and subject combinations vary by institution
            and year.
          </p>
        </div>
      </section>

      {/* Constellation + journey */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal>
          <CareerConstellation careers={result.topCareers} />
        </Reveal>

        <div className="mt-14">
          <Reveal>
            <SectionHeading
              eyebrow="Future journey map"
              title="From where you are to what comes next."
              description="A path, not a promise. Every stage is clickable so you can inspect the details rather than trust the summary."
            />
          </Reveal>
          <div className="mt-7">
            <JourneyMap
              stream={result.student.stream}
              course={top?.course ?? eligible[0].course}
              careerTitle={topCareer?.title ?? "Career explorer"}
              careerSlug={topCareer?.slug ?? "software-developer"}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="card h-full p-6">
              <p className="eyebrow">What-if mode</p>
              <h3 className="display mt-2 text-xl text-midnight">Two futures, side by side.</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-ink">
                Compare duration, eligibility, skill demands and career routes before you commit to a
                direction.
              </p>
              <Link href="/compare" className="btn btn-dark mt-5 !py-2.5 !text-xs">
                Open comparison
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="card h-full p-6">
              <p className="eyebrow">Career mentor</p>
              <h3 className="display mt-2 text-xl text-midnight">Ask a specific question.</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-ink">
                “Why was {top?.course.name ?? "this course"} recommended?” or “What if I choose BBA
                instead?” Answers come from your profile and the catalog.
              </p>
              <Link href="/mentor" className="btn btn-ghost mt-5 !py-2.5 !text-xs">
                Talk to the mentor
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-midnight/[0.07] pt-6">
          <p className="max-w-xl text-[0.68rem] leading-relaxed text-slate-ink">
            Want a different result? The profile changes only if your answers change — that is the
            point. Retake the quest when you have genuinely learned something new about yourself.
          </p>
          <div className="flex gap-2">
            <Link href="/discover" className="btn btn-ghost !py-2.5 !text-xs">
              Update details
            </Link>
            <Link href="/assessment" className="btn btn-primary !py-2.5 !text-xs">
              Retake the quest
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-4 sm:px-8">
        <div className="mesh relative overflow-hidden rounded-[2rem] border border-midnight/[0.07] px-6 py-12 sm:px-10">
          <div className="relative grid items-center gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">Keep exploring</p>
              <h2 className="display mt-2 max-w-xl text-2xl leading-tight text-balance text-midnight sm:text-3xl">
                One profile, {eligible.length} eligible directions. You only need to choose the next
                step.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-ink">
                {result.batchCode
                  ? `Your anonymous result contributes to batch ${result.batchCode}. Trainers see aggregates by default.`
                  : "Join a batch code from your college to contribute to aggregated batch analytics (optional)."}
              </p>
            </div>
            <Link href="/courses" className="btn btn-primary shrink-0">
              Browse courses
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
