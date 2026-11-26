import { cookies } from "next/headers";

import { readStudyNoteImage } from "@/lib/risa-study-note-images";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = (await cookies()).get(studentCookieNames.access)?.value;
  const { id } = await params;
  const image = token ? await readStudyNoteImage(token, id) : null;
  if (!image) {
    return new Response(null, { status: 404 });
  }
  return new Response(Buffer.from(image.bytes), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
