"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/risa-staff-session";
import { changeLecturerAssignment } from "@/lib/risa-lecturers";

export async function changeLecturerAction(form: FormData) {
  const { token } = await requireAdminSession();
  const saved = await changeLecturerAssignment(token, {
    lecturer_id: String(form.get("lecturerId") ?? "").trim(),
    course_id: String(form.get("courseId") ?? ""),
  }, form.get("operation") === "remove");
  revalidatePath("/admin/lecturers");
  redirect("/admin/lecturers?result=" + (saved ? "saved" : "failed"));
}
