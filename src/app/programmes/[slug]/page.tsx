import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicRisaCourses } from "@/lib/risa-course-admin";
import {
  getRisaProgrammes,
  isProgrammeSlug,
  modulesForProgramme,
} from "@/lib/risa-programmes";

export const dynamic = "force-dynamic";

export default async function ProgrammePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isProgrammeSlug(slug)) {
    notFound();
  }
  const [programmes, modules] = await Promise.all([
    getRisaProgrammes(),
    getPublicRisaCourses(),
  ]);
  if (!programmes || !modules) {
    return (
      <main id="main-content" className="mx-auto max-w-5xl flex-1 px-5 py-12">
        <p role="status">Course information is temporarily unavailable.</p>
      </main>
    );
  }
  const programme = programmes.find((item) => item.slug === slug);
  if (!programme) {
    notFound();
  }
  const orderedModules = modulesForProgramme(modules, slug);
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-12">
      <Link href="/programmes" className="font-bold text-[#286518]">
        ← All courses
      </Link>
      <header className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-widest text-[#286518]">
          RISA course
        </p>
        <h1 className="mt-3 text-4xl font-bold">{programme.title}</h1>
        <p className="mt-4 leading-7 text-slate-600">{programme.description}</p>
      </header>
      <h2 className="mt-9 text-2xl font-bold">Modules</h2>
      <p className="mt-2 text-sm text-slate-600">
        Explore modules in teaching order. Full lessons require approved module access.
      </p>
      <ol className="mt-5 grid gap-4">
        {orderedModules.map((module) => (
          <li
            key={module.id}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="font-mono text-sm font-bold text-[#286518]">{module.code}</p>
            <h3 className="mt-2 text-xl font-bold">{module.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
            <Link
              href={"/students/courses/" + module.id}
              className="mt-4 inline-flex font-bold text-[#286518] underline-offset-4 hover:underline"
            >
              Preview module →
            </Link>
          </li>
        ))}
      </ol>
      {orderedModules.length === 0 && (
        <p className="mt-4 text-slate-600">Modules are coming soon.</p>
      )}
    </main>
  );
}
