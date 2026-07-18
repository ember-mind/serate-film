"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";
import { quoteOfTheDay } from "@/lib/quotes";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const quote = quoteOfTheDay();

  return (
    <main className="beam flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2 text-center">Ingresso riservato</p>
        <h1 className="mb-10 text-center font-display text-5xl font-bold tracking-tight">
          Serate<span className="text-proiettore"> Film</span>
        </h1>

        <form action={action} className="ticket flex flex-col gap-4 p-6">
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Chi sei</span>
            <input
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              required
              className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-schermo placeholder:text-fumo/50"
              placeholder="username"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-schermo"
            />
          </label>
          {state?.error && (
            <p role="alert" className="text-sm text-velluto">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-proiettore py-2.5 font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso disabled:opacity-60"
          >
            {pending ? "Un attimo…" : "Entra in sala"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-fumo">
          La sala è privata: se manca il tuo nome, chiedi a chi organizza.
        </p>

        <div className="mt-10 text-center">
          <p className="quote">“{quote.text}”</p>
          <p className="mt-1 font-mono text-xs text-fumo">
            {quote.film} · {quote.year}
          </p>
        </div>
      </div>
    </main>
  );
}
