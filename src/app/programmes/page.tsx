import type { Metadata } from "next";

import { pathways } from "@/lib/pathways";

export const metadata: Metadata = {
  title: "Learning pathways",
};

export default function ProgrammesPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-14 sm:px-8">
      <p className="font-semibold uppercase tracking-widest text-blue-800">Learning</p>
      <h1 className="mt-3 text-4xl font-bold">Proposed learning pathways</h1>
      <p className="mt-5 max-w-3xl leading-relaxed text-slate-600">
        RISA is planning structured, application-oriented learning content.
        The pathways below are illustrative and are not yet open for enrollment.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {pathways.map(({ slug, title, description }) => (
          <section key={slug} className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Planned</p>
            <h2 className="mt-3 text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-slate-600">{description}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
