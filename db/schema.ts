import { sqliteTable, text, integer, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Catalogo nostro: fatti puri (titolo, anno, regista, attori). Niente API esterne.
export const movies = sqliteTable(
  "movies",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    year: integer("year"),
    director: text("director"),
    actors: text("actors"),
    genres: text("genres"),
    runtime: integer("runtime"), // minuti
    posterUrl: text("poster_url"), // Wikimedia Commons, quando trovato (fetch-commons-posters.mjs)
    posterCredit: text("poster_credit"), // "Autore, Licenza" per attribuzione CC
    addedBy: integer("added_by").references(() => users.id), // null = seed iniziale
  },
  (t) => [uniqueIndex("movies_title_year_unique").on(t.title, t.year)]
);

export const watchlist = sqliteTable("watchlist", {
  movieId: integer("movie_id")
    .primaryKey()
    .references(() => movies.id),
  addedBy: integer("added_by")
    .notNull()
    .references(() => users.id),
  addedAt: text("added_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  status: text("status", { enum: ["active", "watched", "removed"] })
    .notNull()
    .default("active"),
});

// Suggerimenti liberi ("quel film con De Niro sul jazz…"): li evade l'AI in un secondo momento.
export const suggestions = sqliteTable("suggestions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  suggestedBy: integer("suggested_by")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  status: text("status", { enum: ["pending", "added", "rejected"] })
    .notNull()
    .default("pending"),
  movieId: integer("movie_id").references(() => movies.id),
});

// Una serata: open (si vota) → scheduled (data+film fissati) → done (vista) | cancelled
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  status: text("status", { enum: ["open", "scheduled", "done", "cancelled"] })
    .notNull()
    .default("open"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  chosenDate: text("chosen_date"),
  chosenMovieId: integer("chosen_movie_id").references(() => movies.id),
  location: text("location"),
  notes: text("notes"),
});

// Inviti: nessuna riga per l'evento = serata aperta a tutto il club.
// Righe presenti = solo gli invitati (più chi l'ha creata e gli admin) la vedono e votano.
export const eventInvitees = sqliteTable(
  "event_invitees",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })]
);

export const eventDates = sqliteTable("event_dates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  date: text("date").notNull(), // YYYY-MM-DD
});

export const eventMovies = sqliteTable("event_movies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  movieId: integer("movie_id")
    .notNull()
    .references(() => movies.id),
});

// Sì/No sulla data: la riga esiste = "ci sono"
export const dateVotes = sqliteTable(
  "date_votes",
  {
    eventDateId: integer("event_date_id")
      .notNull()
      .references(() => eventDates.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.eventDateId, t.userId] })]
);

// Approval voting: la riga esiste = "questo film mi va bene"
export const movieVotes = sqliteTable(
  "movie_votes",
  {
    eventMovieId: integer("event_movie_id")
      .notNull()
      .references(() => eventMovies.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.eventMovieId, t.userId] })]
);

export const attendance = sqliteTable(
  "attendance",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })]
);

// Stelline post-visione (1-5) + commento
export const ratings = sqliteTable(
  "ratings",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    stars: integer("stars").notNull(),
    comment: text("comment"),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })]
);
