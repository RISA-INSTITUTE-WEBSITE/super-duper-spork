import { describe, expect, it } from "vitest";

import {
  isStudentCsrfToken,
  newStudentCsrfToken,
  verifyStudentCsrfToken,
} from "../../src/lib/student-csrf";

describe("RISA account-form CSRF protection", () => {
  it("generates unpredictable, well-formed tokens", () => {
    const first = newStudentCsrfToken();
    const second = newStudentCsrfToken();

    expect(isStudentCsrfToken(first)).toBe(true);
    expect(isStudentCsrfToken(second)).toBe(true);
    expect(first).not.toBe(second);
  });

  it("requires the form token to match the server-issued cookie", () => {
    const token = newStudentCsrfToken();
    const other = newStudentCsrfToken();

    expect(verifyStudentCsrfToken(token, token)).toBe(true);
    expect(verifyStudentCsrfToken(token, other)).toBe(false);
  });

  it.each([null, undefined, "", "guess", 123, {}])(
    "rejects a malformed or missing token: %s",
    (invalid) => {
      expect(verifyStudentCsrfToken(newStudentCsrfToken(), invalid)).toBe(false);
      expect(verifyStudentCsrfToken(invalid, newStudentCsrfToken())).toBe(false);
    },
  );
});
