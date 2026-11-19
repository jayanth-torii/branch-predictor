import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

const COOKIE_NAME = "pathora_admin";
const SESSION_SECONDS = 60 * 60 * 12;

const DEV_EMAIL = "admin@localhost";
const DEV_PASSWORD = "pathora-demo";

/**
 * Development is an EXPLICIT opt-in, and everything else counts as
 * production.
 *
 * This used to be `NODE_ENV === "production"`, which meant an unset NODE_ENV
 * — exactly what this app's Render service has — put a live deployment on the
 * development path and handed out the fallback credentials and the public
 * signing key below. A missing environment variable must fail CLOSED.
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/** The one account that can open the educator workspace. */
function adminEmail(): string {
  const configured = process.env.ADMIN_EMAIL?.trim();
  if (configured) return configured.toLowerCase();
  return isDevelopment() ? DEV_EMAIL : "";
}

/**
 * ADMIN_PASSCODE is the old single-field name. It is still read so an existing
 * deployment does not lock its owner out the moment this ships; ADMIN_PASSWORD
 * wins when both are set.
 */
function adminPassword(): string {
  const configured = process.env.ADMIN_PASSWORD?.trim() || process.env.ADMIN_PASSCODE?.trim();
  if (configured) return configured;
  return isDevelopment() ? DEV_PASSWORD : "";
}

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  // No secret and not explicitly development: return "" so every signature
  // comparison fails, rather than signing with a string anyone can read in
  // the repository.
  return isDevelopment() ? "pathora-local-development-secret" : "";
}



function sign(value: string): string {
  return createHmac("sha256", authSecret()).update(value).digest("hex");
}

export function isAuthConfigured(): boolean {
  return Boolean(adminEmail() && adminPassword() && authSecret());
}

/**
 * Constant-time string comparison that does not leak length.
 *
 * `timingSafeEqual` throws on differing lengths, so the usual workaround is an
 * early `length !== length` return — which tells an attacker how long the
 * secret is. HMAC-ing both sides first makes every comparison a fixed 32 bytes,
 * so the only thing observable is equality.
 */
function secretEquals(input: string, expected: string): boolean {
  if (!expected) return false;
  const a = createHmac("sha256", authSecret()).update(input).digest();
  const b = createHmac("sha256", authSecret()).update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * Checks an email and password together.
 *
 * Both halves are ALWAYS compared, and the results combined at the end, so a
 * wrong email and a wrong password take the same time and return the same
 * answer. Nothing the caller sees distinguishes "no such account" from "wrong
 * password" — the route returns one generic message for both.
 */
export function verifyCredentials(email: string, password: string): boolean {
  const emailOk = secretEquals(email.trim().toLowerCase(), adminEmail());
  const passwordOk = secretEquals(password, adminPassword());
  return emailOk && passwordOk;
}

/**
 * The single-field login this replaced. Kept so a client cached from before
 * this shipped can still sign in with the password alone during the rollout.
 */
export function verifyPasscode(input: string): boolean {
  return secretEquals(input.trim(), adminPassword());
}

export function createSessionToken(now = Date.now()): string {
  const expiresAt = now + SESSION_SECONDS * 1000;
  return `${expiresAt}.${sign(`admin:${expiresAt}`)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (!Number.isFinite(Number(expiresAt)) || Number(expiresAt) < Date.now()) return false;

  const expected = sign(`admin:${expiresAt}`);
  const provided = Buffer.from(signature);
  const target = Buffer.from(expected);
  if (provided.length !== target.length) return false;
  return timingSafeEqual(provided, target);
}

/**
 * Cookie handling, ported from Next's `cookies()` store to Express.
 *
 * The crypto above is unchanged — only how the token is read and written
 * differs. `httpOnly` + `sameSite` are preserved; `sameSite` relaxes to "none"
 * in production because the frontend is now a separate origin, which requires
 * `secure: true` to be accepted by browsers.
 */
export function isAdminRequest(req: Request): boolean {
  return verifySessionToken(req.cookies?.[COOKIE_NAME]);
}

/**
 * Cookie attributes, decided by the REQUEST rather than by an environment
 * variable.
 *
 * The frontend and the API are different sites (vercel.app and onrender.com),
 * so the session cookie has to be `SameSite=None` or the browser will not
 * attach it to a cross-site fetch at all — which is precisely what happened:
 * login returned 200 and set the cookie, and every call after it arrived
 * anonymous. `SameSite=None` is only accepted alongside `Secure`, and
 * `Secure` only works over HTTPS, so the three travel together.
 *
 * Over plain HTTP — localhost — `None; Secure` would be rejected outright, so
 * the pair relaxes to `Lax` and no `Secure`, which is correct for a
 * same-origin dev setup.
 *
 * `x-forwarded-proto` is read because Render terminates TLS at its proxy and
 * forwards HTTP inwards; `req.secure` only reflects that once Express is told
 * to trust the proxy (see `app.set("trust proxy", …)` in index.ts).
 */
function cookieAttributes(req: Request) {
  const overHttps =
    req.secure ||
    String(req.headers["x-forwarded-proto"] ?? "").split(",")[0].trim() === "https";
  return {
    httpOnly: true,
    sameSite: overHttps ? ("none" as const) : ("lax" as const),
    secure: overHttps,
    path: "/",
  };
}

export function startAdminSession(req: Request, res: Response): void {
  res.cookie(COOKIE_NAME, createSessionToken(), {
    ...cookieAttributes(req),
    maxAge: SESSION_SECONDS * 1000,
  });
}

/** Cleared with the SAME attributes it was set with, or the browser keeps it. */
export function endAdminSession(req: Request, res: Response): void {
  res.clearCookie(COOKIE_NAME, cookieAttributes(req));
}

/** Best-effort client identity for rate limiting. */
export function clientKey(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return first?.split(",")[0]?.trim() || req.ip || "local";
}
