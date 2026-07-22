"use client";

import { useActionState } from "react";
import { proposeEventDate } from "@/lib/actions";

// Proposta di una data extra per la serata.
export function ProposeDate({ eventId }: { eventId: number }) {
  const [state, action, pending] = useActionState(proposeEventDate.bind(null, eventId), undefined);

  return (
    <details className="ticket p-5">
      <summary className="eyebrow cursor-pointer list-none">
        Serve un&apos;altra data? Proponila →
      </summary>
      <form action={action} className="mt-4 flex flex-col gap-3">
        <input
          type="date"
          name="date"
          required
          aria-label="Proponi una data"
          className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
        />
        {state?.error && (
          <p role="alert" className="text-sm text-velluto">
            {state.error}
          </p>
        )}
        {state?.ok && <p className="text-sm text-proiettore">In elenco: ora si vota anche questa.</p>}
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg border border-proiettore px-4 py-2 text-sm font-semibold text-proiettore transition-colors hover:bg-proiettore hover:text-notte-fonda disabled:opacity-60"
        >
          {pending ? "Aggiungo…" : "Aggiungi alla lista"}
        </button>
      </form>
    </details>
  );
}
