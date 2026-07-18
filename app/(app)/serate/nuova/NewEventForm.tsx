"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createEvent } from "@/lib/actions";
import { posterUrl } from "@/lib/tmdb";

type WlMovie = { id: number; title: string; year: string | null; posterPath: string | null };

export function NewEventForm({ watchlistMovies }: { watchlistMovies: WlMovie[] }) {
  const [state, action, pending] = useActionState(createEvent, undefined);
  const [dateCount, setDateCount] = useState(2);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (watchlistMovies.length === 0) {
    return (
      <p className="text-sm text-fumo">
        La watchlist è vuota: prima{" "}
        <Link href="/film" className="text-proiettore underline">
          aggiungi qualche film
        </Link>
        , poi organizza la serata.
      </p>
    );
  }

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
        <legend className="eyebrow float-left mb-3">
          Film in rosa · {selected.size} scelti (max 8)
        </legend>
        <ul className="clear-both grid grid-cols-3 gap-3 sm:grid-cols-4">
          {watchlistMovies.map((m) => {
            const on = selected.has(m.id);
            const url = posterUrl(m.posterPath, "w185");
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
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={m.title} className="aspect-2/3 w-full object-cover" />
                  ) : (
                    <span className="flex aspect-2/3 items-center justify-center bg-sipario-chiaro p-2 text-center font-display text-xs font-semibold">
                      {m.title}
                    </span>
                  )}
                  <span className="block truncate bg-sipario px-2 py-1.5 text-xs">
                    {on ? "✓ " : ""}
                    {m.title}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
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
