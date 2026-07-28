import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const unread = await db.query.notifications.findMany({
    where: and(eq(notifications.userId, user.id), isNull(notifications.readAt)),
    columns: { id: true },
  });

  return Response.json(
    { count: unread.length },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
