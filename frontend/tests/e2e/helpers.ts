import { expect, type Browser, type Page } from "@playwright/test";

let n = 0;

export async function dismissCookies(page: Page) {
  await page.addInitScript(() => window.localStorage.setItem("sv_consent", "declined"));
}

/** Signs up through the real form. Waits past the bot check's minimum fill time. */
export async function signUp(page: Page, name: string) {
  n++;
  const email = `e2e-${Date.now()}-${n}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("First name or nickname").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("secret123");
  await page.getByRole("checkbox").check();
  await page.waitForTimeout(1700);
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(page).toHaveURL(/\/app\/profile\?welcome=1/);
  await expect(page.getByText("Welcome to SaathVerse!")).toBeVisible();
  return email;
}

/** Fills enough of the profile for Discover and Vibe Match to have something to work with. */
export async function buildProfile(page: Page, opts: { interests: string[]; gender: string; lookingFor: string; city: string; bio: string }) {
  await page.getByRole("button", { name: "Rose" }).click();
  await page.getByLabel("Birth year").selectOption(String(new Date().getFullYear() - 27));
  await page.getByLabel("City").fill(opts.city);
  await page.getByLabel("I am a").selectOption(opts.gender);
  await page.getByLabel("Interested in meeting").selectOption(opts.lookingFor);
  await page.getByRole("button", { name: "A long-term relationship" }).click();
  await page.getByLabel("Bio").fill(opts.bio);
  for (const i of opts.interests) await page.getByRole("button", { name: i, exact: true }).click();
  await page.getByRole("button", { name: "Add a prompt" }).click();
  await page.getByLabel("Your answer").fill("Chai, rain and a good book");
  await page.getByRole("button", { name: "Stay in and recharge" }).click();
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Saved. Looking good.")).toBeVisible();
}

export async function newPerson(browser: Browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await dismissCookies(page);
  return { ctx, page };
}
