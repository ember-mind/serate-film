"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  userFriends,
  movies,
  watchlist,
  events,
  eventDates,
  eventContributions,
  eventInviteLinks,
  eventInvitees,
  eventMovies,
  eventNeeds,
  dateVotes,
  movieVotes,
  runoffVotes,
  attendance,
  ratings,
  reviewLikes,
  notifications,
  suggestions,
  userSeenMovies,
} from "@/db/schema";
import { createSession, destroySession } from "@/lib/session";
import { requireUser, requireAdmin } from "@/lib/auth";
import { canSee, inviteesByEvent } from "@/lib/invites";
import { sanitizeNext } from "@/lib/nav";
import { fetchMovieMetadata } from "@/lib/movie-metadata.mjs";

// ---------- auth ----------

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Nome o password sbagliati. Riprova." };
  }
  await createSession(user.id);
  redirect(sanitizeNext(String(formData.get("next") ?? "/")));
}

export async function signupWithInvite(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  const token = String(formData.get("token") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const invite = await db.query.eventInviteLinks.findFirst({
    where: eq(eventInviteLinks.token, token),
  });
  const event = invite
    ? await db.query.events.findFirst({ where: eq(events.id, invite.eventId) })
    : null;
  if (!invite || !event || event.status === "cancelled") {
    return { error: "Invito non valido o serata annullata." };
  }
  if (!name || name.length > 60) return { error: "Inserisci il tuo nome." };
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
    return { error: "Username: 3–30 caratteri, solo lettere, numeri, punto, trattino." };
  }
  if (password.length < 8) return { error: "Password di almeno 8 caratteri." };
  if (password !== passwordConfirm) return { error: "Le password non coincidono." };

  const existing = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (existing) return { error: "Username già in uso. Accedi se è il tuo." };

  let newUser: typeof users.$inferSelect;
  try {
    [newUser] = await db
      .insert(users)
      .values({
        username,
        name,
        passwordHash: await bcrypt.hash(password, 10),
      })
      .returning();
  } catch {
    return { error: "Username già in uso. Provane un altro." };
  }

  const currentInvitees = await db.query.eventInvitees.findMany({
    where: eq(eventInvitees.eventId, event.id),
  });
  // Nessuna riga indica serata pubblica: aggiungere una riga la renderebbe
  // involontariamente privata. Per serate riservate, invece, il link ammette
  // il nuovo account alla lista.
  if (currentInvitees.length > 0) {
    await db
      .insert(eventInvitees)
      .values({ eventId: event.id, userId: newUser.id })
      .onConflictDoNothing();
  }

  await createSession(newUser.id);
  revalidatePath(`/serate/${event.id}`);
  redirect(`/serate/${event.id}?benvenuto=1`);
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

// ---------- film / watchlist ----------

export async function createMovie(_prev: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const year = yearRaw ? Number(yearRaw) : null;
  const director = String(formData.get("director") ?? "").trim() || null;
  const actors = String(formData.get("actors") ?? "").trim() || null;
  const genres = String(formData.get("genres") ?? "").trim() || null;
  const runtimeRaw = String(formData.get("runtime") ?? "").trim();
  const runtime = runtimeRaw ? Number(runtimeRaw) : null;
  const synopsis = String(formData.get("synopsis") ?? "").trim().slice(0, 1000) || null;

  if (!title) return { error: "Il titolo serve." };
  if (year !== null && (!Number.isInteger(year) || year < 1888 || year > 2100)) {
    return { error: "Anno non valido." };
  }
  if (runtime !== null && (!Number.isInteger(runtime) || runtime < 1 || runtime > 600)) {
    return { error: "Durata non valida (minuti)." };
  }

  const [movie] = await db
    .insert(movies)
    .values({ title, year, director, actors, genres, runtime, synopsis, addedBy: user.id })
    .onConflictDoNothing()
    .returning();
  if (!movie) return { error: "Film già in catalogo (stesso titolo e anno)." };

  // chi aggiunge un film a mano lo vuole quasi sempre in watchlist
  await db.insert(watchlist).values({ movieId: movie.id, addedBy: user.id }).onConflictDoNothing();

  // L'arricchimento internet è best effort: il film resta valido anche se una fonte non risponde.
  try {
    const metadata = await fetchMovieMetadata({ title, year });
    await db
      .update(movies)
      .set({
        wikidataId: metadata.wikidataId,
        imdbId: metadata.imdbId,
        rottenTomatoesId: metadata.rottenTomatoesId,
        youtubeTrailerId: metadata.youtubeTrailerId,
        trailerTitle: metadata.trailerTitle,
        trailerChannel: metadata.trailerChannel,
        imdbRating: metadata.imdbRating,
        rottenTomatoesScore: metadata.rottenTomatoesScore,
        awards: metadata.awards.length ? JSON.stringify(metadata.awards) : null,
        metadataUpdatedAt: metadata.metadataUpdatedAt,
      })
      .where(eq(movies.id, movie.id));
  } catch (error) {
    console.warn(`Metadati non disponibili per ${title}:`, error);
  }

  revalidatePath("/film");
  revalidatePath("/watchlist");
  return {};
}

export async function createSuggestion(_prev: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  const user = await requireUser();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Scrivi almeno un titolo, anche vago." };
  if (text.length > 300) return { error: "Massimo 300 caratteri." };
  await db.insert(suggestions).values({ text, suggestedBy: user.id });
  revalidatePath("/film");
  return { ok: true };
}

export async function dismissSuggestion(id: number) {
  await requireAdmin();
  await db.update(suggestions).set({ status: "rejected" }).where(eq(suggestions.id, id));
  revalidatePath("/film");
}

export async function addToWatchlist(movieId: number) {
  const user = await requireUser();
  await db
    .insert(watchlist)
    .values({ movieId, addedBy: user.id })
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

export async function markMovieSeen(movieId: number) {
  const user = await requireUser();
  const movie = await db.query.movies.findFirst({ where: eq(movies.id, movieId) });
  if (!movie) return;

  await db
    .insert(userSeenMovies)
    .values({ userId: user.id, movieId })
    .onConflictDoNothing();

  revalidatePath("/film");
  revalidatePath("/film/[slug]", "page");
  revalidatePath("/io");
}

export async function unmarkMovieSeen(movieId: number) {
  const user = await requireUser();
  await db
    .delete(userSeenMovies)
    .where(and(eq(userSeenMovies.userId, user.id), eq(userSeenMovies.movieId, movieId)));

  revalidatePath("/film");
  revalidatePath("/film/[slug]", "page");
  revalidatePath("/io");
}

// ---------- amici ----------

export async function saveFriends(formData: FormData) {
  const user = await requireUser();
  const allUsers = await db.query.users.findMany();
  const validIds = new Set(
    allUsers.filter((person) => person.id !== user.id).map((person) => person.id)
  );
  const friendIds = [
    ...new Set(
      formData
        .getAll("friendIds")
        .map(Number)
        .filter((id) => validIds.has(id))
    ),
  ];

  db.transaction((tx) => {
    tx.delete(userFriends).where(eq(userFriends.userId, user.id)).run();
    if (friendIds.length > 0) {
      tx.insert(userFriends)
        .values(
          friendIds.map((friendUserId) => ({
            userId: user.id,
            friendUserId,
          }))
        )
        .run();
    }
  });

  revalidatePath("/io");
  revalidatePath("/io/amici");
  revalidatePath("/serate/nuova");
  redirect("/io/amici?salvati=1");
}

// ---------- serate ----------

export async function createEvent(_prev: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const startTime = String(formData.get("startTime") ?? "").trim() || null;
  const dates = formData
    .getAll("dates")
    .map((d) => String(d).trim())
    .filter(Boolean);
  const movieIds = formData.getAll("movieIds").map(Number).filter(Boolean);

  if (dates.length < 1) return { error: "Proponi almeno una data." };
  if (dates.length > 5) return { error: "Massimo 5 date." };
  if (movieIds.length < 1) return { error: "Scegli almeno un film dalla watchlist." };
  if (movieIds.length > 8) return { error: "Massimo 8 film in rosa." };

  const rawVisibility = String(formData.get("visibility") ?? "friends");
  const visibility =
    rawVisibility === "public" || rawVisibility === "private" || rawVisibility === "friends"
      ? rawVisibility
      : "friends";
  let inviteeIds: number[] = [];

  if (visibility === "friends") {
    const friends = await db.query.userFriends.findMany({
      where: eq(userFriends.userId, user.id),
    });
    inviteeIds = friends.map((friend) => friend.friendUserId);
  } else if (visibility === "private") {
    const allUsers = await db.query.users.findMany();
    const validIds = new Set(allUsers.map((person) => person.id));
    inviteeIds = [
      ...new Set(
        formData
          .getAll("invitees")
          .map(Number)
          .filter((id) => validIds.has(id))
      ),
    ];
  }
  const restricted = visibility !== "public";

  const [event] = await db
    .insert(events)
    .values({ title, location, startTime, createdBy: user.id })
    .returning();
  await db.insert(eventDates).values(dates.map((date) => ({ eventId: event.id, date })));
  await db.insert(eventMovies).values(movieIds.map((movieId) => ({ eventId: event.id, movieId })));
  if (restricted) {
    const withCreator = [...new Set([...inviteeIds, user.id])];
    await db
      .insert(eventInvitees)
      .values(withCreator.map((userId) => ({ eventId: event.id, userId })));
  }
  await db
    .insert(eventInviteLinks)
    .values({ eventId: event.id, token: newInviteToken() });
  redirect(`/serate/${event.id}`);
}

function newInviteToken() {
  return randomBytes(24).toString("base64url");
}

export async function createEventInviteLink(eventId: number) {
  await canManage(eventId);
  await db
    .insert(eventInviteLinks)
    .values({ eventId, token: newInviteToken() })
    .onConflictDoNothing();
  revalidatePath(`/serate/${eventId}`);
}

export async function regenerateEventInviteLink(eventId: number) {
  await canManage(eventId);
  await db
    .update(eventInviteLinks)
    .set({ token: newInviteToken(), createdAt: new Date().toISOString() })
    .where(eq(eventInviteLinks.eventId, eventId));
  revalidatePath(`/serate/${eventId}`);
}

export async function acceptEventInvite(token: string) {
  const user = await requireUser();
  const invite = await db.query.eventInviteLinks.findFirst({
    where: eq(eventInviteLinks.token, token),
  });
  const event = invite
    ? await db.query.events.findFirst({ where: eq(events.id, invite.eventId) })
    : null;
  if (!invite || !event || event.status === "cancelled") redirect("/serate");

  const currentInvitees = await db.query.eventInvitees.findMany({
    where: eq(eventInvitees.eventId, event.id),
  });
  if (currentInvitees.length > 0) {
    await db
      .insert(eventInvitees)
      .values({ eventId: event.id, userId: user.id })
      .onConflictDoNothing();
  }
  revalidatePath(`/serate/${event.id}`);
  redirect(`/serate/${event.id}?invito=accettato`);
}

export async function saveEventContribution(eventId: number, formData: FormData) {
  const user = await requireUser();
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event || event.status === "done" || event.status === "cancelled") return;
  const invitees = (await inviteesByEvent([eventId])).get(eventId);
  if (!canSee(event, invitees, user)) return;

  const item = String(formData.get("item") ?? "").trim().slice(0, 160);
  if (!item) {
    await db
      .delete(eventContributions)
      .where(
        and(
          eq(eventContributions.eventId, eventId),
          eq(eventContributions.userId, user.id)
        )
      );
  } else {
    await db
      .insert(eventContributions)
      .values({ eventId, userId: user.id, item })
      .onConflictDoUpdate({
        target: [eventContributions.eventId, eventContributions.userId],
        set: { item, updatedAt: new Date().toISOString() },
      });
  }
  revalidatePath(`/serate/${eventId}`);
}

export async function addEventNeed(eventId: number, formData: FormData) {
  const { event } = await canManage(eventId);
  if (event.status === "done" || event.status === "cancelled") return;

  const item = String(formData.get("item") ?? "").trim().slice(0, 80);
  const quantity = String(formData.get("quantity") ?? "").trim().slice(0, 40) || null;
  if (!item) return;

  const existing = await db.query.eventNeeds.findMany({
    where: eq(eventNeeds.eventId, eventId),
  });
  if (existing.some((need) => need.item.toLocaleLowerCase("it") === item.toLocaleLowerCase("it"))) {
    return;
  }

  await db.insert(eventNeeds).values({ eventId, item, quantity }).onConflictDoNothing();
  revalidatePath(`/serate/${eventId}`);
}

export async function toggleEventNeedClaim(eventId: number, needId: number) {
  const user = await requireUser();
  const [event, need] = await Promise.all([
    db.query.events.findFirst({ where: eq(events.id, eventId) }),
    db.query.eventNeeds.findFirst({
      where: and(eq(eventNeeds.id, needId), eq(eventNeeds.eventId, eventId)),
    }),
  ]);
  if (!event || !need || event.status === "done" || event.status === "cancelled") return;
  const invitees = (await inviteesByEvent([eventId])).get(eventId);
  if (!canSee(event, invitees, user)) return;

  if (need.claimedBy === user.id) {
    await db
      .update(eventNeeds)
      .set({ claimedBy: null })
      .where(and(eq(eventNeeds.id, needId), eq(eventNeeds.claimedBy, user.id)));
  } else if (need.claimedBy === null) {
    await db
      .update(eventNeeds)
      .set({ claimedBy: user.id })
      .where(and(eq(eventNeeds.id, needId), isNull(eventNeeds.claimedBy)));
  }
  revalidatePath(`/serate/${eventId}`);
}

export async function deleteEventNeed(eventId: number, needId: number) {
  const { event } = await canManage(eventId);
  if (event.status === "done" || event.status === "cancelled") return;
  await db
    .delete(eventNeeds)
    .where(and(eq(eventNeeds.id, needId), eq(eventNeeds.eventId, eventId)));
  revalidatePath(`/serate/${eventId}`);
}

// Un invitato propone un film in più per la rosa di una serata aperta.
export async function proposeEventMovie(
  eventId: number,
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  const user = await requireUser();
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event || event.status !== "open") return { error: "Le votazioni sono chiuse." };
  const invitees = (await inviteesByEvent([eventId])).get(eventId);
  if (!canSee(event, invitees, user)) return { error: "Serata su invito." };

  const movieId = Number(formData.get("movieId"));
  const movie = await db.query.movies.findFirst({ where: eq(movies.id, movieId) });
  if (!movie) return { error: "Scegli un film dal catalogo." };

  const rosa = await db.query.eventMovies.findMany({ where: eq(eventMovies.eventId, eventId) });
  if (rosa.some((em) => em.movieId === movieId)) return { error: "È già in rosa." };
  if (rosa.length >= 8) return { error: "La rosa è piena (max 8 film)." };

  await db.insert(eventMovies).values({ eventId, movieId, addedBy: user.id });
  revalidatePath(`/serate/${eventId}`);
  return { ok: true };
}

// Un invitato propone una data in più per una serata aperta.
export async function proposeEventDate(
  eventId: number,
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  const user = await requireUser();
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event || event.status !== "open") return { error: "Le votazioni sono chiuse." };
  const invitees = (await inviteesByEvent([eventId])).get(eventId);
  if (!canSee(event, invitees, user)) return { error: "Serata su invito." };

  const date = String(formData.get("date") ?? "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const [y, mo, d] = m ? m.slice(1).map(Number) : [0, 0, 0];
  const asDate = m ? new Date(Date.UTC(y, mo - 1, d)) : null;
  const valid =
    asDate && asDate.getUTCFullYear() === y && asDate.getUTCMonth() === mo - 1 && asDate.getUTCDate() === d;
  if (!valid) return { error: "Data non valida." };
  const todayStr = new Date().toISOString().slice(0, 10);
  if (date < todayStr) return { error: "La data è già passata." };

  const existing = await db.query.eventDates.findMany({ where: eq(eventDates.eventId, eventId) });
  if (existing.some((d) => d.date === date)) return { error: "È già tra le date proposte." };
  if (existing.length >= 5) return { error: "Massimo 5 date." };

  await db.insert(eventDates).values({ eventId, date });
  revalidatePath(`/serate/${eventId}`);
  return { ok: true };
}

// Scheda unica: sostituisce in blocco i voti dell'utente su date e film della serata.
export async function submitVotes(eventId: number, formData: FormData) {
  const user = await requireUser();
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event || event.status !== "open") return;
  const invitees = (await inviteesByEvent([eventId])).get(eventId);
  if (!canSee(event, invitees, user)) return;

  const pickedDates = new Set(formData.getAll("dateIds").map(Number));
  const pickedMovies = new Set(formData.getAll("movieIds").map(Number));

  const dates = await db.query.eventDates.findMany({ where: eq(eventDates.eventId, eventId) });
  const ems = await db.query.eventMovies.findMany({ where: eq(eventMovies.eventId, eventId) });

  if (dates.length > 0) {
    await db.delete(dateVotes).where(
      and(
        inArray(
          dateVotes.eventDateId,
          dates.map((d) => d.id)
        ),
        eq(dateVotes.userId, user.id)
      )
    );
    const sel = dates.filter((d) => pickedDates.has(d.id));
    if (sel.length > 0) {
      await db.insert(dateVotes).values(sel.map((d) => ({ eventDateId: d.id, userId: user.id })));
    }
  }
  if (ems.length > 0) {
    await db.delete(movieVotes).where(
      and(
        inArray(
          movieVotes.eventMovieId,
          ems.map((m) => m.id)
        ),
        eq(movieVotes.userId, user.id)
      )
    );
    const sel = ems.filter((m) => pickedMovies.has(m.id));
    if (sel.length > 0) {
      await db.insert(movieVotes).values(sel.map((m) => ({ eventMovieId: m.id, userId: user.id })));
    }
  }
  revalidatePath(`/serate/${eventId}`);
}

// Avvia il ballottaggio: pareggio tra i film più approvati nel primo turno.
export async function startRunoff(eventId: number) {
  const { event } = await canManage(eventId);
  if (event.status !== "open") return { error: "Le votazioni non sono aperte." };

  const ems = await db.query.eventMovies.findMany({ where: eq(eventMovies.eventId, eventId) });
  if (ems.length === 0) return { error: "Non c'è un pareggio da risolvere." };
  const votes = await db.query.movieVotes.findMany({
    where: inArray(
      movieVotes.eventMovieId,
      ems.map((em) => em.id)
    ),
  });
  const counts = new Map<number, number>(ems.map((em) => [em.id, 0]));
  for (const v of votes) counts.set(v.eventMovieId, (counts.get(v.eventMovieId) ?? 0) + 1);
  const max = Math.max(...counts.values());
  const tied = ems.filter((em) => counts.get(em.id) === max && max > 0);
  if (tied.length < 2) return { error: "Non c'è un pareggio da risolvere." };

  await db.delete(runoffVotes).where(
    inArray(
      runoffVotes.eventMovieId,
      ems.map((em) => em.id)
    )
  );
  const tiedIds = tied.map((em) => em.id);
  const restIds = ems.filter((em) => !tiedIds.includes(em.id)).map((em) => em.id);
  await db.update(eventMovies).set({ inRunoff: true }).where(inArray(eventMovies.id, tiedIds));
  if (restIds.length > 0) {
    await db.update(eventMovies).set({ inRunoff: false }).where(inArray(eventMovies.id, restIds));
  }
  await db.update(events).set({ status: "runoff" }).where(eq(events.id, eventId));
  revalidatePath(`/serate/${eventId}`);
  return { ok: true };
}

// Scheda del ballottaggio: scelta singola tra i soli film in pareggio.
export async function submitRunoffVote(eventId: number, formData: FormData) {
  const user = await requireUser();
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event || event.status !== "runoff") return;
  const invitees = (await inviteesByEvent([eventId])).get(eventId);
  if (!canSee(event, invitees, user)) return;

  const eventMovieId = Number(formData.get("eventMovieId"));
  const ems = await db.query.eventMovies.findMany({ where: eq(eventMovies.eventId, eventId) });
  const chosen = ems.find((em) => em.id === eventMovieId && em.inRunoff);
  if (!chosen) return;

  await db.delete(runoffVotes).where(
    and(
      inArray(
        runoffVotes.eventMovieId,
        ems.map((em) => em.id)
      ),
      eq(runoffVotes.userId, user.id)
    )
  );
  await db.insert(runoffVotes).values({ eventMovieId, userId: user.id });
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
  const ems = await db.query.eventMovies.findMany({ where: eq(eventMovies.eventId, eventId) });
  if (ems.length > 0) {
    await db.delete(runoffVotes).where(
      inArray(
        runoffVotes.eventMovieId,
        ems.map((em) => em.id)
      )
    );
    await db.update(eventMovies).set({ inRunoff: false }).where(eq(eventMovies.eventId, eventId));
  }
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
  const { user, event } = await canManage(eventId);
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
      .insert(watchlist)
      .values({ movieId: event.chosenMovieId, addedBy: user.id, status: "watched" })
      .onConflictDoUpdate({
        target: watchlist.movieId,
        set: { status: "watched" },
      });
  }
  revalidatePath(`/serate/${eventId}`);
  revalidatePath("/storico");
  revalidatePath("/watchlist");
  revalidatePath("/film");
  revalidatePath("/film/[slug]", "page");
  revalidatePath("/io");
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
  if (!comment) {
    await db
      .delete(reviewLikes)
      .where(and(eq(reviewLikes.eventId, eventId), eq(reviewLikes.reviewUserId, user.id)));
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.type, "review_like"),
          eq(notifications.eventId, eventId),
          eq(notifications.userId, user.id)
        )
      );
  }
  revalidatePath(`/serate/${eventId}`);
  revalidatePath("/storico");
}

export async function toggleReviewLike(eventId: number, reviewUserId: number) {
  const user = await requireUser();
  if (!Number.isInteger(eventId) || !Number.isInteger(reviewUserId) || reviewUserId === user.id) {
    return;
  }

  const [event, review] = await Promise.all([
    db.query.events.findFirst({ where: eq(events.id, eventId) }),
    db.query.ratings.findFirst({
      where: and(eq(ratings.eventId, eventId), eq(ratings.userId, reviewUserId)),
    }),
  ]);
  if (!event || event.status !== "done" || !review?.comment) return;

  const invitees = (await inviteesByEvent([eventId])).get(eventId);
  if (!canSee(event, invitees, user)) return;

  const existing = await db.query.reviewLikes.findFirst({
    where: and(
      eq(reviewLikes.eventId, eventId),
      eq(reviewLikes.reviewUserId, reviewUserId),
      eq(reviewLikes.userId, user.id)
    ),
  });

  db.transaction((tx) => {
    if (existing) {
      tx.delete(reviewLikes)
        .where(
          and(
            eq(reviewLikes.eventId, eventId),
            eq(reviewLikes.reviewUserId, reviewUserId),
            eq(reviewLikes.userId, user.id)
          )
        )
        .run();
      tx.delete(notifications)
        .where(
          and(
            eq(notifications.type, "review_like"),
            eq(notifications.eventId, eventId),
            eq(notifications.userId, reviewUserId),
            eq(notifications.actorUserId, user.id)
          )
        )
        .run();
    } else {
      tx.insert(reviewLikes)
        .values({ eventId, reviewUserId, userId: user.id })
        .run();
      tx.insert(notifications)
        .values({
          userId: reviewUserId,
          actorUserId: user.id,
          type: "review_like",
          eventId,
        })
        .onConflictDoUpdate({
          target: [
            notifications.userId,
            notifications.actorUserId,
            notifications.type,
            notifications.eventId,
          ],
          set: { readAt: null, createdAt: new Date().toISOString() },
        })
        .run();
    }
  });

  revalidatePath(`/serate/${eventId}`);
  revalidatePath("/notifiche");
}

export async function openNotifications() {
  const user = await requireUser();
  await db
    .update(notifications)
    .set({ readAt: new Date().toISOString() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
  revalidatePath("/", "layout");
  revalidatePath("/notifiche");
  redirect("/notifiche");
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
  await db
    .delete(reviewLikes)
    .where(or(eq(reviewLikes.userId, userId), eq(reviewLikes.reviewUserId, userId)));
  await db
    .delete(notifications)
    .where(or(eq(notifications.userId, userId), eq(notifications.actorUserId, userId)));
  await db.delete(ratings).where(eq(ratings.userId, userId));
  await db.delete(userSeenMovies).where(eq(userSeenMovies.userId, userId));
  await db
    .delete(userFriends)
    .where(or(eq(userFriends.userId, userId), eq(userFriends.friendUserId, userId)));
  await db.delete(eventContributions).where(eq(eventContributions.userId, userId));
  await db.update(eventNeeds).set({ claimedBy: null }).where(eq(eventNeeds.claimedBy, userId));
  await db.delete(eventInvitees).where(eq(eventInvitees.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/admin");
}
