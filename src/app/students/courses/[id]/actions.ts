"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getStudentIdentity } from "@/lib/student-auth-api";
import { getRisaCourseById } from "@/lib/risa-course-admin";
import {
  getCourseEnrolmentRequest,
  submitCourseEnrolmentRequest,
} from "@/lib/risa-course-enrolment";
import { uuidPattern } from "@/lib/risa-course-curriculum";
import { getEnrolledCourses } from "@/lib/student-learning-api";
import { studentCookieNames } from "@/lib/student-session";

export type EnrolmentActionState = {
  status: "idle" | "success" | "error" | "existing";
  message: string;
};

export async function requestEnrolmentAction(
  _previous: EnrolmentActionState,
  formData: FormData,
): Promise<EnrolmentActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  if (!uuidPattern.test(courseId)) {
    return { status: "error", message: "Invalid course selection." };
  }

  const token = (await cookies()).get(studentCookieNames.access)?.value;
  const identity = token ? await getStudentIdentity(token) : null;
  if (!token || !identity) {
    return { status: "error", message: "Please sign in to your RISA account." };
  }

  const [course, enrolled, existing] = await Promise.all([
    getRisaCourseById(token, courseId),
    getEnrolledCourses(token, identity.id),
    getCourseEnrolmentRequest(token, courseId, identity.id),
  ]);
  if (!course?.is_published || enrolled === null || existing === undefined) {
    return { status: "error", message: "Enrolment requests are temporarily unavailable." };
  }
  if (enrolled.some((item) => item.id === courseId)) {
    return { status: "existing", message: "You are already enrolled in this course." };
  }
  if (existing) {
    return {
      status: "existing",
      message:
        existing.status === "pending"
          ? "Your enrolment request is awaiting RISA approval."
          : "Your previous request has been reviewed. Contact RISA if you need assistance.",
    };
  }

  const outcome = await submitCourseEnrolmentRequest(
    token,
    courseId,
    identity.id,
    identity.email,
  );
  if (outcome !== "created") {
    return {
      status: "error",
      message:
        outcome === "duplicate"
          ? "An enrolment request already exists for this course."
          : "Could not submit your request. Please try again.",
    };
  }

  revalidatePath("/students/courses/" + courseId);
  revalidatePath("/admin/enrolment-requests");
  return {
    status: "success",
    message: "Your enrolment request was submitted. RISA will review it.",
  };
}
