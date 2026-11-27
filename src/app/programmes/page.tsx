import type { Metadata } from "next";
import Link from "next/link";

import { RisaProgrammeCards } from "@/components/risa-programme-cards";
import { getPublicRisaCourses } from "@/lib/risa-course-admin";
import { getRisaProgrammes } from "@/lib/risa-programmes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses | RISA",
  description: "Browse published RISA courses by code and academic level.",
};

export default async function ProgrammesPage() {
  const [courses, modules] = await Promise.all([
    getRisaProgrammes(),
    getPublicRisaCourses(),
  ]);

  return (
    <main id="main-content" className="risa-pathways-section flex-1">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="relative isolate overflow-hidden rounded-[1.75rem] border border-[#d8e9e2] bg-gradient-to-br from-white via-[#f3faff] to-[#eaf6ed] px-6 py-9 shadow-[0_12px_38px_rgba(27,78,91,0.06)] sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full border-[42px] border-[#155DFC]/[0.06]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 right-12 size-56 rounded-full bg-[#78eb29]/10 blur-3xl"
          />
          <div className="relative max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#286518]">
              RISA / Course catalogue
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#0a2035] sm:text-5xl">
              Available courses
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Discover applied science programmes and find a course that matches your
              learning goals. Open a course to explore its individual modules.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#bedaca] bg-white/80 px-4 py-2 text-xs font-bold text-[#286518]">
                Published RISA courses
              </span>
              <span className="rounded-full border border-[#cdddf3] bg-white/80 px-4 py-2 text-xs font-bold text-[#155DFC]">
                Topic previews for registered learners
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#dce8e6] bg-white p-6">
          <h2 className="text-xl font-bold">Applied Physics career pathways</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Explore 12 proposed specialisations and their shared curriculum.
          </p>
          <Link
            href="/programmes/physics/pathways"
            className="mt-4 inline-flex font-bold text-[#286518] hover:underline"
          >
            Explore Applied Physics pathways →
          </Link>
        </div>

        {courses === null || modules === null ? (
          <p
            role="status"
            className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900"
          >
            Course information is temporarily unavailable. Please try again later.
          </p>
        ) : courses.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[#dce8e6] bg-white p-8 text-slate-600 shadow-sm">
            <h2 className="text-lg font-bold text-[#0a2035]">Courses coming soon</h2>
            <p className="mt-2 leading-7">
              No published courses are available yet. Please check back when RISA
              publishes its next programmes.
            </p>
          </div>
        ) : (
          <RisaProgrammeCards programmes={courses} modules={modules} />
        )}

        <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-[#dce8e6] bg-white/80 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <h2 className="text-lg font-bold text-[#0a2035]">
              Ready to explore a course?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Create an account or sign in to preview published topics and blurred video
              thumbnails. Full lessons, quizzes and study resources are available only
              after RISA approves your enrolment.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/students/login"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#cbded3] bg-white px-5 py-2 text-sm font-bold text-[#286518] transition hover:bg-[#eefce5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
            >
              Sign in
            </Link>
            <Link
              href="/students/register"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
