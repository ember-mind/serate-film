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

// Rubrica personale: la relazione è direzionale e non richiede accettazione.
export const userFriends = sqliteTable(
  "user_friends",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    friendUserId: integer("friend_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.friendUserId] })]
);

// Catalogo nostro: dati editoriali locali + snapshot di metadati esterni.
// La navigazione legge sempre SQLite; l'aggiornamento internet è separato.
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
    synopsis: text("synopsis"), // incipit da it.wikipedia, 2-3 frasi (fetch-synopses.mjs)
    synopsisSource: text("synopsis_source"), // URL della voce, per attribuzione CC BY-SA
    wikidataId: text("wikidata_id"),
    imdbId: text("imdb_id"),
    rottenTomatoesId: text("rotten_tomatoes_id"),
    youtubeTrailerId: text("youtube_trailer_id"),
    trailerTitle: text("trailer_title"),
    trailerChannel: text("trailer_channel"),
    imdbRating: text("imdb_rating"), // valore sorgente, per esempio "8.8/10"
    rottenTomatoesScore: text("rotten_tomatoes_score"), // Tomatometer, per esempio "87%"
    awards: text("awards"), // array JSON dei premi vinti, etichette Wikidata
    metadataUpdatedAt: text("metadata_updated_at"),
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

// Una serata: open (si vota) → runoff (pareggio, si ballotta) → scheduled (data+film fissati) → done (vista) | cancelled
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  status: text("status", { enum: ["open", "runoff", "scheduled", "done", "cancelled"] })
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
  startTime: text("start_time"),
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

// Link-capability per invitare nuovi partecipanti a una singola serata.
// Il token è lungo e casuale: chi possiede il link può chiedere di entrare.
export const eventInviteLinks = sqliteTable(
  "event_invite_links",
  {
    eventId: integer("event_id")
      .primaryKey()
      .references(() => events.id),
    token: text("token").notNull().unique(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  }
);

// Cosa porta ciascun partecipante. Una promessa per persona, sempre modificabile
// fino alla conclusione della serata.
export const eventContributions = sqliteTable(
  "event_contributions",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    item: text("item").notNull(),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })]
);

// Checklist preparata dall'organizzatore. Un bisogno può essere preso in carico
// da un solo partecipante alla volta.
export const eventNeeds = sqliteTable(
  "event_needs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    item: text("item").notNull(),
    quantity: text("quantity"),
    claimedBy: integer("claimed_by").references(() => users.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [uniqueIndex("event_needs_event_item_unique").on(t.eventId, t.item)]
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
  addedBy: integer("added_by").references(() => users.id), // null = rosa iniziale del creatore
  inRunoff: integer("in_runoff", { mode: "boolean" }).notNull().default(false),
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

// Ballottaggio: scelta singola tra i film in pareggio. La riga esiste = "questa la mia scelta"
export const runoffVotes = sqliteTable(
  "runoff_votes",
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

// Apprezzamenti sui commenti delle pagelle. Un membro non può duplicare il proprio like.
export const reviewLikes = sqliteTable(
  "review_likes",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    reviewUserId: integer("review_user_id")
      .notNull()
      .references(() => users.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.reviewUserId, t.userId] })]
);

// Avvisi personali in-app. readAt nullo = notifica ancora in sospeso.
export const notifications = sqliteTable(
  "notifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    actorUserId: integer("actor_user_id")
      .notNull()
      .references(() => users.id),
    type: text("type", { enum: ["review_like"] }).notNull(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    readAt: text("read_at"),
  },
  (t) => [
    uniqueIndex("notifications_review_like_unique").on(
      t.userId,
      t.actorUserId,
      t.type,
      t.eventId
    ),
  ]
);

// Film segnati manualmente come visti da un membro.
// Le visioni fatte col club restano derivate da attendance + events:
// così una correzione delle presenze aggiorna automaticamente anche la cineteca personale.
export const userSeenMovies = sqliteTable(
  "user_seen_movies",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    movieId: integer("movie_id")
      .notNull()
      .references(() => movies.id),
    watchedAt: text("watched_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.movieId] })]
);
