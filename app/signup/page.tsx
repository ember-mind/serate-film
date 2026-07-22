"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions";
import { quoteOfTheDay, randomQuote } from "@/lib/quotes";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);
  // Initial render deve combaciare con l'HTML del server: parte dalla quote
  // deterministica del giorno, poi passa a una random dopo il mount.
  const [quote, setQuote] = useState(quoteOfTheDay);
  useEffect(() => {
    setQuote(randomQuote());
  }, []);

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
            Nuovo socio del club
          </p>

          <form action={action} className="mt-10 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">Come ti chiami</span>
              <input
                name="name"
                required
                className="rounded-sm border border-riga bg-notte px-3 py-2.5 text-schermo placeholder:text-fumo/50"
                placeholder="nome"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">Scegli uno username</span>
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
                autoComplete="new-password"
                required
                minLength={6}
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
              {pending ? "Un attimo…" : "Registrati"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-fumo">
            Hai già un account?{" "}
            <Link href="/login" className="text-proiettore hover:text-proiettore-acceso">
              Entra
            </Link>
          </p>

          <div className="mt-10 border-t border-riga pt-6 text-center">
            <p className="quote text-base" suppressHydrationWarning>
              “{quote.text}”
            </p>
            <p
              className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fumo"
              suppressHydrationWarning
            >
              {quote.film} · {quote.year}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
