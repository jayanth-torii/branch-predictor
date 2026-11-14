/**
 * Generates src/data/question-bank.ts from the frontend's TypeScript banks.
 *
 * WHY THIS EXISTS
 * The default questions live in frontend/src/lib/{questions,stream-questions}.ts.
 * They are the offline fallback a student falls back to when the API blinks, so
 * they have to stay in the browser bundle. The API needs the same content to
 * seed and refresh the database on deploy.
 *
 * Copying all 85 questions into this package by hand would mean two copies that
 * drift — exactly the bug this whole change exists to prevent. So the backend
 * does not keep a copy; it keeps a GENERATED one, rebuilt from the frontend
 * source on every `npm run build` via the `prebuild` hook. The frontend stays
 * the single source of truth and the generated file is never edited by hand.
 *
 * Both banks are pure data with type-only imports from a self-contained
 * types.ts, which is why this can import them directly with no bundler.
 */
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const frontend = resolve(here, "../../frontend/src/lib");
const outPath = resolve(here, "../src/data/question-bank.ts");

// pathToFileURL, not a bare path: on Windows an absolute path starts "C:",
// which the ESM loader reads as an unknown URL scheme and refuses.
const { QUESTIONS } = await import(pathToFileURL(resolve(frontend, "questions.ts")).href);
const { STREAM_QUESTIONS } = await import(
  pathToFileURL(resolve(frontend, "stream-questions.ts")).href
);

const core = QUESTIONS as Record<string, unknown>[];
// Each stream question already carries its own `stream`, so flattening the
// record loses nothing and matches the shape the import endpoint expects.
const stream = Object.values(
  STREAM_QUESTIONS as Record<string, Record<string, unknown>[]>,
).flat();

if (core.length === 0 || stream.length === 0) {
  throw new Error(
    `Refusing to generate an empty bank (core=${core.length}, stream=${stream.length}).`,
  );
}

/**
 * The hash is over the CONTENT, so the seeder can tell "the repo's wording
 * changed" from "the server restarted". A whitespace-only edit to the source
 * file does not move it; a changed label does.
 */
const payload = JSON.stringify({ core, stream });
const hash = createHash("sha256").update(payload).digest("hex").slice(0, 16);

const file = `/* ──────────────────────────────────────────────────────────────────────────
   GENERATED FILE — DO NOT EDIT.

   Rebuilt from frontend/src/lib/{questions,stream-questions}.ts by
   scripts/build-question-bank.mts, which runs on every \`npm run build\`.
   Edit the frontend banks; this follows.
   ────────────────────────────────────────────────────────────────────────── */

export const QUESTION_BANK_HASH = ${JSON.stringify(hash)};

export const CORE_BANK = ${JSON.stringify(core, null, 2)} as unknown as { id: string }[];

export const STREAM_BANK = ${JSON.stringify(stream, null, 2)} as unknown as {
  id: string;
  stream: string;
}[];
`;

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, file, "utf8");

console.log(
  `[bank] ${core.length} core + ${stream.length} stream questions → src/data/question-bank.ts (${hash})`,
);
