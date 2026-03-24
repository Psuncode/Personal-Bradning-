// drizzle.config.ts (project root)
// Uses `postgres` (TCP) driver for drizzle-kit CLI — @neondatabase/serverless is
// WebSocket-only and doesn't work in drizzle-kit's migration process.
// The app itself still uses @neondatabase/serverless via drizzle-orm/neon-http.
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // ALWAYS use UNPOOLED for migrations — PgBouncer transaction mode blocks DDL
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
});
