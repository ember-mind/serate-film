// Genera migrazione dati idempotente per i 100 classici.
import fs from "node:fs";
import path from "node:path";
import { CLASSIC_FILMS } from "./classic-films.mjs";

const sql = (value) => value == null ? "NULL" : `'${String(value).replaceAll("'", "''")}'`;
const rows = CLASSIC_FILMS.map(({ title, year, director, actors, genres, runtime, synopsis }) => {
  const key = `\`title\` = ${sql(title)} AND \`year\` = ${year}`;
  return [
    `INSERT OR IGNORE INTO \`movies\` (\`title\`, \`year\`, \`director\`, \`actors\`, \`genres\`, \`runtime\`, \`synopsis\`, \`synopsis_source\`) VALUES (${sql(title)}, ${year}, ${sql(director)}, ${sql(actors)}, ${sql(genres)}, ${runtime}, ${sql(synopsis)}, NULL);`,
    `UPDATE \`movies\` SET \`director\` = COALESCE(\`director\`, ${sql(director)}), \`actors\` = COALESCE(\`actors\`, ${sql(actors)}), \`genres\` = COALESCE(\`genres\`, ${sql(genres)}), \`runtime\` = COALESCE(\`runtime\`, ${runtime}), \`synopsis\` = COALESCE(\`synopsis\`, ${sql(synopsis)}) WHERE ${key};`,
  ].join("\n--> statement-breakpoint\n");
}).join("\n--> statement-breakpoint\n");

const output = path.join(process.cwd(), "db", "migrations", "0009_seed-classics.sql");
fs.writeFileSync(output, `-- Cento classici 1921–1994 con metadati, durata e sinossi originale.\n${rows}\n`);
console.log(`Migrazione: ${CLASSIC_FILMS.length} film in ${path.relative(process.cwd(), output)}.`);
