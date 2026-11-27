import { expect, test } from "@playwright/test";

test("public policy library and footer navigation are available", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Footer navigation" })
    .getByRole("link", { name: "Policies" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("RISA Policies");
});

test("policy administration requires a verified session", async ({ page }) => {
  await page.goto("/admin/policies");
  await expect(page).toHaveURL(/\/students\/login\/?$/);
});
