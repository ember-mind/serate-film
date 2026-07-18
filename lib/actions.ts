"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  movies,
  watchlist,
  events,
  eventDates,
  eventMovies,
  dateVotes,
  movieVotes,
  attendance,
  ratings,
} from "@/db/schema";
import { createSession, destroySession } from "@/lib/session";
import { requireUser, requireAdmin } from "@/lib/auth";
import { movieDetails, yearOf } from "@/lib/tmdb";

// ---------- auth ----------

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Nome o password sbagliati. Riprova." };
  }
  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

// ---------- film / watchlist ----------

async function cacheMovie(tmdbId: number) {
  const existing = await db.query.movies.findFirst({ where: eq(movies.id, tmdbId) });
  if (existing) return existing;
  const d = await movieDetails(tmdbId);
  const row = {
    id: d.id,
    title: d.title,
    originalTitle: d.original_title,
    year: yearOf(d),
    posterPath: d.poster_path,
    overview: d.overview,
    runtime: d.runtime,
    genres: d.genres.map((g) => g.name).join(", "),
    voteAverage: d.vote_average ? d.vote_average.toFixed(1) : null,
  };
  await db.insert(movies).values(row).onConflictDoNothing();
  return row;
}

export async function addToWatchlist(tmdbId: number) {
  const user = await requireUser();
  await cacheMovie(tmdbId);
  await db
    .insert(watchlist)
    .values({ movieId: tmdbId, addedBy: user.id })
    .onConflictDoUpdate({
      target: watchlist.movieId,
      set: { status: "active", addedBy: user.id },
    });
  revalidatePath("/film");
  revalidatePath("/watchlist");
}

export async function removeFromWatchlist(movieId: number) {
  await requireUser();
  await db.update(watchlist).set({ status: "removed" }).where(eq(watchlist.movieId, movieId));
  revalidatePath("/watchlist");
  revalidatePath("/film");
}

// ---------- serate ----------

export async function createEvent(_prev: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const dates = formData
    .getAll("dates")
    .map((d) => String(d).trim())
    .filter(Boolean);
  const movieIds = formData.getAll("movieIds").map(Number).filter(Boolean);

  if (dates.length < 1) return { error: "Proponi almeno una data." };
  if (dates.length > 5) return { error: "Massimo 5 date." };
  if (movieIds.length < 1) return { error: "Scegli almeno un film dalla watchlist." };
  if (movieIds.length > 8) return { error: "Massimo 8 film in rosa." };

  const [event] = await db
    .insert(events)
    .values({ title, location, createdBy: user.id })
    .returning();
  await db.insert(eventDates).values(dates.map((date) => ({ eventId: event.id, date })));
  await db.insert(eventMovies).values(movieIds.map((movieId) => ({ eventId: event.id, movieId })));
  redirect(`/serate/${event.id}`);
}

export async function toggleDateVote(eventDateId: number, eventId: number) {
  const user = await requireUser();
  const existing = await db.query.dateVotes.findFirst({
    where: and(eq(dateVotes.eventDateId, eventDateId), eq(dateVotes.userId, user.id)),
  });
  if (existing) {
    await db
      .delete(dateVotes)
      .where(and(eq(dateVotes.eventDateId, eventDateId), eq(dateVotes.userId, user.id)));
  } else {
    await db.insert(dateVotes).values({ eventDateId, userId: user.id });
  }
  revalidatePath(`/serate/${eventId}`);
}

export async function toggleMovieVote(eventMovieId: number, eventId: number) {
  const user = await requireUser();
  const existing = await db.query.movieVotes.findFirst({
    where: and(eq(movieVotes.eventMovieId, eventMovieId), eq(movieVotes.userId, user.id)),
  });
  if (existing) {
    await db
      .delete(movieVotes)
      .where(and(eq(movieVotes.eventMovieId, eventMovieId), eq(movieVotes.userId, user.id)));
  } else {
    await db.insert(movieVotes).values({ eventMovieId, userId: user.id });
  }
  revalidatePath(`/serate/${eventId}`);
}

async function canManage(eventId: number) {
  const user = await requireUser();
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) throw new Error("Serata non trovata");
  if (event.createdBy !== user.id && !user.isAdmin) throw new Error("Solo chi ha creato la serata può farlo");
  return { user, event };
}

export async function closeEvent(eventId: number, formData: FormData) {
  await canManage(eventId);
  const chosenDate = String(formData.get("chosenDate") ?? "");
  const chosenMovieId = Number(formData.get("chosenMovieId"));
  if (!chosenDate || !chosenMovieId) return;
  await db
    .update(events)
    .set({ status: "scheduled", chosenDate, chosenMovieId })
    .where(eq(events.id, eventId));
  revalidatePath(`/serate/${eventId}`);
  revalidatePath("/serate");
  revalidatePath("/");
}

export async function reopenEvent(eventId: number) {
  await canManage(eventId);
  await db
    .update(events)
    .set({ status: "open", chosenDate: null, chosenMovieId: null })
    .where(eq(events.id, eventId));
  revalidatePath(`/serate/${eventId}`);
  revalidatePath("/serate");
}

export async function cancelEvent(eventId: number) {
  await canManage(eventId);
  await db.update(events).set({ status: "cancelled" }).where(eq(events.id, eventId));
  revalidatePath("/serate");
  redirect("/serate");
}

export async function markWatched(eventId: number, formData: FormData) {
  const { event } = await canManage(eventId);
  const attendeeIds = formData.getAll("attendees").map(Number).filter(Boolean);
  await db.delete(attendance).where(eq(attendance.eventId, eventId));
  if (attendeeIds.length > 0) {
    await db
      .insert(attendance)
      .values(attendeeIds.map((userId) => ({ eventId, userId })))
      .onConflictDoNothing();
  }
  await db.update(events).set({ status: "done" }).where(eq(events.id, eventId));
  if (event.chosenMovieId) {
    await db
      .update(watchlist)
      .set({ status: "watched" })
      .where(eq(watchlist.movieId, event.chosenMovieId));
  }
  revalidatePath(`/serate/${eventId}`);
  revalidatePath("/storico");
  revalidatePath("/watchlist");
  revalidatePath("/");
}

export async function rateEvent(eventId: number, formData: FormData) {
  const user = await requireUser();
  const stars = Number(formData.get("stars"));
  const comment = String(formData.get("comment") ?? "").trim() || null;
  if (stars < 1 || stars > 5) return;
  await db
    .insert(ratings)
    .values({ eventId, userId: user.id, stars, comment })
    .onConflictDoUpdate({
      target: [ratings.eventId, ratings.userId],
      set: { stars, comment },
    });
  revalidatePath(`/serate/${eventId}`);
  revalidatePath("/storico");
}

export async function saveEventNotes(eventId: number, formData: FormData) {
  await canManage(eventId);
  const notes = String(formData.get("notes") ?? "").trim() || null;
  await db.update(events).set({ notes }).where(eq(events.id, eventId));
  revalidatePath(`/serate/${eventId}`);
  revalidatePath("/storico");
}

// ---------- admin ----------

export async function createUser(_prev: { error?: string } | undefined, formData: FormData) {
  await requireAdmin();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const isAdmin = formData.get("isAdmin") === "on";
  if (!username || !name || password.length < 6) {
    return { error: "Servono username, nome e una password di almeno 6 caratteri." };
  }
  const existing = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (existing) return { error: "Username già in uso." };
  await db.insert(users).values({
    username,
    name,
    passwordHash: await bcrypt.hash(password, 10),
    isAdmin,
  });
  revalidatePath("/admin");
  return {};
}

export async function resetPassword(userId: number, formData: FormData) {
  await requireAdmin();
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return;
  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(password, 10) })
    .where(eq(users.id, userId));
  revalidatePath("/admin");
}

export async function deleteUser(userId: number) {
  const admin = await requireAdmin();
  if (admin.id === userId) return;
  const voted = await db.query.dateVotes.findFirst({ where: eq(dateVotes.userId, userId) });
  const attended = await db.query.attendance.findFirst({ where: eq(attendance.userId, userId) });
  if (voted || attended) return; // storico da preservare: non si elimina
  await db.delete(movieVotes).where(eq(movieVotes.userId, userId));
  await db.delete(ratings).where(eq(ratings.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/admin");
}
