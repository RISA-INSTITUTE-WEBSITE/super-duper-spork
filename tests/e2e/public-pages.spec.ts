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
    "Where real learning starts",
  );
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Our Vision", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Our Mission" })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Learn it. Understand it. Apply it. Test it. Improve it.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeVisible();
});

test("course areas come directly after the four-photo hero", async ({ page }) => {
  await page.goto("/");
  const sections = page.locator("main > section");

  await expect(sections.nth(0)).toHaveClass(/risa-hero/);
  await expect(sections.nth(0).locator(".risa-hero-photo")).toHaveCount(4);
  await expect(sections.nth(1)).toHaveAttribute("aria-labelledby", "courses-heading");
  await expect(sections.nth(2)).toHaveAttribute(
    "aria-labelledby",
    "vision-mission-heading",
  );
  await expect(sections.nth(3)).toHaveAttribute("aria-labelledby", "philosophy-heading");
  await expect(
    sections.nth(1).getByRole("heading", { name: "Explore our courses" }),
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
    "Available courses",
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

test("landing page displays published course section and links to project information", async ({
  page,
}) => {
  // QA-E2E-05: avoid suggesting that enrollment and applications are live.
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Explore our courses" })).toBeVisible();
  await expect(
    page.getByText("Registered learners can preview course topics and request"),
  ).toBeVisible();
  await page.getByRole("link", { name: "Discover RISA" }).click();
  await expect(page).toHaveURL(/\/about\/?$/);
});

test("site search finds published course navigation", async ({ page }) => {
  // QA-E2E-06: the header search must lead to real, relevant public content.
  await page.goto("/");
  const search = page.getByRole("search");
  await expect(search).toBeVisible();
  await search.getByRole("searchbox", { name: "Search RISA website" }).fill("courses");
  await search.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/search\?q=courses$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Search RISA");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Page Programmes/ }),
  ).toBeVisible();
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
  await search.getByRole("searchbox", { name: "Search RISA website" }).fill("courses");
  await search.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/search\?q=courses$/);
  await expect(
    page.getByRole("main").getByRole("link", { name: /Page Programmes/ }),
  ).toBeVisible();
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
  await expect(desktopLink).toHaveCSS("font-family", /Plus Jakarta Sans/);
  await expect(desktopLink).toHaveCSS("font-size", "16px");
  await expect(desktopLink).toHaveCSS("font-weight", "600");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const mobileLink = page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Home" });
  await expect(mobileLink).toHaveCSS("font-family", /Plus Jakarta Sans/);
  await expect(mobileLink).toHaveCSS("font-size", "18px");
  await expect(mobileLink).toHaveCSS("font-weight", "600");
});

test("desktop navigation separates account creation and existing account login", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  const signUp = navigation.getByRole("link", { name: "Sign Up" });
  const signIn = navigation.getByRole("link", { name: "Sign In" });

  await expect(navigation.getByRole("link", { name: "Students" })).toHaveCount(0);
  await expect(signUp).toHaveAttribute("href", "/students/register");
  await expect(signIn).toHaveAttribute("href", "/students/login");
  await expect(navigation.getByRole("link", { name: /Open profile for/ })).toHaveCount(0);

  // Account actions must share the Home/Programmes row, not wrap underneath.
  const homeBounds = await navigation.getByRole("link", { name: "Home" }).boundingBox();
  const signUpBounds = await signUp.boundingBox();
  const signInBounds = await signIn.boundingBox();
  expect(homeBounds).not.toBeNull();
  expect(signUpBounds).not.toBeNull();
  expect(signInBounds).not.toBeNull();
  expect(Math.abs((homeBounds?.y ?? 0) - (signUpBounds?.y ?? 0))).toBeLessThan(3);
  expect(Math.abs((homeBounds?.y ?? 0) - (signInBounds?.y ?? 0))).toBeLessThan(3);

  await signUp.click();
  await expect(page).toHaveURL(/\/students\/register\/?$/);
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();

  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Sign In" })
    .click();
  await expect(page).toHaveURL(/\/students\/login\/?$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create an account" })).toBeVisible();
});

test("tablet uses mobile navigation instead of an overflowing desktop menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeHidden();
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(
    page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Sign In" }),
  ).toBeVisible();
});

test("private student dashboard redirects visitors without a session", async ({
  page,
}) => {
  await page.goto("/students/dashboard");
  await expect(page).toHaveURL(/\/students\/login\/?$/);
});

test("course content authoring and enrolled lessons require login", async ({ page }) => {
  const id = "11111111-1111-4111-8111-111111111111";
  await page.goto("/admin/courses/" + id + "/content");
  await expect(page).toHaveURL(/\/students\/login\/?$/);
  await page.goto("/students/courses/" + id);
  await expect(page).toHaveURL(/\/students\/login\/?$/);
});

test("course creation is unavailable to unauthenticated visitors", async ({ page }) => {
  await page.goto("/admin/courses");
  await expect(page).toHaveURL(/\/students\/login\/?$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("administrator portal requires a verified signed-in account", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/students\/login\/?$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("unverified visitors cannot open private learner profile or files", async ({
  page,
  request,
}) => {
  await page.goto("/students/profile");
  await expect(page).toHaveURL(/\/students\/login\/?$/);

  const avatar = await request.get("/students/avatar");
  expect(avatar.status()).toBe(404);

  const privateMaterial = await request.get(
    "/students/materials/33333333-3333-4333-8333-333333333333",
  );
  expect(privateMaterial.status()).toBe(404);
});

test("mobile navigation separates Sign Up and Sign In without a Students entry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const navigation = page.getByRole("navigation", { name: "Mobile navigation" });

  await expect(navigation.getByRole("link", { name: "Students" })).toHaveCount(0);
  await expect(navigation.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
    "href",
    "/students/register",
  );
  await expect(navigation.getByRole("link", { name: "Sign In" })).toHaveAttribute(
    "href",
    "/students/login",
  );

  await navigation.getByRole("link", { name: "Sign Up" }).click();
  await expect(page).toHaveURL(/\/students\/register\/?$/);
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "RISA navigation menu" })).toHaveCount(0);

  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Sign In" })
    .click();
  await expect(page).toHaveURL(/\/students\/login\/?$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("homepage progress content sits on the white section without a boxed banner", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator('section[aria-labelledby="next-heading"]');
  await expect(section).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(
    section.getByRole("heading", {
      name: "Theory into practice. Knowledge into impact.",
    }),
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
  expect(svg).toContain('class="risa-green-orb" cx="974" cy="442" r="84"');
  expect(svg).toContain("risa-natural-surface");
  expect(svg).toContain("risa-natural-slosh");
  expect(svg).toContain("risa-liquid-3d");
  expect(svg).toContain("risa-orb-3d");
  expect(svg).toContain("risa-green-orb-size");
  expect(svg).toContain('class="risa-glass-blue-backfill" fill="#38b6ff"');
  expect(svg).toContain('class="risa-orb-blue-backfill" cx="974" cy="442" r="86"');
  expect(svg).toContain('r="86" fill="#38b6ff" stroke="none"');
  expect(svg).toContain('r="84" fill="#78eb29" stroke="none"');
  expect(svg).toContain('shape-rendering="geometricPrecision"');
  expect(svg).not.toContain('<path class="risa-green-orb"');
  expect(svg).not.toContain("risa-wave-front");
  expect(svg).not.toContain("risa-led-halo");
  expect(svg).not.toContain("risa-bubble");
  expect(svg).toContain("prefers-reduced-motion");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(animatedLogo).toBeVisible();
});

test("course preview and enrolment review require verified accounts", async ({
  page,
}) => {
  const courseId = "11111111-1111-4111-8111-111111111111";
  await page.goto("/students/courses/" + courseId);
  await expect(page).toHaveURL(/\/students\/login\/?$/);

  await page.goto("/admin/enrolment-requests");
  await expect(page).toHaveURL(/\/students\/login\/?$/);
});
