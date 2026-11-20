import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LockedCoursePreview } from "@/components/locked-course-preview";
import { StudentCourseContent } from "@/components/student-course-content";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import {
  getCourseCurriculum,
  getCoursePreviewCurriculum,
  uuidPattern,
} from "@/lib/risa-course-curriculum";
import { getRisaCourseById } from "@/lib/risa-course-admin";
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
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const identity = await getStudentIdentity(token);
  if (!identity) {
    redirect("/students/login");
  }
  return { token, identity };
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
  const enrolled = await getEnrolledCourses(token, identity.id);
  const course = await getRisaCourseById(token, id);
  if (!course) {
    notFound();
  }

  const isEnrolled = enrolled?.some((item) => item.id === id) ?? false;
  if (!isEnrolled && !course.is_published) {
    notFound();
  }

  const [curriculum, preview, request] = await Promise.all([
    isEnrolled ? getCourseCurriculum(token, id) : Promise.resolve(null),
    isEnrolled ? Promise.resolve(null) : getCoursePreviewCurriculum(token, id),
    isEnrolled
      ? Promise.resolve(null)
      : getCourseEnrolmentRequest(token, id, identity.id),
  ]);

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 lg:py-16"
    >
      <Link
        href={isEnrolled ? "/students/dashboard" : "/programmes"}
        className="text-sm font-semibold text-[#286518] hover:underline"
      >
        {isEnrolled ? "← Back to My Learning" : "← All available courses"}
      </Link>
      <header className="risa-science-glass mt-6 rounded-[2rem] p-7 sm:p-10">
        <span className="rounded-lg bg-[#eefce5] px-3 py-1 font-mono text-sm font-bold text-[#286518]">
          {course.code}
        </span>
        <h1 className="mt-5 font-heading text-3xl font-bold text-slate-950 sm:text-4xl">
          {course.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          {course.description || "Discover the RISA curriculum."}
        </p>
        <p className="mt-4 text-xs font-semibold text-[#286518]">
          {course.level} ·{" "}
          {isEnrolled
            ? "Enrolled learner · Full course access"
            : "Registered learner · Preview only"}
        </p>
      </header>

      {enrolled === null ? (
        <p role="alert" className="mt-9 rounded-xl bg-amber-50 p-5 text-sm text-amber-900">
          Your enrolment status is temporarily unavailable. Course access cannot be verified.
        </p>
      ) : isEnrolled ? (
        <div className="mt-9 space-y-6">
          {!curriculum ? (
            <p role="alert" className="rounded-xl bg-amber-50 p-5 text-sm text-amber-900">
              Course content is currently unavailable. Please try again.
            </p>
          ) : curriculum.topics.length === 0 ? (
            <div className="risa-glass-card rounded-[1.5rem] p-7">
              <h2 className="font-heading text-xl font-bold text-slate-950">
                Lessons are coming soon
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                RISA has not yet published topics for this course.
              </p>
            </div>
          ) : (
            <StudentCourseContent curriculum={curriculum} />
          )}
        </div>
      ) : !preview || request === undefined ? (
        <p role="alert" className="mt-9 rounded-xl bg-amber-50 p-5 text-sm text-amber-900">
          The course preview is temporarily unavailable. Please try again.
        </p>
      ) : (
        <LockedCoursePreview
          courseId={id}
          courseName={course.title}
          curriculum={preview}
          requestStatus={request?.status ?? null}
        />
      )}
    </main>
  );
}
