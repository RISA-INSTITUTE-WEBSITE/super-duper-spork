import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminSession } from "@/lib/risa-staff-session";
import { labDomains } from "@/lib/risa-virtual-labs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Virtual Laboratories | RISA",
  description: "Private administrator preview of RISA virtual laboratories.",
  robots: { index: false, follow: false },
};

export default async function LabsPage() {
  await requireAdminSession();
  return (
    <main id="main-content" className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Link href="/admin" className="font-bold text-[#286518] hover:underline">
          ← Administration Centre
        </Link>
        <header className="mt-5 rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-100 p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
            RISA Virtual Laboratories · Administrator preview
          </p>
          <h1 className="risa-display mt-3 text-4xl font-bold sm:text-5xl">
            Labs — development preview
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Review the developing laboratories before approving them for learner access.
          </p>
        </header>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold">Practical Workspace</h2>
          <p className="mt-2 text-sm text-slate-600">
            Programming, Linux, SQL and physics exercises with output and optional
            lecturer review.
          </p>
          <Link href="/workspace" className="mt-4 inline-flex font-bold text-[#286518]">
            Open Practical Workspace →
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold">Markdown Presenter</h2>
          <p className="mt-2 text-sm text-slate-600">
            Present any notes or assessment with optional embedded Python Studios.
          </p>
          <Link
            href="/admin/labs/presenter"
            className="mt-4 inline-flex font-bold text-[#286518]"
          >
            Open Markdown Presenter →
          </Link>
        </div>
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
          Private preview. Laboratories are not released to learners.
        </p>
      </div>
    </main>
  );
}
