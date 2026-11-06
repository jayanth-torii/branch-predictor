import { SAMPLE_BATCHES } from "./domain.js";
import { connectDb } from "./db.js";
import { BatchModel } from "./models.js";

let seedPromise: Promise<void> | null = null;

async function seed(): Promise<void> {
  await connectDb();

  if (process.env.SEED_SAMPLE_DATA !== "false") {
    await BatchModel.bulkWrite(
      SAMPLE_BATCHES.map((batch) => ({
        updateOne: {
          filter: { code: batch.code },
          update: { $setOnInsert: batch },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    // The frontend's `buildSeedData()` fabricates 18 synthetic students to make
    // the local demo dashboard look populated. That is a UI concern and must
    // NOT run here: writing invented student records into a real database is
    // how demo data ends up being read as real. Only the sample batches are
    // seeded, so a fresh install still has join codes to try.
  }
}

/**
 * Runs once per server process. Sample rows are inserted with $setOnInsert so
 * concurrent instances cannot duplicate them.
 */
export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}
