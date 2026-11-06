import { buildSeedData, SAMPLE_BATCHES } from "@/lib/batches";
import { connectDb } from "./db";
import { BatchModel, SubmissionModel } from "./models";

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

    // Seed result ids are random per process, so guard on the sample flag
    // instead of upserting by id.
    const hasSamples = await SubmissionModel.exists({ sample: true });
    if (!hasSamples) {
      const { submissions } = buildSeedData();
      await SubmissionModel.insertMany(submissions, { ordered: false }).catch((error: unknown) => {
        // Another instance may have won the race; duplicate keys are harmless.
        const code = (error as { code?: number }).code;
        if (code !== 11000) throw error;
      });
    }
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
