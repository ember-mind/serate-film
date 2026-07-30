import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  circleMembers,
  circles,
  eventInvitees,
  events,
} from "@/db/schema";

export type AccessUser = {
  id: number;
  isAdmin: boolean;
};

export type CircleAccessLevel = "view" | "participate" | "manage";

export async function getCircleAccess(circleId: number, user: AccessUser) {
  const [circle, membership] = await Promise.all([
    db.query.circles.findFirst({ where: eq(circles.id, circleId) }),
    db.query.circleMembers.findFirst({
      where: and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, user.id)
      ),
    }),
  ]);

  if (!circle) return null;

  const active = membership?.status === "active";
  const canView =
    user.isAdmin ||
    circle.visibility !== "private" ||
    membership?.status === "active" ||
    membership?.status === "invited";
  const canParticipate = user.isAdmin || active;
  const canManage =
    user.isAdmin ||
    circle.ownerId === user.id ||
    (active && membership?.role === "moderator");

  return {
    circle,
    membership: membership ?? null,
    canView,
    canParticipate,
    canManage,
  };
}

export async function getCircleAccessBySlug(slug: string, user: AccessUser) {
  const circle = await db.query.circles.findFirst({
    where: eq(circles.slug, slug),
  });
  if (!circle) return null;
  return getCircleAccess(circle.id, user);
}

export async function requireCircleAccess(
  circleId: number,
  user: AccessUser,
  level: CircleAccessLevel
) {
  const access = await getCircleAccess(circleId, user);
  const allowed =
    access &&
    (level === "view"
      ? access.canView
      : level === "participate"
        ? access.canParticipate
        : access.canManage);

  if (!access || !allowed) {
    throw new Error("Non hai accesso a questo circolo.");
  }
  return access;
}

export async function canAccessEvent(
  event: typeof events.$inferSelect,
  user: AccessUser
) {
  if (user.isAdmin || event.createdBy === user.id) return true;
  if (event.access === "club" || event.access === "public") return true;

  if (event.access === "circle" && event.circleId) {
    const membership = await db.query.circleMembers.findFirst({
      where: and(
        eq(circleMembers.circleId, event.circleId),
        eq(circleMembers.userId, user.id),
        eq(circleMembers.status, "active")
      ),
    });
    if (membership) return true;
  }

  const invitee = await db.query.eventInvitees.findFirst({
    where: and(
      eq(eventInvitees.eventId, event.id),
      eq(eventInvitees.userId, user.id)
    ),
  });
  return Boolean(invitee);
}

export async function filterAccessibleEvents<T extends typeof events.$inferSelect>(
  eventRows: T[],
  user: AccessUser
) {
  if (eventRows.length === 0 || user.isAdmin) return eventRows;

  const eventIds = eventRows.map((event) => event.id);
  const circleIds = [
    ...new Set(
      eventRows
        .map((event) => event.circleId)
        .filter((id): id is number => id !== null)
    ),
  ];

  const [memberships, invitations] = await Promise.all([
    circleIds.length
      ? db.query.circleMembers.findMany({
          where: and(
            eq(circleMembers.userId, user.id),
            eq(circleMembers.status, "active"),
            inArray(circleMembers.circleId, circleIds)
          ),
        })
      : Promise.resolve([]),
    db.query.eventInvitees.findMany({
      where: and(
        eq(eventInvitees.userId, user.id),
        inArray(eventInvitees.eventId, eventIds)
      ),
    }),
  ]);

  const joinedCircles = new Set(memberships.map((membership) => membership.circleId));
  const invitedEvents = new Set(invitations.map((invitation) => invitation.eventId));

  return eventRows.filter((event) => {
    if (event.createdBy === user.id) return true;
    if (event.access === "club" || event.access === "public") return true;
    if (
      event.access === "circle" &&
      event.circleId &&
      joinedCircles.has(event.circleId)
    ) {
      return true;
    }
    return invitedEvents.has(event.id);
  });
}
