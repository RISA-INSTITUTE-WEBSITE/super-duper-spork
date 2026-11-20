import { randomBytes, timingSafeEqual } from "node:crypto";

// Account-form CSRF defense is in addition to Next.js Server Action Origin checks.
// The cookie is host-only, HttpOnly and SameSite=Strict. Never accept a token
// based only on its shape: a matching cookie is mandatory.
// Browsers enforce the __Host- prefix in production: Secure + host-only + Path=/.
// Development uses an unprefixed name so HTTP localhost still works.
export const studentCsrfCookieName =
  process.env.NODE_ENV === "production" ? "__Host-risa-student-csrf" : "risa-student-csrf";

export const studentCsrfCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 2,
};

export function newStudentCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isStudentCsrfToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

export function verifyStudentCsrfToken(cookie: unknown, supplied: unknown): boolean {
  if (!isStudentCsrfToken(cookie) || !isStudentCsrfToken(supplied)) {
    return false;
  }

  return timingSafeEqual(Buffer.from(cookie), Buffer.from(supplied));
}
