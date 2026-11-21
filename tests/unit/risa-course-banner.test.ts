import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CourseBanner } from "@/components/risa-course-banner";
import type { RisaCourse } from "@/lib/risa-course-admin";

const course: RisaCourse = {
  id: "11111111-1111-4111-8111-111111111111",
  code: "PHY101",
  slug: "mechanics-1",
  title: "Mechanics 1",
  description: "Lets learn mechanics",
  level: "1st Year Level",
  is_published: true,
  created_at: "2026-11-21T00:00:00Z",
  thumbnail_path: null,
};

describe("RISA module banner layout", () => {
  it("uses a compact plain white card with code and name on the same heading", () => {
    const html = renderToStaticMarkup(
      createElement(CourseBanner, { course, isEnrolled: true }),
    );
    expect(html).toContain("PHY101 - Mechanics 1");
    expect(html).toContain("bg-white");
    expect(html).toContain("max-w-4xl");
    expect(html).toContain("px-5 py-5");
    expect(html).not.toContain("risa-science-glass");
    expect(html).not.toContain("bg-gradient");
    expect(html).toContain("Lets learn mechanics");
    expect(html).toContain("1st Year Level");
  });

  it("keeps the correct learner dashboard route and enrolled status", () => {
    const html = renderToStaticMarkup(
      createElement(CourseBanner, { course, isEnrolled: true }),
    );
    expect(html).toContain('href="/students/dashboard"');
    expect(html).toContain("Enrolled learner · Full course access");
  });

  it("preserves the registered learner preview route and preview status", () => {
    const html = renderToStaticMarkup(
      createElement(CourseBanner, { course, isEnrolled: false }),
    );
    expect(html).toContain('href="/programmes"');
    expect(html).toContain("Registered learner · Preview only");
  });
});
