import { describe, expect, it } from "vitest";

import { isProgrammeSlug, modulesForProgramme, parseProgramme } from "@/lib/risa-programmes";

describe("course and module hierarchy", () => {
  it("validates safe programme slugs", () => {
    expect(isProgrammeSlug("computer-science")).toBe(true);
    expect(isProgrammeSlug("../admin")).toBe(false);
    expect(isProgrammeSlug("a".repeat(101))).toBe(false);
  });

  it("returns only modules belonging to the requested course in code order", () => {
    const modules = [
      { code: "CS201", programme_slug: "computer-science" },
      { code: "PHY101", programme_slug: "physics" },
      { code: "CS101", programme_slug: "computer-science" },
      { code: "OTHER" },
    ];
    expect(modulesForProgramme(modules, "computer-science").map((m) => m.code)).toEqual([
      "CS101",
      "CS201",
    ]);
    expect(modulesForProgramme(modules, "unknown")).toEqual([]);
  });

  it("accepts valid metadata and rejects invalid rows", () => {
    const programme = {
      slug: "computer-science",
      title: "Computer Science",
      description: "",
      is_published: true,
    };
    expect(parseProgramme(programme)).toEqual(programme);
    expect(parseProgramme(null)).toBeNull();
    expect(parseProgramme({ ...programme, slug: "?" })).toBeNull();
    expect(parseProgramme({ ...programme, title: 12 })).toBeNull();
    expect(parseProgramme({ ...programme, description: null })).toBeNull();
    expect(parseProgramme({ ...programme, is_published: "true" })).toBeNull();
  });
});
