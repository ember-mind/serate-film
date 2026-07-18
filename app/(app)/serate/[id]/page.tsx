import { notFound } from "next/navigation";
import Link from "next/link";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  attendance,
  dateVotes,
  eventDates,
  eventMovies,
  events,
  movies,
  movieVotes,
  ratings,
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  cancelEvent,
  closeEvent,
  markWatched,
  rateEvent,
  reopenEvent,
  saveEventNotes,
  toggleDateVote,
  toggleMovieVote,
} from "@/lib/actions";
import { Poster } from "@/components/Poster";
import { Stars } from "@/components/Stars";
import { formatDateFull, formatDateLong } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function SerataPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId)) notFound();

  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) notFound();

  const canManage = event.createdBy === user.id || user.isAdmin;
  const people = await db.query.users.findMany({ orderBy: asc(users.name) });
  const nameOf = (uid: number) => people.find((p) => p.id === uid)?.name ?? "?";

  const dates = await db.query.eventDates.findMany({
    where: eq(eventDates.eventId, eventId),
    orderBy: asc(eventDates.date),
  });
  const dVotes =
    dates.length > 0
      ? await db.query.dateVotes.findMany({
          where: inArray(
            dateVotes.eventDateId,
            dates.map((d) => d.id)
          ),
        })
      : [];

  const eMovies = await db.query.eventMovies.findMany({ where: eq(eventMovies.eventId, eventId) });
  const ms =
    eMovies.length > 0
      ? await db.query.movies.findMany({
          where: inArray(
            movies.id,
            eMovies.map((em) => em.movieId)
          ),
        })
      : [];
  const mVotes =
    eMovies.length > 0
      ? await db.query.movieVotes.findMany({
          where: inArray(
            movieVotes.eventMovieId,
            eMovies.map((em) => em.id)
          ),
        })
      : [];

  const chosenMovie = event.chosenMovieId
    ? (ms.find((m) => m.id === event.chosenMovieId) ??
      (await db.query.movies.findFirst({ where: eq(movies.id, event.chosenMovieId) })))
    : null;

  const att = await db.query.attendance.findMany({ where: eq(attendance.eventId, eventId) });
  const rats = await db.query.ratings.findMany({ where: eq(ratings.eventId, eventId) });

  // suggerimenti chiusura: data più disponibile, film più approvato
  const bestDate = [...dates].sort(
    (a, b) =>
      dVotes.filter((v) => v.eventDateId === b.id).length -
      dVotes.filter((v) => v.eventDateId === a.id).length
  )[0];
  const bestMovie = [...eMovies].sort(
    (a, b) =>
      mVotes.filter((v) => v.eventMovieId === b.id).length -
      mVotes.filter((v) => v.eventMovieId === a.id).length
  )[0];

  const title = chosenMovie ? chosenMovie.title : event.title || "Serata da decidere";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header>
        <p className="eyebrow">
          {event.status === "open" && "Votazioni aperte"}
          {event.status === "scheduled" && "In programma"}
          {event.status === "done" && "Vista"}
          {event.status === "cancelled" && "Annullata"}
          {" · di "}
          {nameOf(event.createdBy)}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {event.title && chosenMovie && <p className="mt-1 text-sm text-fumo">{event.title}</p>}
      </header>

      {/* ---------- VOTAZIONE ---------- */}
      {event.status === "open" && (
        <>
          <section aria-labelledby="vota-date">
            <p className="eyebrow mb-3" id="vota-date">
              1 · Quando puoi? Timbra le date buone
            </p>
            <ul className="flex flex-col gap-2">
              {dates.map((d) => {
                const votes = dVotes.filter((v) => v.eventDateId === d.id);
                const mine = votes.some((v) => v.userId === user.id);
                return (
                  <li key={d.id}>
                    <form action={toggleDateVote.bind(null, d.id, eventId)}>
                      <button
                        data-voted={mine}
                        className={`stamp flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                          mine
                            ? "border-proiettore bg-proiettore/10"
                            : "border-riga bg-sipario hover:border-fumo"
                        }`}
                      >
                        <span className="font-mono text-sm capitalize">
                          {formatDateLong(d.date)}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-fumo">
                          {votes.length > 0 && (
                            <span>{votes.map((v) => nameOf(v.userId)).join(", ")}</span>
                          )}
                          <span
                            className={`rounded-full px-2.5 py-1 font-mono font-semibold ${
                              mine ? "bg-proiettore text-notte-fonda" : "bg-sipario-chiaro"
                            }`}
                          >
                            {mine ? "✓ ci sono" : votes.length}
                          </span>
                        </span>
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="vota-film">
            <p className="eyebrow mb-3" id="vota-film">
              2 · Timbra tutti i film che ti vanno bene
            </p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {eMovies.map((em) => {
                const m = ms.find((x) => x.id === em.movieId);
                if (!m) return null;
                const votes = mVotes.filter((v) => v.eventMovieId === em.id);
                const mine = votes.some((v) => v.userId === user.id);
                return (
                  <li key={em.id}>
                    <form action={toggleMovieVote.bind(null, em.id, eventId)}>
                      <button
                        data-voted={mine}
                        className={`stamp block w-full overflow-hidden rounded-lg border-2 text-left ${
                          mine ? "border-proiettore" : "border-riga opacity-85 hover:opacity-100"
                        }`}
                        aria-pressed={mine}
                      >
                        <Poster title={m.title} year={m.year} genres={m.genres} className="aspect-2/3 w-full" />
                        <span className="block bg-sipario p-2">
                          <span className="block truncate text-sm font-semibold">{m.title}</span>
                          <span className="mt-0.5 block font-mono text-xs text-fumo">
                            {mine ? "✓ mi va bene · " : ""}
                            {votes.length} {votes.length === 1 ? "timbro" : "timbri"}
                            {votes.length > 0 && ` · ${votes.map((v) => nameOf(v.userId)).join(", ")}`}
                          </span>
                        </span>
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </section>

          {canManage && (
            <section className="ticket p-5" aria-labelledby="chiudi">
              <p className="eyebrow mb-3" id="chiudi">
                Regia · chiudi le votazioni
              </p>
              <form action={closeEvent.bind(null, eventId)} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-fumo">Data scelta</span>
                  <select
                    name="chosenDate"
                    defaultValue={bestDate?.date}
                    className="rounded-lg border border-riga bg-notte px-3 py-2.5 font-mono text-sm"
                  >
                    {dates.map((d) => (
                      <option key={d.id} value={d.date}>
                        {formatDateFull(d.date)} — {dVotes.filter((v) => v.eventDateId === d.id).length}{" "}
                        disponibili
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-fumo">Film scelto</span>
                  <select
                    name="chosenMovieId"
                    defaultValue={bestMovie?.movieId}
                    className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
                  >
                    {eMovies.map((em) => {
                      const m = ms.find((x) => x.id === em.movieId);
                      return (
                        <option key={em.id} value={em.movieId}>
                          {m?.title} — {mVotes.filter((v) => v.eventMovieId === em.id).length} timbri
                        </option>
                      );
                    })}
                  </select>
                </label>
                <button className="rounded-lg bg-proiettore py-2.5 font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso">
                  Conferma data e film
                </button>
              </form>
              <form action={cancelEvent.bind(null, eventId)} className="mt-3 text-center">
                <button className="text-xs text-fumo hover:text-velluto">Annulla la serata</button>
              </form>
            </section>
          )}
        </>
      )}

      {/* ---------- IN PROGRAMMA ---------- */}
      {event.status === "scheduled" && chosenMovie && (
        <>
          <section className="ticket ticket-glow flex flex-col overflow-hidden sm:flex-row">
            <div className="flex flex-1 gap-4 p-5">
              <Poster
                title={chosenMovie.title}
                year={chosenMovie.year}
                genres={chosenMovie.genres}
                className="h-40 w-28 shrink-0 rounded-md"
              />
              <div className="min-w-0">
                <p className="text-sm text-fumo">
                  {[
                    chosenMovie.year,
                    chosenMovie.runtime ? `${chosenMovie.runtime} min` : null,
                    chosenMovie.genres,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {chosenMovie.director && (
                  <p className="mt-2 text-sm text-schermo/80">regia di {chosenMovie.director}</p>
                )}
                {chosenMovie.actors && (
                  <p className="mt-1 text-sm text-schermo/80">con {chosenMovie.actors}</p>
                )}
                {event.location && <p className="mt-3 text-sm">📍 {event.location}</p>}
              </div>
            </div>
            <div className="ticket-tear flex items-center justify-between gap-1 px-5 py-4 sm:w-40 sm:flex-col sm:justify-center sm:text-center">
              <span className="eyebrow">Ammissione uno</span>
              <span className="font-mono text-lg font-semibold capitalize text-proiettore">
                {formatDateFull(event.chosenDate!)}
              </span>
            </div>
          </section>

          {canManage && (
            <section className="ticket p-5" aria-labelledby="vista">
              <p className="eyebrow mb-3" id="vista">
                Regia · dopo la visione
              </p>
              <form action={markWatched.bind(null, eventId)} className="flex flex-col gap-3">
                <p className="text-sm text-fumo">Chi c&apos;era?</p>
                <ul className="grid grid-cols-2 gap-2">
                  {people.map((p) => {
                    // pre-spunta chi si era detto disponibile per la data scelta
                    const chosenDateRow = dates.find((d) => d.date === event.chosenDate);
                    const wasAvailable = chosenDateRow
                      ? dVotes.some((v) => v.eventDateId === chosenDateRow.id && v.userId === p.id)
                      : false;
                    return (
                      <li key={p.id}>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-riga bg-notte px-3 py-2 text-sm has-checked:border-proiettore">
                          <input
                            type="checkbox"
                            name="attendees"
                            value={p.id}
                            defaultChecked={wasAvailable}
                            className="accent-[#e8b84b]"
                          />
                          {p.name}
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <button className="rounded-lg bg-proiettore py-2.5 font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso">
                  Segna come vista
                </button>
              </form>
              <form action={reopenEvent.bind(null, eventId)} className="mt-3 text-center">
                <button className="text-xs text-fumo hover:text-schermo">
                  Riapri le votazioni
                </button>
              </form>
            </section>
          )}
        </>
      )}

      {/* ---------- VISTA ---------- */}
      {event.status === "done" && chosenMovie && (
        <>
          <section className="ticket flex gap-4 p-5">
            <Poster
              title={chosenMovie.title}
              year={chosenMovie.year}
              genres={chosenMovie.genres}
              className="h-40 w-28 shrink-0 rounded-md"
            />
            <div className="min-w-0">
              <p className="font-mono text-sm capitalize text-proiettore">
                {event.chosenDate && formatDateFull(event.chosenDate)}
              </p>
              <p className="mt-1 text-sm text-fumo">
                {[chosenMovie.year, chosenMovie.runtime ? `${chosenMovie.runtime} min` : null, chosenMovie.director]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-3 text-sm">
                <span className="text-fumo">In sala:</span>{" "}
                {att.length > 0 ? att.map((a) => nameOf(a.userId)).join(", ") : "nessuno segnato"}
              </p>
              {rats.length > 0 && (
                <p className="mt-2">
                  <Stars value={rats.reduce((s, r) => s + r.stars, 0) / rats.length} />
                  <span className="ml-2 text-xs text-fumo">media del gruppo</span>
                </p>
              )}
            </div>
          </section>

          <section aria-labelledby="stelline">
            <p className="eyebrow mb-3" id="stelline">
              Le pagelle
            </p>
            {rats.length > 0 && (
              <ul className="mb-4 flex flex-col gap-2">
                {rats.map((r) => (
                  <li key={r.userId} className="ticket flex items-start justify-between gap-3 p-3">
                    <div>
                      <p className="text-sm font-semibold">{nameOf(r.userId)}</p>
                      {r.comment && <p className="mt-0.5 text-sm text-schermo/80">{r.comment}</p>}
                    </div>
                    <Stars value={r.stars} small />
                  </li>
                ))}
              </ul>
            )}
            {att.some((a) => a.userId === user.id) && (
              <form action={rateEvent.bind(null, eventId)} className="ticket flex flex-col gap-3 p-4">
                <p className="text-sm text-fumo">
                  {rats.some((r) => r.userId === user.id) ? "Correggi il tuo voto" : "Il tuo voto"}
                </p>
                <div className="flex gap-2" role="radiogroup" aria-label="Stelle da 1 a 5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} className="cursor-pointer">
                      <input
                        type="radio"
                        name="stars"
                        value={n}
                        defaultChecked={rats.find((r) => r.userId === user.id)?.stars === n}
                        className="peer sr-only"
                        required
                      />
                      <span className="block rounded-lg border border-riga px-3 py-2 font-mono text-sm peer-checked:border-proiettore peer-checked:bg-proiettore peer-checked:text-notte-fonda">
                        {n}★
                      </span>
                    </label>
                  ))}
                </div>
                <input
                  name="comment"
                  defaultValue={rats.find((r) => r.userId === user.id)?.comment ?? ""}
                  placeholder="Un commento (facoltativo)"
                  className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50"
                />
                <button className="rounded-lg bg-proiettore py-2 text-sm font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso">
                  Salva pagella
                </button>
              </form>
            )}
          </section>

          <section aria-labelledby="note">
            <p className="eyebrow mb-3" id="note">
              Note di sala
            </p>
            {canManage ? (
              <form action={saveEventNotes.bind(null, eventId)} className="flex flex-col gap-2">
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={event.notes ?? ""}
                  placeholder="Aneddoti, chi si è addormentato, cosa si è mangiato…"
                  className="rounded-lg border border-riga bg-sipario px-3 py-2.5 text-sm placeholder:text-fumo/50"
                />
                <button className="self-end rounded-lg border border-riga px-4 py-1.5 text-sm text-fumo transition-colors hover:border-proiettore hover:text-schermo">
                  Salva note
                </button>
              </form>
            ) : event.notes ? (
              <p className="ticket p-4 text-sm text-schermo/80">{event.notes}</p>
            ) : (
              <p className="text-sm text-fumo">Nessuna nota.</p>
            )}
          </section>
        </>
      )}

      {event.status === "cancelled" && (
        <p className="ticket p-6 text-center text-sm text-fumo">
          Serata annullata. <Link href="/serate/nuova" className="text-proiettore underline">Organizzane un&apos;altra</Link>.
        </p>
      )}
    </div>
  );
}
