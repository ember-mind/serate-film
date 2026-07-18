import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_PATH ?? "./data/serate.db";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");

export const db = drizzle(sqlite, { schema });

// Le migration girano solo a runtime: durante `next build` i worker paralleli
// di page-data aprirebbero il db in scrittura tutti insieme (SQLITE_BUSY).
const migrationsFolder = path.join(process.cwd(), "db", "migrations");
if (process.env.NEXT_PHASE !== "phase-production-build" && fs.existsSync(migrationsFolder)) {
  migrate(db, { migrationsFolder });
}
