"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getStudentIdentity } from "@/lib/student-auth-api";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import { reviewCourseEnrolmentRequest } from "@/lib/risa-course-enrolment";
import { uuidPattern } from "@/lib/risa-course-curriculum";
import { studentCookieNames } from "@/lib/student-session";

export async function reviewEnrolmentAction(formData: FormData): Promise<void> {
  const token = (await cookies()).get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const identity = await getStudentIdentity(token);
  if (!identity || !(await isRisaAdministrator(token, identity.id))) {
    notFound();
  }

  const courseId = String(formData.get("courseId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (
    !uuidPattern.test(courseId) ||
    !uuidPattern.test(studentId) ||
    (decision !== "approved" && decision !== "declined")
  ) {
    redirect("/admin/enrolment-requests?result=invalid");
  }

  const result = await reviewCourseEnrolmentRequest(token, courseId, studentId, decision);
  if (!result) {
    redirect("/admin/enrolment-requests?result=failed");
  }
  revalidatePath("/admin/enrolment-requests");
  revalidatePath("/students/dashboard");
  revalidatePath("/students/courses/" + courseId);
  redirect("/admin/enrolment-requests?result=" + decision);
}
