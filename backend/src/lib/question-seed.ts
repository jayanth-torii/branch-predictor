import {
  AppMetaModel,
  CoreQuestionModel,
  StreamQuestionModel,
} from "./models.js";
import { CORE_BANK, QUESTION_BANK_HASH, STREAM_BANK } from "../data/question-bank.js";

/* ══════════════════════════════════════════════════════════════════════════
   DEPLOY-TIME QUESTION SYNC

   The problem this solves: once a database is connected, GET /api/questions
   serves it, and the database wins over the bundled bank. So a wording change
   shipped in the repo was invisible on the live site until somebody remembered
   to open the admin screen and press "Restore defaults". That happened twice,
   and both times the person reading the site assumed the fix had not shipped.

   What runs here, on every boot:

     1. If the bank in the database already matches this build, stop. The hash
        is over the content, so a plain restart does nothing.
     2. Otherwise upsert every question — EXCEPT any row carrying `editedAt`,
        which means a human changed it in the admin screen. Those are left
        exactly as they are and named in the log.
     3. Record the new hash.

   Rule 2 is the whole design. A sync that blindly replaced everything would
   silently destroy staff edits on the next deploy, which is a worse bug than
   the one being fixed. A sync that skipped everything already present would
   never deliver a wording change, which is the bug being fixed. Skipping only
   what a human actually touched does both jobs.

   Deleting is deliberately NOT done. A question removed from the repo stays in
   the database rather than vanishing, because a delete here would orphan the
   answers already stored against it.
   ══════════════════════════════════════════════════════════════════════════ */

const META_KEY = "questionBankHash";

export type SyncOutcome = {
  status: "unchanged" | "synced" | "skipped";
  reason?: string;
  hash: string;
  core?: { written: number; preserved: string[] };
  stream?: { written: number; preserved: string[] };
};

/**
 * Ids of questions a human has edited, which the sync must not overwrite.
 *
 * The two models are queried separately rather than through one helper taking
 * `CoreQuestionModel | StreamQuestionModel`: a union of two Mongoose models is
 * not callable, because TypeScript cannot reconcile their two `find`
 * signatures. Two four-line functions beat fighting that.
 */
const EDITED = { editedAt: { $nin: ["", null] } } as const;

async function editedCoreIds(): Promise<Set<string>> {
  const rows = await CoreQuestionModel.find(EDITED, { id: 1, _id: 0 }).lean();
  return new Set(rows.map((row) => row.id));
}

async function editedStreamIds(): Promise<Set<string>> {
  const rows = await StreamQuestionModel.find(EDITED, { id: 1, _id: 0 }).lean();
  return new Set(rows.map((row) => row.id));
}

export async function syncQuestionBank(): Promise<SyncOutcome> {
  if (CORE_BANK.length === 0 || STREAM_BANK.length === 0) {
    // The generated file is empty or missing — refuse rather than wipe a good
    // database with nothing.
    return { status: "skipped", reason: "The generated bank is empty.", hash: QUESTION_BANK_HASH };
  }

  const recorded = await AppMetaModel.findOne({ key: META_KEY }).lean();
  if (recorded?.value === QUESTION_BANK_HASH) {
    return { status: "unchanged", hash: QUESTION_BANK_HASH };
  }

  const [coreEdited, streamEdited] = await Promise.all([editedCoreIds(), editedStreamIds()]);

  const now = new Date().toISOString();
  const operations = <T extends { id: string }>(rows: T[], skip: Set<string>) =>
    rows
      .filter((row) => !skip.has(row.id))
      .map((row) => ({
        updateOne: {
          filter: { id: row.id },
          // $set, not $setOnInsert: the point is to refresh rows that already
          // exist. `editedAt` is never written here, so a row this touches
          // stays eligible for the next sync.
          update: { $set: { ...row, updatedAt: now } },
          upsert: true,
        },
      }));

  const coreOps = operations(CORE_BANK, coreEdited);
  const streamOps = operations(STREAM_BANK, streamEdited);

  /* The generated bank types `stream` as a plain string, while the schema types
     it as the five-value union, so the operation list does not satisfy
     bulkWrite's generic. Widening here rather than in the generated file keeps
     that file a pure dump of the frontend's data — and Mongoose still validates
     the enum on write, so a bad stream value is rejected by the database, not
     waved through by this cast. */
  await Promise.all([
    coreOps.length
      ? CoreQuestionModel.bulkWrite(coreOps as Parameters<typeof CoreQuestionModel.bulkWrite>[0], {
          ordered: false,
        })
      : null,
    streamOps.length
      ? StreamQuestionModel.bulkWrite(
          streamOps as Parameters<typeof StreamQuestionModel.bulkWrite>[0],
          { ordered: false },
        )
      : null,
  ]);

  await AppMetaModel.updateOne(
    { key: META_KEY },
    { $set: { key: META_KEY, value: QUESTION_BANK_HASH, updatedAt: now } },
    { upsert: true },
  );

  return {
    status: "synced",
    hash: QUESTION_BANK_HASH,
    core: { written: coreOps.length, preserved: [...coreEdited].sort() },
    stream: { written: streamOps.length, preserved: [...streamEdited].sort() },
  };
}

/**
 * Startup wrapper. Never throws and never blocks the listener: an API that
 * cannot reach Mongo must still answer /api/health and the admin login, which
 * is exactly how the operator finds out the database is down.
 */
export async function syncQuestionBankOnBoot(): Promise<void> {
  try {
    const result = await syncQuestionBank();
    if (result.status === "unchanged") {
      console.log(`[pathora] question bank already at ${result.hash}`);
      return;
    }
    if (result.status === "skipped") {
      console.warn(`[pathora] question sync skipped: ${result.reason}`);
      return;
    }
    const preserved = [...(result.core?.preserved ?? []), ...(result.stream?.preserved ?? [])];
    console.log(
      `[pathora] question bank synced to ${result.hash} — ` +
        `${result.core?.written ?? 0} core, ${result.stream?.written ?? 0} stream` +
        (preserved.length
          ? `; left ${preserved.length} edited question(s) alone: ${preserved.join(", ")}`
          : ""),
    );
  } catch (error) {
    console.error("[pathora] question sync failed:", error);
  }
}
