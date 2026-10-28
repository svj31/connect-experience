import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { verifyToken } from "./auth.js";
import { config } from "./config.js";
import { GAMES, isActivity, type ActivityId } from "./games/index.js";
import type { GameEvent } from "./games/types.js";
import { pickPartner, type QueueEntry } from "./matching.js";
import { checkMessage } from "./moderation.js";
import { effectiveStatus, interestsOf } from "./people.js";
import { publicUser, type Repo, type RoomRow } from "./repo.js";
import { isMember, type RoomHub } from "./routes/rooms.js";
import { chatSchema } from "./validation.js";

export const REACTIONS = ["heart", "laugh", "wow", "clap", "fire"] as const;

interface RoomRuntime {
  activity: ActivityId;
  states: Partial<Record<ActivityId, unknown>>;
}

interface SocketData {
  userId: number;
  roomCode?: string;
  chatTimes: number[];
}

type AppSocket = Socket & { data: SocketData };
type Ack = (response: { ok: boolean; error?: string; [key: string]: unknown }) => void;

const channel = (code: string) => `room:${code}`;
const safeAck = (ack: unknown): Ack => (typeof ack === "function" ? (ack as Ack) : () => {});

export function createRealtime(httpServer: HttpServer, repo: Repo) {
  const io = new Server(httpServer, {
    cors: { origin: config.webOrigin, credentials: true },
    maxHttpBufferSize: 256 * 1024,
  });
  const runtimes = new Map<string, RoomRuntime>();
  /** How many sockets each person has open, for presence across the whole app. */
  const presence = new Map<number, number>();
  let queue: QueueEntry[] = [];

  function runtimeFor(room: RoomRow): RoomRuntime {
    let rt = runtimes.get(room.code);
    if (!rt) {
      rt = { activity: isActivity(room.activity) ? room.activity : "wyr", states: {} };
      runtimes.set(room.code, rt);
    }
    return rt;
  }

  const playersOf = (room: RoomRow): [number, number] | null => (room.guest_id ? [room.host_id, room.guest_id] : null);

  function gameState(room: RoomRow, rt: RoomRuntime, activity: ActivityId) {
    const players = playersOf(room);
    if (!players) return null;
    if (rt.states[activity] === undefined) rt.states[activity] = GAMES[activity].init(players, Math.random, contextFor(players));
    return rt.states[activity];
  }

  /** Interests both players share, so new games start with questions about them. */
  function contextFor([a, b]: [number, number]) {
    const ra = repo.userById(a);
    const rb = repo.userById(b);
    if (!ra || !rb) return {};
    const theirs = interestsOf(rb);
    return { topics: interestsOf(ra).filter((i) => theirs.includes(i)) };
  }

  async function onlineIds(code: string): Promise<number[]> {
    const sockets = await io.in(channel(code)).fetchSockets();
    return [...new Set(sockets.map((s) => (s.data as SocketData).userId))];
  }

  /** Sends every socket in the room its own view, since views hide the partner's secrets. */
  async function broadcastSnapshot(code: string) {
    const room = repo.roomByCode(code);
    if (!room) return;
    const rt = runtimeFor(room);
    const state = gameState(room, rt, rt.activity);
    const sockets = await io.in(channel(code)).fetchSockets();
    const online = [...new Set(sockets.map((s) => (s.data as SocketData).userId))];
    for (const s of sockets) {
      const uid = (s.data as SocketData).userId;
      s.emit("room:snapshot", {
        activity: rt.activity,
        game: state === null ? null : GAMES[rt.activity].view(state, uid),
        online,
      });
    }
  }

  function persist(room: RoomRow, activity: ActivityId, events: GameEvent[] = []) {
    let newMoment = false;
    for (const event of events) {
      if (event.type === "moment") {
        repo.addMoment(room.id, activity, event.title, event.data);
        newMoment = true;
      } else {
        repo.addAnswer(room.id, activity, event.questionId, event.userId, event.answer);
      }
    }
    if (newMoment) io.to(channel(room.code)).emit("room:changed");
  }

  /** Re-reads the room and checks the socket's user still belongs to it. */
  function memberRoom(socket: AppSocket): RoomRow | null {
    const code = socket.data.roomCode;
    if (!code) return null;
    const room = repo.roomByCode(code);
    if (!room || room.status === "closed" || !isMember(room, socket.data.userId)) return null;
    return room;
  }

  io.use((socket, next) => {
    const ticket = socket.handshake.auth?.ticket;
    const userId = typeof ticket === "string" ? verifyToken(ticket, "socket") : null;
    const user = userId ? repo.userById(userId) : undefined;
    if (!userId || !user || effectiveStatus(user) !== "active") return next(new Error("unauthorized"));
    socket.data = { userId, chatTimes: [] } satisfies SocketData;
    next();
  });

  io.on("connection", (raw) => {
    const socket = raw as AppSocket;
    const { userId } = socket.data;
    presence.set(userId, (presence.get(userId) ?? 0) + 1);
    repo.touch(userId);
    void socket.join(`user:${userId}`);

    socket.on("room:join", async (code: unknown, ackFn: unknown) => {
      const ack = safeAck(ackFn);
      const room = typeof code === "string" ? repo.roomByCode(code) : undefined;
      if (!room || room.status === "closed") return ack({ ok: false, error: "This table does not exist or has closed" });
      if (!isMember(room, userId)) return ack({ ok: false, error: "You are not seated at this table" });
      if (socket.data.roomCode && socket.data.roomCode !== room.code) await socket.leave(channel(socket.data.roomCode));
      socket.data.roomCode = room.code;
      await socket.join(channel(room.code));
      ack({ ok: true });
      await broadcastSnapshot(room.code);
      io.to(channel(room.code)).emit("presence", { online: await onlineIds(room.code) });
    });

    socket.on("room:activity", async (activity: unknown, ackFn: unknown) => {
      const ack = safeAck(ackFn);
      const room = memberRoom(socket);
      if (!room) return ack({ ok: false, error: "Join the table first" });
      if (!isActivity(activity)) return ack({ ok: false, error: "Unknown activity" });
      if (room.locked) return ack({ ok: false, error: "This table is set to one activity" });
      runtimeFor(room).activity = activity;
      repo.setRoomActivity(room.id, activity);
      ack({ ok: true });
      await broadcastSnapshot(room.code);
    });

    socket.on("game:action", async (payload: unknown, ackFn: unknown) => {
      const ack = safeAck(ackFn);
      const room = memberRoom(socket);
      if (!room) return ack({ ok: false, error: "Join the table first" });
      const players = playersOf(room);
      if (!players) return ack({ ok: false, error: "Waiting for someone to join" });
      const rt = runtimeFor(room);
      const { activity, action } = (payload ?? {}) as { activity?: unknown; action?: unknown };
      if (activity !== rt.activity) return ack({ ok: false, error: "The activity changed. Try again." });
      const def = GAMES[rt.activity];
      const result = def.reduce(gameState(room, rt, rt.activity), userId, action, players);
      if ("error" in result) return ack({ ok: false, error: result.error });
      rt.states[rt.activity] = result.state;
      persist(room, rt.activity, result.events);
      ack({ ok: true });
      await broadcastSnapshot(room.code);
    });

    socket.on("game:restart", async (_payload: unknown, ackFn: unknown) => {
      const ack = safeAck(ackFn);
      const room = memberRoom(socket);
      const players = room && playersOf(room);
      if (!room || !players) return ack({ ok: false, error: "Waiting for someone to join" });
      const rt = runtimeFor(room);
      rt.states[rt.activity] = GAMES[rt.activity].init(players, Math.random, contextFor(players));
      ack({ ok: true });
      await broadcastSnapshot(room.code);
    });

    socket.on("chat:send", (payload: unknown, ackFn: unknown) => {
      const ack = safeAck(ackFn);
      const room = memberRoom(socket);
      if (!room) return ack({ ok: false, error: "Join the table first" });
      const now = Date.now();
      socket.data.chatTimes = socket.data.chatTimes.filter((t: number) => now - t < 10_000);
      if (socket.data.chatTimes.length >= 8) return ack({ ok: false, error: "Slow down a little" });
      const parsed = chatSchema.safeParse(payload);
      if (!parsed.success) return ack({ ok: false, error: "Messages need 1 to 500 characters" });
      socket.data.chatTimes.push(now);
      const check = checkMessage(parsed.data.body);
      const message = repo.addMessage(room.id, userId, parsed.data.body, check.flagged);
      repo.touch(userId);
      io.to(channel(room.code)).emit("chat:message", { id: message.id, userId, body: message.body, createdAt: message.created_at });
      ack({ ok: true, flagged: check.flagged, tip: check.tip });
    });

    socket.on("chat:typing", () => {
      const code = socket.data.roomCode;
      if (code) socket.to(channel(code)).emit("chat:typing", { userId });
    });

    socket.on("reaction", (kind: unknown) => {
      const code = socket.data.roomCode;
      if (!code || !REACTIONS.includes(kind as (typeof REACTIONS)[number])) return;
      io.to(channel(code)).emit("reaction", { kind, userId, at: Date.now() });
    });

    socket.on("match:join", (payload: unknown, ackFn: unknown) => {
      const ack = safeAck(ackFn);
      const activity = (payload as { activity?: unknown })?.activity;
      const locked = (payload as { locked?: unknown })?.locked === true;
      if (activity !== "any" && !isActivity(activity)) return ack({ ok: false, error: "Unknown activity" });
      const user = repo.userById(userId)!;
      queue = queue.filter((e) => e.userId !== userId);
      const seeker: QueueEntry = { userId, socketId: socket.id, activity, interests: publicUser(user).interests, joinedAt: Date.now() };
      const partner = pickPartner(seeker, queue, repo.isBlocked);
      if (!partner) {
        queue.push(seeker);
        return ack({ ok: true, status: "waiting" });
      }
      queue = queue.filter((e) => e.userId !== partner.userId);
      const chosen = activity !== "any" ? activity : partner.activity !== "any" ? partner.activity : "wyr";
      const partnerName = repo.userById(partner.userId)?.display_name ?? "a new friend";
      const room = repo.createRoom({
        title: `Quick match with ${partnerName} and ${user.display_name}`,
        topic: "",
        activity: chosen,
        isPublic: false,
        hostId: partner.userId,
        guestId: userId,
        kind: "match",
        locked: locked && activity !== "any",
      });
      io.to(partner.socketId).emit("match:found", { code: room.code });
      socket.emit("match:found", { code: room.code });
      ack({ ok: true, status: "matched", code: room.code });
    });

    socket.on("match:leave", () => {
      queue = queue.filter((e) => e.userId !== userId);
    });

    socket.on("disconnect", async () => {
      const left = (presence.get(userId) ?? 1) - 1;
      if (left > 0) presence.set(userId, left);
      else presence.delete(userId);
      repo.touch(userId);
      queue = queue.filter((e) => e.socketId !== socket.id);
      const code = socket.data.roomCode;
      if (code) io.to(channel(code)).emit("presence", { online: await onlineIds(code) });
    });
  });

  const hub: RoomHub = {
    roomUpdated(code) {
      io.to(channel(code)).emit("room:changed");
      void broadcastSnapshot(code);
    },
    roomClosed(code) {
      io.to(channel(code)).emit("room:closed");
      runtimes.delete(code);
    },
    setActivity(code, activity) {
      const room = repo.roomByCode(code);
      if (!room || !isActivity(activity)) return;
      runtimeFor(room).activity = activity;
      repo.setRoomActivity(room.id, activity);
      void broadcastSnapshot(code);
    },
    notify(userId, event, payload) {
      io.to(`user:${userId}`).emit(event, payload);
    },
    isOnline: (userId) => (presence.get(userId) ?? 0) > 0,
  };

  return { io, hub, queueSize: () => queue.length };
}
