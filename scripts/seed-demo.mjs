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

  sqlite.prepare("DELETE FROM user_friends WHERE user_id = ?").run(ids.demo);
  const addFriend = sqlite.prepare(
    "INSERT INTO user_friends (user_id, friend_user_id) VALUES (?, ?)"
  );
  addFriend.run(ids.demo, ids["demo-alice"]);
  addFriend.run(ids.demo, ids["demo-bruno"]);

  const sampleMovies = sqlite.prepare("SELECT id FROM movies ORDER BY id LIMIT 6").all();
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
});

seed();
sqlite.close();

console.log("Demo pronta.");
console.log("Account: demo, demo-alice, demo-bruno, demo-carla");
console.log(`Password comune: ${password}`);
