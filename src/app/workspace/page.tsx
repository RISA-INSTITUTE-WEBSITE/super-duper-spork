import Link from "next/link";

import { requireAdminSession } from "@/lib/risa-staff-session";
import { RisaPracticalWorkspace } from "@/components/risa-practical-workspace";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Practical Workspace | RISA",
  robots: { index: false, follow: false },
};

export default async function WorkspacePage() {
  await requireAdminSession();
  return (
    <main id="main-content" className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-8">
        <Link href="/admin/labs" className="font-bold text-[#286518] hover:underline">
          ← Virtual laboratories
        </Link>
        <header>
          <h1 className="text-4xl font-bold">RISA Practical Workspace</h1>
          <p className="mt-3 text-slate-600">
            Experiment, inspect the output and explain your results. Programming runs real
            Python in an isolated browser runtime; the other workspaces remain
            simulations.
          </p>
        </header>
        <RisaPracticalWorkspace />
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold">Submit evidence for review</h2>
          <p className="mt-2 text-sm text-slate-600">
            Preview the practical evidence submission workflow before learner release.
          </p>
          <Link
            href="/students/practicals"
            className="mt-4 inline-flex rounded-xl bg-[#286518] px-5 py-3 font-bold text-white"
          >
            My practical submissions →
          </Link>
        </div>
        <Link href="/labs/physics" className="font-bold text-[#286518] hover:underline">
          Explore the interactive Physics Lab →
        </Link>
      </div>
    </main>
  );
}
