import { describe, expect, it } from "vitest";

import { validateLogin, validateRegistration } from "../../src/lib/student-validation";

const valid = {
  fullName: "Anele Mkhize",
  email: "anele@example.com",
  password: "Secure#2026Pass",
  confirmPassword: "Secure#2026Pass",
  acceptedPrivacy: true,
};

describe("student registration validation", () => {
  it("accepts valid registration details", () => {
    expect(validateRegistration(valid)).toBeNull();
  });

  it("rejects missing or oversized names", () => {
    expect(validateRegistration({ ...valid, fullName: " " })).toBe("name");
    expect(validateRegistration({ ...valid, fullName: "A".repeat(81) })).toBe("name");
  });

  it("rejects malformed email addresses", () => {
    expect(validateRegistration({ ...valid, email: "not-an-email" })).toBe("email");
  });

  it("requires a strong password", () => {
    for (const password of ["short#1", "OnlyLettersHere", "Onlyletters#here"]) {
      expect(
        validateRegistration({ ...valid, password, confirmPassword: password }),
      ).toBe("password");
    }
  });

  it("requires matching passwords", () => {
    expect(validateRegistration({ ...valid, confirmPassword: "Wrong#2026" })).toBe(
      "confirmation",
    );
  });

  it("requires agreement to the privacy notice", () => {
    expect(validateRegistration({ ...valid, acceptedPrivacy: false })).toBe("consent");
  });

  it("validates login details without exposing account existence", () => {
    expect(validateLogin("anele@example.com", "any-password")).toBe(true);
    expect(validateLogin("invalid", "any-password")).toBe(false);
    expect(validateLogin("anele@example.com", "")).toBe(false);
  });
});
