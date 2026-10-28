import { afterAll, describe, expect, it } from "vitest";
import { QUOTAS } from "../src/routes/swipes.js";
import { makeServer, signup } from "./helpers.js";

const profile = (name: string, city = "Mumbai") => ({
  displayName: name, pronouns: "", bio: "Here for good conversation", handle: "", interests: ["music", "travel"],
  avatarShape: "star", avatarColor: "violet", avatar: { ring: "single", pattern: "plain", face: "smile" },
  birthYear: 1997, gender: "woman", lookingFor: "everyone", intent: "long-term", city,
  job: "", lifestyle: {}, loveLanguage: "", personality: "", prompts: [], quiz: {},
});

describe("swipe deck and matching", () => {
  const server = makeServer();
  const { app } = server;
  afterAll(() => {
    server.realtime.io.close();
    server.httpServer.close();
  });

  async function member(name: string, city?: string) {
    const m = await signup(app, name);
    await m.agent.put("/api/profile").send(profile(name, city));
    return m;
  }

  it("serves a ranked feed with distance and quota", async () => {
    const a = await member("Feeda");
    const near = await member("Feedb", "Mumbai");
    const far = await member("Feedc", "Kolkata");
    const res = await a.agent.get("/api/discover/feed?refresh=1&limit=20");
    expect(res.status).toBe(200);
    const ids = res.body.people.map((p: { id: number }) => p.id);
    expect(ids).toContain(near.user.id);
    expect(ids.indexOf(near.user.id)).toBeLessThan(ids.indexOf(far.user.id));
    expect(res.body.people.find((p: { id: number }) => p.id === far.user.id).distanceKm).toBeGreaterThan(1500);
    expect(res.body.quota).toEqual({ likesLeft: QUOTAS.like, superlikesLeft: QUOTAS.superlike });
  });

  it("turns a like into a request, and a like back into a match with a shared space", async () => {
    const a = await member("Likea");
    const b = await member("Likeb");
    const first = await a.agent.post("/api/discover/swipes").send({ targetId: b.user.id, decision: "like" });
    expect(first.status).toBe(201);
    expect(first.body.status).toBe("liked");
    // B sees A in their feed, because A already liked them.
    const feed = await b.agent.get("/api/discover/feed?refresh=1&limit=20");
    expect(feed.body.people.map((p: { id: number }) => p.id)).toContain(a.user.id);
    const back = await b.agent.post("/api/discover/swipes").send({ targetId: a.user.id, decision: "like" });
    expect(back.body.status).toBe("matched");
    expect(back.body.match.roomCode).toMatch(/^[A-Z0-9]{6}$/);
    const conns = await a.agent.get("/api/connections");
    expect(conns.body.connections.map((c: { person: { id: number } }) => c.person.id)).toContain(b.user.id);
  });

  it("creates exactly one match when two people like each other at the same time", async () => {
    const a = await member("Racea");
    const b = await member("Raceb");
    const [x, y] = await Promise.all([
      a.agent.post("/api/discover/swipes").send({ targetId: b.user.id, decision: "like" }),
      b.agent.post("/api/discover/swipes").send({ targetId: a.user.id, decision: "like" }),
    ]);
    expect([x.body.status, y.body.status].sort()).toEqual(["liked", "matched"]);
    const conns = await a.agent.get("/api/connections");
    expect(conns.body.connections.filter((c: { person: { id: number } }) => c.person.id === b.user.id)).toHaveLength(1);
  });

  it("hides passed people and lets you undo the last pass", async () => {
    const a = await member("Passa");
    const b = await member("Passb");
    await a.agent.post("/api/discover/swipes").send({ targetId: b.user.id, decision: "pass" });
    const feed = await a.agent.get("/api/discover/feed?refresh=1&limit=20");
    expect(feed.body.people.map((p: { id: number }) => p.id)).not.toContain(b.user.id);
    const undo = await a.agent.post("/api/discover/swipes/undo");
    expect(undo.body.person.id).toBe(b.user.id);
    const again = await a.agent.get("/api/discover/feed?refresh=1&limit=20");
    expect(again.body.people.map((p: { id: number }) => p.id)).toContain(b.user.id);
    expect((await a.agent.post("/api/discover/swipes/undo")).status).toBe(400);
  });

  it("marks super likes and enforces the daily super like quota", async () => {
    const a = await member("Supera");
    const targets = [];
    for (let i = 0; i <= QUOTAS.superlike; i++) targets.push(await member(`Superb${i}`));
    for (let i = 0; i < QUOTAS.superlike; i++) {
      expect((await a.agent.post("/api/discover/swipes").send({ targetId: targets[i].user.id, decision: "superlike" })).status).toBe(201);
    }
    const over = await a.agent.post("/api/discover/swipes").send({ targetId: targets[QUOTAS.superlike].user.id, decision: "superlike" });
    expect(over.status).toBe(429);
    const incoming = await targets[0].agent.get("/api/connections");
    expect(incoming.body.incoming[0]).toMatchObject({ superLike: true });
  });

  it("rejects swiping on yourself or on bad input", async () => {
    const a = await member("Selfa");
    expect((await a.agent.post("/api/discover/swipes").send({ targetId: a.user.id, decision: "like" })).status).toBe(400);
    expect((await a.agent.post("/api/discover/swipes").send({ targetId: 1, decision: "maybe" })).status).toBe(400);
  });

  it("saves profile photos, puts the first on cards, and rejects unsafe sources", async () => {
    const a = await member("Photoa");
    const b = await member("Photob");
    const photo = "https://images.example.com/me.jpg";
    const ok = await b.agent.put("/api/profile").send({ ...profile("Photob"), photos: [photo, "data:image/jpeg;base64,AAAA"] });
    expect(ok.status).toBe(200);
    expect(ok.body.user.avatar.photo).toBe(photo);
    const feed = await a.agent.get("/api/discover/feed?refresh=1&limit=20");
    expect(feed.body.people.find((p: { id: number }) => p.id === b.user.id).photos[0]).toBe(photo);
    expect((await b.agent.put("/api/profile").send({ ...profile("Photob"), photos: ["http://insecure.example.com/x.jpg"] })).status).toBe(400);
    expect((await b.agent.put("/api/profile").send({ ...profile("Photob"), photos: ["javascript:alert(1)"] })).status).toBe(400);
    expect((await b.agent.put("/api/profile").send({ ...profile("Photob"), photos: Array(7).fill(photo) })).status).toBe(400);
  });
});
