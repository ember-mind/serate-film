"use client";

import { useActionState } from "react";
import { setEventParticipation } from "@/lib/event-experience-actions";

export function ParticipationToggle({
  eventId,
  notParticipating,
}: {
  eventId: number;
  notParticipating: boolean;
}) {
  const [state, action, pending] = useActionState(
    setEventParticipation.bind(null, eventId),
    undefined
  );

  if (notParticipating) {
    return (
      <section className="ticket flex flex-wrap items-center justify-between gap-3 border-velluto/50 p-4">
        <div>
          <p className="font-semibold text-schermo">Non parteciperai a questa serata</p>
          <p className="mt-1 text-xs text-fumo">
            Scelte e impegni sono disattivati. Puoi rientrare quando vuoi.
          </p>
        </div>
        <form action={action}>
          <input type="hidden" name="participating" value="yes" />
          <button
            disabled={pending}
            className="cursor-pointer rounded-lg border border-proiettore px-4 py-2 text-sm font-semibold text-proiettore transition-colors hover:bg-proiettore/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Rientro…" : "Rientra nella serata"}
          </button>
        </form>
        {state?.error && (
          <p role="alert" className="w-full text-sm text-velluto">
            {state.error}
          </p>
        )}
      </section>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {state?.error && (
        <p role="alert" className="text-sm text-velluto">
          {state.error}
        </p>
      )}
      <form action={action}>
        <input type="hidden" name="participating" value="no" />
        <button
          disabled={pending}
          className="cursor-pointer text-sm text-fumo underline decoration-riga underline-offset-4 transition-colors hover:text-velluto disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Aggiorno…" : "Non parteciperò"}
        </button>
      </form>
    </div>
  );
}
