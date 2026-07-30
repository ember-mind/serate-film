import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  circleFollows,
  circleMembers,
  circles,
  userProfiles,
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { toggleCircleFollow } from "@/lib/social-actions";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function ClubDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const query = String(params.q ?? "").trim().toLocaleLowerCase("it");
  const [publicCircles, publicProfiles, people, memberships, follows] =
    await Promise.all([
      db.query.circles.findMany({
        where: eq(circles.visibility, "public"),
        orderBy: asc(circles.name),
      }),
      db.query.userProfiles.findMany({
        where: and(
          eq(userProfiles.visibility, "public"),
          eq(userProfiles.discoverable, true)
        ),
      }),
      db.query.users.findMany({ orderBy: asc(users.name) }),
      db.query.circleMembers.findMany(),
      db.query.circleFollows.findMany(),
    ]);

  const visibleCircles = publicCircles.filter(
    (circle) =>
      !query ||
      circle.name.toLocaleLowerCase("it").includes(query) ||
      circle.description?.toLocaleLowerCase("it").includes(query)
  );
  const visibleProfiles = publicProfiles.filter((profile) => {
    const person = people.find((item) => item.id === profile.userId);
    return (
      person &&
      (!query ||
        person.name.toLocaleLowerCase("it").includes(query) ||
        profile.bio?.toLocaleLowerCase("it").includes(query) ||
        profile.favoriteGenres?.toLocaleLowerCase("it").includes(query))
    );
  });
  const followedIds = new Set(
    follows
      .filter((follow) => follow.userId === user.id)
      .map((follow) => follow.circleId)
  );

  return (
    <div className="mx-auto max-w-5xl">
      <header className="apertura mb-8 text-center">
        <p className="titlecard-sub">Fuori dalla tua fila</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">Scopri il club</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-fumo">
          Circoli e profili scelgono volontariamente di apparire qui. Seguire
          non significa entrare: ricevi aggiornamenti, senza aprire dati privati.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link
            href="/circoli"
            className="rounded-full border border-riga px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fumo hover:text-schermo"
          >
            I miei circoli
          </Link>
          <Link
            href="/io/privacy"
            className="rounded-full border border-riga px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fumo hover:text-schermo"
          >
            Mia privacy
          </Link>
        </div>
      </header>

      <form className="ticket mb-8 flex gap-2 p-3" role="search">
        <label htmlFor="club-search" className="sr-only">
          Cerca circoli o persone
        </label>
        <input
          id="club-search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Cerca nome, genere, atmosfera…"
          className="min-w-0 flex-1 rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm placeholder:text-fumo/50 focus:border-proiettore focus:outline-none"
        />
        <button className="rounded-lg bg-proiettore px-4 py-2.5 text-sm font-semibold text-notte-fonda">
          Cerca
        </button>
      </form>

      <section className="mb-10" aria-labelledby="circoli-pubblici">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">Sale aperte</p>
            <h2 id="circoli-pubblici" className="mt-1 font-display text-2xl font-semibold">
              Circoli pubblici
            </h2>
          </div>
          <span className="font-mono text-xs text-fumo">
            {visibleCircles.length}
          </span>
        </div>
        {visibleCircles.length === 0 ? (
          <div className="ticket p-6 text-center text-sm text-fumo">
            Nessun circolo corrisponde alla ricerca.
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {visibleCircles.map((circle) => {
              const memberCount = memberships.filter(
                (membership) =>
                  membership.circleId === circle.id &&
                  membership.status === "active"
              ).length;
              const followCount = follows.filter(
                (follow) => follow.circleId === circle.id
              ).length;
              const followed = followedIds.has(circle.id);
              return (
                <li key={circle.id} className="ticket flex h-full flex-col p-5">
                  <Link href={`/club/${circle.slug}`} className="group block flex-1">
                    <p className="eyebrow">
                      {circle.joinPolicy === "open"
                        ? "Ingresso libero"
                        : circle.joinPolicy === "request"
                          ? "Ingresso su richiesta"
                          : "Solo invito"}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-semibold text-schermo group-hover:text-proiettore">
                      {circle.name}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-fumo">
                      {circle.description || "Circolo pubblico di cinema."}
                    </p>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-fumo">
                      {memberCount} {memberCount === 1 ? "membro" : "membri"} ·{" "}
                      {followCount} {followCount === 1 ? "segue" : "seguono"}
                    </p>
                  </Link>
                  <form
                    action={toggleCircleFollow.bind(null, circle.id)}
                    className="mt-4"
                  >
                    <button
                      aria-pressed={followed}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm font-semibold ${
                        followed
                          ? "border-proiettore bg-proiettore/10 text-proiettore"
                          : "border-riga text-fumo hover:border-proiettore hover:text-schermo"
                      }`}
                    >
                      {followed ? "✓ Segui già" : "+ Segui"}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="profili-pubblici">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">Persone in foyer</p>
            <h2 id="profili-pubblici" className="mt-1 font-display text-2xl font-semibold">
              Profili scopribili
            </h2>
          </div>
          <span className="font-mono text-xs text-fumo">
            {visibleProfiles.length}
          </span>
        </div>
        {visibleProfiles.length === 0 ? (
          <div className="ticket p-6 text-center text-sm text-fumo">
            Nessun profilo pubblico corrisponde alla ricerca.
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProfiles.map((profile) => {
              const person = people.find((item) => item.id === profile.userId);
              if (!person) return null;
              return (
                <li key={profile.userId} className="ticket p-4">
                  <Link href={`/persone/${profile.slug}`} className="group block">
                  <div className="flex items-center gap-3">
                    <Avatar id={person.id} name={person.name} />
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-schermo group-hover:text-proiettore">
                        {person.name}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fumo">
                        Profilo pubblico
                      </p>
                    </div>
                  </div>
                  {profile.bio && (
                    <p className="mt-3 line-clamp-3 text-sm leading-5 text-fumo">
                      {profile.bio}
                    </p>
                  )}
                  {profile.favoriteGenres && (
                    <p className="mt-3 text-xs text-proiettore">
                      {profile.favoriteGenres}
                    </p>
                  )}
                  {profile.showStats && (
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-fumo">
                      Statistiche condivise
                    </p>
                  )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
