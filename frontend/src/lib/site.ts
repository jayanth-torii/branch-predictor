/**
 * The public address of the deployed app.
 *
 * Used by anything that has to keep working away from the browser that
 * rendered it — a QR code pointed at from a projector, a link printed into a
 * PDF, a code read off a whiteboard.
 *
 * `window.location.origin` is deliberately NOT used for those: a pass rendered
 * on localhost would encode `http://localhost:3000`, which is useless on the
 * phone held up to it, and a Vercel preview build would encode the preview
 * deployment rather than the site the student is being sent to.
 *
 * Override per environment with NEXT_PUBLIC_SITE_URL. It is inlined into the
 * browser bundle like every NEXT_PUBLIC_* value, so it must never hold a
 * secret — a public URL is exactly the right kind of thing to put here.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://ngi-branch-predictor.vercel.app"
).replace(/\/+$/, "");

/** Absolute URL for a path on the public site. */
export function siteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
