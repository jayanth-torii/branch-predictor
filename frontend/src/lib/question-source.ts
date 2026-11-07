"use client";

import { useEffect, useState } from "react";
import { fetchQuestionBank } from "@/lib/api";
import { apiBaseUrl } from "@/lib/api-base";
import { QUESTIONS } from "@/lib/questions";
import { STREAM_QUESTIONS } from "@/lib/stream-questions";
import { STREAMS, type Question, type Stream, type StreamQuestion } from "@/lib/types";

/* ══════════════════════════════════════════════════════════════════════════
   Where the questions come from.

   The TypeScript banks stay in the bundle and remain the DEFAULT content.
   They are the offline fallback and the thing the admin screen imports into
   Mongo. Once a bank exists in the database, the database wins.

   The fallback is not a nicety: a student mid-assessment when the API blinks
   must not lose the question in front of them, and the app is meant to work
   with no backend configured at all.
   ══════════════════════════════════════════════════════════════════════════ */

export type QuestionBank = {
  core: Question[];
  stream: Record<Stream, StreamQuestion[]>;
  /** "bundled" until the server answers; "server" once it has. */
  source: "bundled" | "server";
  loading: boolean;
};

const BUNDLED: Pick<QuestionBank, "core" | "stream"> = {
  core: QUESTIONS,
  stream: STREAM_QUESTIONS,
};

/**
 * A server bank is only used when it is actually usable.
 *
 * An empty collection, or a question with fewer than two options, would hand
 * the student a dead screen. In that case the bundled bank is kept and the
 * server's version ignored — a broken edit must not be able to take the
 * assessment down.
 */
function usable(core: Question[], stream: Record<string, StreamQuestion[]>): boolean {
  if (core.length === 0) return false;
  if (core.some((q) => !q.title || !Array.isArray(q.options) || q.options.length < 2)) return false;
  const anyStream = Object.values(stream).some((list) => list.length > 0);
  if (!anyStream) return false;
  return !Object.values(stream)
    .flat()
    .some((q) => !q.title || !Array.isArray(q.options) || q.options.length < 2);
}

export function useQuestionBank(): QuestionBank {
  const [bank, setBank] = useState<QuestionBank>({
    ...BUNDLED,
    source: "bundled",
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    const base = apiBaseUrl();

    // The no-backend case goes through the same rejected promise as a network
    // failure rather than setting state synchronously here: a synchronous
    // setState inside an effect triggers a cascading re-render, and both cases
    // want exactly the same outcome anyway — keep the bundled bank.
    const request = base
      ? fetchQuestionBank(base)
      : Promise.reject(new Error("Backend not configured"));

    request
      .then((response) => {
        if (cancelled) return;
        const core = (response.core ?? []) as Question[];
        const raw = (response.stream ?? {}) as Record<string, StreamQuestion[]>;
        const stream = Object.fromEntries(
          STREAMS.map((name) => [name, raw[name] ?? []]),
        ) as Record<Stream, StreamQuestion[]>;

        if (!usable(core, stream)) {
          setBank({ ...BUNDLED, source: "bundled", loading: false });
          return;
        }
        setBank({ core, stream, source: "server", loading: false });
      })
      .catch(() => {
        // No backend, offline, or a server fault: the bundled bank carries on.
        if (!cancelled) setBank({ ...BUNDLED, source: "bundled", loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return bank;
}
