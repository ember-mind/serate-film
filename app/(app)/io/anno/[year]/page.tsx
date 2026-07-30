import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray, like } from "drizzle-orm";
import { db } from "@/db";
import {
  attendance,
  circles,
  events,
  movies,
  ratings,
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { filterAccessibleEvents } from "@/lib/access";
import { formatDateShort } from "@/lib/dates";

export const dynamic = "force-dynamic";

function splitGenres(value: string | null) {
  if (!value) return [];
  return value
    .split(/[,/|]/)
    .map((genre) => genre.trim())
    .filter(Boolean);
}

export default async function GroupYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const user = await requireUser();
  const { year: rawYear } = await params;
  const year = Number(rawYear);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 1888 || year > currentYear + 1) {
    notFound();
  }

  const allDone = await db.query.events.findMany({
    where: and(
      eq(events.status, "done"),
      like(events.chosenDate, `${year}-%`)
    ),
    orderBy: asc(events.chosenDate),
  });
  const visibleEvents = await filterAccessibleEvents(allDone, user);
  const eventIds = visibleEvents.map((event) => event.id);
  const movieIds = [
    ...new Set(
      visibleEvents
        .map((event) => event.chosenMovieId)
        .filter((id): id is number => id !== null)
    ),
  ];
  const circleIds = [
    ...new Set(
      visibleEvents
        .map((event) => event.circleId)
        .filter((id): id is number => id !== null)
    ),
  ];

  const [movieRows, attendanceRows, ratingRows, people, circleRows] =
    await Promise.all([
      movieIds.length
        ? db.query.movies.findMany({ where: inArray(movies.id, movieIds) })
        : Promise.resolve([]),
      eventIds.length
        ? db.query.attendance.findMany({
            where: inArray(attendance.eventId, eventIds),
          })
        : Promise.resolve([]),
      eventIds.length
        ? db.query.ratings.findMany({
            where: inArray(ratings.eventId, eventIds),
          })
        : Promise.resolve([]),
      db.query.users.findMany({ orderBy: asc(users.name) }),
      circleIds.length
        ? db.query.circles.findMany({ where: inArray(circles.id, circleIds) })
        : Promise.resolve([]),
    ]);

  const movieOf = (movieId: number | null) =>
    movieId ? movieRows.find((movie) => movie.id === movieId) : null;
  const totalMinutes = visibleEvents.reduce(
    (total, event) => total + (movieOf(event.chosenMovieId)?.runtime ?? 0),
    0
  );
  const averageRating = ratingRows.length
    ? ratingRows.reduce((total, rating) => total + rating.stars, 0) /
      ratingRows.length
    : null;
  const participantIds = new Set(
    attendanceRows.map((attendanceRow) => attendanceRow.userId)
  );
  const attendanceCounts = new Map<number, number>();
  for (const attendanceRow of attendanceRows) {
    if (attendanceRow.userId === user.id) continue;
    attendanceCounts.set(
      attendanceRow.userId,
      (attendanceCounts.get(attendanceRow.userId) ?? 0) + 1
    );
  }
  const companions = [...attendanceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, count]) => ({
      name: people.find((person) => person.id === userId)?.name ?? "Membro",
      count,
    }));

  const genreCounts = new Map<string, number>();
  for (const event of visibleEvents) {
    for (const genre of splitGenres(movieOf(event.chosenMovieId)?.genres ?? null)) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }
  }
  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const movieRatingStats = new Map<
    number,
    { total: number; count: number }
  >();
  for (const rating of ratingRows) {
    const event = visibleEvents.find((item) => item.id === rating.eventId);
    if (!event?.chosenMovieId) continue;
    const current = movieRatingStats.get(event.chosenMovieId) ?? {
      total: 0,
      count: 0,
    };
    current.total += rating.stars;
    current.count += 1;
    movieRatingStats.set(event.chosenMovieId, current);
  }
  const favouriteMovieEntry = [...movieRatingStats.entries()].sort(
    (a, b) =>
      b[1].total / b[1].count - a[1].total / a[1].count ||
      b[1].count - a[1].count
  )[0];
  const favouriteMovie = favouriteMovieEntry
    ? movieRows.find((movie) => movie.id === favouriteMovieEntry[0])
    : null;
  const favouriteAverage = favouriteMovieEntry
    ? favouriteMovieEntry[1].total / favouriteMovieEntry[1].count
    : null;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="cinemascope apertura overflow-hidden rounded-md px-5 py-10 text-center sm:px-10">
        <p className="titlecard-sub">Titoli di coda collettivi</p>
        <h1 className="titlecard mt-2 text-4xl text-schermo sm:text-5xl">
          Il nostro {year}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-fumo">
          Solo serate che puoi vedere. Dati privati restano dentro rispettivi
          circoli e inviti.
        </p>
        <nav
          aria-label="Cambia anno"
          className="mt-6 flex justify-center gap-2 text-sm"
        >
          <Link
            href={`/io/anno/${year - 1}`}
            className="rounded-full border border-riga px-4 py-2 text-fumo hover:text-schermo"
          >
            ← {year - 1}
          </Link>
          {year < currentYear && (
            <Link
              href={`/io/anno/${year + 1}`}
              className="rounded-full border border-riga px-4 py-2 text-fumo hover:text-schermo"
            >
              {year + 1} →
            </Link>
          )}
        </nav>
      </header>

      {visibleEvents.length === 0 ? (
        <section className="ticket mt-8 p-8 text-center">
          <p className="font-display text-xl text-schermo">
            Nessuna proiezione registrata
          </p>
          <p className="mt-2 text-sm text-fumo">
            Quando una serata viene segnata come vista, entra qui.
          </p>
          <Link
            href="/serate"
            className="mt-5 inline-block rounded-lg bg-proiettore px-5 py-2.5 text-sm font-semibold text-notte-fonda"
          >
            Vai alle serate
          </Link>
        </section>
      ) : (
        <>
          <section
            className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
            aria-label="Numeri dell'anno"
          >
            {[
              {
                value: visibleEvents.length,
                label: visibleEvents.length === 1 ? "Serata" : "Serate",
              },
              {
                value: totalMinutes
                  ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                  : "—",
                label: "Sul divano",
              },
              {
                value: participantIds.size,
                label: participantIds.size === 1 ? "Persona" : "Persone",
              },
              {
                value: averageRating ? averageRating.toFixed(1) : "—",
                label: "Media pagelle",
              },
            ].map((stat) => (
              <div key={stat.label} className="ticket p-5 text-center">
                <p className="titlecard text-2xl text-proiettore">{stat.value}</p>
                <p className="eyebrow mt-2">{stat.label}</p>
              </div>
            ))}
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="ticket p-5" aria-labelledby="film-anno">
              <p className="eyebrow">La bobina</p>
              <h2 id="film-anno" className="mt-1 font-display text-2xl font-semibold">
                Film dell&apos;anno
              </h2>
              {favouriteMovie && favouriteAverage ? (
                <div className="mt-5 rounded-lg border border-proiettore/40 bg-proiettore/5 p-4">
                  <p className="font-display text-xl font-semibold text-schermo">
                    {favouriteMovie.title}
                  </p>
                  <p className="mt-1 text-sm text-proiettore">
                    ★ {favouriteAverage.toFixed(1)} · preferito del gruppo
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-fumo">
                  Servono pagelle per eleggere il film dell&apos;anno.
                </p>
              )}
              <ol className="mt-4 grid gap-2">
                {visibleEvents.map((event, index) => {
                  const movie = movieOf(event.chosenMovieId);
                  const circle = circleRows.find(
                    (item) => item.id === event.circleId
                  );
                  return (
                    <li
                      key={event.id}
                      className="flex items-center gap-3 rounded-lg border border-riga bg-notte p-3"
                    >
                      <span className="font-mono text-xs text-fumo">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-schermo">
                          {movie?.title || event.title || "Serata"}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-fumo">
                          {event.chosenDate
                            ? formatDateShort(event.chosenDate)
                            : year}
                          {circle ? ` · ${circle.name}` : ""}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>

            <div className="grid content-start gap-6">
              <section className="ticket p-5" aria-labelledby="generi-anno">
                <p className="eyebrow">Il tono della stagione</p>
                <h2 id="generi-anno" className="mt-1 font-display text-2xl font-semibold">
                  Generi più visti
                </h2>
                {topGenres.length ? (
                  <ol className="mt-4 grid gap-3">
                    {topGenres.map(([genre, count], index) => (
                      <li key={genre} className="flex items-center gap-3">
                        <span className="w-5 font-mono text-xs text-fumo">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 text-sm text-schermo">
                          {genre}
                        </span>
                        <span
                          className="h-1.5 rounded-full bg-proiettore"
                          style={{
                            width: `${Math.max(
                              12,
                              (count / topGenres[0][1]) * 90
                            )}px`,
                          }}
                        />
                        <span className="w-4 text-right font-mono text-xs text-fumo">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-4 text-sm text-fumo">
                    Generi non disponibili nel catalogo.
                  </p>
                )}
              </section>

              <section className="ticket p-5" aria-labelledby="compagnia-anno">
                <p className="eyebrow">Sempre in prima fila</p>
                <h2 id="compagnia-anno" className="mt-1 font-display text-2xl font-semibold">
                  Compagni di visione
                </h2>
                {companions.length ? (
                  <ol className="mt-4 grid gap-2">
                    {companions.map((companion, index) => (
                      <li
                        key={companion.name}
                        className="flex items-center justify-between rounded-lg border border-riga bg-notte px-3 py-2.5"
                      >
                        <span className="text-sm text-schermo">
                          {index + 1}. {companion.name}
                        </span>
                        <span className="font-mono text-xs text-proiettore">
                          {companion.count}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-4 text-sm text-fumo">
                    Presenze non ancora registrate.
                  </p>
                )}
              </section>
            </div>
          </div>
        </>
      )}

      <p className="mt-10 text-center">
        <Link href="/io" className="text-sm text-proiettore underline">
          Torna alla mia cineteca
        </Link>
      </p>
    </div>
  );
}
