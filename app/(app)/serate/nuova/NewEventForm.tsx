"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { createEvent } from "@/lib/actions";
import { Poster } from "@/components/Poster";

type Person = { id: number; name: string };

type PickMovie = {
  id: number;
  title: string;
  year: number | null;
  director: string | null;
  genres: string | null;
  posterUrl: string | null;
  posterCredit: string | null;
  inWatchlist: boolean;
};

const CATALOG_LIMIT = 24;

export function NewEventForm({ movies, people }: { movies: PickMovie[]; people: Person[] }) {
  const [state, action, pending] = useActionState(createEvent, undefined);
  const [dateCount, setDateCount] = useState(2);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const q = query.trim().toLowerCase();
  const matches = (m: PickMovie) =>
    !q ||
    m.title.toLowerCase().includes(q) ||
    (m.director ?? "").toLowerCase().includes(q);

  const wlMovies = movies.filter((m) => m.inWatchlist && (matches(m) || selected.has(m.id)));
  const catalogAll = useMemo(
    () => movies.filter((m) => !m.inWatchlist && (matches(m) || selected.has(m.id))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [movies, q, selected]
  );
  const catalog = catalogAll.slice(0, CATALOG_LIMIT);
  const hidden = catalogAll.length - catalog.length;

  if (movies.length === 0) {
    return (
      <p className="text-sm text-fumo">
        Il catalogo è vuoto: prima{" "}
        <Link href="/film" className="text-proiettore underline">
          aggiungi qualche film
        </Link>
        .
      </p>
    );
  }

  const tile = (m: PickMovie) => {
    const on = selected.has(m.id);
    return (
      <li key={m.id}>
        <label
          className={`stamp block cursor-pointer overflow-hidden rounded-md border-2 ${
            on ? "border-proiettore" : "border-transparent opacity-80 hover:opacity-100"
          }`}
          data-voted={on}
        >
          <input
            type="checkbox"
            name="movieIds"
            value={m.id}
            checked={on}
            onChange={() => toggle(m.id)}
            className="sr-only"
          />
          <Poster
            title={m.title}
            year={m.year}
            genres={m.genres}
            posterUrl={m.posterUrl}
            posterCredit={m.posterCredit}
            className="aspect-2/3 w-full"
          />
          <span className="block truncate bg-sipario px-2 py-1.5 text-xs">
            {on ? "✓ " : ""}
            {m.title}
          </span>
        </label>
      </li>
    );
  };

  return (
    <form action={action} className="flex flex-col gap-8">
      <div className="ticket flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Titolo (facoltativo)</span>
          <input
            name="title"
            placeholder="es. Serata western"
            className="rounded-lg border border-riga bg-notte px-3 py-2.5 placeholder:text-fumo/50"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Dove (facoltativo)</span>
          <input
            name="location"
            placeholder="es. da Manu"
            className="rounded-lg border border-riga bg-notte px-3 py-2.5 placeholder:text-fumo/50"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Orario (facoltativo)</span>
          <input
            type="time"
            name="startTime"
            className="rounded-lg border border-riga bg-notte px-3 py-2.5 placeholder:text-fumo/50"
          />
        </label>
      </div>

      <fieldset className="ticket p-5">
        <legend className="eyebrow float-left mb-3">Date proposte (max 5)</legend>
        <div className="clear-both flex flex-col gap-2">
          {Array.from({ length: dateCount }, (_, i) => (
            <input
              key={i}
              type="date"
              name="dates"
              required={i === 0}
              aria-label={`Data proposta ${i + 1}`}
              className="rounded-lg border border-riga bg-notte px-3 py-2.5 font-mono text-sm"
            />
          ))}
        </div>
        {dateCount < 5 && (
          <button
            type="button"
            onClick={() => setDateCount((c) => c + 1)}
            className="mt-3 text-sm text-proiettore hover:text-proiettore-acceso"
          >
            + un&apos;altra data
          </button>
        )}
      </fieldset>

      <fieldset className="ticket p-5">
        <legend className="eyebrow float-left mb-3">Gli invitati</legend>
        <ul className="clear-both grid grid-cols-2 gap-2">
          {people.map((p) => (
            <li key={p.id}>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-riga bg-notte px-3 py-2 text-sm has-checked:border-proiettore">
                <input
                  type="checkbox"
                  name="invitees"
                  value={p.id}
                  defaultChecked
                  className="accent-[#e8b84b]"
                />
                {p.name}
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-fumo">
          Tutti spuntati = serata aperta al club. Togli qualcuno e la serata resta visibile solo
          agli invitati.
        </p>
      </fieldset>

      <fieldset className="ticket p-5">
        <legend className="eyebrow float-left mb-3">
          Film in rosa · {selected.size} scelti (max 8)
        </legend>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtra per titolo o regista…"
          aria-label="Filtra i film"
          className="clear-both mb-4 w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50"
        />

        {wlMovies.length > 0 && (
          <>
            <p className="eyebrow mb-2">Dalla watchlist</p>
            <ul className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-4">{wlMovies.map(tile)}</ul>
          </>
        )}

        {catalog.length > 0 && (
          <>
            <p className="eyebrow mb-2">Dal catalogo</p>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">{catalog.map(tile)}</ul>
            {hidden > 0 && (
              <p className="mt-3 text-xs text-fumo">
                +{hidden} altri titoli — affina la ricerca per trovarli.
              </p>
            )}
          </>
        )}

        {wlMovies.length === 0 && catalog.length === 0 && (
          <p className="text-sm text-fumo">Nessun film corrisponde al filtro.</p>
        )}
      </fieldset>

      {state?.error && (
        <p role="alert" className="text-sm text-velluto">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-proiettore py-3 font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso disabled:opacity-60"
      >
        {pending ? "Creo la serata…" : "Apri le votazioni"}
      </button>
    </form>
  );
}
