import "dotenv/config";
import mongoose from "mongoose";

import { connectDb } from "../lib/db.js";
import { ensureSeeded } from "../lib/seed.js";

/**
 * Standalone seed runner — `npm run seed`.
 *
 * Deliberately thin: the seeding rules (what is sample data, how duplicates
 * are avoided) belong to src/lib/seed.ts, which the API also calls on its
 * first database-backed request. This script exists so a fresh database can be
 * prepared without booting the server, and it only has to connect, delegate
 * and close the connection — an open Mongoose pool keeps the process alive, so
 * disconnecting is what makes the command exit.
 */
async function main(): Promise<void> {
  await connectDb();
  await ensureSeeded();
}

main()
  .then(async () => {
    console.log("[pathora] seed complete");
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[pathora] seed failed:", message);
    // Best effort: the connection may never have opened.
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
