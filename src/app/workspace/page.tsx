import Link from "next/link";

import { RisaPracticalWorkspace } from "@/components/risa-practical-workspace";

export const metadata = { title: "Practical Workspace | RISA" };

export default function WorkspacePage() {
  return (
    <main id="main-content" className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-8">
        <Link href="/labs" className="font-bold text-[#286518] hover:underline">← Virtual laboratories</Link>
        <header>
          <h1 className="text-4xl font-bold">RISA Practical Workspace</h1>
          <p className="mt-3 text-slate-600">Experiment, inspect the output and explain your results. These introductory exercises use a restricted simulator rather than a full language runtime.</p>
        </header>
        <RisaPracticalWorkspace />
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold">Submit evidence for review</h2>
          <p className="mt-2 text-sm text-slate-600">Registered, enrolled learners can submit their practical work to a module lecturer.</p>
          <Link href="/students/practicals" className="mt-4 inline-flex rounded-xl bg-[#286518] px-5 py-3 font-bold text-white">My practical submissions →</Link>
        </div>
        <Link href="/labs/physics" className="font-bold text-[#286518] hover:underline">Explore the interactive Physics Lab →</Link>
      </div>
    </main>
  );
}
