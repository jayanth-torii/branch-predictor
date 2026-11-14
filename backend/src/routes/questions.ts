import { Router } from "express";
import { z } from "zod";

import { CoreQuestionModel, StreamQuestionModel } from "../lib/models.js";
import { isAdminRequest } from "../lib/auth.js";
import { STREAMS } from "../lib/domain.js";
import {
  coreQuestionUpdateSchema,
  duplicateOptionId,
  streamQuestionUpdateSchema,
} from "../lib/validation.js";
import { badRequest, dbError, notFound, unauthorized } from "../lib/http.js";

export const questionsRouter = Router();

/* ══════════════════════════════════════════════════════════════════════════
   Mounted at /api/questions.

   GET is PUBLIC and unauthenticated — students need the bank to sit the
   assessment, and it contains no personal data. Everything that writes is
   admin-only.

   The stage-1 `weights` are returned as-is because the frontend scores
   locally; they are the rules of the product, not a secret.
   ══════════════════════════════════════════════════════════════════════════ */

function strip<T extends Record<string, unknown>>(doc: T): Omit<T, "_id" | "__v"> {
  const { _id: _a, __v: _b, ...rest } = doc;
  return rest;
}

/** GET /api/questions — the whole bank, shaped the way the frontend holds it. */
questionsRouter.get("/", async (_req, res) => {
  try {
    const [core, stream] = await Promise.all([
      CoreQuestionModel.find({}).sort({ number: 1 }).lean(),
      StreamQuestionModel.find({}).lean(),
    ]);

    // Grouped by stream, with every stream present even when empty, so the
    // client never has to guard a missing key.
    const byStream: Record<string, unknown[]> = Object.fromEntries(
      STREAMS.map((name) => [name, [] as unknown[]]),
    );
    for (const question of stream) {
      (byStream[question.stream] ??= []).push(strip(question));
    }

    return res.json({
      core: core.map(strip),
      stream: byStream,
      counts: { core: core.length, stream: stream.length },
    });
  } catch (error) {
    return dbError(res, error);
  }
});

/**
 * POST /api/questions/import — seed the bank from the client's built-in
 * defaults. Admin only.
 *
 * The default content lives in the frontend's TypeScript banks, which are also
 * the offline fallback. Rather than duplicating all 85 questions into this
 * package (two copies that would drift), the admin screen posts them here once.
 *
 * `$setOnInsert` means a re-import never overwrites an edit a human has made;
 * it only fills in what is missing. `replace: true` is the explicit opt-in for
 * "discard my edits and restore the defaults".
 */
const importSchema = z.object({
  core: z.array(z.looseObject({ id: z.string().min(1) })).max(200).default([]),
  stream: z.array(z.looseObject({ id: z.string().min(1), stream: z.enum(STREAMS) })).max(500).default([]),
  replace: z.boolean().default(false),
});

questionsRouter.post("/import", async (req, res) => {
  try {
    if (!isAdminRequest(req)) return unauthorized(res);

    const parsed = importSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, parsed.error.issues[0]?.message ?? "Invalid question payload.");
    }
    const { core, stream, replace } = parsed.data;
    if (core.length === 0 && stream.length === 0) {
      return badRequest(res, "Nothing to import.");
    }

    const now = new Date().toISOString();
    const write = (rows: { id: string }[]) =>
      rows.map((row) => ({
        updateOne: {
          filter: { id: row.id },
          update: replace ? { $set: { ...row, updatedAt: now } } : { $setOnInsert: { ...row, updatedAt: now } },
          upsert: true,
        },
      }));

    const [coreResult, streamResult] = await Promise.all([
      core.length ? CoreQuestionModel.bulkWrite(write(core), { ordered: false }) : null,
      stream.length ? StreamQuestionModel.bulkWrite(write(stream), { ordered: false }) : null,
    ]);

    return res.json({
      imported: {
        core: { inserted: coreResult?.upsertedCount ?? 0, updated: coreResult?.modifiedCount ?? 0 },
        stream: {
          inserted: streamResult?.upsertedCount ?? 0,
          updated: streamResult?.modifiedCount ?? 0,
        },
      },
      replace,
    });
  } catch (error) {
    return dbError(res, error);
  }
});

/** PATCH /api/questions/core/:id — edit a stage-1 question. Admin only. */
questionsRouter.patch("/core/:id", async (req, res) => {
  try {
    if (!isAdminRequest(req)) return unauthorized(res);

    const parsed = coreQuestionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, parsed.error.issues[0]?.message ?? "Invalid question data.");
    }
    if (parsed.data.options) {
      const duplicate = duplicateOptionId(parsed.data.options);
      if (duplicate) {
        return badRequest(res, `Two options share the id "${duplicate}".`);
      }
    }

    const now = new Date().toISOString();
    const updated = await CoreQuestionModel.findOneAndUpdate(
      { id: req.params.id },
      // `editedAt` marks this row as human-edited, which is what stops the
      // deploy-time sync from overwriting it on the next release.
      { $set: { ...parsed.data, updatedAt: now, editedAt: now } },
      { new: true },
    ).lean();
    if (!updated) return notFound(res);

    return res.json({ question: strip(updated) });
  } catch (error) {
    return dbError(res, error);
  }
});

/** PATCH /api/questions/stream/:id — edit a stream question. Admin only. */
questionsRouter.patch("/stream/:id", async (req, res) => {
  try {
    if (!isAdminRequest(req)) return unauthorized(res);

    const parsed = streamQuestionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, parsed.error.issues[0]?.message ?? "Invalid question data.");
    }
    if (parsed.data.options) {
      const duplicate = duplicateOptionId(parsed.data.options);
      if (duplicate) {
        return badRequest(res, `Two options share the id "${duplicate}".`);
      }
    }

    const existing = await StreamQuestionModel.findOne({ id: req.params.id }).lean();
    if (!existing) return notFound(res);

    // A stream question is scored, so the correct answer must keep pointing at
    // an option that still exists. The schema catches this when both fields are
    // sent together; this catches editing one of them alone.
    const options = parsed.data.options ?? existing.options;
    const correctId = parsed.data.correctId ?? existing.correctId;
    if (!options.some((option) => option.id === correctId)) {
      return badRequest(res, "The correct answer must be one of the options.");
    }

    const now = new Date().toISOString();
    const updated = await StreamQuestionModel.findOneAndUpdate(
      { id: req.params.id },
      // `editedAt` marks this row as human-edited, which is what stops the
      // deploy-time sync from overwriting it on the next release.
      { $set: { ...parsed.data, updatedAt: now, editedAt: now } },
      { new: true },
    ).lean();
    if (!updated) return notFound(res);

    return res.json({ question: strip(updated) });
  } catch (error) {
    return dbError(res, error);
  }
});
