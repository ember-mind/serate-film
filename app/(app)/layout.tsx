import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { journeyMembers, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { Nav } from "@/components/Nav";
import styles from "@/components/Editorial.module.css";

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
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skip}>Vai al contenuto</a>
      <Nav
        isAdmin={user.isAdmin}
        userName={user.name}
        unreadNotifications={unreadNotifications.length + pendingJourneyInvites.length}
      />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <p>Serate Film · Il cinema, insieme.</p>
        <form action={logout}>
          <button>Esci · {user.name}</button>
        </form>
      </footer>
    </div>
  );
}
