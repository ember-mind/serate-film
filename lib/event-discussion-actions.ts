"use server";

import { and, eq, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { eventDiscussionMessages } from "@/db/schema";
import { authorizeEventAction } from "@/lib/access";

type DiscussionState = { ok?: boolean; error?: string };

export async function postEventDiscussionMessage(
  eventId: number,
  _previous: DiscussionState | undefined,
  formData: FormData
): Promise<DiscussionState> {
  const { user } = await authorizeEventAction("postEventDiscussionMessage", eventId);

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
