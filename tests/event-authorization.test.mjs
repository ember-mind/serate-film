import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";

import Database from "better-sqlite3";
import { SignJWT } from "jose";

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "serate-film-actions-"));
const databasePath = path.join(tempRoot, "authorization.sqlite");
process.env.DATABASE_PATH = databasePath;
process.env.SESSION_SECRET = "authorization-harness-secret-at-least-32-bytes";

const core = await import("../lib/actions.ts");
const discussion = await import("../lib/event-discussion-actions.ts");
const experience = await import("../lib/event-experience-actions.ts");
const room = await import("../lib/room-actions.ts");
const { EVENT_ACTION_AUTHORIZATION, EventAuthorizationError } = await import(
  "../lib/access.ts"
);

const actions = { ...core, ...discussion, ...experience, ...room };
const sqlite = new Database(databasePath);
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");

after(() => {
  sqlite.close();
  fs.rmSync(tempRoot, { recursive: true, force: true });
});

const insertUser = sqlite.prepare(
  "INSERT INTO users (username, name, password_hash, is_admin) VALUES (?, ?, 'unused', ?)"
);
const userId = (username, isAdmin = 0) =>
  Number(insertUser.run(username, username, isAdmin).lastInsertRowid);

const ids = sqlite.transaction(() => {
  const creator = userId("creator");
  const admin = userId("admin", 1);
  const member = userId("member");
  const optedOut = userId("opted_out");
  const outsider = userId("outsider");
  const tokenUser = userId("token_user");
  const circleMember = userId("circle_member");
  const attendee = userId("attendee");
  const nonAttendee = userId("non_attendee");

  const circle = Number(
    sqlite
      .prepare("INSERT INTO circles (name, slug, owner_id) VALUES ('Auth Circle', 'auth-circle', ?)")
      .run(creator).lastInsertRowid
  );
  const addCircleMember = sqlite.prepare(
    "INSERT INTO circle_members (circle_id, user_id, role, status) VALUES (?, ?, ?, 'active')"
  );
  addCircleMember.run(circle, creator, "owner");
  addCircleMember.run(circle, circleMember, "member");

  const addMovie = sqlite.prepare(
    "INSERT INTO movies (title, year, added_by) VALUES (?, ?, ?)"
  );
  const movieA = Number(addMovie.run("Authorization A", 2031, creator).lastInsertRowid);
  const movieB = Number(addMovie.run("Authorization B", 2032, creator).lastInsertRowid);

  const addEvent = sqlite.prepare(`
    INSERT INTO events (title, status, created_by, access, circle_id, viewing_mode)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const makeEvent = (title, status, access, circleId = null, viewingMode = "in_person") => {
    const eventId = Number(
      addEvent.run(title, status, creator, access, circleId, viewingMode).lastInsertRowid
    );
    const dateId = Number(
      sqlite
        .prepare("INSERT INTO event_dates (event_id, date) VALUES (?, ?)")
        .run(eventId, `203${eventId % 10}-12-1${eventId % 9}`).lastInsertRowid
    );
    const eventMovieId = Number(
      sqlite
        .prepare("INSERT INTO event_movies (event_id, movie_id, added_by) VALUES (?, ?, ?)")
        .run(eventId, eventId % 2 ? movieA : movieB, creator).lastInsertRowid
    );
    sqlite
      .prepare("INSERT INTO event_invite_links (event_id, token) VALUES (?, ?)")
      .run(eventId, `token-${eventId}`);
    return { eventId, dateId, eventMovieId };
  };

  const inviteOpen = makeEvent("Invite Open", "open", "invite_only");
  const foreignOpen = makeEvent("Foreign Open", "open", "invite_only");
  const circleOpen = makeEvent("Circle Open", "open", "circle", circle);
  const clubOpen = makeEvent("Club Open", "open", "club");
  const publicOpen = makeEvent("Public Open", "open", "public");
  const runoff = makeEvent("Runoff", "runoff", "invite_only");
  const scheduled = makeEvent("Scheduled", "scheduled", "invite_only");
  const done = makeEvent("Done", "done", "invite_only");
  const cancelled = makeEvent("Cancelled", "cancelled", "invite_only");
  const licensed = makeEvent(
    "Licensed",
    "scheduled",
    "invite_only",
    null,
    "licensed_public"
  );

  const addInvitee = sqlite.prepare(
    "INSERT INTO event_invitees (event_id, user_id) VALUES (?, ?)"
  );
  for (const event of [inviteOpen, foreignOpen, runoff, scheduled, done, licensed]) {
    for (const invitee of [creator, member, optedOut]) addInvitee.run(event.eventId, invitee);
  }
  addInvitee.run(done.eventId, attendee);
  addInvitee.run(done.eventId, nonAttendee);
  addInvitee.run(scheduled.eventId, attendee);
  addInvitee.run(scheduled.eventId, nonAttendee);

  sqlite
    .prepare("INSERT INTO event_rsvps (event_id, user_id, status) VALUES (?, ?, 'no')")
    .run(inviteOpen.eventId, optedOut);
  sqlite
    .prepare("INSERT INTO event_rsvps (event_id, user_id, status) VALUES (?, ?, 'no')")
    .run(scheduled.eventId, optedOut);
  sqlite
    .prepare("INSERT INTO attendance (event_id, user_id) VALUES (?, ?)")
    .run(done.eventId, attendee);
  sqlite
    .prepare("INSERT INTO attendance (event_id, user_id) VALUES (?, ?)")
    .run(done.eventId, creator);
  sqlite
    .prepare("INSERT INTO ratings (event_id, user_id, stars, comment) VALUES (?, ?, 5, ?)")
    .run(done.eventId, creator, "Creator review");
  const comment = Number(
    sqlite
      .prepare(
        "INSERT INTO rating_comments (event_id, rating_user_id, author_user_id, body) VALUES (?, ?, ?, ?)"
      )
      .run(done.eventId, creator, attendee, "Existing reply").lastInsertRowid
  );

  const needA = Number(
    sqlite
      .prepare("INSERT INTO event_needs (event_id, item) VALUES (?, 'Need A')")
      .run(inviteOpen.eventId).lastInsertRowid
  );
  const needB = Number(
    sqlite
      .prepare("INSERT INTO event_needs (event_id, item) VALUES (?, 'Need B')")
      .run(foreignOpen.eventId).lastInsertRowid
  );
  sqlite
    .prepare("INSERT INTO date_votes (event_date_id, user_id) VALUES (?, ?)")
    .run(inviteOpen.dateId, member);
  sqlite
    .prepare("INSERT INTO movie_votes (event_movie_id, user_id) VALUES (?, ?)")
    .run(inviteOpen.eventMovieId, member);
  const inviteOpenSecondMovie = Number(
    sqlite
      .prepare("INSERT INTO event_movies (event_id, movie_id, added_by) VALUES (?, ?, ?)")
      .run(
        inviteOpen.eventId,
        inviteOpen.eventId % 2 ? movieB : movieA,
        creator
      ).lastInsertRowid
  );
  const memberBallot = Number(
    sqlite
      .prepare("INSERT INTO movie_ballots (event_id, user_id) VALUES (?, ?)")
      .run(inviteOpen.eventId, member).lastInsertRowid
  );
  sqlite
    .prepare(
      "INSERT INTO movie_ballot_items (ballot_id, event_movie_id, rank, veto) VALUES (?, ?, 1, 0)"
    )
    .run(memberBallot, inviteOpen.eventMovieId);

  sqlite.prepare(`
    INSERT INTO event_rooms (
      event_id, mode, media_provider, rights_basis, playback_status, revision, updated_by
    ) VALUES (?, 'watch_along', 'external', 'consumer_account', 'waiting', 0, ?)
  `).run(scheduled.eventId, creator);
  const foreignPoll = Number(
    sqlite
      .prepare("INSERT INTO room_polls (event_id, question, created_by) VALUES (?, ?, ?)")
      .run(licensed.eventId, "Foreign poll", creator).lastInsertRowid
  );
  const foreignOption = Number(
    sqlite
      .prepare("INSERT INTO room_poll_options (poll_id, label) VALUES (?, 'Foreign option')")
      .run(foreignPoll).lastInsertRowid
  );
  sqlite
    .prepare(
      "INSERT INTO screening_licenses (event_id, status, expires_at) VALUES (?, 'submitted', '2099-12-31')"
    )
    .run(licensed.eventId);

  return {
    creator,
    admin,
    member,
    optedOut,
    outsider,
    tokenUser,
    circleMember,
    attendee,
    nonAttendee,
    movieA,
    movieB,
    circle,
    inviteOpen,
    foreignOpen,
    circleOpen,
    clubOpen,
    publicOpen,
    runoff,
    scheduled,
    done,
    cancelled,
    licensed,
    comment,
    needA,
    needB,
    inviteOpenSecondMovie,
    foreignPoll,
    foreignOption,
  };
})();

const tokens = new Map();
async function actAs(id) {
  if (id === null) {
    globalThis.__serateServerActionTest.setSessionToken(null);
    return;
  }
  if (!tokens.has(id)) {
    const token = await new SignJWT({ uid: id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
    tokens.set(id, token);
  }
  globalThis.__serateServerActionTest.setSessionToken(tokens.get(id));
}

function form(entries = {}) {
  const data = new FormData();
  for (const [name, value] of Object.entries(entries)) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(name, String(item));
  }
  return data;
}

function databaseState() {
  const tables = sqlite
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
    .pluck()
    .all();
  return JSON.stringify(
    tables.map((table) => [
      table,
      sqlite.prepare(`SELECT * FROM "${table}" ORDER BY rowid`).all(),
    ])
  );
}

async function expectDeniedWithoutWrites(call) {
  const before = databaseState();
  await assert.rejects(call);
  assert.equal(databaseState(), before, "denial must happen before every database write");
}

const anonymousCalls = {
  createEvent: () => actions.createEvent(undefined, form()),
  createEventInviteLink: () => actions.createEventInviteLink(ids.inviteOpen.eventId),
  regenerateEventInviteLink: () => actions.regenerateEventInviteLink(ids.inviteOpen.eventId),
  acceptEventInvite: () => actions.acceptEventInvite(`token-${ids.inviteOpen.eventId}`),
  saveEventContribution: () => actions.saveEventContribution(ids.inviteOpen.eventId, form()),
  addEventNeed: () => actions.addEventNeed(ids.inviteOpen.eventId, form()),
  toggleEventNeedClaim: () => actions.toggleEventNeedClaim(ids.inviteOpen.eventId, ids.needA),
  deleteEventNeed: () => actions.deleteEventNeed(ids.inviteOpen.eventId, ids.needA),
  proposeEventMovie: () => actions.proposeEventMovie(ids.inviteOpen.eventId, undefined, form()),
  proposeEventDate: () => actions.proposeEventDate(ids.inviteOpen.eventId, undefined, form()),
  submitVotes: () => actions.submitVotes(ids.inviteOpen.eventId, form()),
  startRunoff: () => actions.startRunoff(ids.inviteOpen.eventId),
  submitRunoffVote: () => actions.submitRunoffVote(ids.runoff.eventId, form()),
  addEventInvitees: () => actions.addEventInvitees(ids.inviteOpen.eventId, form()),
  closeEvent: () => actions.closeEvent(ids.inviteOpen.eventId, form()),
  reopenEvent: () => actions.reopenEvent(ids.scheduled.eventId),
  cancelEvent: () => actions.cancelEvent(ids.inviteOpen.eventId),
  markWatched: () => actions.markWatched(ids.scheduled.eventId, form()),
  rateEvent: () => actions.rateEvent(ids.done.eventId, form()),
  toggleReviewLike: () => actions.toggleReviewLike(ids.done.eventId, ids.creator),
  saveEventNotes: () => actions.saveEventNotes(ids.inviteOpen.eventId, form()),
  setEventParticipation: () =>
    actions.setEventParticipation(ids.inviteOpen.eventId, undefined, form()),
  submitConsensusBallot: () =>
    actions.submitConsensusBallot(ids.inviteOpen.eventId, undefined, form()),
  addRatingComment: () =>
    actions.addRatingComment(ids.done.eventId, ids.creator, undefined, form()),
  deleteRatingComment: () => actions.deleteRatingComment(ids.comment),
  postEventDiscussionMessage: () =>
    actions.postEventDiscussionMessage(ids.inviteOpen.eventId, undefined, form()),
  configureRoom: () => actions.configureRoom(ids.scheduled.eventId, undefined, form()),
  joinRoom: () => actions.joinRoom(ids.scheduled.eventId),
  heartbeatRoom: () => actions.heartbeatRoom(ids.scheduled.eventId),
  setRoomReady: () => actions.setRoomReady(ids.scheduled.eventId, true),
  controlRoom: () =>
    actions.controlRoom(ids.scheduled.eventId, {
      command: "play",
      positionSeconds: 0,
      revision: 0,
    }),
  postRoomMessage: () => actions.postRoomMessage(ids.scheduled.eventId, "x", 0),
  postRoomReaction: () => actions.postRoomReaction(ids.scheduled.eventId, "👏", 0),
  createRoomPoll: () => actions.createRoomPoll(ids.scheduled.eventId, "Q?", "A,B"),
  voteRoomPoll: () =>
    actions.voteRoomPoll(ids.scheduled.eventId, ids.foreignPoll, ids.foreignOption),
  closeRoomPoll: () => actions.closeRoomPoll(ids.scheduled.eventId, ids.foreignPoll),
  submitScreeningLicense: () =>
    actions.submitScreeningLicense(ids.licensed.eventId, undefined, form()),
  reviewScreeningLicense: () => actions.reviewScreeningLicense(ids.licensed.eventId, "verified"),
};

test("all 38 session-requiring event Server Actions deny anonymous invocation before writes", async () => {
  assert.deepEqual(
    Object.keys(anonymousCalls).sort(),
    Object.keys(EVENT_ACTION_AUTHORIZATION)
      .filter((name) => name !== "signupWithInvite")
      .sort()
  );
  await actAs(null);
  for (const [name, call] of Object.entries(anonymousCalls)) {
    await expectDeniedWithoutWrites(call).catch((error) => {
      error.message = `${name}: ${error.message}`;
      throw error;
    });
  }
});

test("stale event tokens cannot create an account or chain into an unrelated club event", async () => {
  await actAs(null);
  for (const [event, username] of [
    [ids.done, "stale_done_signup"],
    [ids.cancelled, "stale_cancelled_signup"],
  ]) {
    const before = databaseState();
    const result = await actions.signupWithInvite(
      undefined,
      form({
        token: `token-${event.eventId}`,
        name: "Stale Token",
        username,
        password: "long-enough-password",
        passwordConfirm: "long-enough-password",
      })
    );
    assert.ok(result?.error, `${event.eventId} stale signup must be rejected`);
    assert.equal(databaseState(), before, "stale signup must not write users or event membership");
    assert.equal(
      sqlite.prepare("SELECT count(*) FROM users WHERE username = ?").pluck().get(username),
      0
    );
  }

  const nonexistentUserId = Number(
    sqlite.prepare("SELECT max(id) + 1000 FROM users").pluck().get()
  );
  await actAs(nonexistentUserId);
  await expectDeniedWithoutWrites(() =>
    actions.postEventDiscussionMessage(
      ids.clubOpen.eventId,
      undefined,
      form({ body: "stale-token club chain" })
    )
  );
});

test("an active invite token admits a new account only to its target event", async () => {
  await actAs(null);
  const username = "active_invite_signup";
  await assert.rejects(
    () =>
      actions.signupWithInvite(
        undefined,
        form({
          token: `token-${ids.foreignOpen.eventId}`,
          name: "Active Invite",
          username,
          password: "long-enough-password",
          passwordConfirm: "long-enough-password",
        })
      ),
    (error) =>
      error instanceof globalThis.__serateServerActionTest.TestRedirect &&
      error.location === `/serate/${ids.foreignOpen.eventId}?benvenuto=1`
  );
  const admittedUser = sqlite
    .prepare("SELECT id FROM users WHERE username = ?")
    .pluck()
    .get(username);
  assert.equal(
    sqlite
      .prepare("SELECT count(*) FROM event_invitees WHERE event_id = ? AND user_id = ?")
      .pluck()
      .get(ids.foreignOpen.eventId, admittedUser),
    1
  );
  assert.equal(
    sqlite
      .prepare("SELECT count(*) FROM event_invitees WHERE event_id = ? AND user_id = ?")
      .pluck()
      .get(ids.inviteOpen.eventId, admittedUser),
    0
  );
});

test("central access policy is load-bearing across invite, circle, club, and public events", async () => {
  await actAs(ids.outsider);
  await expectDeniedWithoutWrites(() =>
    actions.postEventDiscussionMessage(
      ids.inviteOpen.eventId,
      undefined,
      form({ body: "blocked" })
    )
  );
  await expectDeniedWithoutWrites(() =>
    actions.postEventDiscussionMessage(
      ids.circleOpen.eventId,
      undefined,
      form({ body: "blocked" })
    )
  );

  await actions.postEventDiscussionMessage(
    ids.clubOpen.eventId,
    undefined,
    form({ body: "club" })
  );
  await actions.postEventDiscussionMessage(
    ids.publicOpen.eventId,
    undefined,
    form({ body: "public" })
  );
  assert.equal(
    sqlite
      .prepare("SELECT count(*) FROM event_discussion_messages WHERE user_id = ?")
      .pluck()
      .get(ids.outsider),
    2
  );

  await actAs(ids.circleMember);
  await actions.postEventDiscussionMessage(
    ids.circleOpen.eventId,
    undefined,
    form({ body: "circle" })
  );

  // Controlled mutation witness: the same user and production action change only
  // when the central event access fact changes.
  await actAs(ids.outsider);
  sqlite
    .prepare("UPDATE events SET access = 'public' WHERE id = ?")
    .run(ids.inviteOpen.eventId);
  await actions.postEventDiscussionMessage(
    ids.inviteOpen.eventId,
    undefined,
    form({ body: "mutation witness" })
  );
  sqlite
    .prepare("UPDATE events SET access = 'invite_only' WHERE id = ?")
    .run(ids.inviteOpen.eventId);
  await expectDeniedWithoutWrites(() =>
    actions.postEventDiscussionMessage(
      ids.inviteOpen.eventId,
      undefined,
      form({ body: "negative witness" })
    )
  );
});

test("participation, management, admin, attendance, and state boundaries are vertical", async () => {
  await actAs(ids.optedOut);
  await expectDeniedWithoutWrites(() =>
    actions.postEventDiscussionMessage(
      ids.inviteOpen.eventId,
      undefined,
      form({ body: "opted out" })
    )
  );
  await expectDeniedWithoutWrites(() => actions.joinRoom(ids.scheduled.eventId));

  await actAs(ids.member);
  await expectDeniedWithoutWrites(() =>
    actions.addEventNeed(ids.inviteOpen.eventId, form({ item: "manager only" }))
  );
  await expectDeniedWithoutWrites(() =>
    actions.postEventDiscussionMessage(
      ids.scheduled.eventId,
      undefined,
      form({ body: "wrong state" })
    )
  );
  await expectDeniedWithoutWrites(() =>
    actions.reviewScreeningLicense(ids.licensed.eventId, "verified")
  );

  await actAs(ids.creator);
  await actions.addEventNeed(ids.inviteOpen.eventId, form({ item: "manager allowed" }));
  await expectDeniedWithoutWrites(() => actions.markWatched(ids.inviteOpen.eventId, form()));

  await actAs(ids.nonAttendee);
  await expectDeniedWithoutWrites(() =>
    actions.rateEvent(ids.done.eventId, form({ stars: 4, comment: "not there" }))
  );
  await expectDeniedWithoutWrites(() => actions.toggleReviewLike(ids.done.eventId, ids.creator));

  await actAs(ids.attendee);
  await actions.rateEvent(ids.done.eventId, form({ stars: 4, comment: "was there" }));
  await actions.toggleReviewLike(ids.done.eventId, ids.creator);
  assert.equal(
    sqlite
      .prepare("SELECT stars FROM ratings WHERE event_id = ? AND user_id = ?")
      .pluck()
      .get(ids.done.eventId, ids.attendee),
    4
  );

  await actAs(ids.admin);
  await actions.reviewScreeningLicense(ids.licensed.eventId, "verified");
  assert.equal(
    sqlite
      .prepare("SELECT status FROM screening_licenses WHERE event_id = ?")
      .pluck()
      .get(ids.licensed.eventId),
    "verified"
  );
});

test("cross-event and ineligible IDs produce zero writes", async () => {
  await actAs(ids.member);
  const beforeQuietNoOp = databaseState();
  await actions.toggleEventNeedClaim(ids.inviteOpen.eventId, ids.needB);
  assert.equal(databaseState(), beforeQuietNoOp);

  const foreignVotes = form({
    dateIds: ids.foreignOpen.dateId,
    movieIds: ids.foreignOpen.eventMovieId,
  });
  const beforeVotes = databaseState();
  await actions.submitVotes(ids.inviteOpen.eventId, foreignVotes);
  assert.equal(databaseState(), beforeVotes, "foreign choices cannot erase the valid ballot");

  await actAs(ids.creator);
  const beforeManagerIdor = databaseState();
  await actions.deleteEventNeed(ids.inviteOpen.eventId, ids.needB);
  await actions.closeEvent(
    ids.inviteOpen.eventId,
    form({
      chosenDate: sqlite
        .prepare("SELECT date FROM event_dates WHERE id = ?")
        .pluck()
        .get(ids.foreignOpen.dateId),
      chosenMovieId: ids.movieB,
    })
  );
  await actions.closeRoomPoll(ids.scheduled.eventId, ids.foreignPoll);
  assert.equal(databaseState(), beforeManagerIdor);

  const beforeAttendance = databaseState();
  await actions.markWatched(
    ids.scheduled.eventId,
    form({ attendees: [ids.attendee, ids.outsider] })
  );
  assert.equal(databaseState(), beforeAttendance, "an ineligible attendee rejects the whole mutation");
});

test("consensus ballots reject malformed, gapped, duplicate, and foreign IDs before writes", async () => {
  await actAs(ids.member);
  const invalidBallots = [
    form({
      rank1: ids.foreignOpen.eventMovieId,
      rank2: ids.inviteOpenSecondMovie,
    }),
    form({ rank1: "not-an-id", rank2: ids.inviteOpenSecondMovie }),
    form({ rank1: "1e0", rank2: ids.inviteOpenSecondMovie }),
    form({
      rank1: ids.inviteOpen.eventMovieId,
      rank2: ids.inviteOpen.eventMovieId,
    }),
    form({
      rank1: ids.inviteOpen.eventMovieId,
      rank2: "",
      rank3: ids.inviteOpenSecondMovie,
    }),
    form({
      rank1: ids.inviteOpen.eventMovieId,
      vetoIds: [ids.inviteOpenSecondMovie, ids.inviteOpenSecondMovie],
    }),
    form({
      rank1: ids.inviteOpen.eventMovieId,
      vetoIds: ids.foreignOpen.eventMovieId,
    }),
    form({
      rank1: [ids.inviteOpen.eventMovieId, ids.inviteOpenSecondMovie],
    }),
  ];

  for (const ballot of invalidBallots) {
    const before = databaseState();
    const result = await actions.submitConsensusBallot(
      ids.inviteOpen.eventId,
      undefined,
      ballot
    );
    assert.ok(result?.error);
    assert.equal(databaseState(), before, "invalid ballot must preserve the prior ballot exactly");
  }
});

test("regenerated invite tokens invalidate the old capability and never cross events", async () => {
  const eventId = ids.inviteOpen.eventId;
  const oldToken = sqlite
    .prepare("SELECT token FROM event_invite_links WHERE event_id = ?")
    .pluck()
    .get(eventId);

  await actAs(ids.creator);
  await actions.regenerateEventInviteLink(eventId);
  const newToken = sqlite
    .prepare("SELECT token FROM event_invite_links WHERE event_id = ?")
    .pluck()
    .get(eventId);
  assert.notEqual(newToken, oldToken);

  await actAs(null);
  const beforeStaleSignup = databaseState();
  const staleSignup = await actions.signupWithInvite(
    undefined,
    form({
      token: oldToken,
      name: "Rotated Token",
      username: "rotated_token_signup",
      password: "long-enough-password",
      passwordConfirm: "long-enough-password",
    })
  );
  assert.ok(staleSignup?.error);
  assert.equal(databaseState(), beforeStaleSignup, "rotated signup token must not write");

  await actAs(ids.tokenUser);
  await expectDeniedWithoutWrites(() => actions.acceptEventInvite(oldToken));
  await assert.rejects(
    () => actions.acceptEventInvite(newToken),
    (error) =>
      error instanceof globalThis.__serateServerActionTest.TestRedirect &&
      error.location === `/serate/${eventId}?invito=accettato`
  );
  assert.equal(
    sqlite
      .prepare("SELECT count(*) FROM event_invitees WHERE event_id = ? AND user_id = ?")
      .pluck()
      .get(eventId, ids.tokenUser),
    1
  );
  assert.equal(
    sqlite
      .prepare("SELECT count(*) FROM event_invitees WHERE event_id = ? AND user_id = ?")
      .pluck()
      .get(ids.foreignOpen.eventId, ids.tokenUser),
    0
  );
});

test("acceptEventInvite rechecks token and active state inside its write transaction", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "lib/actions.ts"), "utf8");
  const start = source.indexOf("export async function acceptEventInvite");
  const end = source.indexOf("export async function saveEventContribution", start);
  const body = source.slice(start, end);
  assert.match(body, /db\.transaction\(\(tx\) =>/);
  assert.match(body, /eventInviteLinks\.token, token/);
  assert.match(body, /isEventActionStateAllowed\("acceptEventInvite"/);
  assert.ok(body.indexOf("isEventActionStateAllowed") < body.indexOf("tx.insert(eventInvitees)"));
  assert.doesNotMatch(body, /await db\s*\.insert\(eventInvitees\)/);
});

test("authorization failures use the central deny type after authentication", async () => {
  await actAs(ids.outsider);
  await assert.rejects(
    () => actions.addEventNeed(ids.inviteOpen.eventId, form({ item: "x" })),
    EventAuthorizationError
  );
});
