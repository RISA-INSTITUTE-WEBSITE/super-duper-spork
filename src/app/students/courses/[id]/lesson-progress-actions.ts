"use server";

import { cookies } from "next/headers";

import { getStudentIdentity } from "@/lib/student-auth-api";
import {
  getCourseCurriculum,
  uuidPattern,
  type CourseCurriculum,
} from "@/lib/risa-course-curriculum";
import {
  getLearnerLessonCompletions,
  saveLearnerLessonCompletion,
} from "@/lib/risa-lesson-progress";
import { getEnrolledCourses, type EnrolledCourse } from "@/lib/student-learning-api";
import { studentCookieNames } from "@/lib/student-session";

export type LessonProgressActionResult =
  | { status: "success"; completedVideoIds: string[] }
  | { status: "error"; message: string };

function unavailable(): LessonProgressActionResult {
  return {
    status: "error",
    message: "Unable to save lesson progress. Please try again.",
  };
}

function validLessonActionInput(
  courseId: string,
  videoId: string,
  completed: boolean,
): boolean {
  return (
    uuidPattern.test(courseId) &&
    uuidPattern.test(videoId) &&
    typeof completed === "boolean"
  );
}

function learnerCanComplete(
  enrolled: EnrolledCourse[] | null,
  curriculum: CourseCurriculum | null,
  { courseId, videoId }: { courseId: string; videoId: string },
): boolean {
  return (
    enrolled?.some((course) => course.id === courseId) === true &&
    curriculum?.videos.some((video) => video.id === videoId) === true
  );
}

/** Revalidates login, enrollment and lesson ownership; RLS checks again. */
export async function setLessonCompletedAction(
  courseId: string,
  videoId: string,
  completed: boolean,
): Promise<LessonProgressActionResult> {
  if (!validLessonActionInput(courseId, videoId, completed)) {
    return { status: "error", message: "Invalid lesson selection." };
  }

  const token = (await cookies()).get(studentCookieNames.access)?.value;
  const identity = token ? await getStudentIdentity(token) : null;
  if (!token || !identity) {
    return { status: "error", message: "Please sign in to save lesson progress." };
  }

  const [enrolled, curriculum] = await Promise.all([
    getEnrolledCourses(token, identity.id),
    getCourseCurriculum(token, courseId),
  ]);
  if (!curriculum || !learnerCanComplete(enrolled, curriculum, { courseId, videoId })) {
    return {
      status: "error",
      message: "This lesson is not available in your enrolment.",
    };
  }

  const saved = await saveLearnerLessonCompletion(token, {
    studentId: identity.id,
    videoId,
    completed,
  });
  if (!saved) {
    return unavailable();
  }
  const completedVideoIds = await getLearnerLessonCompletions(
    token,
    identity.id,
    curriculum.videos.map((video) => video.id),
  );

  return completedVideoIds ? { status: "success", completedVideoIds } : unavailable();
}
