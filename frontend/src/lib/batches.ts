import { CAREER_BY_SLUG } from "@/lib/careers";
import { QUESTIONS } from "@/lib/questions";
import { questionsForStream } from "@/lib/stream-questions";
import { COURSE_BY_SLUG } from "@/lib/courses";
import { sortedDimensions } from "@/lib/scoring";
import type {
  AssessmentResult,
  Batch,
  Dimension,
  InterestProfile,
  Question,
  StreamQuestion,
  Submission,
} from "@/lib/types";
import { DIMENSIONS } from "@/lib/types";

export const SAMPLE_BATCHES: Batch[] = [
  {
    id: "batch-pu-2027",
    name: "PU 2027 — Science",
    code: "PTH-2027",
    institution: "Sample PU College",
    createdAt: "2026-09-02T09:00:00.000Z",
    capacity: 48,
    sample: true,
  },
  {
    id: "batch-pu-2026",
    name: "PU 2026 — Science & Commerce",
    code: "PTH-2026",
    institution: "Sample PU College",
    createdAt: "2026-06-18T09:00:00.000Z",
    capacity: 36,
    sample: true,
  },
  {
    id: "batch-commerce-2027",
    name: "PU 2027 — Commerce",
    code: "PTH-C27",
    institution: "Sample PU College",
    createdAt: "2026-09-10T09:00:00.000Z",
    capacity: 30,
    sample: true,
  },
];

export function submissionFromResult(
  result: AssessmentResult,
  batchCode: string,
  // The banks the student actually sat. Passed in rather than imported so the
  // snapshot records the wording they were shown, even after staff edit it.
  coreBank: Question[] = QUESTIONS,
  streamBank?: StreamQuestion[],
): Submission {
  const top = result.matches.find((m) => m.eligible) ?? result.matches[0];
  return {
    id: result.id,
    name: result.student.name || "Anonymous explorer",
    stream: result.student.stream,
    puYear: result.student.puYear,
    batchCode,
    createdAt: result.createdAt,
    profile: result.profile,
    archetype: result.archetype.title,
    topDimension: sortedDimensions(result.profile)[0],
    topCourseSlug: top?.course.slug ?? "",
    xp: result.xp,
    undecided: result.answers.q10 === "G" || result.completedCount < 10,
    eligibleCourses: result.matches.filter((m) => m.eligible).slice(0, 5).map((m) => m.course.slug),
    interestedCareers: result.topCareers.map((career) => career.slug),
    detail: {
      areaOfInterest: result.student.areaOfInterest,
      marksBand: result.student.marksBand,
      language: result.student.language,
      completedCount: result.completedCount,
      archetypeKey: result.archetype.key,
      learningStyle: result.learningStyle,
      perspective: result.perspective,
      goal: result.goal,
      badges: result.badges,
      topDimensions: result.topDimensions,
      answers: result.answers,
      answerDetail: Object.entries(result.answers).map(([questionId, optionId]) => {
        const question = coreBank.find((q) => q.id === questionId);
        const option = question?.options.find((o) => o.id === optionId);
        return {
          questionId,
          questionTitle: question?.title ?? "",
          optionId,
          optionLabel: option?.label ?? "",
          optionDetail: option?.detail ?? "",
        };
      }),
      streamQuiz: result.streamQuiz
        ? {
            answers: result.streamQuiz.answers,
            answerDetail: Object.entries(result.streamQuiz.answers).map(
              ([questionId, optionId]) => {
                const bank = streamBank ?? questionsForStream(result.student.stream);
                const question = bank.find((q) => q.id === questionId);
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
                };
              },
            ),
            correctCount: result.streamQuiz.correctCount,
            total: result.streamQuiz.total,
          }
        : undefined,
      // The WHOLE ranked list, not the top five. The point of storing this is
      // being able to reconstruct exactly what the student was shown, which a
      // truncated list cannot do.
      matches: result.matches.map((m) => ({
        slug: m.course.slug,
        name: m.course.name,
        label: m.label,
        interestScore: m.interestScore,
        aspirationBonus: m.aspirationBonus,
        finalScore: m.finalScore,
        eligible: m.eligible,
        marksFit: m.marksFit,
        marksNote: m.marksNote,
        explanation: m.explanation,
        dimensionReasons: m.dimensionReasons,
      })),
      topCareers: result.topCareers.map((career) => ({ slug: career.slug, title: career.title })),
    },
  };
}

export function interestDistribution(submissions: Submission[]): {
  dimension: Dimension;
  label: string;
  count: number;
  percent: number;
}[] {
  const counts = Object.fromEntries(DIMENSIONS.map((d) => [d, 0])) as Record<Dimension, number>;
  for (const submission of submissions) {
    const profile: InterestProfile = submission.profile;
    const top = sortedDimensions(profile)[0];
    counts[top] += 1;
  }
  const total = submissions.length || 1;
  return DIMENSIONS.map((dimension) => ({
    dimension,
    label: dimension,
    count: counts[dimension],
    percent: Math.round((counts[dimension] / total) * 100),
  }));
}

export function batchStats(
  batch: Batch,
  submissions: Submission[],
): {
  total: number;
  completed: number;
  completionRate: number;
  dominant: Dimension | null;
  undecided: number;
  topCourse: string | null;
} {
  const inBatch = submissions.filter((s) => s.batchCode === batch.code);
  const distribution = interestDistribution(inBatch).sort((a, b) => b.count - a.count);
  const demands = courseDemand(inBatch);
  return {
    total: batch.capacity,
    completed: inBatch.length,
    completionRate: batch.capacity ? Math.round((inBatch.length / batch.capacity) * 100) : 0,
    dominant: distribution[0]?.count ? distribution[0].dimension : null,
    undecided: inBatch.filter((s) => s.undecided).length,
    topCourse: demands[0]?.name ?? null,
  };
}

export function courseDemand(
  submissions: Submission[],
): { slug: string; name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const submission of submissions) {
    if (!submission.topCourseSlug) continue;
    counts.set(submission.topCourseSlug, (counts.get(submission.topCourseSlug) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([slug, count]) => ({
      slug,
      name: COURSE_BY_SLUG[slug]?.name ?? slug,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function careerInterestCounts(
  submissions: Submission[],
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const submission of submissions) {
    for (const slug of submission.interestedCareers) {
      const career = CAREER_BY_SLUG[slug];
      if (!career) continue;
      counts.set(career.title, (counts.get(career.title) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
