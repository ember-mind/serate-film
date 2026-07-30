import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  attendance,
  circleMembers,
  circles,
  ratings,
  userProfiles,
  users,
} from "@/db/schema";
import { Avatar } from "@/components/Avatar";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const viewer = await requireUser();
  const { slug } = await params;
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.slug, slug),
  });
  if (!profile) notFound();
  const person = await db.query.users.findFirst({ where: eq(users.id, profile.userId) });
  if (!person) notFound();

  const isSelf = viewer.id === person.id;
  if (!isSelf && (profile.visibility !== "public" || !profile.discoverable)) notFound();

  const memberships = await db.query.circleMembers.findMany({
    where: and(
      eq(circleMembers.userId, person.id),
      eq(circleMembers.status, "active")
    ),
  });
  const publicCircles =
    memberships.length > 0
      ? await db.query.circles.findMany({
          where: and(
            inArray(
              circles.id,
              memberships.map((membership) => membership.circleId)
            ),
            eq(circles.visibility, "public")
          ),
        })
      : [];
  const [seen, reviews] = profile.showStats
    ? await Promise.all([
        db.query.attendance.findMany({ where: eq(attendance.userId, person.id) }),
        db.query.ratings.findMany({ where: eq(ratings.userId, person.id) }),
      ])
    : [[], []];
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length
      : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/club" className="text-sm text-fumo hover:text-proiettore">
        ← Scopri il club
      </Link>
      <header className="apertura mt-7 text-center">
        <div className="mx-auto w-fit">
          <Avatar id={person.id} name={person.name} />
        </div>
        <p className="titlecard-sub mt-4">Profilo pubblico</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">{person.name}</h1>
        {profile.bio && <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-fumo">{profile.bio}</p>}
        {profile.favoriteGenres && (
          <p className="mt-3 text-sm text-proiettore">{profile.favoriteGenres}</p>
        )}
        {isSelf && (
          <Link href="/io/privacy" className="mt-4 inline-block text-xs text-fumo underline">
            Modifica profilo e privacy
          </Link>
        )}
      </header>

      {profile.showStats && (
        <section className="ticket mt-8 grid grid-cols-3 divide-x divide-riga p-5 text-center">
          <div>
            <p className="titlecard text-2xl text-proiettore">{seen.length}</p>
            <p className="eyebrow mt-1">Serate</p>
          </div>
          <div>
            <p className="titlecard text-2xl text-proiettore">{reviews.length}</p>
            <p className="eyebrow mt-1">Pagelle</p>
          </div>
          <div>
            <p className="titlecard text-2xl text-proiettore">
              {average ? average.toFixed(1) : "—"}
            </p>
            <p className="eyebrow mt-1">Media</p>
          </div>
        </section>
      )}

      <section className="mt-8">
        <p className="step-title mb-3">Circoli pubblici</p>
        {publicCircles.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {publicCircles.map((circle) => (
              <li key={circle.id}>
                <Link
                  href={`/club/${circle.slug}`}
                  className="ticket block p-4 transition-colors hover:border-proiettore"
                >
                  <h2 className="font-semibold text-schermo">{circle.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-fumo">
                    {circle.description || "Circolo pubblico di cinema."}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ticket p-5 text-sm text-fumo">Nessun circolo pubblico condiviso.</p>
        )}
      </section>
    </div>
  );
}
