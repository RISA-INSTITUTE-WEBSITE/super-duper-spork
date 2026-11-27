import { expect, test } from "@playwright/test";

import { setLabSession } from "../fixtures/lab-session";

const pages = [
  "/admin/labs",
  "/admin/labs/presenter",
  "/labs",
  "/labs/physics",
  "/labs/devops",
  "/labs/security",
  "/computing-lab",
  "/workspace",
  "/students/practicals",
];

test("anonymous visitors cannot enter any private laboratory", async ({ page }) => {
  for (const path of pages) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/students\/login/);
  }
  const response = await page.request.get("/python-sandbox.html", {
    maxRedirects: 0,
  });
  expect([303, 307, 308, 404]).toContain(response.status());
  expect(await response.text()).not.toContain("loadPyodide");
});

test("verified learner cannot access labs even with admin profile metadata", async ({
  page,
}) => {
  await setLabSession(page, "learner");
  for (const path of pages) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  }
  const response = await page.request.get("/python-sandbox.html", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(404);
  expect(await response.text()).not.toContain("loadPyodide");
});

test("public navigation and search do not advertise unreleased labs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Labs", exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("link", { name: "Labs", exact: true })).toHaveCount(0);
  await page.goto("/search?q=labs");
  await expect(page.getByRole("link", { name: /Virtual Laboratories/ })).toHaveCount(0);
});

test("verified administrator can open lab preview from administration", async ({
  page,
}) => {
  await setLabSession(page, "admin");
  await page.goto("/admin");
  await page.getByRole("link", { name: "Open lab preview" }).click();
  await expect(page).toHaveURL(/\/admin\/labs$/);
  await expect(
    page.getByRole("link", { name: "Open Practical Workspace" }),
  ).toBeVisible();
  await page.goto("/labs");
  await expect(page).toHaveURL(/\/admin\/labs$/);
});
