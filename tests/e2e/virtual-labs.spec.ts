import { expect, test } from "@playwright/test";

test("Labs navigation opens four working domain laboratories", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Labs", exact: true })
    .click();
  await expect(page).toHaveURL(/\/labs$/);
  for (const title of ["Computing", "Physics", "Cloud & DevOps", "Ethical Hacking"]) {
    await expect(page.getByRole("link", { name: "Open " + title + " Lab" })).toBeVisible();
  }
});

test("physics responds to controls and calculates motion", async ({ page }) => {
  await page.goto("/labs/physics");
  await expect(page.getByText("22.5 m", { exact: true })).toBeVisible();
  const time = page.getByRole("slider", { name: "Time (s)" });
  await time.focus();
  await time.press("End");
  await expect(page.getByText("70.0 m", { exact: true })).toBeVisible();
  await expect(page.getByText("12.0 m/s", { exact: true })).toBeVisible();
  await expect(page.getByText("Acceleration = 5.00 m/s²")).toBeVisible();
});

test("simulated pipeline blocks deployment after a failed test", async ({ page }) => {
  await page.goto("/labs/devops");
  await page.getByRole("checkbox", { name: "Tests succeed" }).uncheck();
  await page.getByRole("button", { name: "Run pipeline" }).click();
  await expect(page.getByText("failed", { exact: true })).toBeVisible();
  await expect(page.getByText("blocked", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "Tests succeed" }).check();
  await page.getByRole("button", { name: "Run pipeline" }).click();
  await expect(page.getByText("passed", { exact: true })).toHaveCount(3);
});

test("defensive access exercise provides feedback and advances", async ({ page }) => {
  await page.goto("/labs/security");
  await page.getByRole("button", { name: "Admin", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Too much access");
  await expect(page.getByRole("button", { name: "Next scenario" })).toBeDisabled();
  await page.getByRole("button", { name: "Read", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Correct");
  await page.getByRole("button", { name: "Next scenario" }).click();
  await expect(page.getByText("Scenario 2 of 3")).toBeVisible();
});

test("unknown laboratories return not found", async ({ page }) => {
  const response = await page.goto("/labs/unknown");
  expect(response?.status()).toBe(404);
});
