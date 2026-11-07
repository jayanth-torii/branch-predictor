"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  ClipboardList,
  Code2,
  Cpu,
  EyeOff,
  FlaskConical,
  Globe,
  GraduationCap,
  HelpCircle,
  Layers,
  Palette,
  ShieldCheck,
  Sigma,
  Sparkles,
  Target,
  User,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";
import { SiteFooter } from "@/components/site-footer";
import { usePathora } from "@/lib/store";
import { QUESTIONS } from "@/lib/questions";
import { STREAM_QUESTIONS } from "@/lib/stream-questions";
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

const STREAM_ICONS: Record<Stream, LucideIcon> = {
  PCMB: FlaskConical,
  PCMC: Cpu,
  PCM: Sigma,
  Commerce: BarChart3,
  "Arts/Humanities": BookOpen,
};

const INTEREST_ICONS: Record<InterestArea, LucideIcon> = {
  "Computing & Software": Code2,
  "Engineering & Electronics": Cpu,
  "Business & Commerce": Briefcase,
  "Design & Creative": Palette,
  "Data & Analytics": BarChart3,
  "People & Communication": Users,
  "Still deciding": HelpCircle,
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

/**
 * Counted from the question banks, never typed in. The promise on this screen
 * is the first thing a student can catch us being wrong about, and the stream
 * round has already changed length once — the mock for this page still says
 * "then 10", which has not been true since it became 15.
 */
const CORE_COUNT = QUESTIONS.length;

function promisesFor(stream: Stream | ""): { icon: LucideIcon; title: string; sub: string }[] {
  // Every stream carries the same number today. Reading the chosen one anyway
  // means the line stays true if one of them ever diverges.
  const streamCount = STREAM_QUESTIONS[stream || STREAMS[0]].length;
  return [
    {
      icon: ClipboardList,
      title: `${CORE_COUNT} Interest Questions`,
      sub: `Then ${streamCount} from your stream`,
    },
    { icon: Zap, title: "No Timer, No Wrong Answers", sub: "Answer at your own pace" },
    { icon: EyeOff, title: "Skip What Doesn't Feel Relevant", sub: "Keep it focused on you" },
    {
      icon: ShieldCheck,
      title: "Reliable & Fair Recommendations",
      sub: "Never a guaranteed admission",
    },
  ];
}

/** Label above each field, with its icon. Keeps the eleven of them identical. */
function FieldLabel({
  icon: Icon,
  children,
  optional = false,
  htmlFor,
  as = "label",
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  optional?: boolean;
  htmlFor?: string;
  as?: "label" | "legend";
}) {
  const inner = (
    <>
      <Icon className="size-[1.05rem] shrink-0 text-orange" strokeWidth={2.3} aria-hidden="true" />
      <span className="text-[0.95rem] font-bold text-midnight">{children}</span>
      {optional && <span className="text-[0.85rem] font-normal text-slate-ink">(optional)</span>}
    </>
  );
  const className = "flex flex-wrap items-center gap-x-2 gap-y-1";
  return as === "legend" ? (
    <legend className={className}>{inner}</legend>
  ) : (
    <label htmlFor={htmlFor} className={className}>
      {inner}
    </label>
  );
}

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
    // `areaOfInterest` used to be missing from this object while the schema
    // declared it optional, so it parsed to undefined and the student's choice
    // was written to the store as "" every single time.
    const parsed = schema.safeParse({ name, areaOfInterest, stream, puYear, marksBand, language });
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

  /** Shared look for every option control on this form. */
  const option = (active: boolean, flagged = false) =>
    cn(
      "relative rounded-2xl border bg-surface text-left transition-all duration-200",
      active
        ? "border-orange bg-peach/70 shadow-[0_10px_30px_-20px_rgba(255,107,53,0.8)]"
        : flagged
          ? "border-orange/40 hover:border-midnight/25"
          : "border-midnight/10 hover:border-midnight/25",
    );

  return (
    <main>
      <div className="relative isolate overflow-hidden">
        {/* Ambient wash rather than discrete shapes — large and heavily blurred
            so no edge lands beside the form. Clipped by this wrapper, so none
            of it can widen the page. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <span className="absolute -right-52 -top-60 block size-[48rem] rounded-full bg-orange/[0.10] blur-3xl" />
          <span className="absolute -bottom-64 -left-56 block size-[44rem] rounded-full bg-[var(--color-navy)]/[0.07] blur-3xl" />
        </div>

        <div className="mx-auto grid w-full max-w-6xl gap-9 px-5 py-10 sm:gap-12 sm:px-8 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* ── Left: the promise ──────────────────────────────────────── */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange/35 bg-peach px-4 py-2 text-[0.82rem] font-bold text-orange">
              <Target className="size-4" strokeWidth={2.4} aria-hidden="true" />
              Stage 01 · Starting Point
            </span>

            <h1 className="display mt-5 text-[2.4rem] leading-[1.04] text-balance break-words text-midnight sm:text-[3.1rem]">
              {firstName ? (
                <>
                  Hey,{" "}
                  <span className="relative inline-block text-orange">
                    {firstName}.
                    <Underline />
                  </span>
                </>
              ) : (
                <>
                  <span className="block">First, the</span>
                  <span className="relative inline-block text-orange">
                    basics.
                    <Underline />
                    <Sparks />
                  </span>
                </>
              )}
            </h1>

            <p className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-slate-ink">
              {firstName
                ? "Your future is waiting to be unlocked. Ready to discover what makes you different?"
                : "A few quick details so the recommendations respect your stream. We do not ask for contact details, and nothing is posted anywhere."}
            </p>

            {batchCode && (
              // A pill that wraps to three lines on a phone stops reading as a
              // pill, so below sm it becomes a rounded notice with a hanging icon.
              <div className="mt-6 flex items-start gap-2 rounded-2xl border border-[light-dark(#1F9D8B,#4FD1BE)]/30 bg-[light-dark(#e8f6f3,#0f322e)] px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-[light-dark(#0f6252,#5fd8c4)] sm:inline-flex sm:items-center sm:rounded-full sm:py-2 sm:leading-4">
                <Check className="mt-0.5 size-3.5 shrink-0 sm:mt-0" aria-hidden="true" />
                <span>
                  Joined batch {batchCode} — results will contribute to its aggregate dashboard
                </span>
              </div>
            )}

            <ul className="mt-8 space-y-5">
              {promisesFor(stream).map((promise) => (
                <li key={promise.title} className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-2xl bg-peach text-orange"
                  >
                    <promise.icon className="size-[1.3rem]" strokeWidth={2.3} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[1rem] font-bold leading-snug text-midnight">
                      {promise.title}
                    </span>
                    <span className="block text-[0.86rem] leading-snug text-slate-ink">
                      {promise.sub}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            {hasResult && (
              <div className="mt-8 rounded-2xl border border-midnight/10 bg-surface p-4">
                <p className="text-xs font-semibold text-midnight">
                  You already have a result saved.
                </p>
                <Link
                  href="/results"
                  className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-orange hover:underline md:mt-1 md:min-h-0"
                >
                  Open my results
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            )}

            {/* Desktop only: on a phone this would push the form a full screen
                down, and the form is what the student came here to fill in. */}
            <div className="mt-10 hidden lg:block">
              <Image
                src="/discover-student.png"
                alt=""
                width={1351}
                height={958}
                sizes="40vw"
                className="h-auto w-full max-w-[26rem]"
              />
              <span className="mt-2 inline-flex items-center gap-2.5 rounded-full border border-midnight/10 bg-surface px-4 py-2.5 text-[0.85rem] font-bold text-midnight shadow-sm">
                <GraduationCap className="size-[1.1rem] text-orange" aria-hidden="true" />
                Built for PU Students Across India
              </span>
            </div>
          </div>

          {/* ── Right: the form ────────────────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.75rem] border border-midnight/[0.07] bg-surface p-5 shadow-[0_40px_90px_-55px_rgba(16,27,61,0.5)] sm:p-7"
            noValidate
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2.5 text-[1.05rem] font-bold text-midnight">
                <Layers className="size-[1.15rem] text-orange" strokeWidth={2.3} aria-hidden="true" />
                Your Starting Point
              </p>
              <span className="shrink-0 rounded-full bg-peach px-3.5 py-1.5 text-[0.8rem] font-bold text-orange">
                Step 1 of 2
              </span>
            </div>

            {/* Two stages, and this is the first of them. */}
            <div
              className="mt-4 h-2 w-full overflow-hidden rounded-full bg-midnight/[0.08]"
              role="progressbar"
              aria-valuenow={1}
              aria-valuemin={1}
              aria-valuemax={2}
              aria-label="Step 1 of 2"
            >
              <span className="block h-full w-1/2 rounded-full bg-orange" />
            </div>

            <div className="mt-6">
              <FieldLabel icon={User} htmlFor="name">
                Name or Nickname
              </FieldLabel>
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
                  "mt-2.5 w-full rounded-2xl border bg-arctic px-4 py-3.5 text-[0.95rem] text-midnight outline-none transition placeholder:text-slate-ink/50 focus:border-orange focus:bg-surface",
                  errorField === "name" ? "border-orange bg-peach/50" : "border-midnight/12",
                )}
              />
            </div>

            {/* Asked right after the name, before stream: a self-declared
                starting point. Optional, and it never filters the catalogue —
                the interest profile still comes only from the answers. */}
            <fieldset className="mt-7">
              <FieldLabel icon={Sparkles} as="legend" optional>
                What pulls you in right now?
              </FieldLabel>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {INTEREST_AREAS.map((area) => {
                  const active = areaOfInterest === area;
                  const Icon = INTEREST_ICONS[area];
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setAreaOfInterest(active ? "" : area)}
                      aria-pressed={active}
                      className={cn(
                        option(active),
                        "inline-flex min-h-11 items-center gap-2.5 rounded-full px-4 py-2.5 text-[0.85rem] font-semibold",
                        active ? "text-midnight" : "text-slate-ink",
                      )}
                    >
                      <Icon
                        className={cn("size-[1.05rem] shrink-0", active ? "text-orange" : "text-slate-ink/70")}
                        strokeWidth={2.2}
                        aria-hidden="true"
                      />
                      {area}
                      {active && <Tick />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2.5 text-[0.76rem] leading-relaxed text-slate-ink">
                Just a starting point. Your actual profile comes from the questions, so this never
                narrows what you get shown.
              </p>
            </fieldset>

            <fieldset ref={streamRef} className="mt-7">
              <FieldLabel icon={Layers} as="legend">
                Your PU Stream
              </FieldLabel>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {STREAMS.map((item) => {
                  const active = stream === item;
                  const Icon = STREAM_ICONS[item];
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setStream(item);
                        if (errorField === "stream") setErrorField(null);
                      }}
                      aria-pressed={active}
                      className={cn(
                        option(active, errorField === "stream"),
                        "flex items-start gap-3 p-3.5",
                        item === "Arts/Humanities" && "sm:col-span-2",
                      )}
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 size-[1.3rem] shrink-0",
                          active ? "text-orange" : "text-slate-ink/70",
                        )}
                        strokeWidth={2.1}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.95rem] font-bold text-midnight">{item}</span>
                        <span className="mt-0.5 block text-[0.76rem] leading-snug text-slate-ink">
                          {STREAM_DETAILS[item]}
                        </span>
                      </span>
                      {active && <Tick />}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset ref={yearRef} className="mt-7">
              <FieldLabel icon={GraduationCap} as="legend">
                Current Class
              </FieldLabel>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {(["1st PU", "2nd PU"] as PUYear[]).map((item) => {
                  const active = puYear === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setPuYear(item);
                        if (errorField === "puYear") setErrorField(null);
                      }}
                      aria-pressed={active}
                      className={cn(
                        option(active, errorField === "puYear"),
                        "flex min-h-12 items-center justify-center gap-2.5 rounded-full px-4 py-3 text-[0.92rem] font-bold",
                        active ? "text-midnight" : "text-slate-ink",
                      )}
                    >
                      <GraduationCap
                        className={cn("size-[1.1rem]", active ? "text-orange" : "text-slate-ink/70")}
                        aria-hidden="true"
                      />
                      {item}
                      {active && <Tick />}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="mt-7">
              <FieldLabel icon={BarChart3} as="legend" optional>
                Your Approximate Marks So Far
              </FieldLabel>
              <p className="mt-2 text-[0.76rem] leading-relaxed text-slate-ink">
                A rough band is plenty. It only flags a course as a stretch — it never hides one,
                never changes your match, and &ldquo;Not sure yet&rdquo; is a perfectly fine answer.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {MARKS_BANDS.map((band) => {
                  const active = marksBand === band;
                  return (
                    <button
                      key={band}
                      type="button"
                      // Tapping the active band clears it: the field is optional, so
                      // there has to be a way back out of an answer.
                      onClick={() => setMarksBand(active ? "" : band)}
                      aria-pressed={active}
                      className={cn(
                        option(active),
                        "flex min-h-11 items-center justify-center rounded-full px-2.5 py-3 text-center text-[0.84rem] font-bold leading-snug",
                        active ? "text-midnight" : "text-slate-ink",
                      )}
                    >
                      {band}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-7">
              <FieldLabel icon={Globe} htmlFor="language" optional>
                Preferred Language
              </FieldLabel>
              {/* `appearance-none` stripped the native caret and nothing replaced
                  it, so the control read as a plain text box on every viewport.
                  The chevron is decorative and sits outside the hit area. */}
              <div className="relative mt-2.5">
                <select
                  id="language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-midnight/12 bg-arctic py-3.5 pl-4 pr-11 text-[0.95rem] text-midnight outline-none transition focus:border-orange focus:bg-surface"
                >
                  {LANGUAGES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-ink"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-[0.76rem] text-slate-ink">
                Language preference is stored for future localisation. This build is in English.
              </p>
            </div>

            {error && (
              <p
                id="discover-error"
                role="alert"
                className="mt-5 flex items-start gap-2 rounded-xl border border-orange/25 bg-orange/10 px-3 py-2.5 text-xs font-semibold leading-relaxed text-orange"
              >
                <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary mt-7 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full text-[1.05rem] font-bold transition"
            >
              Continue to the quest
              <ArrowRight className="size-[1.15rem]" aria-hidden="true" />
            </button>
            <p className="mt-3.5 flex items-center justify-center gap-2 text-center text-[0.76rem] leading-relaxed text-slate-ink">
              <ShieldCheck className="size-4 shrink-0 text-orange" aria-hidden="true" />
              By continuing you agree that recommendations are guidance, not admission advice.
            </p>
          </form>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

/** Hand-drawn stroke under the accent word. Em units so it tracks the type. */
function Underline() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 20"
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-0 top-[0.95em] h-[0.15em] w-full overflow-visible"
    >
      <path
        d="M6 14 Q 100 3 194 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Two ticks off the top-right corner, angled apart like a spark. */
function Sparks() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[0.26em] top-[0.02em] block h-[0.26em] w-[0.055em] -rotate-[16deg] rounded-full bg-current"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[0.42em] top-[0.34em] block h-[0.2em] w-[0.055em] rotate-[24deg] rounded-full bg-current"
      />
    </>
  );
}

/** The orange check that marks a chosen option. */
function Tick() {
  return (
    <span
      aria-hidden="true"
      className="ml-auto grid size-5 shrink-0 place-items-center rounded-full bg-orange text-white"
    >
      <Check className="size-3" strokeWidth={4} />
    </span>
  );
}
