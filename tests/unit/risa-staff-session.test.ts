import { beforeEach, describe, expect, it, vi } from "vitest";

import { requireAdminSession } from "@/lib/risa-staff-session";

const { cookiesMock, identityMock, adminMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  identityMock: vi.fn(),
  adminMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error("redirect:" + path);
  },
  notFound: () => {
    throw new Error("not-found");
  },
}));
vi.mock("@/lib/student-auth-api", () => ({ getStudentIdentity: identityMock }));
vi.mock("@/lib/risa-admin-api", () => ({ isRisaAdministrator: adminMock }));

const identity = { id: "verified-user", fullName: "Preview account" };

beforeEach(() => {
  cookiesMock.mockReset().mockResolvedValue({ get: () => ({ value: "session" }) });
  identityMock.mockReset().mockResolvedValue(identity);
  adminMock.mockReset().mockResolvedValue(false);
});

describe("administrator lab session boundary", () => {
  it("redirects missing sessions without checking role membership", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined });
    await expect(requireAdminSession()).rejects.toThrow("redirect:/students/login");
    expect(adminMock).not.toHaveBeenCalled();
  });

  it("rejects invalid sessions", async () => {
    identityMock.mockResolvedValue(null);
    await expect(requireAdminSession()).rejects.toThrow("redirect:/students/login");
    expect(adminMock).not.toHaveBeenCalled();
  });

  it("denies a verified nonadministrator", async () => {
    await expect(requireAdminSession()).rejects.toThrow("not-found");
    expect(adminMock).toHaveBeenCalledWith("session", identity.id);
  });

  it("allows only a verified administrator", async () => {
    adminMock.mockResolvedValue(true);
    await expect(requireAdminSession()).resolves.toEqual({ token: "session", identity });
  });
});
