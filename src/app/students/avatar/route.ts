import { cookies } from "next/headers";

import { getStudentIdentity } from "@/lib/student-auth-api";
import { getStudentAvatar } from "@/lib/student-learning-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

async function loadPrivateAvatar(): Promise<Response | null> {
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token) {
    return null;
  }

  const student = await getStudentIdentity(token);
  if (!student?.avatarPath) {
    return null;
  }
  return getStudentAvatar(token, student.avatarPath);
}

export async function GET() {
  const image = await loadPrivateAvatar();
  if (!image?.body) {
    return new Response(null, { status: 404 });
  }
  const mime = image.headers.get("content-type")?.split(";")[0] ?? "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
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
