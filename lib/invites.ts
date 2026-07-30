import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { eventInvitees, events } from "@/db/schema";
import { filterAccessibleEvents } from "@/lib/access";

type Ev = typeof events.$inferSelect;
type U = { id: number; isAdmin: boolean };

// eventId → lista invitati espliciti. La visibilità resta in events.access.
export async function inviteesByEvent(eventIds: number[]) {
  const map = new Map<number, number[]>();
  if (eventIds.length === 0) return map;
  const rows = await db.query.eventInvitees.findMany({
    where: inArray(eventInvitees.eventId, eventIds),
  });
  for (const r of rows) {
    map.set(r.eventId, [...(map.get(r.eventId) ?? []), r.userId]);
  }
  return map;
}

export async function filterVisible<T extends Ev>(evts: T[], user: U): Promise<T[]> {
  return filterAccessibleEvents(evts, user);
}
