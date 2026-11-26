import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerStudent, signInStudent } from "../../src/app/students/actions";
import { newStudentCsrfToken, studentCsrfCookieName } from "../../src/lib/student-csrf";

const {
  cookiesMock,
  redirectMock,
  configuredMock,
  registerMock,
  loginMock,
  identityMock,
  saveMock,
  adminMock,
} = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  redirectMock: vi.fn(),
  configuredMock: vi.fn(),
  registerMock: vi.fn(),
  loginMock: vi.fn(),
  identityMock: vi.fn(),
  saveMock: vi.fn(),
  adminMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("../../src/lib/student-auth-api", () => ({
  isStudentAuthConfigured: configuredMock,
  registerStudentWithAuth: registerMock,
  signInStudentWithAuth: loginMock,
  getStudentIdentity: identityMock,
  revokeStudentSession: vi.fn(),
  updateStudentAuthMetadata: vi.fn(),
}));
vi.mock("../../src/lib/student-session", () => ({
  saveStudentSession: saveMock,
  clearStudentSession: vi.fn(),
  studentCookieNames: { access: "risa-student-access" },
}));
vi.mock("../../src/lib/risa-admin-api", () => ({ isRisaAdministrator: adminMock }));
vi.mock("../../src/lib/student-learning-api", () => ({ uploadStudentAvatar: vi.fn() }));

let issuedToken = "";

function formWithCredentials(token: string | null): FormData {
  const form = new FormData();
  form.set("email", "learner@example.com");
  form.set("password", "VeryStrong!Pass123");
  if (token !== null) {
    form.set("csrf_token", token);
  }
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  issuedToken = newStudentCsrfToken();
  cookiesMock.mockResolvedValue({
    get: (key: string) =>
      key === studentCsrfCookieName ? { value: issuedToken } : undefined,
  });
  configuredMock.mockReturnValue(true);
  redirectMock.mockImplementation((url: string) => {
    throw new Error("redirect:" + url);
  });
});

describe("RISA account Server Actions require valid CSRF tokens", () => {
  it("rejects a missing token before attempting sign-in", async () => {
    await expect(signInStudent(formWithCredentials(null))).rejects.toThrow(
      "redirect:/students/login?error=csrf",
    );
    expect(loginMock).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("rejects a forged token before attempting sign-in", async () => {
    await expect(
      signInStudent(formWithCredentials(newStudentCsrfToken())),
    ).rejects.toThrow("redirect:/students/login?error=csrf");
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("allows a matching token through the existing sign-in flow", async () => {
    const session = {
      access_token: "access",
      refresh_token: "refresh",
      expires_in: 3600,
    };
    loginMock.mockResolvedValue(session);
    identityMock.mockResolvedValue({ id: "student-id" });
    adminMock.mockResolvedValue(false);

    await expect(signInStudent(formWithCredentials(issuedToken))).rejects.toThrow(
      "redirect:/students/dashboard",
    );
    expect(loginMock).toHaveBeenCalledWith("learner@example.com", "VeryStrong!Pass123");
    expect(saveMock).toHaveBeenCalledWith(session);
  });

  it("rejects a missing token before calling registration", async () => {
    const form = formWithCredentials(null);
    form.set("fullName", "RISA Student");
    form.set("confirmPassword", "VeryStrong!Pass123");
    form.set("acceptedPrivacy", "on");

    await expect(registerStudent(form)).rejects.toThrow(
      "redirect:/students/register?error=csrf",
    );
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("preserves registration for a form with a matching token", async () => {
    const form = formWithCredentials(issuedToken);
    form.set("fullName", "RISA Student");
    form.set("confirmPassword", "VeryStrong!Pass123");
    form.set("acceptedPrivacy", "on");
    registerMock.mockResolvedValue({ status: "confirmation_required" });

    await expect(registerStudent(form)).rejects.toThrow(
      "redirect:/students/register?status=check-email",
    );
    expect(registerMock).toHaveBeenCalledWith(
      "RISA Student",
      "learner@example.com",
      "VeryStrong!Pass123",
    );
  });
});
