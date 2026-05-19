// src/db/index.ts
// Lazy connection — avoids neon() throwing at build time when DATABASE_URL is not set.
// The connection is created on first use (first db query at runtime).
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleClient | undefined;

function getDb(): DrizzleClient {
  if (!_db) {
    // WR-08: surface a clear, actionable error instead of letting
    // @neondatabase/serverless throw an opaque "URL is not a string" from deep
    // inside the driver. Trip-wires the first request in any env that's missing
    // the var — typically a forgotten Vercel project setting.
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is required to connect to Postgres but is not set. " +
          "Set it in .env.local for local dev or in the deployment env (Vercel, etc.) before issuing DB queries."
      );
    }
    const sql = neon(url);
    _db = drizzle({ client: sql, schema });
  }
  return _db;
}

// WR-07: the previous Proxy handler typed `prop` as `string` and forwarded
// every key — including symbols and the `then` property — to the underlying
// client. That breaks two things:
//   1. `await db` (accidental or otherwise) sees `db.then` as a function and
//      treats `db` as a thenable, triggering a DB connection on inspection.
//   2. `Symbol.iterator`, `Symbol.toPrimitive`, util.inspect.custom etc. all
//      lazily open a connection just to log or destructure `db`.
//
// Fix: short-circuit symbol keys + the well-known `then` accessor, and
// implement a `has` trap so `"select" in db` matches `db.select` behavior.
export const db: DrizzleClient = new Proxy({} as DrizzleClient, {
  get(_target, prop, receiver) {
    if (typeof prop === "symbol") {
      // Don't route symbol property access (Symbol.iterator, Symbol.toPrimitive,
      // util.inspect.custom, ...) through the driver. Returning undefined makes
      // `db` behave like a plain object for reflection / awaiting.
      return Reflect.get(_target, prop, receiver);
    }
    if (prop === "then") {
      // Make `db` definitively non-thenable so `await db` resolves to `db`
      // without opening a DB connection.
      return undefined;
    }
    const client = getDb() as unknown as Record<string, unknown>;
    return client[prop];
  },
  has(_target, prop) {
    if (typeof prop === "symbol" || prop === "then") return false;
    return prop in (getDb() as unknown as object);
  },
});
