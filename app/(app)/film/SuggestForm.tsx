"use client";

import { useActionState } from "react";
import { createSuggestion } from "@/lib/actions";

export function SuggestForm() {
  const [state, action, pending] = useActionState(createSuggestion, undefined);

  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row">
      <input
        name="text"
        required
        maxLength={300}
        placeholder="Suggerisci un film — basta il titolo, anche vago"
        aria-label="Suggerisci un film"
        className="w-full rounded-lg border border-riga bg-sipario px-4 py-2.5 text-sm text-schermo placeholder:text-fumo/60"
      />
      <button
        disabled={pending}
        className="shrink-0 rounded-lg border border-proiettore/50 px-4 py-2.5 text-sm font-semibold text-proiettore transition-colors hover:bg-proiettore hover:text-notte-fonda disabled:opacity-60"
      >
        {pending ? "Invio…" : "Suggerisci"}
      </button>
      {state?.error && (
        <p role="alert" className="text-sm text-velluto sm:self-center">
          {state.error}
        </p>
      )}
      {state?.ok && !pending && (
        <p role="status" className="text-sm text-fumo sm:self-center">
          Ricevuto ✓
        </p>
      )}
    </form>
  );
}
