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
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle({ client: sql, schema });
  }
  return _db;
}

export const db = new Proxy({} as DrizzleClient, {
  get(_target, prop: string) {
    return (getDb() as unknown as Record<string, unknown>)[prop];
  },
});
