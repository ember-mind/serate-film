// Recupera locandine da Wikimedia Commons (solo materiale libero) per il catalogo.
// Coverage attesa bassa (~<20%): la maggior parte dei 209 film è ancora sotto
// copyright, quindi Commons non ospita il poster ufficiale. Dove non trova nulla
// resta il fallback SVG di genere (components/Poster.tsx).
//
//   node scripts/fetch-commons-posters.mjs [--force]
//
// --force: ri-controlla anche i film che hanno già poster_url (per aggiornare licenza/URL).

import Database from "better-sqlite3";

const COMMONS = "https://commons.wikimedia.org/w/api.php";
const WIKIDATA = "https://www.wikidata.org/w/api.php";
const USER_AGENT =
  "SerateFilm/1.0 (https://serate.latosicurodellaroccia.xyz; cineclub privato, uso non commerciale)";
const FORCE = process.argv.includes("--force");

// Classi Wikidata accettate come "film".
const FILM_CLASSES = new Set(["Q11424", "Q24869", "Q202866", "Q506240", "Q226730"]);

async function api(base, params) {
  const url = new URL(base);
  url.search = new URLSearchParams({ format: "json", origin: "*", ...params }).toString();
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`API ${res.status} per ${url.host}`);
  return res.json();
}

function stripHtml(s) {
  return (s ?? "").replace(/<[^>]*>/g, "").trim();
}

async function commonsImage(fileName) {
  const info = await api(COMMONS, {
    action: "query",
    titles: `File:${fileName}`,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "500", // thumbnail: l'originale può pesare molti MB
  });
  const page = Object.values(info?.query?.pages ?? {})[0];
  const imageinfo = page?.imageinfo?.[0];
  const imageUrl = imageinfo?.thumburl ?? imageinfo?.url;
  if (!imageUrl) return null;
  const meta = imageinfo.extmetadata ?? {};
  const artist = stripHtml(meta.Artist?.value) || "Wikimedia Commons";
  const license = meta.LicenseShortName?.value || "licenza libera";
  return { url: imageUrl, credit: `${artist} — ${license} (Wikimedia Commons)` };
}

function normalize(s) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const STOP = new Set(["il", "la", "lo", "gli", "le", "un", "una", "the", "of", "and", "di", "del", "della", "e", "a"]);
function significantWords(title) {
  return normalize(title)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP.has(w));
}

// Cerca su Commons un file che sembri il poster del titolo dato. Molto conservativo:
// i titoli corti/omonimi pescano poster di ALTRI film (remake, film muti PD con lo
// stesso nome), quindi: ≥3 parole significative tutte da matchare, e se il filename
// contiene un anno dev'essere quello del film (±2).
async function commonsSearch(title, year) {
  const words = significantWords(title);
  if (words.length < 3) return null;
  const search = await api(COMMONS, {
    action: "query",
    list: "search",
    srnamespace: "6",
    srsearch: `${title} poster`,
    srlimit: "10",
  });
  for (const hit of search?.query?.search ?? []) {
    const raw = hit.title.replace(/^file:/i, "");
    if (!/\.(jpe?g|png|webp)$/i.test(raw)) continue;
    const compact = normalize(raw.replace(/\.[a-z0-9]+$/i, "")).replace(/ /g, "");
    if (!/poster|locandina|manifesto|affiche/.test(compact)) continue;
    const overlap = words.filter((w) => compact.includes(w)).length;
    if (overlap / words.length < 0.9) continue;
    // L'anno del film DEVE comparire nel filename: senza, si peschano poster di
    // remake/omonimi d'epoca (già successo: "All Quiet on the Western Front" 1930).
    const yearsInName = (raw.match(/\b(19|20)\d{2}\b/g) ?? []).map(Number);
    if (!year || !yearsInName.some((y) => Math.abs(y - year) <= 2)) continue;
    return commonsImage(raw);
  }
  return null;
}

// Wikidata: trova l'entità film (titolo it, anno giusto) → poster diretto (P3383/P18)
// oppure titolo inglese, con cui cercare il file su Commons (i filename sono quasi
// sempre in inglese).
async function findPoster(title, year) {
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
      props: "claims|labels",
      languages: "en|it",
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

    // 1) poster linkato direttamente su Wikidata — solo P3383 "film poster":
    // P18 "image" è quasi sempre una foto di première o un logo, non il poster.
    const direct = (claims.P3383 ?? [])[0]?.mainsnak?.datavalue?.value;
    if (direct && /\.(jpe?g|png|webp)$/i.test(direct)) {
      const img = await commonsImage(direct);
      if (img) return img;
    }

    // 2) ricerca su Commons col titolo inglese (poi italiano)
    const enLabel = entity?.labels?.en?.value;
    for (const label of [enLabel, title].filter(Boolean)) {
      const img = await commonsSearch(label, year);
      if (img) return img;
    }
    return null; // entità giusta trovata ma nessun poster libero: inutile provare altri candidati
  }
  return null;
}

async function main() {
  const dbPath = process.env.DATABASE_PATH ?? "./data/serate.db";
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  const rows = db
    .prepare(
      FORCE
        ? "SELECT id, title, year FROM movies"
        : "SELECT id, title, year FROM movies WHERE poster_url IS NULL"
    )
    .all();

  const update = db.prepare("UPDATE movies SET poster_url = ?, poster_credit = ? WHERE id = ?");

  let found = 0;
  let missing = 0;
  for (const movie of rows) {
    try {
      const poster = await findPoster(movie.title, movie.year);
      if (poster) {
        update.run(poster.url, poster.credit, movie.id);
        found += 1;
        console.log(`✓ ${movie.title} (${movie.year ?? "?"}) → ${poster.credit}`);
      } else {
        missing += 1;
      }
    } catch (err) {
      missing += 1;
      console.warn(`✗ ${movie.title}: ${err.message}`);
    }
    // Rate limit gentile verso l'API Commons.
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\nLocandine trovate: ${found}/${rows.length} (${missing} senza match, restano SVG di genere).`);
}

main();
