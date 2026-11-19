import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import type { StudentSession } from "@/lib/student-auth-api";

export const studentCookieNames = {
  access: "risa-student-access",
  refresh: "risa-student-refresh",
  expires: "risa-student-expires",
} as const;

const sharedCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function sessionCookieValues(session: StudentSession) {
  const expiresIn = Math.max(1, Math.min(Math.floor(session.expires_in), 86400));
  return {
    access: session.access_token,
    refresh: session.refresh_token,
    expires: String(Math.floor(Date.now() / 1000) + expiresIn),
    expiresIn,
  };
}

export async function saveStudentSession(session: StudentSession): Promise<void> {
  const jar = await cookies();
  const values = sessionCookieValues(session);
  jar.set(studentCookieNames.access, values.access, {
    ...sharedCookieOptions,
    maxAge: values.expiresIn,
  });
  jar.set(studentCookieNames.refresh, values.refresh, {
    ...sharedCookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });
  jar.set(studentCookieNames.expires, values.expires, {
    ...sharedCookieOptions,
    maxAge: values.expiresIn,
  });
}

export function saveStudentSessionOnResponse(
  response: NextResponse,
  session: StudentSession,
): void {
  const values = sessionCookieValues(session);
  response.cookies.set(studentCookieNames.access, values.access, {
    ...sharedCookieOptions,
    maxAge: values.expiresIn,
  });
  response.cookies.set(studentCookieNames.refresh, values.refresh, {
    ...sharedCookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set(studentCookieNames.expires, values.expires, {
    ...sharedCookieOptions,
    maxAge: values.expiresIn,
  });
}

export async function clearStudentSession(): Promise<void> {
  const jar = await cookies();
  for (const name of Object.values(studentCookieNames)) {
    jar.delete(name);
  }
}

export function clearStudentSessionOnResponse(response: NextResponse): void {
  for (const name of Object.values(studentCookieNames)) {
    response.cookies.delete(name);
  }
}
