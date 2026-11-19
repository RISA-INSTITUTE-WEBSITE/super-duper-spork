import { cookies } from "next/headers";

import { getStudentIdentity } from "@/lib/student-auth-api";
import { downloadCourseMaterial } from "@/lib/student-learning-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token || !(await getStudentIdentity(token))) {
    return new Response(null, { status: 404 });
  }

  const { id } = await params;
  const file = await downloadCourseMaterial(token, id);
  if (!file) {
    return new Response(null, { status: 404 });
  }

  return new Response(file.response.body, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="' + file.title + "." + file.extension + '"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      Vary: "Cookie",
    },
  });
}
