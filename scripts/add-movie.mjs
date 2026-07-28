// Aggiunge un film al catalogo (usato dall'AI per evadere i suggerimenti).
// Uso:
//   node scripts/add-movie.mjs --title "Titolo" [--year 1999] [--director "Nome"] \
//     [--actors "A, B"] [--genres "Thriller"] [--suggestion 3]
// --suggestion <id>: marca il suggerimento come 'added' e lo collega al film.
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fetchMovieMetadata } from "../lib/movie-metadata.mjs";

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 2) {
  if (!argv[i].startsWith("--") || argv[i + 1] === undefined) {
    console.error(`Argomento non valido: ${argv[i]}`);
    process.exit(1);
  }
  args[argv[i].slice(2)] = argv[i + 1];
}

if (!args.title) {
  console.error("Serve --title.");
  process.exit(1);
}

const dbPath = process.env.DATABASE_PATH ?? "./data/serate.db";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const res = db
  .prepare(
    "INSERT OR IGNORE INTO movies (title, year, director, actors, genres, runtime) VALUES (?, ?, ?, ?, ?, ?)"
  )
  .run(
    args.title,
    args.year ? Number(args.year) : null,
    args.director ?? null,
    args.actors ?? null,
    args.genres ?? null,
    args.runtime ? Number(args.runtime) : null
  );

let movieId;
if (res.changes > 0) {
  movieId = res.lastInsertRowid;
  console.log(`Aggiunto '${args.title}' (id ${movieId}).`);
} else {
  const row = db
    .prepare("SELECT id FROM movies WHERE title = ? AND year IS ?")
    .get(args.title, args.year ? Number(args.year) : null);
  movieId = row?.id;
  console.log(`'${args.title}' già in catalogo (id ${movieId ?? "?"}).`);
}

if (args.suggestion && movieId) {
  const s = db
    .prepare("UPDATE suggestions SET status = 'added', movie_id = ? WHERE id = ?")
    .run(movieId, Number(args.suggestion));
  console.log(s.changes > 0 ? `Suggerimento ${args.suggestion} evaso.` : `Suggerimento ${args.suggestion} non trovato.`);
}

if (movieId) {
  try {
    const metadata = await fetchMovieMetadata({
      title: args.title,
      year: args.year ? Number(args.year) : null,
    });
    db.prepare(
      `UPDATE movies SET
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
      WHERE id = ?`
    ).run(
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
      movieId
    );
    console.log(
      `Metadati internet: trailer ${metadata.youtubeTrailerId ? "sì" : "no"}, rating ${
        metadata.imdbRating ?? "—"
      } / ${metadata.rottenTomatoesScore ?? "—"}, premi ${metadata.awards.length}.`
    );
  } catch (error) {
    console.warn(`Metadati internet non disponibili: ${error.message}`);
  }
}
