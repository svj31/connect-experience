import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { connectSocket, listen, makeServer, nextEvent, signup } from "./helpers.js";

describe("Together plans", () => {
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

  async function pair(x: string, y: string) {
    const a = await signup(app, x);
    const b = await signup(app, y);
    const req = await a.agent.post("/api/connections").send({ userId: b.user.id });
    await b.agent.post(`/api/connections/${req.body.id}/accept`).expect(200);
    return { a, b, connectionId: req.body.id as number };
  }

  it("lists an invite for both people, and the host hears the accept", async () => {
    const { a, b, connectionId } = await pair("Plana", "Planb");
    const aSocket = await connectSocket(url, a.agent);
    const play = await a.agent.post(`/api/connections/${connectionId}/play`).send({ activity: "wyr" });
    expect(play.body.planId).toBeGreaterThan(0);

    const mine = await a.agent.get("/api/together/live");
    expect(mine.body.sent).toHaveLength(1);
    expect(mine.body.sent[0]).toMatchObject({ status: "pending", activity: "wyr", person: { displayName: "Planb" } });
    const theirs = await b.agent.get("/api/together/live");
    expect(theirs.body.received[0]).toMatchObject({ id: play.body.planId, role: "guest", person: { displayName: "Plana" } });

    // Only the invited person can answer.
    expect((await a.agent.post(`/api/together/${play.body.planId}/accept`)).status).toBe(409);
    const heard = nextEvent<{ status: string; name: string }>(aSocket, "together:update");
    const ok = await b.agent.post(`/api/together/${play.body.planId}/accept`);
    expect(ok.body.roomCode).toBe(play.body.roomCode);
    expect(await heard).toMatchObject({ status: "accepted", name: "Planb" });

    await b.agent.post(`/api/together/${play.body.planId}/end`).expect(200);
    expect((await a.agent.get("/api/together/live")).body.sent).toHaveLength(0);
  });

  it("shows a decline to the host, lets the host cancel, and keeps one plan per pair", async () => {
    const { a, b, connectionId } = await pair("Decla", "Declb");
    const first = await a.agent.post(`/api/connections/${connectionId}/play`).send({ activity: "draw" });
    await b.agent.post(`/api/together/${first.body.planId}/decline`).expect(200);
    const after = await a.agent.get("/api/together/live");
    expect(after.body.sent[0]).toMatchObject({ status: "declined" });
    expect((await b.agent.get("/api/together/live")).body.received).toHaveLength(0);

    const second = await a.agent.post(`/api/connections/${connectionId}/play`).send({ activity: "watch" });
    const third = await a.agent.post(`/api/connections/${connectionId}/play`).send({ activity: "wyr" });
    const live = await b.agent.get("/api/together/live");
    expect(live.body.received.map((p: { id: number }) => p.id)).toEqual([third.body.planId]);
    expect(second.body.planId).not.toBe(third.body.planId);

    await a.agent.post(`/api/together/${third.body.planId}/end`).expect(200);
    expect((await b.agent.get("/api/together/live")).body.received).toHaveLength(0);
    const stranger = await signup(app, "Nosy");
    expect((await stranger.agent.post(`/api/together/${third.body.planId}/end`)).status).toBe(404);
  });
});
