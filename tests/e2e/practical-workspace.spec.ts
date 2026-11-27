import { expect, test } from "@playwright/test";

import { setLabSession } from "../fixtures/lab-session";

test("practical workspace runs safe local exercises", async ({ page }) => {
  test.setTimeout(420_000);
  await setLabSession(page, "admin");
  await page.goto("/workspace");
  await page.getByRole("button", { name: "Run exercise" }).click();
  await expect(page.locator("pre")).toHaveText("40", { timeout: 190_000 });
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
  test.setTimeout(420_000);
  await setLabSession(page, "admin");
  await page.goto("/workspace");
  await expect(
    page.getByRole("heading", { name: "RISA Programming Studio" }),
  ).toBeVisible();
  const editor = page.getByRole("textbox", { name: "Editor" });
  await page.getByRole("button", { name: "Addition", exact: true }).click();
  await expect(editor).toHaveValue("print(12 + 7)");
  await page.getByRole("button", { name: "Run exercise" }).click();
  await expect(page.locator("pre")).toHaveText("19", { timeout: 190_000 });
  await editor.fill("print(12 * 9)");
  await editor.press("Control+Enter");
  await expect(page.locator("pre")).toHaveText("108", { timeout: 190_000 });
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
  await setLabSession(page, "admin");
  await page.goto("/workspace");
  test.setTimeout(420_000);
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
    await expect(studio.locator(".risa-python-editor")).toHaveCSS(
      "background-color",
      color,
    );
    await expect(editor).toHaveValue("print(12 * 9)");
    await expect(studio.locator("pre")).toHaveText("108", { timeout: 190_000 });
  }
});

test("real Python supports functions, stdin, imports and isolated execution", async ({
  page,
}) => {
  test.setTimeout(420_000);
  await setLabSession(page, "admin");
  await page.goto("/workspace");
  const editor = page.getByRole("textbox", { name: "Editor", exact: true });
  const console = page.locator(".risa-programming-ide pre");
  const run = page.getByRole("button", { name: "Run exercise" });
  await editor.fill(
    "def square(n):\n    return n ** 2\nprint([square(n) for n in range(4)])",
  );
  await run.click();
  await expect(console).toHaveText("[0, 1, 4, 9]", { timeout: 190_000 });
  await editor.fill("import math\nprint(input(), math.sqrt(81))");
  await run.click();
  const input = page.getByRole("textbox", { name: "Terminal input" });
  await expect(input).toBeVisible({ timeout: 190_000 });
  await input.fill("RISA");
  await input.press("Enter");
  await expect(console).toContainText("RISA 9.0", { timeout: 190_000 });
  await editor.fill("import numpy as np\nprint(int(np.sum(np.arange(5))))");
  await run.click();
  await expect(console).toHaveText("10", { timeout: 190_000 });
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
  page,
}) => {
  await setLabSession(page, "admin");
  const response = await page.request.get("/python-sandbox.html");
  expect(response.ok()).toBeTruthy();
  const policy = response.headers()["content-security-policy"];
  expect(policy).toContain("sandbox allow-scripts");
  expect(policy).not.toContain("allow-same-origin");
  expect(policy).toContain("frame-ancestors 'self'");
  expect(policy).toContain("'wasm-unsafe-eval'");
  expect(policy).not.toContain("'unsafe-eval'");
  expect(policy).not.toContain("'unsafe-inline'");
  expect(policy).not.toContain("connect-src 'self'");
  const normal = await page.request.get("/workspace");
  expect(normal.headers()["content-security-policy"]).not.toContain("'wasm-unsafe-eval'");
});

test("library manager installs compatible packages without overwriting editor", async ({
  page,
}) => {
  test.setTimeout(420_000);
  await setLabSession(page, "admin");
  await page.goto("/workspace");
  const editor = page.getByRole("textbox", { name: "Editor", exact: true });
  const output = page.locator(".risa-programming-ide pre");
  await editor.fill("import pandas as pd\nprint(pd.Series([2, 4, 6]).mean())");
  await page.getByText("Python libraries", { exact: true }).click();
  await page.getByLabel("Suggested library").selectOption("pandas");
  await page.getByRole("button", { name: "Install library", exact: true }).click();
  await expect(output).toContainText("Installed: pandas", { timeout: 190_000 });
  await expect(editor).toHaveValue(
    "import pandas as pd\nprint(pd.Series([2, 4, 6]).mean())",
  );
  await page.getByRole("button", { name: "Run exercise" }).click();
  await expect(output).toHaveText("4.0", { timeout: 190_000 });
  await page.getByRole("button", { name: "List installed libraries" }).click();
  await expect(output).toContainText("pandas", { timeout: 190_000 });
  await page
    .getByLabel("Package name or exact version")
    .fill("https://example.org/pkg.whl");
  await expect(
    page.getByRole("button", { name: "Install library", exact: true }),
  ).toBeDisabled();
});

test("terminal prompts sequentially, echoes responses and preserves live Python state", async ({
  page,
}) => {
  test.setTimeout(420_000);
  await setLabSession(page, "admin");
  await page.goto("/workspace");
  const editor = page.getByRole("textbox", { name: "Editor" });
  const terminal = page.getByRole("region", { name: "Terminal" });
  const transcript = terminal.locator("pre");
  const input = terminal.getByRole("textbox", { name: "Terminal input" });
  await editor.fill(
    'print("Starting")\nbill = float(input("Bill: "))\ntip = float(input("Tip: "))\npeople = int(input("People: "))\nprint(f"Each: {bill * (1 + tip / 100) / people:.2f}")',
  );
  await page.getByRole("button", { name: "Run exercise" }).click();
  await expect(transcript).toContainText("Starting", { timeout: 190_000 });
  await expect(input).toBeFocused({ timeout: 190_000 });
  await expect(transcript).toContainText("Bill:");
  await expect(transcript).not.toContainText("Tip:");
  await input.fill("1000");
  await input.press("Enter");
  await expect(transcript).toContainText("Bill: 1000");
  await expect(transcript).toContainText("Tip:");
  await expect(input).toBeFocused();
  await input.fill("15");
  await input.press("Enter");
  await expect(transcript).toContainText("Tip: 15");
  await expect(transcript).toContainText("People:");
  await input.fill("4");
  await input.press("Enter");
  await expect(transcript).toContainText("Each: 287.50");
  await expect(input).toHaveCount(0);
  expect((await transcript.innerText()).match(/Starting/g)).toHaveLength(1);
  await expect(page.getByLabel(/Standard input/)).toHaveCount(0);
  await editor.fill('input("Waiting: ")');
  await page.getByRole("button", { name: "Run exercise" }).click();
  await expect(input).toBeVisible();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(transcript).toContainText("Execution stopped");
  await expect(input).toHaveCount(0);
});

test("Python syntax colours follow all four themes without altering code", async ({
  page,
}) => {
  await setLabSession(page, "admin");
  await page.goto("/workspace");
  const editor = page.getByRole("textbox", { name: "Editor" });
  const selector = page.getByRole("combobox", { name: "Color theme" });
  const highlighted = page.locator(".risa-python-highlight");
  const source = '# Area\ndef area(x):\n    return print([x * 5], "result")';
  await editor.fill(source);
  for (const theme of ["dark-plus", "light-plus", "monokai", "high-contrast"]) {
    await selector.selectOption(theme);
    await expect(editor).toHaveValue(source);
    await expect(highlighted).toHaveAttribute("aria-hidden", "true");
    const colors: string[] = [];
    for (const kind of [
      "keyword",
      "comment",
      "function",
      "variable",
      "bracket-0",
      "string",
      "number",
    ]) {
      const token = highlighted.locator('[data-python-token="' + kind + '"]').first();
      await expect(token).toBeVisible();
      colors.push(await token.evaluate((element) => getComputedStyle(element).color));
    }
    expect(new Set(colors).size).toBe(colors.length);
  }
  await editor.fill("print(12 * 9)");
  const call = highlighted.locator('[data-python-token="function"]');
  await expect(call).toHaveText("print");
  await expect(editor).toHaveValue("print(12 * 9)");
});
