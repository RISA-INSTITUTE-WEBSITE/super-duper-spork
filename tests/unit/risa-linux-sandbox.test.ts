import { afterEach, describe, expect, it, vi } from "vitest";

import {
  sandboxConfig,
  signLinuxSession,
  verifyLinuxSession,
} from "@/lib/risa-linux-sandbox";

describe("Linux sandbox session capabilities", () => {
  const secret = "a-test-secret-that-is-long-enough";

  it("binds a session to the verified user and server secret", () => {
    const token = signLinuxSession(
      { id: "sbx_example", user: "admin-one", expires: Date.now() + 60_000 },
      secret,
    );
    expect(verifyLinuxSession(token, "admin-one", secret)).toBe("sbx_example");
    expect(verifyLinuxSession(token, "admin-two", secret)).toBeNull();
    expect(verifyLinuxSession(token, "admin-one", "other-secret")).toBeNull();
    expect(verifyLinuxSession(token + "x", "admin-one", secret)).toBeNull();
  });

  it("rejects expired, malformed and path-like identifiers", () => {
    const expired = signLinuxSession(
      { id: "sbx_example", user: "admin", expires: Date.now() - 1 },
      secret,
    );
    const invalid = signLinuxSession(
      { id: "../other", user: "admin", expires: Date.now() + 60_000 },
      secret,
    );
    expect(verifyLinuxSession(expired, "admin", secret)).toBeNull();
    expect(verifyLinuxSession(invalid, "admin", secret)).toBeNull();
    expect(verifyLinuxSession("broken", "admin", secret)).toBeNull();
  });
});

describe("Linux runtime OIDC configuration", () => {
  const secret = "a-test-secret-that-is-long-enough";
  const claims = Buffer.from(
    JSON.stringify({ owner_id: "team_fixture", project_id: "prj_fixture" }),
  ).toString("base64url");
  const token = "fixture." + claims + ".signature";

  afterEach(() => vi.unstubAllEnvs());

  it("accepts the request token without a build-time environment token", () => {
    vi.stubEnv("VERCEL_OIDC_TOKEN", "");
    vi.stubEnv("RISA_LINUX_SESSION_SECRET", secret);
    expect(sandboxConfig(token)).toEqual({
      token,
      secret,
      team: "team_fixture",
      project: "prj_fixture",
    });
  });

  it("prefers a runtime token over the environment fallback", () => {
    vi.stubEnv("VERCEL_OIDC_TOKEN", "invalid");
    vi.stubEnv("RISA_LINUX_SESSION_SECRET", secret);
    expect(sandboxConfig(token)?.token).toBe(token);
  });

  it("uses the environment fallback for local development", () => {
    vi.stubEnv("VERCEL_OIDC_TOKEN", token);
    vi.stubEnv("RISA_LINUX_SESSION_SECRET", secret);
    expect(sandboxConfig()?.token).toBe(token);
  });

  it("rejects missing or malformed credentials", () => {
    vi.stubEnv("VERCEL_OIDC_TOKEN", "");
    vi.stubEnv("RISA_LINUX_SESSION_SECRET", secret);
    expect(sandboxConfig()).toBeNull();
    expect(sandboxConfig("invalid")).toBeNull();
    vi.stubEnv("RISA_LINUX_SESSION_SECRET", "");
    expect(sandboxConfig(token)).toBeNull();
  });
});
