import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

const COOKIE_NAME = "pathora_admin";
const SESSION_SECONDS = 60 * 60 * 12;

function adminPasscode(): string {
  return process.env.ADMIN_PASSCODE ?? (process.env.NODE_ENV === "production" ? "" : "pathora-demo");
}

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") return "";
  return "pathora-local-development-secret";
}

function sign(value: string): string {
  return createHmac("sha256", authSecret()).update(value).digest("hex");
}

export function isAuthConfigured(): boolean {
  return Boolean(adminPasscode() && authSecret());
}

export function verifyPasscode(input: string): boolean {
  const expected = adminPasscode();
  if (!expected) return false;
  const provided = Buffer.from(input.trim());
  const target = Buffer.from(expected);
  if (provided.length !== target.length) return false;
  return timingSafeEqual(provided, target);
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

export function startAdminSession(res: Response): void {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
    maxAge: SESSION_SECONDS * 1000,
  });
}

export function endAdminSession(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

/** Best-effort client identity for rate limiting. */
export function clientKey(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return first?.split(",")[0]?.trim() || req.ip || "local";
}
