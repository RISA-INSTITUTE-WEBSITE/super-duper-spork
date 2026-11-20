import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import { getCourseCurriculum } from "@/lib/risa-course-curriculum";
import { getRisaCourseById } from "@/lib/risa-course-admin";
import { getEnrolledCourses } from "@/lib/student-learning-api";
import { studentCookieNames } from "@/lib/student-session";

/**
 * Every learner course page verifies the Supabase session and checks enrolled,
 * published course membership. The curriculum query also applies RLS.
 */
export async function getVerifiedStudentCourse(courseId: string) {
  if (!isStudentAuthConfigured()) {
    redirect("/students/login");
  }
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const user = await getStudentIdentity(token);
  if (!user) {
    redirect("/students/login");
  }
  const enrolments = await getEnrolledCourses(token, user.id);
  if (!enrolments?.some((entry) => entry.id === courseId)) {
    notFound();
  }
  const course = await getRisaCourseById(token, courseId);
  if (!course || !course.is_published) {
    notFound();
  }
  return {
    course,
    curriculum: await getCourseCurriculum(token, course.id),
  };
}
