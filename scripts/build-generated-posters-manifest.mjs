// Genera mapping TypeScript solo per artwork presenti in public/posters/generated/.
// Uso: node scripts/build-generated-posters-manifest.mjs
import fs from "node:fs";
import path from "node:path";
import { CLASSIC_FILMS } from "./classic-films.mjs";

const root = process.cwd();
const seedPath = path.join(root, "scripts", "seed-movies.mjs");
const artworkDir = path.join(root, "public", "posters", "generated");
const outputPath = path.join(root, "lib", "generatedPosters.ts");

function slugify(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const source = fs.readFileSync(seedPath, "utf8");
const films = [
  ...CLASSIC_FILMS.map(({ title, year }) => ({ title, year })),
  ...[...source.matchAll(/^\s*\["((?:[^"\\]|\\.)*)",\s*(\d{4}),/gm)].map(
    ([, encodedTitle, year]) => ({
      title: JSON.parse(`"${encodedTitle}"`),
      year: Number(year),
    })
  ),
];

const available = new Set(
  fs.existsSync(artworkDir) ? fs.readdirSync(artworkDir).filter((name) => name.endsWith(".webp")) : []
);
const entries = films.flatMap(({ title, year }) => {
  const filename = `${year}-${slugify(title)}.webp`;
  return available.has(filename)
    ? [[`${year}\u0000${title}`, `/posters/generated/${filename}`]]
    : [];
});

const body = entries
  .map(([key, url]) => `  ${JSON.stringify(key)}: ${JSON.stringify(url)},`)
  .join("\n");
const generated = `// Generato da scripts/build-generated-posters-manifest.mjs. Non modificare a mano.\nconst GENERATED_POSTERS: Record<string, string> = {\n${body}\n};\n\nexport function generatedPosterFor(title: string, year?: number | null): string | null {\n  if (!year) return null;\n  return GENERATED_POSTERS[\`${"${year}"}\\u0000${"${title}"}\`] ?? null;\n}\n`;

fs.writeFileSync(outputPath, generated);
console.log(`Manifest: ${entries.length}/${films.length} artwork in ${path.relative(root, outputPath)}.`);
