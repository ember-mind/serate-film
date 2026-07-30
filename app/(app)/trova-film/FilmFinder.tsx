"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Poster } from "@/components/Poster";

type Availability = {
  provider: string;
  type: "subscription" | "rent" | "buy" | "cinema" | "free";
  url: string | null;
  price: string | null;
};

type FinderMovie = {
  id: number;
  slug: string;
  title: string;
  year: number | null;
  director: string | null;
  genres: string | null;
  runtime: number | null;
  posterUrl: string | null;
  posterCredit: string | null;
  imdbRating: string | null;
  seen: boolean;
  inWatchlist: boolean;
  availability: Availability[];
};

type MoodId = "any" | "light" | "adrenaline" | "tension" | "thoughtful";
type RuntimeId = "any" | "100" | "120" | "150";

const MOODS: Array<{
  id: MoodId;
  label: string;
  icon: string;
  genres: string[];
}> = [
  { id: "any", label: "Sorprendimi", icon: "✦", genres: [] },
  {
    id: "light",
    label: "Leggero",
    icon: "☀",
    genres: ["commedia", "comedy", "animazione", "animation", "family", "romance"],
  },
  {
    id: "adrenaline",
    label: "Adrenalina",
    icon: "⚡",
    genres: ["azione", "action", "avventura", "adventure", "crime", "thriller"],
  },
  {
    id: "tension",
    label: "Tensione",
    icon: "◐",
    genres: ["horror", "thriller", "mystery", "giallo"],
  },
  {
    id: "thoughtful",
    label: "Da discutere",
    icon: "◌",
    genres: [
      "dramma",
      "drama",
      "documentario",
      "documentary",
      "storia",
      "history",
      "fantascienza",
      "science fiction",
    ],
  },
];

const RUNTIMES: Array<{ id: RuntimeId; label: string }> = [
  { id: "any", label: "Nessun limite" },
  { id: "100", label: "Entro 1h 40" },
  { id: "120", label: "Entro 2 ore" },
  { id: "150", label: "Entro 2h 30" },
];

const availabilityLabel: Record<Availability["type"], string> = {
  subscription: "in abbonamento",
  rent: "a noleggio",
  buy: "da acquistare",
  cinema: "al cinema",
  free: "gratis",
};

function matchesMood(movie: FinderMovie, mood: MoodId) {
  const selected = MOODS.find((item) => item.id === mood);
  if (!selected || selected.genres.length === 0) return true;
  const genres = (movie.genres ?? "").toLocaleLowerCase("it");
  return selected.genres.some((genre) => genres.includes(genre));
}

function numericRating(value: string | null) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function reasonsFor(
  movie: FinderMovie,
  mood: MoodId,
  provider: string,
  onlyUnseen: boolean
) {
  const reasons: string[] = [];
  const selectedMood = MOODS.find((item) => item.id === mood);
  if (mood !== "any" && selectedMood) reasons.push(`Mood ${selectedMood.label.toLowerCase()}`);
  if (movie.runtime) reasons.push(`${movie.runtime} minuti`);
  if (provider !== "any") {
    const option = movie.availability.find((item) => item.provider === provider);
    if (option) reasons.push(`${provider} ${availabilityLabel[option.type]}`);
  } else if (movie.availability.length > 0) {
    reasons.push(`Disponibile su ${movie.availability[0].provider}`);
  }
  if (onlyUnseen && !movie.seen) reasons.push("Non l’hai ancora visto");
  if (movie.inWatchlist) reasons.push("Già nella watchlist");
  return reasons.slice(0, 4);
}

export function FilmFinder({ movies }: { movies: FinderMovie[] }) {
  const [mood, setMood] = useState<MoodId>("any");
  const [runtime, setRuntime] = useState<RuntimeId>("120");
  const [provider, setProvider] = useState("any");
  const [onlyUnseen, setOnlyUnseen] = useState(true);

  const providers = useMemo(
    () =>
      [...new Set(movies.flatMap((movie) => movie.availability.map((item) => item.provider)))].sort(
        (a, b) => a.localeCompare(b, "it")
      ),
    [movies]
  );

  const matches = useMemo(() => {
    const limit = runtime === "any" ? null : Number(runtime);

    return movies
      .filter((movie) => !onlyUnseen || !movie.seen)
      .filter((movie) => !limit || movie.runtime === null || movie.runtime <= limit)
      .filter((movie) => matchesMood(movie, mood))
      .filter(
        (movie) =>
          provider === "any" || movie.availability.some((item) => item.provider === provider)
      )
      .map((movie) => {
        let score = numericRating(movie.imdbRating);
        if (movie.inWatchlist) score += 4;
        if (mood !== "any") score += 3;
        if (provider !== "any") score += 3;
        if (!movie.seen) score += 1;
        if (limit && movie.runtime && movie.runtime <= limit) score += 1;
        return { movie, score };
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          numericRating(b.movie.imdbRating) - numericRating(a.movie.imdbRating) ||
          a.movie.title.localeCompare(b.movie.title, "it")
      )
      .slice(0, 6);
  }, [mood, movies, onlyUnseen, provider, runtime]);

  const reset = () => {
    setMood("any");
    setRuntime("any");
    setProvider("any");
    setOnlyUnseen(false);
  };
  const hasFilters =
    mood !== "any" || runtime !== "any" || provider !== "any" || onlyUnseen;

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:items-start">
      <aside className="ticket p-5 lg:sticky lg:top-24" aria-label="Preferenze per la serata">
        <fieldset>
          <legend className="step-title w-full">Che atmosfera?</legend>
          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {MOODS.map((item) => (
              <label
                key={item.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-riga bg-notte px-3 py-2 text-sm transition-colors has-checked:border-proiettore has-checked:bg-proiettore/10"
              >
                <input
                  type="radio"
                  name="mood"
                  value={item.id}
                  checked={mood === item.id}
                  onChange={() => setMood(item.id)}
                  className="sr-only"
                />
                <span aria-hidden className="w-5 text-center text-proiettore">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-6 block">
          <span className="eyebrow block">Quanto tempo hai?</span>
          <select
            value={runtime}
            onChange={(event) => setRuntime(event.target.value as RuntimeId)}
            className="mt-2 min-h-11 w-full rounded-lg border border-riga bg-notte px-3 text-sm text-schermo"
          >
            {RUNTIMES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block">
          <span className="eyebrow block">Dove puoi vederlo?</span>
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-lg border border-riga bg-notte px-3 text-sm text-schermo"
          >
            <option value="any">Qualsiasi piattaforma</option>
            {providers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {providers.length === 0 && (
            <span className="mt-2 block text-xs leading-relaxed text-fumo">
              Disponibilità non ancora importata. Puoi scegliere usando mood e durata.
            </span>
          )}
        </label>

        <label className="mt-5 flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-lg border border-riga bg-notte px-3 py-2 text-sm has-checked:border-proiettore">
          <span>Solo film mai visti da me</span>
          <input
            type="checkbox"
            checked={onlyUnseen}
            onChange={(event) => setOnlyUnseen(event.target.checked)}
            className="h-4 w-4 accent-[#d4a24e]"
          />
        </label>
      </aside>

      <section aria-labelledby="risultati">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Selezione della cabina</p>
            <h2 id="risultati" className="titlecard mt-1 text-xl text-schermo">
              {matches.length > 0
                ? `${matches.length} ${matches.length === 1 ? "film giusto" : "film giusti"}`
                : "Nessun incastro"}
            </h2>
          </div>
          <button
            type="button"
            onClick={reset}
            disabled={!hasFilters}
            className="min-h-11 shrink-0 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-fumo transition-colors hover:text-schermo disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-fumo"
          >
            Azzera filtri
          </button>
        </div>

        {matches.length === 0 ? (
          <div className="ticket p-8 text-center">
            <p className="titlecard text-lg text-schermo">Troppi paletti per la serata</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fumo">
              Prova una durata più lunga, qualsiasi piattaforma oppure includi film già visti.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 min-h-11 rounded-lg bg-proiettore px-5 text-sm font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso"
            >
              Mostra tutto il catalogo
            </button>
          </div>
        ) : (
          <ol className="grid gap-4 sm:grid-cols-2">
            {matches.map(({ movie }, index) => {
              const reasons = reasonsFor(movie, mood, provider, onlyUnseen);
              return (
                <li key={movie.id} className="ticket overflow-hidden">
                  <div className="flex h-full">
                    <Link
                      href={`/film/${movie.slug}`}
                      aria-label={`Apri la scheda di ${movie.title}`}
                      className="w-28 shrink-0 sm:w-32"
                    >
                      <Poster
                        title={movie.title}
                        year={movie.year}
                        genres={movie.genres}
                        posterUrl={movie.posterUrl}
                        posterCredit={movie.posterCredit}
                        showTitle={false}
                        className="h-full min-h-52 w-full"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-proiettore">
                        {index === 0 ? "Scelta migliore" : `Alternativa ${index + 1}`}
                      </p>
                      <Link href={`/film/${movie.slug}`} className="group">
                        <h3 className="titlecard mt-1 text-sm leading-snug text-schermo group-hover:text-proiettore">
                          {movie.title}
                        </h3>
                      </Link>
                      <p className="mt-1 text-xs text-fumo">
                        {[movie.year, movie.director].filter(Boolean).join(" · ")}
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {reasons.map((reason) => (
                          <li
                            key={reason}
                            className="rounded-full border border-riga px-2 py-1 text-[10px] leading-tight text-schermo/80"
                          >
                            {reason}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto grid gap-2 pt-4">
                        <Link
                          href={{
                            pathname: "/serate/nuova",
                            query: { movieId: movie.id },
                          }}
                          className="min-h-11 rounded-lg bg-proiettore px-3 py-3 text-center text-xs font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso"
                        >
                          Crea serata con questo film
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
