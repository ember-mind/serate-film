"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";
import { quoteOfTheDay } from "@/lib/quotes";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const quote = quoteOfTheDay();

  return (
    <main className="curtain relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="curtain-edge pointer-events-none absolute inset-0" aria-hidden />

      <div className="apertura relative w-full max-w-md">
        {/* lo schermo */}
        <div className="cinemascope px-6 py-10 sm:px-10">
          <p className="titlecard-sub text-center">Il cinema club presenta</p>
          <h1 className="titlecard mt-3 text-center text-3xl text-schermo sm:text-4xl">
            Serate<span className="text-proiettore"> Film</span>
          </h1>
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-fumo">
            Ingresso riservato · posti limitati
          </p>

          <form action={action} className="mt-10 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">Chi sei</span>
              <input
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                required
                className="rounded-sm border border-riga bg-notte px-3 py-2.5 text-schermo placeholder:text-fumo/50"
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
                className="rounded-sm border border-riga bg-notte px-3 py-2.5 text-schermo"
              />
            </label>
            {state?.error && (
              <p role="alert" className="text-sm text-velluto-acceso">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="titlecard mt-3 rounded-sm bg-proiettore py-3 text-sm text-notte-fonda transition-colors hover:bg-proiettore-acceso disabled:opacity-60"
            >
              {pending ? "Un attimo…" : "Entra in sala"}
            </button>
          </form>

          <div className="mt-10 border-t border-riga pt-6 text-center">
            <p className="quote text-base">“{quote.text}”</p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fumo">
              {quote.film} · {quote.year}
            </p>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-schermo/60">
          La sala è privata — se manca il tuo nome, chiedi a chi organizza
        </p>
      </div>
    </main>
  );
}
