import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "../../src/components/site-header";

const { cookiesMock, identityMock, configuredMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  identityMock: vi.fn(),
  configuredMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("../../src/lib/student-auth-api", () => ({
  isStudentAuthConfigured: configuredMock,
  getStudentIdentity: identityMock,
}));

beforeEach(() => {
  cookiesMock.mockReset();
  identityMock.mockReset();
  configuredMock.mockReset().mockReturnValue(true);
  cookiesMock.mockResolvedValue({ get: () => undefined });
});

async function renderHeader() {
  return renderToStaticMarkup(await SiteHeader());
}

describe("RISA account-aware site navigation", () => {
  it("shows Sign In and Sign Up to visitors without a session", async () => {
    const html = await renderHeader();

    expect(html).toContain('href="/students/login"');
    expect(html).toContain('href="/students/register"');
    expect(html).not.toContain('href="/students/profile"');
    expect(identityMock).not.toHaveBeenCalled();
  });

  it("does not show the profile when a token fails server verification", async () => {
    cookiesMock.mockResolvedValue({ get: () => ({ value: "expired-token" }) });
    identityMock.mockResolvedValue(null);
    const html = await renderHeader();

    expect(identityMock).toHaveBeenCalledWith("expired-token");
    expect(html).toContain('href="/students/login"');
    expect(html).not.toContain('href="/students/profile"');
  });

  it("shows a small round uploaded avatar instead of authentication links", async () => {
    cookiesMock.mockResolvedValue({ get: () => ({ value: "valid-token" }) });
    identityMock.mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      fullName: "Ada Learner",
      avatarPath: "user-1/avatar.webp",
      updatedAt: "2026-11-20",
    });
    const html = await renderHeader();

    expect(html).toContain('aria-label="Open profile for Ada Learner"');
    expect(html).toContain('href="/students/profile"');
    expect(html).toContain("avatar?updated=2026-11-20");
    expect(html).toContain("rounded-full");
    expect(html).not.toContain('href="/students/login"');
    expect(html).not.toContain('href="/students/register"');
  });

  it("uses learner initials when no profile photo has been uploaded", async () => {
    cookiesMock.mockResolvedValue({ get: () => ({ value: "valid-token" }) });
    identityMock.mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      fullName: "Ada Learner",
      avatarPath: null,
    });
    const html = await renderHeader();

    expect(html).toContain('aria-label="Open profile for Ada Learner"');
    expect(html).toContain(">AL</span>");
    expect(html).not.toContain("/students/avatar?");
  });
});
