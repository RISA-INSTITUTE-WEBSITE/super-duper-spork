import { describe, expect, it } from "vitest";

import { pathways } from "./pathways";

describe("proposed learning pathways", () => {
  it("has unique URL-safe slugs", () => {
    const slugs = pathways.map(({ slug }) => slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))).toBe(true);
  });

  it("provides a title and description for every pathway", () => {
    expect(pathways.length).toBeGreaterThan(0);
    expect(
      pathways.every(({ title, description }) => title.trim() && description.trim()),
    ).toBe(true);
  });
});
