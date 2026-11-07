"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Database,
  Download,
  Loader2,
  Save,
  TriangleAlert,
} from "lucide-react";
import {
  apiErrorMessage,
  fetchQuestionBank,
  importQuestionBank,
  updateCoreQuestion,
  updateStreamQuestion,
} from "@/lib/api";
import { apiBaseUrl } from "@/lib/api-base";
import { QUESTIONS } from "@/lib/questions";
import { STREAM_QUESTIONS } from "@/lib/stream-questions";
import {
  DIMENSIONS,
  STREAMS,
  type Dimension,
  type Question,
  type Stream,
  type StreamQuestion,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════════
   QUESTION EDITOR

   The highest-stakes screen in the admin area. A stage-1 option's weights ARE
   the interest profile — a careless edit does not error, it quietly changes
   what every future student is told about themselves. So the weights are shown
   as explicit numbered inputs rather than hidden behind the text, and the
   warning says plainly what they do.

   Edits are per question and explicit: nothing saves until Save is pressed.
   ══════════════════════════════════════════════════════════════════════════ */

const OPTION_ICONS = [
  "code", "palette", "wrench", "rocket", "users", "sigma",
  "compass", "blocks", "chart", "pen", "cpu", "briefcase",
] as const;

type Status = { kind: "idle" | "saving" | "saved" | "error"; message?: string };

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[0.58rem] font-bold uppercase tracking-wide text-slate-ink">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-midnight/12 bg-arctic px-3 py-2 text-[0.8rem] text-midnight outline-none transition focus:border-orange focus:bg-surface";

export default function AdminQuestionsPage() {
  const [tab, setTab] = useState<"core" | Stream>("core");
  const [core, setCore] = useState<Question[]>([]);
  const [stream, setStream] = useState<Record<string, StreamQuestion[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [importing, setImporting] = useState(false);
  const [importNote, setImportNote] = useState<string | null>(null);

  const base = apiBaseUrl();

  // No synchronous setState anywhere in here: the first statement awaits, so
  // every state write happens after the effect has finished. A sync write
  // inside an effect triggers a cascading render.
  const load = useCallback(async () => {
    try {
      const response = await fetchQuestionBank(base);
      setLoadError(null);
      setCore((response.core ?? []) as Question[]);
      setStream((response.stream ?? {}) as Record<string, StreamQuestion[]>);
    } catch (error) {
      setLoadError(apiErrorMessage(error).message);
    } finally {
      setLoading(false);
    }
  }, [base]);

  // An inline promise chain, not `void load()`: the lint rule flags an effect
  // that calls any function which transitively sets state, even when every
  // write happens after an await. The chain makes the asynchrony explicit.
  useEffect(() => {
    let cancelled = false;
    fetchQuestionBank(base)
      .then((response) => {
        if (cancelled) return;
        setCore((response.core ?? []) as Question[]);
        setStream((response.stream ?? {}) as Record<string, StreamQuestion[]>);
        setLoadError(null);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(apiErrorMessage(error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [base]);

  const empty = core.length === 0 && Object.values(stream).every((list) => list.length === 0);

  async function runImport(replace: boolean) {
    setImporting(true);
    setImportNote(null);
    try {
      // The defaults live in the bundle, so the client posts them. Keeping one
      // copy of the content means the two can never drift apart.
      const result = (await importQuestionBank(base, {
        core: QUESTIONS,
        stream: STREAMS.flatMap((name) => STREAM_QUESTIONS[name]),
        replace,
      })) as { imported?: { core?: { inserted: number }; stream?: { inserted: number } } };
      const added =
        (result.imported?.core?.inserted ?? 0) + (result.imported?.stream?.inserted ?? 0);
      setImportNote(
        replace
          ? "Defaults restored. Any edits to those questions were overwritten."
          : `Import complete. ${added} question${added === 1 ? "" : "s"} added; existing edits were left alone.`,
      );
      await load();
    } catch (error) {
      setImportNote(apiErrorMessage(error).message);
    } finally {
      setImporting(false);
    }
  }

  function mark(id: string, next: Status) {
    setStatus((current) => ({ ...current, [id]: next }));
  }

  async function saveCore(question: Question) {
    mark(question.id, { kind: "saving" });
    try {
      await updateCoreQuestion(base, question.id, {
        kicker: question.kicker,
        title: question.title,
        description: question.description,
        measures: question.measures,
        options: question.options.map((option) => ({
          id: option.id,
          label: option.label,
          detail: option.detail,
          icon: option.icon,
          weights: option.weights,
          feedback: option.feedback,
          ...(option.preference ? { preference: option.preference } : {}),
        })),
      });
      mark(question.id, { kind: "saved" });
    } catch (error) {
      mark(question.id, { kind: "error", message: apiErrorMessage(error).message });
    }
  }

  async function saveStream(question: StreamQuestion) {
    mark(question.id, { kind: "saving" });
    try {
      await updateStreamQuestion(base, question.id, {
        subject: question.subject,
        kicker: question.kicker,
        title: question.title,
        prompt: question.prompt,
        explanation: question.explanation,
        correctId: question.correctId,
        options: question.options.map((option) => ({
          id: option.id,
          label: option.label,
          emoji: option.emoji,
        })),
      });
      mark(question.id, { kind: "saved" });
    } catch (error) {
      mark(question.id, { kind: "error", message: apiErrorMessage(error).message });
    }
  }

  function patchCore(id: string, patch: Partial<Question>) {
    setCore((list) => list.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    mark(id, { kind: "idle" });
  }

  function patchStream(key: string, id: string, patch: Partial<StreamQuestion>) {
    setStream((all) => ({
      ...all,
      [key]: (all[key] ?? []).map((q) => (q.id === id ? { ...q, ...patch } : q)),
    }));
    mark(id, { kind: "idle" });
  }

  const visible = useMemo(() => (tab === "core" ? [] : (stream[tab] ?? [])), [tab, stream]);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <h1 className="display text-2xl text-midnight">Question bank</h1>
      <p className="mt-2 max-w-2xl text-[0.86rem] leading-relaxed text-slate-ink">
        The questions students answer, stored in the database. Students fall back to the built-in
        bank whenever the server is unreachable, so an outage here never stops an assessment.
      </p>

      {/* ── Import ──────────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-midnight/[0.08] bg-surface p-4">
        <p className="flex items-center gap-2 text-[0.8rem] font-bold text-midnight">
          <Database className="size-4 text-orange" aria-hidden="true" />
          Built-in defaults
        </p>
        <p className="mt-1.5 text-[0.76rem] leading-relaxed text-slate-ink">
          {empty
            ? "The database has no questions yet. Import the built-in bank to start editing."
            : "Import adds anything missing and leaves your edits alone. Restore overwrites edited questions with the originals."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => void runImport(false)}
            disabled={importing}
            className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[0.8rem] font-bold disabled:opacity-50"
          >
            {importing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            Import built-in questions
          </button>
          {!empty && (
            <button
              type="button"
              onClick={() => void runImport(true)}
              disabled={importing}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-midnight/12 bg-surface px-5 text-[0.8rem] font-bold text-midnight transition hover:border-orange hover:text-orange disabled:opacity-50"
            >
              <TriangleAlert className="size-4" aria-hidden="true" />
              Restore defaults (overwrites edits)
            </button>
          )}
        </div>
        {importNote && (
          <p className="mt-2.5 text-[0.76rem] font-semibold text-midnight">{importNote}</p>
        )}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="mt-7 flex flex-wrap gap-2">
        {(["core", ...STREAMS] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.8rem] font-bold transition md:min-h-0 md:py-2",
              tab === key
                ? "border-orange bg-peach text-orange"
                : "border-midnight/12 bg-surface text-slate-ink hover:border-midnight/25",
            )}
          >
            {key === "core" ? "Stage 1 · interests" : key}
            <span className="text-[0.7rem] font-semibold opacity-70">
              {key === "core" ? core.length : (stream[key]?.length ?? 0)}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <p className="mt-6 flex items-center gap-2 text-[0.8rem] text-slate-ink">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading the bank…
        </p>
      )}
      {loadError && !loading && (
        <p className="mt-6 flex items-start gap-2 rounded-xl border border-orange/25 bg-orange/10 px-3 py-2.5 text-[0.78rem] font-semibold text-orange">
          <AlertCircle className="mt-px size-4 shrink-0" aria-hidden="true" />
          {loadError}
        </p>
      )}

      {/* ── Stage 1 ─────────────────────────────────────────────────────── */}
      {!loading && tab === "core" && (
        <div className="mt-5 space-y-3">
          {core.map((question) => {
            const open = openId === question.id;
            const state = status[question.id] ?? { kind: "idle" };
            return (
              <div
                key={question.id}
                className="overflow-hidden rounded-2xl border border-midnight/[0.08] bg-surface"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : question.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-peach text-[0.7rem] font-bold text-orange">
                    {question.number}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[0.84rem] font-semibold text-midnight">
                    {question.title}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn("size-4 shrink-0 text-slate-ink transition-transform", open && "rotate-180")}
                  />
                </button>

                {open && (
                  <div className="border-t border-midnight/[0.07] px-4 py-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Labelled label="Kicker">
                        <input
                          className={inputClass}
                          value={question.kicker}
                          onChange={(e) => patchCore(question.id, { kicker: e.target.value })}
                        />
                      </Labelled>
                      <Labelled label="Measures">
                        <input
                          className={inputClass}
                          value={question.measures}
                          onChange={(e) => patchCore(question.id, { measures: e.target.value })}
                        />
                      </Labelled>
                    </div>
                    <div className="mt-3">
                      <Labelled label="Question">
                        <textarea
                          rows={2}
                          className={inputClass}
                          value={question.title}
                          onChange={(e) => patchCore(question.id, { title: e.target.value })}
                        />
                      </Labelled>
                    </div>
                    <div className="mt-3">
                      <Labelled label="Description">
                        <textarea
                          rows={2}
                          className={inputClass}
                          value={question.description}
                          onChange={(e) => patchCore(question.id, { description: e.target.value })}
                        />
                      </Labelled>
                    </div>

                    <p className="mt-5 flex items-start gap-2 rounded-xl bg-[light-dark(#FFF7E6,#2a2010)] px-3 py-2 text-[0.72rem] leading-relaxed text-[light-dark(#8a5b00,#FFD98A)]">
                      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                      These weights are the interest profile. Changing them changes what every
                      future student is told about themselves — and it will not look like an error,
                      it will just be different.
                    </p>

                    <div className="mt-3 space-y-3">
                      {question.options.map((option, index) => (
                        <div key={option.id} className="rounded-xl bg-arctic p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-orange text-[0.65rem] font-bold text-white">
                              {option.id}
                            </span>
                            <input
                              className={cn(inputClass, "mt-0 min-w-0 flex-1")}
                              value={option.label}
                              onChange={(e) => {
                                const options = [...question.options];
                                options[index] = { ...option, label: e.target.value };
                                patchCore(question.id, { options });
                              }}
                            />
                            <select
                              className={cn(inputClass, "mt-0 w-auto")}
                              value={option.icon}
                              onChange={(e) => {
                                const options = [...question.options];
                                options[index] = {
                                  ...option,
                                  icon: e.target.value as Question["options"][number]["icon"],
                                };
                                patchCore(question.id, { options });
                              }}
                            >
                              {OPTION_ICONS.map((icon) => (
                                <option key={icon} value={icon}>
                                  {icon}
                                </option>
                              ))}
                            </select>
                          </div>
                          <input
                            className={inputClass}
                            placeholder="Detail line"
                            value={option.detail}
                            onChange={(e) => {
                              const options = [...question.options];
                              options[index] = { ...option, detail: e.target.value };
                              patchCore(question.id, { options });
                            }}
                          />
                          <input
                            className={inputClass}
                            placeholder="Feedback shown after choosing"
                            value={option.feedback}
                            onChange={(e) => {
                              const options = [...question.options];
                              options[index] = { ...option, feedback: e.target.value };
                              patchCore(question.id, { options });
                            }}
                          />
                          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                            {DIMENSIONS.map((dimension) => (
                              <Labelled key={dimension} label={dimension.slice(0, 7)}>
                                <input
                                  type="number"
                                  min={-20}
                                  max={20}
                                  className={inputClass}
                                  value={option.weights[dimension as Dimension] ?? ""}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    const weights = { ...option.weights };
                                    if (raw === "") delete weights[dimension as Dimension];
                                    else weights[dimension as Dimension] = Number(raw);
                                    const options = [...question.options];
                                    options[index] = { ...option, weights };
                                    patchCore(question.id, { options });
                                  }}
                                />
                              </Labelled>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <SaveRow state={state} onSave={() => void saveCore(question)} />
                  </div>
                )}
              </div>
            );
          })}
          {core.length === 0 && !loadError && (
            <p className="text-[0.8rem] text-slate-ink">
              No stage 1 questions in the database yet. Import the built-in bank above.
            </p>
          )}
        </div>
      )}

      {/* ── Stream rounds ───────────────────────────────────────────────── */}
      {!loading && tab !== "core" && (
        <div className="mt-5 space-y-3">
          {visible.map((question) => {
            const open = openId === question.id;
            const state = status[question.id] ?? { kind: "idle" };
            return (
              <div
                key={question.id}
                className="overflow-hidden rounded-2xl border border-midnight/[0.08] bg-surface"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : question.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="shrink-0 rounded-full bg-fog px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-indigo">
                    {question.subject}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[0.84rem] font-semibold text-midnight">
                    {question.title}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn("size-4 shrink-0 text-slate-ink transition-transform", open && "rotate-180")}
                  />
                </button>

                {open && (
                  <div className="border-t border-midnight/[0.07] px-4 py-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Labelled label="Subject">
                        <input
                          className={inputClass}
                          value={question.subject}
                          onChange={(e) => patchStream(tab, question.id, { subject: e.target.value })}
                        />
                      </Labelled>
                      <Labelled label="Kicker">
                        <input
                          className={inputClass}
                          value={question.kicker}
                          onChange={(e) => patchStream(tab, question.id, { kicker: e.target.value })}
                        />
                      </Labelled>
                    </div>
                    <div className="mt-3">
                      <Labelled label="Question">
                        <textarea
                          rows={2}
                          className={inputClass}
                          value={question.title}
                          onChange={(e) => patchStream(tab, question.id, { title: e.target.value })}
                        />
                      </Labelled>
                    </div>
                    <div className="mt-3">
                      <Labelled label="Prompt">
                        <textarea
                          rows={2}
                          className={inputClass}
                          value={question.prompt}
                          onChange={(e) => patchStream(tab, question.id, { prompt: e.target.value })}
                        />
                      </Labelled>
                    </div>

                    <p className="mt-4 text-[0.6rem] font-bold uppercase tracking-wide text-slate-ink">
                      Options — select the correct one
                    </p>
                    <div className="mt-2 space-y-2">
                      {question.options.map((option, index) => (
                        <div key={option.id} className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => patchStream(tab, question.id, { correctId: option.id })}
                            aria-pressed={question.correctId === option.id}
                            title="Mark as the correct answer"
                            className={cn(
                              "grid size-7 shrink-0 place-items-center rounded-full border text-[0.65rem] font-bold transition",
                              question.correctId === option.id
                                ? "border-transparent bg-[color:light-dark(#1f9d8b,#3fbfa8)] text-white"
                                : "border-midnight/15 bg-surface text-slate-ink hover:border-orange",
                            )}
                          >
                            {question.correctId === option.id ? (
                              <Check className="size-3.5" strokeWidth={4} aria-hidden="true" />
                            ) : (
                              option.id
                            )}
                          </button>
                          <input
                            className={cn(inputClass, "mt-0 w-16 shrink-0 text-center")}
                            value={option.emoji}
                            onChange={(e) => {
                              const options = [...question.options];
                              options[index] = { ...option, emoji: e.target.value };
                              patchStream(tab, question.id, { options });
                            }}
                          />
                          <input
                            className={cn(inputClass, "mt-0 min-w-0 flex-1")}
                            value={option.label}
                            onChange={(e) => {
                              const options = [...question.options];
                              options[index] = { ...option, label: e.target.value };
                              patchStream(tab, question.id, { options });
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <Labelled label="Explanation shown after answering">
                        <textarea
                          rows={2}
                          className={inputClass}
                          value={question.explanation}
                          onChange={(e) =>
                            patchStream(tab, question.id, { explanation: e.target.value })
                          }
                        />
                      </Labelled>
                    </div>

                    <SaveRow state={state} onSave={() => void saveStream(question)} />
                  </div>
                )}
              </div>
            );
          })}
          {visible.length === 0 && !loadError && (
            <p className="text-[0.8rem] text-slate-ink">
              No questions stored for {tab} yet. Import the built-in bank above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SaveRow({ state, onSave }: { state: Status; onSave: () => void }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-midnight/[0.07] pt-3">
      <button
        type="button"
        onClick={onSave}
        disabled={state.kind === "saving"}
        className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[0.8rem] font-bold disabled:opacity-50"
      >
        {state.kind === "saving" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="size-4" aria-hidden="true" />
        )}
        Save question
      </button>
      {state.kind === "saved" && (
        <span className="inline-flex items-center gap-1.5 text-[0.76rem] font-bold text-[color:light-dark(#0f6252,#5fd8c4)]">
          <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
          Saved
        </span>
      )}
      {state.kind === "error" && (
        <span className="inline-flex items-start gap-1.5 text-[0.76rem] font-semibold text-orange">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {state.message}
        </span>
      )}
    </div>
  );
}
