import type { Metadata } from "next";
import Link from "next/link";

import { labDomains } from "@/lib/risa-virtual-labs";

export const metadata: Metadata = {
  title: "Virtual Laboratories | RISA",
  description: "Practice applied science with interactive RISA virtual laboratories.",
};

export default function LabsPage() {
  return (
    <main id="main-content" className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-100 p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
            RISA Virtual Laboratories
          </p>
          <h1 className="risa-display mt-3 text-4xl font-bold sm:text-5xl">
            Learn by doing
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Choose a domain, experiment with a model and check your understanding. These
            browser-based activities complement your course modules.
          </p>
        </header>
        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          {labDomains.map((lab) => (
            <article
              key={lab.slug}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="font-mono text-xs font-bold text-[#286518]">{lab.code}</p>
              <h2 className="mt-2 text-2xl font-bold">{lab.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{lab.description}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
                {lab.activities.map((activity) => (
                  <li key={activity}>• {activity}</li>
                ))}
              </ul>
              <Link
                href={lab.href}
                className="mt-6 rounded-xl bg-[#286518] px-5 py-3 text-center font-bold text-white hover:bg-[#1d4f11]"
              >
                Open {lab.title} →
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">
          Practice is public and session-based. It does not grant course enrolment or
          count as a formal assessment.
        </p>
      </div>
    </main>
  );
}
