import Link from "next/link";

import type { RisaCourse } from "@/lib/risa-course-admin";
import { modulesForProgramme, type RisaProgramme } from "@/lib/risa-programmes";

export function RisaProgrammeCards({
  programmes,
  modules,
}: {
  programmes: RisaProgramme[];
  modules: RisaCourse[];
}) {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {programmes.map((programme) => {
        const count = modulesForProgramme(modules, programme.slug).length;
        return (
          <article
            key={programme.slug}
            id={programme.slug}
            className="risa-glass-card flex flex-col rounded-2xl p-6"
          >
            <div className="rounded-xl bg-gradient-to-br from-blue-100 to-green-100 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#286518]">
                RISA course
              </p>
              <h2 className="mt-3 text-2xl font-bold text-slate-950">
                {programme.title}
              </h2>
            </div>
            <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
              {programme.description}
            </p>
            <p className="mt-4 text-sm font-bold text-[#286518]">
              {count} {count === 1 ? "module" : "modules"}
            </p>
            <Link
              href={"/programmes/" + programme.slug}
              className="mt-5 rounded-xl bg-[#286518] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#1d4f11]"
            >
              Explore modules →
            </Link>
          </article>
        );
      })}
    </div>
  );
}
