/**
 * RISA QA-UNIT-01/02: exercise the proposed public catalogue data only.
 * These tests do not claim to validate enrollment or course availability.
 */
import { describe, expect, it } from "vitest";

import { pathways } from "../../src/lib/pathways";

describe("proposed learning pathways", () => {
  it("has unique URL-safe slugs", () => {
    // QA-UNIT-01: prevent duplicate course links and malformed route fragments.
    const slugs = pathways.map(({ slug }) => slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))).toBe(true);
  });

  it("provides a title and description for every pathway", () => {
    // QA-UNIT-02: avoid empty labels or descriptions in the public catalogue.
    expect(pathways.length).toBeGreaterThan(0);
    expect(
      pathways.every(({ title, description }) => title.trim() && description.trim()),
    ).toBe(true);
  });
});
