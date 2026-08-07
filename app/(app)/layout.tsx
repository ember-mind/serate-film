import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { journeyMembers, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { Nav } from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [unreadNotifications, pendingJourneyInvites] = await Promise.all([
    db.query.notifications.findMany({
      where: and(eq(notifications.userId, user.id), isNull(notifications.readAt)),
      columns: { id: true },
    }),
    db.query.journeyMembers.findMany({
      where: and(
        eq(journeyMembers.userId, user.id),
        eq(journeyMembers.status, "invited")
      ),
      columns: { journeyId: true },
    }),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Nav
        isAdmin={user.isAdmin}
        userName={user.name}
        unreadNotifications={unreadNotifications.length + pendingJourneyInvites.length}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:pb-12">
        {children}
      </main>
      <footer className="hidden border-t border-riga py-4 text-center sm:block">
        <form action={logout}>
          <button className="eyebrow hover:text-schermo">Esci · {user.name}</button>
        </form>
      </footer>
    </div>
  );
}
