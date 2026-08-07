import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { journeyMembers, notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const [unread, pendingJourneyInvites] = await Promise.all([
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

  return Response.json(
    { count: unread.length + pendingJourneyInvites.length },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
