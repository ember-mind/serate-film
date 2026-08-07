import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { movies, userFriends } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { getPersonalMovieStatuses } from "@/lib/personal-movies";
import { Poster } from "@/components/Poster";
import { filmSlug } from "@/lib/films";
import { formatDateFull } from "@/lib/dates";
import { getUserJourneyStats } from "@/lib/journeys";

export const dynamic = "force-dynamic";

export default async function MyMoviesPage() {
  const user = await requireUser();
  const [statuses, friends, journeyStats] = await Promise.all([
    getPersonalMovieStatuses(user.id),
    db.query.userFriends.findMany({
      where: eq(userFriends.userId, user.id),
    }),
    getUserJourneyStats(user.id),
  ]);
  const entries = [...statuses.entries()].sort((a, b) =>
    (b[1].watchedAt ?? "").localeCompare(a[1].watchedAt ?? "")
  );
  const movieIds = entries.map(([movieId]) => movieId);
  const seenMovies =
    movieIds.length > 0
      ? await db.query.movies.findMany({ where: inArray(movies.id, movieIds) })
      : [];
  const togetherCount = entries.filter(([, status]) => status.together).length;

  return (
    <div>
      <div className="apertura mb-8 text-center">
        <p className="titlecard-sub">Il tuo posto in sala</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">La mia cineteca</h1>
        <p className="mt-2 text-sm text-fumo">{user.name}</p>
      </div>

      <section
        aria-label="Statistiche personali"
        className="ticket mb-8 grid grid-cols-3 divide-x divide-riga p-5 text-center"
      >
        <div>
          <p className="titlecard text-2xl text-proiettore">{entries.length}</p>
          <p className="eyebrow mt-1">{entries.length === 1 ? "Film visto" : "Film visti"}</p>
        </div>
        <div>
          <p className="titlecard text-2xl text-proiettore">{togetherCount}</p>
          <p className="eyebrow mt-1">Con il club</p>
        </div>
        <div>
          <p className="titlecard text-2xl text-proiettore">{journeyStats.level.level}</p>
          <p className="eyebrow mt-1">{journeyStats.level.name}</p>
          <p className="mt-1 font-mono text-[9px] text-fumo">{journeyStats.experience} XP</p>
        </div>
      </section>

      <nav
        aria-label="Scorciatoie personali"
        className="mb-8 flex flex-wrap justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]"
      >
        <Link href="/storico" className="rounded-full border border-riga px-3 py-1.5 text-fumo hover:text-schermo">
          Registro
        </Link>
        <Link href="/attori" className="rounded-full border border-riga px-3 py-1.5 text-fumo hover:text-schermo">
          Attori
        </Link>
        <Link href="/registi" className="rounded-full border border-riga px-3 py-1.5 text-fumo hover:text-schermo">
          Registi
        </Link>
        <Link href="/percorsi" className="rounded-full border border-riga px-3 py-1.5 text-fumo hover:text-schermo">
          Percorsi · {journeyStats.activeJourneys}
        </Link>
        <Link href="/io/amici" className="rounded-full border border-riga px-3 py-1.5 text-fumo hover:text-schermo">
          Amici · {friends.length}
        </Link>
        <Link href="/circoli" className="rounded-full border border-riga px-3 py-1.5 text-fumo hover:text-schermo">
          Circoli
        </Link>
        <Link href={`/io/anno/${new Date().getFullYear()}`} className="rounded-full border border-riga px-3 py-1.5 text-fumo hover:text-schermo">
          L&apos;anno del gruppo
        </Link>
        <Link href="/io/privacy" className="rounded-full border border-riga px-3 py-1.5 text-fumo hover:text-schermo">
          Profilo e privacy
        </Link>
        {user.isAdmin && (
          <Link href="/admin" className="rounded-full border border-riga px-3 py-1.5 text-fumo hover:text-schermo">
            Regia
          </Link>
        )}
      </nav>

      {entries.length === 0 ? (
        <div className="ticket p-6 text-center">
          <p className="text-sm text-fumo">Nessun film segnato come visto.</p>
          <Link
            href="/film"
            className="titlecard mt-4 inline-block rounded-sm bg-proiettore px-5 py-2 text-xs text-notte-fonda"
          >
            Passa in cineteca
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {entries.map(([movieId, status]) => {
            const movie = seenMovies.find((item) => item.id === movieId);
            if (!movie) return null;
            const date = status.watchedAt?.slice(0, 10);

            return (
              <li key={movie.id} className="ticket overflow-hidden">
                <Link href={`/film/${filmSlug(movie)}`} className="group block">
                  <Poster
                    title={movie.title}
                    year={movie.year}
                    genres={movie.genres}
                    posterUrl={movie.posterUrl}
                    posterCredit={movie.posterCredit}
                    showTitle={false}
                    className="aspect-2/3 w-full"
                  />
                  <div className="p-3">
                    <p className="titlecard text-xs leading-snug text-schermo group-hover:text-proiettore">
                      {movie.title}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-proiettore">
                      {status.together ? "Visto col club" : "Visto da me"}
                    </p>
                    {date && (
                      <p className="mt-1 text-xs capitalize text-fumo">{formatDateFull(date)}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <form action={logout} className="mt-10 border-t border-riga pt-6 text-center sm:hidden">
        <button className="eyebrow hover:text-schermo">Esci · {user.name}</button>
      </form>
    </div>
  );
}
