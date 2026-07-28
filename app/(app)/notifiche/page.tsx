import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { events, movies, notifications, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";

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
  const items = await db.query.notifications.findMany({
    where: eq(notifications.userId, user.id),
    orderBy: desc(notifications.createdAt),
    limit: 50,
  });

  const actorIds = [...new Set(items.map((item) => item.actorUserId))];
  const eventIds = [...new Set(items.map((item) => item.eventId))];
  const [actors, eventRows] = await Promise.all([
    actorIds.length > 0
      ? db.query.users.findMany({ where: inArray(users.id, actorIds) })
      : Promise.resolve([]),
    eventIds.length > 0
      ? db.query.events.findMany({ where: inArray(events.id, eventIds) })
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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="apertura mb-8 text-center">
        <p className="titlecard-sub">Dal foyer</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">Notifiche</h1>
      </div>

      {items.length === 0 ? (
        <div className="ticket p-6 text-center">
          <p className="text-sm text-fumo">Nessuna notifica.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-proiettore underline">
            Torna in sala
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const actor = actorName(item.actorUserId);
            const movieTitle = eventMovie(item.eventId);

            return (
              <li key={item.id}>
                <Link
                  href={`/serate/${item.eventId}#pagelle`}
                  className={`ticket flex items-center gap-3 p-4 transition-colors hover:border-proiettore/60 ${
                    item.readAt ? "" : "border-proiettore/60 bg-proiettore/5"
                  }`}
                >
                  <Avatar id={item.actorUserId} name={actor} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-schermo">
                      <strong>{actor}</strong> ha messo Mi piace alla tua pagella
                      {movieTitle ? ` di ${movieTitle}` : ""}.
                    </span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-fumo">
                      {formatNotificationDate(item.createdAt)}
                    </span>
                  </span>
                  <span aria-hidden className="text-proiettore">
                    ♥
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
