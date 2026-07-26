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
  if (!existingEvent && sampleMovies.length >= 3) {
    const event = sqlite
      .prepare("INSERT INTO events (title, created_by) VALUES (?, ?)")
      .run("[Demo] Serata tra amici", ids.demo);
    const eventId = Number(event.lastInsertRowid);
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
});

seed();
sqlite.close();

console.log("Demo pronta.");
console.log("Account: demo, demo-alice, demo-bruno, demo-carla");
console.log(`Password comune: ${password}`);
