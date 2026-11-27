import { expect, test } from "@playwright/test";

test("practical workspace runs safe local exercises", async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto("/workspace");
  await page.getByRole("button", { name: "Run exercise" }).click();
  await expect(page.locator("pre")).toHaveText("40", { timeout: 130_000 });
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
  await expect(page.locator("pre")).toHaveText("19", { timeout: 130_000 });
  await editor.fill("print(12 * 9)");
  await editor.press("Control+Enter");
  await expect(page.locator("pre")).toHaveText("108", { timeout: 130_000 });
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

test("programming studio switches themes without losing code or console output", async ({
  page,
}) => {
  await page.goto("/workspace");
  const studio = page.locator(".risa-programming-ide");
  const selector = page.getByRole("combobox", { name: "Color theme" });
  const editor = page.getByRole("textbox", { name: "Editor" });
  await expect(studio).toHaveAttribute("data-theme", "dark-plus");
  await editor.fill("print(12 * 9)");
  await page.getByRole("button", { name: "Run exercise" }).click();
  for (const [theme, color] of [
    ["light-plus", "rgb(255, 255, 255)"],
    ["monokai", "rgb(39, 40, 34)"],
    ["high-contrast", "rgb(0, 0, 0)"],
    ["dark-plus", "rgb(30, 30, 30)"],
  ]) {
    await selector.selectOption(theme);
    await expect(studio).toHaveAttribute("data-theme", theme);
    await expect(editor).toHaveCSS("background-color", color);
    await expect(editor).toHaveValue("print(12 * 9)");
    await expect(studio.locator("pre")).toHaveText("108");
  }
});

test("real Python supports functions, stdin, imports and isolated execution", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await page.goto("/workspace");
  const editor = page.getByRole("textbox", { name: "Editor", exact: true });
  const console = page.locator(".risa-programming-ide pre");
  const run = page.getByRole("button", { name: "Run exercise" });
  await editor.fill("def square(n):\n    return n ** 2\nprint([square(n) for n in range(4)])");
  await run.click();
  await expect(console).toHaveText("[0, 1, 4, 9]", { timeout: 130_000 });
  await page.getByLabel("Standard input (one response per line, before running)").fill("RISA");
  await editor.fill("import math\nprint(input(), math.sqrt(81))");
  await run.click();
  await expect(console).toContainText("RISA 9.0", { timeout: 130_000 });
  await editor.fill("import numpy as np\nprint(int(np.sum(np.arange(5))))");
  await run.click();
  await expect(console).toHaveText("10", { timeout: 130_000 });
  await expect(page.locator('iframe[title="Isolated Python runtime"]')).toHaveAttribute(
    "sandbox",
    "allow-scripts",
  );
  await editor.fill("while True:\n    pass");
  await run.click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(console).toContainText("Execution stopped");
});

test("Python sandbox is narrowly scoped and has no application connectivity", async ({
  request,
}) => {
  const response = await request.get("/python-sandbox.html");
  expect(response.ok()).toBeTruthy();
  const policy = response.headers()["content-security-policy"];
  expect(policy).toContain("sandbox allow-scripts");
  expect(policy).not.toContain("allow-same-origin");
  expect(policy).toContain("frame-ancestors 'self'");
  expect(policy).toContain("'wasm-unsafe-eval'");
  expect(policy).not.toContain("'unsafe-eval'");
  expect(policy).not.toContain("'unsafe-inline'");
  expect(policy).not.toContain("connect-src 'self'");
  const normal = await request.get("/workspace");
  expect(normal.headers()["content-security-policy"]).not.toContain("'wasm-unsafe-eval'");
});
