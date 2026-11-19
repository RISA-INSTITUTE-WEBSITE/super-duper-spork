import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminCreateCourseForm } from "@/components/admin-create-course-form";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import { getRisaAdminCourses, type RisaCourse } from "@/lib/risa-course-admin";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Courses | RISA Administration",
  description: "Authorized course creation and institution course codes.",
  robots: { index: false, follow: false },
};

function CourseList({ courses }: { courses: RisaCourse[] | null }) {
  if (!courses) {
    return (
      <p
        role="status"
        className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
      >
        Courses are currently unavailable. Please check the database connection.
      </p>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="risa-science-glass mt-6 rounded-[1.6rem] p-7">
        <h3 className="font-heading text-lg font-bold text-slate-950">
          No courses created yet
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create your first course using the form above. It will appear here with its
          unique course code.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <article
          key={course.id}
          className="risa-glass-card flex flex-col rounded-[1.6rem] p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-lg bg-[#eefce5] px-3 py-1 font-mono text-sm font-bold text-[#286518]">
              {course.code}
            </span>
            <span
              className={
                "rounded-full px-3 py-1 text-xs font-semibold " +
                (course.is_published
                  ? "bg-blue-100 text-blue-800"
                  : "bg-slate-100 text-slate-600")
              }
            >
              {course.is_published ? "Published" : "Draft"}
            </span>
          </div>
          <h3 className="mt-5 font-heading text-lg font-bold text-slate-950">
            {course.title}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
            {course.description || "Course overview not added yet."}
          </p>
          <Link
            href={"/admin/courses/" + course.id + "/content"}
            className="mt-6 inline-flex min-h-11 w-fit items-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4f11]"
          >
            Manage topics, videos &amp; quizzes →
          </Link>
          <p className="mt-5 border-t border-white pt-4 text-xs text-slate-500">
            {course.is_published
              ? "Visible to enrolled learners"
              : "Unpublished — hidden from learners"}
          </p>
        </article>
      ))}
    </div>
  );
}

export default async function ManageRisaCoursesPage() {
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
  if (!(await isRisaAdministrator(token, identity.id))) {
    notFound();
  }

  const courses = await getRisaAdminCourses(token);

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 lg:py-16"
    >
      <Link
        href="/admin"
        className="inline-flex min-h-10 items-center text-sm font-semibold text-[#286518] underline-offset-4 hover:underline"
      >
        ← Back to Administration Centre
      </Link>
      <div className="my-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#286518]">
          RISA / Administration / Curriculum
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-slate-950 sm:text-4xl">
          Course management
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Create courses with unique identifiers such as DVE101 and PHY-101. Keep drafts
          private while preparing content for learners.
        </p>
      </div>

      <AdminCreateCourseForm />

      <section aria-labelledby="created-courses-heading" className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="created-courses-heading"
              className="font-heading text-2xl font-bold text-slate-950"
            >
              Created courses
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Each course code is unique and stored in RISA&apos;s curriculum database.
            </p>
          </div>
          {courses && (
            <span className="rounded-full bg-[#eefce5] px-4 py-2 text-sm font-bold text-[#286518]">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </span>
          )}
        </div>
        <CourseList courses={courses} />
      </section>
    </main>
  );
}
