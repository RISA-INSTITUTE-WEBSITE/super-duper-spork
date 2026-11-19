import Image from "next/image";
import Link from "next/link";

import { HeroPhotoBackground } from "@/components/hero-photo-background";
import { pathways } from "@/lib/pathways";

const pathwayAccents = [
  "from-sky-400 to-cyan-300",
  "from-indigo-400 to-sky-300",
  "from-teal-400 to-emerald-300",
] as const;

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

export default function HomePage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="risa-hero relative isolate overflow-hidden text-[#0A0F1D]">
        <HeroPhotoBackground />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
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
                Explore learning pathways
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

      <section
        aria-labelledby="vision-mission-heading"
        className="bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            RISA — Vision and Mission
          </p>
          <h2
            id="vision-mission-heading"
            className="risa-display mt-3 text-[2.6rem] font-bold tracking-tight text-[#0A0F1D] sm:text-[3.5rem]"
          >
            Our Vision and Mission
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="risa-glass-card relative isolate overflow-hidden rounded-[1.6rem] p-7 sm:p-8">
              <span className="inline-flex size-12 items-center justify-center rounded-xl border border-white/90 bg-white/75 text-sm font-bold text-[#155DFC] shadow-sm">
                01
              </span>
              <h3 className="mt-7 text-2xl font-bold tracking-tight text-slate-950">
                Our Vision
              </h3>
              <p className="mt-4 leading-8 text-slate-600">
                To become a globally recognized centre of excellence in applied sciences
                education, where theoretical knowledge meets practical experience,
                empowering individuals to think critically, innovate confidently, and
                develop sustainable solutions to real-world challenges.
              </p>
            </article>
            <article className="risa-glass-card relative isolate overflow-hidden rounded-[1.6rem] p-7 sm:p-8">
              <span className="inline-flex size-12 items-center justify-center rounded-xl border border-white/90 bg-white/75 text-sm font-bold text-[#155DFC] shadow-sm">
                02
              </span>
              <h3 className="mt-7 text-2xl font-bold tracking-tight text-slate-950">
                Our Mission
              </h3>
              <p className="mt-4 leading-8 text-slate-600">
                To make scientific and technical education accessible, practical,
                rigorous, and relevant by integrating foundational knowledge with hands-on
                experimentation, engineering applications, research, and real-world
                problem-solving.
              </p>
              <p className="mt-4 leading-8 text-slate-600">
                RISA is committed to developing competent, creative, and independent
                learners who can understand scientific principles, apply their knowledge,
                design and test solutions, and contribute meaningfully to technological
                advancement and societal development.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="philosophy-heading"
        className="risa-pathways-section py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Our Educational Philosophy
          </p>
          <h2
            id="philosophy-heading"
            className="risa-display mt-3 max-w-4xl text-[2.6rem] font-bold tracking-tight text-[#0A0F1D] sm:text-[3.5rem]"
          >
            Learn it. Understand it. Apply it. Test it. Improve it.
          </h2>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
            At RISA, education goes beyond memorizing theories and passing examinations.
            We believe that meaningful learning emerges when students actively engage with
            concepts, investigate problems, experiment with solutions, and demonstrate
            what they have learned through practical work.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="risa-glass-card rounded-[1.6rem] p-7 sm:p-8">
              <h3 className="text-xl font-bold tracking-tight text-slate-950">Theory</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Theory provides the foundation.
              </p>
            </article>
            <article className="risa-glass-card rounded-[1.6rem] p-7 sm:p-8">
              <h3 className="text-xl font-bold tracking-tight text-slate-950">
                Practical Experience
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Practical experience develops competence.
              </p>
            </article>
            <article className="risa-glass-card rounded-[1.6rem] p-7 sm:p-8">
              <h3 className="text-xl font-bold tracking-tight text-slate-950">
                Innovation
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Innovation transforms knowledge into impact.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="pathways-heading"
        className="risa-pathways-section py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                An early look
              </p>
              <h2
                id="pathways-heading"
                className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
              >
                Explore proposed learning pathways.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                These are examples of our intended direction, not confirmed courses.
                Content and availability will be announced when ready.
              </p>
            </div>
            <Link
              href="/programmes"
              className="inline-flex w-fit items-center gap-2 text-sm font-bold text-blue-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
            >
              View all pathways <ArrowIcon />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pathways.map(({ slug, title, description }, index) => (
              <article
                key={slug}
                className="risa-pathway-card group relative isolate flex flex-col overflow-hidden rounded-[1.6rem] p-7 transition duration-200 hover:-translate-y-1 sm:p-8"
              >
                <div
                  className={
                    "absolute inset-x-0 top-0 h-1.5 rounded-t-[1.6rem] bg-gradient-to-r " +
                    pathwayAccents[index % pathwayAccents.length]
                  }
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-3 top-10 select-none text-[130px] font-black leading-none tracking-tight text-[#155DFC]/[0.08]"
                >
                  0{index + 1}
                </span>
                <div className="relative flex items-center justify-between">
                  <span className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-800">
                    Proposed
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="relative mt-9 text-2xl font-bold tracking-tight text-slate-950">
                  {title}
                </h3>
                <p className="relative mt-4 flex-1 leading-7 text-slate-600">
                  {description}
                </p>
                <Link
                  href="/programmes"
                  className="relative mt-9 inline-flex w-fit items-center gap-2 text-sm font-bold text-blue-800 transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                  aria-label={"Read about proposed " + title + " learning pathway"}
                >
                  Learn more <ArrowIcon diagonal />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="next-heading"
        className="relative isolate overflow-hidden bg-white py-20 sm:py-24"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full border-[55px] border-[#38b6ff]/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-44 right-16 size-80 rounded-full bg-blue-400/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,29rem)] lg:gap-14">
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
                contact the team to learn more as the platform develops.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#286518] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286518]"
                >
                  About the institute <ArrowIcon />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/85 px-6 py-3 text-sm font-semibold text-[#286518] transition hover:border-[#286518] hover:bg-[#eefce5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286518]"
                >
                  Contact RISA <ArrowIcon diagonal />
                </Link>
              </div>
            </div>
            <div aria-hidden="true" className="flex justify-center lg:justify-end">
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
          <p className="mt-6 text-center text-sm leading-6 text-slate-500">
            Website in development. Student accounts provide portal access only; programme
            applications and enrolment are not available yet.
          </p>
        </div>
      </section>
    </main>
  );
}
