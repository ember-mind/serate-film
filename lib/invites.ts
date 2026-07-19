import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { eventInvitees } from "@/db/schema";

type Ev = { id: number; createdBy: number };
type U = { id: number; isAdmin: boolean };

// eventId → lista invitati. Nessuna voce = serata aperta a tutti.
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

export function canSee(event: Ev, invitees: number[] | undefined, user: U) {
  if (!invitees || invitees.length === 0) return true;
  return user.isAdmin || event.createdBy === user.id || invitees.includes(user.id);
}

export async function filterVisible<T extends Ev>(evts: T[], user: U): Promise<T[]> {
  if (evts.length === 0) return evts;
  const map = await inviteesByEvent(evts.map((e) => e.id));
  return evts.filter((e) => canSee(e, map.get(e.id), user));
}
