import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutStudent } from "@/app/students/actions";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import {
  getCourseMaterials,
  getEnrolledCourses,
  type CourseMaterial,
  type EnrolledCourse,
} from "@/lib/student-learning-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Learning",
  description: "Your private RISA learning space.",
  robots: { index: false, follow: false },
};

function EnrolledCoursesContent({ courses }: { courses: EnrolledCourse[] | null }) {
  if (courses === null) {
    return (
      <p role="status" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Courses are temporarily unavailable.
      </p>
    );
  }

  if (courses.length === 0) {
    return (
      <p className="risa-science-glass mt-5 rounded-[1.5rem] p-6 text-sm text-slate-600">
        No enrolled courses yet. Browse courses to get started.
      </p>
    );
  }

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <article
          key={course.id}
          className="risa-glass-card flex min-h-48 flex-col rounded-[1.5rem] p-6"
        >
          <span className="w-fit rounded-full bg-[#eefce5] px-3 py-1 text-xs font-bold text-[#286518]">
            {course.status === "completed" ? "Completed" : "Enrolled"}
          </span>
          <h3 className="mt-4 font-heading text-lg font-bold text-slate-950">
            {course.title}
          </h3>
          {course.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {course.description}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-5">
            <Link
              href={"/students/courses/" + course.id}
              className="inline-flex min-h-10 items-center text-sm font-bold text-[#286518] hover:underline"
            >
              Open course <span aria-hidden="true" className="ml-1">→</span>
            </Link>
            <Link
              href="#course-materials"
              className="inline-flex min-h-10 items-center text-sm font-semibold text-slate-600 hover:text-[#286518] hover:underline"
            >
              Files
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function CourseMaterialsContent({
  courses,
  materials,
}: {
  courses: EnrolledCourse[] | null;
  materials: CourseMaterial[] | null;
}) {
  if (materials === null) {
    return (
      <p role="status" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Study materials are temporarily unavailable.
      </p>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="risa-science-glass mt-5 rounded-[1.5rem] p-6 text-sm text-slate-600">
        No study materials available yet.
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {materials.map((material) => (
        <article
          key={material.id}
          className="risa-glass-card flex items-center justify-between gap-4 rounded-[1.25rem] p-5"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#286518]">
              {material.kind === "exercise" ? "Exercise" : "Study note"}
              {courses?.find((course) => course.id === material.courseId)?.title &&
                " · " + courses.find((course) => course.id === material.courseId)?.title}
            </p>
            <h3 className="mt-1 break-words font-heading text-base font-bold text-slate-950">
              {material.title}
            </h3>
          </div>
          <a
            href={"/students/materials/" + material.id}
            aria-label={"Download " + material.title}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-[#78eb29]/50 bg-[#eefce5] px-4 text-sm font-bold text-[#286518] transition hover:bg-white"
          >
            Download <span aria-hidden="true" className="ml-1">↓</span>
          </a>
        </article>
      ))}
    </div>
  );
}

export default async function StudentDashboardPage() {
  if (!isStudentAuthConfigured()) {
    redirect("/students/login");
  }

  const jar = await cookies();
  const accessToken = jar.get(studentCookieNames.access)?.value;
  if (!accessToken) {
    redirect("/students/login");
  }

  // Trust only an identity verified by Supabase Auth.
  const user = await getStudentIdentity(accessToken);
  if (!user) {
    redirect("/students/login");
  }

  const nameParts = user.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Learner";
  const initials =
    nameParts
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "R";

  // Read enrolments and resources with the learner's JWT and row-level security.
  const courses = await getEnrolledCourses(accessToken, user.id);
  const materials = courses
    ? await getCourseMaterials(
        accessToken,
        courses.map((course) => course.id),
      )
    : null;

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 sm:py-10"
    >
      <section
        aria-labelledby="welcome-heading"
        className="risa-science-glass flex flex-wrap items-center justify-between gap-5 rounded-[1.75rem] p-6 sm:p-8"
      >
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/students/dashboard"
            aria-label="My Learning dashboard"
            className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-[#38b6ff] via-[#155DFC] to-[#123e8a] font-heading text-xl font-bold text-white shadow-md focus-visible:outline-2 focus-visible:outline-[#286518] sm:size-20"
          >
            {user.avatarPath ? (
              <Image
                src={"/students/avatar?updated=" + encodeURIComponent(user.updatedAt ?? "")}
                alt="Your profile picture"
                width={80}
                height={80}
                unoptimized
                className="size-full rounded-full object-cover"
              />
            ) : (
              <span aria-hidden="true">{initials}</span>
            )}
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#286518]">
              My Learning
            </p>
            <h1
              id="welcome-heading"
              className="mt-1 font-heading text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
            >
              Hi, {firstName}!
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {courses?.length ?? "—"} courses · {materials?.length ?? "—"} files
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/students/profile"
            className="inline-flex min-h-11 items-center rounded-full border border-[#78eb29]/40 bg-white/80 px-4 text-sm font-semibold text-[#286518] transition hover:bg-white"
          >
            Edit profile
          </Link>
          <form action={signOutStudent}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full border border-white bg-white/80 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>

      <section aria-labelledby="enrolled-heading" className="mt-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="enrolled-heading" className="font-heading text-xl font-bold text-slate-950 sm:text-2xl">
            My courses
          </h2>
          <Link
            href="/programmes"
            className="inline-flex min-h-11 items-center rounded-full bg-[#286518] px-5 text-sm font-bold text-white transition hover:bg-[#1d4f11]"
          >
            Browse courses <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
        <EnrolledCoursesContent courses={courses} />
      </section>

      <section
        id="course-materials"
        aria-labelledby="materials-heading"
        className="mt-9 scroll-mt-24"
      >
        <h2 id="materials-heading" className="font-heading text-xl font-bold text-slate-950 sm:text-2xl">
          Study materials
        </h2>
        <CourseMaterialsContent courses={courses} materials={materials} />
      </section>
    </main>
  );
}
