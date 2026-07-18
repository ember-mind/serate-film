import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { attendance, events, movies, ratings, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Poster } from "@/components/Poster";
import { Stars } from "@/components/Stars";
import { formatDateFull } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function StoricoPage() {
  await requireUser();

  const done = await db.query.events.findMany({
    where: eq(events.status, "done"),
    orderBy: desc(events.chosenDate),
  });
  const movieIds = done.map((e) => e.chosenMovieId).filter((x): x is number => Boolean(x));
  const ms = movieIds.length > 0 ? await db.query.movies.findMany({ where: inArray(movies.id, movieIds) }) : [];
  const eventIds = done.map((e) => e.id);
  const att = eventIds.length > 0 ? await db.query.attendance.findMany({ where: inArray(attendance.eventId, eventIds) }) : [];
  const rats = eventIds.length > 0 ? await db.query.ratings.findMany({ where: inArray(ratings.eventId, eventIds) }) : [];
  const people = await db.query.users.findMany();
  const nameOf = (id: number) => people.find((p) => p.id === id)?.name ?? "?";

  return (
    <div>
      <div className="apertura mb-8 text-center">
        <p className="titlecard-sub">Titoli di coda</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">Registro di sala</h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-fumo">
          {`${done.length} ${done.length === 1 ? "proiezione" : "proiezioni"} insieme`}
        </p>
      </div>

      {done.length === 0 ? (
        <p className="text-sm text-fumo">
          Ancora niente in archivio. La prima serata vista finirà qui.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {done.map((e) => {
            const m = e.chosenMovieId ? ms.find((x) => x.id === e.chosenMovieId) : null;
            const eAtt = att.filter((a) => a.eventId === e.id);
            const eRats = rats.filter((r) => r.eventId === e.id);
            const avg = eRats.length > 0 ? eRats.reduce((s, r) => s + r.stars, 0) / eRats.length : null;
            return (
              <li key={e.id}>
                <Link
                  href={`/serate/${e.id}`}
                  className="ticket flex gap-4 p-4 transition-colors hover:border-proiettore/50"
                >
                  {m && (
                    <Poster
                      title={m.title}
                      year={m.year}
                      genres={m.genres}
                      posterUrl={m.posterUrl}
                      posterCredit={m.posterCredit}
                      className="h-28 w-20 shrink-0 rounded-md"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs capitalize text-proiettore">
                      {e.chosenDate && formatDateFull(e.chosenDate)}
                    </p>
                    <p className="titlecard mt-1 text-lg leading-tight text-schermo">
                      {m?.title ?? e.title}
                    </p>
                    <p className="mt-1 truncate text-sm text-fumo">
                      con {eAtt.length > 0 ? eAtt.map((a) => nameOf(a.userId)).join(", ") : "—"}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      {avg !== null && <Stars value={avg} small />}
                      {e.notes && <span className="text-xs text-fumo">· con note</span>}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
