import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  changeLecturerAssignment,
  getLecturerAssignments,
  getModuleLearnerCount,
  getPracticalSubmissions,
  reviewPractical,
  submitPractical,
  validReview,
} from "@/lib/risa-lecturers";

const student = "11111111-1111-4111-8111-111111111111";
const course = "22222222-2222-4222-8222-222222222222";
const id = "33333333-3333-4333-8333-333333333333";
const assignment = { lecturer_id: student, course_id: course };
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("RISA_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "public-test-value");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("module scoped staff API", () => {
  it("filters assignments and verifies affected rows", async () => {
    expect(await getLecturerAssignments("token", "bad")).toBeNull();
    fetchMock.mockResolvedValueOnce(Response.json([assignment]));
    expect(await getLecturerAssignments("token", student)).toEqual([assignment]);
    expect(fetchMock.mock.calls[0][0]).toContain("lecturer_id=eq." + student);
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await getLecturerAssignments("token")).toEqual([]);
    expect(
      await changeLecturerAssignment("token", { ...assignment, course_id: "bad" }, false),
    ).toBe(false);
    fetchMock.mockResolvedValueOnce(Response.json([assignment]));
    expect(await changeLecturerAssignment("token", assignment, false)).toBe(true);
    fetchMock.mockResolvedValueOnce(Response.json([assignment]));
    expect(await changeLecturerAssignment("token", assignment, true)).toBe(true);
    expect(fetchMock.mock.calls[3][1].method).toBe("DELETE");
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await changeLecturerAssignment("token", assignment, false)).toBe(false);
    fetchMock.mockResolvedValueOnce(new Response("invalid"));
    expect(await getLecturerAssignments("token")).toBeNull();
    fetchMock.mockResolvedValueOnce(Response.json({}));
    expect(await getLecturerAssignments("token")).toBeNull();
  });

  it("requires a scoped submission lookup", async () => {
    expect(await getPracticalSubmissions("token", {})).toBeNull();
    expect(await getPracticalSubmissions("token", { courseId: "bad" })).toBeNull();
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(
      await getPracticalSubmissions("token", { studentId: student, courseId: course }),
    ).toEqual([]);
    expect(fetchMock.mock.calls[0][0]).toContain("course_id=eq." + course);
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await getPracticalSubmissions("token", { courseId: course })).toEqual([]);
  });

  it("validates evidence and reviews", async () => {
    const draft = {
      student_id: student,
      course_id: course,
      activity: "physics",
      evidence: "Force divided by mass.",
    };
    for (const input of [
      { ...draft, student_id: "bad" },
      { ...draft, activity: "bad" },
      { ...draft, evidence: "" },
      { ...draft, evidence: "x".repeat(6001) },
    ]) {
      expect(await submitPractical("token", input)).toBe(false);
    }
    fetchMock.mockResolvedValueOnce(Response.json([draft]));
    expect(await submitPractical("token", draft)).toBe(true);
    const review = { id, courseId: course, score: 75, feedback: "Good explanation" };
    for (const score of [-1, 101, 1.5, NaN]) {
      expect(validReview(score, "Good")).toBe(false);
    }
    expect(validReview(0, "")).toBe(false);
    expect(validReview(100, "x".repeat(2001))).toBe(false);
    expect(await reviewPractical("token", { ...review, id: "bad" })).toBe(false);
    expect(await reviewPractical("token", { ...review, score: 101 })).toBe(false);
    fetchMock.mockResolvedValueOnce(Response.json([{ id }]));
    expect(await reviewPractical("token", review)).toBe(true);
    const body = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(body).toMatchObject({ score: 75, feedback: "Good explanation" });
    expect(body).not.toHaveProperty("evidence");
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await reviewPractical("token", review)).toBe(false);
  });

  it("counts only active and completed enrolments", async () => {
    expect(await getModuleLearnerCount("token", "bad")).toBeNull();
    fetchMock.mockResolvedValueOnce(
      new Response(null, { headers: { "content-range": "*/7" } }),
    );
    expect(await getModuleLearnerCount("token", course)).toBe(7);
    expect(fetchMock.mock.calls[0][0]).toContain("status=in.(active,completed)");
    fetchMock.mockResolvedValueOnce(new Response(null));
    expect(await getModuleLearnerCount("token", course)).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await getModuleLearnerCount("token", course)).toBeNull();
  });
});
