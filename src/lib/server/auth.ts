import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

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

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function startAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}
