"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { createEvent } from "@/lib/actions";
import { Poster } from "@/components/Poster";

type Person = { id: number; name: string };
type Circle = { id: number; name: string; members: number };

type PickMovie = {
  id: number;
  title: string;
  year: number | null;
  director: string | null;
  genres: string | null;
  posterUrl: string | null;
  posterCredit: string | null;
  inWatchlist: boolean;
};

const CATALOG_LIMIT = 24;

export function NewEventForm({
  movies,
  people,
  friendIds,
  circles,
  initialMovieId,
}: {
  movies: PickMovie[];
  people: Person[];
  friendIds: number[];
  circles: Circle[];
  initialMovieId?: number;
}) {
  const [state, action, pending] = useActionState(createEvent, undefined);
  const [dateCount, setDateCount] = useState(2);
  const [selected, setSelected] = useState<Set<number>>(
    new Set(movies.some((movie) => movie.id === initialMovieId) ? [initialMovieId!] : [])
  );
  const [query, setQuery] = useState("");
  const [access, setAccess] = useState<"invite_only" | "circle" | "club" | "public">(
    circles.length > 0 ? "circle" : "invite_only"
  );
  const [inviteMode, setInviteMode] = useState<"friends" | "custom">("friends");
  const [viewingMode, setViewingMode] = useState<
    "in_person" | "youtube" | "watch_along" | "licensed_public"
  >("in_person");
  const friends = people.filter((person) => friendIds.includes(person.id));

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 8) next.add(id);
      return next;
    });

  const q = query.trim().toLowerCase();
  const matches = (m: PickMovie) =>
    !q ||
    m.title.toLowerCase().includes(q) ||
    (m.director ?? "").toLowerCase().includes(q);

  const wlMovies = movies.filter((m) => m.inWatchlist && (matches(m) || selected.has(m.id)));
  const catalogAll = useMemo(
    () => movies.filter((m) => !m.inWatchlist && (matches(m) || selected.has(m.id))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [movies, q, selected]
  );
  const catalog = catalogAll.slice(0, CATALOG_LIMIT);
  const hidden = catalogAll.length - catalog.length;

  if (movies.length === 0) {
    return (
      <p className="text-sm text-fumo">
        Il catalogo è vuoto: prima{" "}
        <Link href="/film" className="text-proiettore underline">
          aggiungi qualche film
        </Link>
        .
      </p>
    );
  }

  const tile = (m: PickMovie) => {
    const on = selected.has(m.id);
    return (
      <li key={m.id}>
        <label
          className={`stamp block cursor-pointer overflow-hidden rounded-md border-2 ${
            on ? "border-proiettore" : "border-transparent opacity-80 hover:opacity-100"
          }`}
          data-voted={on}
        >
          <input
            type="checkbox"
            name="movieIds"
            value={m.id}
            checked={on}
            onChange={() => toggle(m.id)}
            className="sr-only"
          />
          <Poster
            title={m.title}
            year={m.year}
            genres={m.genres}
            posterUrl={m.posterUrl}
            posterCredit={m.posterCredit}
            className="aspect-2/3 w-full"
          />
          <span className="block truncate bg-sipario px-2 py-1.5 text-xs">
            {on ? "✓ " : ""}
            {m.title}
          </span>
        </label>
      </li>
    );
  };

  return (
    <form action={action} className="flex flex-col gap-8">
      <div className="ticket flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Titolo (facoltativo)</span>
          <input
            name="title"
            placeholder="es. Serata western"
            className="rounded-lg border border-riga bg-notte px-3 py-2.5 placeholder:text-fumo/50"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Dove (facoltativo)</span>
          <input
            name="location"
            placeholder="es. da Manu"
            className="rounded-lg border border-riga bg-notte px-3 py-2.5 placeholder:text-fumo/50"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Orario (facoltativo)</span>
          <input
            type="time"
            name="startTime"
            className="rounded-lg border border-riga bg-notte px-3 py-2.5 placeholder:text-fumo/50"
          />
        </label>
      </div>

      <fieldset className="ticket p-5">
        <legend className="eyebrow float-left mb-3">Date proposte (max 5)</legend>
        <div className="clear-both flex flex-col gap-2">
          {Array.from({ length: dateCount }, (_, i) => (
            <input
              key={i}
              type="date"
              name="dates"
              required={i === 0}
              aria-label={`Data proposta ${i + 1}`}
              className="rounded-lg border border-riga bg-notte px-3 py-2.5 font-mono text-sm"
            />
          ))}
        </div>
        {dateCount < 5 && (
          <button
            type="button"
            onClick={() => setDateCount((c) => c + 1)}
            className="mt-3 text-sm text-proiettore hover:text-proiettore-acceso"
          >
            + un&apos;altra data
          </button>
        )}
      </fieldset>

      <fieldset className="ticket p-5">
        <legend className="eyebrow float-left mb-3">Come la guardiamo?</legend>
        <div className="clear-both grid gap-2 sm:grid-cols-2">
          {[
            ["in_person", "🍿 Sul divano", "Serata dal vivo, a casa o al cinema"],
            ["youtube", "▶ Sala YouTube", "Player condiviso per contenuti autorizzati"],
            ["watch_along", "◉ Watch-along", "Ognuno usa il proprio streaming, insieme"],
            ["licensed_public", "🎟 Proiezione pubblica", "Evento pubblico con verifica licenza"],
          ].map(([value, label, detail]) => (
            <label
              key={value}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-riga bg-notte px-3 py-3 text-sm has-checked:border-proiettore"
            >
              <input
                type="radio"
                name="viewingMode"
                value={value}
                checked={viewingMode === value}
                onChange={() => setViewingMode(value as typeof viewingMode)}
                className="mt-1 accent-[#e8b84b]"
              />
              <span>
                <span className="block text-schermo">{label}</span>
                <span className="block text-xs text-fumo">{detail}</span>
              </span>
            </label>
          ))}
        </div>

        {viewingMode === "youtube" && (
          <div className="mt-4 grid gap-3 rounded-lg border border-riga bg-notte-fonda/50 p-4">
            <label className="text-xs text-fumo">
              Link o ID YouTube
              <input
                name="youtubeVideoId"
                required
                placeholder="https://youtube.com/watch?v=…"
                className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-fumo">
                Perché possiamo mostrarlo?
                <select
                  name="rightsBasis"
                  className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
                >
                  <option value="public_domain">Pubblico dominio</option>
                  <option value="creator_owned">È del creator / ho il permesso</option>
                </select>
              </label>
              <label className="text-xs text-fumo">
                Fonte dei diritti
                <input
                  name="rightsSourceUrl"
                  type="url"
                  required
                  placeholder="https://…"
                  className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
                />
              </label>
            </div>
          </div>
        )}

        {viewingMode === "watch_along" && (
          <div className="mt-4 grid gap-3 rounded-lg border border-riga bg-notte-fonda/50 p-4 sm:grid-cols-2">
            <label className="text-xs text-fumo">
              Link al film o alla stanza
              <input
                name="externalPlaybackUrl"
                type="url"
                required
                placeholder="https://…"
                className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
              />
            </label>
            <label className="text-xs text-fumo">
              Live dello streamer (facoltativa)
              <input
                name="streamerUrl"
                type="url"
                placeholder="https://twitch.tv/…"
                className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
              />
            </label>
            <p className="text-xs text-fumo sm:col-span-2">
              Il film non viene ritrasmesso: ogni spettatore usa il proprio accesso legale.
            </p>
          </div>
        )}

        {viewingMode === "licensed_public" && (
          <div className="mt-4 grid gap-3 rounded-lg border border-riga bg-notte-fonda/50 p-4 sm:grid-cols-2">
            <label className="text-xs text-fumo">
              Capienza
              <input
                name="capacity"
                type="number"
                min={1}
                max={10000}
                required
                defaultValue={50}
                className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
              />
            </label>
            <label className="text-xs text-fumo">
              Territorio
              <input
                name="territory"
                defaultValue="IT"
                maxLength={8}
                className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
              />
            </label>
            <label className="text-xs text-fumo">
              Riferimento licenza (se già disponibile)
              <input
                name="licenseReference"
                placeholder="Contratto / pratica"
                className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
              />
            </label>
            <label className="text-xs text-fumo">
              Documento o prova (URL)
              <input
                name="licenseEvidenceUrl"
                type="url"
                placeholder="https://…"
                className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
              />
            </label>
            <p className="text-xs text-proiettore sm:col-span-2">
              La sala resterà bloccata finché la licenza non viene verificata.
            </p>
          </div>
        )}
      </fieldset>

      <fieldset className="ticket p-5">
        <legend className="eyebrow float-left mb-3">Chi può partecipare?</legend>
        <div className="clear-both grid gap-2 sm:grid-cols-2">
          {circles.length > 0 && (
            <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-riga bg-notte px-3 py-3 text-sm has-checked:border-proiettore">
              <input
                type="radio"
                name="access"
                value="circle"
                checked={access === "circle"}
                onChange={() => setAccess("circle")}
                className="mt-1 accent-[#e8b84b]"
              />
              <span>
                <span className="block">Un mio circolo</span>
                <span className="block text-xs text-fumo">Solo i suoi membri.</span>
              </span>
            </label>
          )}
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-riga bg-notte px-3 py-3 text-sm has-checked:border-proiettore">
            <input
              type="radio"
              name="access"
              value="invite_only"
              checked={access === "invite_only"}
              onChange={() => setAccess("invite_only")}
              className="mt-1 accent-[#e8b84b]"
            />
            <span>
              <span className="block">Solo invitati</span>
              <span className="block text-xs text-fumo">Amici scelti e link privato.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-riga bg-notte px-3 py-3 text-sm has-checked:border-proiettore">
            <input
              type="radio"
              name="access"
              value="club"
              checked={access === "club"}
              onChange={() => setAccess("club")}
              className="mt-1 accent-[#e8b84b]"
            />
            <span>
              <span className="block">Tutto il club</span>
              <span className="block text-xs text-fumo">Tutti gli account del sito.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-riga bg-notte px-3 py-3 text-sm has-checked:border-proiettore">
            <input
              type="radio"
              name="access"
              value="public"
              checked={access === "public"}
              onChange={() => setAccess("public")}
              className="mt-1 accent-[#e8b84b]"
            />
            <span>
              <span className="block">Pubblica</span>
              <span className="block text-xs text-fumo">Profilo o club scopribile.</span>
            </span>
          </label>
        </div>

        {access === "circle" && (
          <label className="mt-4 block text-xs text-fumo">
            Circolo
            <select
              name="circleId"
              required
              className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm text-schermo"
            >
              {circles.map((circle) => (
                <option key={circle.id} value={circle.id}>
                  {circle.name} · {circle.members} membri
                </option>
              ))}
            </select>
          </label>
        )}

        {access === "invite_only" && (
          <div className="mt-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInviteMode("friends")}
                className={`cursor-pointer rounded-lg px-3 py-2 text-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                  inviteMode === "friends"
                    ? "bg-proiettore text-notte-fonda shadow-sm hover:bg-proiettore-acceso hover:shadow-md"
                    : "border border-riga text-fumo hover:border-proiettore/70 hover:bg-proiettore/10 hover:text-schermo"
                }`}
              >
                Tutti i miei amici ({friends.length})
              </button>
              <button
                type="button"
                onClick={() => setInviteMode("custom")}
                className={`cursor-pointer rounded-lg px-3 py-2 text-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                  inviteMode === "custom"
                    ? "bg-proiettore text-notte-fonda shadow-sm hover:bg-proiettore-acceso hover:shadow-md"
                    : "border border-riga text-fumo hover:border-proiettore/70 hover:bg-proiettore/10 hover:text-schermo"
                }`}
              >
                Scelgo io
              </button>
            </div>
            <input type="hidden" name="visibility" value={inviteMode === "friends" ? "friends" : "private"} />
            {inviteMode === "friends" ? (
              <p className="mt-3 text-xs text-fumo">
                {friends.length ? friends.map((friend) => friend.name).join(", ") : "Solo tu, per ora."}{" "}
                <Link href="/io/amici" className="text-proiettore underline">
                  Gestisci amici
                </Link>
              </p>
            ) : (
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {people.map((person) => (
                  <li key={person.id}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-riga bg-notte px-3 py-2 text-sm has-checked:border-proiettore">
                      <input
                        type="checkbox"
                        name="invitees"
                        value={person.id}
                        defaultChecked={friendIds.includes(person.id)}
                        className="accent-[#e8b84b]"
                      />
                      {person.name}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </fieldset>

      <fieldset className="ticket p-5">
        <legend className="eyebrow float-left mb-3">Scadenze intelligenti</legend>
        <div className="clear-both grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-fumo">
            Voti entro
            <input
              type="datetime-local"
              name="votingDeadline"
              className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
            />
          </label>
          <label className="text-xs text-fumo">
            RSVP entro
            <input
              type="datetime-local"
              name="rsvpDeadline"
              className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-fumo">
          Le scadenze aiutano il gruppo a decidere; le risposte restano comunque aggiornabili.
        </p>
      </fieldset>

      <fieldset className="ticket p-5">
        <legend className="eyebrow float-left mb-3">
          Film in rosa · {selected.size} scelti (max 8)
        </legend>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtra per titolo o regista…"
          aria-label="Filtra i film"
          className="clear-both mb-4 w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50"
        />

        {wlMovies.length > 0 && (
          <>
            <p className="eyebrow mb-2">Dalla watchlist</p>
            <ul className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-4">{wlMovies.map(tile)}</ul>
          </>
        )}

        {catalog.length > 0 && (
          <>
            <p className="eyebrow mb-2">Dal catalogo</p>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">{catalog.map(tile)}</ul>
            {hidden > 0 && (
              <p className="mt-3 text-xs text-fumo">
                +{hidden} altri titoli — affina la ricerca per trovarli.
              </p>
            )}
          </>
        )}

        {wlMovies.length === 0 && catalog.length === 0 && (
          <p className="text-sm text-fumo">Nessun film corrisponde al filtro.</p>
        )}
      </fieldset>

      {state?.error && (
        <p role="alert" className="text-sm text-velluto">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-proiettore py-3 font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso disabled:opacity-60"
      >
        {pending ? "Creo la serata…" : "Apri le votazioni"}
      </button>
    </form>
  );
}
