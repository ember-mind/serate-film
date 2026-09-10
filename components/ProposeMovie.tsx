"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { proposeEventMovie } from "@/lib/actions";

type PickMovie = { id: number; title: string; year: number | null };
type Tab = "search" | "watchlist";

// Proposte extra: catalogo cercabile o titoli già salvati in watchlist.
export function ProposeMovie({
  eventId,
  movies,
  watchlistMovies,
  maxSelections,
}: {
  eventId: number;
  movies: PickMovie[];
  watchlistMovies: PickMovie[];
  maxSelections: number;
}) {
  const [state, action, pending] = useActionState(proposeEventMovie.bind(null, eventId), undefined);
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const q = normalize(query.trim());
  const matches = useMemo(
    () => (q ? movies.filter((movie) => normalize(movie.title).includes(q)).slice(0, 8) : []),
    [movies, q]
  );
  const canSelectMore = selected.size < maxSelections;

  const toggle = (id: number) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else if (next.size < maxSelections) next.add(id);
      return next;
    });

  const movieChoice = (movie: PickMovie) => {
    const checked = selected.has(movie.id);
    return (
      <li key={movie.id}>
        <label
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
            checked
              ? "cursor-pointer border-proiettore bg-proiettore/10"
              : canSelectMore
                ? "cursor-pointer border-riga bg-notte hover:border-fumo"
                : "cursor-not-allowed border-riga bg-notte opacity-45"
          }`}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggle(movie.id)}
            disabled={!checked && !canSelectMore}
            className="accent-[#e8b84b]"
          />
          <span>{movie.title}</span>
          {movie.year ? <span className="font-mono text-xs text-fumo">{movie.year}</span> : null}
        </label>
      </li>
    );
  };

  return (
    <details className="group col-span-1 open:col-span-2">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-lg border border-riga bg-notte px-3 py-2.5 text-center text-sm font-semibold text-fumo transition-all hover:-translate-y-0.5 hover:border-proiettore/70 hover:text-schermo group-open:border-proiettore group-open:text-proiettore">
        + Manca un titolo
      </summary>
      <form action={action} className="ticket mt-3 flex flex-col gap-3 p-4">
        {[...selected].map((id) => <input key={id} type="hidden" name="movieIds" value={id} />)}
        <div className="flex rounded-lg border border-riga p-1" role="tablist" aria-label="Sorgente film">
          <button type="button" role="tab" aria-selected={tab === "search"} onClick={() => setTab("search")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${tab === "search" ? "bg-proiettore text-notte-fonda" : "text-fumo hover:text-schermo"}`}>
            Ricerca
          </button>
          <button type="button" role="tab" aria-selected={tab === "watchlist"} onClick={() => setTab("watchlist")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${tab === "watchlist" ? "bg-proiettore text-notte-fonda" : "text-fumo hover:text-schermo"}`}>
            Watchlist{watchlistMovies.length ? ` · ${watchlistMovies.length}` : ""}
          </button>
        </div>

        {maxSelections === 0 ? (
          <p className="text-sm text-fumo">Rosa piena: massimo 8 film.</p>
        ) : (
          <>
            <p className="text-xs text-fumo">{selected.size} di {maxSelections} film selezionati. Puoi proporli tutti insieme.</p>
            {tab === "search" ? (
              <div role="tabpanel">
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca nel catalogo…" aria-label="Cerca un film da proporre"
                  className="w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50" />
                {q && matches.length === 0 && <p className="mt-3 text-sm text-fumo">Non è in catalogo. <Link href="/film" className="text-proiettore underline">Aggiungilo prima in cineteca</Link>, poi torna qui.</p>}
                {matches.length > 0 && <ul className="mt-3 flex flex-col gap-2">{matches.map(movieChoice)}</ul>}
              </div>
            ) : (
              <div role="tabpanel">
                {watchlistMovies.length > 0 ? <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">{watchlistMovies.map(movieChoice)}</ul> : <p className="text-sm text-fumo">Watchlist vuota o titoli già tutti in rosa.</p>}
              </div>
            )}
          </>
        )}

        {state?.error && <p role="alert" className="text-sm text-velluto">{state.error}</p>}
        {state?.ok && <p className="text-sm text-proiettore">Film aggiunti alla rosa: ora si votano.</p>}
        <button type="submit" disabled={pending || selected.size === 0 || maxSelections === 0}
          className="self-start rounded-lg border border-proiettore px-4 py-2 text-sm font-semibold text-proiettore transition-colors hover:bg-proiettore hover:text-notte-fonda disabled:opacity-60">
          {pending ? "Aggiungo…" : selected.size > 1 ? `Aggiungi ${selected.size} film` : "Aggiungi alla rosa"}
        </button>
      </form>
    </details>
  );
}
