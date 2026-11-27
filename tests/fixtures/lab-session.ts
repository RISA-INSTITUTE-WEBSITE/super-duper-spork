import type { Page } from "@playwright/test";

export async function setLabSession(page: Page, role: "admin" | "learner") {
  await page.context().addCookies([
    {
      name: "risa-student-access",
      value: "fixture-lab-" + role,
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
