"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getStudentIdentity, type StudentIdentity } from "@/lib/student-auth-api";
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

function error(message: string): EnrolmentActionState {
  return { status: "error", message };
}

async function verifiedLearner(): Promise<{
  token: string;
  identity: StudentIdentity;
} | null> {
  const token = (await cookies()).get(studentCookieNames.access)?.value;
  const identity = token ? await getStudentIdentity(token) : null;
  return token && identity ? { token, identity } : null;
}

async function existingAccessState(
  token: string,
  courseId: string,
  studentId: string,
): Promise<EnrolmentActionState | null> {
  const [course, enrolled, existing] = await Promise.all([
    getRisaCourseById(token, courseId),
    getEnrolledCourses(token, studentId),
    getCourseEnrolmentRequest(token, courseId, studentId),
  ]);
  if (!course?.is_published || enrolled === null || existing === undefined) {
    return error("Enrolment requests are temporarily unavailable.");
  }
  if (enrolled.some((item) => item.id === courseId)) {
    return { status: "existing", message: "You are already enrolled in this course." };
  }
  if (existing?.status === "pending") {
    return { status: "existing", message: "Your enrolment request is awaiting RISA approval." };
  }
  if (existing) {
    return {
      status: "existing",
      message: "Your previous request has been reviewed. Contact RISA if you need assistance.",
    };
  }
  return null;
}

async function saveNewRequest(
  token: string,
  identity: StudentIdentity,
  courseId: string,
): Promise<EnrolmentActionState> {
  const outcome = await submitCourseEnrolmentRequest(token, {
    courseId,
    studentId: identity.id,
    email: identity.email,
  });
  if (outcome === "duplicate") {
    return error("An enrolment request already exists for this course.");
  }
  if (outcome !== "created") {
    return error("Could not submit your request. Please try again.");
  }
  revalidatePath("/students/courses/" + courseId);
  revalidatePath("/admin/enrolment-requests");
  return {
    status: "success",
    message: "Your enrolment request was submitted. RISA will review it.",
  };
}

export async function requestEnrolmentAction(
  _previous: EnrolmentActionState,
  formData: FormData,
): Promise<EnrolmentActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  if (!uuidPattern.test(courseId)) {
    return error("Invalid course selection.");
  }
  const learner = await verifiedLearner();
  if (!learner) {
    return error("Please sign in to your RISA account.");
  }
  const existing = await existingAccessState(
    learner.token,
    courseId,
    learner.identity.id,
  );
  return existing ?? saveNewRequest(learner.token, learner.identity, courseId);
}
