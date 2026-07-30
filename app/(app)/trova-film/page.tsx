import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { movieAvailability, movies, watchlist } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { filmSlug } from "@/lib/films";
import { getPersonalMovieStatuses } from "@/lib/personal-movies";
import { FilmFinder } from "./FilmFinder";

export const dynamic = "force-dynamic";

export default async function TrovaFilmPage() {
  const user = await requireUser();
  const [catalog, availability, activeWatchlist, personalStatuses] = await Promise.all([
    db.query.movies.findMany({ orderBy: [desc(movies.year), asc(movies.title)] }),
    db.query.movieAvailability.findMany({
      where: eq(movieAvailability.country, "IT"),
      orderBy: [asc(movieAvailability.provider), asc(movieAvailability.type)],
    }),
    db.query.watchlist.findMany({ where: eq(watchlist.status, "active") }),
    getPersonalMovieStatuses(user.id),
  ]);

  const availabilityByMovie = new Map<
    number,
    Array<{
      provider: string;
      type: "subscription" | "rent" | "buy" | "cinema" | "free";
      url: string | null;
      price: string | null;
    }>
  >();
  for (const row of availability) {
    availabilityByMovie.set(row.movieId, [
      ...(availabilityByMovie.get(row.movieId) ?? []),
      {
        provider: row.provider,
        type: row.type,
        url: row.url,
        price: row.price,
      },
    ]);
  }

  const watchlistIds = new Set(activeWatchlist.map((row) => row.movieId));

  return (
    <div className="mx-auto max-w-5xl">
      <header className="apertura mb-8 text-center">
        <p className="titlecard-sub">Decisione rapida</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo sm:text-4xl">
          Trova il film giusto per la serata
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-fumo">
          Dimmi che serata vuoi, quanto tempo hai e dove puoi guardare.
        </p>
      </header>

      <FilmFinder
        movies={catalog.map((movie) => ({
          id: movie.id,
          slug: filmSlug(movie),
          title: movie.title,
          year: movie.year,
          director: movie.director,
          genres: movie.genres,
          runtime: movie.runtime,
          posterUrl: movie.posterUrl,
          posterCredit: movie.posterCredit,
          imdbRating: movie.imdbRating,
          seen: personalStatuses.has(movie.id),
          inWatchlist: watchlistIds.has(movie.id),
          availability: availabilityByMovie.get(movie.id) ?? [],
        }))}
      />
    </div>
  );
}
