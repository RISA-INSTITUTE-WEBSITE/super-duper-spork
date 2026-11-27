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
      <header className="mt-5 rounded-xl bg-white px-5 py-4 shadow-sm sm:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{programme.title}</h1>
      </header>
      {slug === "physics" && (
        <Link
          href="/programmes/physics/pathways"
          className="mt-6 inline-flex font-bold text-[#286518] hover:underline"
        >
          Explore Applied Physics pathways →
        </Link>
      )}
      <h2 className="mt-6 text-2xl font-bold">Modules</h2>
      <ol className="mt-4 grid gap-3">
        {orderedModules.map((module) => (
          <li
            key={module.id}
            className="rounded-xl border border-slate-200 bg-white px-5 py-4"
          >
            <p className="font-mono text-sm font-bold text-[#286518]">{module.code}</p>
            <h3 className="mt-2 text-xl font-bold">{module.title}</h3>
            <Link
              href={"/students/courses/" + module.id}
              className="mt-3 inline-flex font-bold text-[#286518] underline-offset-4 hover:underline"
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
