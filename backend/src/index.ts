import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { adminRouter } from "./routes/admin.js";
import { batchesRouter } from "./routes/batches.js";
import { mentorRouter } from "./routes/mentor.js";
import { submissionsRouter } from "./routes/submissions.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

/**
 * CORS with credentials, because the admin session is an httpOnly cookie and
 * the frontend is now a separate origin. `credentials: true` forbids the `*`
 * wildcard, so the allowed origins must be listed explicitly — set
 * CORS_ORIGIN as a comma-separated list.
 */
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests and server-to-server calls arrive with no Origin.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "256kb" }));
app.use(cookieParser());

// Liveness. Reports whether a database and an AI provider are configured,
// without leaking either value — the frontend uses this to decide whether to
// offer server-backed features at all.
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "pathora-backend",
    database: Boolean(process.env.MONGODB_URI),
    ai: Boolean(process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY),
  });
});

app.use("/api/admin", adminRouter);
app.use("/api/batches", batchesRouter);
app.use("/api/submissions", submissionsRouter);
app.use("/api/mentor", mentorRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Resource not found." });
});

// Final guard: an unhandled throw must still answer in the frontend's error
// envelope rather than Express's HTML error page.
app.use(
  (
    error: Error & { type?: string; status?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    // Malformed JSON never reaches a handler - express.json() throws here
    // first. Next answered 400 for this; without the branch it would surface
    // as a 500 and the client would read a parser failure as a server fault.
    if (error instanceof SyntaxError && error.type === "entity.parse.failed") {
      return res.status(400).json({ error: "The request body must be valid JSON." });
    }
    // A body over the 256kb cap is also the caller's problem, not ours.
    if (error.type === "entity.too.large") {
      return res.status(413).json({ error: "The request body is too large." });
    }
    if (error.message?.includes("CORS")) {
      return res.status(403).json({ error: error.message });
    }
    // Anything else is a genuine fault. Log the detail, return none of it:
    // a raw throw message can carry a connection string or a file path.
    console.error("[pathora] unhandled:", error);
    return res.status(500).json({ error: "Unexpected server error." });
  },
);

app.listen(PORT, () => {
  console.log(`\n  Pathora API  →  http://localhost:${PORT}`);
  console.log(`  CORS allows  →  ${allowedOrigins.join(", ")}`);
  console.log(`  Database     →  ${process.env.MONGODB_URI ? "configured" : "not set (routes answer 503)"}`);
  console.log(`  AI wording   →  ${process.env.LLM_API_KEY ? "configured" : "not set (deterministic only)"}\n`);
});
