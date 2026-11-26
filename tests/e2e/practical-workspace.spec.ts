import { expect, test } from "@playwright/test";

test("practical workspace runs safe local exercises", async ({ page }) => {
  await page.goto("/workspace");
  await page.getByRole("button", { name: "Run exercise" }).click();
  await expect(page.locator("pre")).toHaveText("40");
  await page.getByRole("button", { name: "Linux terminal" }).click();
  await page.getByRole("button", { name: "Run exercise" }).click();
  await expect(page.locator("pre")).toContainText("RISA practice workspace");
  await page.getByRole("button", { name: "Database" }).click();
  await page.getByRole("button", { name: "Run exercise" }).click();
  await expect(page.locator("pre")).toContainText("2 rows");
  await page.getByRole("button", { name: "Physics" }).click();
  await page.getByRole("button", { name: "Run exercise" }).click();
  await expect(page.locator("pre")).toHaveText("5");
});

test("staff and practical submissions require sign in", async ({ page }) => {
  for (const path of ["/lecturers", "/admin/lecturers", "/students/practicals"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/students\/login/);
  }
});
