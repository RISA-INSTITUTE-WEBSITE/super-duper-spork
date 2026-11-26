import { beforeEach, describe, expect, it, vi } from "vitest";

import { setLessonCompletedAction } from "../../src/app/students/courses/[id]/lesson-progress-actions";

const { cookiesMock, identityMock, enrolledMock, curriculumMock, saveMock, readMock } =
  vi.hoisted(() => ({
    cookiesMock: vi.fn(),
    identityMock: vi.fn(),
    enrolledMock: vi.fn(),
    curriculumMock: vi.fn(),
    saveMock: vi.fn(),
    readMock: vi.fn(),
  }));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("../../src/lib/student-auth-api", () => ({
  getStudentIdentity: identityMock,
}));
vi.mock("../../src/lib/student-learning-api", () => ({
  getEnrolledCourses: enrolledMock,
}));
vi.mock("../../src/lib/risa-course-curriculum", () => ({
  uuidPattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  getCourseCurriculum: curriculumMock,
}));
vi.mock("../../src/lib/risa-lesson-progress", () => ({
  getLearnerLessonCompletions: readMock,
  saveLearnerLessonCompletion: saveMock,
}));
vi.mock("../../src/lib/student-session", () => ({
  studentCookieNames: { access: "risa-student-access" },
}));

const studentId = "11111111-1111-4111-8111-111111111111";
const courseId = "22222222-2222-4222-8222-222222222222";
const videoId = "33333333-3333-4333-8333-333333333333";

beforeEach(() => {
  vi.clearAllMocks();
  cookiesMock.mockResolvedValue({
    get: (name: string) =>
      name === "risa-student-access" ? { value: "learner-jwt" } : undefined,
  });
  identityMock.mockResolvedValue({ id: studentId });
  enrolledMock.mockResolvedValue([{ id: courseId }]);
  curriculumMock.mockResolvedValue({ videos: [{ id: videoId }] });
  saveMock.mockResolvedValue(true);
  readMock.mockResolvedValue([videoId]);
});

describe("RISA lesson completion action authorization", () => {
  it("rejects invalid IDs without fetching or mutating anything", async () => {
    const result = await setLessonCompletedAction("invalid", videoId, true);
    expect(result.status).toBe("error");
    expect(identityMock).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("rejects missing authentication before course lookups", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined });
    const result = await setLessonCompletedAction(courseId, videoId, true);
    expect(result.status).toBe("error");
    expect(enrolledMock).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("rejects an unenrolled learner and a video outside their course", async () => {
    enrolledMock.mockResolvedValueOnce([]);
    expect((await setLessonCompletedAction(courseId, videoId, true)).status).toBe(
      "error",
    );
    curriculumMock.mockResolvedValueOnce({ videos: [] });
    expect((await setLessonCompletedAction(courseId, videoId, true)).status).toBe(
      "error",
    );
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("saves learner-owned progress and returns authoritative database rows", async () => {
    const result = await setLessonCompletedAction(courseId, videoId, true);
    expect(result).toEqual({ status: "success", completedVideoIds: [videoId] });
    expect(saveMock).toHaveBeenCalledWith("learner-jwt", {
      studentId,
      videoId,
      completed: true,
    });
    expect(readMock).toHaveBeenCalledWith("learner-jwt", studentId, [videoId]);
  });

  it("fails safely when persistence or the follow-up read fails", async () => {
    saveMock.mockResolvedValueOnce(false);
    expect((await setLessonCompletedAction(courseId, videoId, true)).status).toBe(
      "error",
    );
    readMock.mockResolvedValueOnce(null);
    expect((await setLessonCompletedAction(courseId, videoId, false)).status).toBe(
      "error",
    );
  });
});
