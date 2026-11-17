import { expect, test } from "@playwright/test";

test("homepage is usable with an accessible main landmark", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Learn the science",
  );
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
});

test("primary navigation works", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Programmes" }).click();
  await expect(page).toHaveURL(/\/programmes\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Proposed learning pathways",
  );
});

test("not-found page does not masquerade as an existing course", async ({ page }) => {
  const response = await page.goto("/not-a-real-course");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Page not found",
  );
});

test("basic security response headers are present", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
});
