// Dati esclusivamente locali per provare il sito.
// Uso: npm run seed:demo
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import bcrypt from "bcryptjs";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "serate.db");
const sqlite = new Database(dbPath);
sqlite.pragma("foreign_keys = ON");
migrate(drizzle(sqlite), { migrationsFolder: path.join(process.cwd(), "db", "migrations") });

const password = "cinema123";
const passwordHash = bcrypt.hashSync(password, 10);
const accounts = [
  { username: "demo", name: "Demo", isAdmin: 1 },
  { username: "demo-alice", name: "Alice Demo", isAdmin: 0 },
  { username: "demo-bruno", name: "Bruno Demo", isAdmin: 0 },
  { username: "demo-carla", name: "Carla Demo", isAdmin: 0 },
];

const upsertUser = sqlite.prepare(`
  INSERT INTO users (username, name, password_hash, is_admin)
  VALUES (@username, @name, @passwordHash, @isAdmin)
  ON CONFLICT(username) DO UPDATE SET
    name = excluded.name,
    password_hash = excluded.password_hash,
    is_admin = excluded.is_admin
`);

const seed = sqlite.transaction(() => {
  for (const account of accounts) upsertUser.run({ ...account, passwordHash });

  const ids = Object.fromEntries(
    sqlite
      .prepare("SELECT username, id FROM users WHERE username LIKE 'demo%'")
      .all()
      .map((user) => [user.username, user.id])
  );

  const upsertProfile = sqlite.prepare(`
    INSERT INTO user_profiles (
      user_id, slug, bio, favorite_genres, visibility, discoverable, show_stats
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      slug = excluded.slug,
      bio = excluded.bio,
      favorite_genres = excluded.favorite_genres,
      visibility = excluded.visibility,
      discoverable = excluded.discoverable,
      show_stats = excluded.show_stats,
      updated_at = datetime('now')
  `);
  upsertProfile.run(
    ids.demo,
    "demo",
    "Organizzo serate lente, popcorn abbondanti e discussioni troppo lunghe sui finali.",
    "Fantascienza, thriller, animazione",
    "public",
    1,
    1
  );
  upsertProfile.run(
    ids["demo-alice"],
    "alice-demo",
    "Cerco film che restano addosso.",
    "Dramma, documentari",
    "public",
    1,
    1
  );
  upsertProfile.run(ids["demo-bruno"], "bruno-demo", null, "Commedia, noir", "circles", 0, 0);
  upsertProfile.run(ids["demo-carla"], "carla-demo", null, null, "private", 0, 0);

  sqlite.prepare(`
    INSERT INTO circles (name, slug, description, owner_id, visibility, join_policy)
    VALUES ('Cinema del giovedì', 'cinema-del-giovedi-demo',
      'Amici, film sorprendenti e una regola: niente telefoni durante i titoli.', ?,
      'public', 'request')
    ON CONFLICT(slug) DO UPDATE SET
      description = excluded.description,
      visibility = excluded.visibility,
      join_policy = excluded.join_policy
  `).run(ids.demo);
  const circleId = sqlite
    .prepare("SELECT id FROM circles WHERE slug = 'cinema-del-giovedi-demo'")
    .get().id;
  const addCircleMember = sqlite.prepare(`
    INSERT INTO circle_members (circle_id, user_id, role, status, invited_by)
    VALUES (?, ?, ?, 'active', ?)
    ON CONFLICT(circle_id, user_id) DO UPDATE SET
      role = excluded.role,
      status = 'active'
  `);
  addCircleMember.run(circleId, ids.demo, "owner", ids.demo);
  addCircleMember.run(circleId, ids["demo-alice"], "moderator", ids.demo);
  addCircleMember.run(circleId, ids["demo-bruno"], "member", ids.demo);

  sqlite.prepare("DELETE FROM user_friends WHERE user_id = ?").run(ids.demo);
  const addFriend = sqlite.prepare(
    "INSERT INTO user_friends (user_id, friend_user_id) VALUES (?, ?)"
  );
  addFriend.run(ids.demo, ids["demo-alice"]);
  addFriend.run(ids.demo, ids["demo-bruno"]);

  const sampleMovies = sqlite.prepare("SELECT id FROM movies ORDER BY id LIMIT 6").all();
  const addAvailability = sqlite.prepare(`
    INSERT INTO movie_availability (movie_id, country, provider, type, url, price)
    VALUES (?, 'IT', ?, ?, ?, ?)
    ON CONFLICT(movie_id, country, provider, type) DO UPDATE SET
      url = excluded.url,
      price = excluded.price,
      updated_at = datetime('now')
  `);
  const providers = [
    ["Netflix", "subscription", "https://www.netflix.com/it/", null],
    ["Prime Video", "subscription", "https://www.primevideo.com/", null],
    ["Apple TV", "rent", "https://tv.apple.com/it", "3,99 €"],
    ["MUBI", "subscription", "https://mubi.com/it", null],
    ["YouTube", "rent", "https://www.youtube.com/feed/storefront", "2,99 €"],
    ["Cinema", "cinema", "https://www.mymovies.it/cinema/", null],
  ];
  sampleMovies.forEach((movie, index) => {
    const primary = providers[index % providers.length];
    const secondary = providers[(index + 2) % providers.length];
    addAvailability.run(movie.id, ...primary);
    addAvailability.run(movie.id, ...secondary);
  });
  const addToWatchlist = sqlite.prepare(`
    INSERT INTO watchlist (movie_id, added_by, status)
    VALUES (?, ?, 'active')
    ON CONFLICT(movie_id) DO UPDATE SET status = 'active'
  `);
  for (const movie of sampleMovies) addToWatchlist.run(movie.id, ids.demo);

  const existingEvent = sqlite
    .prepare("SELECT id FROM events WHERE title = '[Demo] Serata tra amici'")
    .get();
  let openEventId = existingEvent?.id;
  if (!existingEvent && sampleMovies.length >= 3) {
    const event = sqlite
      .prepare("INSERT INTO events (title, created_by) VALUES (?, ?)")
      .run("[Demo] Serata tra amici", ids.demo);
    const eventId = Number(event.lastInsertRowid);
    openEventId = eventId;
    const today = new Date();
    const dateAfter = (days) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date.toISOString().slice(0, 10);
    };

    const addDate = sqlite.prepare("INSERT INTO event_dates (event_id, date) VALUES (?, ?)");
    addDate.run(eventId, dateAfter(7));
    addDate.run(eventId, dateAfter(14));

    const addMovie = sqlite.prepare(
      "INSERT INTO event_movies (event_id, movie_id) VALUES (?, ?)"
    );
    for (const movie of sampleMovies.slice(0, 3)) addMovie.run(eventId, movie.id);

    const addInvitee = sqlite.prepare(
      "INSERT INTO event_invitees (event_id, user_id) VALUES (?, ?)"
    );
    addInvitee.run(eventId, ids.demo);
    addInvitee.run(eventId, ids["demo-alice"]);
    addInvitee.run(eventId, ids["demo-bruno"]);
  }
  if (openEventId) {
    sqlite
      .prepare(`
        UPDATE events SET
          access = 'invite_only',
          circle_id = ?,
          rsvp_deadline = datetime('now', '+5 days'),
          voting_deadline = datetime('now', '+4 days'),
          movie_decision_method = 'ranked'
        WHERE id = ?
      `)
      .run(circleId, openEventId);
    sqlite
      .prepare(`
        INSERT INTO event_invite_links (event_id, token)
        VALUES (?, lower(hex(randomblob(24))))
        ON CONFLICT(event_id) DO NOTHING
      `)
      .run(openEventId);
    const addContribution = sqlite.prepare(`
      INSERT INTO event_contributions (event_id, user_id, item)
      VALUES (?, ?, ?)
      ON CONFLICT(event_id, user_id) DO UPDATE SET
        item = excluded.item,
        updated_at = datetime('now')
    `);
    addContribution.run(openEventId, ids.demo, "Proiettore");
    addContribution.run(openEventId, ids["demo-alice"], "Focaccia fatta in casa");

    const addNeed = sqlite.prepare(`
      INSERT INTO event_needs (event_id, item, quantity, claimed_by)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(event_id, item) DO UPDATE SET
        quantity = excluded.quantity,
        claimed_by = excluded.claimed_by
    `);
    addNeed.run(openEventId, "🍿 Popcorn", "2 ciotole", ids.demo);
    addNeed.run(openEventId, "🍺 Birre", "6 bottiglie", ids["demo-alice"]);
    addNeed.run(openEventId, "🧊 Ghiaccio", "1 sacchetto", null);
    addNeed.run(openEventId, "🍰 Dolce", null, null);

    const upsertRsvp = sqlite.prepare(`
      INSERT INTO event_rsvps (event_id, user_id, status, guest_count, note)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(event_id, user_id) DO UPDATE SET
        status = excluded.status,
        guest_count = excluded.guest_count,
        note = excluded.note,
        responded_at = datetime('now')
    `);
    upsertRsvp.run(openEventId, ids.demo, "yes", 0, null);
    upsertRsvp.run(openEventId, ids["demo-alice"], "yes", 1, "Porto anche Luca.");
    upsertRsvp.run(openEventId, ids["demo-bruno"], "maybe", 0, "Confermo domani.");

    const addDiscussionMessage = (userId, body) => {
      const exists = sqlite
        .prepare(
          "SELECT id FROM event_discussion_messages WHERE event_id = ? AND user_id = ? AND body = ?"
        )
        .get(openEventId, userId, body);
      if (!exists) {
        sqlite
          .prepare(
            "INSERT INTO event_discussion_messages (event_id, user_id, body) VALUES (?, ?, ?)"
          )
          .run(openEventId, userId, body);
      }
    };
    addDiscussionMessage(ids["demo-alice"], "Io voto domenica. Per il film: qualcosa sotto le due ore?");
    addDiscussionMessage(ids["demo-bruno"], "Heat mi tenta, ma preparo anche un piano B.");
    addDiscussionMessage(ids.demo, "Perfetto: lasciate il podio e domani chiudo.");

    const notifyInvite = sqlite.prepare(`
      INSERT INTO notifications (user_id, actor_user_id, type, event_id)
      VALUES (?, ?, 'event_invite', ?)
      ON CONFLICT(user_id, actor_user_id, type, event_id) DO UPDATE SET
        read_at = NULL,
        created_at = datetime('now')
    `);
    notifyInvite.run(ids["demo-alice"], ids.demo, openEventId);
    notifyInvite.run(ids["demo-bruno"], ids.demo, openEventId);

    const candidateRows = sqlite
      .prepare("SELECT id FROM event_movies WHERE event_id = ? ORDER BY id LIMIT 3")
      .all(openEventId);
    const voterIds = [ids.demo, ids["demo-alice"], ids["demo-bruno"]];
    sqlite
      .prepare(`
        DELETE FROM movie_ballot_items
        WHERE ballot_id IN (SELECT id FROM movie_ballots WHERE event_id = ?)
      `)
      .run(openEventId);
    sqlite.prepare("DELETE FROM movie_ballots WHERE event_id = ?").run(openEventId);
    const addBallot = sqlite.prepare(
      "INSERT INTO movie_ballots (event_id, user_id) VALUES (?, ?)"
    );
    const addBallotItem = sqlite.prepare(`
      INSERT INTO movie_ballot_items (ballot_id, event_movie_id, rank, veto)
      VALUES (?, ?, ?, ?)
    `);
    voterIds.forEach((voterId, voterIndex) => {
      if (candidateRows.length === 0) return;
      const ballotId = Number(addBallot.run(openEventId, voterId).lastInsertRowid);
      candidateRows.forEach((candidate, rankIndex) => {
        const rotated = candidateRows[(rankIndex + voterIndex) % candidateRows.length];
        addBallotItem.run(ballotId, rotated.id, rankIndex + 1, 0);
      });
    });
  }

  const watchedEvent =
    sqlite
      .prepare("SELECT id FROM events WHERE title = '[Demo] Serata già vista'")
      .get() ??
    sqlite
      .prepare(
        "INSERT INTO events (title, status, created_by, chosen_date, chosen_movie_id) VALUES (?, 'done', ?, ?, ?)"
      )
      .run(
        "[Demo] Serata già vista",
        ids.demo,
        new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10),
        sampleMovies[0].id
      );
  const watchedEventId = Number(watchedEvent.id ?? watchedEvent.lastInsertRowid);
  sqlite
    .prepare(
      "UPDATE events SET status = 'done', chosen_movie_id = ? WHERE id = ?"
    )
    .run(sampleMovies[0].id, watchedEventId);
  sqlite
    .prepare("UPDATE events SET access = 'circle', circle_id = ? WHERE id = ?")
    .run(circleId, watchedEventId);
  sqlite
    .prepare("INSERT OR IGNORE INTO event_movies (event_id, movie_id) VALUES (?, ?)")
    .run(watchedEventId, sampleMovies[0].id);
  const addAttendance = sqlite.prepare(
    "INSERT OR IGNORE INTO attendance (event_id, user_id) VALUES (?, ?)"
  );
  addAttendance.run(watchedEventId, ids.demo);
  addAttendance.run(watchedEventId, ids["demo-alice"]);
  const addRating = sqlite.prepare(`
    INSERT INTO ratings (event_id, user_id, stars, comment)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(event_id, user_id) DO UPDATE SET
      stars = excluded.stars,
      comment = excluded.comment
  `);
  addRating.run(watchedEventId, ids.demo, 4, "Gran ritmo, finale memorabile.");
  addRating.run(
    watchedEventId,
    ids["demo-alice"],
    5,
    "Mi è rimasto addosso anche il giorno dopo."
  );
  sqlite
    .prepare(
      "INSERT OR IGNORE INTO review_likes (event_id, review_user_id, user_id) VALUES (?, ?, ?)"
    )
    .run(watchedEventId, ids["demo-alice"], ids.demo);
  sqlite
    .prepare(`
      INSERT INTO notifications (user_id, actor_user_id, type, event_id)
      VALUES (?, ?, 'review_like', ?)
      ON CONFLICT(user_id, actor_user_id, type, event_id) DO UPDATE SET
        read_at = NULL,
        created_at = datetime('now')
    `)
    .run(ids["demo-alice"], ids.demo, watchedEventId);
  const existingReply = sqlite
    .prepare(`
      SELECT id FROM rating_comments
      WHERE event_id = ? AND rating_user_id = ? AND author_user_id = ?
    `)
    .get(watchedEventId, ids["demo-alice"], ids.demo);
  if (!existingReply) {
    sqlite
      .prepare(`
        INSERT INTO rating_comments
          (event_id, rating_user_id, author_user_id, body, spoiler)
        VALUES (?, ?, ?, ?, 0)
      `)
      .run(
        watchedEventId,
        ids["demo-alice"],
        ids.demo,
        "Vero. La scena finale mi ha fatto rivalutare tutto."
      );
  }

  const ensureScheduledEvent = (
    title,
    movieId,
    days,
    viewingMode,
    access = "circle",
    discoverable = 0
  ) => {
    const existing = sqlite.prepare("SELECT id FROM events WHERE title = ?").get(title);
    const chosenDate = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
    if (existing) {
      sqlite
        .prepare(`
          UPDATE events SET status = 'scheduled', chosen_date = ?, chosen_movie_id = ?,
            circle_id = ?, access = ?, viewing_mode = ?, discoverable = ?
          WHERE id = ?
        `)
        .run(chosenDate, movieId, circleId, access, viewingMode, discoverable, existing.id);
      return existing.id;
    }
    return Number(
      sqlite
        .prepare(`
          INSERT INTO events (
            title, status, created_by, chosen_date, chosen_movie_id, circle_id,
            access, viewing_mode, discoverable, start_time
          ) VALUES (?, 'scheduled', ?, ?, ?, ?, ?, ?, ?, '21:00')
        `)
        .run(
          title,
          ids.demo,
          chosenDate,
          movieId,
          circleId,
          access,
          viewingMode,
          discoverable
        ).lastInsertRowid
    );
  };

  if (sampleMovies.length >= 3) {
    const youtubeEventId = ensureScheduledEvent(
      "[Demo] Sala YouTube autorizzata",
      sampleMovies[0].id,
      3,
      "youtube"
    );
    sqlite
      .prepare(`
        INSERT INTO event_rooms (
          event_id, mode, media_provider, youtube_video_id, rights_basis, rights_source_url
        ) VALUES (?, 'youtube', 'youtube', 'aqz-KE-bpKQ', 'creator_owned',
          'https://studio.blender.org/films/big-buck-bunny/')
        ON CONFLICT(event_id) DO UPDATE SET
          mode = excluded.mode,
          media_provider = excluded.media_provider,
          youtube_video_id = excluded.youtube_video_id,
          rights_basis = excluded.rights_basis,
          rights_source_url = excluded.rights_source_url
      `)
      .run(youtubeEventId);

    const watchAlongId = ensureScheduledEvent(
      "[Demo] Watch-along con streamer",
      sampleMovies[1].id,
      9,
      "watch_along"
    );
    sqlite
      .prepare(`
        INSERT INTO event_rooms (
          event_id, mode, media_provider, external_playback_url, streamer_url, rights_basis
        ) VALUES (?, 'watch_along', 'external', 'https://www.justwatch.com/it',
          'https://www.twitch.tv/', 'consumer_account')
        ON CONFLICT(event_id) DO UPDATE SET
          mode = excluded.mode,
          media_provider = excluded.media_provider,
          external_playback_url = excluded.external_playback_url,
          streamer_url = excluded.streamer_url,
          rights_basis = excluded.rights_basis
      `)
      .run(watchAlongId);

    const licensedEventId = ensureScheduledEvent(
      "[Demo] Proiezione pubblica",
      sampleMovies[2].id,
      16,
      "licensed_public",
      "public",
      1
    );
    sqlite
      .prepare(`
        INSERT INTO event_rooms (
          event_id, mode, media_provider, rights_basis
        ) VALUES (?, 'licensed_public', 'licensed', 'licensed')
        ON CONFLICT(event_id) DO UPDATE SET
          mode = excluded.mode,
          media_provider = excluded.media_provider,
          rights_basis = excluded.rights_basis
      `)
      .run(licensedEventId);
    sqlite
      .prepare(`
        INSERT INTO screening_licenses (
          event_id, status, territory, capacity, reference, evidence_url
        ) VALUES (?, 'submitted', 'IT', 80, 'DEMO-LIC-2026',
          'https://www.siae.it/it/utilizzatori/eventi-spettacolo-intrattenimento/proiezioni-cinematografiche-audiovisive/')
        ON CONFLICT(event_id) DO UPDATE SET
          status = excluded.status,
          capacity = excluded.capacity,
          reference = excluded.reference,
          evidence_url = excluded.evidence_url
      `)
      .run(licensedEventId);
  }
});

seed();
sqlite.close();

console.log("Demo pronta.");
console.log("Account: demo, demo-alice, demo-bruno, demo-carla");
console.log(`Password comune: ${password}`);
