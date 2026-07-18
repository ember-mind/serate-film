import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { movies, suggestions, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { dismissSuggestion } from "@/lib/actions";
import { AddMovieForm } from "./AddMovieForm";
import { SuggestForm } from "./SuggestForm";
import { CatalogBrowser, type CatalogMovie } from "./CatalogBrowser";

export const dynamic = "force-dynamic";

export default async function FilmPage() {
  const user = await requireUser();

  const all = await db.query.movies.findMany({
    orderBy: [desc(movies.year), asc(movies.title)],
  });
  const wl = await db.query.watchlist.findMany();
  const pending = await db.query.suggestions.findMany({
    where: eq(suggestions.status, "pending"),
    orderBy: asc(suggestions.createdAt),
  });
  const people = await db.query.users.findMany();
  const nameOf = (id: number) => people.find((p) => p.id === id)?.name ?? "?";
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

      <div className="mb-4 flex flex-col gap-3">
        <SuggestForm />
        <AddMovieForm />
      </div>

      {pending.length > 0 && (
        <section aria-labelledby="suggerimenti" className="ticket mb-6 p-4">
          <p className="eyebrow mb-2" id="suggerimenti">
            Suggerimenti in attesa · l&apos;AI li cerca e li aggiunge al catalogo
          </p>
          <ul className="flex flex-col gap-1.5">
            {pending.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  “{s.text}” <span className="text-fumo">— {nameOf(s.suggestedBy)}</span>
                </span>
                {user.isAdmin && (
                  <form action={dismissSuggestion.bind(null, s.id)}>
                    <button
                      className="text-xs text-fumo hover:text-velluto"
                      aria-label={`Scarta il suggerimento ${s.text}`}
                    >
                      Scarta
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <CatalogBrowser
        movies={all.map((m) => ({
          id: m.id,
          title: m.title,
          year: m.year,
          director: m.director,
          actors: m.actors,
          genres: m.genres,
          runtime: m.runtime,
          state: stateOf(m.id),
        }))}
      />
    </div>
  );
}
