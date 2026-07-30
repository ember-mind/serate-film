"use server";

import { and, eq, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { eventDiscussionMessages, events } from "@/db/schema";
import { canAccessEvent } from "@/lib/access";
import { requireUser } from "@/lib/auth";

type DiscussionState = { ok?: boolean; error?: string };

export async function postEventDiscussionMessage(
  eventId: number,
  _previous: DiscussionState | undefined,
  formData: FormData
): Promise<DiscussionState> {
  const user = await requireUser();
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event || !(await canAccessEvent(event, user))) {
    return { error: "Chat non disponibile." };
  }
  if (event.status !== "open" && event.status !== "runoff") {
    return { error: "Decisione già chiusa." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Scrivi un commento." };
  if (body.length > 500) return { error: "Massimo 500 caratteri." };

  const recent = await db.query.eventDiscussionMessages.findMany({
    where: and(
      eq(eventDiscussionMessages.eventId, eventId),
      eq(eventDiscussionMessages.userId, user.id),
      gt(eventDiscussionMessages.createdAt, sql`datetime('now', '-10 seconds')`)
    ),
  });
  if (recent.length >= 5) return { error: "Troppi messaggi: attendi qualche secondo." };

  await db.insert(eventDiscussionMessages).values({
    eventId,
    userId: user.id,
    body,
  });
  revalidatePath(`/serate/${eventId}`);
  return { ok: true };
}
