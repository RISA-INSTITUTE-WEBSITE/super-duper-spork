"use server";

import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { requireLearningSession } from "@/lib/risa-staff-session";
import { getLecturerAssignments, reviewPractical } from "@/lib/risa-lecturers";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import { uuidPattern } from "@/lib/risa-course-curriculum";

export async function reviewPracticalAction(form: FormData) {
  const { token, identity } = await requireLearningSession();
  const courseId = String(form.get("courseId") ?? "");
  if (!uuidPattern.test(courseId)) {
    notFound();
  }
  const [assignments, admin] = await Promise.all([
    getLecturerAssignments(token, identity.id),
    isRisaAdministrator(token, identity.id),
  ]);
  if (!admin && !assignments?.some((item) => item.course_id === courseId)) {
    notFound();
  }
  const saved = await reviewPractical(token, {
    id: String(form.get("id") ?? ""),
    courseId,
    score: reviewScore(form),
    feedback: String(form.get("feedback") ?? ""),
  });
  revalidatePath("/lecturers/" + courseId);
  redirect("/lecturers/" + courseId + "?result=" + (saved ? "saved" : "failed"));
}

function reviewScore(form: FormData): number {
  const score = String(form.get("score") ?? "");
  return score.trim() === "" ? NaN : Number(score);
}
