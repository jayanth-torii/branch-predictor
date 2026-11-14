import { Router } from "express";

import {
  isAdminRequest,
  isAuthConfigured,
  verifyCredentials,
  verifyPasscode,
  startAdminSession,
  endAdminSession,
  clientKey,
} from "../lib/auth.js";
import { adminLoginSchema } from "../lib/validation.js";
import { badRequest, unauthorized } from "../lib/http.js";

export const adminRouter = Router();

/* ── Brute-force guard ─────────────────────────────────────────────────────
   This endpoint now takes a real email and password rather than a shared
   code, which makes it worth guessing at. Ten wrong answers from one address
   in fifteen minutes and that address waits.

   In memory on purpose: one small API process, and a limiter that survives a
   restart would need a store this service does not otherwise have. A restart
   clearing the counters is the known limit of it.

   Only FAILURES count. A successful sign-in clears the address, so the person
   who typed a password wrong twice and then got it right is not punished. */
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 10;
const loginFailures = new Map<string, number[]>();

function recentFailures(key: string, now: number): number[] {
  return (loginFailures.get(key) ?? []).filter((at) => now - at < LOGIN_WINDOW_MS);
}

function isLoginBlocked(key: string): boolean {
  return recentFailures(key, Date.now()).length >= LOGIN_MAX_FAILURES;
}

function noteLoginFailure(key: string): void {
  const now = Date.now();
  const recent = recentFailures(key, now);
  recent.push(now);
  loginFailures.set(key, recent);
  if (loginFailures.size > 500) {
    for (const [other, times] of loginFailures) {
      if (!times.some((at) => now - at < LOGIN_WINDOW_MS)) loginFailures.delete(other);
    }
  }
}

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

/** POST /api/admin/session — exchange credentials for a signed session cookie. */
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

    const key = clientKey(req);
    if (isLoginBlocked(key)) {
      return res.status(429).json({
        error: "Too many failed sign-in attempts. Try again in fifteen minutes.",
      });
    }

    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(res, "Enter your email address and password.");
    }

    // Constant-time comparison lives in the auth module.
    const ok =
      "passcode" in parsed.data
        ? verifyPasscode(parsed.data.passcode)
        : verifyCredentials(parsed.data.email, parsed.data.password);

    if (!ok) {
      noteLoginFailure(key);
      // One message for a wrong email and a wrong password alike: saying which
      // half failed would confirm that an address is the admin account.
      return unauthorized(res, "That email and password did not match.");
    }

    loginFailures.delete(key);
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
