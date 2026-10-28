import { Router } from "express";
import { requireActive, requireAdmin, requireAuth, type AuthedRequest } from "../auth.js";
import { BOND_LEVELS, computeBond } from "../bond.js";
import { effectiveStatus } from "../people.js";
import type { Repo } from "../repo.js";
import { adminActionSchema, reportUpdateSchema } from "../validation.js";
import type { RoomHub } from "./rooms.js";

/** Shows enough of an email to tell accounts apart, never the whole address. */
export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}${"*".repeat(Math.max(1, name.length - 2))}@${domain}`;
}

/**
 * The admin area. Admins see counts, reports and account status. They never see
 * private chats: the only messages they can read are ones a reporter chose to attach.
 */
export function adminRoutes(repo: Repo, hub: RoomHub) {
  const r = Router();
  r.use(requireAuth, requireActive(repo), requireAdmin(repo));

  r.get("/overview", (_req, res) => {
    const bonds = repo.acceptedConnections().map((c) => computeBond(repo.pairStats(c.room_code)).level);
    const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, n: 0 }));
    for (const row of repo.messagesByHour()) hours[Number(row.h)].n = row.n;
    const signups = repo.signupsByDay(14);
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10);
      return { day: d, n: signups.find((s) => s.d === d)?.n ?? 0 };
    });
    res.json({
      totals: repo.adminTotals(),
      signups: days,
      activities: repo.momentsByActivity(),
      intents: repo.usersByIntent(),
      bonds: BOND_LEVELS.map((l) => ({ level: l.level, name: l.name, n: bonds.filter((b) => b === l.level).length })),
      hours,
      events: repo.eventSummary().slice(0, 12),
      swipes: repo.swipeStats().map((r) => ({ decision: r.decision, n: r.n, matched: r.matched ?? 0 })),
      recentActions: repo.adminLog(8),
    });
  });

  r.get("/users", (req, res) => {
    const search = typeof req.query.q === "string" ? req.query.q.slice(0, 60) : "";
    res.json({
      users: repo.adminUsers(search).map((u) => ({
        id: u.id,
        displayName: u.display_name,
        email: maskEmail(u.email),
        role: u.role,
        status: effectiveStatus(u),
        suspendedUntil: effectiveStatus(u) === "suspended" ? u.suspended_until : null,
        createdAt: u.created_at,
        lastActiveAt: u.last_active_at,
        city: u.city,
        reportsAgainst: u.reports_against,
        connections: u.connection_count,
        online: hub.isOnline(u.id),
      })),
    });
  });

  r.get("/reports", (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : "active";
    res.json({
      reports: repo.reports(status).map((x) => ({
        id: x.id,
        reason: x.reason,
        details: x.details,
        status: x.status,
        createdAt: x.created_at,
        adminNote: x.admin_note,
        roomCode: x.room_code,
        evidence: JSON.parse(x.evidence || "[]"),
        reporter: { id: x.reporter_id, name: x.reporter_name },
        reported: { id: x.reported_id, name: x.reported_name, status: x.reported_status, totalReports: x.reported_total },
      })),
    });
  });

  r.put("/reports/:id", (req: AuthedRequest, res) => {
    const report = repo.reportById(Number(req.params.id));
    const parsed = reportUpdateSchema.safeParse(req.body);
    if (!report || !parsed.success) {
      res.status(400).json({ error: "Choose a status for this report" });
      return;
    }
    repo.setReportStatus(report.id, parsed.data.status, parsed.data.note);
    repo.logAdmin({ adminId: req.userId!, action: `report:${parsed.data.status}`, targetUserId: report.reported_id, reportId: report.id, note: parsed.data.note });
    res.json({ ok: true });
  });

  r.post("/users/:id/action", (req: AuthedRequest, res) => {
    const target = repo.userById(Number(req.params.id));
    const parsed = adminActionSchema.safeParse(req.body);
    if (!target || !parsed.success) {
      res.status(400).json({ error: "Choose an action" });
      return;
    }
    if (target.role === "admin") {
      res.status(403).json({ error: "Admin accounts cannot be moderated here" });
      return;
    }
    const { action, days, note, reportId } = parsed.data;
    if (action === "suspend") {
      const until = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 19).replace("T", " ");
      repo.setUserStatus(target.id, "suspended", until);
    } else if (action === "ban") {
      repo.setUserStatus(target.id, "banned", null);
    } else if (action === "reinstate") {
      repo.setUserStatus(target.id, "active", null);
    } else {
      hub.notify(target.id, "account:warning", { note: note || "Please keep things kind and respectful." });
    }
    if (action === "suspend" || action === "ban") hub.notify(target.id, "account:status", { status: action === "ban" ? "banned" : "suspended" });
    if (reportId) repo.setReportStatus(reportId, "resolved", note || `Action taken: ${action}`);
    repo.logAdmin({ adminId: req.userId!, action: action === "suspend" ? `suspend:${days}d` : action, targetUserId: target.id, reportId: reportId ?? null, note });
    res.json({ ok: true, status: effectiveStatus(repo.userById(target.id)!) });
  });

  r.get("/audit", (_req, res) => {
    res.json({ actions: repo.adminLog(200) });
  });

  r.get("/me", (req: AuthedRequest, res) => {
    const me = repo.userById(req.userId!)!;
    res.json({
      admin: { id: me.id, displayName: me.display_name, email: me.email, createdAt: me.created_at },
      actions: repo.adminLog(50, me.id),
    });
  });

  return r;
}
