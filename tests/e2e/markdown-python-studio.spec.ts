import { expect, test } from "@playwright/test";

import { setLabSession } from "../fixtures/lab-session";

test("administrator can embed Python in arbitrary Markdown without loading hidden runtimes", async ({
  page,
}) => {
  test.setTimeout(420_000);
  await setLabSession(page, "admin");
  await page.goto("/admin/labs");
  await page.getByRole("link", { name: "Open Markdown Presenter" }).click();
  await page
    .getByRole("textbox", { name: "Presentation Markdown" })
    .fill(
      [
        "# Chemistry assessment",
        "",
        "Calculate the concentration.",
        "",
        "```python-run",
        "print(0.5 / 0.25)",
        "```",
        "",
        "```python",
        "print('static example')",
        "```",
        "",
        "```python-run",
        "```",
      ].join("\n"),
    );
  await page.getByRole("button", { name: "Present Markdown" }).click();
  await expect(page.getByRole("heading", { name: "Chemistry assessment" })).toBeVisible();
  const open = page.getByRole("button", { name: "Open Python Studio", exact: true });
  await expect(open).toHaveCount(2);
  await expect(page.locator('iframe[title="Isolated Python runtime"]')).toHaveCount(0);
  await open.first().click();
  const studio = page.locator(".risa-programming-ide");
  const editor = studio.getByRole("textbox", { name: "Editor" });
  await expect(editor).toHaveValue("print(0.5 / 0.25)");
  await expect(studio).not.toContainText("CS102");
  await expect(studio).not.toContainText("Your challenge");
  await studio.getByRole("button", { name: "Run", exact: true }).click();
  await expect(
    studio.getByRole("region", { name: "Terminal" }).locator("pre"),
  ).toHaveText("2.0", { timeout: 190_000 });
  await editor.fill("print(99)");
  await studio.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(editor).toHaveValue("print(0.5 / 0.25)");
  await page.getByRole("button", { name: "Close Python Studio", exact: true }).click();
  await expect(studio).toHaveCount(0);
  await expect(page.locator('iframe[title="Isolated Python runtime"]')).toHaveCount(0);
  await open.last().click();
  await expect(studio.getByRole("textbox", { name: "Editor" })).toHaveValue("");
  await expect(page.getByText("print('static example')", { exact: true })).toBeVisible();
});
