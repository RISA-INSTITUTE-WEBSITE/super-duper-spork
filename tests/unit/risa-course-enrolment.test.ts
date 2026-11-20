import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getCourseEnrolmentRequest,
  getPendingCourseEnrolmentRequests,
  reviewCourseEnrolmentRequest,
  submitCourseEnrolmentRequest,
} from "../../src/lib/risa-course-enrolment";

const courseId = "11111111-1111-4111-8111-111111111111";
const studentId = "22222222-2222-4222-8222-222222222222";
const courseRequest = {
  course_id: courseId,
  student_id: studentId,
  email: "learner@example.com",
  status: "pending",
  created_at: "2026-11-20T00:00:00Z",
};
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("RISA_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "test-public-key");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("learner enrolment request access", () => {
  it("returns only the learner's own selected course request", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([courseRequest]));
    const request = await getCourseEnrolmentRequest("student-jwt", courseId, studentId);
    expect(request?.status).toBe("pending");
    expect(fetchMock.mock.calls[0][0]).toContain("student_id=eq." + studentId);
    expect(fetchMock.mock.calls[0][0]).toContain("course_id=eq." + courseId);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer student-jwt");
  });

  it("returns null for no request and undefined for backend errors", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await getCourseEnrolmentRequest("jwt", courseId, studentId)).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await getCourseEnrolmentRequest("jwt", courseId, studentId)).toBeUndefined();
    expect(await getCourseEnrolmentRequest("jwt", "invalid", studentId)).toBeUndefined();
  });

  it("submits own pending request without setting an enrolment status", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    expect(
      await submitCourseEnrolmentRequest("student-jwt", {
        courseId,
        studentId,
        email: "learner@example.com",
      }),
    ).toBe("created");
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.method).toBe("POST");
    expect(JSON.parse(String(options.body))).toEqual({
      course_id: courseId,
      student_id: studentId,
      email: "learner@example.com",
      status: "pending",
    });
  });

  it("handles repeat submissions and rejects invalid identities", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 409 }));
    expect(
      await submitCourseEnrolmentRequest("jwt", { courseId, studentId, email: "learner@risa.za" }),
    ).toBe("duplicate");
    expect(
      await submitCourseEnrolmentRequest("jwt", { courseId, studentId: "invalid", email: "learner@risa.za" }),
    ).toBe("unavailable");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("never treats backend failure as registration success", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(
      await submitCourseEnrolmentRequest("jwt", { courseId, studentId, email: "learner@risa.za" }),
    ).toBe("unavailable");
  });
});

describe("administrator enrolment approval", () => {
  it("lists pending requests with the admin JWT", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([courseRequest]));
    expect(await getPendingCourseEnrolmentRequests("admin-jwt")).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toContain("status=eq.pending");
  });

  it("approves a request and creates an active course enrolment", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([courseRequest]));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    fetchMock.mockResolvedValueOnce(Response.json([{ status: "approved" }]));
    expect(
      await reviewCourseEnrolmentRequest("admin-jwt", { courseId, studentId, decision: "approved" }),
    ).toBe(true);
    expect(fetchMock.mock.calls).toHaveLength(3);
    expect(fetchMock.mock.calls[1][0]).toContain("/rest/v1/risa_enrollments");
    const insert = JSON.parse(String(fetchMock.mock.calls[1][1].body));
    expect(insert).toEqual({
      course_id: courseId,
      student_id: studentId,
      status: "active",
    });
    expect(fetchMock.mock.calls[2][1].method).toBe("PATCH");
  });

  it("declines without creating an enrolment", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([courseRequest]));
    fetchMock.mockResolvedValueOnce(Response.json([{ status: "declined" }]));
    expect(
      await reviewCourseEnrolmentRequest("admin-jwt", { courseId, studentId, decision: "declined" }),
    ).toBe(true);
    expect(fetchMock.mock.calls).toHaveLength(2);
    expect(fetchMock.mock.calls[1][0]).toContain("risa_enrolment_requests?");
  });

  it("fails closed on request lookup errors and invalid IDs", async () => {
    expect(await reviewCourseEnrolmentRequest("jwt", { courseId: "bad", studentId, decision: "approved" })).toBe(
      false,
    );
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(
      await reviewCourseEnrolmentRequest("jwt", { courseId, studentId, decision: "approved" }),
    ).toBe(false);
  });

  it("does not approve when enrollment creation is denied", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([courseRequest]));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(
      await reviewCourseEnrolmentRequest("jwt", { courseId, studentId, decision: "approved" }),
    ).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("allows approving a request whose active enrollment already exists", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([courseRequest]));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 409 }));
    fetchMock.mockResolvedValueOnce(Response.json([{ status: "active" }]));
    fetchMock.mockResolvedValueOnce(Response.json([{ status: "approved" }]));
    expect(
      await reviewCourseEnrolmentRequest("jwt", { courseId, studentId, decision: "approved" }),
    ).toBe(true);
  });

  it("does not approve a duplicate enrollment without an active row", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([courseRequest]));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 409 }));
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(
      await reviewCourseEnrolmentRequest("jwt", { courseId, studentId, decision: "approved" }),
    ).toBe(false);
  });
});
