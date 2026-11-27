import type { Metadata } from "next";
import Link from "next/link";

import { listPolicies } from "@/lib/risa-policies";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Institutional policies | RISA",
  description: "Read published RISA institutional policies and guidelines.",
};

export default async function PoliciesPage() {
  const policies = await listPolicies();
  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
      <header className="risa-science-glass rounded-2xl p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#286518]">
          Institutional governance
        </p>
        <h1 className="mt-3 text-4xl font-bold">RISA Policies</h1>
        <p className="mt-4 text-slate-600">
          Read our published policies, regulations and institutional guidelines.
        </p>
      </header>
      {policies === null ? (
        <p role="status" className="mt-8">
          Policies are temporarily unavailable.
        </p>
      ) : policies.length === 0 ? (
        <p className="mt-8 text-slate-600">No policies have been published yet.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {policies.map((policy) => (
            <article key={policy.slug} className="risa-glass-card rounded-2xl p-6">
              <p className="text-sm font-bold text-[#286518]">{policy.category}</p>
              <h2 className="mt-2 text-xl font-bold">{policy.title}</h2>
              <p className="mt-3 text-sm text-slate-600">
                Version {policy.version}
                {policy.effective_date && " · Effective " + policy.effective_date}
              </p>
              <Link
                href={"/policies/" + policy.slug}
                className="mt-5 inline-flex font-bold text-[#286518] hover:underline"
              >
                Read policy
                <span className="sr-only">: {policy.title}</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
