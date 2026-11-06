import { Router } from "express";

import {
  isAdminRequest,
  isAuthConfigured,
  verifyPasscode,
  startAdminSession,
  endAdminSession,
} from "../lib/auth.js";
import { adminLoginSchema } from "../lib/validation.js";
import { badRequest, unauthorized } from "../lib/http.js";

export const adminRouter = Router();

/**
 * Mounted at /api/admin, so every path below is relative to that.
 * The old Next handler lived at /api/admin/session.
 */

/**
 * GET /api/admin/session — is the caller holding a valid admin cookie?
 *
 * Always answers 200 on purpose. The frontend (src/app/admin/layout.tsx via
 * src/lib/api.ts) treats ANY rejected session probe as "server unreachable,
 * trust the local session", so a 401 here would unlock the dashboard instead
 * of locking it. The authenticated flag is what decides, not the status code.
 *
 * The Next version of this handler seeded the database and returned
 * { batches }, which no caller consumed; see the port notes in the report.
 */
adminRouter.get("/session", (req, res) => {
  try {
    const authenticated = isAdminRequest(req);
    res.json({
      ok: true,
      authenticated,
      mode: authenticated ? "unlocked" : "locked",
    });
  } catch {
    res.status(500).json({ error: "Session check failed." });
  }
});

/** POST /api/admin/session — exchange the passcode for a signed session cookie. */
adminRouter.post("/session", (req, res) => {
  try {
    // Without a passcode AND a signing secret there is no session to issue.
    // Both fall back to development defaults outside production.
    if (!isAuthConfigured()) {
      return badRequest(res, "Admin login is unavailable on this server.");
    }

    // express.json() already parsed the body. A syntactically broken payload
    // is rejected by that middleware before it reaches here; this guard covers
    // valid JSON that simply is not an object (a bare string, a number, null).
    const body: unknown = req.body;
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return badRequest(res, "The request body must be valid JSON.");
    }

    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(res, parsed.error.issues[0]?.message ?? "Invalid request.");
    }
    // Constant-time comparison lives in verifyPasscode.
    if (!verifyPasscode(parsed.data.passcode)) {
      return unauthorized(res);
    }

    startAdminSession(res);
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Unexpected server error." });
  }
});

/** DELETE /api/admin/session — log out by clearing the cookie. */
adminRouter.delete("/session", (_req, res) => {
  try {
    endAdminSession(res);
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Unexpected server error." });
  }
});
