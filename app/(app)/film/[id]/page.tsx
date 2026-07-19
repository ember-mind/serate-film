import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { movies, watchlist } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions";
import { Poster } from "@/components/Poster";

export const dynamic = "force-dynamic";

export default async function FilmPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isInteger(movieId)) notFound();

  const movie = await db.query.movies.findFirst({ where: eq(movies.id, movieId) });
  if (!movie) notFound();

  const wl = await db.query.watchlist.findFirst({ where: eq(watchlist.movieId, movieId) });
  const state = !wl || wl.status === "removed" ? "none" : wl.status;

  return (
    <div>
      <Link
        href="/film"
        className="font-mono text-xs uppercase tracking-[0.18em] text-fumo transition-colors hover:text-proiettore"
      >
        ← Cineteca
      </Link>

      <div className="mt-6 grid gap-8 sm:grid-cols-[240px_1fr]">
        <div>
          <Poster
            title={movie.title}
            year={movie.year}
            genres={movie.genres}
            posterUrl={movie.posterUrl}
            posterCredit={movie.posterCredit}
            showTitle={false}
            className="ticket aspect-2/3 w-full"
          />
          {movie.posterCredit && (
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-fumo/70">
              {movie.posterCredit}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <p className="titlecard-sub">Dalla cineteca</p>
          <h1 className="titlecard mt-1 text-3xl text-schermo">{movie.title}</h1>
          <p className="mt-2 font-mono text-sm text-proiettore">
            {[movie.year, movie.runtime ? `${movie.runtime}′` : null].filter(Boolean).join(" · ")}
          </p>

          <dl className="mt-5 flex flex-col gap-1.5 text-sm">
            {movie.director && (
              <div>
                <span className="text-fumo">regia di </span>
                {movie.director}
              </div>
            )}
            {movie.actors && (
              <div>
                <span className="text-fumo">con </span>
                {movie.actors}
              </div>
            )}
            {movie.genres && (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fumo/70">
                {movie.genres}
              </p>
            )}
          </dl>

          {movie.synopsis && (
            <div className="mt-6 border-t border-riga pt-5">
              <p className="eyebrow mb-2">La trama</p>
              <p className="text-sm leading-relaxed text-schermo/90">{movie.synopsis}</p>
              {movie.synopsisSource && (
                <a
                  href={movie.synopsisSource}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-fumo/70 transition-colors hover:text-proiettore"
                >
                  Fonte: Wikipedia ↗
                </a>
              )}
            </div>
          )}

          <div className="mt-7 max-w-xs">
            {state === "watched" ? (
              <span className="block rounded-sm border border-riga py-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-fumo">
                Già vista
              </span>
            ) : state === "active" ? (
              <form action={removeFromWatchlist.bind(null, movie.id)}>
                <button className="w-full rounded-sm border border-proiettore/40 py-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-proiettore transition-colors hover:border-velluto-acceso hover:text-velluto-acceso">
                  In pellicola ✓
                </button>
              </form>
            ) : (
              <form action={addToWatchlist.bind(null, movie.id)}>
                <button className="w-full rounded-sm bg-sipario-chiaro py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-schermo transition-colors hover:bg-proiettore hover:text-notte-fonda">
                  + In pellicola
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
