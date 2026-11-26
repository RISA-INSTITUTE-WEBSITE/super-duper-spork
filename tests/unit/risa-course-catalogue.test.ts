import { describe, expect, it } from "vitest";

import { filterCourseCatalogue } from "@/lib/risa-course-catalogue";

const courses = [
  {
    code: "PHY101",
    title: "Applied Physics",
    description: "Motion and energy",
    level: "1st Year Level",
  },
  {
    code: "CHM201",
    title: "Analytical Chemistry",
    description: "Practical laboratory methods",
    level: "2nd Year Level",
  },
  {
    code: "CPS101",
    title: "Computational Science",
    description: "Learn scientific computing",
    level: "1st Year Level",
  },
];

describe("Academy Grid catalogue filters", () => {
  it("keeps all published catalogue rows with empty filters", () => {
    expect(filterCourseCatalogue(courses, "", "all")).toEqual(courses);
  });

  it("searches course code and title case-insensitively", () => {
    expect(filterCourseCatalogue(courses, "  phy101 ", "all")).toEqual([courses[0]]);
    expect(filterCourseCatalogue(courses, "CHEMISTRY", "all")).toEqual([courses[1]]);
  });

  it("searches course descriptions", () => {
    expect(filterCourseCatalogue(courses, "laboratory", "all")).toEqual([courses[1]]);
  });

  it("filters academic levels without changing underlying data", () => {
    expect(filterCourseCatalogue(courses, "", "1st Year Level")).toEqual([
      courses[0],
      courses[2],
    ]);
    expect(courses).toHaveLength(3);
  });

  it("combines keyword and level and handles no matches", () => {
    expect(filterCourseCatalogue(courses, "computing", "1st Year Level")).toEqual([
      courses[2],
    ]);
    expect(filterCourseCatalogue(courses, "computing", "2nd Year Level")).toEqual([]);
  });
});
