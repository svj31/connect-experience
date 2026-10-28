import { Router, type Response } from "express";
import { requireActive, requireAuth, type AuthedRequest } from "../auth.js";
import { avatarOf, privacyOf } from "../people.js";
import type { PlanRow } from "../plans.js";
import type { Repo } from "../repo.js";
import { roomSummary, type RoomHub } from "./rooms.js";

/** Together invites between connections: see what is live, answer an invite, or call it off. */
export function togetherRoutes(repo: Repo, hub: RoomHub) {
  const r = Router();
  r.use(requireAuth, requireActive(repo));

  function view(plan: PlanRow, me: number) {
    const otherId = plan.host_id === me ? plan.guest_id : plan.host_id;
    const other = repo.userById(otherId);
    return {
      id: plan.id,
      activity: plan.activity,
      status: plan.status,
      role: plan.host_id === me ? ("host" as const) : ("guest" as const),
      roomCode: plan.room_code,
      createdAt: plan.created_at,
      respondedAt: plan.responded_at,
      person: other
        ? { id: other.id, displayName: other.display_name, avatar: avatarOf(other), online: privacyOf(other).showOnline ? hub.isOnline(other.id) : null }
        : null,
    };
  }

  function loadPlan(req: AuthedRequest, res: Response) {
    const plan = repo.planById(Number(req.params.id));
    const me = req.userId!;
    if (!plan || (plan.host_id !== me && plan.guest_id !== me)) {
      res.status(404).json({ error: "That plan no longer exists" });
      return null;
    }
    return plan;
  }

  function tell(plan: PlanRow, from: number, status: string) {
    const to = plan.host_id === from ? plan.guest_id : plan.host_id;
    hub.notify(to, "together:update", { id: plan.id, status, activity: plan.activity, roomCode: plan.room_code, name: repo.userById(from)?.display_name ?? "Your connection" });
  }

  r.get("/live", (req: AuthedRequest, res) => {
    const me = req.userId!;
    const plans = repo.livePlans(me).filter((p) => !repo.isBlocked(p.host_id, p.guest_id)).map((p) => view(p, me));
    const tables = repo.myRooms(me).filter((t) => t.kind !== "connection").map(roomSummary);
    res.json({
      received: plans.filter((p) => p.role === "guest"),
      sent: plans.filter((p) => p.role === "host"),
      tables,
    });
  });

  r.post("/:id/accept", (req: AuthedRequest, res) => {
    const plan = loadPlan(req, res);
    if (!plan) return;
    if (plan.guest_id !== req.userId || plan.status !== "pending") {
      res.status(409).json({ error: "This invite is no longer waiting for an answer" });
      return;
    }
    repo.setPlanStatus(plan.id, "accepted");
    hub.setActivity(plan.room_code, plan.activity);
    tell(plan, req.userId!, "accepted");
    res.json({ roomCode: plan.room_code });
  });

  r.post("/:id/decline", (req: AuthedRequest, res) => {
    const plan = loadPlan(req, res);
    if (!plan) return;
    if (plan.guest_id !== req.userId || plan.status !== "pending") {
      res.status(409).json({ error: "This invite is no longer waiting for an answer" });
      return;
    }
    repo.setPlanStatus(plan.id, "declined");
    tell(plan, req.userId!, "declined");
    res.json({ ok: true });
  });

  /** Either person can call a plan off: the host cancels an unanswered invite, anyone ends a live one. */
  r.post("/:id/end", (req: AuthedRequest, res) => {
    const plan = loadPlan(req, res);
    if (!plan) return;
    if (plan.status === "ended" || plan.status === "cancelled") {
      res.json({ ok: true });
      return;
    }
    const status = plan.status === "pending" ? "cancelled" : "ended";
    repo.setPlanStatus(plan.id, status);
    if (plan.status !== "declined") tell(plan, req.userId!, status);
    res.json({ ok: true });
  });

  return r;
}
