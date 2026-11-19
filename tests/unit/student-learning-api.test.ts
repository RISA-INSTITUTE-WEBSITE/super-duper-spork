import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  downloadCourseMaterial,
  getCourseMaterials,
  getEnrolledCourses,
  uploadStudentAvatar,
} from "../../src/lib/student-learning-api";

const studentId = "11111111-1111-4111-8111-111111111111";
const courseId = "22222222-2222-4222-8222-222222222222";
const materialId = "33333333-3333-4333-8333-333333333333";
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

describe("authenticated RISA learning API", () => {
  it("lists actual assigned published course data using a learner JWT", async () => {
    fetchMock.mockResolvedValue(
      Response.json([
        {
          course_id: courseId,
          status: "active",
          course: {
            id: courseId,
            slug: "physics-101",
            title: "Physics",
            description: "Measurements",
          },
        },
        { course_id: courseId, status: "active", course: null },
      ]),
    );
    const result = await getEnrolledCourses("student-token", studentId);
    expect(result).toEqual([
      {
        id: courseId,
        slug: "physics-101",
        title: "Physics",
        description: "Measurements",
        status: "active",
      },
    ]);
    expect(fetchMock.mock.calls[0][0]).toContain("risa_enrollments");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer student-token");
  });

  it("distinguishes no enrolments from a failed backend", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await getEnrolledCourses("student-token", studentId)).toEqual([]);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await getEnrolledCourses("student-token", studentId)).toBeNull();
  });

  it("retrieves resource and exercise entries for enrolled course ids", async () => {
    fetchMock.mockResolvedValue(
      Response.json([
        {
          id: materialId,
          course_id: courseId,
          title: "Exercise 1",
          description: "Vectors",
          kind: "exercise",
        },
      ]),
    );
    const result = await getCourseMaterials("student-token", [courseId]);
    expect(result).toHaveLength(1);
    expect(result?.[0]?.kind).toBe("exercise");
    expect(fetchMock.mock.calls[0][0]).toContain("risa_course_materials");
  });

  it("keeps private course content behind two authorized backend requests", async () => {
    fetchMock
      .mockResolvedValueOnce(
        Response.json([
          {
            title: "Course handout",
            storage_path: courseId + "/handout.pdf",
          },
        ]),
      )
      .mockResolvedValueOnce(new Response("PDF", { status: 200 }));
    const result = await downloadCourseMaterial("student-token", materialId);
    expect(result?.title).toBe("Course handout");
    expect(result?.extension).toBe("pdf");
    expect(fetchMock.mock.calls[1][0]).toContain(
      "/storage/v1/object/risa-course-content/",
    );
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer student-token");
  });

  it("rejects material paths outside the course storage bucket contract", async () => {
    fetchMock.mockResolvedValue(
      Response.json([{ title: "Unsafe", storage_path: "../../secrets.txt" }]),
    );
    expect(await downloadCourseMaterial("student-token", materialId)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uploads an avatar to the verified learner's own storage folder", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const photo = new File(["photo"], "avatar.png", { type: "image/png" });
    expect(await uploadStudentAvatar("student-token", studentId, photo)).toBe(
      studentId + "/avatar.png",
    );
    expect(fetchMock.mock.calls[0][0]).toContain(
      "/storage/v1/object/risa-student-avatars/" + studentId,
    );
    expect(fetchMock.mock.calls[0][1].headers["x-upsert"]).toBe("true");
  });
});
