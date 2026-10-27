import type { Socket } from "socket.io-client";
import { io as connect } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { connectSocket, emitAck, listen, makeServer, nextEvent, signup } from "./helpers.js";

type Snapshot = { activity: string; game: Record<string, unknown> | null; online: number[] };

const server = makeServer();
let url = "";
const sockets: Socket[] = [];

beforeAll(async () => {
  url = await listen(server.httpServer);
});
afterAll(() => {
  sockets.forEach((s) => s.disconnect());
  server.realtime.io.close();
  server.httpServer.close();
});

async function pairAtTable(activity = "wyr") {
  const host = await signup(server.app, "Host");
  const guest = await signup(server.app, "Guest");
  const { body } = await host.agent.post("/api/rooms").send({ title: "Realtime table", activity, isPublic: true });
  const code = body.room.code as string;
  const hostSocket = await connectSocket(url, host.agent);
  sockets.push(hostSocket);
  expect(await emitAck(hostSocket, "room:join", code)).toEqual({ ok: true });

  const changed = nextEvent(hostSocket, "room:changed");
  await guest.agent.post(`/api/rooms/${code}/join`);
  await changed;

  const guestSocket = await connectSocket(url, guest.agent);
  sockets.push(guestSocket);
  const hostSees = nextEvent<Snapshot>(hostSocket, "room:snapshot", (s) => s.online.length === 2);
  expect(await emitAck(guestSocket, "room:join", code)).toEqual({ ok: true });
  await hostSees;
  return { host, guest, code, hostSocket, guestSocket };
}

describe("socket auth", () => {
  it("rejects connections without a valid ticket", async () => {
    const socket = connect(url, { auth: { ticket: "nope" }, transports: ["websocket"], forceNew: true });
    const error = await new Promise<Error>((resolve) => socket.once("connect_error", resolve));
    expect(error.message).toBe("unauthorized");
    socket.disconnect();
  });

  it("refuses to join a table you are not seated at", async () => {
    const host = await signup(server.app);
    const stranger = await signup(server.app);
    const { body } = await host.agent.post("/api/rooms").send({ title: "Private", activity: "wyr", isPublic: false });
    const socket = await connectSocket(url, stranger.agent);
    sockets.push(socket);
    expect(await emitAck(socket, "room:join", body.room.code)).toMatchObject({ ok: false });
    expect(await emitAck(socket, "chat:send", { body: "hi" })).toMatchObject({ ok: false });
  });
});

describe("a full date at one table", () => {
  it("plays Would You Rather with hidden picks and records answers", async () => {
    const { hostSocket, guestSocket, host, code } = await pairAtTable("wyr");

    const guestAfterPick = nextEvent<Snapshot>(guestSocket, "room:snapshot", (s) => s.game?.partnerPicked === true);
    expect(await emitAck(hostSocket, "game:action", { activity: "wyr", action: { type: "pick", choice: "a" } })).toEqual({ ok: true });
    const hidden = await guestAfterPick;
    expect(hidden.game?.partnerPick).toBeNull();

    const hostReveal = nextEvent<Snapshot>(hostSocket, "room:snapshot", (s) => s.game?.revealed === true);
    await emitAck(guestSocket, "game:action", { activity: "wyr", action: { type: "pick", choice: "a" } });
    const revealed = await hostReveal;
    expect(revealed.game).toMatchObject({ myPick: "a", partnerPick: "a", agreed: 1 });

    const cg = await host.agent.get(`/api/rooms/${code}/common-ground`);
    expect(cg.body.commonGround).toMatchObject({ questionsCompared: 1, questionsAgreed: 1, agreementRate: 1 });

    expect(await emitAck(hostSocket, "game:action", { activity: "draw", action: { type: "clear" } })).toMatchObject({ ok: false });
  });

  it("switches activity, records a moment and unlocks reveal level 1", async () => {
    const { hostSocket, guestSocket, host, guest, code } = await pairAtTable("wyr");

    const switched = nextEvent<Snapshot>(guestSocket, "room:snapshot", (s) => s.activity === "constellation");
    expect(await emitAck(hostSocket, "room:activity", "constellation")).toEqual({ ok: true });
    await switched;

    for (const [i, s] of [hostSocket, guestSocket, hostSocket].entries()) {
      expect(await emitAck(s, "game:action", { activity: "constellation", action: { type: "place", x: i / 10, y: 0.2, z: -0.3 } })).toEqual({ ok: true });
    }
    const changed = nextEvent(guestSocket, "room:changed");
    expect(await emitAck(guestSocket, "game:action", { activity: "constellation", action: { type: "name", name: "Night Kite" } })).toEqual({ ok: true });
    await changed;

    const detail = await guest.agent.get(`/api/rooms/${code}`);
    expect(detail.body.momentCount).toBe(1);
    expect((await host.agent.put(`/api/rooms/${code}/reveal`).send({ level: 1 })).status).toBe(200);
    const moments = await host.agent.get("/api/profile/moments");
    expect(moments.body.moments[0]).toMatchObject({ activity: "constellation", partnerName: "Guest" });
  });

  it("delivers chat, typing and reactions, and rate limits chat", async () => {
    const { hostSocket, guestSocket, guest, code } = await pairAtTable("story");

    const received = nextEvent<{ body: string }>(guestSocket, "chat:message");
    expect(await emitAck(hostSocket, "chat:send", { body: "  hello there  " })).toEqual({ ok: true });
    expect((await received).body).toBe("hello there");

    const typing = nextEvent(guestSocket, "chat:typing");
    hostSocket.emit("chat:typing");
    await typing;

    const reaction = nextEvent<{ kind: string }>(guestSocket, "reaction");
    hostSocket.emit("reaction", "not-a-reaction");
    hostSocket.emit("reaction", "heart");
    expect((await reaction).kind).toBe("heart");

    expect(await emitAck(hostSocket, "chat:send", { body: "" })).toMatchObject({ ok: false });
    let limited = false;
    for (let i = 0; i < 10; i++) {
      const res = await emitAck(hostSocket, "chat:send", { body: `msg ${i}` });
      if (!res.ok) limited = true;
    }
    expect(limited).toBe(true);

    const history = await guest.agent.get(`/api/rooms/${code}/messages`);
    expect(history.body.messages[0].body).toBe("hello there");
  });

  it("tells the guest when the host closes the table", async () => {
    const { host, guestSocket, code } = await pairAtTable("memory");
    const closed = nextEvent(guestSocket, "room:closed");
    await host.agent.post(`/api/rooms/${code}/leave`);
    await closed;
  });
});

describe("quick match", () => {
  it("pairs two people looking for the same activity", async () => {
    const a = await signup(server.app, "Quick A");
    const b = await signup(server.app, "Quick B");
    const sa = await connectSocket(url, a.agent);
    const sb = await connectSocket(url, b.agent);
    sockets.push(sa, sb);

    expect(await emitAck(sa, "match:join", { activity: "poker" })).toMatchObject({ ok: false });
    expect(await emitAck(sa, "match:join", { activity: "connect4" })).toMatchObject({ ok: true, status: "waiting" });
    const found = nextEvent<{ code: string }>(sa, "match:found");
    const res = await emitAck<{ ok: boolean; status: string; code: string }>(sb, "match:join", { activity: "any" });
    expect(res.status).toBe("matched");
    expect((await found).code).toBe(res.code);

    const room = await b.agent.get(`/api/rooms/${res.code}`);
    expect(room.body.room).toMatchObject({ activity: "connect4", isPublic: false, status: "paired" });
    expect(server.realtime.queueSize()).toBe(0);
  });
});
