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

// Profilo pubblico opzionale. I default sono volutamente privati.
export const userProfiles = sqliteTable(
  "user_profiles",
  {
    userId: integer("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    bio: text("bio"),
    favoriteGenres: text("favorite_genres"),
    visibility: text("visibility", { enum: ["private", "circles", "public"] })
      .notNull()
      .default("private"),
    discoverable: integer("discoverable", { mode: "boolean" }).notNull().default(false),
    showStats: integer("show_stats", { mode: "boolean" }).notNull().default(false),
    allowMentions: integer("allow_mentions", { mode: "boolean" }).notNull().default(true),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  }
);

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

// Gruppi persistenti. "Club" resta l'installazione intera; un gruppo creato
// dagli utenti si chiama Circolo.
export const circles = sqliteTable(
  "circles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id),
    visibility: text("visibility", { enum: ["private", "unlisted", "public"] })
      .notNull()
      .default("private"),
    joinPolicy: text("join_policy", { enum: ["invite", "request", "open"] })
      .notNull()
      .default("invite"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  }
);

export const circleMembers = sqliteTable(
  "circle_members",
  {
    circleId: integer("circle_id")
      .notNull()
      .references(() => circles.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "moderator", "member"] })
      .notNull()
      .default("member"),
    status: text("status", { enum: ["invited", "requested", "active"] })
      .notNull()
      .default("active"),
    invitedBy: integer("invited_by").references(() => users.id),
    joinedAt: text("joined_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [primaryKey({ columns: [t.circleId, t.userId] })]
);

export const circleFollows = sqliteTable(
  "circle_follows",
  {
    circleId: integer("circle_id")
      .notNull()
      .references(() => circles.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [primaryKey({ columns: [t.circleId, t.userId] })]
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

// Snapshot editoriale della disponibilità per territorio. Nessun dato viene
// letto live dal provider durante la navigazione.
export const movieAvailability = sqliteTable(
  "movie_availability",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    movieId: integer("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    country: text("country").notNull().default("IT"),
    provider: text("provider").notNull(),
    type: text("type", { enum: ["subscription", "rent", "buy", "cinema", "free"] }).notNull(),
    url: text("url"),
    price: text("price"),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    uniqueIndex("movie_availability_unique").on(
      t.movieId,
      t.country,
      t.provider,
      t.type
    ),
  ]
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
  circleId: integer("circle_id").references(() => circles.id),
  // Mai inferire la privacy dall'assenza di invitati.
  access: text("access", { enum: ["invite_only", "circle", "club", "public"] })
    .notNull()
    .default("club"),
  discoverable: integer("discoverable", { mode: "boolean" }).notNull().default(false),
  viewingMode: text("viewing_mode", {
    enum: ["in_person", "youtube", "watch_along", "licensed_public"],
  })
    .notNull()
    .default("in_person"),
  rsvpDeadline: text("rsvp_deadline"),
  votingDeadline: text("voting_deadline"),
  movieDecisionMethod: text("movie_decision_method", { enum: ["approval", "ranked"] })
    .notNull()
    .default("ranked"),
});

// Inviti espliciti e capability-link. La privacy non viene mai inferita
// dall'assenza di righe: la fonte di verità è events.access.
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

export const eventRsvps = sqliteTable(
  "event_rsvps",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["yes", "maybe", "no"] }).notNull(),
    guestCount: integer("guest_count").notNull().default(0),
    note: text("note"),
    respondedAt: text("responded_at")
      .notNull()
      .default(sql`(datetime('now'))`),
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

// Scheda a podio. Una persona invia una sola scheda per serata; ogni film
// scelto occupa un rango unico. `veto` segnala "non lo vedrei".
export const movieBallots = sqliteTable(
  "movie_ballots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    submittedAt: text("submitted_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [uniqueIndex("movie_ballots_event_user_unique").on(t.eventId, t.userId)]
);

export const movieBallotItems = sqliteTable(
  "movie_ballot_items",
  {
    ballotId: integer("ballot_id")
      .notNull()
      .references(() => movieBallots.id, { onDelete: "cascade" }),
    eventMovieId: integer("event_movie_id")
      .notNull()
      .references(() => eventMovies.id, { onDelete: "cascade" }),
    rank: integer("rank"),
    veto: integer("veto", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.ballotId, t.eventMovieId] }),
    uniqueIndex("movie_ballot_rank_unique").on(t.ballotId, t.rank),
  ]
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

// Thread breve sotto una pagella. Un solo livello viene mostrato in UI.
export const ratingComments = sqliteTable("rating_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  ratingUserId: integer("rating_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  authorUserId: integer("author_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  spoiler: integer("spoiler", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  editedAt: text("edited_at"),
});

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

// Commenti rapidi mentre data e film sono ancora da decidere.
export const eventDiscussionMessages = sqliteTable("event_discussion_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

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
    type: text("type", {
      enum: ["review_like", "review_reply", "mention", "rsvp_reminder", "event_invite"],
    }).notNull(),
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

// ---------- sale online ----------

export const eventRooms = sqliteTable("event_rooms", {
  eventId: integer("event_id")
    .primaryKey()
    .references(() => events.id, { onDelete: "cascade" }),
  mode: text("mode", { enum: ["youtube", "watch_along", "licensed_public"] }).notNull(),
  mediaProvider: text("media_provider", { enum: ["youtube", "external", "licensed"] }).notNull(),
  youtubeVideoId: text("youtube_video_id"),
  externalPlaybackUrl: text("external_playback_url"),
  streamerUrl: text("streamer_url"),
  rightsBasis: text("rights_basis", {
    enum: ["public_domain", "creator_owned", "licensed", "consumer_account"],
  }).notNull(),
  rightsSourceUrl: text("rights_source_url"),
  playbackStatus: text("playback_status", { enum: ["waiting", "playing", "paused", "ended"] })
    .notNull()
    .default("waiting"),
  positionSeconds: integer("position_seconds").notNull().default(0),
  revision: integer("revision").notNull().default(0),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const roomParticipants = sqliteTable(
  "room_participants",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ready: integer("ready", { mode: "boolean" }).notNull().default(false),
    joinedAt: text("joined_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    lastSeenAt: text("last_seen_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })]
);

export const roomMessages = sqliteTable("room_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["chat", "reaction", "system"] })
    .notNull()
    .default("chat"),
  body: text("body").notNull(),
  timecodeSeconds: integer("timecode_seconds"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const roomPolls = sqliteTable("room_polls", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  status: text("status", { enum: ["open", "closed"] }).notNull().default("open"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const roomPollOptions = sqliteTable("room_poll_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pollId: integer("poll_id")
    .notNull()
    .references(() => roomPolls.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
});

export const roomPollVotes = sqliteTable(
  "room_poll_votes",
  {
    pollId: integer("poll_id")
      .notNull()
      .references(() => roomPolls.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    optionId: integer("option_id")
      .notNull()
      .references(() => roomPollOptions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.pollId, t.userId] })]
);

export const screeningLicenses = sqliteTable("screening_licenses", {
  eventId: integer("event_id")
    .primaryKey()
    .references(() => events.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["draft", "submitted", "verified", "rejected", "expired"],
  })
    .notNull()
    .default("draft"),
  territory: text("territory").notNull().default("IT"),
  capacity: integer("capacity"),
  reference: text("reference"),
  evidenceUrl: text("evidence_url"),
  expiresAt: text("expires_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: text("reviewed_at"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

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
