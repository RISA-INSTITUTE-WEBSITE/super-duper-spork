import { type NextRequest, NextResponse } from "next/server";

import { isStudentAuthConfigured, refreshStudentSession } from "@/lib/student-auth-api";
import {
  clearStudentSessionOnResponse,
  saveStudentSessionOnResponse,
  sessionCookieValues,
  studentCookieNames,
} from "@/lib/student-session";

function needsRefresh(accessToken: string | undefined, expiresAt: number): boolean {
  return (
    !accessToken || !Number.isFinite(expiresAt) || expiresAt <= Date.now() / 1000 + 90
  );
}

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(studentCookieNames.access)?.value;
  const refreshToken = request.cookies.get(studentCookieNames.refresh)?.value;
  const expiresAt = Number(request.cookies.get(studentCookieNames.expires)?.value ?? 0);
  if (
    !isStudentAuthConfigured() ||
    !refreshToken ||
    !needsRefresh(accessToken, expiresAt)
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
  matcher: [
    "/students/dashboard/:path*",
    "/admin/:path*",
    "/students/profile/:path*",
    "/students/avatar",
    "/students/materials/:path*",
  ],
};
