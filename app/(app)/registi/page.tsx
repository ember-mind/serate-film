import { asc } from "drizzle-orm";
import { db } from "@/db";
import { movies } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { directorProfile, directorSlug, parseDirectors } from "@/lib/directors";
import { DirectorsGrid, type DirectorCard } from "./DirectorsGrid";

export const dynamic = "force-dynamic";

export default async function DirectorsPage() {
  await requireUser();
  const filmography = await db.query.movies.findMany({ orderBy: asc(movies.title) });
  const counts = new Map<string, number>();

  for (const movie of filmography) {
    for (const name of parseDirectors(movie.director)) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }

  const directors: DirectorCard[] = [...counts.entries()]
    .map(([name, filmCount]) => {
      const profile = directorProfile(name);
      return {
        name,
        slug: directorSlug(name),
        imageUrl: profile?.imageUrl ?? null,
        birthDate: profile?.birthDate ?? null,
        filmCount,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "it"));

  return (
    <div>
      <header className="apertura mb-8 text-center">
        <p className="titlecard-sub">Dietro la macchina da presa</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">I registi</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-fumo">
          Le registe e i registi dei film presenti nella nostra cineteca.
        </p>
      </header>
      <DirectorsGrid directors={directors} />
    </div>
  );
}
