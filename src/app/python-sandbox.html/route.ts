import { cookies } from "next/headers";

import { isRisaAdministrator } from "@/lib/risa-admin-api";
import { getStudentIdentity } from "@/lib/student-auth-api";
import { studentCookieNames } from "@/lib/student-session";
import { pythonSandboxHtml, pythonSandboxPolicy } from "../../python-sandbox/runtime";

export const dynamic = "force-dynamic";

async function canPreviewPython() {
  const token = (await cookies()).get(studentCookieNames.access)?.value;
  if (!token) {
    return false;
  }
  const identity = await getStudentIdentity(token);
  return identity !== null && (await isRisaAdministrator(token, identity.id));
}

export async function GET() {
  if (!(await canPreviewPython())) {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  return new Response(pythonSandboxHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": pythonSandboxPolicy,
      "X-Frame-Options": "SAMEORIGIN",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
