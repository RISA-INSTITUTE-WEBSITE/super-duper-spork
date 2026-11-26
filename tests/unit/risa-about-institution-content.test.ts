import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AboutPage, { metadata } from "../../src/app/about/page";

const homeSource = readFileSync(
  new URL("../../src/app/page.tsx", import.meta.url),
  "utf8",
);

describe("RISA institutional information pages", () => {
  it("moves the complete vision, mission and philosophy into About the Institution", () => {
    const html = renderToStaticMarkup(createElement(AboutPage));

    expect(metadata.title).toBe("About the Institution");
    expect(html).toContain("About the Institution");
    expect(html).toContain("Our Vision and Mission");
    expect(html).toContain("Our Vision");
    expect(html).toContain("Our Mission");
    expect(html).toContain("Our Educational Philosophy");
    expect(html).toContain("Learn it. Understand it. Apply it. Test it. Improve it.");
    expect(html).toContain("Theory provides the foundation.");
    expect(html).toContain("Practical experience develops competence.");
    expect(html).toContain("Innovation transforms knowledge into impact.");
  });

  it("does not repeat institutional information sections on the homepage", () => {
    expect(homeSource).not.toContain('aria-labelledby="vision-mission-heading"');
    expect(homeSource).not.toContain('aria-labelledby="philosophy-heading"');
    expect(homeSource).toContain('aria-labelledby="courses-heading"');
    expect(homeSource).toContain('aria-labelledby="next-heading"');
    expect(homeSource).toContain('href="/about"');
  });
});
