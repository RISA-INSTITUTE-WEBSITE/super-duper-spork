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
    page.getByText("Student accounts and applications are not available yet."),
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
