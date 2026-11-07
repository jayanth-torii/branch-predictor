import dns from "node:dns";
import mongoose from "mongoose";

/**
 * Optional DNS override, off unless DNS_SERVERS is set.
 *
 * A `mongodb+srv://` URI needs an SRV lookup, and some resolvers — corporate
 * DNS, a VPN adapter, certain home routers — refuse SRV and fail the connection
 * with ECONNREFUSED before a single packet reaches Atlas. Pointing this process
 * at a resolver that answers SRV fixes it. It stays opt-in so a normal
 * deployment keeps using the platform's own DNS.
 */
const DNS_SERVERS = (process.env.DNS_SERVERS ?? "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);
if (DNS_SERVERS.length > 0) {
  dns.setServers(DNS_SERVERS);
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "pathora";

type MongoCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongo = globalThis as typeof globalThis & {
  __pathoraMongo?: MongoCache;
};

const cached: MongoCache = (globalForMongo.__pathoraMongo ??= {
  conn: null,
  promise: null,
});

/**
 * Reuses a single connection across hot reloads and route invocations.
 * Throws a readable error when the URI is missing so routes can return 503.
 */
export async function connectDb(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export function isDbConfigured(): boolean {
  return Boolean(MONGODB_URI);
}
