import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { LockedCoursePreview } from "@/components/locked-course-preview";
import { RisaCourseBreadcrumb } from "@/components/risa-course-breadcrumb";
import { StudentCourseContent } from "@/components/student-course-content";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import { getRisaCourseById, type RisaCourse } from "@/lib/risa-course-admin";
import {
  getCourseCurriculum,
  getCoursePreviewCurriculum,
  uuidPattern,
  type CourseCurriculum,
} from "@/lib/risa-course-curriculum";
import { getCourseEnrolmentRequest } from "@/lib/risa-course-enrolment";
import { getLearnerLessonCompletions } from "@/lib/risa-lesson-progress";
import { getEnrolledCourses } from "@/lib/student-learning-api";
import { studentCookieNames } from "@/lib/student-session";

// Load Lexend only for RISA module headings; keep site-wide typography unchanged.
const moduleHeadingFont = Lexend({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

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

function EnrolledTopics({
  curriculum,
  course,
  completedVideoIds,
}: {
  curriculum: CourseCurriculum | null;
  course: RisaCourse;
  completedVideoIds: string[] | null;
}) {
  if (!curriculum) {
    return (
      <>
        <CourseIntroduction course={course} isEnrolled />
        <CourseAlert message="Course content is currently unavailable. Please try again." />
      </>
    );
  }
  if (curriculum.topics.length === 0) {
    return (
      <>
        <CourseIntroduction course={course} isEnrolled />
        <div className="risa-glass-card mt-9 rounded-[1.5rem] p-7">
          <h2 className="font-heading text-xl font-bold text-slate-950">
            Lessons are coming soon
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            RISA has not yet published topics for this course.
          </p>
        </div>
      </>
    );
  }
  return (
    <StudentCourseContent
      curriculum={curriculum}
      courseId={course.id}
      courseName={course.title}
      initialCompletedVideoIds={completedVideoIds}
      courseBanner={<CourseBanner course={course} isEnrolled />}
    />
  );
}

async function CourseAccess({
  token,
  course,
  studentId,
  isEnrolled,
  isVerified,
}: {
  token: string;
  course: RisaCourse;
  studentId: string;
  isEnrolled: boolean;
  isVerified: boolean;
}) {
  if (!isVerified) {
    return (
      <>
        <CourseIntroduction course={course} isEnrolled={isEnrolled} />
        <CourseAlert message="Your enrolment status is temporarily unavailable. Course access cannot be verified." />
      </>
    );
  }
  if (isEnrolled) {
    const curriculum = await getCourseCurriculum(token, course.id);
    const completedVideoIds = curriculum
      ? await getLearnerLessonCompletions(
          token,
          studentId,
          curriculum.videos.map((video) => video.id),
        )
      : null;
    return (
      <EnrolledTopics
        curriculum={curriculum}
        course={course}
        completedVideoIds={completedVideoIds}
      />
    );
  }

  const [preview, request] = await Promise.all([
    getCoursePreviewCurriculum(token, course.id),
    getCourseEnrolmentRequest(token, course.id, studentId),
  ]);
  if (!preview || request === undefined) {
    return (
      <>
        <CourseIntroduction course={course} isEnrolled={false} />
        <CourseAlert message="The course preview is temporarily unavailable. Please try again." />
      </>
    );
  }
  return (
    <>
      <CourseIntroduction course={course} isEnrolled={false} />
      <LockedCoursePreview
        courseId={course.id}
        courseName={course.title}
        curriculum={preview}
        requestStatus={request?.status ?? null}
      />
    </>
  );
}

function CourseBanner({
  course,
  isEnrolled,
}: {
  course: RisaCourse;
  isEnrolled: boolean;
}) {
  return (
    <header className="mt-5 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7 sm:py-6">
      <h1
        className={`${moduleHeadingFont.className} text-2xl font-bold leading-snug tracking-tight text-slate-950 sm:text-3xl`}
      >
        {course.code} - {course.title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {course.description || "Discover the RISA curriculum."}
      </p>
      <p className="mt-3 text-xs font-semibold leading-5 text-[#286518]">
        {course.level} ·{" "}
        {isEnrolled
          ? "Enrolled learner · Full course access"
          : "Registered learner · Preview only"}
      </p>
    </header>
  );
}

/** The catalogue and unavailable/locked views show the course-level breadcrumb. */
function CourseIntroduction({
  course,
  isEnrolled,
}: {
  course: RisaCourse;
  isEnrolled: boolean;
}) {
  return (
    <>
      <RisaCourseBreadcrumb items={[{ label: course.title }]} />
      <CourseBanner course={course} isEnrolled={isEnrolled} />
    </>
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
      <CourseAccess
        token={token}
        course={course}
        studentId={identity.id}
        isEnrolled={isEnrolled}
        isVerified={enrolled !== null}
      />
    </main>
  );
}
