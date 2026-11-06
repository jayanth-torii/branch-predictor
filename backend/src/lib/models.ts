import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { DIMENSIONS, STREAMS } from "./domain.js";

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

const submissionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "", trim: true, maxlength: 80 },
    stream: { type: String, enum: [...STREAMS, ""], default: "" },
    puYear: { type: String, enum: ["1st PU", "2nd PU", ""], default: "" },
    batchCode: { type: String, required: true, uppercase: true, trim: true, index: true },
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
