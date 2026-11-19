import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getRisaAdminOverview, isRisaAdministrator } from "../../src/lib/risa-admin-api";

const userId = "11111111-1111-4111-8111-111111111111";
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("RISA_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("RISA_SUPABASE_PUBLISHABLE_KEY", "public-test-value");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("RISA administrator authorization", () => {
  it("accepts a role only from verified, RLS-scoped membership", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([{ role: "admin" }]));

    expect(await isRisaAdministrator("session-token", userId)).toBe(true);
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/rest/v1/risa_user_roles");
    expect(url).toContain("user_id=eq." + userId);
    expect(request.headers).toMatchObject({
      Authorization: "Bearer session-token",
      apikey: "public-test-value",
    });
  });

  it("denies learners with no explicit administrator membership", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await isRisaAdministrator("learner-token", userId)).toBe(false);
  });

  it("fails closed when backend denies access, times out or returns malformed JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect(await isRisaAdministrator("session-token", userId)).toBe(false);
    fetchMock.mockRejectedValueOnce(new Error("network failure"));
    expect(await isRisaAdministrator("session-token", userId)).toBe(false);
    fetchMock.mockResolvedValueOnce(new Response("invalid-json"));
    expect(await isRisaAdministrator("session-token", userId)).toBe(false);
  });

  it("cannot infer admin rights from an unverified or missing user ID", async () => {
    expect(await isRisaAdministrator("session-token", "../../users")).toBe(false);
    expect(await isRisaAdministrator("session-token", "")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unexpected and duplicate role rows", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([{ role: "student" }]));
    expect(await isRisaAdministrator("session-token", userId)).toBe(false);
    fetchMock.mockResolvedValueOnce(
      Response.json([{ role: "admin" }, { role: "admin" }]),
    );
    expect(await isRisaAdministrator("session-token", userId)).toBe(false);
  });
});

describe("RISA administrator overview", () => {
  it("reads real course, enrolment, and material counts", async () => {
    for (const number of [2, 4, 7]) {
      fetchMock.mockResolvedValueOnce(
        new Response(null, { headers: { "content-range": "*/" + number } }),
      );
    }
    expect(await getRisaAdminOverview("session-token")).toEqual({
      courses: 2,
      enrolments: 4,
      materials: 7,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][1].headers.Prefer).toBe("count=exact");
  });

  it("shows unavailable counts instead of making up zero records", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 200, headers: { "content-range": "*/0" } }),
    );
    expect(await getRisaAdminOverview("session-token")).toEqual({
      courses: null,
      enrolments: null,
      materials: 0,
    });
  });
});
