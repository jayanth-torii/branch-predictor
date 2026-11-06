import { CAREER_BY_SLUG } from "@/lib/careers";
import { COURSE_BY_SLUG } from "@/lib/courses";
import { QUESTIONS } from "@/lib/questions";
import { buildResult, sortedDimensions } from "@/lib/scoring";
import type {
  AdminData,
  AssessmentResult,
  Batch,
  Dimension,
  InterestProfile,
  Stream,
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

type SeedStudent = {
  name: string;
  stream: Stream;
  puYear: "1st PU" | "2nd PU";
  focus: Dimension;
  batchCode: string;
  day: number;
  undecided?: boolean;
  skipOne?: boolean;
};

const SEED_STUDENTS: SeedStudent[] = [
  { name: "Aarav Shetty", stream: "PCMC", puYear: "2nd PU", focus: "technology", batchCode: "PTH-2027", day: 12 },
  { name: "Meera Nair", stream: "PCMB", puYear: "2nd PU", focus: "creativity", batchCode: "PTH-2027", day: 11 },
  { name: "Rohan Kulkarni", stream: "PCM", puYear: "1st PU", focus: "engineering", batchCode: "PTH-2027", day: 11 },
  { name: "Sana Fatima", stream: "Commerce", puYear: "2nd PU", focus: "business", batchCode: "PTH-C27", day: 10 },
  { name: "Aditi Rao", stream: "PCMB", puYear: "2nd PU", focus: "communication", batchCode: "PTH-2027", day: 9 },
  { name: "Karthik Menon", stream: "PCMC", puYear: "1st PU", focus: "analytical", batchCode: "PTH-2027", day: 9 },
  { name: "Ishita Jain", stream: "Commerce", puYear: "2nd PU", focus: "business", batchCode: "PTH-C27", day: 8 },
  { name: "Nikhil Gowda", stream: "PCM", puYear: "2nd PU", focus: "technology", batchCode: "PTH-2026", day: 8 },
  { name: "Ananya Bhat", stream: "Arts/Humanities", puYear: "2nd PU", focus: "communication", batchCode: "PTH-2026", day: 7 },
  { name: "Yash Patel", stream: "PCMC", puYear: "1st PU", focus: "engineering", batchCode: "PTH-2027", day: 6 },
  { name: "Diya Sharma", stream: "PCMB", puYear: "2nd PU", focus: "creativity", batchCode: "PTH-2026", day: 5, undecided: true },
  { name: "Arjun Hegde", stream: "PCM", puYear: "2nd PU", focus: "analytical", batchCode: "PTH-2026", day: 5 },
  { name: "Riya D'Souza", stream: "Commerce", puYear: "1st PU", focus: "business", batchCode: "PTH-C27", day: 4 },
  { name: "Vihaan Reddy", stream: "PCMC", puYear: "2nd PU", focus: "technology", batchCode: "PTH-2027", day: 3 },
  { name: "Sneha Iyer", stream: "Commerce", puYear: "2nd PU", focus: "communication", batchCode: "PTH-C27", day: 3, skipOne: true },
  { name: "Tanvi Desai", stream: "PCMB", puYear: "1st PU", focus: "analytical", batchCode: "PTH-2027", day: 2 },
  { name: "Mohit Verma", stream: "PCM", puYear: "1st PU", focus: "engineering", batchCode: "PTH-2026", day: 2, undecided: true },
  { name: "Lakshmi Prasad", stream: "Arts/Humanities", puYear: "2nd PU", focus: "creativity", batchCode: "PTH-2026", day: 1 },
];

function seededAnswers(focus: Dimension, salt: number, undecided = false, skipOne = false) {
  const answers: Record<string, string> = {};
  QUESTIONS.forEach((question, index) => {
    if (skipOne && index === 6) return;
    if (question.number === 10 && undecided) {
      answers[question.id] = "G";
      return;
    }
    const scored = question.options
      .map((option) => ({
        id: option.id,
        weight: option.weights[focus] ?? 0,
      }))
      .sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
    const pool = scored.slice(0, 3);
    const choice = pool[(index + salt) % pool.length] ?? pool[0];
    answers[question.id] = choice.id;
  });
  return answers;
}

function toSubmission(result: AssessmentResult, day: number): Submission {
  const top = result.matches.find((m) => m.eligible) ?? result.matches[0];
  const topDimension = sortedDimensions(result.profile)[0];
  return {
    id: result.id,
    name: result.student.name,
    stream: result.student.stream,
    puYear: result.student.puYear,
    batchCode: result.student.batchCode ?? "",
    createdAt: new Date(Date.UTC(2026, 9, day, 10, 30)).toISOString(),
    profile: result.profile,
    archetype: result.archetype.title,
    topDimension,
    topCourseSlug: top?.course.slug ?? "",
    xp: result.xp,
    undecided: result.answers.q10 === "G",
    sample: true,
    eligibleCourses: result.matches.filter((m) => m.eligible).slice(0, 5).map((m) => m.course.slug),
    interestedCareers: result.topCareers.map((career) => career.slug),
  };
}

let cachedSeed: AdminData | null = null;

export function buildSeedData(): AdminData {
  if (cachedSeed) return cachedSeed;
  const submissions = SEED_STUDENTS.map((student, index) => {
    const answers = seededAnswers(student.focus, index % 3, student.undecided, student.skipOne);
    const completed = Object.keys(answers).length;
    const result = buildResult(
      {
        name: student.name,
        stream: student.stream,
        puYear: student.puYear,
        areaOfInterest: "",
        // Sample students carry no marks, so the marks gate stays a no-op for
        // them and the seeded dashboards look exactly as they did before.
        marksBand: "",
        language: "English",
        batchCode: student.batchCode,
      },
      answers,
      completed * 100 + (completed === 10 ? 150 : 0),
    );
    return toSubmission(result, student.day);
  });

  cachedSeed = { batches: SAMPLE_BATCHES, submissions, seeded: true };
  return cachedSeed;
}

export function submissionFromResult(result: AssessmentResult, batchCode: string): Submission {
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
