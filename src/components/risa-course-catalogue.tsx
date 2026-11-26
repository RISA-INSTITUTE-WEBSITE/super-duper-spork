"use client";

import { useMemo, useState } from "react";

import { RisaAcademyCourseCard } from "@/components/risa-academy-course-card";
import { filterCourseCatalogue, type CatalogueCourse } from "@/lib/risa-course-catalogue";

export function RisaCourseCatalogue({ courses }: { courses: CatalogueCourse[] }) {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const levels = useMemo(
    () => [...new Set(courses.map((course) => course.level))].sort(),
    [courses],
  );
  const visibleCourses = useMemo(
    () => filterCourseCatalogue(courses, search, level),
    [courses, search, level],
  );

  return (
    <section aria-label="Browse published RISA courses" className="mt-10">
      <div className="rounded-[1.35rem] border border-[#e0eae5] bg-white/90 p-4 shadow-[0_6px_24px_rgba(17,63,80,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="risa-course-search"
              className="mb-2 block text-sm font-bold text-[#16382f]"
            >
              Search courses
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>
              <input
                id="risa-course-search"
                type="search"
                maxLength={120}
                autoComplete="off"
                placeholder="Search by course name or code..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-[#d7e4e0] bg-[#f8fbfa] py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus-visible:border-[#286518] focus-visible:ring-2 focus-visible:ring-[#286518]/15"
              />
            </div>
          </div>
          <div className="w-full lg:w-64">
            <label
              htmlFor="risa-course-level"
              className="mb-2 block text-sm font-bold text-[#16382f]"
            >
              Academic level
            </label>
            <select
              id="risa-course-level"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-[#d7e4e0] bg-[#f8fbfa] px-4 py-3 text-sm text-slate-800 outline-none focus-visible:border-[#286518] focus-visible:ring-2 focus-visible:ring-[#286518]/15"
            >
              <option value="all">All levels</option>
              {levels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p
          role="status"
          aria-live="polite"
          className="text-sm font-semibold text-[#234a40]"
        >
          Showing {visibleCourses.length} of {courses.length} published{" "}
          {courses.length === 1 ? "course" : "courses"}
        </p>
        {(search || level !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setLevel("all");
            }}
            className="min-h-10 rounded-lg px-3 text-sm font-bold text-[#286518] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#155DFC]"
          >
            Clear filters
          </button>
        )}
      </div>

      {visibleCourses.length ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {visibleCourses.map((course) => (
            <RisaAcademyCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[#bad7ca] bg-white p-10 text-center">
          <h2 className="text-lg font-bold text-[#153d35]">No matching courses</h2>
          <p className="mt-2 text-sm text-slate-600">
            Try another keyword or academic level.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setLevel("all");
            }}
            className="mt-5 min-h-11 rounded-xl bg-[#286518] px-5 py-2 text-sm font-bold text-white hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
          >
            Show all courses
          </button>
        </div>
      )}
    </section>
  );
}
