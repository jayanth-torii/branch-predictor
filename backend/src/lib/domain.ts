/**
 * Domain constants the API validates against.
 *
 * These are deliberately duplicated from the frontend rather than imported
 * across the split. The two apps are separate deployables with separate
 * dependency trees, and an API must be able to validate a request without
 * reaching into a UI package. They are two short frozen lists that change
 * rarely — if either ever does, both sides must be updated together, which is
 * what the guard in `assertDomainParity` below is for.
 */

export const DIMENSIONS = [
  "technology",
  "creativity",
  "engineering",
  "business",
  "communication",
  "analytical",
] as const;
export type Dimension = (typeof DIMENSIONS)[number];

export const STREAMS = ["PCMB", "PCMC", "PCM", "Commerce", "Arts/Humanities"] as const;
export type Stream = (typeof STREAMS)[number];

/** The demo batches the API seeds so a fresh database has join codes to try. */
export const SAMPLE_BATCHES = [
  {
    id: "batch-pu-2027",
    name: "PU 2027 — Science",
    code: "PTH-2027",
    institution: "Sample PU College",
    createdAt: "2026-09-02T09:00:00.000Z",
    capacity: 48,
    sample: true,
  },
  {
    id: "batch-pu-2026",
    name: "PU 2026 — Science & Commerce",
    code: "PTH-2026",
    institution: "Sample PU College",
    createdAt: "2026-06-18T09:00:00.000Z",
    capacity: 36,
    sample: true,
  },
  {
    id: "batch-commerce-2027",
    name: "PU 2027 — Commerce",
    code: "PTH-C27",
    institution: "Sample PU College",
    createdAt: "2026-09-10T09:00:00.000Z",
    capacity: 40,
    sample: true,
  },
] as const;
