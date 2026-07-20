import { asc } from "drizzle-orm";
import { db } from "@/db";
import { movies } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { actorProfile, actorSlug, parseActors } from "@/lib/actors";
import { ActorsGrid, type ActorCard } from "./ActorsGrid";

export const dynamic = "force-dynamic";

export default async function ActorsPage() {
  await requireUser();
  const filmography = await db.query.movies.findMany({ orderBy: asc(movies.title) });
  const counts = new Map<string, number>();

  for (const movie of filmography) {
    for (const actor of parseActors(movie.actors)) {
      counts.set(actor.name, (counts.get(actor.name) ?? 0) + 1);
    }
  }

  const actors: ActorCard[] = [...counts.entries()]
    .map(([name, filmCount]) => {
      const profile = actorProfile(name);
      return {
        name,
        slug: actorSlug(name),
        imageUrl: profile?.imageUrl ?? null,
        birthDate: profile?.birthDate ?? null,
        filmCount,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "it"));

  return (
    <div>
      <header className="apertura mb-8 text-center">
        <p className="titlecard-sub">Volti sullo schermo</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">Interpreti</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-fumo">
          Attrici e attori dei film presenti nella nostra cineteca.
        </p>
      </header>
      <ActorsGrid actors={actors} />
    </div>
  );
}
