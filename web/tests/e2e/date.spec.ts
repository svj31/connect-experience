import { expect, test, type Page } from "@playwright/test";
import { dismissCookies, finishProfile, signUp } from "./helpers";

/**
 * Two people, two separate browsers, one table. This walks the core loop of the product:
 * meet in the lobby, play, talk, create something, reveal a little, and look at Common Ground.
 */
test("two strangers share a table from lobby to moments", async ({ browser }) => {
  test.setTimeout(150_000);
  const hostCtx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const guestCtx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const host = await hostCtx.newPage();
  const guest = await guestCtx.newPage();
  const errors: string[] = [];
  for (const p of [host, guest]) p.on("pageerror", (e) => errors.push(e.message));

  // Sign up and set up profiles.
  await signUp(host, "Asha");
  await dismissCookies(host);
  await finishProfile(host, ["music", "travel", "books"], "Collects train tickets.");
  await signUp(guest, "Ben");
  await dismissCookies(guest);
  await finishProfile(guest, ["music", "travel", "gaming"], "Weekend hiker.");

  // Host starts a public table.
  const title = `E2E table ${Date.now()}`;
  await host.getByLabel("Title").fill(title);
  await host.getByLabel("First activity").selectOption("wyr");
  await host.getByRole("button", { name: "Start the table" }).click();
  await expect(host).toHaveURL(/\/room\/[A-Z0-9]{6}$/);
  const code = host.url().split("/").pop()!;
  await expect(host.getByText(code, { exact: true }).first()).toBeVisible();
  await expect(host.getByText(/Your table is listed in the lobby/)).toBeVisible();

  // Guest finds it in the lobby, sees the shared interests, and sits down.
  await guest.getByRole("button", { name: "Refresh" }).click();
  const card = guest.locator("li", { hasText: title });
  await expect(card).toBeVisible();
  await expect(card.getByText(/You both like/)).toBeVisible();
  await card.getByRole("button", { name: /Sit down/ }).click();
  await expect(guest).toHaveURL(new RegExp(`/room/${code}$`));

  // Both are seated and live.
  for (const p of [host, guest]) await expect(p.getByRole("heading", { name: "Would You Rather" })).toBeVisible();
  await expect(host.getByText("Here now").nth(1)).toBeVisible();

  // Would You Rather: picks stay hidden until both have chosen.
  await host.getByRole("button", { name: /Option A/ }).click();
  await expect(host.getByText("Waiting for Ben to pick")).toBeVisible();
  await expect(guest.getByText("Asha has picked. Your turn.")).toBeVisible();
  await guest.getByRole("button", { name: /Option A/ }).click();
  for (const p of [host, guest]) await expect(p.getByText("Same pick.")).toBeVisible();
  await expect(host.getByText("Ben's pick")).toBeVisible();

  // Chat, with a typing indicator on the other side.
  await host.getByLabel("Message").fill("That was fast");
  await host.getByRole("button", { name: "Send", exact: true }).click();
  await expect(guest.getByText("That was fast")).toBeVisible();

  // Connect Four: turns are enforced live.
  await host.getByRole("button", { name: "Connect Four" }).click();
  for (const p of [host, guest]) await expect(p.getByRole("heading", { name: "Connect Four" })).toBeVisible();
  await expect(host.getByText("Your turn. Pick a column.")).toBeVisible();
  await host.getByRole("button", { name: "Drop in column 4" }).click();
  await expect(guest.getByText("Your turn. Pick a column.")).toBeVisible();
  await expect(host.getByText("Ben's turn")).toBeVisible();

  // Watch Together rejects anything that is not a YouTube link.
  await host.getByRole("button", { name: "Watch Together" }).click();
  await host.getByLabel("YouTube link").fill("https://example.com/video");
  await host.getByRole("button", { name: "Load video" }).click();
  await expect(host.getByText("Paste a YouTube link or video id")).toBeVisible();

  // Constellation: place stars by tapping the 3D globe, then name it together.
  await host.getByRole("button", { name: "Constellation" }).click();
  for (const p of [host, guest]) await expect(p.getByRole("heading", { name: "Constellation" })).toBeVisible();
  const canvas = host.locator("canvas").last();
  await expect(canvas).toBeVisible();
  await host.waitForTimeout(800);
  const box = (await canvas.boundingBox())!;
  for (const [dx, dy] of [[-40, -30], [10, 20], [50, -10]]) {
    await host.mouse.click(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy);
    await host.waitForTimeout(250);
  }
  await expect(guest.getByText(/3 of 24 stars/)).toBeVisible();
  await guest.getByLabel("Name your constellation").fill("The Paper Kite");
  await guest.getByRole("button", { name: "Name it" }).click();
  for (const p of [host, guest]) await expect(p.getByRole("heading", { name: '"The Paper Kite"' })).toBeVisible();
  await expect(host.getByText("1 moment shared at this table.")).toBeVisible();

  // Progressive reveal: level 1 unlocks after one moment. The guest then sees the bio.
  await host.getByRole("button", { name: /Reveal/ }).click();
  await host.getByRole("button", { name: /Level 1: Your bio/ }).click();
  await expect(host.getByRole("button", { name: /Level 1: Your bio/ })).toHaveAttribute("aria-pressed", "true");
  await expect(host.getByRole("button", { name: /Level 2: Your handle/ })).toBeDisabled();
  await host.keyboard.press("Escape");
  await guest.getByRole("button", { name: /Reveal/ }).click();
  await expect(guest.getByText("Collects train tickets.")).toBeVisible();
  await guest.keyboard.press("Escape");

  // Common Ground uses the real answers.
  await guest.getByRole("button", { name: /Common Ground/ }).click();
  await expect(guest.getByText("1 of 1")).toBeVisible();
  await expect(guest.getByText("music", { exact: true })).toBeVisible();
  await guest.getByRole("button", { name: "Use", exact: true }).first().click();
  await expect(host.locator("li", { hasText: /You both|You chose|What got/ }).last()).toBeVisible();

  // Reactions float up on the other screen.
  await guest.getByRole("button", { name: "Send a heart" }).click();

  await host.screenshot({ path: "test-results/room-host.png" });
  await guest.screenshot({ path: "test-results/room-guest.png" });

  // Moments keep what you made.
  await host.goto("/moments");
  await expect(host.getByText('Constellation named "The Paper Kite"')).toBeVisible();
  await expect(host.getByText("With Ben")).toBeVisible();

  expect(errors).toEqual([]);
  await hostCtx.close();
  await guestCtx.close();
});

test("Quick Match pairs two people who want the same activity", async ({ browser }) => {
  const pages: Page[] = [];
  for (const name of ["Cara", "Dev"]) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await signUp(page, name);
    await dismissCookies(page);
    await finishProfile(page, ["films"]);
    pages.push(page);
  }
  const [a, b] = pages;
  await a.getByLabel("Activity", { exact: true }).selectOption("memory");
  await a.getByRole("button", { name: "Find someone" }).click();
  await expect(a.getByText("Looking for someone for Memory Match")).toBeVisible();
  await b.getByLabel("Activity", { exact: true }).selectOption("memory");
  await b.getByRole("button", { name: "Find someone" }).click();
  await expect(a).toHaveURL(/\/room\/[A-Z0-9]{6}$/);
  await expect(b).toHaveURL(a.url());
  for (const p of [a, b]) await expect(p.getByRole("heading", { name: "Memory Match" })).toBeVisible();
});

test("the room works on a phone with activity and chat tabs", async ({ browser }) => {
  const hostCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const guestCtx = await browser.newContext();
  const host = await hostCtx.newPage();
  const guest = await guestCtx.newPage();
  await signUp(host, "Eli");
  await dismissCookies(host);
  await finishProfile(host, ["art"]);
  await signUp(guest, "Fay");
  await dismissCookies(guest);
  await finishProfile(guest, ["art"]);

  await host.getByLabel("Title").fill("Phone table");
  await host.getByLabel("First activity").selectOption("story");
  await host.getByLabel("List it in the lobby").uncheck();
  await host.getByRole("button", { name: "Start the table" }).click();
  await expect(host).toHaveURL(/\/room\//);
  const code = host.url().split("/").pop()!;

  // Private table: joined with the code, not from the list.
  await guest.getByLabel("Table code").fill(code.toLowerCase());
  await guest.getByRole("button", { name: "Join", exact: true }).click();
  await expect(guest).toHaveURL(new RegExp(`/room/${code}$`));

  await expect(host.getByRole("heading", { name: "Story Chain" })).toBeVisible();
  // Icon only buttons on a phone still have names for screen readers.
  for (const name of ["Common Ground", "Reveal", "Safety", "Leave", "Lobby"]) {
    await expect(host.getByRole(name === "Lobby" ? "link" : "button", { name })).toBeVisible();
  }
  await host.getByLabel("Your next line").fill("Nobody on the platform looked surprised.");
  await host.getByRole("button", { name: /Add line/ }).click();
  await expect(guest.getByText("Nobody on the platform looked surprised.")).toBeVisible();

  await guest.getByLabel("Message").fill("Your turn on chat");
  await guest.getByRole("button", { name: "Send", exact: true }).click();
  const chatTab = host.getByRole("navigation", { name: "Room views" }).getByRole("button", { name: /Chat/ });
  await expect(chatTab).toContainText("1");
  await chatTab.click();
  await expect(host.getByText("Your turn on chat")).toBeVisible();
  const overflow = await host.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await host.screenshot({ path: "test-results/room-phone.png" });
});
