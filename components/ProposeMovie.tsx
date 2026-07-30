"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { proposeEventMovie } from "@/lib/actions";

type PickMovie = { id: number; title: string; year: number | null };

// Proposta di un film extra per la rosa: cerca nel catalogo, scegli, aggiungi.
export function ProposeMovie({ eventId, movies }: { eventId: number; movies: PickMovie[] }) {
  const [state, action, pending] = useActionState(proposeEventMovie.bind(null, eventId), undefined);
  const [query, setQuery] = useState("");

  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  const q = normalize(query.trim());
  const matches = q
    ? movies.filter((m) => normalize(m.title).includes(q)).slice(0, 8)
    : [];

  return (
    <details className="group col-span-1 open:col-span-2">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-lg border border-riga bg-notte px-3 py-2.5 text-center text-sm font-semibold text-fumo transition-all hover:-translate-y-0.5 hover:border-proiettore/70 hover:text-schermo group-open:border-proiettore group-open:text-proiettore">
        + Manca un titolo
      </summary>
      <form
        action={action}
        className="ticket mt-3 flex flex-col gap-3 p-4"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca nel catalogo…"
          aria-label="Cerca un film da proporre"
          className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50"
        />
        {q && matches.length === 0 && (
          <p className="text-sm text-fumo">
            Non è in catalogo.{" "}
            <Link href="/film" className="text-proiettore underline">
              Aggiungilo prima in cineteca
            </Link>
            , poi torna qui.
          </p>
        )}
        {matches.length > 0 && (
          <ul className="flex flex-col gap-2">
            {matches.map((m) => (
              <li key={m.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-riga bg-notte px-3 py-2 text-sm has-checked:border-proiettore">
                  <input
                    type="radio"
                    name="movieId"
                    value={m.id}
                    required
                    className="accent-[#e8b84b]"
                  />
                  {m.title}
                  {m.year ? <span className="font-mono text-xs text-fumo">{m.year}</span> : null}
                </label>
              </li>
            ))}
          </ul>
        )}
        {state?.error && (
          <p role="alert" className="text-sm text-velluto">
            {state.error}
          </p>
        )}
        {state?.ok && <p className="text-sm text-proiettore">In rosa: ora si vota anche questo.</p>}
        {matches.length > 0 && (
          <button
            type="submit"
            disabled={pending}
            className="self-start rounded-lg border border-proiettore px-4 py-2 text-sm font-semibold text-proiettore transition-colors hover:bg-proiettore hover:text-notte-fonda disabled:opacity-60"
          >
            {pending ? "Aggiungo…" : "Aggiungi alla rosa"}
          </button>
        )}
      </form>
    </details>
  );
}
