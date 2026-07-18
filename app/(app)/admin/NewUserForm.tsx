"use client";

import { useActionState } from "react";
import { createUser } from "@/lib/actions";

export function NewUserForm() {
  const [state, action, pending] = useActionState(createUser, undefined);

  return (
    <form action={action} className="ticket flex flex-col gap-3 p-5">
      <p className="eyebrow">Nuovo membro</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          placeholder="Nome (es. Alice)"
          required
          className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50"
        />
        <input
          name="username"
          placeholder="username"
          autoCapitalize="none"
          required
          className="rounded-lg border border-riga bg-notte px-3 py-2.5 font-mono text-sm placeholder:text-fumo/50"
        />
      </div>
      <input
        name="password"
        type="text"
        placeholder="password iniziale (min 6 caratteri)"
        minLength={6}
        required
        className="rounded-lg border border-riga bg-notte px-3 py-2.5 font-mono text-sm placeholder:text-fumo/50"
      />
      <label className="flex items-center gap-2 text-sm text-fumo">
        <input type="checkbox" name="isAdmin" className="accent-[#e8b84b]" />
        Può fare regia (admin)
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-velluto">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="rounded-lg bg-proiettore py-2.5 font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso disabled:opacity-60"
      >
        {pending ? "Creo…" : "Aggiungi al gruppo"}
      </button>
    </form>
  );
}
