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

  it("returns a pending status when email confirmation is required", async () => {
    fetchMock.mockResolvedValue(reply({ user: { id: "user" } }));
    expect(
      await registerStudentWithAuth("Student", "user@example.com", "Example123!"),
    ).toEqual({ status: "confirmation_required" });
    expect(fetchMock.mock.calls[0][0]).toContain("/auth/v1/signup");
  });

  it("provides a session for immediate login when confirmation is disabled", async () => {
    fetchMock.mockResolvedValue(reply(session));
    expect(
      await registerStudentWithAuth("Student", "user@example.com", "Example123!"),
    ).toEqual({ status: "signed_in", session });
  });

  it("rejects malformed signup responses without opening a session", async () => {
    fetchMock.mockResolvedValue(new Response("invalid-json"));
    expect(
      await registerStudentWithAuth("Student", "user@example.com", "Example123!"),
    ).toEqual({ status: "failed" });
  });

  it("fails closed on server errors and network failures", async () => {
    fetchMock.mockResolvedValueOnce(reply({}, 500));
    expect(
      await registerStudentWithAuth("Student", "user@example.com", "Example123!"),
    ).toEqual({ status: "failed" });
    fetchMock.mockRejectedValueOnce(new Error("connection interrupted"));
    expect(
      await registerStudentWithAuth("Student", "user@example.com", "Example123!"),
    ).toEqual({ status: "failed" });
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

describe("auth configuration safety cases", () => {
  it.each([
    "not-a-url",
    "http://example.org",
    "ftp://example.org",
    "https://user:pass@example.org",
    "https://example.org/path",
    "https://example.org/?q=1",
    "https://example.org/#fragment",
  ])("rejects unsafe URL %s", (url) => {
    vi.stubEnv("RISA_SUPABASE_URL", url);
    expect(isStudentAuthConfigured()).toBe(false);
  });

  it("accepts local development servers", () => {
    vi.stubEnv("RISA_SUPABASE_URL", "http://localhost:54321");
    expect(isStudentAuthConfigured()).toBe(true);
    vi.stubEnv("RISA_SUPABASE_URL", "http://127.0.0.1:54321");
    expect(isStudentAuthConfigured()).toBe(true);
  });

  it("rejects missing, empty and administrative keys", () => {
    vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "");
    expect(isStudentAuthConfigured()).toBe(false);
    vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "  ");
    expect(isStudentAuthConfigured()).toBe(false);
    vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "sb_secret_invalid");
    expect(isStudentAuthConfigured()).toBe(false);
  });

  it("does not call a network service with missing configuration", async () => {
    vi.stubEnv("RISA_SUPABASE_URL", "");
    expect(
      await registerStudentWithAuth("Example", "user@example.org", "Example#12345"),
    ).toEqual({ status: "failed" });
    expect(await signInStudentWithAuth("user@example.org", "Example#12345")).toBeNull();
    expect(await refreshStudentSession("unused")).toBeNull();
    expect(await verifyStudentEmail("unused")).toBeNull();
    expect(await getStudentIdentity("unused")).toBeNull();
    await revokeStudentSession("unused");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("auth transport and data validation cases", () => {
  it("provides the expected request body and authorization headers", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(reply(session)));
    await registerStudentWithAuth("Example Student", "user@example.org", "Example#12345");
    const signupOptions = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(signupOptions.body))).toMatchObject({
      email: "user@example.org",
      data: { full_name: "Example Student", account_type: "student" },
    });
    expect(signupOptions.headers).toMatchObject({
      apikey: "public-test-value",
      "Content-Type": "application/json",
    });
    await signInStudentWithAuth("user@example.org", "Example#12345");
    expect(fetchMock.mock.calls[1][0]).toContain("grant_type=password");
    await refreshStudentSession("new-refresh");
    expect(fetchMock.mock.calls[2][0]).toContain("grant_type=refresh_token");
    expect(JSON.parse(String(fetchMock.mock.calls[2][1].body))).toMatchObject({
      refresh_token: "new-refresh",
    });
    await verifyStudentEmail("token-hash");
    expect(JSON.parse(String(fetchMock.mock.calls[3][1].body))).toMatchObject({
      token_hash: "token-hash",
      type: "email",
    });
    await revokeStudentSession("access-token");
    expect(fetchMock.mock.calls[4][1].headers).toMatchObject({
      Authorization: "Bearer access-token",
    });
  });

  it.each([
    null,
    {},
    { access_token: "" },
    { ...session, refresh_token: "" },
    { ...session, refresh_token: null },
    { ...session, access_token: null },
    { ...session, expires_in: 0 },
    { ...session, expires_in: -3 },
    { ...session, expires_in: "3600" },
    { ...session, expires_in: Number.POSITIVE_INFINITY },
  ])("rejects invalid token payload %#", async (payload) => {
    fetchMock.mockResolvedValue(reply(payload));
    expect(await signInStudentWithAuth("user@example.org", "Example#12345")).toBeNull();
  });

  it("rejects non-success responses for each token operation", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(reply({}, 401)));
    expect(await refreshStudentSession("refresh")).toBeNull();
    expect(await verifyStudentEmail("hash")).toBeNull();
    expect(await signInStudentWithAuth("user@example.org", "Example#12345")).toBeNull();
    expect(await getStudentIdentity("access")).toBeNull();
  });

  it("returns a safe fallback when identity metadata is missing or invalid", async () => {
    const verified = {
      id: "student",
      email: "user@example.org",
      email_confirmed_at: "confirmed",
    };
    fetchMock.mockResolvedValueOnce(reply(verified));
    expect((await getStudentIdentity("access"))?.fullName).toBe("Student");
    fetchMock.mockResolvedValueOnce(
      reply({
        ...verified,
        user_metadata: { full_name: 1234 },
      }),
    );
    expect((await getStudentIdentity("access"))?.fullName).toBe("Student");
    fetchMock.mockResolvedValueOnce(
      reply({
        ...verified,
        user_metadata: { full_name: "   " },
      }),
    );
    expect((await getStudentIdentity("access"))?.fullName).toBe("Student");
  });

  it("truncates display names to 80 characters", async () => {
    fetchMock.mockResolvedValue(
      reply({
        id: "student",
        email: "user@example.org",
        email_confirmed_at: "confirmed",
        user_metadata: { full_name: "S".repeat(120) },
      }),
    );
    expect((await getStudentIdentity("access"))?.fullName).toHaveLength(80);
  });

  it.each([
    null,
    [],
    {},
    { id: 42, email: "user@example.org", email_confirmed_at: "yes" },
    { id: "id", email: null, email_confirmed_at: "yes" },
    { id: "id", email: "user@example.org", email_confirmed_at: false },
  ])("does not grant a dashboard identity for malformed users %#", async (user) => {
    fetchMock.mockResolvedValue(reply(user));
    expect(await getStudentIdentity("access")).toBeNull();
  });

  it("handles invalid identity JSON and network errors", async () => {
    fetchMock.mockResolvedValueOnce(new Response("not-json"));
    expect(await getStudentIdentity("access")).toBeNull();
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    expect(await getStudentIdentity("access")).toBeNull();
  });
});
