import Link from "next/link";

import { pathways } from "@/lib/pathways";

export default function HomePage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="bg-blue-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">
            Science · Engineering · Technology
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Learn the science. Apply the knowledge.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-blue-100">
            Welcome to RISA Institute of Applied Sciences. We are preparing a
            practical learning experience that connects fundamental concepts to
            real engineering and scientific problems.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/programmes"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-950 transition hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Explore learning pathways
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-blue-300 px-6 py-3 font-semibold text-white transition hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              About RISA
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mb-8">
          <p className="font-semibold uppercase tracking-widest text-blue-800">In development</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Proposed learning pathways</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            These examples illustrate our direction. Course content, enrollment,
            and availability will be confirmed before launch.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {pathways.map(({ slug, title, description }) => (
            <article key={slug} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-800">
                Proposed
              </span>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <h2 className="text-2xl font-bold">Built for applied learning</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">
            Our planned learning platform will bring together clear explanations,
            real-world examples, structured modules, and opportunities to
            practice what you learn.
          </p>
        </div>
      </section>
    </main>
  );
}
