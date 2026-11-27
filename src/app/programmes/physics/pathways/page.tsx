import type { Metadata } from "next";
import Link from "next/link";

import { physicsPathwayHref, physicsPathways } from "@/lib/risa-physics-pathways";

export const metadata: Metadata = {
  title: "Applied Physics pathways | RISA",
  description: "Explore twelve proposed career pathways in Applied Physics.",
};

export default function PhysicsPathwaysPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-5 py-12">
      <Link href="/programmes" className="font-bold text-[#286518]">
        ← All courses
      </Link>
      <header className="mt-6 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-[#286518]">
          School of Physical and Applied Sciences
        </p>
        <h1 className="mt-3 text-4xl font-bold">Applied Physics pathways</h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          Build a common physics, mathematics and computing foundation, then explore
          career-oriented elective packages and supervised research across three levels.
          These are proposed curriculum pathways under academic review, not accredited
          qualifications or open pathway enrolments.
        </p>
      </header>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {physicsPathways.map((pathway) => (
          <article
            key={pathway.code}
            className="risa-glass-card flex flex-col rounded-2xl p-6"
          >
            <p className="font-mono text-sm font-bold text-[#286518]">{pathway.code}</p>
            <h2 className="mt-3 text-xl font-bold">{pathway.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
              Research direction: {pathway.research}
            </p>
            <Link
              href={physicsPathwayHref(pathway.code)}
              className="mt-5 rounded-xl bg-[#286518] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#1d4f11]"
            >
              Explore pathway
              <span className="sr-only">: {pathway.title}</span>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
