import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createRisaCourse,
  getPublicRisaCourses,
  getRisaAdminCourses,
  isValidCourseThumbnail,
  risaThumbnailUrl,
  updateRisaCoursePresentation,
  validateCourseLevel,
  validateNewRisaCourse,
} from "../../src/lib/risa-course-admin";

const fetchMock = vi.fn();

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

const example = {
  code: "DVE101",
  slug: "dve101",
  title: "Introduction to Linux for DevOps",
  description: "Linux fundamentals and practical labs.",
  level: "1st Year Level",
  is_published: false,
};

describe("RISA institutional course codes", () => {
  it("accepts codes beginning with a letter or digit", () => {
    for (const code of ["DVE101", "4CPS232", "PHY-101"]) {
      expect(
        validateNewRisaCourse({
          code: "  " + code.toLowerCase() + " ",
          title: " Example Course ",
          description: "",
          isPublished: false,
        })?.code,
      ).toBe(code);
    }
  });

  it("normalizes fields and derives an unguessable-by-role but stable slug", () => {
    const result = validateNewRisaCourse({
      code: " phy-101 ",
      title: "   General  Physics   ",
      description: " Introduction ",
      isPublished: true,
    });
    expect(result).toEqual({
      code: "PHY-101",
      slug: "phy-101",
      title: "General Physics",
      description: "Introduction",
      level: "1st Year Level",
      is_published: true,
    });
  });

  it.each(["", "a", "ab", "A A", "ABC_123", "A/123", "A--123", "A-1", "a".repeat(17)])(
    "rejects malformed code %s",
    (code) => {
      expect(
        validateNewRisaCourse({
          code,
          title: "Valid name",
          description: "",
          isPublished: false,
        }),
      ).toBeNull();
    },
  );

  it("checks title and overview length before touching the backend", () => {
    for (const title of ["", "A", "x".repeat(121)]) {
      expect(
        validateNewRisaCourse({
          code: "DVE101",
          title,
          description: "",
          isPublished: false,
        }),
      ).toBeNull();
    }
    expect(
      validateNewRisaCourse({
        code: "DVE101",
        title: "Valid course",
        description: "a".repeat(1201),
        isPublished: false,
      }),
    ).toBeNull();
  });

  it("posts a draft with verified user JWT rather than a service role key", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    expect(await createRisaCourse("verified-token", example)).toBe("created");
    expect(fetchMock.mock.calls[0][0]).toContain("/rest/v1/risa_courses");
    const req = fetchMock.mock.calls[0][1] as RequestInit;
    expect(req.method).toBe("POST");
    expect(req.headers).toMatchObject({
      Authorization: "Bearer verified-token",
      Prefer: "return=minimal",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(req.body))).toEqual(example);
  });

  it("creates a course with its initial level and thumbnail in one insert", async () => {
    const courseId = "11111111-1111-4111-8111-111111111111";
    const thumbnailPath = courseId + "/22222222-2222-4222-8222-222222222222.png";
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));

    expect(
      await createRisaCourse(
        "admin-jwt",
        { ...example, level: "2nd Year Level", is_published: true },
        { courseId, thumbnailPath },
      ),
    ).toBe("created");
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toEqual({
      ...example,
      level: "2nd Year Level",
      is_published: true,
      id: courseId,
      thumbnail_path: thumbnailPath,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects mismatched or untrusted thumbnail paths before inserting", async () => {
    const courseId = "11111111-1111-4111-8111-111111111111";
    expect(
      await createRisaCourse("admin-jwt", example, {
        courseId,
        thumbnailPath:
          "22222222-2222-4222-8222-222222222222/33333333-3333-4333-8333-333333333333.png",
      }),
    ).toBe("unavailable");
    expect(
      await createRisaCourse("admin-jwt", example, {
        courseId,
        thumbnailPath: "https://malicious.example/course.png",
      }),
    ).toBe("unavailable");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not allow callers to override canonical code slugs or add payload fields", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    const tampered = { ...example, code: "dve101", slug: "forged", is_admin: true };
    expect(await createRisaCourse("token", tampered)).toBe("created");
    const data = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(data).toEqual(example);
  });

  it("preserves a new module's selected parent course", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    const newModule = { ...example, programme_slug: "cloud-devops" };
    expect(await createRisaCourse("admin-token", newModule)).toBe("created");
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toEqual(newModule);
  });

  it("reports unique-code conflicts clearly", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 409 }));
    expect(await createRisaCourse("admin-token", example)).toBe("duplicate");
  });

  it("fails closed for denied, invalid or unreachable course submissions", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await createRisaCourse("learner-token", example)).toBe("unavailable");
    fetchMock.mockRejectedValueOnce(new Error("network unavailable"));
    expect(await createRisaCourse("admin-token", example)).toBe("unavailable");
    expect(await createRisaCourse("admin-token", { ...example, code: "!BAD!" })).toBe(
      "unavailable",
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("RISA administrator course listing", () => {
  it("loads real database courses with code and publication state", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json([
        {
          ...example,
          id: "11111111-1111-4111-8111-111111111111",
          created_at: "2026-11-20T00:00:00Z",
        },
      ]),
    );
    const result = await getRisaAdminCourses("admin-token");
    expect(result).toHaveLength(1);
    expect(result?.[0]?.code).toBe("DVE101");
    expect(result?.[0]?.is_published).toBe(false);
    expect(fetchMock.mock.calls[0][0]).toContain("select=id,code,slug,title");
  });

  it("returns an empty list for a new institute and skips invalid records", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await getRisaAdminCourses("admin-token")).toEqual([]);
    fetchMock.mockResolvedValueOnce(
      Response.json([
        { ...example, id: null },
        { ...example, id: "u", created_at: "" },
      ]),
    );
    expect(await getRisaAdminCourses("admin-token")).toHaveLength(1);
  });

  it("distinguishes backend errors from a genuinely empty course list", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    expect(await getRisaAdminCourses("no-access")).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response("bad-json"));
    expect(await getRisaAdminCourses("admin-token")).toBeNull();
    fetchMock.mockResolvedValueOnce(Response.json({ error: "missing" }));
    expect(await getRisaAdminCourses("admin-token")).toBeNull();
  });
});

describe("public RISA catalogue and course presentation", () => {
  const courseId = "11111111-1111-4111-8111-111111111111";

  it("loads actual published courses using anonymous credentials", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json([
        {
          ...example,
          id: courseId,
          created_at: "2026-11-20T00:00:00Z",
          is_published: true,
          thumbnail_path: null,
        },
      ]),
    );
    const courses = await getPublicRisaCourses();
    expect(courses).toHaveLength(1);
    expect(courses?.[0]).toMatchObject({
      code: "DVE101",
      level: "1st Year Level",
      thumbnail_path: null,
    });
    expect(fetchMock.mock.calls[0][0]).toContain("is_published=eq.true");
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
  });

  it("does not expose a fake catalogue on backend errors", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await getPublicRisaCourses()).toBeNull();
  });

  it("validates admin levels and image format before saving", () => {
    expect(validateCourseLevel(" 2nd   Year Level ")).toBe("2nd Year Level");
    expect(validateCourseLevel("<script>")).toBeNull();
    expect(
      isValidCourseThumbnail(new File(["x"], "course.png", { type: "image/png" })),
    ).toBe(true);
    expect(
      isValidCourseThumbnail(new File(["x"], "course.svg", { type: "image/svg+xml" })),
    ).toBe(false);
    expect(
      isValidCourseThumbnail(
        new File([new Uint8Array(2 * 1024 * 1024 + 1)], "huge.jpg", {
          type: "image/jpeg",
        }),
      ),
    ).toBe(false);
  });

  it("patches only the approved course presentation columns", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([{ id: courseId }]));
    const path = courseId + "/22222222-2222-4222-8222-222222222222.png";
    expect(
      await updateRisaCoursePresentation("admin-jwt", courseId, {
        level: "2nd Year Level",
        thumbnailPath: path,
      }),
    ).toBe(true);
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(String(options.body))).toEqual({
      level: "2nd Year Level",
      thumbnail_path: path,
    });
    expect(options.headers).toMatchObject({ Authorization: "Bearer admin-jwt" });
  });

  it("rejects unsafe image paths and malformed course IDs before any API call", async () => {
    expect(
      await updateRisaCoursePresentation("jwt", "bad", { level: "1st Year Level" }),
    ).toBe(false);
    expect(
      await updateRisaCoursePresentation("jwt", courseId, {
        level: "1st Year Level",
        thumbnailPath: "https://evil.example/test.png",
      }),
    ).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("constructs thumbnail URLs only for the managed storage path", () => {
    const path = courseId + "/22222222-2222-4222-8222-222222222222.webp";
    expect(risaThumbnailUrl(path)).toBe(
      "https://example.supabase.co/storage/v1/object/public/risa-course-thumbnails/" +
        path,
    );
    expect(risaThumbnailUrl("https://external.example/cat.png")).toBeNull();
  });
});
