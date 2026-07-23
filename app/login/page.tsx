"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions";
import { quoteOfTheDay, randomQuote } from "@/lib/quotes";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
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
            Ingresso riservato · posti limitati
          </p>

          <form action={action} className="mt-10 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="eyebrow">
                Username
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                required
                aria-invalid={state?.error ? true : undefined}
                aria-describedby={state?.error ? "login-error" : undefined}
                className="rounded-sm border border-riga bg-notte px-3 py-2.5 text-schermo placeholder:text-fumo/50"
                placeholder="Chi sei"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="eyebrow">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  aria-invalid={state?.error ? true : undefined}
                  aria-describedby={state?.error ? "login-error" : undefined}
                  className="w-full rounded-sm border border-riga bg-notte px-3 py-2.5 pr-16 text-schermo"
                />
                <button
                  type="button"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fumo hover:text-proiettore"
                >
                  {showPassword ? "Nascondi" : "Mostra"}
                </button>
              </div>
            </div>
            {state?.error && (
              <p id="login-error" role="alert" className="text-sm text-velluto-acceso">
                {state.error}
              </p>
            )}
            <div className="mt-3 flex flex-col items-center gap-2">
              <p className="eyebrow">Entra in sala</p>
              <button
                type="submit"
                disabled={pending}
                className="titlecard w-full rounded-sm bg-proiettore py-3 text-sm text-notte-fonda transition-colors hover:bg-proiettore-acceso disabled:opacity-60"
              >
                {pending ? "Accesso…" : "Accedi"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-fumo">
            Non hai un account?{" "}
            <Link href="/signup" className="text-proiettore hover:text-proiettore-acceso">
              Registrati
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

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-schermo/60">
          La sala è privata — se manca il tuo nome, chiedi a chi organizza
        </p>
      </div>
    </main>
  );
}
