// Crea l'utente admin iniziale. Uso:
//   node scripts/seed.mjs <username> <nome> <password>
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const [username, name, password] = process.argv.slice(2);
if (!username || !name || !password) {
  console.error("Uso: node scripts/seed.mjs <username> <nome> <password>");
  process.exit(1);
}

const dbPath = process.env.DATABASE_PATH ?? "./data/serate.db";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

migrate(drizzle(db), { migrationsFolder: path.join(process.cwd(), "db", "migrations") });

const hash = bcrypt.hashSync(password, 10);
const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username.toLowerCase());
if (existing) {
  db.prepare("UPDATE users SET password_hash = ?, is_admin = 1 WHERE username = ?").run(
    hash,
    username.toLowerCase()
  );
  console.log(`Utente '${username}' aggiornato (password nuova, admin).`);
} else {
  db.prepare("INSERT INTO users (username, name, password_hash, is_admin) VALUES (?, ?, ?, 1)").run(
    username.toLowerCase(),
    name,
    hash
  );
  console.log(`Admin '${name}' (@${username.toLowerCase()}) creato.`);
}
