import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  attendance,
  circleMembers,
  circles,
  eventInvitees,
  eventInviteLinks,
  eventRsvps,
  events,
  screeningLicenses,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";

export type AccessUser = {
  id: number;
  isAdmin: boolean;
};

export type CircleAccessLevel = "view" | "participate" | "manage";

type EventStatus = typeof events.$inferSelect.status;
type EventCapability =
  | "authenticated"
  | "invite_token"
  | "access"
  | "participate"
  | "attendee"
  | "manage"
  | "admin"
  | "comment_owner_or_admin";

type EventAuthorizationRule = Readonly<{
  capability: EventCapability;
  states: readonly EventStatus[] | null;
  verifiedLicense?: true;
}>;

const ACTIVE_EVENT_STATES = ["open", "runoff", "scheduled"] as const;

// The single audited inventory for every event-related exported Server Action.
// Runtime authorization and the inventory-completeness test both consume it.
export const EVENT_ACTION_AUTHORIZATION = {
  signupWithInvite: { capability: "invite_token", states: ACTIVE_EVENT_STATES },
  createEvent: { capability: "authenticated", states: null },
  createEventInviteLink: { capability: "manage", states: ACTIVE_EVENT_STATES },
  regenerateEventInviteLink: { capability: "manage", states: ACTIVE_EVENT_STATES },
  acceptEventInvite: { capability: "invite_token", states: ACTIVE_EVENT_STATES },
  saveEventContribution: { capability: "participate", states: ACTIVE_EVENT_STATES },
  addEventNeed: { capability: "manage", states: ACTIVE_EVENT_STATES },
  toggleEventNeedClaim: { capability: "participate", states: ACTIVE_EVENT_STATES },
  deleteEventNeed: { capability: "manage", states: ACTIVE_EVENT_STATES },
  proposeEventMovie: { capability: "participate", states: ["open"] },
  proposeEventDate: { capability: "participate", states: ["open"] },
  submitVotes: { capability: "participate", states: ["open"] },
  startRunoff: { capability: "manage", states: ["open"] },
  submitRunoffVote: { capability: "participate", states: ["runoff"] },
  addEventInvitees: { capability: "manage", states: ACTIVE_EVENT_STATES },
  closeEvent: { capability: "manage", states: ["open", "runoff"] },
  reopenEvent: { capability: "manage", states: ["scheduled"] },
  cancelEvent: { capability: "manage", states: ACTIVE_EVENT_STATES },
  markWatched: { capability: "manage", states: ["scheduled"] },
  rateEvent: { capability: "attendee", states: ["done"] },
  toggleReviewLike: { capability: "attendee", states: ["done"] },
  saveEventNotes: {
    capability: "manage",
    states: ["open", "runoff", "scheduled", "done"],
  },
  setEventParticipation: { capability: "access", states: ACTIVE_EVENT_STATES },
  submitConsensusBallot: { capability: "participate", states: ["open"] },
  addRatingComment: { capability: "attendee", states: ["done"] },
  deleteRatingComment: { capability: "comment_owner_or_admin", states: ["done"] },
  postEventDiscussionMessage: { capability: "participate", states: ["open", "runoff"] },
  configureRoom: { capability: "manage", states: ACTIVE_EVENT_STATES },
  joinRoom: {
    capability: "participate",
    states: ACTIVE_EVENT_STATES,
    verifiedLicense: true,
  },
  heartbeatRoom: {
    capability: "participate",
    states: ACTIVE_EVENT_STATES,
    verifiedLicense: true,
  },
  setRoomReady: {
    capability: "participate",
    states: ACTIVE_EVENT_STATES,
    verifiedLicense: true,
  },
  controlRoom: { capability: "manage", states: ACTIVE_EVENT_STATES },
  postRoomMessage: {
    capability: "participate",
    states: ACTIVE_EVENT_STATES,
    verifiedLicense: true,
  },
  postRoomReaction: {
    capability: "participate",
    states: ACTIVE_EVENT_STATES,
    verifiedLicense: true,
  },
  createRoomPoll: { capability: "manage", states: ACTIVE_EVENT_STATES },
  voteRoomPoll: {
    capability: "participate",
    states: ACTIVE_EVENT_STATES,
    verifiedLicense: true,
  },
  closeRoomPoll: { capability: "manage", states: ACTIVE_EVENT_STATES },
  submitScreeningLicense: { capability: "manage", states: ACTIVE_EVENT_STATES },
  reviewScreeningLicense: { capability: "admin", states: ACTIVE_EVENT_STATES },
} as const satisfies Record<string, EventAuthorizationRule>;

export type EventActionName = keyof typeof EVENT_ACTION_AUTHORIZATION;

export class EventAuthorizationError extends Error {
  constructor() {
    super("Non autorizzato");
    this.name = "EventAuthorizationError";
  }
}

function ruleFor(action: EventActionName): EventAuthorizationRule {
  return EVENT_ACTION_AUTHORIZATION[action];
}

export function isEventActionStateAllowed(action: EventActionName, status: EventStatus) {
  const states = ruleFor(action).states;
  return !states || states.includes(status);
}

function assertAllowedState(rule: EventAuthorizationRule, status: EventStatus) {
  if (rule.states && !rule.states.includes(status)) {
    throw new EventAuthorizationError();
  }
}

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

async function hasOptedOut(eventId: number, userId: number) {
  return Boolean(
    await db.query.eventRsvps.findFirst({
      where: and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.userId, userId),
        eq(eventRsvps.status, "no")
      ),
      columns: { eventId: true },
    })
  );
}

export async function requireEventActionUser(action: EventActionName) {
  const rule = ruleFor(action);
  if (rule.capability !== "authenticated" && rule.capability !== "comment_owner_or_admin") {
    throw new Error(`La policy di ${action} richiede il contesto della serata.`);
  }
  return requireUser();
}

export async function authorizeEventAction(
  action: EventActionName,
  eventId: number,
  options: { resourceOwnerId?: number } = {}
) {
  const rule = ruleFor(action);
  if (!Number.isInteger(eventId) || eventId < 1) throw new EventAuthorizationError();
  if (rule.capability === "authenticated" || rule.capability === "invite_token") {
    throw new Error(`La policy di ${action} non usa un id serata.`);
  }

  const user = await requireUser();
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) throw new EventAuthorizationError();
  assertAllowedState(rule, event.status);

  const isManager = user.isAdmin || event.createdBy === user.id;
  let allowed = false;
  if (rule.capability === "admin") {
    allowed = user.isAdmin;
  } else if (rule.capability === "manage") {
    allowed = isManager;
  } else if (rule.capability === "comment_owner_or_admin") {
    allowed = user.isAdmin || options.resourceOwnerId === user.id;
  } else {
    allowed = await canAccessEvent(event, user);
    if (allowed && rule.capability === "participate") {
      allowed = !(await hasOptedOut(event.id, user.id));
    }
    if (allowed && rule.capability === "attendee") {
      allowed = Boolean(
        await db.query.attendance.findFirst({
          where: and(
            eq(attendance.eventId, event.id),
            eq(attendance.userId, user.id)
          ),
          columns: { eventId: true },
        })
      );
    }
  }

  if (allowed && rule.verifiedLicense && !isManager && event.viewingMode === "licensed_public") {
    const license = await db.query.screeningLicenses.findFirst({
      where: eq(screeningLicenses.eventId, event.id),
    });
    allowed =
      license?.status === "verified" &&
      (!license.expiresAt || license.expiresAt >= new Date().toISOString().slice(0, 10));
  }

  if (!allowed) throw new EventAuthorizationError();
  return { user, event, isManager };
}

type EventInviteAuthorization = {
  user: Awaited<ReturnType<typeof requireUser>> | null;
  event: typeof events.$inferSelect;
  invite: typeof eventInviteLinks.$inferSelect;
};

export function authorizeEventInviteToken(
  action: "acceptEventInvite",
  token: string
): Promise<EventInviteAuthorization>;
export function authorizeEventInviteToken(
  action: "signupWithInvite",
  token: string
): Promise<EventInviteAuthorization | null>;
export async function authorizeEventInviteToken(
  action: "acceptEventInvite" | "signupWithInvite",
  token: string
): Promise<EventInviteAuthorization | null> {
  const rule = ruleFor(action);
  const deny = () => {
    if (action === "signupWithInvite") return null;
    throw new EventAuthorizationError();
  };
  if (rule.capability !== "invite_token" || !token) return deny();
  const user = action === "acceptEventInvite" ? await requireUser() : null;

  const invite = await db.query.eventInviteLinks.findFirst({
    where: eq(eventInviteLinks.token, token),
  });
  const event = invite
    ? await db.query.events.findFirst({ where: eq(events.id, invite.eventId) })
    : null;
  if (!invite || !event || (rule.states && !rule.states.includes(event.status))) return deny();
  return { user, event, invite };
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
