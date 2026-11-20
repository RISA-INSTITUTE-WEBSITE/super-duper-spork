import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublicRisaCourses, risaThumbnailUrl } from "@/lib/risa-course-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses | RISA",
  description: "Browse published RISA courses by code and academic level.",
};

export default async function ProgrammesPage() {
  const courses = await getPublicRisaCourses();

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-7xl flex-1 px-5 py-14 sm:px-8"
    >
      <p className="font-semibold uppercase tracking-widest text-blue-800">
        RISA / Course catalogue
      </p>
      <h1 className="mt-3 text-4xl font-bold text-slate-950">Available courses</h1>
      <p className="mt-5 max-w-3xl leading-relaxed text-slate-600">
        Explore the courses published by RISA administration. Sign in to preview published
        course topics and blurred video thumbnails. RISA enrolment approval unlocks the
        full lessons, quizzes and study resources.
      </p>

      {courses === null ? (
        <p
          role="status"
          className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900"
        >
          Course information is temporarily unavailable. Please try again later.
        </p>
      ) : courses.length === 0 ? (
        <p className="risa-glass-card mt-10 rounded-2xl p-7 text-slate-600">
          No published courses are available yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const thumbnailUrl = risaThumbnailUrl(course.thumbnail_path);
            return (
              <article
                key={course.id}
                id={course.slug}
                className="risa-pathway-card scroll-mt-24 overflow-hidden rounded-[1.6rem]"
              >
                <div className="relative aspect-video bg-gradient-to-br from-[#dbeafe] via-[#f0f9ff] to-[#eefce5]">
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={course.title + " course thumbnail"}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <span className="font-mono text-3xl font-black text-[#155DFC]/35">
                        {course.code}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 sm:p-7">
                  <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-[#286518]">
                    {course.level}
                  </span>
                  <h2 className="mt-5 text-xl font-bold text-slate-950">
                    <span className="font-mono text-[#286518]">{course.code}</span>
                    {" — "}
                    {course.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {course.description || "Course details will be added by RISA."}
                  </p>
                  <Link
                    href={"/students/courses/" + course.id}
                    className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-[#286518]"
                  >
                    Preview course topics <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
