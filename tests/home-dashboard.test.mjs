import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after, beforeEach } from "node:test";
import Database from "better-sqlite3";
import { SignJWT } from "jose";

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "serate-home-"));
process.env.DATABASE_PATH = path.join(temporary, "home.sqlite");
process.env.SESSION_SECRET = "home-dashboard-tests-only-at-least-32-bytes";
const { getHomeDashboard, calendarDateInRome } = await import("../lib/home-dashboard.ts");
const core = await import("../lib/actions.ts");
const experience = await import("../lib/event-experience-actions.ts");
const sqlite = new Database(process.env.DATABASE_PATH);
sqlite.pragma("foreign_keys = ON");
after(() => { sqlite.close(); fs.rmSync(temporary, { recursive: true, force: true }); });
const now = new Date("2026-09-17T12:00:00Z");
let owner, me, outsider, film;
beforeEach(async () => {
  // Each case uses an isolated fixture in the migrated test-only database.
  sqlite.pragma("foreign_keys = OFF");
  for (const { name } of sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '%drizzle%'").all()) {
    sqlite.exec(`DELETE FROM "${name.replaceAll('"', '""')}"`);
  }
  sqlite.pragma("foreign_keys = ON");
  const addUser = sqlite.prepare("INSERT INTO users(username,name,password_hash) VALUES (?,?,'unused')");
  owner = Number(addUser.run("owner", "Owner").lastInsertRowid);
  me = { id: Number(addUser.run("viewer", "Viewer").lastInsertRowid), isAdmin: false };
  outsider = Number(addUser.run("outsider", "Outsider").lastInsertRowid);
  film = Number(sqlite.prepare("INSERT INTO movies(title,year) VALUES ('Arrival',2016)").run().lastInsertRowid);
  const token = await new SignJWT({ uid: me.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
  globalThis.__serateServerActionTest.setSessionToken(token);
});
function event({ status = "open", date = null, title = "Una serata", access = "invite_only", invited = true, circleId = null, method = "ranked" } = {}) {
  const id = Number(sqlite.prepare("INSERT INTO events(title,status,created_by,access,chosen_date,chosen_movie_id,circle_id,movie_decision_method) VALUES (?,?,?,?,?,?,?,?)")
    .run(title, status, owner, access, date, status === "scheduled" || status === "done" ? film : null, circleId, method).lastInsertRowid);
  if (invited) sqlite.prepare("INSERT INTO event_invitees(event_id,user_id) VALUES (?,?)").run(id, me.id);
  const dateId = Number(sqlite.prepare("INSERT INTO event_dates(event_id,date) VALUES (?,'2026-10-03')").run(id).lastInsertRowid);
  const candidateId = Number(sqlite.prepare("INSERT INTO event_movies(event_id,movie_id,in_runoff) VALUES (?,?,?)").run(id, film, status === "runoff" ? 1 : 0).lastInsertRowid);
  return { id, dateId, candidateId };
}
const dashboard = () => getHomeDashboard(me, now);
const taskFor = (data, id) => data.tasks.find((task) => task.eventId === id);

test("new account gets empty states, not fabricated appointments or tasks", async () => {
  assert.deepEqual(await dashboard(), { featured: null, tasks: [], watchlist: [] });
});

test("Rome calendar cutoff handles UTC midnight and the DST season", () => {
  assert.equal(calendarDateInRome(new Date("2026-09-17T22:30:00Z")), "2026-09-18");
  assert.equal(calendarDateInRome(new Date("2026-01-17T22:30:00Z")), "2026-01-17");
  assert.equal(calendarDateInRome(new Date("2026-01-17T23:30:00Z")), "2026-01-18");
});

test("upcoming hero is chronological and rejects past, malformed, cancelled and opted-out events", async () => {
  event({ status: "scheduled", date: "2026-09-16" });
  event({ status: "scheduled", date: "2026-09-31" });
  event({ status: "scheduled", date: "not-a-date" });
  event({ status: "scheduled", date: null });
  event({ status: "cancelled", date: "2026-09-17" });
  event({ status: "scheduled", date: "2026-10-10" });
  const declined = event({ status: "scheduled", date: "2026-09-17" });
  sqlite.prepare("INSERT INTO event_rsvps(event_id,user_id,status) VALUES (?,?,'no')").run(declined.id, me.id);
  const expected = event({ status: "scheduled", date: "2026-09-18" });
  assert.equal((await dashboard()).featured.event.id, expected.id);
});

test("home projections keep the central event privacy boundary", async () => {
  const privateEvent = event({ status: "scheduled", date: "2026-09-17", invited: false, title: "Private title" });
  const privateOpen = event({ invited: false, title: "Private voting" });
  const shared = event({ status: "scheduled", date: "2026-09-18", invited: true });
  const data = await dashboard();
  assert.equal(data.featured.event.id, shared.id);
  assert.equal(taskFor(data, privateOpen.id), undefined);
  assert.ok(!JSON.stringify(data).includes("Private title"));
  assert.equal((await getHomeDashboard({ id: me.id, isAdmin: true }, now)).featured.event.id, privateEvent.id);
});

test("circle membership must be active; explicit event invites still work", async () => {
  const circle = Number(sqlite.prepare("INSERT INTO circles(name,slug,owner_id) VALUES ('Circle','circle',?)").run(owner).lastInsertRowid);
  sqlite.prepare("INSERT INTO circle_members(circle_id,user_id,status) VALUES (?,?,'invited')").run(circle, me.id);
  const circleEvent = event({ access: "circle", circleId: circle, invited: false });
  assert.equal(taskFor(await dashboard(), circleEvent.id), undefined);
  sqlite.prepare("UPDATE circle_members SET status='active' WHERE circle_id=? AND user_id=?").run(circle, me.id);
  assert.equal(taskFor(await dashboard(), circleEvent.id).kind, "vote");
  sqlite.prepare("UPDATE circle_members SET status='requested' WHERE circle_id=? AND user_id=?").run(circle, me.id);
  sqlite.prepare("INSERT INTO event_invitees(event_id,user_id) VALUES (?,?)").run(circleEvent.id, me.id);
  assert.equal(taskFor(await dashboard(), circleEvent.id).kind, "vote");
});

test("real availability and ballot actions update the home without a second UI state", async () => {
  const e = event();
  assert.equal(taskFor(await dashboard(), e.id).label, "Date e film");
  const dates = new FormData(); dates.append("dateIds", String(e.dateId));
  await core.submitVotes(e.id, dates);
  assert.equal(taskFor(await dashboard(), e.id).label, "Scegli i film");
  const ballot = new FormData(); ballot.set("rank1", String(e.candidateId));
  assert.equal((await experience.submitConsensusBallot(e.id, undefined, ballot)).ok, true);
  assert.equal(taskFor(await dashboard(), e.id), undefined);
});

test("no available dates is not mislabeled as an unanswered form after a ballot", async () => {
  const e = event();
  await core.submitVotes(e.id, new FormData());
  const ballot = new FormData(); ballot.set("rank1", String(e.candidateId));
  await experience.submitConsensusBallot(e.id, undefined, ballot);
  assert.equal(taskFor(await dashboard(), e.id), undefined);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM date_votes").get().n, 0);
});

test("declining through the actual participation action removes reminders and the featured event", async () => {
  const e = event();
  const no = new FormData(); no.set("participating", "no");
  await experience.setEventParticipation(e.id, undefined, no);
  assert.equal((await dashboard()).featured, null);
  assert.equal(taskFor(await dashboard(), e.id), undefined);
  const yes = new FormData(); yes.set("participating", "yes");
  await experience.setEventParticipation(e.id, undefined, yes);
  assert.equal(taskFor(await dashboard(), e.id).kind, "vote");
});

test("runoffs require a vote for a current runoff candidate, not an obsolete one", async () => {
  const e = event({ status: "runoff" });
  assert.equal(taskFor(await dashboard(), e.id).kind, "runoff");
  const form = new FormData(); form.set("eventMovieId", String(e.candidateId));
  await core.submitRunoffVote(e.id, form);
  assert.equal(taskFor(await dashboard(), e.id), undefined);
  sqlite.prepare("UPDATE event_movies SET in_runoff=0 WHERE id=?").run(e.candidateId);
  assert.equal(taskFor(await dashboard(), e.id).kind, "runoff");
});

test("only actual attendees are asked for a missing review, and submitting it removes the task", async () => {
  const attended = event({ status: "done", date: "2026-09-15" });
  const notAttended = event({ status: "done", date: "2026-09-14" });
  sqlite.prepare("INSERT INTO attendance(event_id,user_id) VALUES (?,?)").run(attended.id, me.id);
  assert.equal(taskFor(await dashboard(), attended.id).kind, "review");
  assert.equal(taskFor(await dashboard(), notAttended.id), undefined);
  const form = new FormData(); form.set("stars", "4"); form.set("comment", "Una bella serata");
  await core.rateEvent(attended.id, form);
  assert.equal(taskFor(await dashboard(), attended.id), undefined);
});

test("legacy approval responses are respected without treating them as a ranked ballot", async () => {
  const approval = event({ method: "approval" });
  const ranked = event({ method: "ranked" });
  for (const e of [approval, ranked]) sqlite.prepare("INSERT INTO movie_votes(event_movie_id,user_id) VALUES (?,?)").run(e.candidateId, me.id);
  const data = await dashboard();
  assert.equal(taskFor(data, approval.id), undefined);
  assert.equal(taskFor(data, ranked.id).kind, "vote");
});

test("personal seen state does not remove an active shared-watchlist film", async () => {
  sqlite.prepare("INSERT INTO watchlist(movie_id,added_by,status) VALUES (?,?,'active')").run(film, owner);
  sqlite.prepare("INSERT INTO user_seen_movies(user_id,movie_id) VALUES (?,?)").run(me.id, film);
  assert.deepEqual((await dashboard()).watchlist.map((movie) => movie.id), [film]);
  sqlite.prepare("UPDATE watchlist SET status='watched' WHERE movie_id=?").run(film);
  assert.deepEqual((await dashboard()).watchlist, []);
});

test("many tasks are deterministic and retained for progressive disclosure, not silently discarded", async () => {
  for (let i = 0; i < 12; i++) event({ title: `Event ${i}` });
  const first = await dashboard();
  assert.equal(first.tasks.length, 12);
  assert.deepEqual((await dashboard()).tasks, first.tasks);
  assert.ok(first.featured.task);
});

test("pending circle and journey invitations belong only to the current user", async () => {
  const circle = Number(sqlite.prepare("INSERT INTO circles(name,slug,owner_id) VALUES ('Circle','circle',?)").run(owner).lastInsertRowid);
  sqlite.prepare("INSERT INTO circle_members(circle_id,user_id,status) VALUES (?,?,'invited')").run(circle, me.id);
  const journey = Number(sqlite.prepare("INSERT INTO journeys(title,subject_type,subject_name,subject_slug,created_by) VALUES ('Denis','director','Denis Villeneuve','denis-villeneuve',?)").run(owner).lastInsertRowid);
  sqlite.prepare("INSERT INTO journey_members(journey_id,user_id,invited_by) VALUES (?,?,?)").run(journey, me.id, owner);
  const mine = await dashboard();
  assert.deepEqual(mine.tasks.map((task) => task.kind), ["circle", "journey"]);
  assert.deepEqual((await getHomeDashboard({ id: outsider, isAdmin: false }, now)).tasks, []);
  sqlite.prepare("UPDATE circle_members SET status='active'").run();
  sqlite.prepare("UPDATE journey_members SET status='active'").run();
  assert.deepEqual((await dashboard()).tasks, []);
});
