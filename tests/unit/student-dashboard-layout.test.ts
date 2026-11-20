import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StudentDashboardPage from "../../src/app/students/dashboard/page";

const { cookiesMock, identityMock, configuredMock, coursesMock, materialsMock } =
  vi.hoisted(() => ({
    cookiesMock: vi.fn(),
    identityMock: vi.fn(),
    configuredMock: vi.fn(),
    coursesMock: vi.fn(),
    materialsMock: vi.fn(),
  }));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("../../src/app/students/actions", () => ({ signOutStudent: vi.fn() }));
vi.mock("../../src/lib/student-auth-api", () => ({
  isStudentAuthConfigured: configuredMock,
  getStudentIdentity: identityMock,
}));
vi.mock("../../src/lib/student-learning-api", () => ({
  getEnrolledCourses: coursesMock,
  getCourseMaterials: materialsMock,
}));

beforeEach(() => {
  configuredMock.mockReset().mockReturnValue(true);
  cookiesMock.mockReset().mockResolvedValue({
    get: () => ({ value: "verified-session" }),
  });
  identityMock.mockReset().mockResolvedValue({
    id: "9c1e0000-0000-4000-8000-000000000001",
    email: "learner@example.com",
    fullName: "Amahle Student",
    avatarPath: null,
  });
  coursesMock.mockReset().mockResolvedValue([]);
  materialsMock.mockReset().mockResolvedValue([]);
});

describe("Concise RISA learner dashboard", () => {
  it("keeps the empty state short with direct course, profile and sign-out actions", async () => {
    const html = renderToStaticMarkup(await StudentDashboardPage());

    expect(html).toContain("Hi, Amahle!");
    expect(html).toContain("0 courses · 0 files");
    expect(html).toContain("No enrolled courses yet.");
    expect(html).toContain("No study materials available yet.");
    expect(html).toContain('href="/programmes"');
    expect(html).toContain('href="/students/profile"');
    expect(html).toContain('aria-label="My Learning dashboard"');
    expect(html).toContain("Sign out");
    expect(html).not.toContain("Student account active");
    expect(html).not.toContain("Your account and helpful links");
    expect(html).not.toContain("Welcome to your learning space");
    expect(html).not.toContain("Browse courses and previews");
  });

  it("shows enrolled courses and downloadable exercises without lengthy explanations", async () => {
    coursesMock.mockResolvedValue([
      {
        id: "c0000000-0000-4000-8000-000000000001",
        slug: "physics",
        title: "Introduction to Physics",
        description: "Detailed topics and practical exercises.",
        status: "active",
      },
    ]);
    materialsMock.mockResolvedValue([
      {
        id: "f0000000-0000-4000-8000-000000000001",
        courseId: "c0000000-0000-4000-8000-000000000001",
        title: "Exercise sheet 1",
        description: "A lengthy description that is not needed on the dashboard.",
        kind: "exercise",
      },
    ]);

    const html = renderToStaticMarkup(await StudentDashboardPage());

    expect(html).toContain("1 course · 1 file");
    expect(html).toContain("Introduction to Physics");
    expect(html).toContain(
      'href="/students/courses/c0000000-0000-4000-8000-000000000001"',
    );
    expect(html).toContain('href="#course-materials"');
    expect(html).toContain("Exercise sheet 1");
    expect(html).toContain(
      'href="/students/materials/f0000000-0000-4000-8000-000000000001"',
    );
    expect(html).not.toContain("A lengthy description that is not needed");
    expect(coursesMock).toHaveBeenCalledWith(
      "verified-session",
      "9c1e0000-0000-4000-8000-000000000001",
    );
  });

  it("shows explicit unavailable states instead of misleading zero counts", async () => {
    coursesMock.mockResolvedValue(null);
    const html = renderToStaticMarkup(await StudentDashboardPage());

    expect(html).toContain("— courses · — files");
    expect(html).toContain("Courses are temporarily unavailable.");
    expect(html).toContain("Study materials are temporarily unavailable.");
    expect(materialsMock).not.toHaveBeenCalled();
  });
});
