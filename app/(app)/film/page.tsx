import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { movies, suggestions, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { dismissSuggestion } from "@/lib/actions";
import { AddMovieForm } from "./AddMovieForm";
import { SuggestForm } from "./SuggestForm";
import { CatalogBrowser, type CatalogMovie } from "./CatalogBrowser";
import { getPersonalMovieStatuses } from "@/lib/personal-movies";

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
  const personalStatuses = await getPersonalMovieStatuses(user.id);
  const people = await db.query.users.findMany();
  const nameOf = (id: number) => people.find((p) => p.id === id)?.name ?? "?";
  const watchlistStateOf = (id: number): CatalogMovie["watchlistState"] => {
    const w = wl.find((x) => x.movieId === id);
    if (!w || w.status === "removed") return "none";
    return w.status === "watched" ? "screened" : "watchlist";
  };

  return (
    <div>
      <div className="apertura mb-8 text-center">
        <p className="titlecard-sub">L&apos;archivio della sala</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">La Cineteca</h1>
        <nav
          aria-label="Esplora la cineteca"
          className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em]"
        >
          <Link href="/watchlist" className="text-proiettore hover:text-proiettore-acceso">
            In pellicola
          </Link>
          <Link href="/attori" className="text-fumo hover:text-schermo">
            Attori
          </Link>
          <Link href="/registi" className="text-fumo hover:text-schermo">
            Registi
          </Link>
        </nav>
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
          posterUrl: m.posterUrl,
          posterCredit: m.posterCredit,
          watchlistState: watchlistStateOf(m.id),
          seenManually: personalStatuses.get(m.id)?.manual ?? false,
          seenTogether: personalStatuses.get(m.id)?.together ?? false,
        }))}
      />
    </div>
  );
}
