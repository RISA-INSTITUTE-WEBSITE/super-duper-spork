import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createModuleSection,
  getModuleSections,
  getStructuredCurriculum,
  getStructuredPreview,
  groupModuleTopics,
  moveModuleTopic,
  validSectionOrder,
  type ModuleSection,
} from "@/lib/risa-module-sections";
import type { CourseTopic } from "@/lib/risa-course-curriculum";

const course = "11111111-1111-4111-8111-111111111111";
const a = "22222222-2222-4222-8222-222222222222";
const b = "33333333-3333-4333-8333-333333333333";
const topicId = "44444444-4444-4444-8444-444444444444";
const first: ModuleSection = { id: a, course_id: course, title: "Section A", sort_order: 1 };
const second: ModuleSection = { id: b, course_id: course, title: "Section B", sort_order: 2 };
const topic: CourseTopic = {
  id: topicId,
  course_id: course,
  section_id: a,
  title: "Architecture",
  description: "",
  is_published: true,
};
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("RISA_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "test-public-key");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("module sections", () => {
  it("groups topics in teaching order, including empty sections and legacy topics", () => {
    const legacy = { ...topic, id: "legacy", section_id: undefined };
    expect(groupModuleTopics([second, first], [topic, legacy])).toEqual([
      { id: a, title: "Section A", topics: [topic] },
      { id: b, title: "Section B", topics: [] },
      { id: "general", title: "General topics", topics: [legacy] },
    ]);
    expect(groupModuleTopics([first], [topic])).toHaveLength(1);
    expect(groupModuleTopics([], [])).toEqual([]);
    expect(groupModuleTopics([{ ...second, sort_order: 1 }, first], [topic])[0].id).toBe(a);
  });

  it("validates teaching order", () => {
    for (const value of [0, 10000, 1.5, NaN]) {
      expect(validSectionOrder(value)).toBe(false);
    }
    expect(validSectionOrder(1)).toBe(true);
    expect(validSectionOrder(9999)).toBe(true);
  });

  it("fetches only sections belonging to the selected module", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json([first, null, {}, { ...second, course_id: "other" }]),
    );
    expect(await getModuleSections("token", course)).toEqual([first]);
    expect(fetchMock.mock.calls[0][0]).toContain("course_id=eq." + course);
    expect(await getModuleSections("token", "invalid")).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await getModuleSections("token", course)).toBeNull();
    fetchMock.mockResolvedValueOnce(Response.json({}));
    expect(await getModuleSections("token", course)).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response("invalid"));
    expect(await getModuleSections("token", course)).toBeNull();
  });

  it("combines existing curriculum and section outline without requesting answer keys", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([])).mockResolvedValueOnce(Response.json([first]));
    expect(await getStructuredCurriculum("token", course)).toEqual({
      topics: [], videos: [], quizzes: [], questions: [], sections: [first],
    });
    fetchMock.mockResolvedValueOnce(Response.json([])).mockResolvedValueOnce(Response.json([first]));
    expect(await getStructuredPreview("token", course)).toEqual({
      topics: [], videos: [], sections: [first],
    });
    fetchMock.mockResolvedValueOnce(Response.json([])).mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await getStructuredPreview("token", course)).toBeNull();
  });

  it("creates sections only for valid modules and teaching positions", async () => {
    expect(await createModuleSection("token", "bad", { title: "Section A", order: 1 })).toBe(false);
    expect(await createModuleSection("token", course, { title: "", order: 1 })).toBe(false);
    expect(await createModuleSection("token", course, { title: "Section A", order: 0 })).toBe(false);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    expect(await createModuleSection("token", course, { title: " Section A ", order: 1 })).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      course_id: course, title: "Section A", sort_order: 1,
    });
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await createModuleSection("token", course, { title: "Section A", order: 1 })).toBe(false);
  });

  it("moves an existing topic without replacing its ID or content", async () => {
    const input = { topicId, sectionId: b, order: 3 };
    expect(await moveModuleTopic("token", course, { ...input, sectionId: "bad" })).toBe(false);
    expect(await moveModuleTopic("token", course, { ...input, order: 0 })).toBe(false);
    fetchMock.mockResolvedValueOnce(Response.json([topic]));
    expect(await moveModuleTopic("token", course, input)).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toContain("&course_id=eq." + course);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ section_id: b, sort_order: 3 });
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await moveModuleTopic("token", course, input)).toBe(false);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await moveModuleTopic("token", course, input)).toBe(false);
    fetchMock.mockResolvedValueOnce(new Response("bad"));
    expect(await moveModuleTopic("token", course, input)).toBe(false);
  });
});
