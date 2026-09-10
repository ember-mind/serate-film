import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { openHarness, runLifecycle } from "./db-harness.mjs";

const expected = {
  login: { accepted: true, rejected: true },
  event: { status: "done", chosenDate: "2030-05-10", chosenMovieIsAlpha: true },
  invitees: 3,
  rsvps: 2,
  dateVotes: 2,
  approvalVotes: 3,
  rankedBallots: 2,
  attendance: 2,
  ratings: 2,
  likes: 1,
  comments: 1,
  unreadBeforeOpen: 2,
  unreadAfterOpen: 0,
  hostJourney: { seen: 3, total: 3, complete: true, experience: 400 },
  guestJourney: { seen: 1, total: 3, complete: false, experience: 50 },
  foreignKeyErrors: 0,
  appliedMigrations: 23,
};

test("login-to-journey lifecycle is deterministic across two clean isolated runs", () => {
  const summaries = [];
  for (let run = 0; run < 2; run += 1) {
    const harness = openHarness();
    try {
      const summary = runLifecycle(harness.sqlite);
      summaries.push(summary);
      assert.deepEqual(summary, expected);
      assert.ok(fs.existsSync(harness.databasePath));
      assert.equal(harness.sqlite.pragma("journal_mode", { simple: true }), "delete");
    } finally {
      harness.cleanup();
    }
  }
  assert.deepEqual(summaries[0], summaries[1]);
});
