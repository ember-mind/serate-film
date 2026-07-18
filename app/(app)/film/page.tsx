import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { movies } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { AddMovieForm } from "./AddMovieForm";
import { CatalogBrowser, type CatalogMovie } from "./CatalogBrowser";

export const dynamic = "force-dynamic";

export default async function FilmPage() {
  await requireUser();

  const all = await db.query.movies.findMany({
    orderBy: [desc(movies.year), asc(movies.title)],
  });
  const wl = await db.query.watchlist.findMany();
  const stateOf = (id: number): CatalogMovie["state"] => {
    const w = wl.find((x) => x.movieId === id);
    if (!w || w.status === "removed") return "none";
    return w.status === "watched" ? "watched" : "watchlist";
  };

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <p className="eyebrow">Il catalogo</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Film</h1>
        </div>
      </div>

      <div className="mb-4">
        <AddMovieForm />
      </div>

      <CatalogBrowser
        movies={all.map((m) => ({
          id: m.id,
          title: m.title,
          year: m.year,
          director: m.director,
          actors: m.actors,
          genres: m.genres,
          state: stateOf(m.id),
        }))}
      />
    </div>
  );
}
