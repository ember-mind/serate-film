import Link from "next/link";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  circleMembers,
  circles,
  events,
  movies,
  ratingComments,
  ratings,
  reviewLikes,
  users,
} from "@/db/schema";
import { Avatar } from "@/components/Avatar";
import { requireUser } from "@/lib/auth";
import { filterVisible, inviteesByEvent } from "@/lib/invites";
import { filmSlug } from "@/lib/films";

export const dynamic = "force-dynamic";

type Activity = {
  id: string;
  at: string;
  actorId: number;
  actorName: string;
  circleId: number | null;
  circleName: string | null;
  href: string;
  icon: string;
  title: string;
  detail?: string;
  spoiler?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function parseTimestamp(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T21:00:00`);
  return new Date(value.replace(" ", "T"));
}

function formatTimestamp(value: string) {
  const parsed = parseTimestamp(value);
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
}

export default async function AttivitaPage({
  searchParams,
}: {
  searchParams: Promise<{ circolo?: string }>;
}) {
  const me = await requireUser();
  const params = await searchParams;

  const [membershipRows, allCircles, allEvents, people] = await Promise.all([
    db.query.circleMembers.findMany({
      where: and(eq(circleMembers.userId, me.id), eq(circleMembers.status, "active")),
    }),
    db.query.circles.findMany({ orderBy: asc(circles.name) }),
    db.query.events.findMany({ orderBy: desc(events.createdAt) }),
    db.query.users.findMany({ orderBy: asc(users.name) }),
  ]);

  const memberCircleIds = new Set(membershipRows.map((row) => row.circleId));
  const myCircles = allCircles.filter(
    (circle) => memberCircleIds.has(circle.id) || circle.ownerId === me.id
  );
  const selectedCircle =
    myCircles.find((circle) => circle.slug === params.circolo) ?? null;

  const prefilteredEvents = await filterVisible(allEvents, me);
  const inviteMap = await inviteesByEvent(prefilteredEvents.map((event) => event.id));
  const visibleEvents = prefilteredEvents.filter((event) => {
    if (me.isAdmin || event.createdBy === me.id) return true;
    if (event.access === "invite_only") {
      return (inviteMap.get(event.id) ?? []).includes(me.id);
    }
    if (event.access === "circle") {
      return event.circleId !== null && memberCircleIds.has(event.circleId);
    }
    if (event.access === "public") {
      // Feed privato: un evento pubblico entra solo se appartiene a un circolo seguito come membro.
      return event.circleId !== null && memberCircleIds.has(event.circleId);
    }
    return true;
  });
  const scopedEvents = selectedCircle
    ? visibleEvents.filter((event) => event.circleId === selectedCircle.id)
    : visibleEvents;
  const eventIds = scopedEvents.map((event) => event.id);

  const [eventRatings, comments, likes] =
    eventIds.length > 0
      ? await Promise.all([
          db.query.ratings.findMany({ where: inArray(ratings.eventId, eventIds) }),
          db.query.ratingComments.findMany({
            where: inArray(ratingComments.eventId, eventIds),
            orderBy: desc(ratingComments.createdAt),
          }),
          db.query.reviewLikes.findMany({
            where: inArray(reviewLikes.eventId, eventIds),
            orderBy: desc(reviewLikes.createdAt),
          }),
        ])
      : [[], [], []];

  const movieIds = scopedEvents
    .map((event) => event.chosenMovieId)
    .filter((id): id is number => id !== null);
  const eventMovies =
    movieIds.length > 0
      ? await db.query.movies.findMany({ where: inArray(movies.id, movieIds) })
      : [];

  const eventById = new Map(scopedEvents.map((event) => [event.id, event]));
  const movieById = new Map(eventMovies.map((movie) => [movie.id, movie]));
  const userById = new Map(people.map((person) => [person.id, person]));
  const circleById = new Map(allCircles.map((circle) => [circle.id, circle]));
  const nameOf = (id: number) => userById.get(id)?.name ?? "Qualcuno";

  const activities: Activity[] = [];

  for (const event of scopedEvents) {
    const movie = event.chosenMovieId ? movieById.get(event.chosenMovieId) : null;
    const circle = event.circleId ? circleById.get(event.circleId) : null;
    activities.push({
      id: `event-${event.id}`,
      at: event.createdAt,
      actorId: event.createdBy,
      actorName: nameOf(event.createdBy),
      circleId: event.circleId,
      circleName: circle?.name ?? null,
      href: `/serate/${event.id}`,
      icon: event.viewingMode === "in_person" ? "🎬" : "◉",
      title: `${nameOf(event.createdBy)} ha aperto ${event.title || "una nuova serata"}`,
      detail: movie ? `In cartellone: ${movie.title}` : "Data e film da decidere insieme",
    });
  }

  for (const rating of eventRatings) {
    const event = eventById.get(rating.eventId);
    if (!event) continue;
    const movie = event.chosenMovieId ? movieById.get(event.chosenMovieId) : null;
    const circle = event.circleId ? circleById.get(event.circleId) : null;
    activities.push({
      id: `rating-${rating.eventId}-${rating.userId}`,
      at: event.chosenDate ?? event.createdAt,
      actorId: rating.userId,
      actorName: nameOf(rating.userId),
      circleId: event.circleId,
      circleName: circle?.name ?? null,
      href: `/serate/${event.id}#pagelle`,
      icon: "★",
      title: `${nameOf(rating.userId)} ha dato ${rating.stars}/5${movie ? ` a ${movie.title}` : ""}`,
      detail: rating.comment ?? undefined,
    });
  }

  for (const comment of comments) {
    const event = eventById.get(comment.eventId);
    if (!event) continue;
    const movie = event.chosenMovieId ? movieById.get(event.chosenMovieId) : null;
    const circle = event.circleId ? circleById.get(event.circleId) : null;
    activities.push({
      id: `comment-${comment.id}`,
      at: comment.createdAt,
      actorId: comment.authorUserId,
      actorName: nameOf(comment.authorUserId),
      circleId: event.circleId,
      circleName: circle?.name ?? null,
      href: `/serate/${event.id}#pagelle`,
      icon: "↳",
      title: `${nameOf(comment.authorUserId)} ha risposto alla pagella di ${nameOf(
        comment.ratingUserId
      )}`,
      detail: comment.spoiler
        ? `Commento con spoiler${movie ? ` su ${movie.title}` : ""}`
        : comment.body,
      spoiler: comment.spoiler,
    });
  }

  for (const like of likes) {
    const event = eventById.get(like.eventId);
    if (!event) continue;
    const circle = event.circleId ? circleById.get(event.circleId) : null;
    activities.push({
      id: `like-${like.eventId}-${like.reviewUserId}-${like.userId}`,
      at: like.createdAt,
      actorId: like.userId,
      actorName: nameOf(like.userId),
      circleId: event.circleId,
      circleName: circle?.name ?? null,
      href: `/serate/${event.id}#pagelle`,
      icon: "♥",
      title: `${nameOf(like.userId)} ha apprezzato la pagella di ${nameOf(
        like.reviewUserId
      )}`,
    });
  }

  for (const circle of myCircles) {
    if (selectedCircle && selectedCircle.id !== circle.id) continue;
    activities.push({
      id: `circle-${circle.id}`,
      at: circle.createdAt,
      actorId: circle.ownerId,
      actorName: nameOf(circle.ownerId),
      circleId: circle.id,
      circleName: circle.name,
      href: `/circoli/${circle.slug}`,
      icon: "◎",
      title: `${nameOf(circle.ownerId)} ha creato il circolo ${circle.name}`,
      detail: circle.description ?? undefined,
    });
  }

  activities.sort(
    (a, b) => parseTimestamp(b.at).getTime() - parseTimestamp(a.at).getTime()
  );

  return (
    <div className="mx-auto max-w-2xl">
      <header className="apertura mb-7 text-center">
        <p className="titlecard-sub">Tra una proiezione e l’altra</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">Attività degli amici</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-fumo">
          Serate, pagelle e conversazioni dei tuoi circoli. Ordine cronologico, nessun
          algoritmo infinito.
        </p>
      </header>

      {myCircles.length > 0 && (
        <nav
          aria-label="Filtra attività per circolo"
          className="mb-6 flex gap-2 overflow-x-auto pb-1 font-mono text-[10px] uppercase tracking-[0.14em]"
        >
          <Link
            href="/attivita"
            aria-current={!selectedCircle ? "page" : undefined}
            className={`min-h-11 shrink-0 rounded-full border px-4 py-3 ${
              !selectedCircle
                ? "border-proiettore bg-proiettore/10 text-proiettore"
                : "border-riga text-fumo hover:text-schermo"
            }`}
          >
            Tutti
          </Link>
          {myCircles.map((circle) => (
            <Link
              key={circle.id}
              href={{ pathname: "/attivita", query: { circolo: circle.slug } }}
              aria-current={selectedCircle?.id === circle.id ? "page" : undefined}
              className={`min-h-11 shrink-0 rounded-full border px-4 py-3 ${
                selectedCircle?.id === circle.id
                  ? "border-proiettore bg-proiettore/10 text-proiettore"
                  : "border-riga text-fumo hover:text-schermo"
              }`}
            >
              {circle.name}
            </Link>
          ))}
        </nav>
      )}

      {activities.length === 0 ? (
        <div className="ticket p-8 text-center">
          <p className="titlecard text-lg text-schermo">Sala ancora silenziosa</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-fumo">
            Qui compariranno serate, pagelle e conversazioni dei circoli a cui partecipi.
          </p>
          <Link
            href="/serate/nuova"
            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-proiettore px-5 text-sm font-semibold text-notte-fonda"
          >
            Apri una serata
          </Link>
        </div>
      ) : (
        <ol className="relative ml-5 border-l border-riga pl-6">
          {activities.slice(0, 80).map((activity) => (
            <li key={activity.id} className="relative pb-4">
              <span
                aria-hidden
                className="absolute -left-[2.35rem] top-5 flex h-7 w-7 items-center justify-center rounded-full border border-riga bg-notte text-xs text-proiettore"
              >
                {activity.icon}
              </span>
              <article className="ticket p-4">
                <div className="flex items-start gap-3">
                  <Avatar id={activity.actorId} name={activity.actorName} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                      <Link
                        href={activity.href}
                        className="text-sm font-semibold leading-relaxed text-schermo transition-colors hover:text-proiettore"
                      >
                        {activity.title}
                      </Link>
                      <time
                        dateTime={activity.at}
                        className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-fumo"
                      >
                        {formatTimestamp(activity.at)}
                      </time>
                    </div>
                    {activity.detail && (
                      <p
                        className={`mt-2 text-sm leading-relaxed ${
                          activity.spoiler
                            ? "rounded-md border border-riga bg-notte px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fumo"
                            : "text-schermo/75"
                        }`}
                      >
                        {activity.detail}
                      </p>
                    )}
                    {activity.circleName && (
                      <Link
                        href={
                          activity.circleId
                            ? `/attivita?circolo=${
                                circleById.get(activity.circleId)?.slug ?? ""
                              }`
                            : "/attivita"
                        }
                        className="mt-3 inline-block font-mono text-[9px] uppercase tracking-[0.14em] text-fumo transition-colors hover:text-proiettore"
                      >
                        ◎ {activity.circleName}
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
