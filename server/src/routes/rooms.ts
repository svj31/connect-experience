import { Router, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { computeCommonGround } from "../commonGround.js";
import { REVEAL_THRESHOLDS, publicUser, revealedUser, type Repo, type RoomRow } from "../repo.js";
import { createRoomSchema, fieldErrors, revealSchema } from "../validation.js";

export interface RoomHub {
  /** Tells everyone in a room that its seats or settings changed. */
  roomUpdated(code: string): void;
  roomClosed(code: string): void;
}

export const isMember = (room: RoomRow, userId: number) => room.host_id === userId || room.guest_id === userId;

export function roomSummary(room: RoomRow) {
  return {
    code: room.code,
    title: room.title,
    topic: room.topic,
    activity: room.activity,
    isPublic: Boolean(room.is_public),
    status: room.status,
    hostId: room.host_id,
    guestId: room.guest_id,
    createdAt: room.created_at,
  };
}

export function roomRoutes(repo: Repo, hub: RoomHub) {
  const r = Router();
  r.use(requireAuth);

  function loadMemberRoom(req: AuthedRequest, res: Response): RoomRow | null {
    const room = repo.roomByCode(String(req.params.code ?? ""));
    if (!room || room.status === "closed") {
      res.status(404).json({ error: "This table does not exist or has closed" });
      return null;
    }
    if (!isMember(room, req.userId!)) {
      res.status(403).json({ error: "You are not seated at this table" });
      return null;
    }
    return room;
  }

  r.get("/open", (req: AuthedRequest, res) => {
    const rooms = repo.openRooms(req.userId!).map((row) => ({
      ...roomSummary(row),
      host: { displayName: row.host_name, avatarShape: row.host_shape, avatarColor: row.host_color, interests: JSON.parse(row.host_interests) as string[] },
    }));
    res.json({ rooms });
  });

  r.get("/mine", (req: AuthedRequest, res) => {
    res.json({ rooms: repo.myRooms(req.userId!).map(roomSummary) });
  });

  r.post("/", (req: AuthedRequest, res) => {
    const parsed = createRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) });
      return;
    }
    const room = repo.createRoom({ ...parsed.data, hostId: req.userId! });
    res.status(201).json({ room: roomSummary(room) });
  });

  r.get("/:code", (req: AuthedRequest, res) => {
    const room = loadMemberRoom(req, res);
    if (!room) return;
    const me = req.userId!;
    const partnerId = room.host_id === me ? room.guest_id : room.host_id;
    const partnerRow = partnerId ? repo.userById(partnerId) : undefined;
    const moments = repo.momentCount(room.id);
    res.json({
      room: roomSummary(room),
      partner: partnerRow ? revealedUser(partnerRow, repo.revealLevel(room.id, partnerRow.id)) : null,
      myRevealLevel: repo.revealLevel(room.id, me),
      momentCount: moments,
      revealThresholds: REVEAL_THRESHOLDS,
    });
  });

  r.post("/:code/join", (req: AuthedRequest, res) => {
    const room = repo.roomByCode(String(req.params.code));
    const me = req.userId!;
    if (!room || room.status === "closed") {
      res.status(404).json({ error: "This table does not exist or has closed" });
      return;
    }
    if (isMember(room, me)) {
      res.json({ room: roomSummary(room) });
      return;
    }
    if (room.guest_id) {
      res.status(409).json({ error: "Someone already took this seat" });
      return;
    }
    if (repo.isBlocked(me, room.host_id)) {
      res.status(403).json({ error: "You cannot join this table" });
      return;
    }
    repo.seatGuest(room.id, me);
    hub.roomUpdated(room.code);
    res.json({ room: roomSummary(repo.roomByCode(room.code)!) });
  });

  r.post("/:code/leave", (req: AuthedRequest, res) => {
    const room = loadMemberRoom(req, res);
    if (!room) return;
    if (room.host_id === req.userId) {
      repo.setRoomStatus(room.id, "closed");
      hub.roomClosed(room.code);
    } else {
      repo.setRoomStatus(room.id, room.is_public ? "open" : "closed", true);
      if (room.is_public) hub.roomUpdated(room.code);
      else hub.roomClosed(room.code);
    }
    res.json({ ok: true });
  });

  r.get("/:code/messages", (req: AuthedRequest, res) => {
    const room = loadMemberRoom(req, res);
    if (!room) return;
    res.json({ messages: repo.messages(room.id).map((m) => ({ id: m.id, userId: m.user_id, body: m.body, createdAt: m.created_at })) });
  });

  r.get("/:code/moments", (req: AuthedRequest, res) => {
    const room = loadMemberRoom(req, res);
    if (!room) return;
    res.json({ moments: repo.roomMoments(room.id).map((m) => ({ ...m, data: JSON.parse(m.data) })) });
  });

  r.get("/:code/common-ground", (req: AuthedRequest, res) => {
    const room = loadMemberRoom(req, res);
    if (!room) return;
    const me = repo.userById(req.userId!)!;
    const partnerId = room.host_id === me.id ? room.guest_id : room.host_id;
    const partner = partnerId ? repo.userById(partnerId) : undefined;
    if (!partner) {
      res.status(409).json({ error: "Common Ground needs two people at the table" });
      return;
    }
    const person = (row: typeof me) => ({ id: row.id, name: row.display_name, interests: publicUser(row).interests });
    res.json({ commonGround: computeCommonGround(person(me), person(partner), repo.answers(room.id)), momentCount: repo.momentCount(room.id) });
  });

  r.put("/:code/reveal", (req: AuthedRequest, res) => {
    const room = loadMemberRoom(req, res);
    if (!room) return;
    const parsed = revealSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Choose a reveal level from 0 to 2" });
      return;
    }
    const needed = REVEAL_THRESHOLDS[parsed.data.level];
    if (repo.momentCount(room.id) < needed) {
      res.status(403).json({ error: `Share ${needed} moments together to unlock this level` });
      return;
    }
    repo.setRevealLevel(room.id, req.userId!, parsed.data.level);
    hub.roomUpdated(room.code);
    res.json({ level: parsed.data.level });
  });

  return r;
}
