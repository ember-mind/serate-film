import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeNext } from "../lib/nav.ts";

const origin = "https://cinema.example";

test("missing destinations fall back to the home page", () => {
  for (const value of [null, undefined, ""]) assert.equal(sanitizeNext(value), "/");
});

test("normal internal paths, query strings and fragments survive", () => {
  for (const value of ["/", "/io", "/serate/42?invito=accettato#voti", "/film?q=caff%C3%A8", "/login?next=%2Fio", "/film?source=https://example.org"]) {
    assert.equal(sanitizeNext(value), value);
  }
});

test("absolute, protocol-relative and scheme-like destinations are rejected", () => {
  for (const value of ["https://example.org", "//example.org", "///example.org", "javascript:alert(1)", "/javascript:alert(1)", "io", " //example.org"]) {
    assert.equal(sanitizeNext(value), "/", JSON.stringify(value));
  }
});

test("backslashes cannot turn a root-relative path into an external origin", () => {
  for (const value of ["/\\example.org", "/\\\\example.org", "/safe\\path"]) {
    assert.equal(sanitizeNext(value), "/", JSON.stringify(value));
  }
  assert.equal(new URL(sanitizeNext("/\\example.org"), origin).origin, origin);
});

test("URL-parser control characters are rejected instead of silently stripped", () => {
  for (const character of ["\u0000", "\t", "\n", "\r", "\u001f", "\u007f"]) {
    assert.equal(sanitizeNext(`/${character}/example.org`), "/");
    assert.equal(sanitizeNext(`/io?q=${character}`), "/");
  }
});

test("normalization must not produce a new protocol-relative destination", () => {
  for (const value of ["/safe/..//example.org", "/%2e//example.org", "/safe/%2e%2e//example.org"]) {
    assert.equal(sanitizeNext(value), "/", value);
  }
});

test("ordinary dot segments are normalized while preserving search and hash", () => {
  assert.equal(sanitizeNext("/film/../io?tab=visti#lista"), "/io?tab=visti#lista");
});

test("returned destinations stay same-origin across separator combinations", () => {
  const separators = ["/", "\\", "\t", "\n", "\r", ".", "%2e", "%2f", "%5c"];
  for (const first of separators) {
    for (const second of separators) {
      const value = `/${first}${second}example.org`;
      const sanitized = sanitizeNext(value);
      assert.ok(sanitized.startsWith("/") && !sanitized.startsWith("//"));
      assert.equal(new URL(sanitized, origin).origin, origin, JSON.stringify(value));
    }
  }
});
