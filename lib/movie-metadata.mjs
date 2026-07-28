const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const YOUTUBE_SEARCH = "https://www.youtube.com/results";
const USER_AGENT =
  "SerateFilm/1.0 (https://serate.latosicurodellaroccia.xyz; cineclub privato, uso non commerciale)";

const FILM_CLASSES = new Set([
  "Q11424", // film
  "Q24869", // lungometraggio
  "Q202866", // film d'animazione
  "Q506240", // film per la televisione
  "Q226730", // film muto
  "Q93204", // documentario
  "Q20650540", // anime film
  "Q29168811", // lungometraggio animato
]);

const IMDB = "Q37312";
const ROTTEN_TOMATOES = "Q105584";
const ITALIAN = "Q652";
const ENGLISH = "Q1860";

const OFFICIAL_CHANNELS =
  /warner|universal|paramount|disney|pixar|netflix|sony pictures|20th century|searchlight|lionsgate|mgm|a24|neon|focus features|studiocanal|01 distribution|rai cinema|medusa|eagle pictures|lucky red|vision distribution|bim distribuzione|i wonder|notorious pictures|filmauro|movies inspired|vertice 360/i;
const BAD_TRAILER_WORDS =
  /\b(fan[\s-]?made|fan trailer|concept|reaction|recensione|analisi|parodia|spoof|honest trailer|the treilers|ending|finale|epilogo|la serie|tv series|lost reel|newly discovered|movie explained)\b/i;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15_000),
      });
      if (response.ok) return response;
      if (response.status !== 429 && response.status < 500) {
        throw new Error(`HTTP ${response.status} per ${new URL(url).host}`);
      }
      lastError = new Error(`HTTP ${response.status} per ${new URL(url).host}`);
    } catch (error) {
      lastError = new Error(`${new URL(url).host}: ${error.message}`);
    }
    await wait(1_000 * 2 ** attempt);
  }
  throw lastError;
}

async function wikidataApi(params) {
  const url = new URL(WIKIDATA_API);
  url.search = new URLSearchParams({
    format: "json",
    origin: "*",
    ...params,
  }).toString();
  const response = await fetchWithRetry(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  return response.json();
}

function claimValues(claims, property) {
  return (claims?.[property] ?? [])
    .filter((claim) => claim.rank !== "deprecated")
    .map((claim) => claim.mainsnak?.datavalue?.value)
    .filter((value) => value !== undefined);
}

function entityId(value) {
  return typeof value === "object" && value ? value.id : null;
}

function titleVariants(title) {
  const clean = title.trim();
  const variants = [
    clean,
    clean.replace(/\.$/, ""),
    ...clean.split(/\s[-–—]\s/),
    clean.split(":")[0],
  ];
  return [...new Set(variants.map((value) => value.trim()).filter((value) => value.length >= 2))];
}

function releaseYears(claims) {
  return claimValues(claims, "P577")
    .map((value) => value?.time)
    .filter(Boolean)
    .map((time) => Number(time.slice(1, 5)))
    .filter(Number.isFinite);
}

function isFilm(entity) {
  const classes = claimValues(entity?.claims, "P31").map(entityId).filter(Boolean);
  return classes.some((id) => FILM_CLASSES.has(id));
}

async function findWikidataEntity(title, year) {
  const seen = new Set();
  for (const language of ["it", "en"]) {
    for (const variant of titleVariants(title)) {
      const search = await wikidataApi({
        action: "wbsearchentities",
        search: variant,
        language,
        uselang: "it",
        type: "item",
        limit: "8",
      });
      for (const candidate of search?.search ?? []) {
        if (seen.has(candidate.id)) continue;
        seen.add(candidate.id);
        const response = await wikidataApi({
          action: "wbgetentities",
          ids: candidate.id,
          props: "claims|labels",
          languages: "it|en",
        });
        const entity = response?.entities?.[candidate.id];
        if (!entity || !isFilm(entity)) continue;
        const years = releaseYears(entity.claims);
        if (year && years.length > 0 && !years.some((value) => Math.abs(value - year) <= 1)) {
          continue;
        }
        return { id: candidate.id, entity };
      }
    }
  }
  return null;
}

async function labelsFor(ids) {
  if (ids.length === 0) return new Map();
  const labels = new Map();
  for (let index = 0; index < ids.length; index += 50) {
    const batch = ids.slice(index, index + 50);
    const response = await wikidataApi({
      action: "wbgetentities",
      ids: batch.join("|"),
      props: "labels",
      languages: "it|en",
    });
    for (const id of batch) {
      const item = response?.entities?.[id];
      const label = item?.labels?.it?.value ?? item?.labels?.en?.value;
      if (label) labels.set(id, label);
    }
  }
  return labels;
}

function scoreFrom(entity, providerId, pattern) {
  const candidates = (entity?.claims?.P444 ?? [])
    .filter((claim) => claim.rank !== "deprecated")
    .map((claim) => ({
      value: claim.mainsnak?.datavalue?.value,
      provider: entityId(claim.qualifiers?.P447?.[0]?.datavalue?.value),
      date: claim.qualifiers?.P585?.[0]?.datavalue?.value?.time ?? "",
    }))
    .filter(
      (rating) =>
        rating.provider === providerId &&
        typeof rating.value === "string" &&
        pattern.test(rating.value)
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return candidates[0]?.value ?? null;
}

function textFromRuns(value) {
  if (typeof value?.simpleText === "string") return value.simpleText;
  return (value?.runs ?? []).map((run) => run.text ?? "").join("").trim();
}

function durationSeconds(value) {
  const parts = String(value ?? "")
    .split(":")
    .map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return null;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function significantWords(value) {
  const stop = new Set([
    "il",
    "la",
    "lo",
    "gli",
    "le",
    "un",
    "una",
    "the",
    "of",
    "and",
    "di",
    "del",
    "della",
    "parte",
    "film",
  ]);
  return normalize(value)
    .split(" ")
    .filter((word) => word.length > 2 && !stop.has(word));
}

function sequelNumber(value) {
  const normalized = normalize(value)
    .replace(/\bone\b/g, "1")
    .replace(/\btwo\b/g, "2")
    .replace(/\bthree\b/g, "3")
    .replace(/\buno\b/g, "1")
    .replace(/\bdue\b/g, "2")
    .replace(/\btre\b/g, "3")
    .replace(/\bii\b/g, "2")
    .replace(/\biii\b/g, "3")
    .replace(/\biv\b/g, "4");
  const marked = normalized.match(/\b(?:parte|part|volume|vol|capitolo|chapter)\s*([1-9])\b/);
  return marked ? Number(marked[1]) : null;
}

function youtubeResults(html) {
  const markers = ["var ytInitialData = ", "window[\"ytInitialData\"] = "];
  let data = null;
  for (const marker of markers) {
    const start = html.indexOf(marker);
    if (start < 0) continue;
    const jsonStart = start + marker.length;
    const jsonEnd = html.indexOf(";</script>", jsonStart);
    if (jsonEnd < 0) continue;
    try {
      data = JSON.parse(html.slice(jsonStart, jsonEnd));
      break;
    } catch {
      // Prova eventuale formato alternativo.
    }
  }
  if (!data) return [];

  const videos = [];
  const walk = (value) => {
    if (!value || typeof value !== "object") return;
    if (value.videoRenderer) videos.push(value.videoRenderer);
    for (const child of Object.values(value)) walk(child);
  };
  walk(data);

  const seen = new Set();
  return videos
    .map((video, index) => ({
      id: video.videoId,
      title: textFromRuns(video.title),
      channel: textFromRuns(video.ownerText),
      duration: textFromRuns(video.lengthText),
      position: index,
    }))
    .filter((video) => {
      if (!/^[A-Za-z0-9_-]{11}$/.test(video.id ?? "") || seen.has(video.id)) return false;
      seen.add(video.id);
      return true;
    });
}

function bestTitleMatch(videoTitle, titles) {
  const normalizedVideo = normalize(videoTitle);
  const videoTokens = new Set(normalizedVideo.split(" "));
  let best = 0;
  for (const title of titles.flatMap(titleVariants)) {
    const normalizedTitle = normalize(title);
    const compactTitle = normalizedTitle.replaceAll(" ", "");
    const compactVideo = normalizedVideo.replaceAll(" ", "");
    if (
      (normalizedTitle.length <= 2 && videoTokens.has(normalizedTitle)) ||
      (compactTitle.length >= 4 && compactVideo.includes(compactTitle))
    ) {
      best = Math.max(best, 1);
    }
    const words = significantWords(title);
    if (words.length > 0) {
      const overlap = words.filter((word) => normalizedVideo.includes(word)).length;
      best = Math.max(best, overlap / words.length);
    }
  }
  return best;
}

function trailerScore(video, title, aliases, year, requireYear) {
  const label = `${video.title} ${video.channel}`;
  if (!/\btrailer\b/i.test(video.title) || BAD_TRAILER_WORDS.test(label)) return -100;
  const seconds = durationSeconds(video.duration);
  if (seconds !== null && (seconds < 25 || seconds > 10 * 60)) return -100;

  const titleMatch = bestTitleMatch(video.title, [title, ...aliases]);
  if (titleMatch < 0.75) return -100;
  const expectedSequel = sequelNumber(title);
  if (expectedSequel && sequelNumber(video.title) !== expectedSequel) return -100;
  if (requireYear && year && !new RegExp(`\\b${year}\\b`).test(video.title)) return -100;
  const mentionedYears = [...video.title.matchAll(/\b(?:19|20)\d{2}\b/g)].map((match) =>
    Number(match[0])
  );
  if (
    year &&
    mentionedYears.length > 0 &&
    !mentionedYears.some((value) => Math.abs(value - year) <= 1) &&
    !mentionedYears.some((value) => new RegExp(`\\b${value}\\b`).test(title))
  ) {
    return -100;
  }

  let score = 10 - video.position;
  if (/\b(ufficiale|official)\b/i.test(video.title)) score += 3;
  if (OFFICIAL_CHANNELS.test(video.channel)) score += 4;
  if (/\b(italiano|italian|ita)\b/i.test(video.title)) score += 2;
  if (year && new RegExp(`\\b${year}\\b`).test(video.title)) score += 5;
  score += titleMatch * 4;
  return score;
}

async function searchYouTube(title, aliases, year, language, requireYear) {
  const query =
    language === "it"
      ? `${title} ${year ?? ""} trailer italiano ufficiale`
      : `${title} ${year ?? ""} official trailer`;
  const url = new URL(YOUTUBE_SEARCH);
  url.searchParams.set("search_query", query.trim());
  const response = await fetchWithRetry(url, {
    headers: {
      "Accept-Language": language === "it" ? "it-IT,it;q=0.9,en;q=0.7" : "en-US,en;q=0.9",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36",
    },
  });
  const candidates = youtubeResults(await response.text())
    .map((video) => ({
      ...video,
      score: trailerScore(video, title, aliases, year, requireYear),
    }))
    .filter((video) => video.score >= 5)
    .sort((a, b) => b.score - a.score);
  return candidates[0] ?? null;
}

async function findTrailer(title, aliases, year, requireYear) {
  return (
    (await searchYouTube(title, aliases, year, "it", requireYear)) ??
    searchYouTube(title, aliases, year, "en", requireYear)
  );
}

export async function fetchMovieMetadata({ title, year, requireTrailerYear = false }) {
  const [matchResult] = await Promise.allSettled([findWikidataEntity(title, year)]);
  const match = matchResult.status === "fulfilled" ? matchResult.value : null;
  const aliases = [
    match?.entity?.labels?.it?.value,
    match?.entity?.labels?.en?.value,
  ].filter(Boolean);
  const [trailerResult] = await Promise.allSettled([
    findTrailer(title, aliases, year, requireTrailerYear),
  ]);
  if (matchResult.status === "rejected" && trailerResult.status === "rejected") {
    throw new Error(
      `fonti non raggiungibili (${matchResult.reason.message}; ${trailerResult.reason.message})`
    );
  }
  const trailer = trailerResult.status === "fulfilled" ? trailerResult.value : null;

  const claims = match?.entity?.claims ?? {};
  const awardIds = claimValues(claims, "P166").map(entityId).filter(Boolean);
  const awardLabels = await labelsFor([...new Set(awardIds)]);
  const awardPriority = (label) =>
    /oscar|palma d.oro|leone d.oro|orso d.oro|golden globe|bafta|césar|david di donatello/i.test(
      label
    )
      ? 0
      : 1;
  const awards = [...new Set(awardIds.map((id) => awardLabels.get(id)).filter(Boolean))].sort(
    (a, b) => awardPriority(a) - awardPriority(b) || a.localeCompare(b, "it")
  );

  return {
    wikidataId: match?.id ?? null,
    imdbId: claimValues(claims, "P345")[0] ?? null,
    rottenTomatoesId: claimValues(claims, "P1258")[0] ?? null,
    youtubeTrailerId: trailer?.id ?? null,
    trailerTitle: trailer?.title ?? null,
    trailerChannel: trailer?.channel ?? null,
    imdbRating: scoreFrom(match?.entity, IMDB, /^\d+(?:[.,]\d+)?\/10$/),
    rottenTomatoesScore: scoreFrom(match?.entity, ROTTEN_TOMATOES, /^\d{1,3}%$/),
    awards,
    metadataUpdatedAt: new Date().toISOString(),
  };
}

export const movieMetadataSources = {
  wikidata: "https://www.wikidata.org/",
  youtube: "https://www.youtube.com/",
};
