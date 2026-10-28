import { expect, test } from "@playwright/test";

const PUBLIC = ["/", "/signup", "/login", "/safety", "/contact", "/privacy", "/terms"];

test.describe("public pages", () => {
  for (const path of PUBLIC) {
    test(`${path} has metadata, one h1 and no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      const res = await page.goto(path, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(/SaathVerse/);
      expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
      expect(await page.locator('meta[property="og:image"]').count()).toBeGreaterThan(0);
      expect(await page.locator("html").getAttribute("lang")).toBe("en");
      await expect(page.locator("h1:visible")).toHaveCount(1);
      // Every image has a text alternative.
      for (const img of await page.locator("img").all()) expect(await img.getAttribute("alt")).not.toBeNull();
      for (const svg of await page.locator('svg[role="img"]').all()) expect(await svg.getAttribute("aria-label")).toBeTruthy();
      // House style: no em dashes in visible copy.
      expect(await page.locator("body").innerText()).not.toContain("—");
      expect(errors).toEqual([]);
    });
  }

  test("unknown pages return a custom 404", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Lost in the verse" })).toBeVisible();
  });

  test("SEO files and icons are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Sitemap:");
    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain("/privacy");
    expect((await request.get("/icon.svg")).headers()["content-type"]).toContain("svg");
    expect((await request.get("/opengraph-image")).headers()["content-type"]).toContain("image/png");
    expect((await request.get("/manifest.webmanifest")).ok()).toBe(true);
  });

  test("security headers are set and secrets are not shipped", async ({ request, page }) => {
    const res = await request.get("/");
    const headers = res.headers();
    expect(headers["strict-transport-security"]).toContain("max-age");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-powered-by"]).toBeUndefined();
    await page.goto("/");
    const scripts = await page.locator("script[src]").evaluateAll((els) => els.map((e) => (e as HTMLScriptElement).src));
    for (const src of scripts) {
      const body = await (await request.get(src)).text();
      expect(body).not.toMatch(/JWT_SECRET|ADMIN_TOKEN|API_ORIGIN/);
    }
  });

  test("no broken internal links on public pages", async ({ page, request }) => {
    const seen = new Set<string>();
    for (const path of PUBLIC) {
      await page.goto(path);
      const hrefs = await page.locator("a[href]").evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!));
      for (const href of hrefs) if (href.startsWith("/")) seen.add(href.split("#")[0] || "/");
    }
    for (const href of seen) {
      const res = await request.get(href, { maxRedirects: 0 });
      // Signed in pages redirect to sign in, which is expected for a visitor.
      expect([200, 307], `${href} returned ${res.status()}`).toContain(res.status());
    }
    expect(seen.size).toBeGreaterThanOrEqual(8);
  });

  test("protected pages send visitors to sign in and back", async ({ page }) => {
    await page.goto("/app/discover");
    await expect(page).toHaveURL(/\/login\?next=%2Fapp%2Fdiscover/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?as=admin&next=%2Fadmin/);
  });

  test("cookie banner records the choice and stays hidden", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("region", { name: "Cookie consent" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Accept analytics" }).click();
    await expect(banner).toBeHidden();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(banner).toBeHidden();
  });

  test("old addresses redirect to the new app", async ({ request }) => {
    const res = await request.get("/lobby", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers().location).toBe("/app/together");
  });

  test("the logo animates on hover and the theme toggle switches to dark", async ({ page }) => {
    await page.goto("/");
    const heart = page.locator("header .sv-logo .heart-b").first();
    await page.locator("header .sv-logo").first().hover();
    await expect.poll(() => heart.evaluate((el) => getComputedStyle(el).animationName)).toBe("heartbeat");
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("layout fits a phone with no sideways scroll", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const page = await ctx.newPage();
    for (const path of ["/", "/signup", "/login?as=admin", "/privacy"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
    await ctx.close();
  });
});

test.describe("forms", () => {
  test("signup shows inline errors before sending", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: "Create my account" }).click();
    await expect(page.getByText("Use at least 2 characters")).toBeVisible();
    await expect(page.getByText("Enter your email")).toBeVisible();
    await expect(page.getByText("You must be 18 or older to use SaathVerse")).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("contact form validates and sends", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Write at least 10 characters")).toBeVisible();
    await page.getByLabel("Your name").fill("Playwright");
    await page.getByLabel("Email").fill("pw@example.com");
    await page.getByLabel("Message").fill("Testing the contact form end to end.");
    await page.waitForTimeout(1700);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Message received")).toBeVisible();
  });
});
