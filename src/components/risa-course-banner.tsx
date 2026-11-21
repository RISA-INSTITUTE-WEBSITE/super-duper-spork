import Link from "next/link";

import type { RisaCourse } from "@/lib/risa-course-admin";

/** Shared heading for enrolled learners and registered course previews. */
export function CourseBanner({
  course,
  isEnrolled,
}: {
  course: RisaCourse;
  isEnrolled: boolean;
}) {
  return (
    <>
      <Link
        href={isEnrolled ? "/students/dashboard" : "/programmes"}
        className="text-sm font-semibold text-[#286518] hover:underline"
      >
        {isEnrolled ? "← Back to My Learning" : "← All available courses"}
      </Link>
      <header className="mt-5 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7 sm:py-6">
        <h1 className="font-heading text-2xl font-bold leading-snug tracking-tight text-slate-950 sm:text-3xl">
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
    </>
  );
}
