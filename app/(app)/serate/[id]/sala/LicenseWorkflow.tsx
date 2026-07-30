"use client";

import { useActionState } from "react";
import {
  reviewScreeningLicense,
  submitScreeningLicense,
  type RoomActionResult,
} from "@/lib/room-actions";

type License = {
  status: "draft" | "submitted" | "verified" | "rejected" | "expired";
  territory: string;
  capacity: number | null;
  reference: string | null;
  evidenceUrl: string | null;
  expiresAt: string | null;
};

export function LicenseWorkflow({
  eventId,
  license,
  canManage,
  isAdmin,
}: {
  eventId: number;
  license: License | null;
  canManage: boolean;
  isAdmin: boolean;
}) {
  const [state, action, pending] = useActionState<
    RoomActionResult | undefined,
    FormData
  >(submitScreeningLicense.bind(null, eventId), undefined);
  const status = license?.status ?? "draft";
  const step = status === "verified" ? 3 : status === "submitted" ? 2 : 1;

  return (
    <section className="ticket ticket-glow p-5 sm:p-6">
      <p className="eyebrow">Accesso controllato</p>
      <h2 className="titlecard mt-1 text-xl">Verifica licenza</h2>

      <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Stato verifica">
        {["Dati", "Verifica", "Sala"].map((label, index) => (
          <li
            key={label}
            className={`rounded-lg border px-3 py-2 text-center text-xs ${
              index + 1 <= step
                ? "border-proiettore bg-proiettore/10 text-proiettore"
                : "border-riga text-fumo"
            }`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <p className="mt-4 text-sm text-fumo">
        {status === "draft" && "Organizzatore deve inviare dati licenza."}
        {status === "submitted" && "Richiesta inviata. Sala bloccata durante verifica."}
        {status === "rejected" && "Richiesta respinta. Correggi dati e invia di nuovo."}
        {status === "expired" && "Licenza scaduta. Invia documento aggiornato."}
        {status === "verified" && "Licenza verificata. Accesso sala consentito."}
      </p>

      {canManage && status !== "verified" && (
        <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span>Territorio</span>
            <input
              name="territory"
              maxLength={2}
              defaultValue={license?.territory ?? "IT"}
              required
              className="rounded-lg border border-riga bg-notte px-3 py-2.5 uppercase"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Capienza autorizzata</span>
            <input
              type="number"
              name="capacity"
              min={1}
              max={100000}
              defaultValue={license?.capacity ?? ""}
              required
              className="rounded-lg border border-riga bg-notte px-3 py-2.5"
            />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span>Riferimento licenza</span>
            <input
              name="reference"
              maxLength={120}
              defaultValue={license?.reference ?? ""}
              required
              className="rounded-lg border border-riga bg-notte px-3 py-2.5"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Prova licenza (HTTPS)</span>
            <input
              type="url"
              name="evidenceUrl"
              defaultValue={license?.evidenceUrl ?? ""}
              required
              className="rounded-lg border border-riga bg-notte px-3 py-2.5"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Valida fino al</span>
            <input
              type="date"
              name="expiresAt"
              defaultValue={license?.expiresAt ?? ""}
              required
              className="rounded-lg border border-riga bg-notte px-3 py-2.5"
            />
          </label>
          {state?.error && (
            <p className="text-sm text-velluto-acceso sm:col-span-2" role="alert">
              {state.error}
            </p>
          )}
          <button
            disabled={pending}
            className="rounded-lg bg-proiettore px-4 py-2.5 text-sm font-semibold text-notte-fonda disabled:opacity-50 sm:col-span-2 sm:justify-self-start"
          >
            {pending ? "Invio…" : "Invia per verifica"}
          </button>
        </form>
      )}

      {isAdmin && status === "submitted" && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-riga pt-5">
          <form
            action={async () => {
              await reviewScreeningLicense(eventId, "verified");
            }}
          >
            <button className="rounded-lg bg-proiettore px-4 py-2 text-sm font-semibold text-notte-fonda">
              Verifica licenza
            </button>
          </form>
          <form
            action={async () => {
              await reviewScreeningLicense(eventId, "rejected");
            }}
          >
            <button className="rounded-lg border border-velluto px-4 py-2 text-sm text-schermo">
              Respingi
            </button>
          </form>
        </div>
      )}

      <p className="mt-5 border-t border-riga pt-4 text-xs text-fumo">
        Verifica organizzativa, non consulenza legale. Serate Film non ospita né
        ritrasmette contenuto protetto.
      </p>
    </section>
  );
}
