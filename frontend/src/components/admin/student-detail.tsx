"use client";

import { useMemo } from "react";
import { BadgeCheck, Check, Info, TriangleAlert, X } from "lucide-react";
import { QUESTIONS } from "@/lib/questions";
import { STREAM_QUESTIONS } from "@/lib/stream-questions";
import { DIMENSION_META, type Dimension, type Stream, type Submission } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════════
   What one student actually did.

   Everything here comes from `submission.detail`, which is written by
   `submissionFromResult` and stored whole. Nothing is recomputed — if the
   engine's rules change tomorrow, this still shows what the student was told
   on the day, which is the only version worth auditing.
   ══════════════════════════════════════════════════════════════════════════ */

const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.58rem] font-bold uppercase tracking-wide text-slate-ink">{label}</p>
      <p className="mt-0.5 text-[0.76rem] font-semibold text-midnight">{value || "—"}</p>
    </div>
  );
}

function Heading({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-midnight/[0.07] pt-4 first:mt-0 first:border-0 first:pt-0">
      <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-midnight">{children}</p>
      {note && <p className="text-[0.62rem] text-slate-ink">{note}</p>}
    </div>
  );
}

export function StudentDetail({ submission }: { submission: Submission }) {
  const detail = submission.detail;

  const streamBank = useMemo(() => {
    const stream = submission.stream as Stream | "";
    if (!stream) return {};
    return Object.fromEntries((STREAM_QUESTIONS[stream] ?? []).map((q) => [q.id, q]));
  }, [submission.stream]);

  if (!detail) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-[0.7rem] leading-relaxed text-slate-ink">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        This record was stored before full answers were captured, so only the profile summary above
        is available for it. Newer submissions carry the complete detail.
      </p>
    );
  }

  /**
   * Prefer the snapshot taken when the student answered.
   *
   * Resolving ids against the live bank is only a fallback for rows stored
   * before snapshots existed — and it is a lossy one: if staff have since
   * rewritten a question, that path renders today's wording against a past
   * student's choice, which misrepresents what they actually picked. Anything
   * shown that way is labelled below.
   */
  const snapshot = detail.answerDetail ?? [];
  const answered =
    snapshot.length > 0
      ? snapshot.map((entry) => ({ ...entry, fromSnapshot: true }))
      : Object.entries(detail.answers).map(([questionId, optionId]) => {
          const question = QUESTION_BY_ID[questionId];
          const option = question?.options.find((o) => o.id === optionId);
          return {
            questionId,
            questionTitle: question?.title ?? "",
            optionId,
            optionLabel: option?.label ?? "",
            optionDetail: option?.detail ?? "",
            fromSnapshot: false,
          };
        });

  const streamSnapshot = detail.streamQuiz?.answerDetail ?? [];
  const streamAnswers =
    streamSnapshot.length > 0
      ? streamSnapshot.map((entry) => ({ ...entry, fromSnapshot: true }))
      : Object.entries(detail.streamQuiz?.answers ?? {}).map(([questionId, optionId]) => {
          const question = streamBank[questionId];
          const chosen = question?.options.find((o) => o.id === optionId);
          const correct = question?.options.find((o) => o.id === question.correctId);
          return {
            questionId,
            subject: question?.subject ?? "",
            questionTitle: question?.title ?? "",
            optionId,
            optionLabel: chosen?.label ?? "",
            correctId: question?.correctId ?? "",
            correctLabel: correct?.label ?? "",
            correct: Boolean(question) && optionId === question?.correctId,
            fromSnapshot: false,
          };
        });

  const anyLive =
    answered.some((a) => !a.fromSnapshot) || streamAnswers.some((a) => !a.fromSnapshot);

  return (
    <div className="rounded-2xl border border-midnight/[0.08] bg-surface p-4">
      {anyLive && (
        <p className="mb-4 flex items-start gap-2 rounded-xl bg-[light-dark(#FFF7E6,#2a2010)] px-3 py-2 text-[0.7rem] leading-relaxed text-[light-dark(#8a5b00,#FFD98A)]">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          This record predates answer snapshots, so the wording below is read from the current
          question bank. If those questions have been edited since, the text shown may not be what
          this student actually saw.
        </p>
      )}
      <Heading>Onboarding &amp; narrative</Heading>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Area of interest" value={detail.areaOfInterest} />
        <Field label="Marks band" value={detail.marksBand} />
        <Field label="Preferred language" value={detail.language} />
        <Field label="Stage 1 answered" value={`${detail.completedCount} of ${QUESTIONS.length}`} />
        <Field label="Archetype" value={submission.archetype} />
        <Field label="Learning style" value={detail.learningStyle} />
        <Field
          label="Dimensions, ranked"
          value={detail.topDimensions
            .map((d) => DIMENSION_META[d as Dimension]?.short ?? d)
            .join(" · ")}
        />
        <Field label="XP" value={String(submission.xp)} />
      </div>
      {detail.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {detail.badges.map((badge) => (
            <span key={badge} className="chip chip-xs !px-2 !py-0.5">
              <BadgeCheck className="size-3 text-orange" aria-hidden="true" />
              {badge}
            </span>
          ))}
        </div>
      )}
      {(detail.perspective || detail.goal) && (
        <div className="mt-3 space-y-1.5">
          {detail.perspective && (
            <p className="text-[0.74rem] leading-relaxed text-slate-ink">{detail.perspective}</p>
          )}
          {detail.goal && (
            <p className="text-[0.74rem] leading-relaxed text-slate-ink">{detail.goal}</p>
          )}
        </div>
      )}

      {/* ── Stage 1 ──────────────────────────────────────────────────────── */}
      <Heading note="Interest questions have no right answer — these set the profile above.">
        Stage 1 · what they chose
      </Heading>
      <ol className="mt-3 space-y-2.5">
        {answered.map((entry) => (
          <li key={entry.questionId} className="rounded-xl bg-arctic px-3 py-2.5">
            <p className="text-[0.7rem] font-semibold text-midnight">
              {entry.questionTitle || entry.questionId}
            </p>
            <p className="mt-1 text-[0.72rem] text-slate-ink">
              <span className="font-bold text-orange">{entry.optionLabel || entry.optionId}</span>
              {entry.optionDetail ? ` — ${entry.optionDetail}` : ""}
            </p>
          </li>
        ))}
        {answered.length === 0 && (
          <li className="text-[0.7rem] text-slate-ink">No stage 1 answers recorded.</li>
        )}
      </ol>

      {/* ── Stage 2 ──────────────────────────────────────────────────────── */}
      {detail.streamQuiz && (
        <>
          <Heading
            note={`${detail.streamQuiz.correctCount} of ${detail.streamQuiz.total} correct. This round never touches the interest profile or the ranking.`}
          >
            Stage 2 · {submission.stream || "stream"} round
          </Heading>
          <ol className="mt-3 space-y-2.5">
            {streamAnswers.map((entry) => {
              const right = entry.correctId ? entry.correct : null;
              return (
                <li key={entry.questionId} className="rounded-xl bg-arctic px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-white",
                        right === null
                          ? "bg-slate-ink"
                          : right
                            ? "bg-[color:light-dark(#1f9d8b,#3fbfa8)]"
                            : "bg-orange",
                      )}
                    >
                      {right ? (
                        <Check className="size-2.5" strokeWidth={4} />
                      ) : (
                        <X className="size-2.5" strokeWidth={4} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.7rem] font-semibold text-midnight">
                        {entry.questionTitle || entry.questionId}
                        {entry.subject ? (
                          <span className="ml-2 text-[0.6rem] font-bold uppercase tracking-wide text-slate-ink">
                            {entry.subject}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-[0.72rem] text-slate-ink">
                        Chose{" "}
                        <span className="font-bold text-midnight">
                          {entry.optionLabel || entry.optionId}
                        </span>
                        {right === false && entry.correctLabel ? (
                          <>
                            {" · correct was "}
                            <span className="font-bold text-midnight">{entry.correctLabel}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
            {streamAnswers.length === 0 && (
              <li className="text-[0.7rem] text-slate-ink">No stream answers recorded.</li>
            )}
          </ol>
        </>
      )}

      {/* ── The ranking ──────────────────────────────────────────────────── */}
      <Heading note="The complete ranked list the student was shown, with the engine's own reasoning.">
        Course matches · {detail.matches.length}
      </Heading>
      <div className="mt-3 space-y-2.5">
        {detail.matches.map((match) => (
          <div
            key={match.slug}
            className={cn(
              "rounded-xl border px-3 py-2.5",
              match.eligible ? "border-midnight/[0.08] bg-arctic" : "border-orange/25 bg-peach/40",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-[0.74rem] font-bold text-midnight">{match.name || match.slug}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="chip chip-xs !px-2 !py-0.5">{match.label}</span>
                <span className="text-[0.62rem] font-semibold tabular-nums text-slate-ink">
                  score {Math.round(match.finalScore)}
                  {match.aspirationBonus
                    ? ` (interest ${Math.round(match.interestScore)} + ${Math.round(match.aspirationBonus)} stated)`
                    : ""}
                </span>
              </div>
            </div>
            <p className="mt-1 text-[0.72rem] leading-relaxed text-slate-ink">{match.explanation}</p>
            {!match.eligible && (
              <p className="mt-1 text-[0.66rem] font-semibold text-orange">
                Outside the usual subject requirements for {submission.stream || "their stream"}.
              </p>
            )}
            {!match.marksFit && match.marksNote && (
              <p className="mt-1 text-[0.66rem] leading-relaxed text-slate-ink">
                <span className="font-bold">Marks flag:</span> {match.marksNote}
              </p>
            )}
            {match.dimensionReasons.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {match.dimensionReasons.map((reason) => (
                  <span
                    key={reason.dimension}
                    className="rounded-full bg-surface px-2 py-0.5 text-[0.6rem] font-semibold text-slate-ink"
                  >
                    {DIMENSION_META[reason.dimension]?.short ?? reason.dimension}{" "}
                    <span className="tabular-nums text-midnight">
                      {Math.round(reason.strength)}
                    </span>
                    {" vs needs "}
                    <span className="tabular-nums text-midnight">
                      {Math.round(reason.courseNeed)}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {detail.topCareers.length > 0 && (
        <>
          <Heading>Careers they marked</Heading>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {detail.topCareers.map((career) => (
              <span key={career.slug} className="chip chip-xs !px-2 !py-0.5">
                {career.title || career.slug}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
