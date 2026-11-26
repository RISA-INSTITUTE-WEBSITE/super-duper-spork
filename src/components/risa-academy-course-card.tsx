import Image from "next/image";
import Link from "next/link";

import type { CatalogueCourse } from "@/lib/risa-course-catalogue";

export function RisaAcademyCourseCard({ course }: { course: CatalogueCourse }) {
  return (
    <article
      id={course.slug}
      className="group flex min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-[#dce8e6] bg-white shadow-[0_8px_28px_rgba(17,63,80,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[#96d2ba] hover:shadow-[0_15px_38px_rgba(17,63,80,0.12)] motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#deedf9] via-[#e8f5f4] to-[#d9eecf]">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title + " course thumbnail"}
            fill
            unoptimized
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none"
          />
        ) : (
          <div className="relative flex size-full items-center justify-center overflow-hidden">
            <span
              aria-hidden="true"
              className="absolute -right-8 -top-10 size-44 rounded-full border-[20px] border-white/45"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-16 -left-12 size-48 rounded-full border-[24px] border-[#155DFC]/10"
            />
            <span className="relative flex size-20 items-center justify-center rounded-2xl border border-white/80 bg-white/55 text-[#155DFC] shadow-sm backdrop-blur-sm">
              <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className="size-12">
                <ellipse
                  cx="32"
                  cy="32"
                  rx="26"
                  ry="10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  transform="rotate(-45 32 32)"
                />
                <ellipse
                  cx="32"
                  cy="32"
                  rx="26"
                  ry="10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  transform="rotate(45 32 32)"
                />
                <circle cx="32" cy="32" r="5" fill="#286518" />
              </svg>
            </span>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-lg border border-white/90 bg-white/90 px-3 py-1.5 font-mono text-xs font-bold text-[#286518] shadow-sm backdrop-blur-md">
          {course.code}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#eaf6ef] px-3 py-1 text-xs font-semibold text-[#286518]">
            {course.level}
          </span>
          <span className="text-xs font-medium text-slate-500">RISA course</span>
        </div>
        <h2 className="mt-4 text-xl font-bold leading-snug tracking-tight text-[#0a2035]">
          {course.code} - {course.title}
        </h2>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-slate-600">
          {course.description || "Explore this RISA course and its published topics."}
        </p>
        <div className="mt-5 border-t border-[#e5eeeb] pt-5">
          <Link
            href={"/students/courses/" + course.id}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#286518] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
          >
            Preview course topics
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
