import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  events,
  journeyMembers,
  journeys,
  movies,
  notifications,
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { acceptJourney, declineJourney } from "@/lib/journey-actions";

export const dynamic = "force-dynamic";

const notificationDate = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatNotificationDate(value: string) {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  return notificationDate.format(new Date(normalized));
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const [items, journeyInvites] = await Promise.all([
    db.query.notifications.findMany({
      where: eq(notifications.userId, user.id),
      orderBy: desc(notifications.createdAt),
      limit: 50,
    }),
    db.query.journeyMembers.findMany({
      where: and(
        eq(journeyMembers.userId, user.id),
        eq(journeyMembers.status, "invited")
      ),
      orderBy: desc(journeyMembers.createdAt),
    }),
  ]);

  const actorIds = [
    ...new Set([
      ...items.map((item) => item.actorUserId),
      ...journeyInvites.map((invite) => invite.invitedBy),
    ]),
  ];
  const eventIds = [...new Set(items.map((item) => item.eventId))];
  const journeyIds = journeyInvites.map((invite) => invite.journeyId);
  const [actors, eventRows, journeyRows] = await Promise.all([
    actorIds.length > 0
      ? db.query.users.findMany({ where: inArray(users.id, actorIds) })
      : Promise.resolve([]),
    eventIds.length > 0
      ? db.query.events.findMany({ where: inArray(events.id, eventIds) })
      : Promise.resolve([]),
    journeyIds.length > 0
      ? db.query.journeys.findMany({ where: inArray(journeys.id, journeyIds) })
      : Promise.resolve([]),
  ]);
  const movieIds = [
    ...new Set(eventRows.map((event) => event.chosenMovieId).filter((id): id is number => id !== null)),
  ];
  const movieRows =
    movieIds.length > 0
      ? await db.query.movies.findMany({ where: inArray(movies.id, movieIds) })
      : [];
  const actorName = (id: number) => actors.find((actor) => actor.id === id)?.name ?? "Qualcuno";
  const eventMovie = (eventId: number) => {
    const event = eventRows.find((item) => item.id === eventId);
    return movieRows.find((movie) => movie.id === event?.chosenMovieId)?.title;
  };
  const notificationCopy = (item: (typeof items)[number], actor: string) => {
    const event = eventRows.find((row) => row.id === item.eventId);
    const movieTitle = eventMovie(item.eventId);
    const eventTitle = movieTitle ?? event?.title ?? "una serata";
    if (item.type === "event_invite") {
      return {
        text: `${actor} ti ha invitato a ${eventTitle}.`,
        icon: "✉",
        href: `/serate/${item.eventId}`,
      };
    }
    if (item.type === "review_reply") {
      return {
        text: `${actor} ha risposto alla tua pagella${movieTitle ? ` di ${movieTitle}` : ""}.`,
        icon: "↳",
        href: `/serate/${item.eventId}#pagelle`,
      };
    }
    if (item.type === "mention") {
      return {
        text: `${actor} ti ha menzionato in ${eventTitle}.`,
        icon: "@",
        href: `/serate/${item.eventId}`,
      };
    }
    if (item.type === "rsvp_reminder") {
      return {
        text: `${actor} aspetta la tua conferma per ${eventTitle}.`,
        icon: "✓",
        href: `/serate/${item.eventId}`,
      };
    }
    return {
      text: `${actor} ha messo Mi piace alla tua pagella${movieTitle ? ` di ${movieTitle}` : ""}.`,
      icon: "♥",
      href: `/serate/${item.eventId}#pagelle`,
    };
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="apertura mb-8 text-center">
        <p className="titlecard-sub">Dal foyer</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">Notifiche</h1>
      </div>

      {items.length === 0 && journeyInvites.length === 0 ? (
        <div className="ticket p-6 text-center">
          <p className="text-sm text-fumo">Nessuna notifica.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-proiettore underline">
            Torna in sala
          </Link>
        </div>
      ) : (
        <div className="grid gap-8">
          {journeyInvites.length > 0 && (
            <section aria-labelledby="notification-journey-invites">
              <div className="mb-3 flex items-center gap-3">
                <h2 id="notification-journey-invites" className="eyebrow text-proiettore">
                  Inviti ai percorsi
                </h2>
                <span className="h-px flex-1 bg-riga" aria-hidden />
                <span className="eyebrow">{journeyInvites.length}</span>
              </div>
              <ul className="flex flex-col gap-2">
                {journeyInvites.map((invite) => {
                  const journey = journeyRows.find((item) => item.id === invite.journeyId);
                  if (!journey) return null;
                  const actor = actorName(invite.invitedBy);
                  return (
                    <li key={invite.journeyId} className="ticket border-proiettore/60 bg-proiettore/5 p-4">
                      <div className="flex items-start gap-3">
                        <Avatar id={invite.invitedBy} name={actor} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-schermo">
                            {actor} ti invita a <strong>{journey.title}</strong>.
                          </p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-fumo">
                            {formatNotificationDate(invite.createdAt)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <form action={acceptJourney.bind(null, journey.id)}>
                              <button className="rounded-lg bg-proiettore px-3 py-2 text-xs font-semibold text-notte-fonda">
                                Accetta
                              </button>
                            </form>
                            <Link
                              href={`/percorsi/${journey.id}`}
                              className="rounded-lg border border-riga px-3 py-2 text-xs text-schermo transition-colors hover:border-proiettore"
                            >
                              Guarda percorso
                            </Link>
                            <form action={declineJourney.bind(null, journey.id)}>
                              <button className="rounded-lg px-3 py-2 text-xs text-fumo transition-colors hover:text-velluto">
                                Rifiuta
                              </button>
                            </form>
                          </div>
                        </div>
                        <span aria-hidden className="text-proiettore">↗</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {items.length > 0 && (
            <ul className="flex flex-col gap-2">
              {items.map((item) => {
                const actor = actorName(item.actorUserId);
                const content = notificationCopy(item, actor);

                return (
                  <li key={item.id}>
                    <Link
                      href={content.href}
                      className={`ticket flex items-center gap-3 p-4 transition-colors hover:border-proiettore/60 ${
                        item.readAt ? "" : "border-proiettore/60 bg-proiettore/5"
                      }`}
                    >
                      <Avatar id={item.actorUserId} name={actor} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-schermo">
                          {content.text}
                        </span>
                        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-fumo">
                          {formatNotificationDate(item.createdAt)}
                        </span>
                      </span>
                      <span aria-hidden className="text-proiettore">
                        {content.icon}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
