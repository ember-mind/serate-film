import "server-only";

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  attendance, circleMembers, circles, dateVotes, eventDates, eventMovies,
  eventRsvps, events, journeyMembers, journeys, movieBallots, movies,
  movieVotes, ratings, runoffVotes, watchlist,
} from "@/db/schema";
import { filterAccessibleEvents, type AccessUser } from "@/lib/access";

type Event = typeof events.$inferSelect;
export type HomeTask = {
  id: string;
  eventId?: number;
  kind: "vote" | "runoff" | "review" | "circle" | "journey";
  title: string;
  detail: string;
  href: string;
  label: string;
};

export function calendarDateInRome(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function isCalendarDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Read-only projection: never infer access from missing invitees or persist UI state.
export async function getHomeDashboard(user: AccessUser, now = new Date()) {
  const accessible = await filterAccessibleEvents(
    await db.query.events.findMany({
      where: inArray(events.status, ["open", "runoff", "scheduled", "done"]),
      orderBy: [desc(events.createdAt), desc(events.id)],
    }),
    user
  );
  const visibleIds = accessible.map((event) => event.id);
  const [rsvps, ballots, attended, reviewed, dateResponses, approvalResponses, runoffResponses, shelf, circleInvites, journeyInvites] = await Promise.all([
    visibleIds.length ? db.query.eventRsvps.findMany({ where: and(eq(eventRsvps.userId, user.id), inArray(eventRsvps.eventId, visibleIds)) }) : [],
    visibleIds.length ? db.query.movieBallots.findMany({ where: and(eq(movieBallots.userId, user.id), inArray(movieBallots.eventId, visibleIds)) }) : [],
    visibleIds.length ? db.query.attendance.findMany({ where: and(eq(attendance.userId, user.id), inArray(attendance.eventId, visibleIds)) }) : [],
    visibleIds.length ? db.query.ratings.findMany({ where: and(eq(ratings.userId, user.id), inArray(ratings.eventId, visibleIds)) }) : [],
    visibleIds.length ? db.select({ eventId: eventDates.eventId }).from(dateVotes)
      .innerJoin(eventDates, eq(dateVotes.eventDateId, eventDates.id))
      .where(and(eq(dateVotes.userId, user.id), inArray(eventDates.eventId, visibleIds))) : [],
    visibleIds.length ? db.select({ eventId: eventMovies.eventId }).from(movieVotes)
      .innerJoin(eventMovies, eq(movieVotes.eventMovieId, eventMovies.id))
      .where(and(eq(movieVotes.userId, user.id), inArray(eventMovies.eventId, visibleIds))) : [],
    visibleIds.length ? db.select({ eventId: eventMovies.eventId }).from(runoffVotes)
      .innerJoin(eventMovies, eq(runoffVotes.eventMovieId, eventMovies.id))
      .where(and(eq(runoffVotes.userId, user.id), eq(eventMovies.inRunoff, true), inArray(eventMovies.eventId, visibleIds))) : [],
    db.select({ movie: movies }).from(watchlist).innerJoin(movies, eq(watchlist.movieId, movies.id))
      .where(eq(watchlist.status, "active")).orderBy(desc(watchlist.addedAt), asc(movies.id)).limit(4),
    db.select({ id: circles.id, slug: circles.slug, title: circles.name }).from(circleMembers)
      .innerJoin(circles, eq(circleMembers.circleId, circles.id))
      .where(and(eq(circleMembers.userId, user.id), eq(circleMembers.status, "invited")))
      .orderBy(asc(circles.id)),
    db.select({ id: journeys.id, title: journeys.title }).from(journeyMembers)
      .innerJoin(journeys, eq(journeyMembers.journeyId, journeys.id))
      .where(and(eq(journeyMembers.userId, user.id), eq(journeyMembers.status, "invited")))
      .orderBy(asc(journeys.id)),
  ]);

  const optedOut = new Set(rsvps.filter((rsvp) => rsvp.status === "no").map((rsvp) => rsvp.eventId));
  const ballotEvents = new Set(ballots.map((ballot) => ballot.eventId));
  const dateEvents = new Set(dateResponses.map((response) => response.eventId));
  const approvalEvents = new Set(approvalResponses.map((response) => response.eventId));
  const runoffEvents = new Set(runoffResponses.map((response) => response.eventId));
  const attendedEvents = new Set(attended.map((row) => row.eventId));
  const reviewedEvents = new Set(reviewed.map((row) => row.eventId));
  const ongoing = accessible.filter((event) => (event.status === "open" || event.status === "runoff") && !optedOut.has(event.id));
  const today = calendarDateInRome(now);
  const upcoming = accessible.filter((event) => event.status === "scheduled" &&
    isCalendarDate(event.chosenDate) && event.chosenDate >= today && !optedOut.has(event.id))
    .sort((a, b) => a.chosenDate!.localeCompare(b.chosenDate!) || (a.startTime ?? "23:59").localeCompare(b.startTime ?? "23:59") || a.id - b.id);
  const chosenIds = [...new Set(accessible.map((event) => event.chosenMovieId).filter((id): id is number => id !== null))];
  const chosenMovies = chosenIds.length ? await db.query.movies.findMany({ where: inArray(movies.id, chosenIds) }) : [];
  const movieById = new Map(chosenMovies.map((movie) => [movie.id, movie]));
  const movieFor = (event: Event) => event.chosenMovieId ? movieById.get(event.chosenMovieId) ?? null : null;

  const tasks: HomeTask[] = [];
  for (const event of ongoing) {
    if (event.status === "runoff") {
      if (!runoffEvents.has(event.id)) tasks.push({
        id: `runoff-${event.id}`, eventId: event.id, kind: "runoff",
        title: event.title || "Serata da decidere", detail: "C’è un pareggio: scegli fra i film al ballottaggio.",
        href: `/serate/${event.id}#ballottaggio`, label: "Vota al ballottaggio",
      });
      continue;
    }
    const filmAnswered = ballotEvents.has(event.id) || (event.movieDecisionMethod === "approval" && approvalEvents.has(event.id));
    // Empty date votes mean either “none of these dates” OR “not answered”.
    // Without a persisted submission marker we must not claim a missing answer,
    // nor keep nagging after a ballot was submitted with no available dates.
    if (!filmAnswered) tasks.push({
      id: `vote-${event.id}`, eventId: event.id, kind: "vote",
      title: event.title || "Serata da decidere",
      detail: dateEvents.has(event.id) ? "Hai indicato una disponibilità. Scegli i film che preferisci." : "Rivedi le date proposte e scegli i film che preferisci.",
      href: `/serate/${event.id}?focus=${dateEvents.has(event.id) ? "film" : "date"}`,
      label: dateEvents.has(event.id) ? "Scegli i film" : "Date e film",
    });
  }
  for (const event of accessible.filter((item) => item.status === "done")) {
    if (attendedEvents.has(event.id) && !reviewedEvents.has(event.id)) tasks.push({
      id: `review-${event.id}`, eventId: event.id, kind: "review",
      title: `Com’è stato ${movieFor(event)?.title || event.title || "il film"}?`,
      detail: "La serata è conclusa. Manca la tua pagella.",
      href: `/serate/${event.id}#pagelle`, label: "Lascia la pagella",
    });
  }
  for (const invite of circleInvites) tasks.push({
    id: `circle-${invite.id}`, kind: "circle", title: invite.title,
    detail: "Hai ricevuto un invito a questo circolo.", href: `/circoli/${invite.slug}`, label: "Vedi l’invito",
  });
  for (const invite of journeyInvites) tasks.push({
    id: `journey-${invite.id}`, kind: "journey", title: invite.title,
    detail: "Un percorso cinematografico ti aspetta. Decidi se partecipare.", href: `/percorsi/${invite.id}`, label: "Vedi l’invito",
  });

  const featuredEvent = upcoming[0] ?? ongoing.find((event) => tasks.some((task) => task.eventId === event.id)) ?? ongoing[0] ?? null;
  return {
    featured: featuredEvent ? {
      event: featuredEvent, movie: movieFor(featuredEvent),
      task: tasks.find((task) => task.eventId === featuredEvent.id) ?? null,
    } : null,
    tasks,
    watchlist: shelf.map((row) => row.movie),
  };
}
