import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDb } from "./lib/db.js";
import { dbError } from "./lib/http.js";
import { adminRouter } from "./routes/admin.js";
import { batchesRouter } from "./routes/batches.js";
import { mentorRouter } from "./routes/mentor.js";
import { questionsRouter } from "./routes/questions.js";
import { submissionsRouter } from "./routes/submissions.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

/**
 * CORS with credentials, because the admin session is an httpOnly cookie and
 * the frontend is now a separate origin. `credentials: true` forbids the `*`
 * wildcard, so the allowed origins must be listed explicitly — set
 * CORS_ORIGIN as a comma-separated list.
 *
 * Entries are normalised before comparison. A browser's `Origin` header is
 * always scheme + host + port with no trailing slash and a lowercase host, but
 * the value pasted into a hosting dashboard is whatever was copied out of the
 * address bar — "https://app.example.com/" failed the old exact-match check
 * for a slash nobody could see, which is the single most common way this
 * breaks in production.
 */
function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, "").toLowerCase();
}

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

/**
 * An entry may also be a wildcard host — `https://*.vercel.app` — which is how
 * you let every preview deployment of one project talk to a shared API without
 * redeploying the API for each branch URL.
 *
 * `*` matches one label and never a dot, so `https://*.vercel.app` cannot be
 * satisfied by `https://evil.attacker.vercel.app.example.com`. It DOES match
 * every other project hosted on that domain, so only use it on a host you are
 * content to trust wholesale — a literal origin is always the safer entry.
 */
function originMatches(origin: string, entry: string): boolean {
  if (entry === origin) return true;
  if (!entry.includes("*")) return false;
  const pattern = entry
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[^.]+");
  return new RegExp(`^${pattern}$`).test(origin);
}

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests and server-to-server calls arrive with no Origin.
      if (!origin) return callback(null, true);
      const candidate = normalizeOrigin(origin);
      if (allowedOrigins.some((entry) => originMatches(candidate, entry))) {
        // Echo the origin exactly as sent. A normalised value would not match
        // what the browser compares against.
        return callback(null, origin);
      }
      // Logged, because the only other place this surfaces is the browser
      // console of whoever hit it — and they are usually not the person who
      // can edit CORS_ORIGIN.
      console.warn(
        `[pathora] CORS rejected ${origin}. CORS_ORIGIN allows: ${
          allowedOrigins.join(", ") || "(nothing)"
        }`,
      );
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
//
// `corsOrigins` is included deliberately. A blocked request shows up only in
// the browser console of whoever hit it, with no way to see what the server
// would have accepted; one GET now answers that. The values are public
// frontend URLs, never a credential.
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "pathora-backend",
    database: Boolean(process.env.MONGODB_URI),
    ai: Boolean(process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY),
    corsOrigins: allowedOrigins,
  });
});

/**
 * Opens the database connection before any handler that queries it.
 *
 * `connectDb()` was previously reached from a single place — `ensureSeeded()`
 * inside GET /api/submissions. Every other database route queried an
 * unconnected Mongoose, which buffers the operation and then times out, so a
 * perfectly healthy database still answered 503. Doing it as middleware means
 * a new route cannot forget it.
 *
 * Admin sessions and the mentor route are deliberately NOT behind this: the
 * passcode check must keep working when the database is down, and an unrelated
 * outage must not take the AI wording layer with it.
 */
const withDb: express.RequestHandler = (_req, res, next) => {
  connectDb()
    .then(() => next())
    .catch((error) => dbError(res, error));
};

app.use("/api/admin", adminRouter);
app.use("/api/batches", withDb, batchesRouter);
app.use("/api/submissions", withDb, submissionsRouter);
app.use("/api/questions", withDb, questionsRouter);
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
