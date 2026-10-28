import { expect, test } from "@playwright/test";
import { buildProfile, dismissCookies, newPerson, signUp } from "./helpers";

const CITY = `Testpur${Date.now() % 100000}`;

test.describe("two people meet, connect, chat and play", () => {
  test("Discover, request with a note, accept, chat and Deep Talk", async ({ browser }) => {
    test.setTimeout(150_000);
    const a = await newPerson(browser);
    const b = await newPerson(browser);
    await signUp(a.page, "Anaya");
    await buildProfile(a.page, { interests: ["Astronomy", "Music", "Books"], gender: "woman", lookingFor: "men", city: CITY, bio: "Stargazer who reads on trains." });
    await signUp(b.page, "Bilal");
    await buildProfile(b.page, { interests: ["Astronomy", "Music", "Coffee"], gender: "man", lookingFor: "women", city: CITY, bio: "Telescope on the balcony." });

    // Bilal is online, so the request reaches him live.
    await b.page.goto("/app");
    await expect(b.page.getByText("Live", { exact: true })).toBeVisible();

    // Anaya finds Bilal with filters and sees why they might click.
    await a.page.goto("/app/discover");
    await a.page.getByRole("radio", { name: "Browse" }).click();
    await a.page.getByLabel("City").selectOption(CITY);
    await expect(a.page.locator("article")).toHaveCount(1);
    const card = a.page.locator("article", { hasText: "Bilal" });
    await expect(card.getByText(/You both love astronomy and music/)).toBeVisible();
    await card.getByRole("button", { name: "Connect" }).click();
    await a.page.getByLabel("Add a note (optional)").fill("Fellow stargazer! Constellation sometime?");
    await a.page.getByRole("button", { name: "Send request" }).click();
    await expect(a.page.getByText("Request sent")).toBeVisible();

    // Bilal gets it live, opens the request and accepts.
    await expect(b.page.getByText("Anaya wants to connect").first()).toBeVisible();
    await b.page.goto("/app/connections?tab=requests");
    await expect(b.page.getByText("Fellow stargazer! Constellation sometime?")).toBeVisible();
    await b.page.getByRole("button", { name: "Like back" }).click();
    const party = b.page.getByRole("dialog", { name: "It's a Saath!" });
    await expect(party).toBeVisible();
    await expect(a.page.getByText("Bilal accepted your request")).toBeVisible();

    // Chats: Anaya writes, Bilal reads it in the room's floating chat.
    await party.getByRole("button", { name: "Say hello" }).click();
    await expect(b.page).toHaveURL(/\/app\/room\/[A-Z0-9]{6}/);
    await expect(b.page.getByRole("heading", { name: "Deep Talk" })).toBeVisible();
    await a.page.goto("/app/chats");
    await a.page.getByRole("complementary", { name: "Conversations" }).getByRole("button", { name: /Bilal/ }).click();
    await a.page.getByLabel("Message").fill("Hi Bilal, saw your telescope prompt");
    await a.page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(b.page.getByRole("button", { name: /Open chat, 1 unread/ })).toBeVisible();
    await b.page.getByRole("button", { name: /Open chat/ }).click();
    await expect(b.page.locator("#room-chat").getByText("Hi Bilal, saw your telescope prompt")).toBeVisible();

    // The kindness nudge stops an unkind message until confirmed.
    await b.page.locator("#room-chat").getByLabel("Message").fill("that was stupid");
    await b.page.locator("#room-chat").getByRole("button", { name: "Send", exact: true }).click();
    await expect(b.page.getByText("Does this feel kind?")).toBeVisible();
    await b.page.getByRole("button", { name: "Rephrase" }).click();

    // Together hub: Talk, Deep Talk, with a connection.
    // Orbits stand still with reduced motion, so the planets are steady targets for the test.
    await a.page.emulateMedia({ reducedMotion: "reduce" });
    await a.page.goto("/app/together");
    await a.page.getByRole("tab", { name: /^Talk/ }).click();
    await a.page.getByRole("button", { name: /Deep Talk/ }).click();
    await a.page.getByRole("tab", { name: /Someone I am connected with/ }).click();
    await a.page.locator("section[aria-labelledby=step2]").getByRole("button", { name: /Bilal/ }).click();
    await expect(a.page).toHaveURL(/\/app\/room\//);
    await expect(a.page.getByRole("heading", { name: "Deep Talk" })).toBeVisible();
    await expect(b.page.getByRole("heading", { name: "Deep Talk" })).toBeVisible();

    await a.page.getByLabel("Your answer").fill("Clear skies after rain");
    await a.page.getByRole("button", { name: "Lock in my answer" }).click();
    await expect(b.page.getByText(/Anaya has answered/)).toBeVisible();
    await b.page.getByLabel("Your answer").fill("Finding a new song");
    await b.page.getByRole("button", { name: "Lock in my answer" }).click();
    await expect(a.page.getByText("Finding a new song")).toBeVisible();
    await expect(b.page.getByText("Clear skies after rain")).toBeVisible();

    // Together invites: both people see the plan in Live now. Bilal says not now, Anaya sees it and clears it.
    await a.page.goto("/app/together");
    await a.page.getByRole("tab", { name: /^Talk/ }).click();
    await a.page.getByRole("button", { name: /Deep Talk/ }).click();
    await a.page.getByRole("tab", { name: /Someone I am connected with/ }).click();
    await a.page.locator("section[aria-labelledby=step2]").getByRole("button", { name: /Bilal/ }).click();
    await expect(a.page).toHaveURL(/\/app\/room\//);
    await b.page.goto("/app/together");
    const invite = b.page.getByRole("listitem").filter({ hasText: "Anaya wants to play Deep Talk" });
    await expect(invite).toBeVisible();
    await invite.getByRole("button", { name: "Not now" }).click();
    await expect(invite).toHaveCount(0);
    await expect(a.page.getByText("Bilal can't do Deep Talk right now")).toBeVisible();
    await a.page.goto("/app/together");
    await expect(a.page.getByText("Bilal can't right now")).toBeVisible();
    await a.page.getByRole("button", { name: "Clear" }).click();
    await expect(a.page.getByText("Nothing live yet")).toBeVisible();

    // Bond and Vibe show on the profile.
    await a.page.goto("/app/connections?tab=all");
    await a.page.locator("#main").getByRole("link", { name: "Bilal" }).first().click();
    await expect(a.page.getByRole("region", { name: "Your bond" })).toContainText("Stardust");
    await expect(a.page.getByRole("region", { name: "Vibe Match" })).toContainText("Shared interests");
    await a.ctx.close();
    await b.ctx.close();
  });

  test("Quick Match pairs two people on a locked Connect Four table", async ({ browser }) => {
    test.setTimeout(90_000);
    const a = await newPerson(browser);
    const b = await newPerson(browser);
    await signUp(a.page, "Quinn");
    await signUp(b.page, "Ravi");
    for (const p of [a.page, b.page]) {
      await p.emulateMedia({ reducedMotion: "reduce" });
      await p.goto("/app/together");
      await p.getByRole("tab", { name: /^Play/ }).click();
      await p.getByRole("button", { name: /Connect Four/ }).click();
      await p.getByRole("tab", { name: /Meet someone new/ }).click();
      await p.getByLabel("Only Connect Four").check();
    }
    await a.page.getByRole("button", { name: "Find someone now" }).click();
    await expect(a.page.getByText("Looking for someone in your orbit")).toBeVisible();
    await b.page.getByRole("button", { name: "Find someone now" }).click();
    await expect(a.page).toHaveURL(/\/app\/room\//);
    await expect(b.page).toHaveURL(/\/app\/room\//);
    await expect(a.page.getByText(/This table is set to/)).toBeVisible();
    await expect(a.page.getByRole("heading", { name: "Connect Four" })).toBeVisible();
    await a.ctx.close();
    await b.ctx.close();
  });
});

test.describe("demo member", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookies(page);
    await page.goto("/login");
    await page.getByRole("button", { name: "Use the demo member account" }).click();
    await expect(page).toHaveURL(/\/app\/discover$/);
  });

  test("dashboard, views and suggestions", async ({ page }) => {
    await page.goto("/app");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ava");
    await expect(page.getByText("Question of the day")).toBeVisible();
    await page.getByRole("radio", { name: "Cards" }).click();
    await expect(page.locator("#main").getByRole("link", { name: "Rohan", exact: true }).last()).toBeVisible();
    await page.getByRole("radio", { name: "Timeline" }).click();
    await expect(page.getByText("The Midnight Chai")).toBeVisible();
    await expect(page.getByRole("table", { name: /Messages and moments/ })).toBeAttached();
  });

  test("Discover profiles, cards deck with undo, and browse", async ({ page }) => {
    await page.goto("/app/discover");
    // Hinge style profile: like a specific photo, then pass on the next person.
    const name = (await page.getByRole("button", { name: /^Pass on / }).getAttribute("aria-label"))!.replace("Pass on ", "");
    await page.getByRole("button", { name: `Like ${name}'s photo 1` }).click();
    await page.getByLabel("Add a comment").fill("Love this photo");
    await page.getByRole("button", { name: "Send like" }).click();
    await expect(page.getByRole("button", { name: /^Pass on / })).not.toHaveAttribute("aria-label", `Pass on ${name}`);
    const matched = page.getByRole("dialog", { name: "It's a Saath!" });
    if (await matched.isVisible()) await page.keyboard.press("Escape");
    // The roll: drag the profile left to pass. It settles on the left, where the pass can be undone.
    const next = (await page.getByRole("button", { name: /^Pass on / }).getAttribute("aria-label"))!.replace("Pass on ", "");
    const box = (await page.getByRole("article", { name: `${next}'s profile` }).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 200);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(box.x + box.width / 2 - i * 30, box.y + 200);
    await page.mouse.up();
    await expect(page.getByRole("button", { name: /^Pass on / })).not.toHaveAttribute("aria-label", `Pass on ${next}`);
    await expect(page.getByRole("button", { name: `Previous: ${next}. Undo pass` })).toBeVisible();
    await page.getByRole("radio", { name: "Cards" }).click();
    await expect(page.getByText(/likes left today/)).toBeVisible();
    const pass = page.getByRole("button", { name: /^Pass on / });
    const first = await pass.getAttribute("aria-label");
    await pass.click();
    await expect(page.getByRole("button", { name: /^Pass on / })).not.toHaveAttribute("aria-label", first!);
    // A pass can be undone, bringing the same person back to the top.
    await page.getByRole("button", { name: "Undo last pass" }).click();
    await expect(page.getByRole("button", { name: /^Pass on / })).toHaveAttribute("aria-label", first!);
    // Keyboard: right arrow likes the top card.
    const liked = await page.getByRole("button", { name: /^Like \S+$/ }).getAttribute("aria-label");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: /^Like \S+$/ })).not.toHaveAttribute("aria-label", liked!);
    // Ava's top picks include people who already liked her, so this may be a match.
    const party = page.getByRole("dialog", { name: "It's a Saath!" });
    if (await party.isVisible()) await page.keyboard.press("Escape");
    await page.getByRole("radio", { name: "Browse" }).click();
    await page.getByRole("button", { name: "Reset filters" }).click();
    await expect(page.locator("#main article").first()).toBeVisible();
  });

  test("connections, requests, moments, settings and safety", async ({ page }) => {
    await page.goto("/app/connections?tab=all");
    await page.getByRole("radio", { name: "Bond ladder" }).click();
    await expect(page.getByRole("region", { name: "Orbit bonds" })).toContainText("Rohan");
    // Which seeded likes are still waiting depends on what the Discover test liked, so check the tab itself.
    await page.getByRole("tab", { name: /Likes you/ }).click();
    await expect(page.getByRole("tab", { name: /Likes you/ })).toHaveAttribute("aria-selected", "true");

    await page.goto("/app/moments");
    await page.getByRole("button", { name: /favourites$/ }).first().click();
    await page.getByRole("button", { name: "Favourites", exact: true }).click();
    await expect(page.getByRole("button", { name: "Add to favourites" })).toHaveCount(0);
    await page.getByRole("radio", { name: "By person" }).click();
    await expect(page.getByRole("heading", { name: /With Rohan/ })).toBeVisible();

    await page.goto("/app/settings");
    await page.getByLabel("Who can see Lifestyle").selectOption("orbit");
    await expect(page.getByText("Privacy saved")).toBeVisible();
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: "Light", exact: true }).click();

    await page.goto("/app/safety");
    await page.getByLabel("Who").fill("Rohan");
    await expect(page.getByText(/I'm meeting Rohan/)).toBeVisible();
  });
});

test.describe("admin", () => {
  test("members cannot open the admin console", async ({ page }) => {
    await dismissCookies(page);
    await page.goto("/login");
    await page.getByRole("button", { name: "Use the demo member account" }).click();
    await expect(page).toHaveURL(/\/app\/discover$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/app\/discover$/);
  });

  test("admin sign up needs an invite code", async ({ page }) => {
    await dismissCookies(page);
    await page.goto("/signup?as=admin");
    await page.getByLabel("First name or nickname").fill("Mod Tester");
    await page.getByLabel("Email").fill(`mod-${Date.now()}@example.com`);
    await page.getByLabel("Password", { exact: true }).fill("moderator123");
    await page.getByLabel("Invite code").fill("WRONG");
    await page.waitForTimeout(1700);
    await page.getByRole("button", { name: "Create admin account" }).click();
    await expect(page.getByText("That invite code is not valid")).toBeVisible();
    await page.getByLabel("Invite code").fill("SAATH-ADMIN-2026");
    await page.getByRole("button", { name: "Create admin account" }).click();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("reviews a report, pauses and restores an account, and it is logged", async ({ page }) => {
    await dismissCookies(page);
    await page.goto("/login?as=admin");
    await page.getByRole("button", { name: "Use the demo admin account" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Community overview" })).toBeVisible();
    await expect(page.getByRole("table", { name: "Sign ups per day" })).toBeAttached();

    await page.goto("/admin/users");
    await page.getByLabel("Search members").fill("Kabir");
    const row = page.getByRole("row", { name: /Kabir/ });
    await expect(row).toContainText(/ka\*+@saathverse\.test/);
    await row.getByRole("button", { name: "Pause" }).click();
    await page.getByLabel("Note for the audit log").fill("E2E test pause");
    await page.getByRole("button", { name: "Pause account" }).click();
    await expect(row).toContainText("Suspended");
    await row.getByRole("button", { name: "Restore" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Restore" }).click();
    await expect(row).toContainText("Active");

    await page.goto("/admin/reports");
    await expect(page.getByText(/reported/).first()).toBeVisible();
    await page.goto("/admin/audit");
    await expect(page.getByText("E2E test pause").first()).toBeVisible();
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("bottom navigation and the floating chat in a room", async ({ page }) => {
    await dismissCookies(page);
    await page.goto("/login");
    await page.getByRole("button", { name: "Use the demo member account" }).click();
    await expect(page).toHaveURL(/\/app\/discover$/);
    await page.locator("nav[aria-label='App']").last().getByRole("link", { name: "Matches" }).click();
    await expect(page).toHaveURL(/\/app\/chats/);
    const code = await page.evaluate(async () => (await (await fetch("/api/connections")).json()).connections[0].roomCode);
    await page.goto(`/app/room/${code}`);
    await page.getByRole("button", { name: /Open chat/ }).click();
    await expect(page.locator("#room-chat").getByLabel("Message")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
