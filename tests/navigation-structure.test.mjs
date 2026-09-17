import assert from "node:assert/strict";
import test from "node:test";
import { primaryNavigation, libraryNavigation, eveningsNavigation, matchesNavigation } from "../lib/navigation.ts";

test("one primary model exposes the four approved destinations in order", () => {
  assert.deepEqual(primaryNavigation.map(({ href, label }) => [href, label]), [
    ["/", "Home"], ["/film", "Cineteca"], ["/serate", "Serate"], ["/io", "Io"],
  ]);
});

test("actors, directors and journeys remain first-class library destinations", () => {
  assert.deepEqual(libraryNavigation.map(({ href }) => href), ["/film", "/watchlist", "/attori", "/registi", "/percorsi"]);
  for (const route of ["/attori", "/attori/amy-adams", "/registi", "/registi/denis-villeneuve", "/percorsi/3"]) {
    assert.deepEqual(primaryNavigation.filter((item) => matchesNavigation(route, item)).map((item) => item.label), ["Cineteca"]);
    assert.equal(libraryNavigation.filter((item) => matchesNavigation(route, item)).length, 1);
  }
});

test("every existing route family has exactly one parent; matching respects path boundaries", () => {
  for (const route of ["/", "/attivita", "/film/arrival-2016", "/watchlist", "/trova-film", "/serate/1/sala", "/storico", "/circoli/a", "/club/a", "/persone/a", "/io/amici", "/io/privacy", "/io/anno/2026", "/admin", "/notifiche"]) {
    assert.equal(primaryNavigation.filter((item) => matchesNavigation(route, item)).length, 1, route);
  }
  for (const route of ["/filmmaker", "/attorino", "/registrolog", "/ios", "/seratetime"]) {
    assert.equal(primaryNavigation.filter((item) => matchesNavigation(route, item)).length, 0, route);
  }
});

test("circles and public discovery stay reachable inside Serate", () => {
  assert.ok(eveningsNavigation.some((item) => item.href === "/circoli"));
  assert.ok(eveningsNavigation.some((item) => item.href === "/club"));
});
