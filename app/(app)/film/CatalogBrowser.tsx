"use client";

import { useState } from "react";
import { addToWatchlist } from "@/lib/actions";

export type CatalogMovie = {
  id: number;
  title: string;
  year: number | null;
  director: string | null;
  actors: string | null;
  genres: string | null;
  state: "none" | "watchlist" | "watched";
};

export function CatalogBrowser({ movies }: { movies: CatalogMovie[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  // la ricerca parte dal terzo carattere; prima si vede tutto il catalogo
  const results =
    q.length < 3
      ? movies
      : movies.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            (m.director ?? "").toLowerCase().includes(q) ||
            (m.actors ?? "").toLowerCase().includes(q)
        );

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cerca per titolo, regista o attore…"
        aria-label="Cerca nel catalogo"
        className="mb-4 w-full rounded-lg border border-riga bg-sipario px-4 py-2.5 text-schermo placeholder:text-fumo/60"
      />

      <p className="eyebrow mb-4" aria-live="polite">
        {q.length >= 3 ? `${results.length} risultati per “${query.trim()}”` : `${movies.length} titoli`}
      </p>

      {results.length === 0 ? (
        <p className="text-sm text-fumo">
          Niente in catalogo per questa ricerca. Aggiungilo tu qui sopra.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((m) => (
            <li key={m.id} className="ticket flex flex-col overflow-hidden">
              <div className="flex flex-1 flex-col p-3">
                <p className="font-display text-base font-bold leading-snug">{m.title}</p>
                <p className="mt-0.5 font-mono text-xs text-proiettore">{m.year}</p>
                {m.director && <p className="mt-1.5 text-xs text-fumo">regia di {m.director}</p>}
                {m.actors && <p className="mt-0.5 line-clamp-2 text-xs text-fumo">con {m.actors}</p>}
                {m.genres && (
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-fumo/70">
                    {m.genres}
                  </p>
                )}
                <div className="mt-3">
                  {m.state === "watched" ? (
                    <span className="block rounded-md border border-riga py-1.5 text-center text-xs text-fumo">
                      Già vista
                    </span>
                  ) : m.state === "watchlist" ? (
                    <span className="block rounded-md border border-proiettore/40 py-1.5 text-center text-xs text-proiettore">
                      In watchlist ✓
                    </span>
                  ) : (
                    <form action={addToWatchlist.bind(null, m.id)}>
                      <button className="w-full rounded-md bg-sipario-chiaro py-1.5 text-xs font-semibold transition-colors hover:bg-proiettore hover:text-notte-fonda">
                        + Watchlist
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
