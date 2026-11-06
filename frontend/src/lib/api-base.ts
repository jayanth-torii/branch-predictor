/**
 * Where the API lives.
 *
 * The frontend and the API are now separate deployables, so the base can no
 * longer be assumed to be `window.location.origin`. It comes from
 * `NEXT_PUBLIC_API_BASE_URL` instead.
 *
 * Falling back to the current origin keeps two things working: a single-origin
 * deployment where a proxy forwards `/api`, and local development where the
 * variable has not been set yet. Returning "" during server rendering is
 * deliberate — every caller is client-side and gated behind `useHydrated()`.
 */
export function apiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (typeof window === "undefined") return "";
  return window.location.origin;
}
