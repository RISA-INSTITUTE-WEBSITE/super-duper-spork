import { describe, expect, it } from "vitest";

import { isPolicySlug, validatePolicy } from "../../src/lib/risa-policies";

function policyForm() {
  const data = new FormData();
  data.set("slug", "academic-integrity");
  data.set("title", "Academic integrity");
  data.set("category", "Academic");
  data.set("version", "1.0");
  data.set("effectiveDate", "2026-12-01");
  data.set("body", "## Purpose\nPolicy text.");
  data.set("status", "draft");
  return data;
}

describe("policy validation", () => {
  it("allows stable slugs and rejects query injection", () => {
    expect(isPolicySlug("academic-integrity")).toBe(true);
    expect(isPolicySlug("a&is_published=eq.true")).toBe(false);
  });

  it("validates draft and publication states", () => {
    const data = policyForm();
    expect(validatePolicy(data)?.is_published).toBe(false);
    data.set("status", "published");
    expect(validatePolicy(data)?.is_published).toBe(true);
    data.set("status", "invalid");
    expect(validatePolicy(data)).toBeNull();
  });

  it("rejects invalid dates and empty text", () => {
    const data = policyForm();
    data.set("effectiveDate", "2026-02-30");
    expect(validatePolicy(data)).toBeNull();
    data.set("effectiveDate", "");
    data.set("body", " ");
    expect(validatePolicy(data)).toBeNull();
  });
});
