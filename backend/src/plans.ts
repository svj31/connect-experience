import type { DB } from "./db.js";

/**
 * A plan is one Together invite between two connections: someone picks an activity and asks the
 * other to join. It stays pending until they accept or decline, and either person can end it.
 */
export type PlanStatus = "pending" | "accepted" | "declined" | "ended" | "cancelled";

export interface PlanRow {
  id: number;
  connection_id: number;
  room_code: string;
  host_id: number;
  guest_id: number;
  activity: string;
  status: PlanStatus;
  created_at: string;
  responded_at: string | null;
}

export function plansRepo(db: DB) {
  return {
    createPlan(p: { connectionId: number; roomCode: string; hostId: number; guestId: number; activity: string }): PlanRow {
      // A new plan replaces whatever the pair had going, so there is only ever one live plan per pair.
      db.prepare("UPDATE plans SET status = 'ended', responded_at = datetime('now') WHERE connection_id = ? AND status IN ('pending', 'accepted')").run(p.connectionId);
      const id = db
        .prepare("INSERT INTO plans (connection_id, room_code, host_id, guest_id, activity) VALUES (?, ?, ?, ?, ?)")
        .run(p.connectionId, p.roomCode, p.hostId, p.guestId, p.activity).lastInsertRowid;
      return db.prepare<[number], PlanRow>("SELECT * FROM plans WHERE id = ?").get(Number(id))!;
    },
    planById(id: number) {
      return db.prepare<[number], PlanRow>("SELECT * FROM plans WHERE id = ?").get(id);
    },
    setPlanStatus(id: number, status: PlanStatus) {
      db.prepare("UPDATE plans SET status = ?, responded_at = datetime('now') WHERE id = ?").run(status, id);
    },
    /** Live plans, plus declines from the last day so the host sees the answer. Older pending ones lapse. */
    livePlans(userId: number) {
      return db
        .prepare<[number, number, number], PlanRow>(
          `SELECT * FROM plans WHERE (host_id = ? OR guest_id = ?) AND created_at > datetime('now', '-1 day')
             AND (status IN ('pending', 'accepted') OR (status = 'declined' AND host_id = ?))
           ORDER BY id DESC`,
        )
        .all(userId, userId, userId);
    },
  };
}
