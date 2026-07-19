"use client";

import { useActionState, useState } from "react";
import { createMovie } from "@/lib/actions";

export function AddMovieForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createMovie, undefined);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-proiettore hover:text-proiettore-acceso"
      >
        + Manca un film? Aggiungilo al catalogo
      </button>
    );
  }

  return (
    <form action={action} className="ticket flex flex-col gap-3 p-4">
      <p className="eyebrow">Nuovo film (finisce anche nella tua watchlist)</p>
      <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
        <input
          name="title"
          required
          placeholder="Titolo"
          className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50"
        />
        <input
          name="year"
          type="number"
          min={1888}
          max={2100}
          placeholder="Anno"
          className="rounded-lg border border-riga bg-notte px-3 py-2.5 font-mono text-sm placeholder:text-fumo/50"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          name="director"
          placeholder="Regista"
          className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50"
        />
        <input
          name="genres"
          placeholder="Generi (es. Thriller, Noir)"
          className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50"
        />
        <input
          name="runtime"
          type="number"
          min={1}
          max={600}
          placeholder="Durata (min)"
          className="rounded-lg border border-riga bg-notte px-3 py-2.5 font-mono text-sm placeholder:text-fumo/50"
        />
      </div>
      <input
        name="actors"
        placeholder="Attori principali (es. Toni Servillo, Carlo Verdone)"
        className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50"
      />
      <textarea
        name="synopsis"
        rows={3}
        maxLength={1000}
        placeholder="Sinossi: di cosa parla, in 2-3 frasi (facoltativa ma gradita)"
        className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50"
      />
      {state?.error && (
        <p role="alert" className="text-sm text-velluto">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          disabled={pending}
          className="flex-1 rounded-lg bg-proiettore py-2 text-sm font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso disabled:opacity-60"
        >
          {pending ? "Aggiungo…" : "Aggiungi al catalogo"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-riga px-4 py-2 text-sm text-fumo hover:text-schermo"
        >
          Chiudi
        </button>
      </div>
    </form>
  );
}
