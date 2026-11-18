import Link from "next/link";

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
      {diagonal ? (
        <path d="M6 18 18 6M8 6h10v10" />
      ) : (
        <path d="M4 12h16m-7-7 7 7-7 7" />
      )}
    </svg>
  );
}

function ScienceIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.055] p-6 shadow-[0_35px_100px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(34,211,238,0.14),transparent_50%)]" />
      <div className="relative flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200/85">
        <span>RISA / Exploration</span>
        <span>001</span>
      </div>
      <svg
        className="relative mt-4 w-full"
        viewBox="0 0 460 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="risa-ring" x1="78" y1="75" x2="391" y2="360">
            <stop stopColor="#67E8F9" />
            <stop offset="1" stopColor="#60A5FA" stopOpacity=".22" />
          </linearGradient>
          <radialGradient id="risa-core">
            <stop stopColor="#1D4ED8" />
            <stop offset="1" stopColor="#0C2867" />
          </radialGradient>
        </defs>
        <circle cx="230" cy="215" r="178" stroke="#93C5FD" strokeOpacity=".16" />
        <circle cx="230" cy="215" r="128" stroke="#93C5FD" strokeOpacity=".23" />
        <circle cx="230" cy="215" r="77" stroke="#67E8F9" strokeOpacity=".37" />
        <ellipse
          cx="230"
          cy="215"
          rx="185"
          ry="74"
          transform="rotate(-35 230 215)"
          stroke="url(#risa-ring)"
          strokeWidth="2"
        />
        <ellipse
          cx="230"
          cy="215"
          rx="176"
          ry="88"
          transform="rotate(50 230 215)"
          stroke="#60A5FA"
          strokeOpacity=".48"
          strokeWidth="1.5"
        />
        <circle cx="230" cy="215" r="61" fill="url(#risa-core)" stroke="#67E8F9" strokeOpacity=".7" />
        <text x="230" y="221" fill="#FFFFFF" textAnchor="middle" fontSize="30" fontWeight="750" letterSpacing="2">
          RISA
        </text>
        <circle cx="82" cy="318" r="9" fill="#67E8F9" />
        <circle cx="357" cy="128" r="7" fill="#93C5FD" />
        <circle cx="375" cy="300" r="6" fill="#5EEAD4" />
        <circle cx="148" cy="64" r="5" fill="#93C5FD" />
        <path d="M95 318H132M363 128h33M375 307v29" stroke="#67E8F9" strokeOpacity=".55" />
        <path d="M63 80h51M63 91h32M354 370h42M365 381h31" stroke="#93C5FD" strokeOpacity=".3" strokeWidth="2" />
      </svg>
      <div className="relative flex items-center justify-between gap-4 border-t border-white/15 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300">
            Our direction
          </p>
          <p className="mt-1 text-sm font-medium text-white/90">
            Curiosity meets application.
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cyan-200">
          <ArrowIcon diagonal />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="risa-hero relative isolate overflow-hidden bg-[#071936] text-white">
        <div aria-hidden="true" className="risa-hero-grid pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="risa-hero-glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-18 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold tracking-wide text-cyan-100">
              <span className="size-2 rounded-full bg-cyan-300" aria-hidden="true" />
              Building the future of applied learning
            </span>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-sky-200">
              RISA Institute of Applied Sciences
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.12] tracking-[-0.04em] sm:text-5xl lg:text-[4.25rem]">
              Learn the science.
              <span className="mt-2 block text-cyan-300">
                Shape what comes next.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              Science makes more sense when you can put it to work. RISA is
              developing an accessible learning experience that connects
              strong foundations with practical thinking.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/programmes"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Explore learning pathways
                <ArrowIcon />
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/35 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Discover RISA
                <ArrowIcon diagonal />
              </Link>
            </div>
            <div className="mt-12 grid gap-5 border-t border-white/20 pt-7 text-sm text-slate-200 sm:grid-cols-3 sm:gap-6">
              <div><span className="block font-bold text-white">Explore</span>Scientific ideas</div>
              <div><span className="block font-bold text-white">Connect</span>Theory and practice</div>
              <div><span className="block font-bold text-white">Create</span>New possibilities</div>
            </div>
          </div>
          <div className="hidden lg:block">
            <ScienceIllustration />
          </div>
        </div>
      </section>

      <section aria-labelledby="approach-heading" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              The RISA approach
            </p>
            <h2 id="approach-heading" className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Knowledge that goes beyond the classroom.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              We are shaping a learning experience around understanding,
              exploration and meaningful application.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {principles.map(({ number, title, description }) => (
              <article
                key={number}
                className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-7 transition hover:border-blue-200 hover:bg-blue-50/60 sm:p-8"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-xl border border-blue-100 bg-white text-sm font-bold text-blue-800 shadow-sm">
                  {number}
                </span>
                <h3 className="mt-7 text-xl font-bold tracking-tight text-slate-950">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="pathways-heading" className="bg-[#f3f7fc] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                An early look
              </p>
              <h2 id="pathways-heading" className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Explore proposed learning pathways.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                These are examples of our intended direction, not confirmed
                courses. Content and availability will be announced when ready.
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
                className="relative flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-[0_12px_35px_rgba(15,23,42,0.04)] sm:p-8"
              >
                <div className={"absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r " + pathwayAccents[index % pathwayAccents.length]} />
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-800">
                    Proposed
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-9 text-2xl font-bold tracking-tight text-slate-950">
                  {title}
                </h3>
                <p className="mt-4 flex-1 leading-7 text-slate-600">
                  {description}
                </p>
                <Link
                  href="/programmes"
                  className="mt-9 inline-flex w-fit items-center gap-2 text-sm font-bold text-blue-800 transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
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
            <div aria-hidden="true" className="absolute -right-24 -top-28 size-80 rounded-full border-[55px] border-cyan-300/10" />
            <div aria-hidden="true" className="absolute -bottom-44 right-16 size-80 rounded-full bg-blue-400/10 blur-3xl" />
            <div className="relative max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                A platform in progress
              </p>
              <h2 id="next-heading" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                A place to question, discover and grow.
              </h2>
              <p className="mt-5 leading-8 text-blue-100">
                We are building RISA one step at a time. Explore the
                institute&apos;s vision, or contact the team to learn more
                about the project.
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
            Website in development. Student accounts and applications are not available yet.
          </p>
        </div>
      </section>
    </main>
  );
}
