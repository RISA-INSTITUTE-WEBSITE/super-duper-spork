import type { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearStudentSession,
  clearStudentSessionOnResponse,
  saveStudentSession,
  saveStudentSessionOnResponse,
  sessionCookieValues,
  studentCookieNames,
} from "../../src/lib/student-session";

const { cookiesMock } = vi.hoisted(() => ({ cookiesMock: vi.fn() }));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));

const session = {
  access_token: "access",
  refresh_token: "refresh",
  expires_in: 3600,
};

beforeEach(() => {
  cookiesMock.mockReset();
});

describe("RISA student sessions", () => {
  it("bounds the access token lifetime", () => {
    expect(sessionCookieValues(session).expiresIn).toBe(3600);
    expect(sessionCookieValues({ ...session, expires_in: 100000 }).expiresIn).toBe(86400);
    expect(sessionCookieValues({ ...session, expires_in: 0 }).expiresIn).toBe(1);
  });

  it("saves session tokens in HttpOnly cookies", async () => {
    const jar = { set: vi.fn(), delete: vi.fn() };
    cookiesMock.mockResolvedValue(jar);
    await saveStudentSession(session);
    expect(jar.set).toHaveBeenCalledTimes(3);
    expect(jar.set).toHaveBeenCalledWith(
      studentCookieNames.access,
      "access",
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }),
    );
  });

  it("rotates credentials on an HTTP response", () => {
    const response = { cookies: { set: vi.fn(), delete: vi.fn() } };
    saveStudentSessionOnResponse(response as unknown as NextResponse, session);
    expect(response.cookies.set).toHaveBeenCalledTimes(3);
  });

  it("deletes all three cookies on sign-out", async () => {
    const jar = { set: vi.fn(), delete: vi.fn() };
    cookiesMock.mockResolvedValue(jar);
    await clearStudentSession();
    expect(jar.delete).toHaveBeenCalledTimes(3);
  });

  it("deletes all three cookies from HTTP responses", () => {
    const response = { cookies: { set: vi.fn(), delete: vi.fn() } };
    clearStudentSessionOnResponse(response as unknown as NextResponse);
    expect(response.cookies.delete).toHaveBeenCalledTimes(3);
  });
});
