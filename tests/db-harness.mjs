import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const migrationsFolder = path.join(projectRoot, "db", "migrations");

function migrationPrefix(tempRoot, throughIndex) {
  const target = path.join(tempRoot, `migrations-through-${throughIndex}`);
  fs.mkdirSync(path.join(target, "meta"), { recursive: true });
  const journal = JSON.parse(
    fs.readFileSync(path.join(migrationsFolder, "meta", "_journal.json"), "utf8")
  );
  const entries = journal.entries.filter((entry) => entry.idx <= throughIndex);
  assert.ok(entries.length > 0, `No migrations through index ${throughIndex}`);
  for (const entry of entries) {
    fs.copyFileSync(
      path.join(migrationsFolder, `${entry.tag}.sql`),
      path.join(target, `${entry.tag}.sql`)
    );
  }
  fs.writeFileSync(
    path.join(target, "meta", "_journal.json"),
    JSON.stringify({ ...journal, entries }, null, 2)
  );
  return target;
}

export function openHarness({ throughIndex = null } = {}) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "serate-film-harness-"));
  const databasePath = path.join(tempRoot, "synthetic.sqlite");
  const productionData = path.resolve(projectRoot, "data") + path.sep;

  assert.ok(path.resolve(databasePath).startsWith(path.resolve(tempRoot) + path.sep));
  assert.ok(!path.resolve(databasePath).startsWith(productionData));
  assert.notEqual(path.basename(databasePath), "serate.db");

  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = DELETE");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  const orm = drizzle(sqlite);
  const source = throughIndex === null
    ? migrationsFolder
    : migrationPrefix(tempRoot, throughIndex);
  migrate(orm, { migrationsFolder: source });

  let closed = false;
  return {
    sqlite,
    orm,
    databasePath,
    tempRoot,
    migrateToLatest() {
      migrate(orm, { migrationsFolder });
    },
    cleanup() {
      if (!closed) {
        sqlite.close();
        closed = true;
      }
      fs.rmSync(tempRoot, { recursive: true, force: true });
      assert.equal(fs.existsSync(tempRoot), false, "temporary harness database was removed");
    },
  };
}

function scalar(sqlite, sql, params = []) {
  return sqlite.prepare(sql).pluck().get(...params);
}

function journeyProgress(sqlite, journeyId, userId) {
  const total = scalar(
    sqlite,
    "SELECT count(*) FROM journey_movies WHERE journey_id = ?",
    [journeyId]
  );
  const seen = scalar(sqlite, `
    WITH seen_movies(movie_id) AS (
      SELECT movie_id FROM user_seen_movies WHERE user_id = ?
      UNION
      SELECT e.chosen_movie_id
      FROM attendance a
      JOIN events e ON e.id = a.event_id
      WHERE a.user_id = ? AND e.status = 'done' AND e.chosen_movie_id IS NOT NULL
    )
    SELECT count(*)
    FROM journey_movies jm
    JOIN seen_movies sm ON sm.movie_id = jm.movie_id
    WHERE jm.journey_id = ?
  `, [userId, userId, journeyId]);
  return { seen, total, complete: seen === total, experience: seen * 50 + (seen === total ? 250 : 0) };
}

export function runLifecycle(sqlite) {
  const password = "harness-cinema-123";
  const passwordHash = bcrypt.hashSync(password, 4);

  const ids = sqlite.transaction(() => {
    const insertUser = sqlite.prepare(
      "INSERT INTO users (username, name, password_hash, is_admin) VALUES (?, ?, ?, ?)"
    );
    const hostId = Number(insertUser.run("harness_host", "Host Sintetico", passwordHash, 1).lastInsertRowid);
    const guestId = Number(insertUser.run("harness_guest", "Guest Sintetico", passwordHash, 0).lastInsertRowid);
    const linkGuestId = Number(insertUser.run("harness_link", "Invitato Sintetico", passwordHash, 0).lastInsertRowid);
    const insertProfile = sqlite.prepare(
      "INSERT INTO user_profiles (user_id, slug) VALUES (?, ?)"
    );
    insertProfile.run(hostId, "harness-host");
    insertProfile.run(guestId, "harness-guest");
    insertProfile.run(linkGuestId, "harness-link");
    sqlite.prepare("INSERT INTO user_friends (user_id, friend_user_id) VALUES (?, ?)").run(hostId, guestId);

    const insertMovie = sqlite.prepare(
      "INSERT INTO movies (title, year, director, actors, genres, added_by) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const movieIds = [
      Number(insertMovie.run("Harness Alpha", 2001, "Ada Synthetic", "Actor One", "Drama", hostId).lastInsertRowid),
      Number(insertMovie.run("Harness Beta", 2003, "Ada Synthetic", "Actor Two", "Comedy", hostId).lastInsertRowid),
      Number(insertMovie.run("Harness Gamma", 2005, "Ada Synthetic", "Actor Three", "Thriller", hostId).lastInsertRowid),
    ];
    sqlite.prepare("INSERT INTO watchlist (movie_id, added_by, status) VALUES (?, ?, 'active')")
      .run(movieIds[0], hostId);

    const eventId = Number(sqlite.prepare(`
      INSERT INTO events (
        title, status, created_by, access, discoverable, viewing_mode,
        movie_decision_method, location, start_time
      ) VALUES (?, 'open', ?, 'invite_only', 0, 'in_person', 'ranked', ?, ?)
    `).run("Serata Harness", hostId, "Sala sintetica", "20:45").lastInsertRowid);
    const insertDate = sqlite.prepare("INSERT INTO event_dates (event_id, date) VALUES (?, ?)");
    const dateIds = [
      Number(insertDate.run(eventId, "2030-05-10").lastInsertRowid),
      Number(insertDate.run(eventId, "2030-05-17").lastInsertRowid),
    ];
    const insertCandidate = sqlite.prepare(
      "INSERT INTO event_movies (event_id, movie_id, added_by) VALUES (?, ?, ?)"
    );
    const candidateIds = movieIds.slice(0, 2).map((movieId) =>
      Number(insertCandidate.run(eventId, movieId, hostId).lastInsertRowid)
    );
    const inviteMember = sqlite.prepare(
      "INSERT OR IGNORE INTO event_invitees (event_id, user_id) VALUES (?, ?)"
    );
    inviteMember.run(eventId, hostId);
    inviteMember.run(eventId, guestId);
    sqlite.prepare("INSERT INTO event_invite_links (event_id, token) VALUES (?, ?)")
      .run(eventId, "harness-token-not-secret");
    // Capability-link acceptance: a third synthetic account gains access only here.
    inviteMember.run(eventId, linkGuestId);
    sqlite.prepare(`
      INSERT INTO notifications (user_id, actor_user_id, type, event_id)
      VALUES (?, ?, 'event_invite', ?)
    `).run(guestId, hostId, eventId);

    const rsvp = sqlite.prepare(`
      INSERT INTO event_rsvps (event_id, user_id, status, guest_count)
      VALUES (?, ?, 'yes', 0)
    `);
    rsvp.run(eventId, hostId);
    rsvp.run(eventId, guestId);
    const dateVote = sqlite.prepare("INSERT INTO date_votes (event_date_id, user_id) VALUES (?, ?)");
    dateVote.run(dateIds[0], hostId);
    dateVote.run(dateIds[0], guestId);
    const approval = sqlite.prepare("INSERT INTO movie_votes (event_movie_id, user_id) VALUES (?, ?)");
    approval.run(candidateIds[0], hostId);
    approval.run(candidateIds[0], guestId);
    approval.run(candidateIds[1], guestId);

    const insertBallot = sqlite.prepare("INSERT INTO movie_ballots (event_id, user_id) VALUES (?, ?)");
    const insertRank = sqlite.prepare(
      "INSERT INTO movie_ballot_items (ballot_id, event_movie_id, rank, veto) VALUES (?, ?, ?, 0)"
    );
    for (const userId of [hostId, guestId]) {
      const ballotId = Number(insertBallot.run(eventId, userId).lastInsertRowid);
      insertRank.run(ballotId, candidateIds[0], 1);
      insertRank.run(ballotId, candidateIds[1], 2);
    }

    sqlite.prepare("INSERT INTO event_contributions (event_id, user_id, item) VALUES (?, ?, ?)")
      .run(eventId, guestId, "Bibite sintetiche");
    const needId = Number(sqlite.prepare(
      "INSERT INTO event_needs (event_id, item, quantity) VALUES (?, ?, ?)"
    ).run(eventId, "Popcorn sintetici", "2 ciotole").lastInsertRowid);
    sqlite.prepare("UPDATE event_needs SET claimed_by = ? WHERE id = ? AND claimed_by IS NULL")
      .run(guestId, needId);

    sqlite.prepare(`
      UPDATE events SET status = 'scheduled', chosen_date = ?, chosen_movie_id = ? WHERE id = ?
    `).run("2030-05-10", movieIds[0], eventId);
    const attendance = sqlite.prepare("INSERT INTO attendance (event_id, user_id) VALUES (?, ?)");
    attendance.run(eventId, hostId);
    attendance.run(eventId, guestId);
    sqlite.prepare("UPDATE events SET status = 'done' WHERE id = ?").run(eventId);
    sqlite.prepare(`
      INSERT INTO watchlist (movie_id, added_by, status) VALUES (?, ?, 'watched')
      ON CONFLICT(movie_id) DO UPDATE SET status = 'watched'
    `).run(movieIds[0], hostId);

    const rate = sqlite.prepare(
      "INSERT INTO ratings (event_id, user_id, stars, comment) VALUES (?, ?, ?, ?)"
    );
    rate.run(eventId, hostId, 5, "Pagella sintetica host");
    rate.run(eventId, guestId, 4, "Pagella sintetica guest");
    sqlite.prepare("INSERT INTO review_likes (event_id, review_user_id, user_id) VALUES (?, ?, ?)")
      .run(eventId, hostId, guestId);
    const notify = sqlite.prepare(`
      INSERT INTO notifications (user_id, actor_user_id, type, event_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, actor_user_id, type, event_id)
      DO UPDATE SET read_at = NULL, created_at = datetime('now')
    `);
    notify.run(hostId, guestId, "review_like", eventId);
    // The production action is idempotent at this uniqueness boundary.
    notify.run(hostId, guestId, "review_like", eventId);
    sqlite.prepare(`
      INSERT INTO rating_comments (event_id, rating_user_id, author_user_id, body)
      VALUES (?, ?, ?, ?)
    `).run(eventId, hostId, guestId, "Risposta sintetica");
    notify.run(hostId, guestId, "review_reply", eventId);

    const unreadBeforeOpen = scalar(
      sqlite,
      "SELECT count(*) FROM notifications WHERE user_id = ? AND read_at IS NULL",
      [hostId]
    );
    sqlite.prepare("UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL")
      .run(hostId);

    const journeyId = Number(sqlite.prepare(`
      INSERT INTO journeys (title, subject_type, subject_name, subject_slug, mode, created_by)
      VALUES (?, 'director', 'Ada Synthetic', 'ada-synthetic', 'chronological', ?)
    `).run("Il cinema di Ada Synthetic, in ordine", hostId).lastInsertRowid);
    const addJourneyMovie = sqlite.prepare(
      "INSERT INTO journey_movies (journey_id, movie_id, position) VALUES (?, ?, ?)"
    );
    movieIds.forEach((movieId, index) => addJourneyMovie.run(journeyId, movieId, index + 1));
    const addJourneyMember = sqlite.prepare(`
      INSERT INTO journey_members (journey_id, user_id, role, status, invited_by, accepted_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    addJourneyMember.run(journeyId, hostId, "owner", "active", hostId, "2030-01-01T00:00:00Z");
    addJourneyMember.run(journeyId, guestId, "member", "invited", hostId, null);
    sqlite.prepare(`
      UPDATE journey_members SET status = 'active', accepted_at = ?
      WHERE journey_id = ? AND user_id = ? AND status = 'invited'
    `).run("2030-01-02T00:00:00Z", journeyId, guestId);
    const markSeen = sqlite.prepare(
      "INSERT INTO user_seen_movies (user_id, movie_id, watched_at) VALUES (?, ?, ?)"
    );
    markSeen.run(hostId, movieIds[1], "2030-05-11T00:00:00Z");
    markSeen.run(hostId, movieIds[2], "2030-05-12T00:00:00Z");

    return { hostId, guestId, linkGuestId, movieIds, eventId, journeyId, unreadBeforeOpen };
  })();

  const loginRow = sqlite.prepare(
    "SELECT id, password_hash FROM users WHERE username = ?"
  ).get("harness_host");
  const login = {
    accepted: Boolean(loginRow && bcrypt.compareSync(password, loginRow.password_hash)),
    rejected: Boolean(loginRow && !bcrypt.compareSync("wrong-password", loginRow.password_hash)),
  };
  const event = sqlite.prepare(
    "SELECT status, chosen_date, chosen_movie_id FROM events WHERE id = ?"
  ).get(ids.eventId);
  const summary = {
    login,
    event: {
      status: event.status,
      chosenDate: event.chosen_date,
      chosenMovieIsAlpha: event.chosen_movie_id === ids.movieIds[0],
    },
    invitees: scalar(sqlite, "SELECT count(*) FROM event_invitees WHERE event_id = ?", [ids.eventId]),
    rsvps: scalar(sqlite, "SELECT count(*) FROM event_rsvps WHERE event_id = ? AND status = 'yes'", [ids.eventId]),
    dateVotes: scalar(sqlite, `
      SELECT count(*) FROM date_votes dv JOIN event_dates ed ON ed.id = dv.event_date_id
      WHERE ed.event_id = ?
    `, [ids.eventId]),
    approvalVotes: scalar(sqlite, `
      SELECT count(*) FROM movie_votes mv JOIN event_movies em ON em.id = mv.event_movie_id
      WHERE em.event_id = ?
    `, [ids.eventId]),
    rankedBallots: scalar(sqlite, "SELECT count(*) FROM movie_ballots WHERE event_id = ?", [ids.eventId]),
    attendance: scalar(sqlite, "SELECT count(*) FROM attendance WHERE event_id = ?", [ids.eventId]),
    ratings: scalar(sqlite, "SELECT count(*) FROM ratings WHERE event_id = ?", [ids.eventId]),
    likes: scalar(sqlite, "SELECT count(*) FROM review_likes WHERE event_id = ?", [ids.eventId]),
    comments: scalar(sqlite, "SELECT count(*) FROM rating_comments WHERE event_id = ?", [ids.eventId]),
    unreadBeforeOpen: ids.unreadBeforeOpen,
    unreadAfterOpen: scalar(
      sqlite,
      "SELECT count(*) FROM notifications WHERE user_id = ? AND read_at IS NULL",
      [ids.hostId]
    ),
    hostJourney: journeyProgress(sqlite, ids.journeyId, ids.hostId),
    guestJourney: journeyProgress(sqlite, ids.journeyId, ids.guestId),
    foreignKeyErrors: sqlite.pragma("foreign_key_check").length,
    appliedMigrations: scalar(sqlite, "SELECT count(*) FROM __drizzle_migrations"),
  };
  return summary;
}
