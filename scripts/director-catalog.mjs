import fs from "node:fs";
import path from "node:path";
import { CLASSIC_FILMS } from "./classic-films.mjs";

export function directorSlug(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const source = fs.readFileSync(path.join(process.cwd(), "scripts", "seed-movies.mjs"), "utf8");
const inlineFilms = [...source.matchAll(
  /^\s*\["((?:[^"\\]|\\.)*)",\s*(\d{4}),\s*"((?:[^"\\]|\\.)*)",/gm,
)].map(([, encodedTitle, year, encodedDirector]) => ({
  title: JSON.parse(`"${encodedTitle}"`),
  year: Number(year),
  director: JSON.parse(`"${encodedDirector}"`),
}));

const films = [
  ...CLASSIC_FILMS.map(({ title, year, director }) => ({ title, year, director })),
  ...inlineFilms,
];
const byDirector = new Map();

for (const film of films) {
  for (const name of film.director.split(",").map((part) => part.trim()).filter(Boolean)) {
    const existing = byDirector.get(name) ?? [];
    if (!existing.some(({ title, year }) => title === film.title && year === film.year)) {
      existing.push({ title: film.title, year: film.year });
    }
    byDirector.set(name, existing);
  }
}

export const DIRECTOR_CATALOG = [...byDirector.entries()]
  .map(([name, filmography]) => ({
    name,
    slug: directorSlug(name),
    filmography: filmography.sort((a, b) => (a.year ?? 0) - (b.year ?? 0)),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "it"));
