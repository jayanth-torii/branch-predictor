import { Router } from "express";
import { z } from "zod";

import { SubmissionModel, BatchModel } from "../lib/models.js";
import { ensureSeeded } from "../lib/seed.js";
import { isAdminRequest, clientKey } from "../lib/auth.js";
import { submissionCreateSchema } from "../lib/validation.js";
import { dbError, unauthorized, notFound, badRequest } from "../lib/http.js";

export const submissionsRouter = Router();

/** Mounted at /api/submissions — the old Next /api/submissions route.ts. */

/**
 * In-memory write throttle. A single student finishing an assessment issues
 * one POST, so 80/minute per address is generous for a classroom on shared
 * NAT while still blocking a scripted flood. Per-process on purpose: this is
 * abuse dampening, not a quota, and it must not need a shared store.
 */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 80;
const submissionAttempts = new Map<string, number[]>();

/** Only has to catch valid-but-unusable payloads; express.json() rejects the rest. */
function isJsonObject(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}

/** First value of a query parameter, ignoring repeats and nested objects. */
function queryString(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
}

/** GET /api/submissions — dashboard feed, optionally filtered by batch. Admin only. */
submissionsRouter.get("/", async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized(res);
    }
    await ensureSeeded();
    const batchCode = queryString(req.query.batchCode).toUpperCase();

    const query: Record<string, unknown> = {};
    if (batchCode) query.batchCode = batchCode;
    const submissions = await SubmissionModel.find(query).sort({ createdAt: -1 }).lean();

    return res.json({ submissions: submissions ?? [] });
  } catch {
    return dbError(res);
  }
});

/** POST /api/submissions — a finished assessment. Public, rate limited. */
submissionsRouter.post("/", async (req, res) => {
  try {
    const ip = clientKey(req);
    const now = Date.now();
    const recent =
      submissionAttempts.get(ip)?.filter((t) => now - t < RATE_LIMIT_WINDOW_MS) ?? [];
    if (recent.length >= RATE_LIMIT_MAX) {
      // `code` is part of the original payload; the frontend keys off it to
      // tell a throttle apart from a validation failure.
      return res.status(429).json({
        error: "Too many submissions from this address. Please wait a minute and try again.",
        code: "rate_limited",
      });
    }

    if (!isJsonObject(req.body)) {
      return badRequest(res, "The request body must be valid JSON.");
    }

    const parsed = submissionCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, parsed.error.issues[0]?.message ?? "Invalid submission data.");
    }

    const code = parsed.data.batchCode;
    const batch = await BatchModel.findOne({ code }).lean();
    if (!batch) {
      return badRequest(res, `No batch found for code ${code}.`);
    }
    if (
      batch.capacity > 0 &&
      (await SubmissionModel.countDocuments({ batchCode: code })) >= batch.capacity
    ) {
      return badRequest(res, `The batch ${code} has reached its capacity of ${batch.capacity}.`);
    }

    // Only a submission that got past validation counts against the window,
    // so a student retrying a rejected payload is not locked out.
    recent.push(now);
    submissionAttempts.set(ip, recent);
    if (submissionAttempts.size > 500) {
      for (const [key, times] of submissionAttempts) {
        if (!times.some((t) => now - t < RATE_LIMIT_WINDOW_MS)) submissionAttempts.delete(key);
      }
    }

    // Upsert, case-insensitively on id: a student who re-syncs the same local
    // result updates their row instead of creating a duplicate.
    const created = await SubmissionModel.findOneAndUpdate(
      { id: new RegExp(`^${parsed.data.id}$`, "i") },
      {
        $set: {
          name: parsed.data.name,
          stream: parsed.data.stream,
          puYear: parsed.data.puYear,
          batchCode: code,
          createdAt: parsed.data.createdAt,
          profile: parsed.data.profile,
          archetype: parsed.data.archetype,
          topDimension: parsed.data.topDimension,
          topCourseSlug: parsed.data.topCourseSlug,
          xp: parsed.data.xp,
          undecided: parsed.data.undecided,
          eligibleCourses: parsed.data.eligibleCourses,
          interestedCareers: parsed.data.interestedCareers,
          sample: false,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    return res.status(201).json({ submission: created ?? null });
  } catch {
    return dbError(res);
  }
});

/** DELETE /api/submissions?id=... — remove one student row. Admin only. */
submissionsRouter.delete("/", async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized(res);
    }

    const id = queryString(req.query.id).toLowerCase();
    if (!id) {
      return badRequest(res, "A submission id query parameter is required.");
    }

    const submissionIdSchema = z.string().regex(/^[a-z0-9]{8,16}$/);
    if (!submissionIdSchema.safeParse(id).success) {
      return badRequest(res, "The provided submission id is invalid.");
    }

    const deleted = await SubmissionModel.deleteOne({ id });
    if (deleted.deletedCount === 0) {
      return notFound(res);
    }
    return res.json({ deleted: true });
  } catch {
    return dbError(res);
  }
});
