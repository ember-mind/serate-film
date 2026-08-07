import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { Poster } from "@/components/Poster";
import { db } from "@/db";
import {
  journeyMembers,
  journeyMovies,
  journeys,
  movies,
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  acceptJourney,
  declineJourney,
  inviteJourneyFriends,
} from "@/lib/journey-actions";
import {
  getJourneyFriends,
  getUserJourneyStats,
  progressForMovies,
  seenMovieIdsForUser,
} from "@/lib/journeys";
import { filmSlug } from "@/lib/films";

export const dynamic = "force-dynamic";

export default async function JourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const journeyId = Number((await params).id);
  if (!Number.isInteger(journeyId)) notFound();

  const journey = await db.query.journeys.findFirst({ where: eq(journeys.id, journeyId) });
  if (!journey) notFound();
  const currentMembership = await db.query.journeyMembers.findFirst({
    where: and(
      eq(journeyMembers.journeyId, journeyId),
      eq(journeyMembers.userId, user.id)
    ),
  });
  if (!currentMembership && !user.isAdmin) notFound();

  const [filmRows, memberRows, friends, currentSeenMovieIds, currentStats] =
    await Promise.all([
      db.query.journeyMovies.findMany({
        where: eq(journeyMovies.journeyId, journeyId),
        orderBy: asc(journeyMovies.position),
      }),
      db.query.journeyMembers.findMany({
        where: eq(journeyMembers.journeyId, journeyId),
      }),
      journey.createdBy === user.id ? getJourneyFriends(user.id) : Promise.resolve([]),
      seenMovieIdsForUser(user.id),
      getUserJourneyStats(user.id),
    ]);
  const movieIds = filmRows.map((row) => row.movieId);
  const peopleIds = [...new Set(memberRows.map((membership) => membership.userId))];
  const [movieRows, people] = await Promise.all([
    movieIds.length
      ? db.query.movies.findMany({ where: inArray(movies.id, movieIds) })
      : Promise.resolve([]),
    peopleIds.length
      ? db.query.users.findMany({ where: inArray(users.id, peopleIds) })
      : Promise.resolve([]),
  ]);
  const orderedMovies = filmRows
    .map((row) => movieRows.find((movie) => movie.id === row.movieId))
    .filter((movie): movie is (typeof movieRows)[number] => Boolean(movie));
  const currentProgress = progressForMovies(movieIds, currentSeenMovieIds);
  const nextMovie = orderedMovies.find((movie) => !currentSeenMovieIds.has(movie.id));
  const activeMembers = memberRows.filter((membership) => membership.status === "active");
  const pendingMembers = memberRows.filter((membership) => membership.status === "invited");
  const memberProgress = await Promise.all(
    activeMembers.map(async (membership) => {
      const seen = await seenMovieIdsForUser(membership.userId);
      return {
        membership,
        person: people.find((person) => person.id === membership.userId),
        progress: progressForMovies(movieIds, seen),
      };
    })
  );
  const existingMemberIds = new Set(memberRows.map((membership) => membership.userId));
  const availableFriends = friends.filter((friend) => !existingMemberIds.has(friend.id));
  const subjectHref =
    journey.subjectType === "director"
      ? "/registi/" + journey.subjectSlug
      : "/attori/" + journey.subjectSlug;

  return (
    <div>
      <Link
        href="/percorsi"
        className="font-mono text-xs uppercase tracking-[0.18em] text-fumo transition-colors hover:text-proiettore"
      >
        ← Percorsi
      </Link>

      <header className="mt-6 border-b border-riga pb-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">
            {journey.subjectType === "director" ? "Regista" : "Attore"}
          </span>
          <span className="text-fumo/40">·</span>
          <span className="eyebrow">
            {journey.mode === "chronological" ? "Cronologico" : "Ordine libero"}
          </span>
          <span className="text-fumo/40">·</span>
          <span className="eyebrow">{movieIds.length} film</span>
        </div>
        <h1 className="titlecard mt-3 max-w-4xl text-3xl leading-tight text-schermo sm:text-4xl">
          {journey.title}
        </h1>
        <Link
          href={subjectHref}
          className="mt-3 inline-block text-sm text-proiettore underline-offset-4 hover:underline"
        >
          Torna alla pagina di {journey.subjectName} →
        </Link>
      </header>

      {currentMembership?.status === "invited" && (
        <section className="ticket mt-6 border-proiettore/40 bg-proiettore/5 p-5">
          <p className="eyebrow">Sei stato invitato</p>
          <h2 className="titlecard mt-2 text-lg text-schermo">
            Vuoi affrontare questo percorso?
          </h2>
          <p className="mt-2 text-sm text-fumo">
            I tuoi progressi diventano visibili al gruppo solo dopo l’accettazione.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={acceptJourney.bind(null, journeyId)}>
              <button className="rounded-lg bg-proiettore px-4 py-2 text-sm font-semibold text-notte-fonda">
                Accetta percorso
              </button>
            </form>
            <form action={declineJourney.bind(null, journeyId)}>
              <button className="rounded-lg border border-riga px-4 py-2 text-sm text-fumo">
                Rifiuta
              </button>
            </form>
          </div>
        </section>
      )}

      {currentMembership?.status === "active" && (
        <section className="mt-7 grid gap-4 lg:grid-cols-[1fr_19rem]">
          <div className="ticket p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Il tuo avanzamento</p>
                <p className="titlecard mt-2 text-3xl text-proiettore">
                  {currentProgress.percentage}%
                </p>
              </div>
              <p className="text-sm text-fumo">
                {currentProgress.seen} di {currentProgress.total} film
              </p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-sipario-chiaro">
              <div
                className="h-full rounded-full bg-proiettore"
                style={{ width: currentProgress.percentage + "%" }}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-fumo">
              <span>+50 XP per ogni nuovo film del percorso</span>
              <span>Bonus finale: +250 XP</span>
            </div>
          </div>

          <div className="ticket p-5">
            <p className="eyebrow">Profilo</p>
            <p className="titlecard mt-2 text-xl text-proiettore">
              Lv. {currentStats.level.level} · {currentStats.level.name}
            </p>
            <p className="mt-2 text-sm text-fumo">{currentStats.experience} XP totali</p>
          </div>
        </section>
      )}

      {currentMembership?.status === "active" && currentProgress.complete ? (
        <section className="ticket mt-6 border-proiettore/50 bg-proiettore/10 p-6 text-center">
          <p className="text-3xl" aria-hidden>
            ★
          </p>
          <p className="titlecard mt-2 text-xl text-proiettore">Percorso completato</p>
          <p className="mt-2 text-sm text-fumo">
            Hai attraversato tutta la filmografia inclusa in questa edizione.
          </p>
        </section>
      ) : nextMovie && currentMembership?.status === "active" ? (
        <section className="ticket mt-6 overflow-hidden" aria-labelledby="next-journey-movie">
          <div className="grid sm:grid-cols-[180px_1fr]">
            <Link href={"/film/" + filmSlug(nextMovie)} className="bg-sipario-chiaro">
              <Poster
                title={nextMovie.title}
                year={nextMovie.year}
                genres={nextMovie.genres}
                posterUrl={nextMovie.posterUrl}
                posterCredit={nextMovie.posterCredit}
                showTitle={false}
                className="aspect-2/3 h-full w-full"
              />
            </Link>
            <div className="flex flex-col justify-center p-5 sm:p-7">
              <p className="eyebrow">
                {journey.mode === "chronological" ? "Prossimo capitolo" : "Prossimo suggerito"}
              </p>
              <h2 id="next-journey-movie" className="titlecard mt-2 text-2xl text-schermo">
                <Link
                  href={"/film/" + filmSlug(nextMovie)}
                  className="transition-colors hover:text-proiettore"
                >
                  {nextMovie.title}
                </Link>
              </h2>
              <p className="mt-2 font-mono text-xs text-fumo">
                {nextMovie.year ?? "Anno non disponibile"}
                {nextMovie.runtime ? " · " + nextMovie.runtime + " min" : ""}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={"/serate/nuova?movieId=" + nextMovie.id}
                  className="rounded-lg bg-proiettore px-4 py-2.5 text-sm font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso"
                >
                  Crea serata con questo film
                </Link>
                <Link
                  href={"/film/" + filmSlug(nextMovie)}
                  className="rounded-lg border border-riga px-4 py-2.5 text-sm text-schermo transition-colors hover:border-proiettore"
                >
                  Apri scheda
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-10" aria-labelledby="journey-party">
        <div className="mb-4 flex items-center gap-4">
          <h2 id="journey-party" className="titlecard text-sm text-proiettore">
            Compagni di percorso
          </h2>
          <span className="h-px flex-1 bg-riga" aria-hidden />
          <span className="eyebrow">{activeMembers.length}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memberProgress.map(({ membership, person, progress }) => (
            <article key={membership.userId} className="ticket p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-proiettore/10 font-semibold text-proiettore">
                  {(person?.name ?? "M").slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-schermo">
                    {person?.name ?? "Membro"}
                    {membership.userId === user.id ? " · tu" : ""}
                  </p>
                  <p className="mt-1 text-xs text-fumo">
                    {progress.seen}/{progress.total} film · {progress.percentage}%
                  </p>
                </div>
                {progress.complete && <span className="text-proiettore">★</span>}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sipario-chiaro">
                <div
                  className="h-full rounded-full bg-proiettore"
                  style={{ width: progress.percentage + "%" }}
                />
              </div>
            </article>
          ))}
          {pendingMembers.map((membership) => {
            const person = people.find((item) => item.id === membership.userId);
            return (
              <article key={membership.userId} className="ticket border-dashed p-4 opacity-70">
                <p className="text-sm text-schermo">{person?.name ?? "Membro"}</p>
                <p className="mt-1 text-xs text-fumo">Invito in attesa</p>
              </article>
            );
          })}
        </div>

        {journey.createdBy === user.id && availableFriends.length > 0 && (
          <details className="ticket mt-4 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-proiettore">
              + Invita altri amici
            </summary>
            <form
              action={inviteJourneyFriends.bind(null, journeyId)}
              className="mt-4 grid gap-4"
            >
              <div className="flex flex-wrap gap-2">
                {availableFriends.map((friend) => (
                  <label
                    key={friend.id}
                    className="cursor-pointer rounded-full border border-riga px-3 py-2 text-xs text-fumo has-checked:border-proiettore has-checked:text-proiettore"
                  >
                    <input
                      type="checkbox"
                      name="friendIds"
                      value={friend.id}
                      className="mr-2 accent-[#e8b84b]"
                    />
                    {friend.name}
                  </label>
                ))}
              </div>
              <button className="w-fit rounded-lg border border-proiettore px-4 py-2 text-sm text-proiettore">
                Invia inviti
              </button>
            </form>
          </details>
        )}
      </section>

      <section className="mt-10" aria-labelledby="journey-filmography">
        <div className="mb-5 flex items-center gap-4">
          <h2 id="journey-filmography" className="titlecard text-sm text-proiettore">
            Film del percorso
          </h2>
          <span className="h-px flex-1 bg-riga" aria-hidden />
          <span className="eyebrow">{currentProgress.seen}/{currentProgress.total}</span>
        </div>
        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {orderedMovies.map((movie, index) => {
            const seen = currentSeenMovieIds.has(movie.id);
            const isNext = nextMovie?.id === movie.id;
            return (
              <li
                key={movie.id}
                className={
                  "ticket relative overflow-hidden " +
                  (isNext ? "ring-1 ring-proiettore" : "")
                }
              >
                <Link href={"/film/" + filmSlug(movie)} className="group block h-full">
                  <Poster
                    title={movie.title}
                    year={movie.year}
                    genres={movie.genres}
                    posterUrl={movie.posterUrl}
                    posterCredit={movie.posterCredit}
                    showTitle={false}
                    className={"aspect-2/3 w-full " + (seen ? "opacity-55" : "")}
                  />
                  <div className="p-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-fumo">
                      {journey.mode === "chronological" ? "Capitolo " + (index + 1) : movie.year}
                    </p>
                    <h3 className="titlecard mt-1 text-xs leading-snug text-schermo transition-colors group-hover:text-proiettore">
                      {movie.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-fumo">
                      {movie.year ?? "Anno non disponibile"}
                    </p>
                  </div>
                  {seen && (
                    <span className="absolute right-2 top-2 rounded-full bg-notte/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-proiettore">
                      Visto ✓
                    </span>
                  )}
                  {!seen && isNext && (
                    <span className="absolute right-2 top-2 rounded-full bg-proiettore px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-notte-fonda">
                      Prossimo
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
