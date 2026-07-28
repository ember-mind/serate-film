"use client";

import { useActionState } from "react";
import { signupWithInvite } from "@/lib/actions";

export function SignupForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(signupWithInvite, undefined);

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">Come ti chiami?</span>
        <input
          name="name"
          autoComplete="name"
          required
          maxLength={60}
          placeholder="Nome visibile agli amici"
          className="rounded-sm border border-riga bg-notte px-3 py-2.5 text-schermo placeholder:text-fumo/50"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">Username</span>
        <input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          required
          minLength={3}
          maxLength={30}
          pattern="[a-zA-Z0-9._-]+"
          placeholder="es. mario.rossi"
          className="rounded-sm border border-riga bg-notte px-3 py-2.5 text-schermo placeholder:text-fumo/50"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="rounded-sm border border-riga bg-notte px-3 py-2.5 text-schermo"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">Ripeti password</span>
        <input
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
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
        className="titlecard mt-2 rounded-sm bg-proiettore py-3 text-sm text-notte-fonda transition-colors hover:bg-proiettore-acceso disabled:opacity-60"
      >
        {pending ? "Preparo il posto…" : "Crea account ed entra"}
      </button>
    </form>
  );
}
