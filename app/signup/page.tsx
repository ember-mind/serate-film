import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { eventInviteLinks, events, movies } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { isEventActionStateAllowed } from "@/lib/access";
import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invito?: string | string[] }>;
}) {
  const rawToken = (await searchParams).invito;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  if (!token) redirect("/login");
  if (await getCurrentUser()) redirect(`/invito/${token}`);

  const invite = await db.query.eventInviteLinks.findFirst({
    where: eq(eventInviteLinks.token, token),
  });
  const event = invite
    ? await db.query.events.findFirst({ where: eq(events.id, invite.eventId) })
    : null;
  const movie = event?.chosenMovieId
    ? await db.query.movies.findFirst({ where: eq(movies.id, event.chosenMovieId) })
    : null;

  if (!invite || !event || !isEventActionStateAllowed("signupWithInvite", event.status)) {
    return (
      <main className="curtain flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="cinemascope w-full max-w-md px-6 py-10 text-center">
          <p className="eyebrow">Biglietto non valido</p>
          <h1 className="titlecard mt-3 text-2xl text-schermo">Invito scaduto</h1>
          <p className="mt-3 text-sm text-fumo">
            Chiedi un nuovo link a chi organizza la serata.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-proiettore underline">
            Vai all&apos;accesso
          </Link>
        </div>
      </main>
    );
  }

  const eventTitle = movie?.title ?? event.title ?? "Serata da decidere";

  return (
    <main className="curtain relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="curtain-edge pointer-events-none absolute inset-0" aria-hidden />
      <div className="apertura relative w-full max-w-md">
        <div className="cinemascope px-6 py-10 sm:px-10">
          <p className="titlecard-sub text-center">Hai ricevuto un invito</p>
          <h1 className="titlecard mt-3 text-center text-2xl text-schermo">
            {eventTitle}
          </h1>
          <p className="mt-2 text-center text-sm text-fumo">
            Crea il tuo account per entrare nella serata.
          </p>

          <SignupForm token={token} />

          <p className="mt-6 text-center text-sm text-fumo">
            Hai già un account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(`/invito/${token}`)}`}
              className="text-proiettore underline"
            >
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
