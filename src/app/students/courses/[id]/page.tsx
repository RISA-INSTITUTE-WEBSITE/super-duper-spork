import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { LockedCoursePreview } from "@/components/locked-course-preview";
import { CourseBanner } from "@/components/risa-course-banner";
import { StudentCourseContent } from "@/components/student-course-content";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import { getRisaCourseById } from "@/lib/risa-course-admin";
import {
  getCourseCurriculum,
  getCoursePreviewCurriculum,
  uuidPattern,
  type CourseCurriculum,
} from "@/lib/risa-course-curriculum";
import { getCourseEnrolmentRequest } from "@/lib/risa-course-enrolment";
import { getEnrolledCourses } from "@/lib/student-learning-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Course preview & lessons | RISA",
  robots: { index: false, follow: false },
};

async function verifiedLearnerSession() {
  if (!isStudentAuthConfigured()) {
    redirect("/students/login");
  }
  const token = (await cookies()).get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const identity = await getStudentIdentity(token);
  if (!identity) {
    redirect("/students/login");
  }
  return { token, identity };
}

function CourseAlert({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-9 rounded-xl bg-amber-50 p-5 text-sm text-amber-900">
      {message}
    </p>
  );
}

function EnrolledTopics({ curriculum }: { curriculum: CourseCurriculum | null }) {
  if (!curriculum) {
    return (
      <CourseAlert message="Course content is currently unavailable. Please try again." />
    );
  }
  if (curriculum.topics.length === 0) {
    return (
      <div className="risa-glass-card mt-9 rounded-[1.5rem] p-7">
        <h2 className="font-heading text-xl font-bold text-slate-950">
          Lessons are coming soon
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          RISA has not yet published topics for this course.
        </p>
      </div>
    );
  }
  return <StudentCourseContent curriculum={curriculum} />;
}

async function CourseAccess({
  token,
  courseId,
  studentId,
  courseName,
  isEnrolled,
  isVerified,
}: {
  token: string;
  courseId: string;
  studentId: string;
  courseName: string;
  isEnrolled: boolean;
  isVerified: boolean;
}) {
  if (!isVerified) {
    return (
      <CourseAlert message="Your enrolment status is temporarily unavailable. Course access cannot be verified." />
    );
  }
  if (isEnrolled) {
    const curriculum = await getCourseCurriculum(token, courseId);
    return <EnrolledTopics curriculum={curriculum} />;
  }

  const [preview, request] = await Promise.all([
    getCoursePreviewCurriculum(token, courseId),
    getCourseEnrolmentRequest(token, courseId, studentId),
  ]);
  if (!preview || request === undefined) {
    return (
      <CourseAlert message="The course preview is temporarily unavailable. Please try again." />
    );
  }
  return (
    <LockedCoursePreview
      courseId={courseId}
      courseName={courseName}
      curriculum={preview}
      requestStatus={request?.status ?? null}
    />
  );
}

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!uuidPattern.test(id)) {
    notFound();
  }
  const { token, identity } = await verifiedLearnerSession();
  const [enrolled, course] = await Promise.all([
    getEnrolledCourses(token, identity.id),
    getRisaCourseById(token, id),
  ]);
  if (!course) {
    notFound();
  }
  const isEnrolled = enrolled?.some((item) => item.id === id) ?? false;
  if (!isEnrolled && !course.is_published) {
    notFound();
  }

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 lg:py-16"
    >
      <CourseBanner course={course} isEnrolled={isEnrolled} />
      <CourseAccess
        token={token}
        courseId={id}
        studentId={identity.id}
        courseName={course.title}
        isEnrolled={isEnrolled}
        isVerified={enrolled !== null}
      />
    </main>
  );
}
