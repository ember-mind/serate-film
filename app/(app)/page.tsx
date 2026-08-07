import Link from "next/link";
import { eq, desc, asc, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  circleMembers,
  events,
  journeyMembers,
  movies,
  ratingComments,
  ratings,
  reviewLikes,
  userFriends,
  users,
  watchlist,
} from "@/db/schema";
import { Poster } from "@/components/Poster";
import { Avatar } from "@/components/Avatar";
import { Cinepresa } from "@/components/Cinepresa";
import { randomQuote } from "@/lib/quotes";
import { requireUser } from "@/lib/auth";
import { filterVisible } from "@/lib/invites";
import { formatDateFull } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const me = await requireUser();
  const scheduled = await filterVisible(
    await db.query.events.findMany({
      where: eq(events.status, "scheduled"),
      orderBy: asc(events.chosenDate),
    }),
    me
  );
  const next = scheduled[0] ?? null;
  const nextMovie = next?.chosenMovieId
    ? await db.query.movies.findFirst({ where: eq(movies.id, next.chosenMovieId) })
    : null;

  const open = await filterVisible(
    await db.query.events.findMany({
      where: eq(events.status, "open"),
      orderBy: desc(events.createdAt),
    }),
    me
  );

  const wl = await db.query.watchlist.findMany({
    where: eq(watchlist.status, "active"),
    orderBy: desc(watchlist.addedAt),
    limit: 10,
  });
  const wlMovies =
    wl.length > 0
      ? await db.query.movies.findMany({
          where: inArray(
            movies.id,
            wl.map((w) => w.movieId)
          ),
        })
      : [];

  const [friendRows, myCircleMemberships, myJourneyMemberships] = await Promise.all([
    db.query.userFriends.findMany({ where: eq(userFriends.userId, me.id) }),
    db.query.circleMembers.findMany({ where: eq(circleMembers.userId, me.id) }),
    db.query.journeyMembers.findMany({ where: eq(journeyMembers.userId, me.id) }),
  ]);
  const pendingJourneyInvites = myJourneyMemberships.filter(
    (membership) => membership.status === "invited"
  ).length;
  const activeJourneys = myJourneyMemberships.filter(
    (membership) => membership.status === "active"
  ).length;
  const circleIds = myCircleMemberships
    .filter((membership) => membership.status === "active")
    .map((membership) => membership.circleId);
  const sharedMemberships =
    circleIds.length > 0
      ? await db.query.circleMembers.findMany({
          where: inArray(circleMembers.circleId, circleIds),
        })
      : [];
  const socialIds = [
    ...new Set([
      me.id,
      ...friendRows.map((friend) => friend.friendUserId),
      ...sharedMemberships
        .filter((membership) => membership.status === "active")
        .map((membership) => membership.userId),
    ]),
  ];
  const people = await db.query.users.findMany({
    where: inArray(users.id, socialIds),
    orderBy: asc(users.name),
  });
  const seen = await filterVisible(
    await db.query.events.findMany({
      where: eq(events.status, "done"),
      orderBy: desc(events.chosenDate),
    }),
    me
  );
  const visibleEventRows = [...scheduled, ...open, ...seen];
  const visibleEventIds = [...new Set(visibleEventRows.map((event) => event.id))];
  const [homeComments, homeLikes, homeRatings] =
    visibleEventIds.length > 0
      ? await Promise.all([
          db.query.ratingComments.findMany({
            where: inArray(ratingComments.eventId, visibleEventIds),
            orderBy: desc(ratingComments.createdAt),
            limit: 8,
          }),
          db.query.reviewLikes.findMany({
            where: inArray(reviewLikes.eventId, visibleEventIds),
            orderBy: desc(reviewLikes.createdAt),
            limit: 8,
          }),
          db.query.ratings.findMany({
            where: inArray(ratings.eventId, visibleEventIds),
          }),
        ])
      : [[], [], []];
  const nameOf = (userId: number) =>
    people.find((person) => person.id === userId)?.name ?? "Qualcuno";
  const activityItems = [
    ...visibleEventRows.map((event) => ({
      id: `event-${event.id}`,
      at: event.createdAt,
      href: `/serate/${event.id}`,
      icon: event.viewingMode === "in_person" ? "🎬" : "◉",
      title: `${nameOf(event.createdBy)} ha aperto ${event.title || "una nuova serata"}`,
      detail:
        event.status === "open"
          ? "Data e film da decidere insieme"
          : event.status === "scheduled"
            ? "Serata confermata"
            : "Serata conclusa",
    })),
    ...homeRatings.map((rating) => {
      const event = seen.find((item) => item.id === rating.eventId);
      return {
        id: `rating-${rating.eventId}-${rating.userId}`,
        at: event?.chosenDate ? `${event.chosenDate}T21:00:00` : event?.createdAt ?? "",
        href: `/serate/${rating.eventId}#pagelle`,
        icon: "★",
        title: `${nameOf(rating.userId)} ha dato ${rating.stars}/5`,
        detail: rating.comment || "Nuova pagella",
      };
    }),
    ...homeComments.map((comment) => ({
      id: `comment-${comment.id}`,
      at: comment.createdAt,
      href: `/serate/${comment.eventId}#pagelle`,
      icon: "↳",
      title: `${nameOf(comment.authorUserId)} ha risposto a ${nameOf(comment.ratingUserId)}`,
      detail: comment.spoiler ? "Commento con spoiler" : comment.body,
    })),
    ...homeLikes.map((like) => ({
      id: `like-${like.eventId}-${like.reviewUserId}-${like.userId}`,
      at: like.createdAt,
      href: `/serate/${like.eventId}#pagelle`,
      icon: "♥",
      title: `${nameOf(like.userId)} ha apprezzato una pagella`,
      detail: `Di ${nameOf(like.reviewUserId)}`,
    })),
  ]
    .filter((item) => item.at)
    .sort(
      (a, b) =>
        new Date(b.at.replace(" ", "T")).getTime() -
        new Date(a.at.replace(" ", "T")).getTime()
    )
    .slice(0, 3);

  // manifesti in corridoio: le ultime proiezioni appese alla parete
  const wallEvents = seen.filter((e) => e.chosenMovieId).slice(0, 4);
  const wallMovies =
    wallEvents.length > 0
      ? await db.query.movies.findMany({
          where: inArray(
            movies.id,
            wallEvents.map((e) => e.chosenMovieId!)
          ),
        })
      : [];
  const tilts = ["-2.2deg", "1.6deg", "-1.2deg", "2.4deg"];

  const quote = randomQuote();

  return (
    <div className="apertura flex flex-col gap-12">
      <div className="cinepresa-stage -mb-8">
        <Cinepresa />
      </div>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Scorciatoie">
        <Link
          href="/serate/nuova"
          className="ticket group p-4 transition-colors hover:border-proiettore"
        >
          <p className="text-xl" aria-hidden="true">✦</p>
          <h2 className="mt-2 font-semibold text-schermo group-hover:text-proiettore">
            Crea una serata
          </h2>
        </Link>
        <Link
          href="/circoli"
          className="ticket group p-4 transition-colors hover:border-proiettore"
        >
          <p className="text-xl" aria-hidden="true">◎</p>
          <h2 className="mt-2 font-semibold text-schermo group-hover:text-proiettore">
            I tuoi circoli
          </h2>
          <p className="mt-1 text-xs leading-5 text-fumo">
            Le compagnie con cui torni a vedere film.
          </p>
        </Link>
        <Link
          href="/percorsi"
          className="ticket group p-4 transition-colors hover:border-proiettore"
        >
          <p className="text-xl" aria-hidden="true">↗</p>
          <h2 className="mt-2 font-semibold text-schermo group-hover:text-proiettore">
            I tuoi percorsi
          </h2>
          <p className="mt-1 text-xs leading-5 text-fumo">
            {pendingJourneyInvites > 0
              ? `${pendingJourneyInvites} ${pendingJourneyInvites === 1 ? "invito da decidere" : "inviti da decidere"}`
              : activeJourneys > 0
                ? `${activeJourneys} ${activeJourneys === 1 ? "percorso attivo" : "percorsi attivi"}`
                : "Scopri un regista o un attore film dopo film."}
          </p>
        </Link>
      </section>

      {/* lo schermo: prossima proiezione */}
      {next && nextMovie && (
        <section aria-label="Prossima serata" className="-mx-4">
          <Link href={`/serate/${next.id}`} className="cinemascope block px-5 py-8 sm:px-10">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 sm:flex-row sm:items-stretch">
              <Poster
                title={nextMovie.title}
                year={nextMovie.year}
                genres={nextMovie.genres}
                posterUrl={nextMovie.posterUrl}
                posterCredit={nextMovie.posterCredit}
                className="h-52 w-36 shrink-0 rounded-sm"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center text-center sm:text-left">
                <p className="titlecard-sub">{next.title || "Proiezione unica"}</p>
                <h2 className="titlecard mt-2 text-2xl leading-snug text-schermo sm:text-4xl">
                  {nextMovie.title}
                </h2>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-fumo">
                  {[
                    nextMovie.year,
                    nextMovie.runtime ? `${nextMovie.runtime} min` : null,
                    nextMovie.director,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-5 font-mono text-sm capitalize text-proiettore">
                  {formatDateFull(next.chosenDate!)}
                  {next.location ? ` · ${next.location}` : ""}
                </p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* si vota */}
      {open.length > 0 && (
        <section aria-labelledby="sondaggi">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow" id="sondaggi">
              In cartellone · si vota
            </p>
            <Link href="/serate" className="font-mono text-xs uppercase tracking-[0.18em] text-fumo hover:text-schermo">
              Tutte →
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {open.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/serate/${e.id}`}
                  className="ticket flex items-center justify-between p-4 transition-colors hover:border-proiettore/60"
                >
                  <span className="titlecard text-base text-schermo">
                    {e.title || "Serata da decidere"}
                  </span>
                  <span className="rounded-sm bg-velluto px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-schermo">
                    Vota ora
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="attivita-home" className="min-w-0">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <p className="eyebrow">Dal tuo giro</p>
            <h2 id="attivita-home" className="mt-1 text-lg font-semibold text-schermo">
              Attività amici
            </h2>
          </div>
          <Link
            href="/attivita"
            className="font-mono text-xs uppercase tracking-[0.18em] text-fumo hover:text-schermo"
          >
            Tutte →
          </Link>
        </div>
        {activityItems.length > 0 ? (
          <ul className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2">
            {activityItems.map((item) => (
              <li key={item.id} className="min-w-0">
                <Link
                  href={item.href}
                  className="ticket group flex min-w-0 items-center gap-3 p-3 transition-colors hover:border-proiettore/60"
                >
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-proiettore/10 text-proiettore"
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-schermo group-hover:text-proiettore">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-fumo">{item.detail}</span>
                  </span>
                  <span aria-hidden className="shrink-0 text-fumo">→</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Link
            href="/serate/nuova"
            className="ticket block p-5 text-sm text-fumo transition-colors hover:border-proiettore"
          >
            Nessuna attività ancora. Apri prima serata →
          </Link>
        )}
      </section>

      {/* ultimi film in watchlist */}
      <section aria-labelledby="watchlist-home" className="-mx-4">
        <div className="mb-3 flex items-baseline justify-between px-4">
          <p className="eyebrow" id="watchlist-home">
            Watchlist
          </p>
          <Link href="/watchlist" className="font-mono text-xs uppercase tracking-[0.18em] text-fumo hover:text-schermo">
            Tutta →
          </Link>
        </div>
        {wlMovies.length > 0 ? (
          <div className="filmstrip">
            <ul className="filmstrip-scroll">
              {wl.map((w) => {
                const m = wlMovies.find((x) => x.id === w.movieId);
                if (!m) return null;
                return (
                  <li key={m.id} className="w-28 shrink-0">
                    <Poster
                      title={m.title}
                      year={m.year}
                      genres={m.genres}
                      posterUrl={m.posterUrl}
                      posterCredit={m.posterCredit}
                      className="aspect-2/3 w-full rounded-sm"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="px-4 text-sm text-fumo">
            La pellicola è vuota.{" "}
            <Link href="/film" className="text-proiettore underline">
              Passa in cineteca
            </Link>{" "}
            e scegli.
          </p>
        )}
      </section>

      {/* corridoio: manifesti delle proiezioni passate */}
      {wallEvents.length > 0 && (
        <section aria-labelledby="corridoio" className="corridoio -mx-4 px-6 pb-10 pt-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 flex items-baseline justify-between">
              <p className="eyebrow" id="corridoio">
                In corridoio · già proiettati
              </p>
              <Link
                href="/storico"
                className="font-mono text-xs uppercase tracking-[0.18em] text-fumo hover:text-schermo"
              >
                Storico →
              </Link>
            </div>
            <ul className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12">
              {wallEvents.map((e, i) => {
                const m = wallMovies.find((x) => x.id === e.chosenMovieId);
                if (!m) return null;
                return (
                  <li
                    key={e.id}
                    className="manifesto w-28 sm:w-32"
                    style={{ "--tilt": tilts[i % tilts.length] } as React.CSSProperties}
                  >
                    <Link href={`/serate/${e.id}`} className="block">
                      <Poster
                        title={m.title}
                        year={m.year}
                        genres={m.genres}
                        posterUrl={m.posterUrl}
                        posterCredit={m.posterCredit}
                        className="aspect-2/3 w-full"
                      />
                      <p className="targhetta">{m.title}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* la sala */}
      <section
        aria-labelledby="gruppo"
        className="ticket flex flex-wrap items-center justify-between gap-4 p-5"
      >
        <div>
          <p className="eyebrow mb-2" id="gruppo">
            La sala
          </p>
          <div className="flex -space-x-1.5">
            {people.map((p) => (
              <Avatar key={p.id} name={p.name} id={p.id} />
            ))}
          </div>
        </div>
        <p className="text-right font-mono text-xs uppercase tracking-[0.18em] text-fumo">
          {seen.length === 0
            ? "Prima proiezione in arrivo"
            : `${seen.length} ${seen.length === 1 ? "film visto" : "film visti"} insieme`}
        </p>
      </section>

      {/* citazione del giorno */}
      <section aria-label="Citazione del giorno" className="pb-4 text-center">
        <p className="quote text-xl">“{quote.text}”</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-fumo">
          {quote.film} · {quote.year}
        </p>
      </section>
    </div>
  );
}
