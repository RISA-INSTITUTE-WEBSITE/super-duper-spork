import { expect, test } from "@playwright/test";

test("computing lab supports binary and logic practice", async ({ page }) => {
  await page.goto("/computing-lab");
  await expect(page.getByRole("heading", { name: "RISA Computing Lab" })).toBeVisible();

  const binary = page.locator("#binary-lab");
  await binary.getByRole("button", { name: "Bit with place value 128" }).click();
  await expect(binary.getByText("10001101", { exact: true })).toBeVisible();
  await expect(binary.getByText("141", { exact: true })).toBeVisible();

  await binary.getByRole("button", { name: "13", exact: true }).click();
  await binary.getByRole("button", { name: "00101010", exact: true }).click();
  await binary.getByRole("button", { name: "FF", exact: true }).click();
  await binary.getByRole("button", { name: "Check answers" }).click();
  await expect(page.getByText("1/2 checkpoints completed")).toBeVisible();

  const logic = page.locator("#logic-lab");
  await logic.getByRole("button", { name: "NOT", exact: true }).click();
  await expect(logic.getByRole("button", { name: "B: 0" })).toHaveCount(0);
  await expect(logic.getByRole("table")).toBeVisible();
  await logic.getByRole("button", { name: "A: 0" }).click();
  await expect(logic.getByRole("button", { name: "A: 1" })).toBeVisible();
  await logic.getByRole("group", { name: "AND: A = 1, B = 0. What is the output?" })
    .getByRole("button", { name: "0", exact: true }).click();
  await logic.getByRole("group", { name: "NOT: A = 0. What is the output?" })
    .getByRole("button", { name: "1", exact: true }).click();
  await logic.getByRole("group", { name: "XOR: A = 1, B = 1. What is the output?" })
    .getByRole("button", { name: "0", exact: true }).click();
  await logic.getByRole("button", { name: "Check answers" }).click();
  await expect(page.getByText("2/2 checkpoints completed")).toBeVisible();
  await page.reload();
  await expect(page.getByText("0/2 checkpoints completed")).toBeVisible();
});
