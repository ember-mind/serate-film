// Production-browser smoke test. All accounts and writes live in a disposable
// SQLite database created here; DATABASE_PATH from the environment is ignored.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import bcrypt from "bcryptjs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = path.resolve("artifacts/ui");
fs.mkdirSync(output, { recursive: true });
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "serate-ui-"));
const databasePath = path.join(temporary, "browser.sqlite");
const sqlite = new Database(databasePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
migrate(drizzle(sqlite), { migrationsFolder: path.resolve("db/migrations") });
const password = randomBytes(18).toString("hex");
const hash = bcrypt.hashSync(password, 10);
const addUser = sqlite.prepare("INSERT INTO users(username,name,password_hash) VALUES (?,?,?)");
const me = Number(addUser.run("ui-viewer", "Manu", hash).lastInsertRowid);
const owner = Number(addUser.run("ui-owner", "Giulia", hash).lastInsertRowid);
const blankUser = Number(addUser.run("ui-empty", "Nuovo membro", hash).lastInsertRowid);
const addMovie = sqlite.prepare("INSERT INTO movies(title,year,director,actors,genres,runtime) VALUES (?,?,?,?,?,?)");
const filmIds = [
  ["Arrival", 2016, "Denis Villeneuve", "Amy Adams, Jeremy Renner", "Fantascienza", 116],
  ["Whiplash", 2014, "Damien Chazelle", "Miles Teller", "Drammatico", 107],
  ["Interstellar", 2014, "Christopher Nolan", "Matthew McConaughey", "Fantascienza", 169],
  ["Grand Budapest Hotel", 2014, "Wes Anderson", "Ralph Fiennes", "Commedia", 100],
].map((movie) => Number(addMovie.run(...movie).lastInsertRowid));
for (const id of filmIds.slice(0, 3)) sqlite.prepare("INSERT INTO watchlist(movie_id,added_by) VALUES (?,?)").run(id, owner);
const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
function makeEvent(title, status, movieId = null, date = null, invited = true) {
  const id = Number(sqlite.prepare("INSERT INTO events(title,status,created_by,access,chosen_movie_id,chosen_date,location,start_time) VALUES (?,?,?,'invite_only',?,?,'Da Giulia','21:00')")
    .run(title, status, owner, movieId, date).lastInsertRowid);
  if (invited) sqlite.prepare("INSERT INTO event_invitees(event_id,user_id) VALUES (?,?)").run(id, me);
  const dates = [3, 5, 7].map((offset) => Number(sqlite.prepare("INSERT INTO event_dates(event_id,date) VALUES (?,?)").run(id, day(offset)).lastInsertRowid));
  const candidates = filmIds.slice(0, 3).map((movie) => Number(sqlite.prepare("INSERT INTO event_movies(event_id,movie_id) VALUES (?,?)").run(id, movie).lastInsertRowid));
  return { id, dates, candidates };
}
const next = makeEvent("Il sabato al cineclub", "scheduled", filmIds[0], day(9));
const open = makeEvent("Serata di ottobre", "open");
const done = makeEvent("La serata scorsa", "done", filmIds[3], day(-4));
sqlite.prepare("INSERT INTO attendance(event_id,user_id) VALUES (?,?)").run(done.id, me);
makeEvent("PRIVATE-EVENT-DO-NOT-DISCLOSE", "scheduled", filmIds[1], day(1), false);

const port = 3197;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [path.resolve("node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: { ...process.env, NODE_ENV: "production", DATABASE_PATH: databasePath, SESSION_SECRET: randomBytes(32).toString("hex"), NEXT_TELEMETRY_DISABLED: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (chunk) => { serverLog += chunk; });
server.stderr.on("data", (chunk) => { serverLog += chunk; });
const checks = [], pageErrors = [];
let browser;
const record = (name) => { checks.push(name); console.log("PASS", name); };
async function eventually(predicate, label, timeout = 15000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { if (await predicate()) return; await new Promise((resolve) => setTimeout(resolve, 100)); }
  throw new Error(`Timeout: ${label}`);
}
async function login(page, username) {
  await page.goto(`${origin}/login`);
  await page.getByLabel("Username", { exact: true }).fill(username);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Accedi", exact: true }).click();
  await page.waitForURL(origin + "/");
  await page.getByRole("heading", { name: "Il tuo cineclub.", exact: true }).waitFor();
}
async function screenshot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { await Promise.all([...document.querySelectorAll("main img")].map((image) => image.decode().catch(() => {}))); });
  await page.screenshot({ path: path.join(output, name + ".png"), fullPage: true, animations: "disabled" });
}
const primary = (page) => page.locator('nav[aria-label="Principale"]:visible');
async function noOverflow(page, name) {
  const metrics = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
  assert.ok(metrics.document <= metrics.viewport + 1, `${name}: horizontal overflow ${JSON.stringify(metrics)}`);
}

try {
  await eventually(async () => { try { return (await fetch(origin + "/login")).ok; } catch { return false; } }, "production server startup", 30000);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await login(page, "ui-viewer");
  assert.equal(await page.locator("h1").count(), 1);
  assert.ok(!(await page.locator("main").innerText()).includes("PRIVATE-EVENT"));
  assert.equal(await page.locator("#home-featured").innerText(), "Arrival");
  assert.deepEqual((await primary(page).getByRole("link").allTextContents()).map((s) => s.trim()), ["Home", "Cineteca", "Serate", "Io"]);
  record("real login, upcoming event and private-event exclusion");
  await screenshot(page, "home-desktop");

  for (const width of [320, 375, 390, 600, 601, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page, `home ${width}`);
    assert.equal(await primary(page).count(), 1);
    assert.deepEqual((await primary(page).getByRole("link").allTextContents()).map((s) => s.trim()), ["Home", "Cineteca", "Serate", "Io"]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await screenshot(page, "home-mobile");
  record("home reflow and identical navigation at nine viewport widths");

  // Click through the same contextual navigation on both desktop and mobile.
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await primary(page).getByRole("link", { name: "Cineteca", exact: true }).click();
    await page.waitForURL(origin + "/film");
    const library = page.getByRole("navigation", { name: "Sezioni della cineteca" });
    assert.deepEqual(await library.getByRole("link").allTextContents(), ["Film", "Watchlist", "Attori", "Registi", "Percorsi"]);
    await library.getByRole("link", { name: "Attori", exact: true }).click();
    await page.waitForURL(origin + "/attori");
    await noOverflow(page, `actors ${width}`);
    await page.locator('main a[href="/attori/amy-adams"]').first().click();
    await page.getByRole("heading", { name: "Amy Adams", exact: true }).waitFor();
    assert.equal(await primary(page).locator('[aria-current="page"]').innerText(), "Cineteca");
    await library.getByRole("link", { name: "Registi", exact: true }).click();
    await page.waitForURL(origin + "/registi");
    await noOverflow(page, `directors ${width}`);
    await screenshot(page, width === 390 ? "registi-mobile" : "registi-desktop");
    await page.locator('main a[href="/registi/denis-villeneuve"]').first().click();
    await page.getByRole("heading", { name: "Denis Villeneuve", exact: true }).waitFor();
    await library.getByRole("link", { name: "Percorsi", exact: true }).click();
    await page.waitForURL(origin + "/percorsi");
    await primary(page).getByRole("link", { name: "Serate", exact: true }).click();
    await page.getByRole("navigation", { name: "Sezioni delle serate" }).getByRole("link", { name: "I tuoi circoli", exact: true }).click();
    await page.waitForURL(origin + "/circoli");
  }
  record("actors, directors, filmographies, journeys and circles remain reachable on desktop/mobile");

  await page.setViewportSize({ width: 1440, height: 1000 });
  await primary(page).getByRole("link", { name: "Home", exact: true }).click();
  await page.waitForURL(origin + "/");
  await page.getByRole("link", { name: "Date e film · Serata di ottobre", exact: true }).click();
  await page.locator("#vota-date").waitFor();
  await page.locator('input[name="dateIds"]').first().locator("..").click();
  await page.getByRole("button", { name: "Salva disponibilità", exact: true }).click();
  await eventually(() => sqlite.prepare("SELECT 1 FROM date_votes WHERE user_id=?").get(me), "saved availability");
  await primary(page).getByRole("link", { name: "Home", exact: true }).click();
  await page.getByRole("link", { name: "Scegli i film · Serata di ottobre", exact: true }).waitFor();
  await page.getByRole("link", { name: "Scegli i film · Serata di ottobre", exact: true }).click();
  await page.locator('select[name="rank1"]').selectOption(String(open.candidates[0]));
  await page.getByRole("button", { name: "Vota", exact: true }).click();
  await eventually(() => sqlite.prepare("SELECT 1 FROM movie_ballots WHERE event_id=? AND user_id=?").get(open.id, me), "saved ballot");
  await primary(page).getByRole("link", { name: "Home", exact: true }).click();
  await page.waitForURL(origin + "/");
  assert.equal(await page.locator(`#home-vote-${open.id}`).count(), 0);
  record("real availability/ballot forms persist and home refreshes after client navigation");
  await screenshot(page, "home-after-vote");

  await page.keyboard.press("Control+Home");
  await page.locator('a[href="#main-content"]').focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => document.activeElement.id), "main-content");
  record("skip-to-content is keyboard operable");

  // Stress states are database fixtures, not UI mocks or production changes.
  const longTitle = "Un titolo davvero molto lungo per una serata piena di amici e film da scoprire insieme ".repeat(3);
  sqlite.prepare("UPDATE movies SET title=?, poster_url='/posters/missing-test.webp' WHERE id=?").run(longTitle, filmIds[0]);
  sqlite.prepare("UPDATE users SET name=? WHERE id=?").run("UnNomeMoltoLungoSenzaSpazi".repeat(8), me);
  for (let i = 0; i < 8; i++) makeEvent(`Un altro invito ${i + 1}`, "open");
  await page.goto(origin + "/");
  await page.setViewportSize({ width: 320, height: 844 });
  await noOverflow(page, "long titles and many invitations");
  const more = page.locator("main details summary");
  await more.focus(); await page.keyboard.press("Enter");
  assert.equal(await page.locator("main details").getAttribute("open"), "");
  await eventually(() => page.locator('section[aria-labelledby="home-featured"] img').evaluate((image) => image.complete && image.naturalWidth > 0 && image.src.includes("/generi/")), "missing-artwork fallback");
  await screenshot(page, "home-stress-mobile");
  record("long names/titles, progressive disclosure and failed-artwork fallback");

  sqlite.prepare("UPDATE watchlist SET status='removed'").run();
  const emptyContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const empty = await emptyContext.newPage();
  empty.on("pageerror", (error) => pageErrors.push(error.message));
  await login(empty, "ui-empty");
  assert.equal(await empty.locator("#home-start").innerText(), "La prossima serata inizia da qui.");
  assert.ok((await empty.locator("main").innerText()).includes("La watchlist condivisa è vuota."));
  await noOverflow(empty, "empty account");
  await screenshot(empty, "home-empty-mobile");
  record("empty account and empty shared watchlist");
  assert.deepEqual(pageErrors, [], "browser runtime/hydration errors");
  record("no browser runtime/hydration exceptions");
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
  await new Promise((resolve) => { if (server.exitCode !== null) resolve(); else { server.once("exit", resolve); setTimeout(resolve, 3000).unref(); } });
  fs.writeFileSync(path.join(output, "server.log"), serverLog);
  fs.writeFileSync(path.join(output, "checks.json"), JSON.stringify({ checks, pageErrors }, null, 2));
  sqlite.close();
  fs.rmSync(temporary, { recursive: true, force: true });
}
