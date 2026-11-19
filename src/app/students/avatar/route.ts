import { cookies } from "next/headers";

import { getStudentIdentity } from "@/lib/student-auth-api";
import { getStudentAvatar } from "@/lib/student-learning-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token) {
    return new Response(null, { status: 404 });
  }

  const student = await getStudentIdentity(token);
  if (!student?.avatarPath) {
    return new Response(null, { status: 404 });
  }

  const image = await getStudentAvatar(token, student.avatarPath);
  const mime = image?.headers.get("content-type")?.split(";")[0];
  if (
    !image?.body ||
    !mime ||
    !["image/jpeg", "image/png", "image/webp"].includes(mime)
  ) {
    return new Response(null, { status: 404 });
  }

  return new Response(image.body, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      Vary: "Cookie",
    },
  });
}
