"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/risa-staff-session";
import { submitPractical } from "@/lib/risa-lecturers";

export async function submitPracticalAction(form: FormData) {
  const { token, identity } = await requireAdminSession();
  const saved = await submitPractical(token, {
    student_id: identity.id,
    course_id: String(form.get("courseId") ?? ""),
    activity: String(form.get("activity") ?? ""),
    evidence: String(form.get("evidence") ?? "").trim(),
  });
  revalidatePath("/students/practicals");
  redirect("/students/practicals?result=" + (saved ? "saved" : "failed"));
}
