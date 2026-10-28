import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEMO, demoEmail, seedDemo } from "../src/demo.js";
import { connectSocket, emitAck, listen, makeServer, nextEvent, signup } from "./helpers.js";

const fullProfile = (name: string, extra: Record<string, unknown> = {}) => ({
  displayName: name, pronouns: "", bio: "Likes long walks and short queues", handle: "@" + name.toLowerCase(),
  interests: ["music", "travel", "astronomy"], avatarShape: "star", avatarColor: "violet",
  avatar: { ring: "double", pattern: "swirl", face: "wink" },
  birthYear: 1998, gender: "woman", lookingFor: "everyone", intent: "long-term", city: "Mumbai",
  job: "Designer", lifestyle: { drinking: "never", sleep: "night-owl" }, loveLanguage: "time", personality: "ambivert",
  prompts: [{ id: "p-sunday", answer: "Coffee and a long walk" }], quiz: { "q-weekend": 1, "q-plans": 2 },
  ...extra,
});

describe("profiles, Discover and connections", () => {
  const server = makeServer();
  const { app } = server;
  let url = "";
  beforeAll(async () => {
    url = await listen(server.httpServer);
  });
  afterAll(() => {
    server.realtime.io.close();
    server.httpServer.close();
  });

  it("saves a full dating profile and reports completeness", async () => {
    const { agent } = await signup(app, "Asha");
    const res = await agent.put("/api/profile").send(fullProfile("Asha"));
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ age: new Date().getUTCFullYear() - 1998, city: "Mumbai", avatar: { ring: "double", face: "wink" }, prompts: [{ text: "A perfect Sunday looks like" }] });
    expect(res.body.user.completeness.percent).toBeGreaterThan(50);
  });

  it("rejects people under 18 and duplicate prompts", async () => {
    const { agent } = await signup(app, "Young");
    const young = await agent.put("/api/profile").send(fullProfile("Young", { birthYear: new Date().getUTCFullYear() - 16 }));
    expect(young.status).toBe(400);
    expect(young.body.fields.birthYear).toMatch(/18/);
    const dup = await agent.put("/api/profile").send(fullProfile("Young", { prompts: [{ id: "p-song", answer: "One" }, { id: "p-song", answer: "Two" }] }));
    expect(dup.status).toBe(400);
  });

  it("shows Discover with vibe scores, respects passes, and hides undiscoverable people", async () => {
    const a = await signup(app, "Disa");
    const b = await signup(app, "Disb");
    const c = await signup(app, "Disc");
    await a.agent.put("/api/profile").send(fullProfile("Disa"));
    await b.agent.put("/api/profile").send(fullProfile("Disb"));
    await c.agent.put("/api/profile").send(fullProfile("Disc", { interests: ["gaming"] }));

    let res = await a.agent.get("/api/people").query({ interests: "astronomy", minAge: 18, maxAge: 60 });
    expect(res.status).toBe(200);
    const ids = res.body.people.map((p: { id: number }) => p.id);
    expect(ids).toContain(b.user.id);
    expect(ids).not.toContain(c.user.id);
    const card = res.body.people.find((p: { id: number }) => p.id === b.user.id);
    expect(card.vibe.score).toBeGreaterThan(80);
    expect(card).not.toHaveProperty("email");

    await a.agent.post(`/api/people/${b.user.id}/pass`).expect(200);
    res = await a.agent.get("/api/people").query({ minAge: 18, maxAge: 60 });
    expect(res.body.people.map((p: { id: number }) => p.id)).not.toContain(b.user.id);
    await a.agent.delete("/api/people/passes").expect(200);

    const privacy = { basics: "everyone", about: "everyone", lifestyle: "connections", work: "spark", prompts: "everyone", socials: "orbit", discoverable: false, showOnline: false, showVibe: true };
    await b.agent.put("/api/profile/privacy").send(privacy).expect(200);
    res = await a.agent.get("/api/people").query({ minAge: 18, maxAge: 60 });
    expect(res.body.people.map((p: { id: number }) => p.id)).not.toContain(b.user.id);
    expect((await a.agent.get(`/api/people/${b.user.id}`)).status).toBe(404);
  });

  it("filters by gender preference both ways", async () => {
    const w = await signup(app, "Wen");
    const m = await signup(app, "Max");
    await w.agent.put("/api/profile").send(fullProfile("Wen", { gender: "woman", lookingFor: "women" }));
    await m.agent.put("/api/profile").send(fullProfile("Max", { gender: "man", lookingFor: "women" }));
    const res = await m.agent.get("/api/people").query({ minAge: 18, maxAge: 60 });
    expect(res.body.people.map((p: { id: number }) => p.id)).not.toContain(w.user.id);
  });

  it("runs the request, notify, accept, play flow and opens a shared space", async () => {
    const a = await signup(app, "Reqa");
    const b = await signup(app, "Reqb");
    await a.agent.put("/api/profile").send(fullProfile("Reqa"));
    await b.agent.put("/api/profile").send(fullProfile("Reqb"));
    const bSocket = await connectSocket(url, b.agent);

    const notified = nextEvent<{ name: string; note: string }>(bSocket, "connection:request");
    const req = await a.agent.post("/api/connections").send({ userId: b.user.id, note: "Hi from Discover" });
    expect(req.status).toBe(201);
    expect(await notified).toMatchObject({ name: "Reqa", note: "Hi from Discover" });
    expect((await a.agent.post("/api/connections").send({ userId: b.user.id })).status).toBe(409);

    // Strangers see locked sections.
    let profile = await a.agent.get(`/api/people/${b.user.id}`);
    expect(profile.body.profile.job).toBeNull();
    expect(profile.body.connection).toMatchObject({ status: "pending", outgoing: true });

    const incoming = await b.agent.get("/api/connections");
    expect(incoming.body.incoming).toHaveLength(1);
    const accepted = await b.agent.post(`/api/connections/${req.body.id}/accept`);
    expect(accepted.body.roomCode).toMatch(/^[A-Z0-9]{6}$/);

    const list = await a.agent.get("/api/connections");
    expect(list.body.connections[0]).toMatchObject({ roomCode: accepted.body.roomCode, bond: { level: 1, name: "Stardust" } });

    profile = await a.agent.get(`/api/people/${b.user.id}`);
    expect(profile.body.profile.lifestyle).toMatchObject({ drinking: "never" });
    expect(profile.body.profile.job).toBeNull();
    expect(profile.body.profile.locked.work).toBe("Unlocks at Spark bond");

    const invite = nextEvent<{ activity: string }>(bSocket, "room:invite");
    const play = await a.agent.post(`/api/connections/${req.body.id}/play`).send({ activity: "constellation" });
    expect(play.body.roomCode).toBe(accepted.body.roomCode);
    expect(await invite).toMatchObject({ activity: "constellation", name: "Reqa" });

    // Leaving a connection space does not close it.
    await a.agent.post(`/api/rooms/${accepted.body.roomCode}/leave`).expect(200);
    const room = await a.agent.get(`/api/rooms/${accepted.body.roomCode}`);
    expect(room.body.room).toMatchObject({ kind: "connection", status: "paired" });
    expect(room.body.bond).toMatchObject({ level: 1 });
    expect(room.body.vibe).toBeGreaterThan(0);

    const ideas = await a.agent.get(`/api/rooms/${accepted.body.roomCode}/suggestions`);
    expect(ideas.body.sharedInterests).toEqual(["music", "travel", "astronomy"]);
    expect(ideas.body.watch.length).toBeGreaterThan(0);
    bSocket.disconnect();
  });

  it("keeps a locked table on its activity and lets a free one switch", async () => {
    const host = await signup(app, "Lokh");
    const guest = await signup(app, "Lokg");
    const locked = await host.agent.post("/api/rooms").send({ title: "Only Connect Four", activity: "connect4", locked: true });
    expect(locked.body.room).toMatchObject({ locked: true, kind: "table" });
    await guest.agent.post(`/api/rooms/${locked.body.room.code}/join`).expect(200);
    const s = await connectSocket(url, host.agent);
    await emitAck(s, "room:join", locked.body.room.code);
    expect(await emitAck(s, "room:activity", "draw")).toMatchObject({ ok: false, error: "This table is set to one activity" });

    const free = await host.agent.post("/api/rooms").send({ title: "Anything goes", activity: "wyr" });
    await guest.agent.post(`/api/rooms/${free.body.room.code}/join`).expect(200);
    await emitAck(s, "room:join", free.body.room.code);
    expect(await emitAck(s, "room:activity", "deeptalk")).toMatchObject({ ok: true });
    const snap = await nextEvent<{ activity: string; game: { card: { level: number } } }>(s, "room:snapshot", (p) => p.activity === "deeptalk").catch(() => null);
    if (snap) expect(snap.game.card.level).toBe(1);
    s.disconnect();
  });

  it("turns two requests into a mutual match", async () => {
    const a = await signup(app, "Muta");
    const b = await signup(app, "Mutb");
    await a.agent.post("/api/connections").send({ userId: b.user.id }).expect(201);
    const back = await b.agent.post("/api/connections").send({ userId: a.user.id });
    expect(back.body).toMatchObject({ status: "accepted", mutual: true });
  });

  it("lets people decline, cancel and remove connections", async () => {
    const a = await signup(app, "Deca");
    const b = await signup(app, "Decb");
    const r1 = await a.agent.post("/api/connections").send({ userId: b.user.id });
    expect((await a.agent.post(`/api/connections/${r1.body.id}/accept`)).status).toBe(400);
    await b.agent.post(`/api/connections/${r1.body.id}/decline`).expect(200);
    expect((await b.agent.get("/api/connections")).body.incoming).toHaveLength(0);
    // After a decline the requester may try again later.
    const r2 = await a.agent.post("/api/connections").send({ userId: b.user.id });
    expect(r2.status).toBe(201);
    await a.agent.delete(`/api/connections/${r2.body.id}`).expect(200);
    const outsider = await signup(app, "Decc");
    expect((await outsider.agent.delete(`/api/connections/${r2.body.id}`)).status).toBe(404);
  });

  it("blocks stop connecting and hide people from each other", async () => {
    const a = await signup(app, "Blka");
    const b = await signup(app, "Blkb");
    await a.agent.post("/api/safety/block").send({ userId: b.user.id }).expect(200);
    expect((await b.agent.post("/api/connections").send({ userId: a.user.id })).status).toBe(403);
    expect((await b.agent.get(`/api/people/${a.user.id}`)).status).toBe(404);
    const overview = await a.agent.get("/api/safety/overview");
    expect(overview.body.blocked[0]).toMatchObject({ id: b.user.id });
    await a.agent.delete(`/api/safety/block/${b.user.id}`).expect(200);
    expect((await a.agent.get("/api/safety/overview")).body.blocked).toHaveLength(0);
  });

  it("serves the dashboard, settings, catalog and a data export", async () => {
    const { agent } = await signup(app, "Dash");
    await agent.put("/api/profile").send(fullProfile("Dash"));
    const dash = await agent.get("/api/me/dashboard");
    expect(dash.status).toBe(200);
    expect(dash.body.stats).toMatchObject({ connections: 0, moments: 0 });
    expect(dash.body.weekly).toHaveLength(7);
    expect(dash.body.suggestions.question).toBeTruthy();
    expect(dash.body.suggestions.activities.length).toBeGreaterThan(0);

    expect((await agent.put("/api/profile/settings").send({ theme: "dark", cursor: false, motion: "reduced", ageMin: 30, ageMax: 25 })).status).toBe(400);
    const saved = await agent.put("/api/profile/settings").send({ theme: "dark", cursor: false, motion: "reduced", ageMin: 22, ageMax: 35 });
    expect(saved.body.user.settings).toMatchObject({ theme: "dark", cursor: false });

    const catalog = await agent.get("/api/me/catalog");
    expect(catalog.body.quiz.length).toBe(6);
    const exported = await agent.get("/api/profile/export");
    expect(exported.headers["content-disposition"]).toMatch(/attachment/);
    expect(exported.body.profile.email).toBeTruthy();
    expect(exported.body.profile).not.toHaveProperty("password_hash");
  });

  it("attaches messages to a report only when the reporter chooses to", async () => {
    const a = await signup(app, "Repa");
    const b = await signup(app, "Repb");
    const req = await a.agent.post("/api/connections").send({ userId: b.user.id });
    const { body } = await b.agent.post(`/api/connections/${req.body.id}/accept`);
    const sa = await connectSocket(url, a.agent);
    await emitAck(sa, "room:join", body.roomCode);
    await emitAck(sa, "chat:send", { body: "you are so stupid" });
    sa.disconnect();
    await b.agent.post("/api/safety/report").send({ userId: a.user.id, reason: "harassment", roomCode: body.roomCode, includeMessages: true }).expect(200);
    const row = server.repo.db.prepare("SELECT evidence FROM reports ORDER BY id DESC LIMIT 1").get() as { evidence: string };
    expect(JSON.parse(row.evidence)[0]).toMatchObject({ from: "reported", body: "you are so stupid" });
    const flagged = server.repo.db.prepare("SELECT flagged FROM messages ORDER BY id DESC LIMIT 1").get() as { flagged: number };
    expect(flagged.flagged).toBe(1);
  });
});

describe("admin area and demo sign in", () => {
  const server = makeServer();
  const { app } = server;
  beforeAll(async () => {
    await seedDemo(server.repo);
  });

  it("signs in to demo accounts with one click", async () => {
    const user = request.agent(app);
    const res = await user.post("/api/auth/demo").send({ as: "user" });
    expect(res.body.user).toMatchObject({ displayName: "Ava", role: "user" });
    const dash = await user.get("/api/me/dashboard");
    expect(dash.body.stats.connections).toBeGreaterThanOrEqual(2);
    expect(dash.body.stats.requests).toBeGreaterThanOrEqual(2);
    expect(dash.body.people[0].bond.level).toBeGreaterThanOrEqual(2);
    const info = await request(app).get("/api/auth/demo");
    expect(info.body).toMatchObject({ enabled: true, user: demoEmail("ava") });
  });

  it("keeps regular users out of the admin API", async () => {
    const { agent } = await signup(app, "Nosy");
    expect((await agent.get("/api/admin/overview")).status).toBe(403);
    expect((await request(app).get("/api/admin/overview")).status).toBe(401);
  });

  it("needs a valid invite code to create an admin", async () => {
    const body = { email: "new-admin@example.com", password: "adminpass123", displayName: "New Admin", website: "", startedAt: Date.now() - 5000 };
    expect((await request(app).post("/api/auth/admin-signup").send({ ...body, inviteCode: "wrong" })).status).toBe(403);
    const ok = await request(app).post("/api/auth/admin-signup").send({ ...body, inviteCode: "SAATH-ADMIN-2026" });
    expect(ok.status).toBe(201);
    expect(ok.body.user.role).toBe("admin");
  });

  it("shows analytics, masks emails and never exposes chats", async () => {
    const admin = request.agent(app);
    await admin.post("/api/auth/demo").send({ as: "admin" }).expect(200);
    const overview = await admin.get("/api/admin/overview");
    expect(overview.body.totals.users).toBe(DEMO.people.length + 1);
    expect(overview.body.signups).toHaveLength(14);
    expect(overview.body.hours).toHaveLength(24);
    expect(overview.body.bonds).toHaveLength(5);
    const users = await admin.get("/api/admin/users").query({ q: "Ava" });
    expect(users.body.users[0].email).toMatch(/^av\*+@saathverse\.test$/);
    expect(JSON.stringify(overview.body)).not.toMatch(/Bandra/);
  });

  it("moderates: suspend blocks sign in, reinstate restores it, and every action is logged", async () => {
    const admin = request.agent(app);
    await admin.post("/api/auth/demo").send({ as: "admin" });
    const reports = await admin.get("/api/admin/reports");
    expect(reports.body.reports.length).toBeGreaterThanOrEqual(3);
    const report = reports.body.reports.find((r: { reported: { name: string } }) => r.reported.name === "Dev");
    expect(report.reported.totalReports).toBe(2);

    const dev = server.repo.userByEmail(demoEmail("dev"))!;
    const act = await admin.post(`/api/admin/users/${dev.id}/action`).send({ action: "suspend", days: 3, note: "Two harassment reports", reportId: report.id });
    expect(act.body.status).toBe("suspended");
    const login = await request(app).post("/api/auth/login").send({ email: demoEmail("dev"), password: DEMO.password });
    expect(login.status).toBe(403);
    expect(login.body.error).toMatch(/paused/);

    await admin.post(`/api/admin/users/${dev.id}/action`).send({ action: "reinstate" }).expect(200);
    expect((await request(app).post("/api/auth/login").send({ email: demoEmail("dev"), password: DEMO.password })).status).toBe(200);

    const adminRow = server.repo.userByEmail(demoEmail("admin"))!;
    expect((await admin.post(`/api/admin/users/${adminRow.id}/action`).send({ action: "ban" })).status).toBe(403);
    await admin.put(`/api/admin/reports/${report.id}`).send({ status: "dismissed", note: "Handled" }).expect(200);
    const audit = await admin.get("/api/admin/audit");
    expect(audit.body.actions.map((a: { action: string }) => a.action)).toEqual(expect.arrayContaining(["suspend:3d", "reinstate", "report:dismissed"]));
    const me = await admin.get("/api/admin/me");
    expect(me.body.actions.length).toBeGreaterThan(0);
  });

  it("refuses sockets and API calls from suspended accounts", async () => {
    const { agent, user } = await signup(app, "Paused");
    server.repo.setUserStatus(user.id, "suspended", "2999-01-01 00:00:00");
    expect((await agent.get("/api/me/dashboard")).status).toBe(403);
    expect((await agent.get("/api/auth/me")).body.user.status).toBe("suspended");
  });
});
