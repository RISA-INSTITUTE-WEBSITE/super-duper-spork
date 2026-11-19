/**
 * RISA browser acceptance tests (QA-E2E-01 through QA-E2E-05).
 * Playwright starts a built Next.js app via playwright.config.ts.
 * These are smoke tests for the public scaffold, NOT a full security audit.
 */
import { expect, test } from "@playwright/test";

test("homepage is usable with an accessible main landmark", async ({ page }) => {
  // QA-E2E-01: essential heading, single main landmark and labeled navigation.
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Learn the science",
  );
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeVisible();
});

test("primary navigation works", async ({ page }) => {
  // QA-E2E-02: visitors can reach the learning-pathway listing.
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Programmes" })
    .click();
  await expect(page).toHaveURL(/\/programmes\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Proposed learning pathways",
  );
});

test("not-found page does not masquerade as an existing course", async ({ page }) => {
  // QA-E2E-03: missing content returns an HTTP 404 and an explicit explanation.
  const response = await page.goto("/not-a-real-course");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Page not found");
});

test("basic security response headers are present", async ({ request }) => {
  // QA-E2E-04: reject content sniffing and framing at the HTTP boundary.
  // CSP is additionally checked by the integration smoke test in website-ci.yml.
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
});

test("landing page labels pathways as proposed and links to project information", async ({
  page,
}) => {
  // QA-E2E-05: avoid suggesting that enrollment and applications are live.
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Explore proposed learning pathways." }),
  ).toBeVisible();
  await expect(
    page.getByText("Student accounts provide portal access only;"),
  ).toBeVisible();
  await page.getByRole("link", { name: "Discover RISA" }).click();
  await expect(page).toHaveURL(/\/about\/?$/);
});

test("site search finds a proposed learning pathway", async ({ page }) => {
  // QA-E2E-06: the header search must lead to real, relevant public content.
  await page.goto("/");
  const search = page.getByRole("search");
  await expect(search).toBeVisible();
  await search.getByRole("searchbox", { name: "Search RISA website" }).fill("physics");
  await search.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/search\?q=physics$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Search RISA");
  await expect(page.getByRole("link", { name: /Physics & Measurement/ })).toBeVisible();
});

test("site search handles unmatched keywords", async ({ page }) => {
  // QA-E2E-07: an empty result is explained instead of linking to nonexistent content.
  await page.goto("/search?q=nomatchingrisakeyword");
  await expect(page.getByRole("status")).toContainText("No matching pages found");
});

test("mobile header opens search only when its icon is tapped", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeHidden();
  await expect(page.getByRole("search")).toHaveCount(0);

  await page.getByRole("button", { name: "Open search" }).click();
  const search = page.getByRole("search");
  await expect(search).toBeVisible();
  await search.getByRole("searchbox", { name: "Search RISA website" }).fill("physics");
  await search.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/search\?q=physics$/);
  await expect(page.getByRole("link", { name: /Physics & Measurement/ })).toBeVisible();
});

test("mobile menu opens a sidebar and closes after navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("dialog", { name: "RISA navigation menu" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "RISA navigation menu" })).toHaveCount(0);

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Programmes" })
    .click();
  await expect(page).toHaveURL(/\/programmes\/?$/);
  await expect(page.getByRole("dialog", { name: "RISA navigation menu" })).toHaveCount(0);
});

test("navigation links use larger Outfit SemiBold text on desktop and mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const desktopLink = page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Home" });
  await expect(desktopLink).toHaveCSS("font-family", /Outfit/);
  await expect(desktopLink).toHaveCSS("font-size", "16px");
  await expect(desktopLink).toHaveCSS("font-weight", "600");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const mobileLink = page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Home" });
  await expect(mobileLink).toHaveCSS("font-family", /Outfit/);
  await expect(mobileLink).toHaveCSS("font-size", "18px");
  await expect(mobileLink).toHaveCSS("font-weight", "600");
});

test("students can locate registration but signup is safely gated until configured", async ({
  page,
}) => {
  await page.goto("/");

  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Students" })
    .click();

  await expect(page).toHaveURL(/\/students\/login\/?$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.getByRole("link", { name: "Create an account" }).click();

  await expect(page).toHaveURL(/\/students\/register\/?$/);
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create student account" }),
  ).toBeDisabled();
  await expect(page.getByRole("status")).toContainText(
    "Student registration is being prepared",
  );
});

test("private student dashboard redirects visitors without a session", async ({
  page,
}) => {
  await page.goto("/students/dashboard");
  await expect(page).toHaveURL(/\/students\/login\/?$/);
});

test("mobile students entry opens the student portal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Students" })
    .click();
  await expect(page).toHaveURL(/\/students\/login\/?$/);
});

test("homepage progress content sits on the white section without a boxed banner", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator('section[aria-labelledby="next-heading"]');
  await expect(section).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(
    section.getByRole("heading", { name: "A place to question, discover and grow." }),
  ).toBeVisible();
  await expect(section.getByRole("link", { name: /About the institute/ })).toBeVisible();
  await expect(section.getByRole("link", { name: /Contact RISA/ })).toBeVisible();
});

test("RISA section animates original black liquid and green sphere without changing navbar", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const section = page.locator('section[aria-labelledby="next-heading"]');
  const animatedLogo = section.locator('img[src="/risa-logo-animated.svg"]');
  await expect(animatedLogo).toBeVisible();
  await expect(animatedLogo).toHaveCSS("opacity", "1");
  await expect(page.locator('header img[src="/risa-logo.svg"]')).toBeVisible();

  const asset = await request.get("/risa-logo-animated.svg");
  expect(asset.ok()).toBeTruthy();
  const svg = await asset.text();
  expect(svg).toContain('class="risa-original-black-liquid" fill="#383838"');
  expect(svg).toContain('class="risa-green-orb" fill="#78eb29"');
  expect(svg).toContain("risa-natural-surface");
  expect(svg).toContain("risa-natural-slosh");
  expect(svg).toContain("risa-liquid-3d");
  expect(svg).toContain("risa-orb-3d");
  expect(svg).toContain("risa-green-orb-size");
  expect(svg).toContain('class="risa-glass-blue-backfill" fill="#38b6ff"');
  const blueSphere = svg.match(/class="risa-orb-blue-backfill" fill="#38b6ff" d="([^"]+)"/);
  const greenSphere = svg.match(/class="risa-green-orb" fill="#78eb29" fill-rule="evenodd" d="([^"]+)"/);
  expect(blueSphere?.[1]).toBeTruthy();
  expect(blueSphere?.[1]).toBe(greenSphere?.[1]);
  expect(svg).not.toContain("risa-wave-front");
  expect(svg).not.toContain("risa-led-halo");
  expect(svg).not.toContain("risa-bubble");
  expect(svg).toContain("prefers-reduced-motion");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(animatedLogo).toBeVisible();
});
