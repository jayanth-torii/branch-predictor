import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { DIMENSIONS, OPTION_ICONS, STREAMS } from "./domain.js";

const profileSchema = new Schema(
  {
    technology: { type: Number, required: true, min: 0, max: 100 },
    creativity: { type: Number, required: true, min: 0, max: 100 },
    engineering: { type: Number, required: true, min: 0, max: 100 },
    business: { type: Number, required: true, min: 0, max: 100 },
    communication: { type: Number, required: true, min: 0, max: 100 },
    analytical: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false },
);

const batchSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    institution: { type: String, required: true, trim: true, maxlength: 120 },
    capacity: { type: Number, required: true, min: 1, max: 5000 },
    createdAt: { type: String, required: true, index: true },
    sample: { type: Boolean, default: false },
  },
  { versionKey: false },
);

/**
 * The full record of one student's run.
 *
 * `answers` and `streamQuiz.answers` are Mixed, not Map, on purpose: a Mongoose
 * Map comes back from `.lean()` as a JS Map, which `JSON.stringify` renders as
 * `{}` — every answer would be silently dropped on the way to the client.
 *
 * `_id: false` on the subdocuments keeps Mongo from minting an ObjectId for
 * every match row.
 */
const submissionDetailSchema = new Schema(
  {
    areaOfInterest: { type: String, default: "" },
    marksBand: { type: String, default: "" },
    language: { type: String, default: "" },
    completedCount: { type: Number, default: 0 },
    archetypeKey: { type: String, default: "" },
    learningStyle: { type: String, default: "" },
    perspective: { type: String, default: "" },
    goal: { type: String, default: "" },
    badges: { type: [String], default: [] },
    topDimensions: { type: [String], default: [] },
    answers: { type: Schema.Types.Mixed, default: {} },
    answerDetail: { type: Schema.Types.Mixed, default: [] },
    streamQuiz: {
      type: new Schema(
        {
          answers: { type: Schema.Types.Mixed, default: {} },
          answerDetail: { type: Schema.Types.Mixed, default: [] },
          correctCount: { type: Number, default: 0 },
          total: { type: Number, default: 0 },
        },
        { _id: false },
      ),
      default: undefined,
    },
    matches: {
      type: [
        new Schema(
          {
            slug: { type: String, default: "" },
            name: { type: String, default: "" },
            label: { type: String, default: "" },
            interestScore: { type: Number, default: 0 },
            aspirationBonus: { type: Number, default: 0 },
            finalScore: { type: Number, default: 0 },
            eligible: { type: Boolean, default: false },
            marksFit: { type: Boolean, default: true },
            marksNote: { type: String, default: "" },
            explanation: { type: String, default: "" },
            dimensionReasons: { type: Schema.Types.Mixed, default: [] },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    topCareers: {
      type: [new Schema({ slug: String, title: String }, { _id: false })],
      default: [],
    },
  },
  { _id: false },
);

const submissionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "", trim: true, maxlength: 80 },
    stream: { type: String, enum: [...STREAMS, ""], default: "" },
    puYear: { type: String, enum: ["1st PU", "2nd PU", ""], default: "" },
    // Not `required`: Mongoose treats "" as missing for a required String, and
    // a student who never joined a batch legitimately has no code.
    batchCode: { type: String, default: "", uppercase: true, trim: true, index: true },
    createdAt: { type: String, required: true, index: true },
    profile: { type: profileSchema, required: true },
    archetype: { type: String, default: "", maxlength: 80 },
    topDimension: { type: String, enum: DIMENSIONS, required: true },
    topCourseSlug: { type: String, default: "", maxlength: 80 },
    xp: { type: Number, default: 0, min: 0, max: 5000 },
    undecided: { type: Boolean, default: false },
    sample: { type: Boolean, default: false },
    eligibleCourses: { type: [String], default: [] },
    interestedCareers: { type: [String], default: [] },
    detail: { type: submissionDetailSchema, default: undefined },
  },
  { versionKey: false },
);

export type BatchDoc = InferSchemaType<typeof batchSchema>;
export type SubmissionDoc = InferSchemaType<typeof submissionSchema>;

const globalForModels = globalThis as typeof globalThis & {
  __pathoraBatchModel?: Model<BatchDoc>;
  __pathoraSubmissionModel?: Model<SubmissionDoc>;
};

export const BatchModel =
  globalForModels.__pathoraBatchModel ??
  (mongoose.models.Batch as Model<BatchDoc> | undefined) ??
  mongoose.model<BatchDoc>("Batch", batchSchema);

export const SubmissionModel =
  globalForModels.__pathoraSubmissionModel ??
  (mongoose.models.Submission as Model<SubmissionDoc> | undefined) ??
  mongoose.model<SubmissionDoc>("Submission", submissionSchema);

globalForModels.__pathoraBatchModel = BatchModel;
globalForModels.__pathoraSubmissionModel = SubmissionModel;

/* ══════════════════════════════════════════════════════════════════════════
   QUESTION BANKS

   Both banks live in Mongo so staff can edit them. The TypeScript banks in the
   frontend remain the DEFAULT content and the offline fallback — they are
   imported into Mongo once, and from then on the database is the source of
   truth for anyone with a backend configured.

   `strict: false` is deliberately NOT set: an admin edit must not be able to
   smuggle unknown fields into a document the assessment then renders.
   ══════════════════════════════════════════════════════════════════════════ */

/** Dimension weights on a stage-1 option. These drive the entire interest profile. */
const weightsSchema = new Schema(
  Object.fromEntries(DIMENSIONS.map((d) => [d, { type: Number, min: -20, max: 20 }])),
  { _id: false, minimize: true },
);

const coreOptionSchema = new Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 8 },
    label: { type: String, required: true, trim: true, maxlength: 200 },
    detail: { type: String, default: "", trim: true, maxlength: 300 },
    icon: { type: String, enum: OPTION_ICONS, default: "compass" },
    weights: { type: weightsSchema, default: () => ({}) },
    feedback: { type: String, default: "", trim: true, maxlength: 300 },
    preference: { type: [String], default: undefined },
  },
  { _id: false },
);

const coreQuestionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    number: { type: Number, required: true, min: 1, max: 99 },
    kicker: { type: String, default: "", trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 400 },
    description: { type: String, default: "", trim: true, maxlength: 400 },
    measures: { type: String, default: "", trim: true, maxlength: 200 },
    options: { type: [coreOptionSchema], default: [] },
    updatedAt: { type: String, default: "" },
  },
  { versionKey: false },
);

const streamOptionSchema = new Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 8 },
    label: { type: String, required: true, trim: true, maxlength: 300 },
    emoji: { type: String, default: "", maxlength: 16 },
  },
  { _id: false },
);

const streamQuestionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    stream: { type: String, enum: STREAMS, required: true, index: true },
    subject: { type: String, default: "", trim: true, maxlength: 60 },
    kicker: { type: String, default: "", trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 400 },
    prompt: { type: String, default: "", trim: true, maxlength: 600 },
    options: { type: [streamOptionSchema], default: [] },
    correctId: { type: String, required: true, trim: true, maxlength: 8 },
    explanation: { type: String, default: "", trim: true, maxlength: 800 },
    updatedAt: { type: String, default: "" },
  },
  { versionKey: false },
);

export type CoreQuestionDoc = InferSchemaType<typeof coreQuestionSchema>;
export type StreamQuestionDoc = InferSchemaType<typeof streamQuestionSchema>;

const globalForQuestions = globalThis as typeof globalThis & {
  __pathoraCoreQuestionModel?: Model<CoreQuestionDoc>;
  __pathoraStreamQuestionModel?: Model<StreamQuestionDoc>;
};

export const CoreQuestionModel =
  globalForQuestions.__pathoraCoreQuestionModel ??
  (mongoose.models.CoreQuestion as Model<CoreQuestionDoc> | undefined) ??
  mongoose.model<CoreQuestionDoc>("CoreQuestion", coreQuestionSchema);

export const StreamQuestionModel =
  globalForQuestions.__pathoraStreamQuestionModel ??
  (mongoose.models.StreamQuestion as Model<StreamQuestionDoc> | undefined) ??
  mongoose.model<StreamQuestionDoc>("StreamQuestion", streamQuestionSchema);

globalForQuestions.__pathoraCoreQuestionModel = CoreQuestionModel;
globalForQuestions.__pathoraStreamQuestionModel = StreamQuestionModel;
