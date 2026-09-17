import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import Database from "better-sqlite3";
import { SignJWT } from "jose";

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "serate-circle-invites-"));
process.env.DATABASE_PATH = path.join(temporary, "test.sqlite");
process.env.SESSION_SECRET = "circle-invite-regression-secret-at-least-32-bytes";
const { inviteCircleMember } = await import("../lib/social-actions.ts");
const sqlite = new Database(process.env.DATABASE_PATH);
sqlite.pragma("foreign_keys = ON");
after(() => {
  sqlite.close();
  fs.rmSync(temporary, { recursive: true, force: true });
});

let sequence = 0;
function fixture() {
  const prefix = `circle-${++sequence}`;
  const insertUser = sqlite.prepare("INSERT INTO users (username, name, password_hash) VALUES (?, ?, 'unused')");
  const people = Object.fromEntries(["owner", "moderator", "peer", "member", "newcomer"].map(role => [role,
    Number(insertUser.run(`${prefix}-${role}`, role).lastInsertRowid),
  ]));
  const circle = Number(sqlite.prepare("INSERT INTO circles (name, slug, owner_id) VALUES (?, ?, ?)").run(prefix, prefix, people.owner).lastInsertRowid);
  const insertMember = sqlite.prepare("INSERT INTO circle_members (circle_id, user_id, role, status, invited_by, joined_at) VALUES (?, ?, ?, 'active', ?, '2026-01-01 00:00:00')");
  for (const [person, role] of [["owner", "owner"], ["moderator", "moderator"], ["peer", "moderator"], ["member", "member"]]) {
    insertMember.run(circle, people[person], role, people.owner);
  }
  const membership = userId => sqlite.prepare("SELECT * FROM circle_members WHERE circle_id = ? AND user_id = ?").get(circle, userId);
  return { circle, ...people, membership };
}

async function invite(actorId, circleId, targetId) {
  const token = await new SignJWT({ uid: actorId })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
  globalThis.__serateServerActionTest.setSessionToken(token);
  const form = new FormData();
  form.set("userId", String(targetId));
  await inviteCircleMember(circleId, form);
}

test("a moderator cannot demote another moderator through an invitation", async () => {
  const f = fixture();
  const before = f.membership(f.peer);
  await invite(f.moderator, f.circle, f.peer);
  assert.deepEqual(f.membership(f.peer), before);
});

test("re-inviting an active member preserves status, role and original join time", async () => {
  const f = fixture();
  const before = f.membership(f.member);
  await invite(f.owner, f.circle, f.member);
  assert.deepEqual(f.membership(f.member), before);
});

test("the owner membership cannot be changed through invitations", async () => {
  const f = fixture();
  const before = f.membership(f.owner);
  await invite(f.moderator, f.circle, f.owner);
  assert.deepEqual(f.membership(f.owner), before);
});

test("a moderator can invite a new member and repeat the invitation safely", async () => {
  const f = fixture();
  await invite(f.moderator, f.circle, f.newcomer);
  await invite(f.moderator, f.circle, f.newcomer);
  const result = f.membership(f.newcomer);
  assert.equal(result.role, "member");
  assert.equal(result.status, "invited");
  assert.equal(result.invited_by, f.moderator);
});

test("a manager may turn a pending membership request into an invitation", async () => {
  const f = fixture();
  sqlite.prepare("INSERT INTO circle_members (circle_id, user_id, role, status) VALUES (?, ?, 'member', 'requested')").run(f.circle, f.newcomer);
  await invite(f.owner, f.circle, f.newcomer);
  assert.equal(f.membership(f.newcomer).status, "invited");
  assert.equal(f.membership(f.newcomer).role, "member");
});

test("an ordinary member cannot invite somebody into a private circle", async () => {
  const f = fixture();
  await assert.rejects(invite(f.member, f.circle, f.newcomer));
  assert.equal(f.membership(f.newcomer), undefined);
});
