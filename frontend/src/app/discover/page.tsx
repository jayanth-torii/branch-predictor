"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Check, ChevronDown, GraduationCap, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";
import { SiteFooter } from "@/components/site-footer";
import { usePathora } from "@/lib/store";
import {
  INTEREST_AREAS,
  MARKS_BANDS,
  STREAMS,
  type InterestArea,
  type MarksBand,
  type PUYear,
  type Stream,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter at least two characters.")
    .max(40, "That name is a little too long."),
  areaOfInterest: z.union([z.enum(INTEREST_AREAS), z.literal("")]).optional(),
  stream: z.enum(STREAMS, { message: "Choose your PU stream to continue." }),
  puYear: z.enum(["1st PU", "2nd PU"], { message: "Choose your current class." }),
  // Deliberately optional and never an error case: marks only ever flag a course
  // as a stretch, so refusing to answer must cost the student nothing.
  marksBand: z.union([z.enum(MARKS_BANDS), z.literal("")]).optional(),
  language: z.string().optional(),
});

const STREAM_DETAILS: Record<Stream, string> = {
  PCMB: "Physics, Chemistry, Maths, Biology",
  PCMC: "Physics, Chemistry, Maths, Computer Science",
  PCM: "Physics, Chemistry, Maths",
  Commerce: "Accountancy, Business Studies, Economics",
  "Arts/Humanities": "History, Political Science, Psychology, Languages",
};

const LANGUAGES = [
  "English",
  "Kannada",
  "Hindi",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Marathi",
  "Bengali",
];

export default function DiscoverPage() {
  const router = useRouter();
  const setStudent = usePathora((state) => state.setStudent);
  const resetAssessment = usePathora((state) => state.resetAssessment);
  const [name, setName] = useState("");
  const [areaOfInterest, setAreaOfInterest] = useState<InterestArea | "">("");
  const [stream, setStream] = useState<Stream | "">("");
  const [puYear, setPuYear] = useState<PUYear | "">("");
  const [marksBand, setMarksBand] = useState<MarksBand | "">("");
  const [language, setLanguage] = useState("English");
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<"name" | "stream" | "puYear" | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<HTMLFieldSetElement>(null);
  const yearRef = useRef<HTMLFieldSetElement>(null);
  const storedStudent = usePathora((state) => state.student);
  const hasResult = usePathora((state) => Boolean(state.result));
  const batchCode = storedStudent.batchCode;
  const firstName = name.trim().split(/\s+/)[0] ?? "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schema.safeParse({ name, stream, puYear, marksBand, language });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(issue?.message ?? "Please complete the form.");
      // The message renders next to the submit button, which on a phone can be
      // a full screen below the field it is talking about. Bring that field
      // into view (and focus it, when it is a real input) so the student is not
      // told to fix something they cannot see.
      const field = issue?.path[0];
      const target =
        field === "name" ? nameRef.current
        : field === "stream" ? streamRef.current
        : field === "puYear" ? yearRef.current
        : null;
      setErrorField(
        field === "name" || field === "stream" || field === "puYear" ? field : null,
      );
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (target instanceof HTMLInputElement) target.focus({ preventScroll: true });
      return;
    }
    setError(null);
    setErrorField(null);
    setStudent({
      name: parsed.data.name,
      areaOfInterest: parsed.data.areaOfInterest ?? "",
      stream: parsed.data.stream,
      puYear: parsed.data.puYear,
      marksBand: parsed.data.marksBand ?? "",
      language: parsed.data.language ?? "English",
    });
    resetAssessment();
    router.push("/assessment");
  }

  return (
    <main>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:gap-12 sm:px-8 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="max-w-md">
          <p className="eyebrow">Stage 01 · Starting point</p>
          <h1 className="display mt-3 text-4xl leading-[1.05] text-balance break-words text-midnight sm:text-[3rem]">
            {firstName ? `Hey, ${firstName}.` : "First, the basics."}
          </h1>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-slate-ink">
            {firstName
              ? "Your future is waiting to be unlocked. Ready to discover what makes you different?"
              : "A few quick details so the recommendations respect your stream. We do not ask for contact details, and nothing is posted anywhere."}
          </p>

          {batchCode && (
            // A pill that wraps to three lines on a phone stops reading as a
            // pill, so below sm it becomes a rounded notice with a hanging icon.
            <div className="mt-6 flex items-start gap-2 rounded-2xl border border-[light-dark(#1F9D8B,#4FD1BE)]/30 bg-[light-dark(#e8f6f3,#0f322e)] px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-[light-dark(#0f6252,#5fd8c4)] sm:inline-flex sm:leading-4 sm:items-center sm:rounded-full sm:py-2">
              <Check className="mt-0.5 size-3.5 shrink-0 sm:mt-0" aria-hidden="true" />
              <span>
                Joined batch {batchCode} — results will contribute to its aggregate dashboard
              </span>
            </div>
          )}

          <div className="mt-7 space-y-3.5 sm:mt-9">
            {[
              "10 interest questions, then 10 from your stream",
              "No timer and no wrong answers",
              "Skip anything that does not feel relevant",
              "Recommendations never claim guaranteed admission",
            ].map((line) => (
              <div key={line} className="flex items-start gap-2.5 text-sm text-slate-ink">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-surface text-orange shadow-sm">
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {line}
              </div>
            ))}
          </div>

          {hasResult && (
            <div className="mt-8 rounded-2xl border border-midnight/10 bg-surface p-4">
              <p className="text-xs font-semibold text-midnight">You already have a result saved.</p>
              <Link
                href="/results"
                className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-orange hover:underline md:mt-1 md:min-h-0"
              >
                Open my results
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}

          <div className="mt-10 hidden items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-ink/70 lg:flex">
            <Sparkles className="size-3.5 text-orange" aria-hidden="true" />
            Built for PU students across India
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8" noValidate>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-midnight">Your starting point</p>
            <span className="chip !border-orange/25 !bg-peach !text-orange">Step 1 of 2</span>
          </div>

          <div className="mt-6">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-ink">
              Name or nickname
            </label>
            <input
              id="name"
              ref={nameRef}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (errorField === "name") setErrorField(null);
              }}
              autoComplete="given-name"
              placeholder="e.g. Alex"
              maxLength={40}
              aria-invalid={errorField === "name" || undefined}
              aria-describedby={error ? "discover-error" : undefined}
              className={cn(
                "mt-2 w-full rounded-2xl border bg-arctic px-4 py-3.5 text-[0.95rem] text-midnight outline-none transition placeholder:text-slate-ink/50 focus:border-orange focus:bg-surface",
                errorField === "name" ? "border-orange bg-peach/50" : "border-midnight/12",
              )}
            />
          </div>

          {/* Asked right after the name, before stream: a self-declared
              starting point. Optional, and it never filters the catalogue —
              the interest profile still comes only from the answers. */}
          <fieldset className="mt-7">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-ink">
              What pulls you in right now? <span className="normal-case text-slate-ink/70">(optional)</span>
            </legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {INTEREST_AREAS.map((option) => {
                const active = areaOfInterest === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAreaOfInterest(active ? "" : option)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full border px-3.5 text-[0.8rem] font-semibold transition md:min-h-0 md:py-2",
                      active
                        ? "border-orange bg-peach/60 text-midnight"
                        : "border-midnight/12 bg-surface text-slate-ink hover:border-midnight/25",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[0.72rem] leading-relaxed text-slate-ink">
              Just a starting point. Your actual profile comes from the questions, so this never
              narrows what you get shown.
            </p>
          </fieldset>

          <fieldset ref={streamRef} className="mt-7">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-ink">
              Your PU stream
            </legend>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              {STREAMS.map((option) => {
                const active = stream === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setStream(option);
                      if (errorField === "stream") setErrorField(null);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "rounded-2xl border bg-surface p-3.5 text-left transition-all duration-200",
                      active
                        ? "border-orange bg-peach/60 shadow-[0_10px_30px_-20px_rgba(255,107,53,0.8)]"
                        : errorField === "stream"
                          ? "border-orange/40 hover:border-midnight/25"
                          : "border-midnight/10 hover:border-midnight/25",
                      option === "Arts/Humanities" && "sm:col-span-2",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-midnight">{option}</span>
                      {active && (
                        <span className="grid size-4 place-items-center rounded-full bg-orange text-white">
                          <Check className="size-2.5" strokeWidth={4} aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[0.68rem] leading-snug text-slate-ink">
                      {STREAM_DETAILS[option]}
                    </p>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset ref={yearRef} className="mt-6">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-ink">
              Current class
            </legend>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {(["1st PU", "2nd PU"] as PUYear[]).map((option) => {
                const active = puYear === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setPuYear(option);
                      if (errorField === "puYear") setErrorField(null);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "border-orange bg-peach/60 text-midnight"
                        : errorField === "puYear"
                          ? "border-orange/40 bg-surface text-slate-ink hover:border-midnight/25"
                          : "border-midnight/10 bg-surface text-slate-ink hover:border-midnight/25",
                    )}
                  >
                    <GraduationCap className="size-4" aria-hidden="true" />
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-ink">
              Your approximate marks so far{" "}
              <span className="font-normal normal-case text-slate-ink/60">(optional)</span>
            </legend>
            <p className="mt-1.5 text-[0.68rem] leading-relaxed text-slate-ink">
              A rough band is plenty. It only flags a course as a stretch — it never hides one,
              never changes your match, and &ldquo;Not sure yet&rdquo; is a perfectly fine answer.
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {MARKS_BANDS.map((option) => {
                const active = marksBand === option;
                return (
                  <button
                    key={option}
                    type="button"
                    // Tapping the active band clears it: the field is optional, so
                    // there has to be a way back out of an answer.
                    onClick={() => setMarksBand(active ? "" : option)}
                    aria-pressed={active}
                    className={cn(
                      "flex min-h-11 items-center justify-center rounded-2xl border px-2.5 py-3 text-center text-[0.78rem] font-semibold leading-snug transition md:min-h-0",
                      active
                        ? "border-orange bg-peach/60 text-midnight"
                        : "border-midnight/10 bg-surface text-slate-ink hover:border-midnight/25",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6">
            <label
              htmlFor="language"
              className="text-xs font-semibold uppercase tracking-wide text-slate-ink"
            >
              Preferred language <span className="font-normal normal-case text-slate-ink/60">(optional)</span>
            </label>
            {/* `appearance-none` stripped the native caret and nothing replaced
                it, so the control read as a plain text box on every viewport.
                The chevron is decorative and sits outside the hit area. */}
            <div className="relative mt-2">
              <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-midnight/12 bg-arctic py-3.5 pl-4 pr-11 text-[0.95rem] text-midnight outline-none transition focus:border-orange focus:bg-surface"
              >
                {LANGUAGES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-ink"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1.5 text-[0.68rem] text-slate-ink">
              Language preference is stored for future localisation. This build is in English.
            </p>
          </div>

          {error && (
            <p
              id="discover-error"
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-orange/25 bg-orange/10 px-3 py-2.5 text-xs font-semibold leading-relaxed text-orange"
            >
              <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary mt-7 w-full">
            Continue to the quest
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          <p className="mt-3 text-center text-[0.68rem] leading-relaxed text-slate-ink">
            By continuing you agree that recommendations are guidance, not admission advice.
          </p>
        </form>
      </div>
      <SiteFooter />
    </main>
  );
}
