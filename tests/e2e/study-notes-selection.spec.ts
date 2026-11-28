import { expect, test } from "@playwright/test";

import { setLabSession } from "../fixtures/lab-session";

test("study notes studio automatically loads module-specific topics and notes", async ({
  page,
}) => {
  await setLabSession(page, "admin");
  await page.goto("/admin/study-notes");
  const module = page.getByRole("combobox", { name: "Course / Module" });
  const topic = page.getByRole("combobox", { name: "Section / Topic" });
  const publish = page.getByRole("button", { name: "Save & Publish" });

  await expect(topic).toBeDisabled();
  await expect(publish).toBeDisabled();
  await expect(page.getByRole("button", { name: "Load topics" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open editor" })).toHaveCount(0);

  await module.selectOption({ label: "MAT101 · Fixture Mathematics" });
  await expect(topic).toBeEnabled();
  await expect(topic.locator("option")).toHaveText([
    "Select a topic",
    "Fixture functions",
  ]);
  await topic.selectOption({ label: "Fixture functions" });
  await expect(publish).toBeEnabled();
  await expect(page.getByRole("heading", { name: "Fixture functions note" })).toBeVisible();

  await module.selectOption({ label: "DVE101 · Fixture DevOps" });
  await expect(topic.locator("option")).toHaveText(["Select a topic", "Fixture Linux"]);
  await expect(topic).toHaveValue("");
  await expect(publish).toBeDisabled();
  await expect(page.getByRole("heading", { name: "Fixture functions note" })).toHaveCount(
    0,
  );
  await topic.selectOption({ label: "Fixture Linux" });
  await expect(publish).toBeEnabled();
  await expect(page.getByRole("heading", { name: "Fixture Linux note" })).toBeVisible();
});
