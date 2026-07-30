"use client";

import { useActionState, useState } from "react";
import { saveEventRsvp } from "@/lib/event-experience-actions";

type Rsvp = {
  userId: number;
  name: string;
  status: "yes" | "maybe" | "no";
  guestCount: number;
  note: string | null;
};

const OPTIONS = [
  { value: "yes", label: "Ci sono", icon: "✓" },
  { value: "maybe", label: "Forse", icon: "?" },
  { value: "no", label: "Non posso", icon: "×" },
] as const;

export function RsvpCard({
  eventId,
  current,
  responses,
  deadline,
}: {
  eventId: number;
  current?: Rsvp;
  responses: Rsvp[];
  deadline: string | null;
}) {
  const action = saveEventRsvp.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [status, setStatus] = useState(current?.status ?? "");
  const yes = responses.filter((response) => response.status === "yes");
  const maybe = responses.filter((response) => response.status === "maybe");
  const no = responses.filter((response) => response.status === "no");
  const totalGuests = yes.reduce((sum, response) => sum + response.guestCount, 0);

  return (
    <section className="ticket p-5" aria-labelledby="rsvp-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Presenze</p>
          <h2 id="rsvp-title" className="mt-1 text-xl font-semibold text-schermo">
            Tu ci sarai?
          </h2>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-proiettore">
            {yes.length + totalGuests} confermati
          </p>
          <p className="text-xs text-fumo">
            {maybe.length} forse · {no.length} assenti
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-4 grid gap-3">
        <div className="grid grid-cols-3 gap-2">
          {OPTIONS.map((option) => (
            <label
              key={option.value}
              className="cursor-pointer rounded-lg border border-riga bg-notte p-3 text-center text-sm has-checked:border-proiettore has-checked:bg-proiettore/10"
            >
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={status === option.value}
                onChange={() => setStatus(option.value)}
                className="sr-only"
              />
              <span className="block text-lg" aria-hidden="true">
                {option.icon}
              </span>
              {option.label}
            </label>
          ))}
        </div>

        {(status === "yes" || status === "maybe") && (
          <div className="grid gap-2 sm:grid-cols-[9rem_1fr]">
            <label className="text-xs text-fumo">
              Ospiti con te
              <select
                name="guestCount"
                defaultValue={current?.guestCount ?? 0}
                className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2 text-sm text-schermo"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-fumo">
              Nota per chi organizza
              <input
                name="note"
                defaultValue={current?.note ?? ""}
                placeholder="Es. arrivo dopo le 21"
                maxLength={160}
                className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2 text-sm text-schermo placeholder:text-fumo/50"
              />
            </label>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-fumo">
            {deadline ? `Conferma entro ${deadline}` : "Puoi cambiare risposta in ogni momento."}
          </p>
          <button
            disabled={pending || !status}
            className="rounded-lg bg-proiettore px-4 py-2 text-sm font-semibold text-notte-fonda disabled:opacity-50"
          >
            {pending ? "Salvo…" : current ? "Aggiorna" : "Conferma"}
          </button>
        </div>
        {state?.error && <p className="text-sm text-velluto">{state.error}</p>}
        {state?.ok && <p className="text-sm text-salvia">Risposta salvata.</p>}
      </form>

      {responses.length > 0 && (
        <details className="mt-4 border-t border-riga pt-3">
          <summary className="cursor-pointer text-sm text-fumo">
            Vedi le {responses.length} risposte
          </summary>
          <ul className="mt-3 grid gap-2 text-sm">
            {responses.map((response) => (
              <li key={response.userId} className="flex justify-between gap-3">
                <span>{response.name}</span>
                <span className="text-fumo">
                  {response.status === "yes"
                    ? `Ci sono${response.guestCount ? ` +${response.guestCount}` : ""}`
                    : response.status === "maybe"
                      ? "Forse"
                      : "Non può"}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
