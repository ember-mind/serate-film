import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  circleFollows,
  circleMembers,
  circles,
  events,
  movies,
  userProfiles,
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  requestCircleMembership,
  toggleCircleFollow,
} from "@/lib/social-actions";
import { Avatar } from "@/components/Avatar";
import { formatDateShort } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function PublicCirclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const circle = await db.query.circles.findFirst({
    where: and(eq(circles.slug, slug), eq(circles.visibility, "public")),
  });
  if (!circle) notFound();

  const [memberships, follows, myMembership, publicProfiles, people, eventRows] =
    await Promise.all([
      db.query.circleMembers.findMany({
        where: eq(circleMembers.circleId, circle.id),
      }),
      db.query.circleFollows.findMany({
        where: eq(circleFollows.circleId, circle.id),
      }),
      db.query.circleMembers.findFirst({
        where: and(
          eq(circleMembers.circleId, circle.id),
          eq(circleMembers.userId, user.id)
        ),
      }),
      db.query.userProfiles.findMany({
        where: and(
          eq(userProfiles.visibility, "public"),
          eq(userProfiles.discoverable, true)
        ),
      }),
      db.query.users.findMany({ orderBy: asc(users.name) }),
      db.query.events.findMany({
        where: and(
          eq(events.circleId, circle.id),
          eq(events.discoverable, true),
          ne(events.status, "cancelled")
        ),
      }),
    ]);
  const activeMembers = memberships.filter(
    (membership) => membership.status === "active"
  );
  const publicProfileIds = new Set(
    publicProfiles.map((profile) => profile.userId)
  );
  const canSeeAllMembers =
    user.isAdmin || myMembership?.status === "active";
  const visibleMembers = activeMembers.filter(
    (membership) =>
      canSeeAllMembers ||
      membership.userId === user.id ||
      publicProfileIds.has(membership.userId)
  );
  const following = follows.some((follow) => follow.userId === user.id);
  const movieIds = [
    ...new Set(
      eventRows
        .map((event) => event.chosenMovieId)
        .filter((id): id is number => id !== null)
    ),
  ];
  const movieRows = movieIds.length
    ? await db.query.movies.findMany({ where: inArray(movies.id, movieIds) })
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <header className="cinemascope apertura overflow-hidden rounded-md px-5 py-10 text-center sm:px-10">
        <p className="titlecard-sub">Circolo pubblico</p>
        <h1 className="titlecard mt-2 text-3xl text-schermo sm:text-4xl">
          {circle.name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-fumo">
          {circle.description || "Una compagnia pubblica riunita dal cinema."}
        </p>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-fumo">
          {activeMembers.length}{" "}
          {activeMembers.length === 1 ? "membro" : "membri"} · {follows.length}{" "}
          {follows.length === 1 ? "persona segue" : "persone seguono"}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <form action={toggleCircleFollow.bind(null, circle.id)}>
            <button
              aria-pressed={following}
              className={`rounded-lg border px-5 py-2.5 text-sm font-semibold ${
                following
                  ? "border-proiettore bg-proiettore/10 text-proiettore"
                  : "border-riga text-schermo hover:border-proiettore"
              }`}
            >
              {following ? "✓ Stai seguendo" : "+ Segui il circolo"}
            </button>
          </form>

          {myMembership?.status === "active" ? (
            <Link
              href={`/circoli/${circle.slug}`}
              className="rounded-lg bg-proiettore px-5 py-2.5 text-sm font-semibold text-notte-fonda"
            >
              Entra nello spazio privato
            </Link>
          ) : myMembership?.status === "requested" ? (
            <span className="rounded-lg bg-sipario-chiaro px-5 py-2.5 text-sm text-fumo">
              Richiesta inviata
            </span>
          ) : circle.joinPolicy === "invite" && myMembership?.status !== "invited" ? (
            <span className="rounded-lg bg-sipario-chiaro px-5 py-2.5 text-sm text-fumo">
              Ingresso solo su invito
            </span>
          ) : (
            <form action={requestCircleMembership.bind(null, circle.id)}>
              <button className="rounded-lg bg-proiettore px-5 py-2.5 text-sm font-semibold text-notte-fonda">
                {myMembership?.status === "invited"
                  ? "Accetta invito"
                  : circle.joinPolicy === "open"
                    ? "Entra nel circolo"
                    : "Chiedi di entrare"}
              </button>
            </form>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <section aria-labelledby="prossime-serate">
          <p className="eyebrow">Cartellone pubblico</p>
          <h2 id="prossime-serate" className="mt-1 font-display text-2xl font-semibold">
            Serate condivise
          </h2>
          {eventRows.length === 0 ? (
            <div className="ticket mt-4 p-5 text-sm text-fumo">
              Nessuna serata pubblica in cartellone.
            </div>
          ) : (
            <ul className="mt-4 grid gap-3">
              {eventRows.slice(0, 8).map((event) => {
                const movie = movieRows.find(
                  (item) => item.id === event.chosenMovieId
                );
                return (
                  <li key={event.id}>
                    <Link
                      href={`/serate/${event.id}`}
                      className="ticket flex items-center justify-between gap-4 p-4 hover:border-proiettore/60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-schermo">
                          {movie?.title || event.title || "Serata da decidere"}
                        </span>
                        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-fumo">
                          {event.chosenDate
                            ? formatDateShort(event.chosenDate)
                            : "Data da decidere"}
                        </span>
                      </span>
                      <span className="shrink-0 text-proiettore">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="membri-pubblici">
          <p className="eyebrow">In prima fila</p>
          <h2 id="membri-pubblici" className="mt-1 font-display text-2xl font-semibold">
            Compagnia
          </h2>
          <ul className="ticket mt-4 divide-y divide-riga">
            {visibleMembers.slice(0, 12).map((membership) => {
              const person = people.find(
                (item) => item.id === membership.userId
              );
              if (!person) return null;
              return (
                <li key={membership.userId} className="flex items-center gap-3 p-3">
                  <Avatar id={person.id} name={person.name} small />
                  <span className="min-w-0 flex-1 truncate text-sm text-schermo">
                    {person.name}
                  </span>
                  {membership.role !== "member" && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-fumo">
                      {membership.role === "owner" ? "Fondatore" : "Regia"}
                    </span>
                  )}
                </li>
              );
            })}
            {visibleMembers.length === 0 && (
              <li className="p-4 text-sm text-fumo">
                I membri mantengono privato il proprio profilo.
              </li>
            )}
          </ul>
          {visibleMembers.length < activeMembers.length && (
            <p className="mt-2 text-xs leading-5 text-fumo">
              {activeMembers.length - visibleMembers.length} profili non vengono
              mostrati per scelta di privacy.
            </p>
          )}
        </section>
      </div>

      <p className="mt-10 text-center">
        <Link href="/club" className="text-sm text-proiettore underline">
          Torna alla scoperta
        </Link>
      </p>
    </div>
  );
}
