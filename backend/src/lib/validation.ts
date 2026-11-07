import { z, type ZodObject } from "zod";
import { DIMENSIONS, OPTION_ICONS, STREAMS } from "./domain.js";

const batchCodeRe = /^[A-Z0-9][A-Z0-9-]{2,23}$/;

/**
 * Submission ids are generated client-side as `pt-<base36 time>-<base36 seq>`
 * (see buildResult in the frontend's scoring.ts), so they contain hyphens.
 *
 * This previously paired /^[a-z0-9]{8,16}$/ with a `startsWith("res-")` check
 * — two rules that no string can satisfy at once, because the character class
 * forbids the hyphen the prefix requires. Every create was rejected. The
 * pattern now matches what the app actually produces, and DELETE imports the
 * same schema rather than restating it, so the two cannot drift apart again.
 *
 * It stays deliberately tight: lowercase alphanumerics and hyphens only, must
 * start alphanumeric, 8-40 characters. The id is used as an upsert filter, so
 * the charset excludes `$` and `.` — no operator or dotted-path injection.
 */
const submissionIdRe = /^[a-z0-9][a-z0-9-]{7,39}$/;

export const submissionIdSchema = z
  .string()
  .regex(submissionIdRe, { message: "Submission id is invalid." });

export const batchInputSchema = z.strictObject({
  name: z
    .string()
    .max(80, { message: "Batch name is too long." })
    .refine((name) => name.trim().length >= 2, {
      message: "Batch name is too short.",
    }),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .max(24, { message: "Batch code is too long." })
    .refine(
      (code) => batchCodeRe.test(code),
      { message: "Batch code must be 3–24 uppercase letters, digits or hyphens." },
    ),
  institution: z
    .string()
    .max(120, { message: "Institution name is too long." })
    .default(""),
  capacity: z.coerce.number().int().min(1).max(5000).default(30),
});

export type BatchInput = z.infer<typeof batchInputSchema>;

export const batchLookupSchema = z.object({
  code: z.string().trim().toUpperCase(),
});

const answerMapSchema = z.record(z.string().max(40), z.string().max(40));

const submissionDetailSchema = z.strictObject({
  areaOfInterest: z.string().max(60).default(""),
  marksBand: z.string().max(40).default(""),
  language: z.string().max(40).default(""),
  completedCount: z.number().int().min(0).max(100).default(0),
  archetypeKey: z.string().max(60).default(""),
  learningStyle: z.string().max(300).default(""),
  perspective: z.string().max(600).default(""),
  goal: z.string().max(600).default(""),
  badges: z.array(z.string().max(80)).max(20).default([]),
  topDimensions: z.array(z.enum(DIMENSIONS)).max(DIMENSIONS.length).default([]),
  answers: answerMapSchema.default({}),
  // The wording the student was shown, captured at answer time. Ids alone
  // stop being enough the moment staff can edit the bank.
  answerDetail: z
    .array(
      z.strictObject({
        questionId: z.string().max(40),
        questionTitle: z.string().max(400).default(""),
        optionId: z.string().max(8),
        optionLabel: z.string().max(300).default(""),
        optionDetail: z.string().max(400).default(""),
      }),
    )
    .max(100)
    .default([]),
  streamQuiz: z
    .strictObject({
      answers: answerMapSchema.default({}),
      answerDetail: z
        .array(
          z.strictObject({
            questionId: z.string().max(40),
            subject: z.string().max(60).default(""),
            questionTitle: z.string().max(400).default(""),
            optionId: z.string().max(8),
            optionLabel: z.string().max(300).default(""),
            correctId: z.string().max(8).default(""),
            correctLabel: z.string().max(300).default(""),
            correct: z.boolean().default(false),
          }),
        )
        .max(100)
        .default([]),
      correctCount: z.number().int().min(0).max(100).default(0),
      total: z.number().int().min(0).max(100).default(0),
    })
    .optional(),
  matches: z
    .array(
      z.strictObject({
        slug: z.string().max(80),
        name: z.string().max(160).default(""),
        label: z.string().max(40).default(""),
        interestScore: z.number().default(0),
        aspirationBonus: z.number().default(0),
        finalScore: z.number().default(0),
        eligible: z.boolean().default(false),
        marksFit: z.boolean().default(true),
        marksNote: z.string().max(400).default(""),
        explanation: z.string().max(1200).default(""),
        dimensionReasons: z
          .array(
            z.strictObject({
              dimension: z.enum(DIMENSIONS),
              strength: z.number(),
              courseNeed: z.number(),
            }),
          )
          .max(DIMENSIONS.length)
          .default([]),
      }),
    )
    .max(60)
    .default([]),
  topCareers: z
    .array(z.strictObject({ slug: z.string().max(80), title: z.string().max(160).default("") }))
    .max(20)
    .default([]),
});

export const submissionCreateSchema = z.strictObject({
  id: submissionIdSchema,
  name: z.string().max(80, { message: "Student name is too long." }),
  stream: z.union([z.enum(STREAMS), z.literal("")]),
  puYear: z.union([z.enum(["1st PU", "2nd PU"]), z.literal("")]),
  // Empty is allowed on purpose. Most students never join a batch, and the
  // dashboard is supposed to hold every student who finished — not only the
  // ones who happened to arrive through a join code.
  batchCode: z
    .string()
    .trim()
    .toUpperCase()
    .refine((code) => code === "" || batchCodeRe.test(code), {
      message: "Batch code is invalid.",
    }),
  createdAt: z
    .string()
    .datetime({ message: "Created at must be an ISO date." }),
  profile: z.strictObject({
    technology: z.number().int().min(0).max(100),
    creativity: z.number().int().min(0).max(100),
    engineering: z.number().int().min(0).max(100),
    business: z.number().int().min(0).max(100),
    communication: z.number().int().min(0).max(100),
    analytical: z.number().int().min(0).max(100),
  }),
  archetype: z.string().max(80).default(""),
  topDimension: z.enum(DIMENSIONS),
  topCourseSlug: z.string().max(80).default(""),
  xp: z.number().int().min(0).max(5000).default(0),
  undecided: z.boolean().default(false),
  eligibleCourses: z.array(z.string().max(120)).max(5, { message: "Too many eligible courses." }).default([]),
  interestedCareers: z.array(z.string().max(120)).max(10, { message: "Too many interested careers." }).default([]),
  /**
   * The complete record: what the student answered, the full ranked match list
   * with its reasoning, the stream round, and the onboarding fields the flat
   * summary above drops. Optional so a client that predates it still posts
   * successfully — the schema is strict, so without this entry the new field
   * would be rejected outright rather than ignored.
   *
   * Bounds are generous but real: the catalogue is 12 courses and stage 1 is
   * 10 questions, so these caps sit far above any honest payload while still
   * stopping someone posting a megabyte of junk.
   */
  detail: submissionDetailSchema.optional(),
});

export type SubmissionCreate = z.infer<typeof submissionCreateSchema>;

export const adminLoginSchema = z.object({
  passcode: z.string().max(200),
});

export const adminDataQuerySchema = z.object({
  latest: z.coerce.boolean().default(true),
});

export const submissionIdParamSchema = z.object({
  id: submissionIdSchema,
});

export const extractBatchCode = (params: Promise<{ code: string }>): Promise<string> =>
  params.then((p) => p.code.trim().toUpperCase());

/* ══════════════════════════════════════════════════════════════════════════
   QUESTION EDITING

   The riskiest surface in the product. A stage-1 option's `weights` ARE the
   interest profile — a bad edit does not throw, it quietly changes what every
   future student is told about themselves. So the bounds here are real:
   known dimensions only, a sane range, and at least two options per question
   so a question can never become unanswerable.
   ══════════════════════════════════════════════════════════════════════════ */

const optionIdSchema = z
  .string()
  .trim()
  .min(1, { message: "An option needs an id." })
  .max(8, { message: "Option ids are short, like A or B." });

export const coreQuestionUpdateSchema = z.strictObject({
  kicker: z.string().trim().max(80).optional(),
  title: z.string().trim().min(4, { message: "A question needs a title." }).max(400).optional(),
  description: z.string().trim().max(400).optional(),
  measures: z.string().trim().max(200).optional(),
  options: z
    .array(
      z.strictObject({
        id: optionIdSchema,
        label: z.string().trim().min(1, { message: "An option needs text." }).max(200),
        detail: z.string().trim().max(300).default(""),
        icon: z.enum(OPTION_ICONS).default("compass"),
        // Partial on purpose: an option usually touches two or three
        // dimensions, not all six.
        weights: z
          .partialRecord(z.enum(DIMENSIONS), z.number().min(-20).max(20))
          .default({}),
        feedback: z.string().trim().max(300).default(""),
        preference: z.array(z.string().trim().max(80)).max(10).optional(),
      }),
    )
    .min(2, { message: "A question needs at least two options." })
    .max(8, { message: "That is too many options for one question." })
    .optional(),
});

export const streamQuestionUpdateSchema = z
  .strictObject({
    subject: z.string().trim().max(60).optional(),
    kicker: z.string().trim().max(80).optional(),
    title: z.string().trim().min(4, { message: "A question needs a title." }).max(400).optional(),
    prompt: z.string().trim().max(600).optional(),
    explanation: z.string().trim().max(800).optional(),
    correctId: optionIdSchema.optional(),
    options: z
      .array(
        z.strictObject({
          id: optionIdSchema,
          label: z.string().trim().min(1, { message: "An option needs text." }).max(300),
          emoji: z.string().trim().max(16).default(""),
        }),
      )
      .min(2, { message: "A question needs at least two options." })
      .max(8, { message: "That is too many options for one question." })
      .optional(),
  })
  .refine(
    (data) => !(data.options && data.correctId) || data.options.some((o) => o.id === data.correctId),
    { message: "The correct answer must be one of the options.", path: ["correctId"] },
  );

/** Duplicate option ids would make an answer ambiguous forever. */
export function duplicateOptionId(options: { id: string }[]): string | null {
  const seen = new Set<string>();
  for (const option of options) {
    if (seen.has(option.id)) return option.id;
    seen.add(option.id);
  }
  return null;
}
