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
  return (
    <>
      {courses === null ? (
        <div
          role="status"
          className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900"
        >
          Your course list is temporarily unavailable. Please try again later.
        </div>
      ) : courses.length === 0 ? (
        <div className="risa-science-glass mt-7 rounded-[1.6rem] p-7 sm:p-9">
          <h3 className="font-heading text-xl font-bold text-slate-950">
            No enrolled courses yet
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            When RISA enrols you in a published course, it will appear here. You can
            preview the published courses in our catalogue and request enrolment in the
            meantime.
          </p>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="risa-glass-card flex flex-col rounded-[1.6rem] p-6 sm:p-8"
            >
              <span className="w-fit rounded-full bg-[#eefce5] px-3 py-1 text-xs font-bold text-[#286518]">
                {course.status === "completed" ? "Completed" : "Enrolled"}
              </span>
              <h3 className="mt-5 font-heading text-xl font-bold text-slate-950">
                {course.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                {course.description}
              </p>
              <Link
                href={"/students/courses/" + course.id}
                className="mt-6 inline-flex min-h-10 items-center text-sm font-bold text-[#155DFC] hover:underline"
              >
                Open lessons and quizzes <span aria-hidden="true"> →</span>
              </Link>
              <Link
                href="#course-materials"
                className="mt-6 inline-flex min-h-10 items-center text-sm font-bold text-[#155DFC] hover:underline"
              >
                View course materials <span aria-hidden="true"> →</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function CourseMaterialsContent({
  courses,
  materials,
}: {
  courses: EnrolledCourse[] | null;
  materials: CourseMaterial[] | null;
}) {
  return (
    <>
      {materials === null ? (
        <p
          role="status"
          className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
        >
          Course materials are temporarily unavailable.
        </p>
      ) : materials.length === 0 ? (
        <div className="risa-science-glass mt-6 rounded-[1.6rem] p-6 text-sm leading-7 text-slate-600">
          No course materials or exercises have been shared with your account yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {materials.map((material) => (
            <article key={material.id} className="risa-glass-card rounded-[1.4rem] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#286518]">
                  {material.kind === "exercise" ? "Exercise" : "Learning material"}
                </span>
                <span className="text-xs text-slate-500">
                  {courses?.find((course) => course.id === material.courseId)?.title}
                </span>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-slate-950">
                {material.title}
              </h3>
              {material.description && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {material.description}
                </p>
              )}
              <a
                href={"/students/materials/" + material.id}
                className="mt-5 inline-flex min-h-10 items-center text-sm font-bold text-[#155DFC] hover:underline"
              >
                Download file <span aria-hidden="true"> ↓</span>
              </a>
            </article>
          ))}
        </div>
      )}
    </>
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

  // Only trust the identity returned by Supabase, never a cookie or editable claim.
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

  // Both lookups use this learner's JWT and Supabase row-level security.
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
      className="relative mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 sm:py-14 lg:py-16"
    >
      <section
        aria-labelledby="welcome-heading"
        className="risa-science-glass relative isolate overflow-hidden rounded-[2rem] p-6 sm:p-9 lg:p-11"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#78eb29]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-[#38b6ff]/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Link
              href="/students/profile"
              aria-label="Edit your learner profile"
              className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-white bg-gradient-to-br from-[#38b6ff] via-[#155DFC] to-[#123e8a] font-heading text-3xl font-bold text-white shadow-lg focus-visible:outline-2 focus-visible:outline-[#286518] sm:size-24"
            >
              {user.avatarPath ? (
                <Image
                  src={
                    "/students/avatar?updated=" + encodeURIComponent(user.updatedAt ?? "")
                  }
                  alt="Your profile picture"
                  width={96}
                  height={96}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
            </Link>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#286518]">
                RISA student portal / My Learning
              </p>
              <h1
                id="welcome-heading"
                className="mt-3 font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
              >
                Hi, {firstName}!
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                Welcome to your learning space. Discover the science, skills and practical
                experiences RISA is developing.
              </p>
            </div>
          </div>
          <form action={signOutStudent} className="shrink-0">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white bg-white/80 px-5 py-2 text-sm font-semibold text-[#286518] shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286518]"
            >
              Sign out
            </button>
          </form>
        </div>
        <div className="relative mt-7 flex flex-wrap items-center gap-3 border-t border-white/80 pt-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#78eb29]/40 bg-[#eefce5] px-4 py-2 text-xs font-bold text-[#286518]">
            <span aria-hidden="true" className="size-2 rounded-full bg-[#286518]" />
            Student account active
          </span>
          <span className="text-sm text-slate-600">
            Browse published courses and request enrolment. RISA reviews requests before
            granting access to full course content.
          </span>
        </div>
      </section>

      <section aria-labelledby="enrolled-heading" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#286518]">
              Your learning
            </p>
            <h2
              id="enrolled-heading"
              className="mt-2 font-heading text-2xl font-bold text-slate-950 sm:text-3xl"
            >
              Courses you&apos;re enrolled in
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              View courses assigned to your account by RISA and access the learning
              materials available to you.
            </p>
          </div>
          <Link
            href="/students/profile"
            className="inline-flex min-h-11 items-center rounded-xl border border-[#78eb29]/50 bg-[#eefce5] px-5 py-2 text-sm font-bold text-[#286518] hover:bg-white"
          >
            Edit my profile
          </Link>
        </div>
        <EnrolledCoursesContent courses={courses} />
      </section>

      <section
        id="course-materials"
        aria-labelledby="materials-heading"
        className="mt-12 scroll-mt-24"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#286518]">
          Study resources
        </p>
        <h2
          id="materials-heading"
          className="mt-2 font-heading text-2xl font-bold text-slate-950 sm:text-3xl"
        >
          Course content &amp; exercises
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Download resources and exercises shared with your enrolled courses. Content is
          accessible only to authorized learners.
        </p>
        <CourseMaterialsContent courses={courses} materials={materials} />
      </section>

      <section aria-labelledby="learning-heading" className="mt-12">
        <div className="risa-science-glass rounded-[1.7rem] p-7 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#286518]">
            Explore RISA courses
          </p>
          <h2
            id="learning-heading"
            className="mt-3 font-heading text-2xl font-bold text-slate-950 sm:text-3xl"
          >
            Preview courses before enrolling
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Your account lets you browse published topics and blurred video thumbnails.
            Select a locked lesson to submit an enrolment request to RISA.
          </p>
          <Link
            href="/programmes"
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#1d4f11]"
          >
            Browse courses and previews →
          </Link>
        </div>
      </section>

      <section
        aria-label="Your account and helpful links"
        className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
      >
        <article className="risa-science-glass rounded-[1.6rem] p-6 sm:p-8">
          <h2 className="font-heading text-xl font-bold text-slate-950">Your account</h2>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Registered email
              </p>
              <p className="mt-2 break-all text-sm font-medium text-slate-800">
                {user.email}
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-full bg-[#eefce5] px-3 py-1 text-xs font-bold text-[#286518]">
              Active
            </span>
          </div>
          <p className="mt-5 border-t border-white/90 pt-5 text-xs leading-6 text-slate-500">
            A RISA account provides portal access only. It does not confirm enrolment in
            any programme.
          </p>
        </article>

        <article className="risa-glass-card rounded-[1.6rem] p-6 sm:p-8">
          <h2 className="font-heading text-xl font-bold text-slate-950">Quick links</h2>
          <Link
            href="/students/profile"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4f11]"
          >
            Edit profile &amp; picture
          </Link>
          <div className="mt-5 grid gap-2">
            <Link
              href="/about"
              className="rounded-xl bg-white/75 px-4 py-3 text-sm font-semibold text-[#204472] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-[#155DFC]"
            >
              About RISA <span aria-hidden="true">↗</span>
            </Link>
            <Link
              href="/students/privacy"
              className="rounded-xl bg-white/75 px-4 py-3 text-sm font-semibold text-[#204472] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-[#155DFC]"
            >
              Student privacy notice <span aria-hidden="true">↗</span>
            </Link>
            <Link
              href="/contact"
              className="rounded-xl bg-white/75 px-4 py-3 text-sm font-semibold text-[#204472] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-[#155DFC]"
            >
              Contact RISA <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
