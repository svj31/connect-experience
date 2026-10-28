// Layout audit: sideways scroll, clipped control text, and controls covering each other,
// on every page at 360, 390, 768 and 1440 px. Run against a started app: node tests/layout-audit.mjs

import { chromium } from "@playwright/test";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PUBLIC = ["/", "/login", "/signup", "/safety", "/contact"];
const APP = ["/app", "/app/discover", "/app/standouts", "/app/connections", "/app/connections?tab=requests", "/app/together", "/app/chats", "/app/moments", "/app/profile", "/app/settings", "/app/safety", "/app/people/2"];
const ADMIN = ["/admin", "/admin/reports", "/admin/users"];
const sizes = [[360, 740], [390, 844], [768, 1024], [1440, 900]];
const b = await chromium.launch();
const issues = [];
async function audit(page, path, w) {
  await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(700);
  const r = await page.evaluate(() => {
    const out = [];
    const de = document.documentElement;
    if (de.scrollWidth - de.clientWidth > 0) out.push(`page scrolls sideways by ${de.scrollWidth - de.clientWidth}px`);
    const vis = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05 && r.width > 2 && r.height > 2; };
    const label = (el) => (el.getAttribute("aria-label") || el.textContent || el.getAttribute("placeholder") || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
    const ctrls = [...document.querySelectorAll("button, a[href], input:not([type=hidden]):not(.sr-only), select, textarea")].filter((el) => vis(el) && !el.closest(".sr-only, [aria-hidden=true], .marquee, dialog:not([open])") && !el.hasAttribute("data-tapzone"));
    for (const el of ctrls) {
      if (el.matches(".truncate, .line-clamp-2") || el.querySelector(".truncate")) continue;
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== "auto") out.push(`clipped text: "${label(el)}" (${el.scrollWidth}>${el.clientWidth})`);
    }
    const rects = ctrls.map((el) => [el, el.getBoundingClientRect()]);
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const [a, ra] = rects[i], [c, rc] = rects[j];
      if (a.contains(c) || c.contains(a)) continue;
      // Content scrolling under a fixed or sticky bar is expected; wrapped inline links are not boxes.
      const pinned = (el) => { for (let n = el; n; n = n.parentElement) { const p = getComputedStyle(n).position; if (p === "fixed" || p === "sticky") return true; } return false; };
      if (pinned(a) !== pinned(c)) continue;
      if (a.getClientRects().length > 1 || c.getClientRects().length > 1) continue;
      const x = Math.min(ra.right, rc.right) - Math.max(ra.left, rc.left);
      const y = Math.min(ra.bottom, rc.bottom) - Math.max(ra.top, rc.top);
      if (x > 4 && y > 4) {
        // Only count it if one actually covers the other at the overlap centre.
        const cx = Math.max(ra.left, rc.left) + x / 2, cy = Math.max(ra.top, rc.top) + y / 2;
        const top = document.elementFromPoint(cx, cy);
        if (top && (a.contains(top) || c.contains(top))) out.push(`overlap: "${label(a)}" x "${label(c)}"`);
      }
    }
    return out;
  });
  for (const m of r) issues.push(`${w}px ${path}: ${m}`);
}
for (const [w, h] of sizes) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/"); const ess = p.getByRole("button", { name: "Essential only" }); if (await ess.isVisible().catch(() => false)) await ess.click();
  for (const path of PUBLIC) await audit(p, path, w);
  await p.request.post(BASE + "/api/auth/demo", { data: { as: "user" } });
  for (const path of APP) await audit(p, path, w);
  await p.request.post(BASE + "/api/auth/demo", { data: { as: "admin" } });
  for (const path of ADMIN) await audit(p, path, w);
  await ctx.close();
}
await b.close();
console.log([...new Set(issues)].join("\n") || "NO ISSUES");
