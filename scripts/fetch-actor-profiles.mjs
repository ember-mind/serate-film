// Costruisce lib/actor-profiles.json partendo dagli interpreti dei film in archivio.
// Wikidata fornisce dati anagrafici e ritratto; Wikipedia la breve biografia.
// Le fonti e i crediti dell'immagine vengono conservati accanto a ogni profilo.

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const WIKIDATA = "https://www.wikidata.org/w/api.php";
const COMMONS = "https://commons.wikimedia.org/w/api.php";
const OUTPUT = path.resolve("lib/actor-profiles.json");
const USER_AGENT =
  "Serate/1.0 (https://serate.latosicurodellaroccia.it; archivio cinematografico privato)";
const REFRESH = process.argv.includes("--refresh");

const ACTOR_OCCUPATIONS = new Set([
  "Q33999", // actor
  "Q10800557", // film actor
  "Q10798782", // television actor
  "Q2405480", // voice actor
  "Q2259451", // stage actor
  "Q11481802", // dubbing actor
  "Q948329", // character actor
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(base, params) {
  const url = new URL(base);
  url.search = new URLSearchParams({
    format: "json",
    formatversion: "2",
    origin: "*",
    ...params,
  }).toString();
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

function chunks(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

function normalize(value) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function parseActorNames(rows) {
  return [
    ...new Set(
      rows.flatMap(({ actors }) =>
        (actors ?? "")
          .split(",")
          .map((name) => name.replace(/\s+\((?:voce|voci)\)$/i, "").trim())
          .filter(Boolean)
      )
    ),
  ].sort((a, b) => a.localeCompare(b, "it"));
}

function claimIds(entity, property) {
  return (entity?.claims?.[property] ?? [])
    .map((claim) => claim.mainsnak?.datavalue?.value?.id)
    .filter(Boolean);
}

function firstClaimValue(entity, property) {
  return entity?.claims?.[property]?.[0]?.mainsnak?.datavalue?.value ?? null;
}

function formatDate(value) {
  if (!value?.time) return null;
  const match = value.time.match(/^\+?(\d+)-(\d{2})-(\d{2})T/);
  if (!match) return null;
  const [, year, month, day] = match;
  const months = [
    "gennaio",
    "febbraio",
    "marzo",
    "aprile",
    "maggio",
    "giugno",
    "luglio",
    "agosto",
    "settembre",
    "ottobre",
    "novembre",
    "dicembre",
  ];
  if (value.precision >= 11 && day !== "00" && month !== "00") {
    return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
  }
  if (value.precision >= 10 && month !== "00") return `${months[Number(month) - 1]} ${year}`;
  return year;
}

function entityNames(entity) {
  return [
    ...Object.values(entity?.labels ?? {}).map((label) => label.value),
    ...Object.values(entity?.aliases ?? {}).flatMap((aliases) => aliases.map((alias) => alias.value)),
  ];
}

function isActor(entity) {
  if (!claimIds(entity, "P31").includes("Q5")) return false;
  if (claimIds(entity, "P106").some((id) => ACTOR_OCCUPATIONS.has(id))) return true;
  const description = Object.values(entity?.descriptions ?? {})
    .map((item) => item.value)
    .join(" ");
  return /\b(actor|actress|attore|attrice|voice actor|doppiator)/i.test(description);
}

async function searchCandidates(names) {
  const result = new Map();
  for (let index = 0; index < names.length; index += 1) {
    const name = names[index];
    const response = await api(WIKIDATA, {
      action: "wbsearchentities",
      search: name,
      language: "en",
      uselang: "it",
      type: "item",
      limit: "5",
    });
    result.set(name, (response.search ?? []).map((candidate) => candidate.id));
    if ((index + 1) % 25 === 0) process.stdout.write(`Ricerca: ${index + 1}/${names.length}\r`);
    await sleep(75);
  }
  process.stdout.write(`Ricerca: ${names.length}/${names.length}\n`);
  return result;
}

async function fetchEntities(ids, props = "claims|labels|aliases|descriptions|sitelinks") {
  const entities = new Map();
  for (const batch of chunks([...new Set(ids)], 50)) {
    const response = await api(WIKIDATA, {
      action: "wbgetentities",
      ids: batch.join("|"),
      props,
      languages: "it|en",
      languagefallback: "1",
    });
    for (const entity of Object.values(response.entities ?? {})) entities.set(entity.id, entity);
    await sleep(100);
  }
  return entities;
}

function chooseEntity(name, candidateIds, entities) {
  const wanted = normalize(name);
  const candidates = candidateIds
    .map((id, rank) => ({ entity: entities.get(id), rank }))
    .filter(({ entity }) => entity && isActor(entity))
    .map(({ entity, rank }) => {
      const names = entityNames(entity).map(normalize);
      const exact = names.includes(wanted);
      const close = names.some((candidate) => candidate.includes(wanted) || wanted.includes(candidate));
      const score = (exact ? 30 : close ? 12 : 0) + (5 - rank);
      return { entity, score };
    })
    .sort((a, b) => b.score - a.score);
  if (!candidates[0] || candidates[0].score < 12) return null;
  return candidates[0].entity;
}

function resolveRedirect(title, response) {
  const normalized = new Map((response.query?.normalized ?? []).map((item) => [item.from, item.to]));
  const redirects = new Map((response.query?.redirects ?? []).map((item) => [item.from, item.to]));
  let current = normalized.get(title) ?? title;
  const seen = new Set();
  while (redirects.has(current) && !seen.has(current)) {
    seen.add(current);
    current = redirects.get(current);
  }
  return current;
}

function trimBiography(value) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= 700) return text || null;
  const cut = text.slice(0, 700);
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return `${cut.slice(0, sentence > 350 ? sentence + 1 : 697).trim()}…`;
}

async function fetchBiographies(selected) {
  const result = new Map();
  for (const wiki of ["it", "en"]) {
    const entries = selected
      .filter(({ entity }) => (wiki === "it" ? entity.sitelinks?.itwiki : entity.sitelinks?.enwiki))
      .filter(({ entity }) => wiki === "it" || !entity.sitelinks?.itwiki)
      .map(({ name, entity }) => ({
        name,
        title: (wiki === "it" ? entity.sitelinks.itwiki : entity.sitelinks.enwiki).title,
      }));

    for (const batch of chunks(entries, 20)) {
      const response = await api(`https://${wiki}.wikipedia.org/w/api.php`, {
        action: "query",
        prop: "extracts|info",
        exintro: "1",
        explaintext: "1",
        exsentences: "4",
        inprop: "url",
        redirects: "1",
        titles: batch.map(({ title }) => title).join("|"),
      });
      const pagesByTitle = new Map(
        (response.query?.pages ?? []).map((page) => [page.title, page])
      );
      for (const entry of batch) {
        const page = pagesByTitle.get(resolveRedirect(entry.title, response));
        const description = trimBiography(page?.extract);
        if (description) result.set(entry.name, { description, source: page.fullurl });
      }
      await sleep(100);
    }
  }
  return result;
}

function decodeEntities(value) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchImages(selected) {
  const entries = selected
    .map(({ name, entity }) => ({ name, file: firstClaimValue(entity, "P18") }))
    .filter(({ file }) => file);
  const result = new Map();

  for (const batch of chunks(entries, 20)) {
    const response = await api(COMMONS, {
      action: "query",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "600",
      redirects: "1",
      titles: batch.map(({ file }) => `File:${file}`).join("|"),
    });
    const pagesByTitle = new Map(
      (response.query?.pages ?? []).map((page) => [page.title.replace(/^File:/i, ""), page])
    );
    for (const entry of batch) {
      const title = resolveRedirect(`File:${entry.file}`, response).replace(/^File:/i, "");
      const image = pagesByTitle.get(title)?.imageinfo?.[0];
      const url = image?.thumburl ?? image?.url;
      if (!url) continue;
      const metadata = image.extmetadata ?? {};
      const artist = decodeEntities(metadata.Artist?.value) || "Autore non indicato";
      const license = decodeEntities(metadata.LicenseShortName?.value) || "licenza Commons";
      result.set(entry.name, {
        url,
        credit: `${artist} — ${license}`,
        source: image.descriptionurl,
      });
    }
    await sleep(100);
  }
  return result;
}

async function main() {
  const dbPath = process.env.DATABASE_PATH ?? "./data/serate.db";
  const database = new Database(dbPath, { readonly: true });
  const names = parseActorNames(database.prepare("SELECT actors FROM movies WHERE actors IS NOT NULL").all());
  database.close();
  const previous = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, "utf8")) : {};
  const wanted = REFRESH ? names : names.filter((name) => !previous[name]?.wikidataId);
  if (wanted.length === 0) {
    console.log(`Nessun profilo da aggiornare (${names.length} già presenti)`);
    return;
  }

  const candidateIds = await searchCandidates(wanted);
  const entities = await fetchEntities([...candidateIds.values()].flat());
  const selected = wanted
    .map((name) => ({ name, entity: chooseEntity(name, candidateIds.get(name) ?? [], entities) }))
    .filter(({ entity }) => entity);
  const relatedIds = selected.flatMap(({ entity }) => [
    ...claimIds(entity, "P19"),
    ...claimIds(entity, "P27"),
  ]);
  const related = await fetchEntities(relatedIds, "labels");
  const biographies = await fetchBiographies(selected);
  const images = await fetchImages(selected);
  const selectedByName = new Map(selected.map((item) => [item.name, item.entity]));
  const output = {};

  for (const name of names) {
    const entity = selectedByName.get(name);
    if (!entity) {
      output[name] = previous[name] ?? { name };
      continue;
    }
    const biography = biographies.get(name);
    const image = images.get(name);
    const birthPlace = claimIds(entity, "P19")
      .map((id) => related.get(id)?.labels?.it?.value ?? related.get(id)?.labels?.en?.value)
      .find(Boolean);
    const citizenship = claimIds(entity, "P27")
      .map((id) => related.get(id)?.labels?.it?.value ?? related.get(id)?.labels?.en?.value)
      .filter(Boolean);
    output[name] = {
      name,
      wikidataId: entity.id,
      description:
        biography?.description ?? entity.descriptions?.it?.value ?? entity.descriptions?.en?.value,
      birthDate: formatDate(firstClaimValue(entity, "P569")),
      deathDate: formatDate(firstClaimValue(entity, "P570")),
      birthPlace,
      citizenship: [...new Set(citizenship)],
      imageUrl: image?.url,
      imageCredit: image?.credit,
      imageSource: image?.source,
      biographySource: biography?.source,
      wikidataSource: `https://www.wikidata.org/wiki/${entity.id}`,
    };
  }

  const sorted = Object.fromEntries(
    Object.entries(output).sort(([a], [b]) => a.localeCompare(b, "it"))
  );
  fs.writeFileSync(OUTPUT, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(
    `Profili: ${selected.length}/${wanted.length}; ritratti: ${images.size}; biografie: ${biographies.size}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
