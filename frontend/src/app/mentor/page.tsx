"use client";

import Link from "next/link";
import { ArrowRight, Compass, Loader2, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InterestRadar } from "@/components/interest-radar";
import { SiteFooter } from "@/components/site-footer";
import { apiBaseUrl } from "@/lib/api-base";
import { mentorReply } from "@/lib/scoring";
import { usePathora } from "@/lib/store";
import { DIMENSION_META, type AssessmentResult } from "@/lib/types";

type Message = {
  id: string;
  role: "user" | "mentor";
  text: string;
  source?: "ai" | "local";
};

function welcomeMessages(result: AssessmentResult | null): Message[] {
  return [
    {
      id: "welcome",
      role: "mentor",
      source: "local",
      text: result
        ? `Hi ${result.student.name.split(/\s+/)[0] || "there"}. I can explain your matches, compare two courses, or point you to skills worth starting. Your course ranking always comes from the rule-based engine; the wording here may be AI-assisted when the server has a provider configured.\n\nYour strongest dimensions are ${result.topDimensions
            .map((dimension) => DIMENSION_META[dimension].short)
            .join(", ")}.`
        : "Hi. I am the Pathora guide. I can explain how courses in the catalog differ, but I cannot personalise advice until you complete the assessment. You can still ask about any course, eligibility or career path.",
    },
  ];
}

export default function MentorPage() {
  const result = usePathora((state) => state.result);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => welcomeMessages(result));
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const suggestions = result
    ? [
        `Why was ${result.matches.find((m) => m.eligible)?.course.name ?? "BCA"} recommended?`,
        `What skills should I start learning?`,
        `What if I choose ${result.matches.filter((m) => m.eligible)[1]?.course.name ?? "BBA"} instead of ${result.matches.find((m) => m.eligible)?.course.name ?? "BCA"}?`,
        `I am still undecided.`,
      ]
    : [
        "What is the difference between BCA and B.Tech CSE?",
        "Is B.Des open to PCM students?",
        "Which courses suit a Commerce student?",
      ];

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || thinking) return;
    setMessages((current) => [...current, { id: `u-${Date.now()}`, role: "user", text: clean }]);
    setInput("");
    setThinking(true);

    const localAnswer = mentorReply(clean, result);
    let reply = localAnswer;
    let source: Message["source"] = "local";

    if (result) {
      try {
        const response = await fetch(`${apiBaseUrl()}/api/mentor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: clean.slice(0, 300),
            profile: result.profile,
            stream: result.student.stream,
            archetype: result.archetype.title,
            completedCount: result.completedCount,
            matches: result.matches
              .filter((match) => match.eligible)
              .slice(0, 4)
              .map((match) => ({
                slug: match.course.slug,
                label: match.label,
                explanation: match.explanation,
              })),
          }),
          signal: AbortSignal.timeout(15_000),
        });
        if (response.ok) {
          const data = (await response.json()) as { text?: unknown };
          if (typeof data.text === "string" && data.text.trim().length > 0) {
            reply = data.text.trim();
            source = "ai";
          }
        }
      } catch {
        // The deterministic local answer is the fallback when AI is unavailable.
      }
    }

    setMessages((current) => [
      ...current,
      { id: `m-${Date.now()}`, role: "mentor", text: reply, source },
    ]);
    setThinking(false);
  }

  return (
    <main>
      <section className="border-b border-midnight/[0.07] bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-4 px-5 py-7 sm:px-8 sm:py-12">
          <div>
            <p className="eyebrow">Career mentor</p>
            <h1 className="display mt-2 text-3xl leading-[1.05] text-midnight sm:text-[2.5rem]">
              Ask better questions about your future.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-ink">
              A grounded guide, not an oracle. Course ranking and eligibility always come from fixed
              rules. When an AI provider is configured server-side, it rewrites the explanation from
              your profile and the catalog; otherwise a deterministic local engine answers.
            </p>
          </div>
          <span className="chip">
            <Sparkles className="size-3.5 text-orange" aria-hidden="true" />
            Grounded · AI optional
          </span>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="card flex h-[calc(100dvh-12rem)] min-h-[440px] flex-col overflow-hidden md:h-auto md:min-h-[560px]">
          <div className="flex items-center justify-between border-b border-midnight/[0.07] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="relative grid size-8 place-items-center rounded-full bg-orange/12 text-orange">
                <Compass className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold text-midnight">Pathora guide</p>
                <p className="text-[0.62rem] text-slate-ink">Grounded in your profile</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[0.62rem] font-semibold text-[light-dark(#0f6252,#5fd8c4)]">
              <span className="size-1.5 rounded-full bg-[light-dark(#1F9D8B,#4FD1BE)]" />
              online
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <span
                  className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
                    message.role === "user" ? "bg-navy text-white" : "bg-orange/12 text-orange"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Compass className="size-3.5" aria-hidden="true" />
                  )}
                </span>
                <div
                  className={`max-w-[82%] min-w-0 break-words whitespace-pre-line rounded-2xl px-3.5 py-3 text-[0.82rem] leading-relaxed md:max-w-[86%] md:px-4 ${
                    message.role === "user"
                      ? "bg-navy text-white"
                      : "bg-arctic text-midnight"
                  }`}
                >
                  {message.text}
                  {message.role === "mentor" && message.source && (
                    <span className="mt-2 flex items-center gap-1 text-[0.58rem] font-semibold uppercase tracking-wide text-slate-ink">
                      <Sparkles className="size-2.5 text-orange" aria-hidden="true" />
                      {message.source === "ai"
                        ? "AI wording · grounded in catalog data"
                        : "Explainable local answer"}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-2.5 text-slate-ink">
                <span className="grid size-7 place-items-center rounded-full bg-orange/12 text-orange">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                </span>
                <span className="rounded-2xl bg-arctic px-4 py-3 text-[0.78rem]">
                  Checking your profile and the catalog…
                </span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-midnight/[0.07] px-4 pb-4 pt-3">
            <div className="m-scroll-x hide-scrollbar mb-3 flex gap-1.5 overflow-x-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-midnight/10 bg-surface px-3.5 text-[0.66rem] font-semibold text-slate-ink transition hover:border-orange hover:text-orange md:min-h-0 md:py-1.5"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about a course, career or your matches…"
                aria-label="Your question"
                maxLength={300}
                className="flex-1 rounded-full border border-midnight/10 bg-arctic px-4 py-2.5 text-sm text-midnight outline-none transition placeholder:text-slate-ink/50 focus:border-orange focus:bg-surface"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-orange text-white transition hover:bg-[#f25a24] disabled:opacity-40 md:size-10"
                aria-label="Send question"
              >
                <Send className="size-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[0.6rem] text-slate-ink">
              Guidance only. Verify eligibility, fees and admission rules with institutions.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          {result ? (
            <>
              <div className="card p-5">
                <p className="eyebrow">Your context</p>
                <p className="display mt-2 text-lg text-midnight">{result.archetype.title}</p>
                <p className="mt-1 text-[0.7rem] text-slate-ink">
                  {result.student.stream || "No stream set"} · {result.completedCount}/10 answered
                </p>
                <div className="mt-2">
                  <InterestRadar profile={result.profile} height={190} />
                </div>
                <Link
                  href="/results"
                  className="inline-flex min-h-11 items-center gap-1 text-[0.7rem] font-bold text-orange hover:underline md:min-h-0"
                >
                  Full results
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
              <div className="card p-5">
                <p className="eyebrow">Top eligible matches</p>
                <div className="mt-2.5 space-y-1.5">
                  {result.matches
                    .filter((match) => match.eligible)
                    .slice(0, 4)
                    .map((match) => (
                      <Link
                        key={match.course.slug}
                        href={`/courses/${match.course.slug}`}
                        className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-[0.76rem] font-semibold text-midnight transition hover:bg-arctic md:min-h-0"
                      >
                        {match.course.name}
                        <span className="text-[0.58rem] font-bold uppercase tracking-wide text-orange">
                          {match.label}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card p-5">
              <p className="eyebrow">No profile yet</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-ink">
                Without your answers I can only describe courses in general. Complete the quest for
                answers about your own fit.
              </p>
              <Link href="/discover" className="btn btn-primary mt-4 w-full !py-2.5 !text-xs">
                Start the assessment
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}
          <div className="rounded-2xl border border-dashed border-midnight/15 p-4">
            <p className="text-[0.62rem] font-bold uppercase tracking-wide text-slate-ink">
              What this is not
            </p>
            <p className="mt-1.5 text-[0.68rem] leading-relaxed text-slate-ink">
              Not a substitute for a counsellor. AI is used only to rephrase explanations — never to
              rank courses or change eligibility. It is instructed not to invent cut-offs, fees or
              placement statistics, and the local answer takes over if it is unavailable.
            </p>
          </div>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
