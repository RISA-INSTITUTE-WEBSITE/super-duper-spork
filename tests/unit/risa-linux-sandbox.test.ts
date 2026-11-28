import { describe, expect, it } from "vitest";

import { signLinuxSession, verifyLinuxSession } from "@/lib/risa-linux-sandbox";

describe("Linux sandbox session capabilities", () => {
  const secret = "a-test-secret-that-is-long-enough";
  it("binds a session to the verified user and server secret", () => {
    const token = signLinuxSession("sbx_example", "admin-one", secret, Date.now() + 60_000);
    expect(verifyLinuxSession(token, "admin-one", secret)).toBe("sbx_example");
    expect(verifyLinuxSession(token, "admin-two", secret)).toBeNull();
    expect(verifyLinuxSession(token, "admin-one", "other-secret")).toBeNull();
    expect(verifyLinuxSession(token + "x", "admin-one", secret)).toBeNull();
  });
  it("rejects expired, malformed and path-like identifiers", () => {
    const expired = signLinuxSession("sbx_example", "admin", secret, Date.now() - 1);
    const invalid = signLinuxSession("../other", "admin", secret, Date.now() + 60_000);
    expect(verifyLinuxSession(expired, "admin", secret)).toBeNull();
    expect(verifyLinuxSession(invalid, "admin", secret)).toBeNull();
    expect(verifyLinuxSession("broken", "admin", secret)).toBeNull();
  });
});
