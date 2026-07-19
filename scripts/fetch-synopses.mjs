// Recupera sinossi brevi da it.wikipedia per il catalogo: Wikidata trova l'entità
// film giusta (titolo it + anno), il sitelink itwiki dà la voce, la REST summary API
// dà l'incipit — tagliato a 2-3 frasi. Testo CC BY-SA: synopsis_source tiene l'URL
// della voce per l'attribuzione mostrata in pagina film.
//
//   node scripts/fetch-synopses.mjs [--force]
//
// --force: ri-controlla anche i film che hanno già synopsis.

import Database from "better-sqlite3";

const WIKIDATA = "https://www.wikidata.org/w/api.php";
const USER_AGENT =
  "SerateFilm/1.0 (https://serate.latosicurodellaroccia.xyz; cineclub privato, uso non commerciale)";
const FORCE = process.argv.includes("--force");

// Classi Wikidata accettate come "film" (le stesse di fetch-commons-posters.mjs
// più anime film e film d'animazione, che lì mancavano).
const FILM_CLASSES = new Set([
  "Q11424",
  "Q24869",
  "Q202866",
  "Q506240",
  "Q226730",
  "Q20650540", // anime film
  "Q29168811", // animated feature film
]);

async function api(base, params) {
  const url = new URL(base);
  url.search = new URLSearchParams({ format: "json", origin: "*", ...params }).toString();
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`API ${res.status} per ${url.host}`);
  return res.json();
}

// Taglia l'extract a 2-3 frasi (~400 caratteri): sinossi da bacheca, non da saggio.
function trimExtract(extract) {
  const clean = (extract ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return null;
  const sentences = clean.match(/[^.!?]+[.!?]+(?:\s|$)/g) ?? [clean];
  let out = "";
  for (const s of sentences) {
    if (out && (out.length + s.length > 400 || out.split(/[.!?]+\s/).length >= 3)) break;
    out += s;
  }
  out = out.trim();
  return out.length >= 40 ? out : null; // troppo corto = voce stub, meglio niente
}

// Wikidata: entità film col titolo/anno giusti → titolo della voce it.wikipedia.
async function findItWikiTitle(title, year) {
  const s = await api(WIKIDATA, {
    action: "wbsearchentities",
    search: title,
    language: "it",
    uselang: "it",
    type: "item",
    limit: "8",
  });
  for (const cand of s?.search ?? []) {
    const res = await api(WIKIDATA, {
      action: "wbgetentities",
      ids: cand.id,
      props: "claims|sitelinks",
      sitefilter: "itwiki",
    });
    const entity = res?.entities?.[cand.id];
    const claims = entity?.claims ?? {};
    const isFilm = (claims.P31 ?? []).some((c) => FILM_CLASSES.has(c.mainsnak?.datavalue?.value?.id));
    if (!isFilm) continue;
    if (year) {
      const years = (claims.P577 ?? [])
        .map((c) => c.mainsnak?.datavalue?.value?.time)
        .filter(Boolean)
        .map((t) => parseInt(t.slice(1, 5), 10));
      if (years.length > 0 && !years.some((y) => Math.abs(y - year) <= 1)) continue;
    }
    return entity?.sitelinks?.itwiki?.title ?? null; // entità giusta senza voce it: inutile provare altri candidati
  }
  return null;
}

// I titoli doppi del catalogo ("Scappa - Get Out") non matchano su Wikidata:
// si prova il titolo intero, poi le due metà attorno al trattino, senza punto finale.
function titleVariants(title) {
  const t = title.trim();
  const variants = [t, t.replace(/\.$/, ""), ...t.split(" - "), t.split(":")[0]];
  return [...new Set(variants.map((v) => v.trim()).filter((v) => v.length >= 3))];
}

async function fetchSynopsis(title, year) {
  let pageTitle = null;
  for (const variant of titleVariants(title)) {
    pageTitle = await findItWikiTitle(variant, year);
    if (pageTitle) break;
  }
  if (!pageTitle) return null;
  const res = await fetch(
    `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`,
    { headers: { "User-Agent": USER_AGENT } }
  );
  if (!res.ok) return null;
  const summary = await res.json();
  const text = trimExtract(summary?.extract);
  if (!text) return null;
  const sourceUrl =
    summary?.content_urls?.desktop?.page ??
    `https://it.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`;
  return { text, sourceUrl };
}

async function main() {
  const dbPath = process.env.DATABASE_PATH ?? "./data/serate.db";
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  const rows = db
    .prepare(
      FORCE
        ? "SELECT id, title, year FROM movies"
        : "SELECT id, title, year FROM movies WHERE synopsis IS NULL"
    )
    .all();

  const update = db.prepare("UPDATE movies SET synopsis = ?, synopsis_source = ? WHERE id = ?");

  let found = 0;
  let missing = 0;
  for (const movie of rows) {
    try {
      const syn = await fetchSynopsis(movie.title, movie.year);
      if (syn) {
        update.run(syn.text, syn.sourceUrl, movie.id);
        found += 1;
        console.log(`✓ ${movie.title} (${movie.year ?? "?"})`);
      } else {
        missing += 1;
        console.log(`— ${movie.title} (${movie.year ?? "?"}): nessuna voce utile`);
      }
    } catch (err) {
      missing += 1;
      console.warn(`✗ ${movie.title}: ${err.message}`);
    }
    // Rate limit gentile verso le API Wikimedia.
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\nSinossi trovate: ${found}/${rows.length} (${missing} senza).`);
}

main();
