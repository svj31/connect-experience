import { expect, type Page } from "@playwright/test";

let n = 0;

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
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/profile\?welcome=1/);
  await expect(page.getByRole("heading", { name: "Make your mark" })).toBeVisible();
  return email;
}

export async function finishProfile(page: Page, interests: string[], bio = "") {
  for (const i of interests) await page.getByRole("button", { name: i, exact: true }).click();
  if (bio) await page.getByLabel("Bio").fill(bio);
  await page.getByRole("button", { name: "Save and go to the lobby" }).click();
  await expect(page).toHaveURL(/\/lobby$/);
}

export async function dismissCookies(page: Page) {
  const banner = page.getByRole("region", { name: "Cookie consent" });
  if (await banner.isVisible().catch(() => false)) await banner.getByRole("button", { name: "Essential only" }).click();
}
