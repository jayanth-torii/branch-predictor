import { Router } from "express";
import { z } from "zod";

import { BatchModel } from "../lib/models.js";
import { isAdminRequest } from "../lib/auth.js";
import { batchInputSchema } from "../lib/validation.js";
import { dbError, unauthorized, notFound, conflict, badRequest } from "../lib/http.js";

export const batchesRouter = Router();

/**
 * Mounted at /api/batches. The old Next routes were
 * /api/batches (route.ts) and /api/batches/[code] ([code]/route.ts); the
 * dynamic segment becomes the ":code" param below.
 */

type BatchShape = {
  id: string;
  name: string;
  code: string;
  institution: string;
  createdAt: string;
  capacity: number;
  sample: boolean;
};

/**
 * Drops Mongo internals (_id, __v) before a batch goes over the wire.
 *
 * `sample` is NOT an internal and is deliberately kept: the dashboard renders a
 * "sample" badge from it, the PDF export labels sample rows, and the store
 * filters on it. An earlier version stripped it here, so a batch silently lost
 * its badge after a create or an edit until the page was reloaded.
 *
 * Every handler that returns a batch runs it through this, so the list, the
 * single lookup, the create and the edit cannot disagree about the shape.
 */
function sanitizeBatch(doc: Partial<BatchShape> & { _id?: unknown }): BatchShape {
  return {
    id: doc.id ?? "",
    name: doc.name ?? "",
    code: doc.code ?? "",
    institution: doc.institution ?? "",
    createdAt: doc.createdAt ?? "",
    capacity: doc.capacity ?? 0,
    sample: doc.sample ?? false,
  };
}

/**
 * express.json() has already parsed the body and rejects malformed JSON before
 * a handler runs, so this only has to catch valid-but-unusable payloads.
 */
function isJsonObject(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}

/** GET /api/batches — public list, used by the join screen and the dashboard. */
batchesRouter.get("/", async (_req, res) => {
  try {
    const batches = await BatchModel.find({}).sort({ createdAt: 1 }).lean();
    return res.json({ batches: (batches ?? []).map(sanitizeBatch) });
  } catch (error) {
    return dbError(res, error);
  }
});

/** POST /api/batches — create a batch. Admin only. */
batchesRouter.post("/", async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized(res);
    }
    if (!isJsonObject(req.body)) {
      return badRequest(res, "The request body must be valid JSON.");
    }

    const parsed = batchInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, parsed.error.issues[0]?.message ?? "Invalid batch data.");
    }

    const code = parsed.data.code.toUpperCase();
    // Codes are the join key students type in, so a collision is a conflict,
    // not a silent overwrite.
    const existing = await BatchModel.findOne({ code }).lean();
    if (existing) {
      return conflict(res, `A batch with code ${code} already exists.`);
    }

    const batch = await BatchModel.create({
      id: `batch-${Date.now().toString(36).slice(-8)}`,
      name: parsed.data.name.trim(),
      code,
      institution: parsed.data.institution.trim(),
      capacity: parsed.data.capacity,
      createdAt: new Date().toISOString(),
      sample: false,
    });

    return res.status(201).json({ batch: sanitizeBatch(batch), status: "created" });
  } catch (error) {
    return dbError(res, error);
  }
});

/** DELETE /api/batches — delete by code supplied in the body. Admin only. */
batchesRouter.delete("/", async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized(res);
    }
    if (!isJsonObject(req.body)) {
      return badRequest(res, "The request body must be valid JSON.");
    }

    const parsed = z
      .object({
        code: z.string().trim().toUpperCase(),
      })
      .safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, parsed.error.issues[0]?.message ?? "Invalid request body.");
    }

    const deleted = await BatchModel.deleteOne({ code: parsed.data.code });
    if (deleted.deletedCount === 0) {
      return notFound(res);
    }
    return res.json({ deleted: true });
  } catch (error) {
    return dbError(res, error);
  }
});

/**
 * Patch body for PATCH /api/batches/:code. The Next handler imported zod
 * lazily inside the handler to keep its bundle small; a long-lived Express
 * process has no such constraint, so the schema is built once at module load.
 */
const batchUpdateSchema = z
  .object({
    name: z.string().max(80).optional(),
    institution: z.string().max(120).optional(),
    capacity: z.number().int().min(1).max(5000).optional(),
  })
  .strict();

/** GET /api/batches/:code — look up a single batch by its join code. */
batchesRouter.get("/:code", async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const batch = await BatchModel.findOne({ code }).lean();
    if (!batch) return notFound(res);
    return res.json({ batch: sanitizeBatch(batch) });
  } catch (error) {
    return dbError(res, error);
  }
});

/** PATCH /api/batches/:code — edit name, institution or capacity. Admin only. */
batchesRouter.patch("/:code", async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized(res);
    }

    const code = req.params.code.trim().toUpperCase();
    const existing = await BatchModel.findOne({ code }).lean();
    if (!existing) return notFound(res);

    if (!isJsonObject(req.body)) {
      return badRequest(res, "The request body must be valid JSON.");
    }

    const parsed = batchUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, parsed.error.issues[0]?.message ?? "Invalid fields.");
    }

    const updated = await BatchModel.findOneAndUpdate({ code }, parsed.data, {
      new: true,
    }).lean();
    // Lost the race with a concurrent delete between the two queries.
    if (!updated) return notFound(res);

    return res.json({ batch: sanitizeBatch(updated) });
  } catch (error) {
    return dbError(res, error);
  }
});

/** DELETE /api/batches/:code — delete by code in the path. Admin only. */
batchesRouter.delete("/:code", async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized(res);
    }
    const code = req.params.code.trim().toUpperCase();
    const deletedBatch = await BatchModel.deleteOne({ code });
    if (deletedBatch.deletedCount === 0) {
      return notFound(res);
    }
    return res.json({ deleted: true });
  } catch (error) {
    return dbError(res, error);
  }
});
