import { notFound } from "next/navigation";
import Link from "next/link";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  attendance,
  circleMembers,
  dateVotes,
  eventContributions,
  eventDates,
  eventDiscussionMessages,
  eventInviteLinks,
  eventMovies,
  eventNeeds,
  eventRooms,
  eventRsvps,
  events,
  movieAvailability,
  movieBallotItems,
  movieBallots,
  movies,
  runoffVotes,
  ratings,
  ratingComments,
  reviewLikes,
  screeningLicenses,
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  addEventInvitees,
  addEventNeed,
  cancelEvent,
  closeEvent,
  createEventInviteLink,
  deleteEventNeed,
  markWatched,
  rateEvent,
  regenerateEventInviteLink,
  reopenEvent,
  saveEventContribution,
  saveEventNotes,
  submitRunoffVote,
  submitVotes,
  toggleEventNeedClaim,
  toggleReviewLike,
} from "@/lib/actions";
import { inviteesByEvent } from "@/lib/invites";
import { canAccessEvent } from "@/lib/access";
import { Poster } from "@/components/Poster";
import { ProposeDate } from "@/components/ProposeDate";
import { ProposeMovie } from "@/components/ProposeMovie";
import { Stars } from "@/components/Stars";
import { FocusSection } from "@/components/FocusSection";
import { VoteReminder } from "@/components/VoteReminder";
import { InviteLink } from "@/components/InviteLink";
import { formatDateFull, formatDateLong } from "@/lib/dates";
import { filmSlug } from "@/lib/films";
import { ConsensusBallot } from "@/components/ConsensusBallot";
import { OnlineRoomCard } from "@/components/OnlineRoomCard";
import { ReviewThread } from "@/components/ReviewThread";
import { EventDiscussion } from "@/components/EventDiscussion";
import { ParticipationToggle } from "@/components/ParticipationToggle";

export const dynamic = "force-dynamic";

const NEED_PRESETS = [
  "🍿 Popcorn",
  "🍺 Birre",
  "🥤 Bibite",
  "💧 Acqua",
  "🧊 Ghiaccio",
  "🍰 Dolce",
  "🎬 Film o streaming",
  "🔌 Cavi e adattatori",
];

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

  const invitees = (await inviteesByEvent([eventId])).get(eventId) ?? [];
  const restricted = event.access !== "club" && event.access !== "public";
  if (!(await canAccessEvent(event, user))) {
    return (
      <div className="mx-auto max-w-md pt-10 text-center">
        <p className="eyebrow">Riservato</p>
        <h1 className="titlecard mt-2 text-2xl text-schermo">Serata su invito</h1>
        <p className="mt-3 text-sm text-fumo">
          Questa proiezione è riservata a una lista di invitati. Sarà per la prossima.
        </p>
        <Link href="/serate" className="mt-6 inline-block text-sm text-proiettore underline">
          Torna al cartellone
        </Link>
      </div>
    );
  }
  const circleMemberships =
    event.access === "circle" && event.circleId
      ? await db.query.circleMembers.findMany({
          where: eq(circleMembers.circleId, event.circleId),
        })
      : [];
  const invitedPeople =
    event.access === "invite_only"
      ? people.filter((p) => invitees.includes(p.id) || p.id === event.createdBy)
      : event.access === "circle"
        ? people.filter((p) =>
            p.id === event.createdBy ||
            invitees.includes(p.id) ||
            circleMemberships.some(
              (membership) => membership.userId === p.id && membership.status === "active"
            )
          )
        : people;
  const directInviteCandidates = restricted
    ? people.filter((person) => !invitedPeople.some((invited) => invited.id === person.id))
    : [];

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
  const ballots = await db.query.movieBallots.findMany({
    where: eq(movieBallots.eventId, eventId),
  });
  const ballotItems =
    ballots.length > 0
      ? await db.query.movieBallotItems.findMany({
          where: inArray(
            movieBallotItems.ballotId,
            ballots.map((ballot) => ballot.id)
          ),
        })
      : [];
  const availability =
    ms.length > 0
      ? await db.query.movieAvailability.findMany({
          where: inArray(
            movieAvailability.movieId,
            ms.map((movie) => movie.id)
          ),
        })
      : [];
  const rVotes =
    eMovies.length > 0 && event.status === "runoff"
      ? await db.query.runoffVotes.findMany({
          where: inArray(
            runoffVotes.eventMovieId,
            eMovies.map((em) => em.id)
          ),
        })
      : [];

  // promemoria organizzatore: chi non ha ancora registrato una scelta
  const missingDateNames = canManage
    ? invitedPeople
        .filter((p) => !dVotes.some((v) => v.userId === p.id))
        .map((p) => p.name)
    : [];

  // catalogo proponibile: tutto ciò che non è già in rosa
  const proposable =
    event.status === "open"
      ? (await db.query.movies.findMany({ orderBy: asc(movies.title) })).filter(
          (m) => !eMovies.some((em) => em.movieId === m.id)
        )
      : [];

  const chosenMovie = event.chosenMovieId
    ? (ms.find((m) => m.id === event.chosenMovieId) ??
      (await db.query.movies.findFirst({ where: eq(movies.id, event.chosenMovieId) })))
    : null;

  const att = await db.query.attendance.findMany({ where: eq(attendance.eventId, eventId) });
  const rats = await db.query.ratings.findMany({ where: eq(ratings.eventId, eventId) });
  const likes =
    event.status === "done"
      ? await db.query.reviewLikes.findMany({ where: eq(reviewLikes.eventId, eventId) })
      : [];
  const comments =
    event.status === "done"
      ? await db.query.ratingComments.findMany({
          where: eq(ratingComments.eventId, eventId),
          orderBy: asc(ratingComments.id),
        })
      : [];
  const rsvps =
    event.status !== "cancelled"
      ? await db.query.eventRsvps.findMany({
          where: eq(eventRsvps.eventId, eventId),
        })
      : [];
  const currentRsvp = rsvps.find((rsvp) => rsvp.userId === user.id);
  const notParticipating = currentRsvp?.status === "no";
  const discussionMessages =
    event.status === "open" || event.status === "runoff"
      ? await db.query.eventDiscussionMessages.findMany({
          where: eq(eventDiscussionMessages.eventId, eventId),
          orderBy: asc(eventDiscussionMessages.id),
          limit: 80,
        })
      : [];
  const contributions = await db.query.eventContributions.findMany({
    where: eq(eventContributions.eventId, eventId),
  });
  const needs = await db.query.eventNeeds.findMany({
    where: eq(eventNeeds.eventId, eventId),
    orderBy: asc(eventNeeds.id),
  });
  const inviteLink = canManage
    ? await db.query.eventInviteLinks.findFirst({
        where: eq(eventInviteLinks.eventId, eventId),
      })
    : null;
  const room = await db.query.eventRooms.findFirst({
    where: eq(eventRooms.eventId, eventId),
  });
  const screeningLicense =
    event.viewingMode === "licensed_public"
      ? await db.query.screeningLicenses.findFirst({
          where: eq(screeningLicenses.eventId, eventId),
        })
      : null;

  // suggerimenti chiusura: data più disponibile, film più approvato
  const bestDate = [...dates].sort(
    (a, b) =>
      dVotes.filter((v) => v.eventDateId === b.id).length -
      dVotes.filter((v) => v.eventDateId === a.id).length
  )[0];
  const consensusScore = (eventMovieId: number) =>
    ballotItems
      .filter((item) => item.eventMovieId === eventMovieId && item.rank)
      .reduce((sum, item) => sum + (4 - item.rank!), 0);
  const vetoCount = (eventMovieId: number) =>
    ballotItems.filter((item) => item.eventMovieId === eventMovieId && item.veto).length;
  const rankCount = (eventMovieId: number, rank: number) =>
    ballotItems.filter(
      (item) => item.eventMovieId === eventMovieId && item.rank === rank
    ).length;
  const titleForCandidate = (eventMovieId: number) => {
    const candidate = eMovies.find((item) => item.id === eventMovieId);
    return candidate
      ? ms.find((movie) => movie.id === candidate.movieId)?.title ?? "Film non disponibile"
      : "Film non disponibile";
  };
  const ballotDetails = ballots.map((ballot) => ({
    userId: ballot.userId,
    userName: nameOf(ballot.userId),
    choices: ballotItems
      .filter((item) => item.ballotId === ballot.id && item.rank)
      .sort((a, b) => a.rank! - b.rank!)
      .map((item) => ({
        rank: item.rank!,
        title: titleForCandidate(item.eventMovieId),
      })),
    vetoes: ballotItems
      .filter((item) => item.ballotId === ballot.id && item.veto)
      .map((item) => titleForCandidate(item.eventMovieId)),
  }));
  const bestMovie = [...eMovies].sort(
    (a, b) => consensusScore(b.id) - consensusScore(a.id) || vetoCount(a.id) - vetoCount(b.id)
  )[0];

  const runoffMovies = eMovies.filter((em) => em.inRunoff);
  const runoffLeader = [...runoffMovies].sort(
    (a, b) =>
      rVotes.filter((v) => v.eventMovieId === b.id).length -
      rVotes.filter((v) => v.eventMovieId === a.id).length
  )[0];

  const title = chosenMovie ? chosenMovie.title : event.title || "Serata da decidere";

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
      <div className="flex min-w-0 flex-col gap-8">
      <FocusSection />
      <header>
        <p className="eyebrow">
          {event.status === "open" && "Votazioni aperte"}
          {event.status === "runoff" && "Ballottaggio"}
          {event.status === "scheduled" && "In programma"}
          {event.status === "done" && "Vista"}
          {event.status === "cancelled" && "Annullata"}
          {" · di "}
          {nameOf(event.createdBy)}
        </p>
        <h1 className="titlecard mt-1 text-2xl text-schermo sm:text-3xl">
          {chosenMovie ? (
            <Link href={`/film/${filmSlug(chosenMovie)}`} className="transition-colors hover:text-proiettore">
              {title}
            </Link>
          ) : (
            title
          )}
        </h1>
        {event.title && chosenMovie && <p className="mt-1 text-sm text-fumo">{event.title}</p>}
        {restricted && (
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-fumo">
            {event.access === "invite_only"
              ? `Su invito · ${invitees.map(nameOf).join(", ")}`
              : "Solo per il circolo"}
          </p>
        )}
        {event.status === "open" && (event.location || event.startTime) && (
          <p className="mt-2 text-sm text-fumo">
            {event.location && <span>📍 {event.location}</span>}
            {event.location && event.startTime && " · "}
            {event.startTime && <span>🕘 {event.startTime}</span>}
          </p>
        )}
      </header>

      {(event.status === "open" || event.status === "runoff" || event.status === "scheduled") && (
        <ParticipationToggle
          eventId={eventId}
          notParticipating={notParticipating}
        />
      )}

      {event.viewingMode !== "in_person" && event.status !== "cancelled" && (
        <OnlineRoomCard
          eventId={eventId}
          viewingMode={event.viewingMode}
          roomConfigured={Boolean(room)}
          canManage={canManage}
          licenseStatus={screeningLicense?.status ?? null}
        />
      )}

      {canManage && event.status !== "cancelled" && event.status !== "done" && (
        <section className="ticket order-[70] p-5" aria-labelledby="invita">
          <p className="step-title mb-2" id="invita">
            Invita gli amici
          </p>
          <p className="mb-4 text-sm text-fumo">
            Aggiungi account esistenti oppure condividi il link. Chi non ha ancora un account può
            registrarsi dall&apos;invito.
          </p>
          {directInviteCandidates.length > 0 && (
            <details className="mb-4 rounded-lg border border-riga bg-notte">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-proiettore transition-colors hover:bg-proiettore/10">
                + Aggiungi persone ({directInviteCandidates.length})
              </summary>
              <form
                action={addEventInvitees.bind(null, eventId)}
                className="border-t border-riga p-4"
              >
                <ul className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
                  {directInviteCandidates.map((person) => (
                    <li key={person.id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-riga px-3 py-2 text-sm transition-colors has-checked:border-proiettore has-checked:bg-proiettore/10 hover:border-proiettore/60">
                        <input
                          type="checkbox"
                          name="userIds"
                          value={person.id}
                          className="accent-[#e8b84b]"
                        />
                        {person.name}
                      </label>
                    </li>
                  ))}
                </ul>
                <button className="mt-3 cursor-pointer rounded-lg bg-proiettore px-4 py-2.5 text-sm font-semibold text-notte-fonda transition-all hover:-translate-y-0.5 hover:bg-proiettore-acceso">
                  Invita selezionati
                </button>
              </form>
            </details>
          )}
          {inviteLink ? (
            <>
              <InviteLink token={inviteLink.token} eventTitle={title} />
              <form action={regenerateEventInviteLink.bind(null, eventId)} className="mt-3">
                <button className="text-xs text-fumo underline hover:text-schermo">
                  Invalida il vecchio link e creane uno nuovo
                </button>
              </form>
            </>
          ) : (
            <form action={createEventInviteLink.bind(null, eventId)}>
              <button className="rounded-lg bg-proiettore px-4 py-2.5 text-sm font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso">
                Crea link d&apos;invito
              </button>
            </form>
          )}
        </section>
      )}

      {event.status !== "cancelled" && event.status !== "done" && (
        <section className="ticket p-5" aria-labelledby="cosa-portiamo">
          <div className="mb-4">
            <p className="step-title" id="cosa-portiamo">
              Cosa portiamo?
            </p>
            <p className="mt-1 text-sm text-fumo">
              Scegli qualcosa dalla lista. Quello che manca resta subito visibile.
            </p>
            {notParticipating && (
              <p className="mt-2 text-xs text-velluto">
                Hai indicato che non parteciperai: non puoi prendere impegni.
              </p>
            )}
          </div>

          {needs.length > 0 ? (
            <ul className="grid gap-2">
              {needs.map((need) => {
                const mine = need.claimedBy === user.id;
                const claimed = need.claimedBy !== null;
                return (
                  <li
                    key={need.id}
                    className={`flex flex-col gap-3 rounded-lg border px-3 py-3 sm:flex-row sm:items-center sm:justify-between ${
                      claimed ? "border-riga bg-notte" : "border-proiettore/60 bg-proiettore/5"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-schermo">{need.item}</p>
                      {need.quantity && (
                        <p className="mt-0.5 text-xs text-fumo">{need.quantity}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {mine ? (
                        <form action={toggleEventNeedClaim.bind(null, eventId, need.id)}>
                          <button
                            disabled={notParticipating}
                            className="rounded-full border border-proiettore bg-proiettore/10 px-3 py-1.5 text-xs text-proiettore transition-colors hover:bg-proiettore/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ✓ Lo porti tu · lascia
                          </button>
                        </form>
                      ) : claimed ? (
                        <span className="rounded-full border border-riga px-3 py-1.5 text-xs text-fumo">
                          Lo porta {nameOf(need.claimedBy!)}
                        </span>
                      ) : (
                        <form action={toggleEventNeedClaim.bind(null, eventId, need.id)}>
                          <button
                            disabled={notParticipating}
                            className="rounded-full bg-proiettore px-3 py-1.5 text-xs font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Lo porto io
                          </button>
                        </form>
                      )}
                      {canManage && (
                        <form action={deleteEventNeed.bind(null, eventId, need.id)}>
                          <button
                            aria-label={`Rimuovi ${need.item} dalla lista`}
                            className="text-lg leading-none text-fumo transition-colors hover:text-velluto"
                          >
                            ×
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-riga px-3 py-4 text-sm text-fumo">
              Lista ancora vuota. Chi organizza aggiunge quello che serve.
            </p>
          )}

          {canManage && (
            <div className="mt-5 border-t border-riga pt-5">
              <p className="eyebrow mb-3">Aggiungi alla lista</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {NEED_PRESETS.filter(
                  (preset) =>
                    !needs.some(
                      (need) =>
                        need.item.toLocaleLowerCase("it") === preset.toLocaleLowerCase("it")
                    )
                ).map((preset) => (
                  <form key={preset} action={addEventNeed.bind(null, eventId)}>
                    <input type="hidden" name="item" value={preset} />
                    <button className="rounded-full border border-riga px-3 py-1.5 text-xs text-fumo transition-colors hover:border-proiettore hover:text-schermo">
                      + {preset}
                    </button>
                  </form>
                ))}
              </div>
              <form
                action={addEventNeed.bind(null, eventId)}
                className="grid gap-2 sm:grid-cols-[1fr_10rem_auto]"
              >
                <input
                  name="item"
                  maxLength={80}
                  required
                  placeholder="Altra cosa da portare"
                  aria-label="Cosa serve"
                  className="min-w-0 rounded-lg border border-riga bg-sipario px-3 py-2.5 text-sm placeholder:text-fumo/50"
                />
                <input
                  name="quantity"
                  maxLength={40}
                  placeholder="Quantità"
                  aria-label="Quantità facoltativa"
                  className="min-w-0 rounded-lg border border-riga bg-sipario px-3 py-2.5 text-sm placeholder:text-fumo/50"
                />
                <button className="rounded-lg border border-proiettore px-4 py-2.5 text-sm font-semibold text-proiettore transition-colors hover:bg-proiettore/10">
                  Aggiungi
                </button>
              </form>
            </div>
          )}

          <div className="mt-5 border-t border-riga pt-5">
            <p className="eyebrow mb-1">Extra personali</p>
            <p className="mb-3 text-xs text-fumo">
              Qualcosa fuori lista? Scrivilo qui.
            </p>
            {contributions.length > 0 && (
              <ul className="mb-3 flex flex-wrap gap-2">
                {contributions.map((contribution) => (
                  <li
                    key={contribution.userId}
                    className="rounded-full border border-riga bg-notte px-3 py-1.5 text-xs"
                  >
                    <span className="font-semibold">{nameOf(contribution.userId)}</span>
                    <span className="text-fumo"> · {contribution.item}</span>
                  </li>
                ))}
              </ul>
            )}
            <form
              action={saveEventContribution.bind(null, eventId)}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <input
                name="item"
                defaultValue={
                  contributions.find((contribution) => contribution.userId === user.id)?.item ?? ""
                }
                maxLength={160}
                placeholder="Io porto…"
                aria-label="Cosa porti alla serata"
                disabled={notParticipating}
                className="min-w-0 flex-1 rounded-lg border border-riga bg-sipario px-3 py-2.5 text-sm placeholder:text-fumo/50"
              />
              <button
                disabled={notParticipating}
                className="rounded-lg border border-proiettore px-4 py-2.5 text-sm font-semibold text-proiettore transition-colors hover:bg-proiettore/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Segna cosa porto
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ---------- VOTAZIONE ---------- */}
      {event.status === "open" && (
        <>
          <form action={submitVotes.bind(null, eventId)} className="flex flex-col gap-4">
            <section aria-labelledby="vota-date">
              <p className="step-title mb-3" id="vota-date">
                Atto I · Quando ci sei?
              </p>
              {canManage && (
                <VoteReminder
                  label="Date"
                  votedCount={invitedPeople.length - missingDateNames.length}
                  totalCount={invitedPeople.length}
                  missingNames={missingDateNames}
                  copyUrl={`/serate/${eventId}?focus=date`}
                />
              )}
              <ul className="mx-auto mt-3 flex max-w-md flex-col gap-2">
                {dates.map((d) => {
                  const votes = dVotes.filter((v) => v.eventDateId === d.id);
                  const mine = votes.some((v) => v.userId === user.id);
                  return (
                    <li key={d.id}>
                      <label
                        className={`stamp flex w-full items-center justify-between rounded-lg border border-riga bg-sipario px-4 py-3 text-left transition-colors has-checked:border-proiettore has-checked:bg-proiettore/10 ${
                          notParticipating
                            ? "cursor-not-allowed opacity-40"
                            : "cursor-pointer hover:border-fumo"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="dateIds"
                          value={d.id}
                          defaultChecked={mine}
                          disabled={notParticipating}
                          className="peer sr-only"
                        />
                        <span className="font-mono text-sm capitalize">
                          {formatDateLong(d.date)}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-fumo">
                          {votes.length > 0 && (
                            <span>{votes.map((v) => nameOf(v.userId)).join(", ")}</span>
                          )}
                          <span
                            aria-hidden
                            className="flex h-6 w-6 items-center justify-center rounded-sm border border-riga font-mono font-semibold text-transparent peer-checked:border-proiettore peer-checked:bg-proiettore peer-checked:text-notte-fonda"
                          >
                            ✓
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={notParticipating}
                className="rounded-lg border border-proiettore px-5 py-2.5 text-sm font-semibold text-proiettore transition-colors hover:bg-proiettore/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Salva disponibilità
              </button>
            </div>
          </form>

          <section aria-labelledby="vota-film">
            <p className="step-title mb-3" id="vota-film">
              Atto II · Quale film scegli?
            </p>
            <div className="mt-3">
              <ConsensusBallot
                eventId={eventId}
                candidates={eMovies.flatMap((candidate) => {
                  const movie = ms.find((item) => item.id === candidate.movieId);
                  return movie
                    ? [
                        {
                          id: candidate.id,
                          title: movie.title,
                          year: movie.year,
                          genres: movie.genres,
                          posterUrl: movie.posterUrl,
                          posterCredit: movie.posterCredit,
                          providers: [
                            ...new Set(
                              availability
                                .filter((item) => item.movieId === movie.id)
                                .map((item) => item.provider)
                            ),
                          ],
                          score: consensusScore(candidate.id),
                          vetoes: vetoCount(candidate.id),
                          firstChoices: rankCount(candidate.id, 1),
                          secondChoices: rankCount(candidate.id, 2),
                          thirdChoices: rankCount(candidate.id, 3),
                        },
                      ]
                    : [];
                })}
                initialRanks={ballotItems
                  .filter(
                    (item) =>
                      item.ballotId ===
                        ballots.find((ballot) => ballot.userId === user.id)?.id && item.rank
                  )
                  .sort((a, b) => a.rank! - b.rank!)
                  .map((item) => item.eventMovieId)}
                initialVetoes={ballotItems
                  .filter(
                    (item) =>
                      item.ballotId ===
                        ballots.find((ballot) => ballot.userId === user.id)?.id && item.veto
                  )
                  .map((item) => item.eventMovieId)}
                ballotsCount={ballots.length}
                ballotDetails={ballotDetails}
                disabled={notParticipating}
              />
            </div>
          </section>

          {!notParticipating && (
            <div className="grid grid-cols-2 gap-2">
              <ProposeDate eventId={eventId} />
              <ProposeMovie
                eventId={eventId}
                movies={proposable.map((m) => ({ id: m.id, title: m.title, year: m.year }))}
              />
            </div>
          )}

          {canManage && (
            <section className="ticket p-5" aria-labelledby="chiudi">
              <p className="step-title mb-3" id="chiudi">
                Regia · chiudi le votazioni
              </p>
              <p className="mb-4 text-sm text-fumo">
                La proposta mette in testa il punteggio più alto e, a parità, meno veti.
                Puoi sempre scegliere diversamente.
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
                          {m?.title} — {consensusScore(em.id)} punti · {vetoCount(em.id)} veti
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

      {/* ---------- BALLOTTAGGIO ---------- */}
      {event.status === "runoff" && (
        <>
          <form action={submitRunoffVote.bind(null, eventId)} className="flex flex-col gap-8">
            <section aria-labelledby="ballottaggio">
              <p className="step-title mb-3" id="ballottaggio">
                Ballottaggio · pareggio in Atto II — scegli un solo film
              </p>
              <ul
                className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
                role="radiogroup"
                aria-labelledby="ballottaggio"
              >
                {runoffMovies.map((em) => {
                  const m = ms.find((x) => x.id === em.movieId);
                  if (!m) return null;
                  const votes = rVotes.filter((v) => v.eventMovieId === em.id);
                  const mine = votes.some((v) => v.userId === user.id);
                  return (
                    <li key={em.id}>
                      <label
                        className={`stamp block w-full overflow-hidden rounded-lg border-2 border-riga text-left has-checked:border-proiettore has-checked:opacity-100 ${
                          notParticipating
                            ? "cursor-not-allowed opacity-40"
                            : "cursor-pointer opacity-85 hover:opacity-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="eventMovieId"
                          value={em.id}
                          defaultChecked={mine}
                          disabled={notParticipating}
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
                        <span className="block bg-sipario p-2">
                          <span className="block truncate text-sm font-semibold">{m.title}</span>
                          <span className="mt-0.5 block font-mono text-xs text-fumo">
                            {votes.length} {votes.length === 1 ? "voto" : "voti"}
                            {votes.length > 0 && ` · ${votes.map((v) => nameOf(v.userId)).join(", ")}`}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>

            <div className="ticket ticket-glow flex flex-col gap-2 p-4">
              <button
                type="submit"
                disabled={notParticipating}
                className="titlecard rounded-lg bg-proiettore py-3 text-base text-notte-fonda transition-colors hover:bg-proiettore-acceso disabled:cursor-not-allowed disabled:opacity-40"
              >
                Vota!
              </button>
              <p className="text-center text-xs text-fumo">
                {rVotes.some((v) => v.userId === user.id)
                  ? "Hai già votato: la nuova scelta sostituisce la vecchia."
                  : "La scelta si può correggere finché il ballottaggio è aperto."}
              </p>
            </div>
          </form>

          {canManage && (
            <section className="ticket p-5" aria-labelledby="chiudi-ballottaggio">
              <p className="step-title mb-3" id="chiudi-ballottaggio">
                Regia · chiudi il ballottaggio
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
                    defaultValue={runoffLeader?.movieId}
                    className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
                  >
                    {runoffMovies.map((em) => {
                      const m = ms.find((x) => x.id === em.movieId);
                      return (
                        <option key={em.id} value={em.movieId}>
                          {m?.title} — {rVotes.filter((v) => v.eventMovieId === em.id).length} voti
                        </option>
                      );
                    })}
                  </select>
                </label>
                <button className="rounded-lg bg-proiettore py-2.5 font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso">
                  Conferma data e film
                </button>
              </form>
              <form action={reopenEvent.bind(null, eventId)} className="mt-3 text-center">
                <button className="text-xs text-fumo hover:text-velluto">Annulla ballottaggio</button>
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
              <Link href={`/film/${filmSlug(chosenMovie)}`} className="shrink-0">
                <Poster
                  title={chosenMovie.title}
                  year={chosenMovie.year}
                  genres={chosenMovie.genres}
                  posterUrl={chosenMovie.posterUrl}
                  posterCredit={chosenMovie.posterCredit}
                  className="h-40 w-28 shrink-0 rounded-md transition-opacity hover:opacity-85"
                />
              </Link>
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
                {event.startTime && <p className="mt-1 text-sm">🕘 {event.startTime}</p>}
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
              <p className="step-title mb-3" id="vista">
                Regia · dopo la visione
              </p>
              <form action={markWatched.bind(null, eventId)} className="flex flex-col gap-3">
                <p className="text-sm text-fumo">Chi c&apos;era?</p>
                <ul className="grid grid-cols-2 gap-2">
                  {invitedPeople.map((p) => {
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
            <Link href={`/film/${filmSlug(chosenMovie)}`} className="shrink-0">
              <Poster
                title={chosenMovie.title}
                year={chosenMovie.year}
                genres={chosenMovie.genres}
                posterUrl={chosenMovie.posterUrl}
                posterCredit={chosenMovie.posterCredit}
                className="h-40 w-28 shrink-0 rounded-md transition-opacity hover:opacity-85"
              />
            </Link>
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

          <section id="pagelle" aria-labelledby="stelline">
            <p className="step-title mb-3" id="stelline">
              Le pagelle
            </p>
            {rats.length > 0 && (
              <ul className="mb-4 flex flex-col gap-2">
                {rats.map((r) => {
                  const reviewLikesForUser = likes.filter((like) => like.reviewUserId === r.userId);
                  const likedByMe = reviewLikesForUser.some((like) => like.userId === user.id);
                  const likeCount = reviewLikesForUser.length;

                  return (
                    <li key={r.userId} className="ticket p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold">{nameOf(r.userId)}</p>
                        <Stars value={r.stars} small />
                      </div>
                      {r.comment && (
                        <>
                          <p className="mt-1 text-sm text-schermo/80">{r.comment}</p>
                          <div className="mt-2">
                            {r.userId !== user.id ? (
                              <form action={toggleReviewLike.bind(null, eventId, r.userId)}>
                                <button
                                  aria-label={`${likedByMe ? "Togli Mi piace da" : "Metti Mi piace a"} questa pagella`}
                                  className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                                    likedByMe
                                      ? "border-proiettore bg-proiettore/10 text-proiettore"
                                      : "border-riga text-fumo hover:border-proiettore hover:text-proiettore"
                                  }`}
                                >
                                  {likedByMe ? "♥ Ti piace" : "♡ Mi piace"}
                                  {likeCount > 0 && ` · ${likeCount}`}
                                </button>
                              </form>
                            ) : (
                              likeCount > 0 && (
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-proiettore">
                                  ♥ {likeCount} Mi piace
                                </span>
                              )
                            )}
                          </div>
                          <ReviewThread
                            eventId={eventId}
                            ratingUserId={r.userId}
                            currentUserId={user.id}
                            canComment={
                              r.userId !== user.id &&
                              att.some((person) => person.userId === user.id)
                            }
                            comments={comments
                              .filter((comment) => comment.ratingUserId === r.userId)
                              .map((comment) => ({
                                id: comment.id,
                                authorUserId: comment.authorUserId,
                                authorName: nameOf(comment.authorUserId),
                                body: comment.body,
                                spoiler: comment.spoiler,
                                createdAt: comment.createdAt,
                              }))}
                          />
                        </>
                      )}
                    </li>
                  );
                })}
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
            <p className="step-title mb-3" id="note">
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
      {(event.status === "open" || event.status === "runoff") && (
        <EventDiscussion
          eventId={eventId}
          currentUserId={user.id}
          messages={discussionMessages.map((message) => ({
            id: message.id,
            userId: message.userId,
            userName: nameOf(message.userId),
            body: message.body,
            createdAt: message.createdAt,
          }))}
        />
      )}
    </div>
  );
}
