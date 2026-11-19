import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getStudentIdentity,
  isStudentAuthConfigured,
  refreshStudentSession,
  registerStudentWithAuth,
  revokeStudentSession,
  signInStudentWithAuth,
  verifyStudentEmail,
} from "../../src/lib/student-auth-api";

const session = {
  access_token: "access",
  refresh_token: "refresh",
  expires_in: 3600,
};

const fetchMock = vi.fn();
const reply = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), { status });

beforeEach(() => {
  vi.stubEnv("RISA_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "public-test-value");
  vi.stubEnv("RISA_STUDENT_AUTH_ENABLED", "true");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("RISA student authentication gateway", () => {
  it("enables account access only with explicit configuration", () => {
    expect(isStudentAuthConfigured()).toBe(true);
    vi.stubEnv("RISA_STUDENT_AUTH_ENABLED", "false");
    expect(isStudentAuthConfigured()).toBe(false);
    vi.stubEnv("RISA_STUDENT_AUTH_ENABLED", "true");
    vi.stubEnv("RISA_SUPABASE_URL", "");
    expect(isStudentAuthConfigured()).toBe(false);
  });

  it("registers accounts without creating a local password record", async () => {
    fetchMock.mockResolvedValue(reply({ user: { id: "user" } }));
    expect(
      await registerStudentWithAuth("Student", "user@example.com", "Example123!"),
    ).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toContain("/auth/v1/signup");
  });

  it("fails closed on server errors and network failures", async () => {
    fetchMock.mockResolvedValueOnce(reply({}, 500));
    expect(
      await registerStudentWithAuth("Student", "user@example.com", "Example123!"),
    ).toBe(false);
    fetchMock.mockRejectedValueOnce(new Error("connection interrupted"));
    expect(
      await registerStudentWithAuth("Student", "user@example.com", "Example123!"),
    ).toBe(false);
  });

  it("signs in and refreshes sessions", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(reply(session)));
    expect(await signInStudentWithAuth("user@example.com", "Example123!")).toEqual(
      session,
    );
    expect(await refreshStudentSession("refresh")).toEqual(session);
  });

  it("checks email verification through the Auth provider", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(reply(session)));
    expect(await verifyStudentEmail("hash")).toEqual(session);
  });

  it("rejects unusable sessions", async () => {
    fetchMock.mockResolvedValueOnce(reply({}));
    expect(await signInStudentWithAuth("user@example.com", "Example123!")).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response("invalid-json"));
    expect(await signInStudentWithAuth("user@example.com", "Example123!")).toBeNull();
  });

  it("accepts only verified identities", async () => {
    fetchMock.mockResolvedValueOnce(
      reply({
        id: "student",
        email: "user@example.com",
        email_confirmed_at: "verified",
        user_metadata: { full_name: "Student Example" },
      }),
    );
    expect(await getStudentIdentity("access")).toEqual({
      id: "student",
      email: "user@example.com",
      fullName: "Student Example",
    });
    fetchMock.mockResolvedValueOnce(
      reply({
        id: "student",
        email: "user@example.com",
        email_confirmed_at: null,
      }),
    );
    expect(await getStudentIdentity("access")).toBeNull();
  });

  it("requests sign out", async () => {
    fetchMock.mockResolvedValue(reply({}));
    await revokeStudentSession("access");
    expect(fetchMock.mock.calls[0][0]).toContain("/auth/v1/logout");
  });
});
