"use client";

import { useActionState, useState } from "react";
import { configureRoom, type RoomActionResult } from "@/lib/room-actions";

export function RoomSetupForm({
  eventId,
  compact = false,
}: {
  eventId: number;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<"youtube" | "watch_along" | "licensed_public">(
    "youtube"
  );
  const action = configureRoom.bind(null, eventId);
  const [state, formAction, pending] = useActionState<RoomActionResult | undefined, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {!compact && (
        <div>
          <p className="eyebrow">Preparazione</p>
          <h2 className="titlecard mt-1 text-xl text-schermo">Che sala apriamo?</h2>
        </div>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-schermo">Formato</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            ["youtube", "YouTube", "Video incorporato autorizzato"],
            ["watch_along", "Watch-along", "Film esterno, timecode comune"],
            ["licensed_public", "Con licenza", "Verifica prima dell’ingresso"],
          ].map(([value, label, note]) => (
            <label
              key={value}
              className="cursor-pointer rounded-lg border border-riga bg-notte p-3 has-checked:border-proiettore"
            >
              <input
                type="radio"
                name="mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value as typeof mode)}
                className="mr-2 accent-[#d4a24e]"
              />
              <span className="text-sm font-semibold">{label}</span>
              <span className="mt-1 block text-xs text-fumo">{note}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {mode === "youtube" && (
        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm">
            <span>Link o ID YouTube</span>
            <input
              name="youtubeUrl"
              required
              placeholder="https://youtube.com/watch?v=…"
              className="rounded-lg border border-riga bg-notte px-3 py-2.5"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span>Base dei diritti</span>
            <select
              name="rightsBasis"
              className="rounded-lg border border-riga bg-notte px-3 py-2.5"
              defaultValue="public_domain"
            >
              <option value="public_domain">Pubblico dominio</option>
              <option value="creator_owned">Contenuto del creator</option>
              <option value="licensed">Licenza ottenuta</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span>Fonte sui diritti</span>
            <input
              type="url"
              name="rightsSourceUrl"
              required
              placeholder="https://…"
              className="rounded-lg border border-riga bg-notte px-3 py-2.5"
            />
          </label>
        </div>
      )}

      {mode === "watch_along" && (
        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm">
            <span>Dove ognuno apre propria copia legale</span>
            <input
              type="url"
              name="externalPlaybackUrl"
              required
              placeholder="https://servizio-streaming.example/film"
              className="rounded-lg border border-riga bg-notte px-3 py-2.5"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span>Live del creator (facoltativa)</span>
            <input
              type="url"
              name="streamerUrl"
              placeholder="https://twitch.tv/… oppure https://youtube.com/…"
              className="rounded-lg border border-riga bg-notte px-3 py-2.5"
            />
          </label>
          <p className="rounded-lg border border-riga bg-notte px-3 py-2 text-xs text-fumo">
            Film mai trasmesso da Serate Film. Live contiene solo volto, voce e commento.
          </p>
        </div>
      )}

      {mode === "licensed_public" && (
        <div className="rounded-lg border border-proiettore/40 bg-proiettore/5 p-4 text-sm">
          Configurazione crea richiesta licenza. Sala resta bloccata fino a verifica
          amministrativa. Biglietti e streaming file non inclusi.
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-velluto-acceso" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && <p className="text-sm text-proiettore">Sala aggiornata.</p>}
      <button
        disabled={pending}
        className="self-start rounded-lg bg-proiettore px-5 py-2.5 text-sm font-semibold text-notte-fonda disabled:opacity-50"
      >
        {pending ? "Salvataggio…" : compact ? "Aggiorna sala" : "Prepara sala"}
      </button>
    </form>
  );
}
