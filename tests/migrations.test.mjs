import assert from "node:assert/strict";
import test from "node:test";

import { openHarness } from "./db-harness.mjs";

const count = (sqlite, table) =>
  sqlite.prepare(`SELECT count(*) AS n FROM ${table}`).get().n;

test("a synthetic 0018-era database upgrades and backfills privacy boundaries", () => {
  const harness = openHarness({ throughIndex: 18 });
  try {
    const passwordHash = "$2b$04$sL8CxWHQyMHuQtNai9pBzu2sS8zVqQOe1ElELIVdGbOItM3sPRJrK";
    const addUser = harness.sqlite.prepare(
      "INSERT INTO users (username, name, password_hash, is_admin) VALUES (?, ?, ?, ?)"
    );
    const owner = Number(addUser.run("legacy_owner", "Legacy Owner", passwordHash, 1).lastInsertRowid);
    const member = Number(addUser.run("legacy_member", "Legacy Member", passwordHash, 0).lastInsertRowid);
    const invitedEvent = Number(harness.sqlite.prepare(
      "INSERT INTO events (title, created_by) VALUES ('Legacy Invite', ?)"
    ).run(owner).lastInsertRowid);
    const clubEvent = Number(harness.sqlite.prepare(
      "INSERT INTO events (title, created_by) VALUES ('Legacy Club', ?)"
    ).run(owner).lastInsertRowid);
    harness.sqlite.prepare("INSERT INTO event_invitees (event_id, user_id) VALUES (?, ?)")
      .run(invitedEvent, member);

    harness.migrateToLatest();

    assert.equal(count(harness.sqlite, "__drizzle_migrations"), 23);
    assert.equal(count(harness.sqlite, "user_profiles"), 2);
    assert.equal(count(harness.sqlite, "circles"), 1);
    assert.equal(count(harness.sqlite, "circle_members"), 2);
    assert.equal(
      harness.sqlite.prepare("SELECT owner_id FROM circles WHERE slug = 'serate-film'").pluck().get(),
      owner
    );
    assert.deepEqual(
      harness.sqlite.prepare("SELECT id, access FROM events ORDER BY id").all(),
      [
        { id: invitedEvent, access: "invite_only" },
        { id: clubEvent, access: "circle" },
      ]
    );
    assert.equal(count(harness.sqlite, "journeys"), 0);
    assert.equal(harness.sqlite.pragma("foreign_key_check").length, 0);

    const stableCounts = {
      migrations: count(harness.sqlite, "__drizzle_migrations"),
      profiles: count(harness.sqlite, "user_profiles"),
      circles: count(harness.sqlite, "circles"),
      members: count(harness.sqlite, "circle_members"),
    };
    harness.migrateToLatest();
    assert.deepEqual(
      {
        migrations: count(harness.sqlite, "__drizzle_migrations"),
        profiles: count(harness.sqlite, "user_profiles"),
        circles: count(harness.sqlite, "circles"),
        members: count(harness.sqlite, "circle_members"),
      },
      stableCounts,
      "reapplying migrations is idempotent"
    );
  } finally {
    harness.cleanup();
  }
});
