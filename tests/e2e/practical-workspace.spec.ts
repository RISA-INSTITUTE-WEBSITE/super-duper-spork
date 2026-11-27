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

test("programming studio examples, keyboard shortcut and console controls", async ({
  page,
}) => {
  await page.goto("/workspace");
  await expect(
    page.getByRole("heading", { name: "RISA Programming Studio" }),
  ).toBeVisible();
  const editor = page.getByRole("textbox", { name: "Editor" });
  await page.getByRole("button", { name: "Addition", exact: true }).click();
  await expect(editor).toHaveValue("print(12 + 7)");
  await page.getByRole("button", { name: "Run exercise" }).click();
  await expect(page.locator("pre")).toHaveText("19");
  await editor.fill("print(12 * 9)");
  await editor.press("Control+Enter");
  await expect(page.locator("pre")).toHaveText("108");
  await page.getByRole("button", { name: "Clear output" }).click();
  await expect(page.locator("pre")).toContainText("Ready.");
  await expect(editor).toHaveValue("print(12 * 9)");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(editor).toHaveValue("print(8 * 5)");
  await page.getByRole("button", { name: "Linux terminal" }).click();
  await expect(
    page.getByRole("heading", { name: "RISA Programming Studio" }),
  ).toHaveCount(0);
});
