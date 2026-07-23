import Link from "next/link";
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { ActorPortrait } from "@/components/ActorPortrait";
import { Poster } from "@/components/Poster";
import { db } from "@/db";
import { movies } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { directorProfile, directorSlug, parseDirectors } from "@/lib/directors";

export const dynamic = "force-dynamic";

export default async function DirectorPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser();
  const { slug } = await params;
  const allMovies = await db.query.movies.findMany({ orderBy: desc(movies.year) });
  const names = [
    ...new Set(allMovies.flatMap((movie) => parseDirectors(movie.director))),
  ];
  const name = names.find((candidate) => directorSlug(candidate) === slug);
  if (!name) notFound();

  const profile = directorProfile(name);
  const filmography = allMovies.filter((movie) => parseDirectors(movie.director).includes(name));
  const facts = [
    profile?.birthDate ? { label: "Nascita", value: profile.birthDate } : null,
    profile?.deathDate ? { label: "Morte", value: profile.deathDate } : null,
    profile?.birthPlace ? { label: "Luogo", value: profile.birthPlace } : null,
    profile?.citizenship?.length
      ? { label: "Nazionalità", value: profile.citizenship.join(", ") }
      : null,
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));

  return (
    <div>
      <Link
        href="/registi"
        className="font-mono text-xs uppercase tracking-[0.18em] text-fumo transition-colors hover:text-proiettore"
      >
        ← Registi
      </Link>

      <article className="mt-6 grid gap-8 sm:grid-cols-[260px_1fr]">
        <div>
          <div className="ticket overflow-hidden">
            <ActorPortrait
              name={name}
              imageUrl={profile?.imageUrl}
              eager
              className="aspect-4/5 w-full"
            />
          </div>
          {profile?.imageCredit && (
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-fumo/70">
              {profile.imageSource ? (
                <a
                  href={profile.imageSource}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-proiettore"
                >
                  {profile.imageCredit} ↗
                </a>
              ) : (
                profile.imageCredit
              )}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <p className="titlecard-sub">Dietro la macchina da presa</p>
          <h1 className="titlecard mt-1 text-3xl leading-tight text-schermo">{name}</h1>

          {facts.length > 0 && (
            <dl className="mt-5 grid gap-x-6 gap-y-3 border-y border-riga py-4 text-sm sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="eyebrow">{fact.label}</dt>
                  <dd className="mt-1 text-schermo/90">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {profile?.description ? (
            <div className="mt-6">
              <p className="text-sm leading-relaxed text-schermo/90">{profile.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-fumo/70">
                {profile.biographySource && (
                  <a
                    href={profile.biographySource}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-proiettore"
                  >
                    Biografia ↗
                  </a>
                )}
                {profile.wikidataId && (
                  <a
                    href={profile.wikidataId ? `https://www.wikidata.org/wiki/${profile.wikidataId}` : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-proiettore"
                  >
                    Dati ↗
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-fumo">
              Profilo non disponibile; qui sotto restano i film presenti in cineteca.
            </p>
          )}
        </div>
      </article>

      <section className="mt-12" aria-labelledby="filmografia">
        <div className="mb-5 flex items-center gap-4">
          <h2 id="filmografia" className="titlecard text-sm text-proiettore">
            In cineteca
          </h2>
          <span className="h-px flex-1 bg-riga" aria-hidden />
          <span className="eyebrow">{filmography.length} film</span>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filmography.map((movie) => (
            <li key={movie.id} className="ticket overflow-hidden">
              <Link href={`/film/${movie.id}`} className="group block h-full">
                <Poster
                  title={movie.title}
                  year={movie.year}
                  genres={movie.genres}
                  posterUrl={movie.posterUrl}
                  posterCredit={movie.posterCredit}
                  showTitle={false}
                  className="aspect-4/5 w-full"
                />
                <div className="p-3.5">
                  <h3 className="titlecard text-xs leading-snug text-schermo transition-colors group-hover:text-proiettore">
                    {movie.title}
                  </h3>
                  {movie.year && <p className="mt-1 font-mono text-[10px] text-fumo">{movie.year}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
