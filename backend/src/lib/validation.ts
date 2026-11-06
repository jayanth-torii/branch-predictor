import { z, type ZodObject } from "zod";
import { DIMENSIONS, STREAMS } from "./domain.js";

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

export const submissionCreateSchema = z.strictObject({
  id: submissionIdSchema,
  name: z.string().max(80, { message: "Student name is too long." }),
  stream: z.union([z.enum(STREAMS), z.literal("")]),
  puYear: z.union([z.enum(["1st PU", "2nd PU"]), z.literal("")]),
  batchCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(batchCodeRe, { message: "Batch code is invalid." }),
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
