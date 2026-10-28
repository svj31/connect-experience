import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { openDb } from "../src/db.js";
import { buildServer } from "../src/server.js";
import { makeServer, signup } from "./helpers.js";

const { app, httpServer, repo } = makeServer();
afterAll(() => httpServer.close());

describe("auth", () => {
  it("signs up, reads me, logs out and logs back in", async () => {
    const { agent, email } = await signup(app, "Ava");
    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.user).toMatchObject({ displayName: "Ava", email });
    expect(me.body.user).not.toHaveProperty("password_hash");

    await agent.post("/api/auth/logout");
    expect((await agent.get("/api/auth/me")).body).toEqual({ user: null });

    const bad = await agent.post("/api/auth/login").send({ email, password: "wrongpass1" });
    expect(bad.status).toBe(401);
    const good = await agent.post("/api/auth/login").send({ email, password: "secret123" });
    expect(good.status).toBe(200);
    expect((await agent.get("/api/auth/me")).status).toBe(200);
  });

  it("sets an httpOnly session cookie", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: `cookie${Date.now()}@example.com`, password: "secret123", displayName: "Cookie", ageConfirmed: true, startedAt: Date.now() - 4000,
    });
    expect(res.status).toBe(201);
    expect(String(res.headers["set-cookie"])).toMatch(/sv_session=.*HttpOnly/i);
  });

  it("rejects duplicates, bots and invalid input with field errors", async () => {
    const { email } = await signup(app);
    const dup = await request(app).post("/api/auth/signup").send({ email, password: "secret123", displayName: "Dup", ageConfirmed: true, startedAt: Date.now() - 4000 });
    expect(dup.status).toBe(409);
    expect(dup.body.fields.email).toBeDefined();

    const bot = await request(app).post("/api/auth/signup").send({ email: "bot@example.com", password: "secret123", displayName: "Bot", ageConfirmed: true, website: "x", startedAt: Date.now() - 4000 });
    expect(bot.status).toBe(400);
    const fast = await request(app).post("/api/auth/signup").send({ email: "fast@example.com", password: "secret123", displayName: "Fast", ageConfirmed: true, startedAt: Date.now() });
    expect(fast.status).toBe(400);

    const invalid = await request(app).post("/api/auth/signup").send({ email: "nope", password: "short", displayName: "A", ageConfirmed: true, startedAt: Date.now() - 4000 });
    expect(invalid.status).toBe(400);
    expect(Object.keys(invalid.body.fields)).toEqual(expect.arrayContaining(["email", "password", "displayName"]));
  });

  it("issues socket tickets only to signed in users", async () => {
    expect((await request(app).post("/api/auth/socket-ticket")).status).toBe(401);
    const { agent } = await signup(app);
    const res = await agent.post("/api/auth/socket-ticket");
    expect(res.body.ticket).toEqual(expect.any(String));
  });

  it("ignores a forged cookie", async () => {
    const res = await request(app).get("/api/auth/me").set("Cookie", "sv_session=forged.token.value");
    expect(res.body).toEqual({ user: null });
    expect(String(res.headers["set-cookie"])).toMatch(/sv_session=;/);
  });
});

describe("profile", () => {
  it("updates and validates the profile", async () => {
    const { agent } = await signup(app);
    const ok = await agent.put("/api/profile").send({ displayName: "Mira", pronouns: "they/them", bio: "Draws on receipts", handle: "@mira", interests: ["art", "books"], avatarShape: "star", avatarColor: "sun" });
    expect(ok.status).toBe(200);
    expect(ok.body.user).toMatchObject({ displayName: "Mira", interests: ["art", "books"], avatarShape: "star" });
    const bad = await agent.put("/api/profile").send({ displayName: "", pronouns: "", bio: "", handle: "", interests: ["nope"], avatarShape: "blob", avatarColor: "purple" });
    expect(bad.status).toBe(400);
    expect(Object.keys(bad.body.fields)).toEqual(expect.arrayContaining(["displayName", "interests", "avatarShape", "avatarColor"]));
  });
});

describe("account deletion", () => {
  it("needs confirmation, then removes the user and their tables", async () => {
    const { agent, user, email } = await signup(app, "Leaver");
    const { body } = await agent.post("/api/rooms").send({ title: "Soon gone", activity: "wyr" });
    expect((await agent.delete("/api/profile").send({})).status).toBe(400);
    expect((await agent.delete("/api/profile").send({ confirm: "DELETE" })).status).toBe(200);
    expect(repo.userById(user.id)).toBeUndefined();
    expect(repo.roomByCode(body.room.code)).toBeUndefined();
    expect((await agent.get("/api/auth/me")).body).toEqual({ user: null });
    expect((await request(app).post("/api/auth/login").send({ email, password: "secret123" })).status).toBe(401);
  });
});

describe("rooms", () => {
  it("creates, lists, joins and protects a table", async () => {
    const host = await signup(app, "Host");
    const guest = await signup(app, "Guest");
    const third = await signup(app, "Third");

    const created = await host.agent.post("/api/rooms").send({ title: "Doodle with me", activity: "draw", topic: "art", isPublic: true });
    expect(created.status).toBe(201);
    const code = created.body.room.code as string;

    const hostOpen = await host.agent.get("/api/rooms/open");
    expect(hostOpen.body.rooms.find((r: { code: string }) => r.code === code)).toBeUndefined();
    const guestOpen = await guest.agent.get("/api/rooms/open");
    expect(guestOpen.body.rooms.find((r: { code: string }) => r.code === code)?.host.displayName).toBe("Host");

    expect((await guest.agent.get(`/api/rooms/${code}`)).status).toBe(403);
    expect((await guest.agent.post(`/api/rooms/${code}/join`)).status).toBe(200);
    expect((await third.agent.post(`/api/rooms/${code}/join`)).status).toBe(409);

    const detail = await guest.agent.get(`/api/rooms/${code.toLowerCase()}`);
    expect(detail.status).toBe(200);
    expect(detail.body.partner).toMatchObject({ displayName: "Host", bio: null, handle: null });
    expect(detail.body.partner).not.toHaveProperty("email");
    expect((await guest.agent.get("/api/rooms/mine")).body.rooms[0].code).toBe(code);
  });

  it("validates new tables", async () => {
    const { agent } = await signup(app);
    const res = await agent.post("/api/rooms").send({ title: "x", activity: "poker" });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty("title");
    expect(res.body.fields).toHaveProperty("activity");
  });

  it("locks reveal levels until enough moments are shared", async () => {
    const host = await signup(app, "Rev");
    const guest = await signup(app, "Eal");
    const { body } = await host.agent.post("/api/rooms").send({ title: "Reveal test", activity: "wyr", isPublic: false });
    const code = body.room.code;
    await guest.agent.post(`/api/rooms/${code}/join`);
    expect((await host.agent.put(`/api/rooms/${code}/reveal`).send({ level: 1 })).status).toBe(403);
    const room = repo.roomByCode(code)!;
    repo.addMoment(room.id, "wyr", "test", {});
    expect((await host.agent.put(`/api/rooms/${code}/reveal`).send({ level: 1 })).status).toBe(200);
    expect((await host.agent.put(`/api/rooms/${code}/reveal`).send({ level: 2 })).status).toBe(403);
    expect((await host.agent.put(`/api/rooms/${code}/reveal`).send({ level: 5 })).status).toBe(400);
    const view = await guest.agent.get(`/api/rooms/${code}`);
    expect(view.body.partner.revealLevel).toBe(1);
  });

  it("closes the table when the host leaves and reopens when a public guest leaves", async () => {
    const host = await signup(app);
    const guest = await signup(app);
    const { body } = await host.agent.post("/api/rooms").send({ title: "Leaving test", activity: "story", isPublic: true });
    const code = body.room.code;
    await guest.agent.post(`/api/rooms/${code}/join`);
    await guest.agent.post(`/api/rooms/${code}/leave`);
    expect(repo.roomByCode(code)).toMatchObject({ status: "open", guest_id: null });
    await host.agent.post(`/api/rooms/${code}/leave`);
    expect((await host.agent.get(`/api/rooms/${code}`)).status).toBe(404);
  });

  it("returns Common Ground only with two people", async () => {
    const host = await signup(app);
    const { body } = await host.agent.post("/api/rooms").send({ title: "Solo table", activity: "wyr" });
    expect((await host.agent.get(`/api/rooms/${body.room.code}/common-ground`)).status).toBe(409);
  });
});

describe("safety", () => {
  it("block hides tables and prevents joining", async () => {
    const host = await signup(app);
    const other = await signup(app);
    const { body } = await host.agent.post("/api/rooms").send({ title: "Blocked table", activity: "wyr" });
    await host.agent.post("/api/safety/block").send({ userId: other.user.id });
    const open = await other.agent.get("/api/rooms/open");
    expect(open.body.rooms.find((r: { code: string }) => r.code === body.room.code)).toBeUndefined();
    expect((await other.agent.post(`/api/rooms/${body.room.code}/join`)).status).toBe(403);
  });

  it("report requires a reason and also blocks", async () => {
    const a = await signup(app);
    const b = await signup(app);
    expect((await a.agent.post("/api/safety/report").send({ userId: b.user.id, reason: "nope" })).status).toBe(400);
    expect((await a.agent.post("/api/safety/report").send({ userId: a.user.id, reason: "spam" })).status).toBe(400);
    expect((await a.agent.post("/api/safety/report").send({ userId: b.user.id, reason: "spam", details: "Links" })).status).toBe(200);
    expect(repo.isBlocked(a.user.id, b.user.id)).toBe(true);
  });
});

describe("public endpoints", () => {
  it("health and meta", async () => {
    expect((await request(app).get("/api/health")).body).toEqual({ ok: true });
    const meta = await request(app).get("/api/meta");
    expect(meta.body.activities).toContain("constellation");
    expect(meta.body.icebreakers.length).toBeGreaterThan(5);
  });

  it("contact form validates and blocks bots", async () => {
    const good = { name: "Ava", email: "ava@example.com", topic: "feedback", message: "Loved the constellation game.", website: "", startedAt: Date.now() - 5000 };
    expect((await request(app).post("/api/contact").send(good)).status).toBe(201);
    expect((await request(app).post("/api/contact").send({ ...good, website: "spam" })).status).toBe(400);
    expect((await request(app).post("/api/contact").send({ ...good, message: "hi" })).status).toBe(400);
  });

  it("analytics accepts clean events and keeps the summary private", async () => {
    expect((await request(app).post("/api/analytics").send({ name: "page_view", path: "/lobby" })).status).toBe(204);
    expect((await request(app).post("/api/analytics").send({ name: "Page View!", path: "javascript:alert(1)" })).status).toBe(400);
    expect((await request(app).get("/api/analytics/summary")).status).toBe(401);
  });

  it("returns JSON errors for unknown routes and malformed JSON", async () => {
    expect((await request(app).get("/api/does-not-exist")).status).toBe(404);
    const res = await request(app).post("/api/auth/login").set("Content-Type", "application/json").send("{bad json");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Malformed JSON");
  });

  it("sends security headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["strict-transport-security"]).toBeDefined();
  });
});

describe("rate limits", () => {
  const limited = buildServer(openDb(":memory:"), { rateLimits: true });
  beforeAll(() => undefined);
  afterAll(() => limited.httpServer.close());

  it("throttles repeated login attempts", async () => {
    let last = 0;
    for (let i = 0; i < 22; i++) {
      last = (await request(limited.app).post("/api/auth/login").send({ email: "x@example.com", password: "nope" })).status;
    }
    expect(last).toBe(429);
  });
});
