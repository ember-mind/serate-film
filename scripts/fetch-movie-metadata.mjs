// Arricchisce il catalogo usando fonti internet senza dipendenze a runtime:
// - Wikidata: ID IMDb/Rotten Tomatoes, rating pubblicati e premi vinti
// - YouTube: trailer, scelto dai risultati italiani e poi inglesi
//
//   node scripts/fetch-movie-metadata.mjs [--force] [--missing-trailers] [--movie 123] [--limit 10]

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { fetchMovieMetadata } from "../lib/movie-metadata.mjs";

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

const FORCE = process.argv.includes("--force");
const MISSING_TRAILERS = process.argv.includes("--missing-trailers");
const MOVIE_ID = option("--movie") ? Number(option("--movie")) : null;
const LIMIT = option("--limit") ? Number(option("--limit")) : null;
const CONCURRENCY = 3;

if (MOVIE_ID !== null && !Number.isInteger(MOVIE_ID)) {
  throw new Error("--movie richiede un id numerico.");
}
if (LIMIT !== null && (!Number.isInteger(LIMIT) || LIMIT < 1)) {
  throw new Error("--limit richiede un numero positivo.");
}

const dbPath = process.env.DATABASE_PATH ?? "./data/serate.db";
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
migrate(drizzle(sqlite), { migrationsFolder: path.join(process.cwd(), "db", "migrations") });

const conditions = [];
const params = [];
if (!FORCE) conditions.push("metadata_updated_at IS NULL");
if (MISSING_TRAILERS) conditions.push("youtube_trailer_id IS NULL");
if (MOVIE_ID !== null) {
  conditions.push("id = ?");
  params.push(MOVIE_ID);
}

const limitSql = LIMIT ? ` LIMIT ${LIMIT}` : "";
const rows = sqlite
  .prepare(
    `SELECT id, title, year,
      EXISTS (
        SELECT 1 FROM movies newer
        WHERE lower(newer.title) = lower(movies.title)
          AND newer.year > movies.year
      ) AS require_trailer_year
    FROM movies${
      conditions.length ? ` WHERE ${conditions.join(" AND ")}` : ""
    } ORDER BY year, title${limitSql}`
  )
  .all(...params);

const update = sqlite.prepare(`
  UPDATE movies SET
    wikidata_id = ?,
    imdb_id = ?,
    rotten_tomatoes_id = ?,
    youtube_trailer_id = ?,
    trailer_title = ?,
    trailer_channel = ?,
    imdb_rating = ?,
    rotten_tomatoes_score = ?,
    awards = ?,
    metadata_updated_at = ?
  WHERE id = ?
`);

let cursor = 0;
let completed = 0;
let failed = 0;
let withTrailer = 0;
let withRatings = 0;
let withAwards = 0;

async function worker() {
  while (cursor < rows.length) {
    const movie = rows[cursor];
    cursor += 1;
    try {
      const metadata = await fetchMovieMetadata({
        title: movie.title,
        year: movie.year,
        requireTrailerYear: Boolean(movie.require_trailer_year),
      });
      update.run(
        metadata.wikidataId,
        metadata.imdbId,
        metadata.rottenTomatoesId,
        metadata.youtubeTrailerId,
        metadata.trailerTitle,
        metadata.trailerChannel,
        metadata.imdbRating,
        metadata.rottenTomatoesScore,
        metadata.awards.length ? JSON.stringify(metadata.awards) : null,
        metadata.metadataUpdatedAt,
        movie.id
      );
      completed += 1;
      if (metadata.youtubeTrailerId) withTrailer += 1;
      if (metadata.imdbRating || metadata.rottenTomatoesScore) withRatings += 1;
      if (metadata.awards.length) withAwards += 1;
      console.log(
        `✓ ${movie.title} (${movie.year ?? "?"}) · trailer ${
          metadata.youtubeTrailerId ? "sì" : "no"
        } · rating ${metadata.imdbRating ?? "—"} / ${
          metadata.rottenTomatoesScore ?? "—"
        } · premi ${metadata.awards.length}`
      );
    } catch (error) {
      failed += 1;
      console.warn(`✗ ${movie.title}: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
}

await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, rows.length) }, () => worker())
);

console.log(
  `\nMetadati: ${completed}/${rows.length}; trailer ${withTrailer}; rating ${withRatings}; premi ${withAwards}; errori ${failed}.`
);
