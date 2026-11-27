import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicRisaCourses } from "@/lib/risa-course-admin";
import {
  describePhysicsPackage,
  findPhysicsPathway,
  physicsModules,
} from "@/lib/risa-physics-pathways";

export const dynamic = "force-dynamic";

export default async function PhysicsPathwayPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const pathway = findPhysicsPathway(code);
  if (!pathway) notFound();

  const published = await getPublicRisaCourses();
  const available = new Map(
    (published ?? [])
      .filter((module) => module.is_published)
      .map((module) => [module.code, module]),
  );

  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-12">
      <Link href="/programmes/physics/pathways" className="font-bold text-[#286518]">
        ← All Applied Physics pathways
      </Link>
      <header className="mt-6 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 p-7">
        <p className="font-mono text-sm font-bold text-[#286518]">{pathway.code}</p>
        <h1 className="mt-3 text-4xl font-bold">{pathway.title}</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Curriculum proposal under academic review. All core modules are shared;
          elective recommendations are flexible and subject to academic approval. This
          pathway does not confer accreditation or professional registration.
        </p>
      </header>
      {published === null && (
        <p role="status" className="mt-5 text-sm text-slate-600">
          Live module availability is temporarily unavailable. The proposed curriculum
          remains visible.
        </p>
      )}
      {[1, 2, 3].map((level) => (
        <section key={level} className="mt-9" aria-labelledby={"level-" + level}>
          <h2 id={"level-" + level} className="text-2xl font-bold">
            Level {level}
          </h2>
          <ol className="mt-4 grid gap-3">
            {physicsModules
              .filter((module) => module.level === level)
              .map((module) => {
                const live = available.get(module.code);
                const recommendations = Object.entries(pathway.packages).filter(
                  ([key]) => key === module.code || key.startsWith(module.code + " "),
                );
                return (
                  <li
                    key={module.code}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <p className="font-mono text-sm font-bold text-[#286518]">
                      {module.code} · {module.optional ? "Optional" : "Compulsory"}
                    </p>
                    <h3 className="mt-2 text-lg font-bold">{module.title}</h3>
                    {module.code === "PCS102" && (
                      <p className="mt-2 text-sm text-slate-600">
                        Career-oriented practical choice; all core theory is required.
                      </p>
                    )}
                    {recommendations.map(([key, selection]) => (
                      <p key={key} className="mt-2 text-sm text-slate-600">
                        {key}: {selection === "—" ? "" : selection + " — "}
                        {describePhysicsPackage(key, selection)}
                      </p>
                    ))}
                    {module.code === "PHY307" && (
                      <p className="mt-2 text-sm text-slate-600">
                        Suggested supervised research: {pathway.research}
                      </p>
                    )}
                    {live ? (
                      <Link
                        href={"/students/courses/" + live.id}
                        className="mt-3 inline-flex font-bold text-[#286518] hover:underline"
                      >
                        Preview module →
                      </Link>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        {published === null ? "Availability unknown" : "Planned module"}
                      </p>
                    )}
                  </li>
                );
              })}
          </ol>
        </section>
      ))}
      <p className="mt-8 leading-7 text-slate-600">
        PHY304 is optional even when recommended. Other electives remain in the
        institutional catalogue. Full lessons require approved module access; changing
        pathways or substituting electives requires prerequisite and workload review.
      </p>
    </main>
  );
}
