import Image from "next/image";
import Link from "next/link";

import { HeroPhotoBackground } from "@/components/hero-photo-background";
import { RisaDomainModules } from "@/components/risa-domain-modules";
import { RisaChevronLink } from "@/components/risa-chevron-link";
import { RisaLatestUpdates } from "@/components/risa-latest-updates";
import { RisaProgrammeCards } from "@/components/risa-programme-cards";
import { getPublicRisaCourses } from "@/lib/risa-course-admin";
import { getRisaProgrammes } from "@/lib/risa-programmes";

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {diagonal ? <path d="M6 18 18 6M8 6h10v10" /> : <path d="M4 12h16m-7-7 7 7-7 7" />}
    </svg>
  );
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [courses, modules] = await Promise.all([
    getRisaProgrammes(),
    getPublicRisaCourses(),
  ]);

  return (
    <main id="main-content" className="flex-1">
      <section className="risa-hero relative isolate overflow-hidden text-[#0A0F1D]">
        <HeroPhotoBackground />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="risa-hero-content max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/95 bg-white/65 px-4 py-2 text-xs font-semibold tracking-wide text-[#34569E] shadow-sm backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#155DFC]" aria-hidden="true" />
              Our Slogan
            </span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[#5274C3]">
              RISA Institute of Applied Sciences
            </p>
            <h1 className="risa-display mt-5 max-w-3xl text-[3rem] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[4rem] lg:text-[4.8rem]">
              Where real learning starts
              <span className="mt-2 block text-[#155DFC]">with hands-on work.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#465d7b] sm:text-lg">
              Theory provides the foundation. Practical experience develops competence.
              Innovation transforms knowledge into impact.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/programmes"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#155DFC] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(21,93,252,0.2)] transition hover:bg-[#154cbe] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#155DFC]"
              >
                Explore courses
                <ArrowIcon />
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/90 bg-white/70 px-6 py-3 text-sm font-semibold text-[#204472] shadow-sm backdrop-blur-md transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#155DFC]"
              >
                Discover RISA
                <ArrowIcon diagonal />
              </Link>
            </div>
            <div className="mt-12 grid gap-5 border-t border-white/75 pt-7 text-sm text-[#516b8b] sm:grid-cols-3 sm:gap-6">
              <div>
                <span className="block font-bold text-[#143361]">Learn it.</span>
                Understand it.
              </div>
              <div>
                <span className="block font-bold text-[#143361]">Apply it.</span>Test it.
              </div>
              <div>
                <span className="block font-bold text-[#143361]">Improve it.</span>Make an
                impact.
              </div>
            </div>
          </div>
        </div>
      </section>

      <RisaLatestUpdates />

      <section
        aria-labelledby="courses-heading"
        className="risa-pathways-section py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2
            id="courses-heading"
            className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
          >
            Explore our courses
          </h2>

          <div className="mt-8 grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            {courses === null || modules === null ? (
              <p
                role="status"
                className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900"
              >
                The course catalogue is temporarily unavailable. Please try again shortly.
              </p>
            ) : courses.length === 0 ? (
              <p className="risa-glass-card rounded-2xl p-7 text-slate-600">
                No published courses yet. Courses will appear here once approved and
                published by RISA administration.
              </p>
            ) : (
              <RisaProgrammeCards
                programmes={courses.slice(0, 3)}
                modules={modules}
                showDescriptions={false}
                className="mt-0"
              />
            )}
            <div className="justify-self-end">
              <RisaChevronLink href="/programmes" label="More" />
            </div>
          </div>
        </div>
      </section>

      <RisaDomainModules programmes={courses} modules={modules} />

      <section
        aria-labelledby="next-heading"
        className="relative isolate overflow-hidden bg-white py-20 sm:py-24"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Image
            src="/images/risa-commitment-study.jpg"
            alt=""
            fill
            sizes="100vw"
            unoptimized
            className="object-cover object-center opacity-25"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-44 right-16 size-80 rounded-full bg-blue-400/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#286518]">
                The RISA commitment
              </p>
              <h2
                id="next-heading"
                className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
              >
                Theory into practice. Knowledge into impact.
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                Discover RISA&apos;s approach to practical scientific education, or
                contact the team to learn more.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#286518] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286518]"
                >
                  About the institute
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/85 px-6 py-3 text-sm font-semibold text-[#286518] transition hover:border-[#286518] hover:bg-[#eefce5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286518]"
                >
                  Contact RISA
                </Link>
              </div>
            </div>
            <div aria-hidden="true" className="flex justify-center md:justify-end">
              <Image
                src="/risa-logo-animated.svg"
                alt=""
                width={600}
                height={600}
                unoptimized
                className="h-auto w-full max-w-[20rem] opacity-100 sm:max-w-[26rem] lg:max-w-[29rem]"
              />
            </div>
          </div>
          <p className="mt-6 text-center text-sm leading-6 text-slate-700">
            Registered learners can preview course topics and request enrolment. Access to
            full lessons requires approval by RISA administration.
          </p>
        </div>
      </section>
    </main>
  );
}
