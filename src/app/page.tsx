import Image from "next/image";
import Link from "next/link";

import { HeroPhotoBackground } from "@/components/hero-photo-background";
import { pathways } from "@/lib/pathways";

const principles = [
  {
    number: "01",
    title: "Understand the fundamentals",
    description:
      "Build confidence in the essential ideas behind science, technology and engineering.",
  },
  {
    number: "02",
    title: "Connect theory to practice",
    description:
      "Explore how scientific principles can help us approach real-world questions.",
  },
  {
    number: "03",
    title: "Learn with purpose",
    description:
      "Our vision is to make structured, application-oriented learning more accessible.",
  },
] as const;

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

function RisaHeroLogo() {
  return (
    <div className="risa-science-glass relative mx-auto flex w-full max-w-[480px] items-center justify-center overflow-hidden rounded-[2rem] p-5 sm:p-8">
      <Image
        src="/risa-logo.svg"
        alt="RISA Institute official logo"
        width={420}
        height={420}
        className="h-auto w-full max-w-[360px] rounded-full object-contain"
        priority
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="risa-hero relative isolate overflow-hidden text-[#0A0F1D]">
        <HeroPhotoBackground />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/95 bg-white/65 px-4 py-2 text-xs font-semibold tracking-wide text-[#34569E] shadow-sm backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#155DFC]" aria-hidden="true" />
              Building the future of applied learning
            </span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[#5274C3]">
              RISA Institute of Applied Sciences
            </p>
            <h1 className="risa-display mt-5 max-w-3xl text-[3rem] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[4rem] lg:text-[4.8rem]">
              Learn the science.
              <span className="mt-2 block text-[#155DFC]">Shape what comes next.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#465d7b] sm:text-lg">
              Science makes more sense when you can put it to work. RISA is developing an
              accessible learning experience that connects strong foundations with
              practical thinking.
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
                <span className="block font-bold text-[#143361]">Explore</span>Scientific
                ideas
              </div>
              <div>
                <span className="block font-bold text-[#143361]">Connect</span>Theory and
                practice
              </div>
              <div>
                <span className="block font-bold text-[#143361]">Create</span>New
                possibilities
              </div>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[420px] md:block">
            <RisaHeroLogo />
          </div>
        </div>
      </section>

      <section aria-labelledby="approach-heading" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              The RISA approach
            </p>
            <h2
              id="approach-heading"
              className="risa-display mt-3 text-[2.6rem] font-bold tracking-tight text-[#0A0F1D] sm:text-[3.5rem]"
            >
              Knowledge that goes beyond the classroom.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              We are shaping a learning experience around understanding, exploration and
              meaningful application.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {principles.map(({ number, title, description }) => (
              <article
                key={number}
                className="risa-glass-card group relative isolate overflow-hidden rounded-[1.6rem] p-7 transition duration-200 hover:-translate-y-1 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 top-0 select-none text-[110px] font-black leading-none tracking-tight text-[#155DFC]/[0.07]"
                >
                  {number}
                </span>
                <span className="relative inline-flex size-12 items-center justify-center rounded-xl border border-white/90 bg-white/75 text-sm font-bold text-[#155DFC] shadow-sm">
                  {number}
                </span>
                <h3 className="relative mt-7 text-xl font-bold tracking-tight text-slate-950">
                  {title}
                </h3>
                <p className="relative mt-3 leading-7 text-slate-600">{description}</p>
              </article>
            ))}
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

      <section aria-labelledby="next-heading" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#0b2450] px-7 py-12 text-white sm:px-12 sm:py-16 lg:px-16">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-28 size-80 rounded-full border-[55px] border-cyan-300/10"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-44 right-16 size-80 rounded-full bg-blue-400/10 blur-3xl"
            />
            <div className="relative max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                A platform in progress
              </p>
              <h2
                id="next-heading"
                className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                A place to question, discover and grow.
              </h2>
              <p className="mt-5 leading-8 text-blue-100">
                We are building RISA one step at a time. Explore the institute&apos;s
                vision, or contact the team to learn more about the project.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-950 transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  About the institute <ArrowIcon />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Contact RISA <ArrowIcon diagonal />
                </Link>
              </div>
            </div>
          </div>
          <p className="mt-6 text-center text-sm leading-6 text-slate-500">
            Website in development. Student accounts and applications are not available
            yet.
          </p>
        </div>
      </section>
    </main>
  );
}
