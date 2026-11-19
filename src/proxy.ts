import { type NextRequest, NextResponse } from "next/server";

import { isStudentAuthConfigured, refreshStudentSession } from "@/lib/student-auth-api";
import {
  clearStudentSessionOnResponse,
  saveStudentSessionOnResponse,
  sessionCookieValues,
  studentCookieNames,
} from "@/lib/student-session";

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(studentCookieNames.access)?.value;
  const refreshToken = request.cookies.get(studentCookieNames.refresh)?.value;
  const expiresAt = Number(request.cookies.get(studentCookieNames.expires)?.value ?? 0);
  const currentTime = Math.floor(Date.now() / 1000);

  if (
    !isStudentAuthConfigured() ||
    !refreshToken ||
    (accessToken && Number.isFinite(expiresAt) && expiresAt > currentTime + 90)
  ) {
    return NextResponse.next({ request });
  }

  const session = await refreshStudentSession(refreshToken);
  if (!session) {
    const response = NextResponse.next({ request });
    clearStudentSessionOnResponse(response);
    return response;
  }

  const values = sessionCookieValues(session);
  request.cookies.set(studentCookieNames.access, values.access);
  request.cookies.set(studentCookieNames.refresh, values.refresh);
  request.cookies.set(studentCookieNames.expires, values.expires);

  const response = NextResponse.next({ request });
  saveStudentSessionOnResponse(response, session);
  return response;
}

export const config = {
  matcher: ["/students/dashboard/:path*"],
};
