import type { Response } from "express";

/**
 * Response helpers, ported from the Next route handlers.
 *
 * These used to return `NextResponse.json(...)`. In Express the response object
 * is passed in and mutated, so each helper takes `res` and returns it — which
 * keeps the call sites reading the same way (`return badRequest(res, "...")`).
 *
 * The shapes are unchanged on purpose: `src/lib/api.ts` in the frontend parses
 * `{ error, fields? }` and would break if the envelope moved.
 */

export function dbError(res: Response) {
  return res
    .status(503)
    .json({ error: "Database temporarily unavailable. Please try again in a moment." });
}

export function unauthorized(res: Response) {
  return res.status(401).json({ error: "Admin authentication required for this endpoint." });
}

export function notFound(res: Response) {
  return res.status(404).json({ error: "Resource not found." });
}

export function conflict(res: Response, message: string) {
  return res.status(409).json({ error: message });
}

export function badRequest(res: Response, message: string) {
  return res.status(400).json({ error: message });
}

/** Zod issues flattened into `{ "path.to.field": "message" }`. */
export function validationErrors(
  res: Response,
  errors: readonly { path: ReadonlyArray<string | number>; message: string }[],
) {
  return res.status(400).json({
    error: "Request body could not be validated.",
    fields: Object.fromEntries(errors.map((e) => [e.path.join("."), e.message])),
  });
}

export function tooManyRequests(res: Response, message: string) {
  return res.status(429).json({ error: message });
}
