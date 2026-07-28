// Congela nel migration corrente gli snapshot recuperati da internet.
// Così database esistenti ricevono i metadati al deploy, senza chiamate esterne.
//
//   node scripts/build-metadata-migration.mjs db/migrations/0016_....sql

import Database from "better-sqlite3";
import fs from "node:fs";

const migrationPath = process.argv[2];
if (!migrationPath || !fs.existsSync(migrationPath)) {
  throw new Error("Indica il migration SQL esistente da completare.");
}

const dbPath = process.env.DATABASE_PATH ?? "./data/serate.db";
const db = new Database(dbPath, { readonly: true });
const rows = db
  .prepare(
    `SELECT
      title, year, wikidata_id, imdb_id, rotten_tomatoes_id,
      youtube_trailer_id, trailer_title, trailer_channel,
      imdb_rating, rotten_tomatoes_score, awards, metadata_updated_at
    FROM movies
    WHERE metadata_updated_at IS NOT NULL
    ORDER BY year, title`
  )
  .all();

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

const marker = "-- Snapshot metadati film recuperato da Wikidata e YouTube.";
const original = fs.readFileSync(migrationPath, "utf8");
const schemaSql = original
  .split(marker)[0]
  .replace(/(?:\s*--> statement-breakpoint\s*)+$/, "")
  .trimEnd();
const updates = rows.map(
  (row) => `UPDATE \`movies\` SET
  \`wikidata_id\` = ${sql(row.wikidata_id)},
  \`imdb_id\` = ${sql(row.imdb_id)},
  \`rotten_tomatoes_id\` = ${sql(row.rotten_tomatoes_id)},
  \`youtube_trailer_id\` = ${sql(row.youtube_trailer_id)},
  \`trailer_title\` = ${sql(row.trailer_title)},
  \`trailer_channel\` = ${sql(row.trailer_channel)},
  \`imdb_rating\` = ${sql(row.imdb_rating)},
  \`rotten_tomatoes_score\` = ${sql(row.rotten_tomatoes_score)},
  \`awards\` = ${sql(row.awards)},
  \`metadata_updated_at\` = ${sql(row.metadata_updated_at)}
WHERE \`metadata_updated_at\` IS NULL
  AND \`title\` = ${sql(row.title)}
  AND \`year\` IS ${sql(row.year)};`
);

fs.writeFileSync(
  migrationPath,
  `${schemaSql}\n--> statement-breakpoint\n${marker}\n${updates.join(
    "\n--> statement-breakpoint\n"
  )}\n`
);
console.log(`Snapshot aggiunto: ${rows.length} film.`);
