"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions";
import { Poster } from "@/components/Poster";
import { filmSlug } from "@/lib/films";

export type CatalogMovie = {
  id: number;
  title: string;
  year: number | null;
  director: string | null;
  actors: string | null;
  genres: string | null;
  runtime: number | null;
  posterUrl: string | null;
  posterCredit: string | null;
  state: "none" | "watchlist" | "watched";
};

const DECENNI: Record<string, string> = {
  "202": "Anni Venti · il presente",
  "201": "Anni Dieci",
  "200": "Anni Duemila",
  "199": "Anni Novanta · i classici",
};

function decadeOf(year: number | null) {
  if (!year) return "Senza data";
  return DECENNI[String(year).slice(0, 3)] ?? `${String(year).slice(0, 3)}0`;
}

function Card({ m }: { m: CatalogMovie }) {
  return (
    <li className="ticket flex flex-col overflow-hidden">
      <Link href={`/film/${filmSlug(m)}`} className="group flex flex-col">
        <Poster
          title={m.title}
          year={m.year}
          genres={m.genres}
          posterUrl={m.posterUrl}
          posterCredit={m.posterCredit}
          showTitle={false}
          className="aspect-3/2 w-full sm:aspect-2/1"
        />
        <div className="flex flex-col p-3.5 pb-0">
          <p className="titlecard text-[13px] leading-snug text-schermo transition-colors group-hover:text-proiettore">
            {m.title}
          </p>
          <p className="mt-1 font-mono text-xs text-proiettore">
            {[m.year, m.runtime ? `${m.runtime}′` : null].filter(Boolean).join(" · ")}
          </p>
          {m.director && <p className="mt-1.5 text-xs text-fumo">regia di {m.director}</p>}
          {m.actors && <p className="mt-0.5 line-clamp-2 text-xs text-fumo">con {m.actors}</p>}
          {m.genres && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fumo/70">
              {m.genres}
            </p>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col justify-end p-3.5 pt-3">
        <div>
          {m.state === "watched" ? (
            <span className="block rounded-sm border border-riga py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-fumo">
              Già vista
            </span>
          ) : m.state === "watchlist" ? (
            <form action={removeFromWatchlist.bind(null, m.id)}>
              <button className="w-full rounded-sm border border-proiettore/40 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-proiettore transition-colors hover:border-velluto-acceso hover:text-velluto-acceso">
                In pellicola ✓
              </button>
            </form>
          ) : (
            <form action={addToWatchlist.bind(null, m.id)}>
              <button className="w-full rounded-sm bg-sipario-chiaro py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-schermo transition-colors hover:bg-proiettore hover:text-notte-fonda">
                + In pellicola
              </button>
            </form>
          )}
        </div>
      </div>
    </li>
  );
}

export function CatalogBrowser({ movies }: { movies: CatalogMovie[] }) {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const q = query.trim().toLowerCase();

  // elenco categorie distinte, derivato dai film già in props (nessuna query)
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const m of movies) {
      if (!m.genres) continue;
      for (const g of m.genres.split(",")) {
        const trimmed = g.trim();
        if (trimmed) set.add(trimmed);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, "it"));
  }, [movies]);

  const genreActive = selectedGenre !== "";
  const searching = q.length >= 3; // la ricerca parte dal terzo carattere; prima si sfoglia la cineteca per decennio

  function matchesGenre(m: CatalogMovie) {
    if (!genreActive) return true;
    if (!m.genres) return false;
    return m.genres
      .split(",")
      .map((g) => g.trim().toLowerCase())
      .includes(selectedGenre.toLowerCase());
  }

  const results = movies.filter((m) => {
    if (!matchesGenre(m)) return false;
    if (!searching) return true;
    return (
      m.title.toLowerCase().includes(q) ||
      (m.director ?? "").toLowerCase().includes(q) ||
      (m.actors ?? "").toLowerCase().includes(q)
    );
  });

  // la vista per decennio resta solo quando non c'è né ricerca né categoria attiva
  const flat = searching || genreActive;
  const byDecade = new Map<string, CatalogMovie[]>();
  if (!flat) {
    for (const m of results) {
      const d = decadeOf(m.year);
      if (!byDecade.has(d)) byDecade.set(d, []);
      byDecade.get(d)!.push(m);
    }
  }

  const countLabel = !flat
    ? `${movies.length} bobine in archivio`
    : searching && genreActive
      ? `${results.length} bobine per “${query.trim()}” in ${selectedGenre}`
      : genreActive
        ? `${results.length} bobine in ${selectedGenre}`
        : `${results.length} bobine per “${query.trim()}”`;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per titolo, regista o attore…"
          aria-label="Cerca in cineteca"
          className="w-full rounded-sm border border-riga bg-sipario px-4 py-3 text-schermo placeholder:text-fumo/60 sm:flex-1"
        />
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fumo">
          Categoria
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="rounded-sm border border-riga bg-sipario px-3 py-3 text-schermo sm:w-56"
          >
            <option value="">Tutte le categorie</option>
            {categories.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="eyebrow mb-6" aria-live="polite">
        {countLabel}
      </p>

      {results.length === 0 ? (
        <p className="text-sm text-fumo">
          {genreActive
            ? "Nessun film in questa categoria."
            : "Niente in cineteca per questa ricerca. Aggiungilo tu qui sopra."}
        </p>
      ) : flat ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((m) => (
            <Card key={m.id} m={m} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-10">
          {[...byDecade.entries()].map(([decade, films]) => (
            <section key={decade} aria-label={decade}>
              <div className="mb-4 flex items-center gap-4">
                <h2 className="titlecard shrink-0 text-sm text-proiettore">{decade}</h2>
                <span className="h-px flex-1 bg-riga" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fumo">
                  {films.length} {films.length === 1 ? "titolo" : "titoli"}
                </span>
              </div>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {films.map((m) => (
                  <Card key={m.id} m={m} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
