import { type NextRequest, NextResponse } from "next/server";

import { isStudentAuthConfigured, verifyStudentEmail } from "@/lib/student-auth-api";
import { saveStudentSession } from "@/lib/student-session";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const destination = new URL("/students/login?error=confirmation", request.url);

  if (
    !isStudentAuthConfigured() ||
    !tokenHash ||
    tokenHash.length > 1024 ||
    type !== "email"
  ) {
    return NextResponse.redirect(destination);
  }

  const session = await verifyStudentEmail(tokenHash);
  if (!session) return NextResponse.redirect(destination);

  await saveStudentSession(session);
  return NextResponse.redirect(new URL("/students/dashboard", request.url));
}
