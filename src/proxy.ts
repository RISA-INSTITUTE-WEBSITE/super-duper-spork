import { type NextRequest, NextResponse } from "next/server";

import { isStudentAuthConfigured, refreshStudentSession } from "@/lib/student-auth-api";
import { contentSecurityPolicy, newCspNonce } from "@/lib/risa-security-policy";
import {
  isStudentCsrfToken,
  newStudentCsrfToken,
  studentCsrfCookieName,
  studentCsrfCookieOptions,
} from "@/lib/student-csrf";
import {
  clearStudentSessionOnResponse,
  saveStudentSessionOnResponse,
  sessionCookieValues,
  studentCookieNames,
} from "@/lib/student-session";

/** The same nonce policy must reach Next.js rendering and the browser. */
function cspResponse(request: NextRequest): NextResponse {
  const forwarded = new Headers(request.headers);
  const response = NextResponse.next({ request: { headers: forwarded } });
  const policy = forwarded.get("Content-Security-Policy");
  if (policy) {
    response.headers.set("Content-Security-Policy", policy);
  }
  return response;
}

function needsRefresh(accessToken: string | undefined, expiresAt: number): boolean {
  return (
    !accessToken || !Number.isFinite(expiresAt) || expiresAt <= Date.now() / 1000 + 90
  );
}

function needsAccountCsrfToken(request: NextRequest): boolean {
  return (
    request.method === "GET" &&
    ["/students/login", "/students/register"].includes(request.nextUrl.pathname) &&
    !isStudentCsrfToken(request.cookies.get(studentCsrfCookieName)?.value)
  );
}

async function refreshStudentSessionIfNeeded(
  request: NextRequest,
  response: NextResponse,
  csrfToken: string | null,
): Promise<NextResponse> {
  const accessToken = request.cookies.get(studentCookieNames.access)?.value;
  const refreshToken = request.cookies.get(studentCookieNames.refresh)?.value;
  const expiresAt = Number(request.cookies.get(studentCookieNames.expires)?.value ?? 0);
  if (
    !isStudentAuthConfigured() ||
    !refreshToken ||
    !needsRefresh(accessToken, expiresAt)
  ) {
    return response;
  }

  const session = await refreshStudentSession(refreshToken);
  if (!session) {
    clearStudentSessionOnResponse(response);
    return response;
  }

  const values = sessionCookieValues(session);
  request.cookies.set(studentCookieNames.access, values.access);
  request.cookies.set(studentCookieNames.refresh, values.refresh);
  request.cookies.set(studentCookieNames.expires, values.expires);

  const refreshedResponse = cspResponse(request);
  if (csrfToken) {
    refreshedResponse.cookies.set(
      studentCsrfCookieName,
      csrfToken,
      studentCsrfCookieOptions,
    );
  }
  saveStudentSessionOnResponse(refreshedResponse, session);
  return refreshedResponse;
}

export async function proxy(request: NextRequest) {
  // The nonce is unique on each response and is forwarded to Next.js so
  // framework hydration scripts and inline <style> blocks get trusted nonces.
  const nonce = newCspNonce();
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", contentSecurityPolicy(nonce));

  // Make the newly issued cookie visible to this server-rendered request.
  const csrfToken = needsAccountCsrfToken(request) ? newStudentCsrfToken() : null;
  if (csrfToken) {
    request.cookies.set(studentCsrfCookieName, csrfToken);
  }

  const response = cspResponse(request);
  if (csrfToken) {
    response.cookies.set(studentCsrfCookieName, csrfToken, studentCsrfCookieOptions);
  }
  return refreshStudentSessionIfNeeded(request, response, csrfToken);
}

// Keep the signed-in header accurate on public pages as well as protected pages.
// Static files and Next.js internals do not need authentication refresh.
export const config = {
  matcher: ["/((?!api/|_next/|.*\\..*).*)"],
};
