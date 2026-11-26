import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createRisaProgramme,
  getRisaProgrammes,
  isProgrammeSlug,
  modulesForProgramme,
  parseProgramme,
} from "@/lib/risa-programmes";

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

describe("programme backend access", () => {
  const fetchMock = vi.fn();
  const programme = {
    slug: "computer-science",
    title: "Computer Science",
    description: "",
    is_published: true,
  };

  beforeEach(() => {
    vi.stubEnv("RISA_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "public-test-value");
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads published courses anonymously and all permitted courses with a JWT", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([programme, null]));
    expect(await getRisaProgrammes()).toEqual([programme]);
    expect(fetchMock.mock.calls[0][0]).toContain("is_published=eq.true");
    fetchMock.mockResolvedValueOnce(
      Response.json([{ ...programme, is_published: false }]),
    );
    expect(await getRisaProgrammes("admin-token")).toEqual([
      { ...programme, is_published: false },
    ]);
    expect(fetchMock.mock.calls[1][1].headers).toMatchObject({
      Authorization: "Bearer admin-token",
    });
  });

  it("handles backend and malformed responses without fabricating courses", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await getRisaProgrammes()).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response("bad-json"));
    expect(await getRisaProgrammes()).toBeNull();
    fetchMock.mockResolvedValueOnce(Response.json({ error: "invalid" }));
    expect(await getRisaProgrammes()).toBeNull();
  });

  it("validates creation data and relies on server-side RLS for writes", async () => {
    for (const data of [
      { ...programme, slug: "?" },
      { ...programme, title: "" },
      { ...programme, title: "x".repeat(121) },
      { ...programme, description: "x".repeat(1201) },
    ]) {
      expect(await createRisaProgramme("token", data)).toBe(false);
    }
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    expect(await createRisaProgramme("admin-token", programme)).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(programme);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await createRisaProgramme("student-token", programme)).toBe(false);
    fetchMock.mockRejectedValueOnce(new Error("network error"));
    expect(await createRisaProgramme("admin-token", programme)).toBe(false);
  });
});
