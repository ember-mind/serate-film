import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
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
import { acceptJourney, declineJourney } from "@/lib/journey-actions";
import {
  getUserJourneyStats,
  progressForMovies,
  seenMovieIdsForUser,
} from "@/lib/journeys";
import { filmSlug } from "@/lib/films";

export const dynamic = "force-dynamic";

export default async function JourneysPage() {
  const user = await requireUser();
  const memberships = await db.query.journeyMembers.findMany({
    where: eq(journeyMembers.userId, user.id),
  });
  const journeyIds = memberships.map((membership) => membership.journeyId);
  const [journeyRows, filmRows, allMemberRows, stats, seenMovieIds] = await Promise.all([
    journeyIds.length
      ? db.query.journeys.findMany({
          where: inArray(journeys.id, journeyIds),
          orderBy: desc(journeys.createdAt),
        })
      : Promise.resolve([]),
    journeyIds.length
      ? db.query.journeyMovies.findMany({
          where: inArray(journeyMovies.journeyId, journeyIds),
        })
      : Promise.resolve([]),
    journeyIds.length
      ? db.query.journeyMembers.findMany({
          where: inArray(journeyMembers.journeyId, journeyIds),
        })
      : Promise.resolve([]),
    getUserJourneyStats(user.id),
    seenMovieIdsForUser(user.id),
  ]);
  const movieIds = [...new Set(filmRows.map((row) => row.movieId))];
  const personIds = [
    ...new Set([
      ...journeyRows.map((journey) => journey.createdBy),
      ...allMemberRows.map((membership) => membership.userId),
    ]),
  ];
  const [movieRows, people] = await Promise.all([
    movieIds.length
      ? db.query.movies.findMany({ where: inArray(movies.id, movieIds) })
      : Promise.resolve([]),
    personIds.length
      ? db.query.users.findMany({ where: inArray(users.id, personIds) })
      : Promise.resolve([]),
  ]);
  const movieOf = (movieId: number) => movieRows.find((movie) => movie.id === movieId);
  const personName = (userId: number) =>
    people.find((person) => person.id === userId)?.name ?? "Membro";

  const cards = journeyRows.map((journey) => {
    const membership = memberships.find((item) => item.journeyId === journey.id)!;
    const orderedMovieIds = filmRows
      .filter((row) => row.journeyId === journey.id)
      .sort((a, b) => a.position - b.position)
      .map((row) => row.movieId);
    const progress = progressForMovies(orderedMovieIds, seenMovieIds);
    const nextMovie = orderedMovieIds
      .filter((movieId) => !seenMovieIds.has(movieId))
      .map(movieOf)
      .find(Boolean);
    const coverMovie = nextMovie ?? movieOf(orderedMovieIds[orderedMovieIds.length - 1]);
    const members = allMemberRows.filter((item) => item.journeyId === journey.id);
    return {
      journey,
      membership,
      progress,
      nextMovie,
      coverMovie,
      activeFriends: members.filter(
        (item) => item.status === "active" && item.userId !== user.id
      ).length,
      pendingFriends: members.filter((item) => item.status === "invited").length,
    };
  });
  const invitations = cards.filter((card) => card.membership.status === "invited");
  const active = cards.filter(
    (card) => card.membership.status === "active" && !card.progress.complete
  );
  const completed = cards.filter(
    (card) => card.membership.status === "active" && card.progress.complete
  );

  const journeyCard = (card: (typeof cards)[number]) => (
    <article key={card.journey.id} className="ticket grid min-w-0 grid-cols-[88px_1fr] overflow-hidden sm:grid-cols-[112px_1fr]">
      {card.coverMovie ? (
        <Link href={"/film/" + filmSlug(card.coverMovie)} className="block bg-sipario-chiaro">
          <Poster
            title={card.coverMovie.title}
            year={card.coverMovie.year}
            genres={card.coverMovie.genres}
            posterUrl={card.coverMovie.posterUrl}
            posterCredit={card.coverMovie.posterCredit}
            showTitle={false}
            className="h-full min-h-36 w-full"
          />
        </Link>
      ) : (
        <div className="bg-sipario-chiaro" />
      )}
      <div className="min-w-0 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-riga px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-fumo">
            {card.journey.mode === "chronological" ? "Cronologico" : "Ordine libero"}
          </span>
          {card.activeFriends > 0 && (
            <span className="font-mono text-[10px] text-proiettore">
              con {card.activeFriends} {card.activeFriends === 1 ? "amico" : "amici"}
            </span>
          )}
          {card.pendingFriends > 0 && (
            <span className="font-mono text-[10px] text-fumo">
              {card.pendingFriends} in attesa
            </span>
          )}
        </div>
        <h2 className="titlecard mt-3 text-sm leading-snug text-schermo">
          <Link
            href={"/percorsi/" + card.journey.id}
            className="transition-colors hover:text-proiettore"
          >
            {card.journey.title}
          </Link>
        </h2>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sipario-chiaro">
          <div
            className="h-full rounded-full bg-proiettore"
            style={{ width: card.progress.percentage + "%" }}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-fumo">
            {card.progress.seen}/{card.progress.total} film · {card.progress.percentage}%
          </span>
          {card.progress.complete ? (
            <span className="font-semibold text-proiettore">Completato ✓</span>
          ) : card.nextMovie ? (
            <span className="max-w-full truncate text-fumo">
              Prossimo: <strong className="text-schermo">{card.nextMovie.title}</strong>
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );

  return (
    <div>
      <header className="apertura mb-8 text-center">
        <p className="titlecard-sub">Film dopo film</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">Percorsi</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-fumo">
          Completa filmografie, avanza con gli amici e trasforma il prossimo titolo in una serata.
        </p>
      </header>

      <section className="ticket mb-8 overflow-hidden" aria-label="Livello personale">
        <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-6">
          <div>
            <p className="eyebrow">Livello {stats.level.level}</p>
            <h2 className="titlecard mt-1 text-2xl text-proiettore">{stats.level.name}</h2>
            <p className="mt-2 text-sm text-fumo">
              {stats.experience} XP · {stats.completedJourneys} percorsi completati
            </p>
          </div>
          <div className="sm:text-right">
            {stats.level.next ? (
              <>
                <p className="text-xs text-fumo">
                  Ancora {stats.level.next.threshold - stats.experience} XP per{" "}
                  {stats.level.next.name}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-sipario-chiaro sm:w-56">
                  <div
                    className="h-full rounded-full bg-proiettore"
                    style={{ width: stats.level.progress + "%" }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-proiettore">Livello massimo raggiunto</p>
            )}
          </div>
        </div>
      </section>

      {invitations.length > 0 && (
        <section className="mb-10" aria-labelledby="journey-invites">
          <div className="mb-4 flex items-center gap-4">
            <h2 id="journey-invites" className="titlecard text-sm text-proiettore">
              Inviti
            </h2>
            <span className="h-px flex-1 bg-riga" aria-hidden />
            <span className="eyebrow">{invitations.length}</span>
          </div>
          <div className="grid gap-3">
            {invitations.map((card) => (
              <article key={card.journey.id} className="ticket p-5">
                <p className="eyebrow">
                  {personName(card.journey.createdBy)} ti invita
                </p>
                <h3 className="titlecard mt-2 text-lg text-schermo">{card.journey.title}</h3>
                <p className="mt-2 text-sm text-fumo">
                  {card.progress.total} film ·{" "}
                  {card.journey.mode === "chronological"
                    ? "ordine cronologico guidato"
                    : "ordine libero"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={acceptJourney.bind(null, card.journey.id)}>
                    <button className="rounded-lg bg-proiettore px-4 py-2 text-sm font-semibold text-notte-fonda">
                      Accetta percorso
                    </button>
                  </form>
                  <form action={declineJourney.bind(null, card.journey.id)}>
                    <button className="rounded-lg border border-riga px-4 py-2 text-sm text-fumo transition-colors hover:border-velluto hover:text-velluto">
                      Rifiuta
                    </button>
                  </form>
                  <Link
                    href={"/percorsi/" + card.journey.id}
                    className="rounded-lg px-3 py-2 text-sm text-fumo hover:text-schermo"
                  >
                    Guarda i film
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="active-journeys">
        <div className="mb-4 flex items-center gap-4">
          <h2 id="active-journeys" className="titlecard text-sm text-proiettore">
            In corso
          </h2>
          <span className="h-px flex-1 bg-riga" aria-hidden />
          <span className="eyebrow">{active.length}</span>
        </div>
        {active.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">{active.map(journeyCard)}</div>
        ) : (
          <div className="ticket p-6 text-center">
            <p className="text-sm text-fumo">Nessun percorso attivo.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link
                href="/registi"
                className="rounded-lg bg-proiettore px-4 py-2 text-sm font-semibold text-notte-fonda"
              >
                Scegli un regista
              </Link>
              <Link
                href="/attori"
                className="rounded-lg border border-riga px-4 py-2 text-sm text-schermo"
              >
                Scegli un attore
              </Link>
            </div>
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section className="mt-10" aria-labelledby="completed-journeys">
          <div className="mb-4 flex items-center gap-4">
            <h2 id="completed-journeys" className="titlecard text-sm text-proiettore">
              Completati
            </h2>
            <span className="h-px flex-1 bg-riga" aria-hidden />
            <span className="eyebrow">{completed.length}</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">{completed.map(journeyCard)}</div>
        </section>
      )}
    </div>
  );
}
