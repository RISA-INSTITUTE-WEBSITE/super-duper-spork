import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  redirect: vi.fn(),
  notFound: vi.fn(),
  configured: vi.fn(),
  identity: vi.fn(),
  enrolled: vi.fn(),
  course: vi.fn(),
  curriculum: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  notFound: mocks.notFound,
}));
vi.mock("../../src/lib/student-auth-api", () => ({
  getStudentIdentity: mocks.identity,
  isStudentAuthConfigured: mocks.configured,
}));
vi.mock("../../src/lib/student-learning-api", () => ({
  getEnrolledCourses: mocks.enrolled,
}));
vi.mock("../../src/lib/risa-course-admin", () => ({
  getRisaCourseById: mocks.course,
}));
vi.mock("../../src/lib/risa-course-curriculum", () => ({
  getCourseCurriculum: mocks.curriculum,
}));

import { getVerifiedStudentCourse } from "../../src/lib/verified-student-course";

const courseId = "11111111-1111-4111-8111-111111111111";
const studentId = "22222222-2222-4222-8222-222222222222";
const course = { id: courseId, is_published: true, title: "Physics" };
const curriculum = { topics: [], videos: [], quizzes: [], questions: [] };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.redirect.mockImplementation((url: string) => {
    throw new Error("redirect:" + url);
  });
  mocks.notFound.mockImplementation(() => {
    throw new Error("not-found");
  });
  mocks.configured.mockReturnValue(true);
  mocks.cookies.mockResolvedValue({
    get: () => ({ value: "student-token" }),
  });
  mocks.identity.mockResolvedValue({ id: studentId });
  mocks.enrolled.mockResolvedValue([{ id: courseId }]);
  mocks.course.mockResolvedValue(course);
  mocks.curriculum.mockResolvedValue(curriculum);
});

describe("private RISA topic and lesson routes", () => {
  it("loads only the verified learner's enrolled course and curriculum", async () => {
    expect(await getVerifiedStudentCourse(courseId)).toEqual({ course, curriculum });
    expect(mocks.identity).toHaveBeenCalledWith("student-token");
    expect(mocks.enrolled).toHaveBeenCalledWith("student-token", studentId);
    expect(mocks.course).toHaveBeenCalledWith("student-token", courseId);
    expect(mocks.curriculum).toHaveBeenCalledWith("student-token", courseId);
  });

  it("redirects when authentication is disabled or the user has no session", async () => {
    mocks.configured.mockReturnValue(false);
    await expect(getVerifiedStudentCourse(courseId)).rejects.toThrow(
      "redirect:/students/login",
    );
    mocks.configured.mockReturnValue(true);
    mocks.cookies.mockResolvedValue({ get: () => undefined });
    await expect(getVerifiedStudentCourse(courseId)).rejects.toThrow(
      "redirect:/students/login",
    );
  });

  it("rejects invalid user identities", async () => {
    mocks.identity.mockResolvedValue(null);
    await expect(getVerifiedStudentCourse(courseId)).rejects.toThrow(
      "redirect:/students/login",
    );
  });

  it("rejects unrelated student enrolments and unpublished courses", async () => {
    mocks.enrolled.mockResolvedValue([]);
    await expect(getVerifiedStudentCourse(courseId)).rejects.toThrow("not-found");
    mocks.enrolled.mockResolvedValue([{ id: courseId }]);
    mocks.course.mockResolvedValue({ ...course, is_published: false });
    await expect(getVerifiedStudentCourse(courseId)).rejects.toThrow("not-found");
    expect(mocks.curriculum).not.toHaveBeenCalled();
  });

  it("does not expose a course during backend enrolment failure", async () => {
    mocks.enrolled.mockResolvedValue(null);
    await expect(getVerifiedStudentCourse(courseId)).rejects.toThrow("not-found");
    expect(mocks.course).not.toHaveBeenCalled();
  });
});
