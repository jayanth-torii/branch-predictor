"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  submissionFromResult,
  courseDemand,
  interestDistribution,
} from "./batches";
import { QUESTIONS } from "./questions";
import { summariseStreamQuiz } from "./stream-questions";
import { apiErrorMessage, createSubmission } from "./api";
import { buildResult } from "./scoring";
import type {
  AdminData,
  AssessmentResult,
  Batch,
  Question,
  Student,
  StreamQuestion,
  Submission,
} from "./types";

const QUESTION_XP = 100;

/**
 * The dashboard starts empty and fills from the API. `seeded: false` says the
 * rows are real, so the UI can tell "nobody has finished yet" apart from
 * "the server has not answered yet".
 */
const EMPTY_ADMIN: AdminData = { batches: [], submissions: [], seeded: false };

type PathoraState = {
  student: Student;
  answers: Record<string, string>;
  currentIndex: number;
  xp: number;
  /** Stage 2 (stream quiz) state. Kept separate from `answers` so the interest
      profile can never be computed from a right/wrong question. */
  streamAnswers: Record<string, string>;
  streamIndex: number;
  result: AssessmentResult | null;
  lastFeedback: string | null;
  admin: AdminData;
  adminHydrated: boolean;
  adminSyncError: string | null;
  apiBase: string | null;
  /**
   * The question banks the student is actually sitting, when they came from
   * the database. Null means the bundled banks are in play. Held here so
   * `finishAssessment` can score against what was SHOWN rather than whatever
   * the bundle contains — once staff can edit weights, those two can differ.
   */
  activeCoreBank: Question[] | null;
  activeStreamBank: StreamQuestion[] | null;
  setQuestionBanks: (core: Question[] | null, stream: StreamQuestion[] | null) => void;
  setStudent: (patch: Partial<Student>) => void;
  joinBatch: (code: string) => void;
  attachResultToBatch: (code: string) => void;
  selectAnswer: (questionId: string, optionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  skipQuestion: () => void;
  resetAssessment: () => void;
  answerStreamQuestion: (questionId: string, optionId: string) => void;
  nextStreamQuestion: () => void;
  resetStreamQuiz: () => void;
  finishAssessment: () => AssessmentResult;
  addBatch: (name: string, code: string, institution: string, capacity: number) => void;
  clearAdminData: () => void;
  resetEverything: () => void;
  setAdminData: (batches: Batch[], submissions: Submission[]) => void;
  setAdminHydrated: (value: boolean) => void;
  setAdminSyncError: (error: string | null) => void;
  setApiBase: (base: string | null) => void;
};

const initialStudent: Student = {
  name: "",
  areaOfInterest: "",
  stream: "",
  puYear: "",
  marksBand: "",
  language: "English",
};

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export const usePathora = create<PathoraState>()(
  persist(
    (set, get) => ({
      student: initialStudent,
      answers: {},
      currentIndex: 0,
      xp: 0,
      streamAnswers: {},
      streamIndex: 0,
      result: null,
      lastFeedback: null,
      // Empty on purpose. This used to be `buildSeedData()`, which fabricated
      // 18 students so the dashboard looked populated before anyone had used
      // the product. An educator could not tell those rows from real ones.
      admin: EMPTY_ADMIN,
      adminHydrated: false,
      adminSyncError: null,
      apiBase: null,
      activeCoreBank: null,
      activeStreamBank: null,

      setQuestionBanks: (core, stream) =>
        set(() => ({ activeCoreBank: core, activeStreamBank: stream })),

      setStudent: (patch) => set((state) => ({ student: { ...state.student, ...patch } })),

      joinBatch: (code) =>
        set((state) => ({
          student: { ...state.student, batchCode: code.trim().toUpperCase() },
        })),

      attachResultToBatch: (code) => {
        const { student, result } = get();
        const normalized = code.trim().toUpperCase();
        if (!result || !normalized) return;
        const { activeCoreBank, activeStreamBank } = get();
        const submission = submissionFromResult(
          result,
          normalized,
          activeCoreBank ?? QUESTIONS,
          activeStreamBank ?? undefined,
        );
        set({
          student: { ...student, batchCode: normalized },
          admin: {
            ...get().admin,
            submissions: [...get().admin.submissions.filter((s) => s.id !== submission.id), submission],
          },
        });
      },

      selectAnswer: (questionId, optionId) =>
        set((state) => {
          const question = QUESTIONS.find((q) => q.id === questionId);
          const option = question?.options.find((o) => o.id === optionId);
          const alreadyAnswered = Boolean(state.answers[questionId]);
          return {
            answers: { ...state.answers, [questionId]: optionId },
            xp: state.xp + (alreadyAnswered ? 0 : QUESTION_XP),
            lastFeedback: option?.feedback ?? null,
          };
        }),

      /**
       * Stage 2. An answer is locked once given — re-answering the same question
       * would let a student fish for the celebration, which turns a learning
       * moment into a slot machine. XP is awarded for answering, never for being
       * right: the reward loop is the emoji path, not the score.
       */
      answerStreamQuestion: (questionId, optionId) =>
        set((state) =>
          state.streamAnswers[questionId]
            ? state
            : {
                streamAnswers: { ...state.streamAnswers, [questionId]: optionId },
                xp: state.xp + QUESTION_XP,
              },
        ),

      nextStreamQuestion: () => set((state) => ({ streamIndex: state.streamIndex + 1 })),

      resetStreamQuiz: () => set(() => ({ streamAnswers: {}, streamIndex: 0 })),

      goToQuestion: (index) =>
        set(() => ({ currentIndex: Math.max(0, Math.min(QUESTIONS.length - 1, index)) })),

      nextQuestion: () =>
        set((state) => ({ currentIndex: Math.min(QUESTIONS.length - 1, state.currentIndex + 1) })),

      skipQuestion: () =>
        set((state) => ({ currentIndex: Math.min(QUESTIONS.length - 1, state.currentIndex + 1), lastFeedback: null })),

      resetAssessment: () =>
        set(() => ({
          answers: {},
          currentIndex: 0,
          xp: 0,
          streamAnswers: {},
          streamIndex: 0,
          result: null,
          lastFeedback: null,
        })),

      finishAssessment: () => {
        const { student, answers, xp, apiBase, streamAnswers, activeCoreBank, activeStreamBank } =
          get();
        // Stage 2 is attached to the result for display only. It is computed
        // AFTER buildResult so it cannot reach the profile or the ranking.
        const result = {
          ...buildResult(student, answers, xp, activeCoreBank ?? QUESTIONS),
          streamQuiz: summariseStreamQuiz(student.stream, streamAnswers, activeStreamBank ?? undefined),
        };
        const submission = submissionFromResult(
          result,
          student.batchCode ?? "",
          activeCoreBank ?? QUESTIONS,
          activeStreamBank ?? undefined,
        );
        const isSampleOnly = !student.batchCode;
        set((state) => ({
          result,
          admin: isSampleOnly
            ? state.admin
            : {
                ...state.admin,
                submissions: [
                  ...state.admin.submissions.filter((s) => s.id !== submission.id),
                  submission,
                ],
              },
        }));

        // Sent for every student, batch or no batch. `isSampleOnly` still
        // governs the LOCAL admin cache above, but it must not govern
        // persistence: a student who never used a join code is still a
        // student, and the dashboard is meant to hold all of them.
        if (apiBase) {
          syncSubmissionToBackend(apiBase, submission).catch(() => {
            /* best-effort: the local result is already correct */
          });
        }

        return result;
      },

      addBatch: (name, code, institution, capacity) =>
        set((state) => {
          const normalized = code.trim().toUpperCase();
          if (!normalized || state.admin.batches.some((b) => b.code === normalized)) {
            return state;
          }
          const batch: Batch = {
            id: makeId("batch"),
            name: name.trim() || normalized,
            code: normalized,
            institution: institution.trim() || "Unassigned institution",
            capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 30,
            createdAt: new Date().toISOString(),
          };
          return { admin: { ...state.admin, batches: [...state.admin.batches, batch] }, adminHydrated: false };
        }),

      clearAdminData: () =>
        set((state) => ({
          admin: { ...state.admin, submissions: state.admin.submissions.filter((s) => s.sample) },
        })),

      resetEverything: () =>
        set(() => ({
          student: initialStudent,
          answers: {},
          currentIndex: 0,
          xp: 0,
          result: null,
          lastFeedback: null,
        })),

      setAdminData: (batches, submissions) =>
        // `seeded: false` — these rows came from the API, so they are real.
        set(() => ({
          admin: { batches, submissions, seeded: false },
          adminHydrated: true,
          adminSyncError: null,
        })),

      setAdminHydrated: (value) => set(() => ({ adminHydrated: value })),

      setAdminSyncError: (error) => set(() => ({ adminSyncError: error })),

      setApiBase: (base) => set(() => ({ apiBase: base })),
    }),
    {
      name: "pathora-ai-v1",
      version: 2,
      /**
       * v1 shipped 18 fabricated students inside every browser's localStorage.
       * Bumping the version without this would make zustand DISCARD the whole
       * persisted blob, taking each student's real profile, answers and XP
       * with it. So: keep everything, drop only the fake rows.
       */
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<PathoraState>;
        if (version >= 2) return state;
        return {
          ...state,
          admin: {
            batches: state.admin?.batches ?? [],
            // Seeded submissions are flagged `sample`. Anything a real student
            // produced locally is kept.
            submissions: (state.admin?.submissions ?? []).filter((s) => !s.sample),
            seeded: false,
          },
        };
      },
    },
  ),
);

export type DemandEntry = { slug: string; name: string; count: number };

async function syncSubmissionToBackend(base: string | null, submission: Submission) {
  try {
    await createSubmission(base, submission);
  } catch (error) {
    const message = apiErrorMessage(error).message;
    if (message !== "Backend not configured") {
      console.debug("[pathora] failed to sync assessment result to the backend:", message);
    }
  }
}

export function storeCourseForAdmin(batches: Batch[], submissions: Submission[]): { topCourse: DemandEntry | null; demand: DemandEntry[] } {
  const demand = courseDemand(submissions).slice(0, 6);
  return {
    topCourse: demand[0] ? { slug: demand[0].slug, name: demand[0].name, count: demand[0].count } : null,
    demand,
  };
}

export function storeDistributionForAdmin(submissions: Submission[]) {
  return interestDistribution(submissions);
}
