import Image from "next/image";
import Link from "next/link";

import { risaThumbnailUrl, type RisaCourse } from "@/lib/risa-course-admin";
import { modulesForProgramme, type RisaProgramme } from "@/lib/risa-programmes";

function ModuleTile({ module }: { module: RisaCourse }) {
  const thumbnail = risaThumbnailUrl(module.thumbnail_path);

  return (
    <li className="w-[min(76vw,16rem)] shrink-0 snap-start">
      <Link
        href={"/students/courses/" + module.id}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-[#78eb29] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
      >
        <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-[#dbeafe] via-white to-[#eefce5]">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt=""
              fill
              unoptimized
              sizes="256px"
              className="object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="font-mono text-3xl font-black tracking-tight text-[#155DFC]/40"
            >
              {module.code}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="font-mono text-xs font-bold tracking-wide text-[#286518]">
            {module.code}
          </p>
          <h4 className="mt-2 flex-1 text-base font-bold leading-6 text-slate-950">
            {module.title}
          </h4>
          <p className="mt-4 text-xs font-semibold text-[#286518]">
            Preview module <span aria-hidden="true">→</span>
          </p>
        </div>
      </Link>
    </li>
  );
}

function DomainRow({
  programme,
  modules,
}: {
  programme: RisaProgramme;
  modules: RisaCourse[];
}) {
  const published = modulesForProgramme(
    modules.filter((module) => module.is_published),
    programme.slug,
  );
  if (published.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={"domain-" + programme.slug} className="text-xl font-bold text-slate-950">
          {programme.title}
        </h3>
        {published.length > 4 && (
          <Link
            href={"/programmes/" + programme.slug}
            aria-label={"View More " + programme.title + " modules"}
            className="text-sm font-bold text-[#286518] underline-offset-4 hover:underline"
          >
            View More <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      <div
        role="region"
        aria-labelledby={"domain-" + programme.slug}
        tabIndex={0}
        className="mt-3 max-w-full snap-x snap-proximity overflow-x-auto overscroll-x-contain rounded-xl focus-visible:outline-2 focus-visible:outline-[#155DFC]"
      >
        <ul className="flex w-max min-w-full flex-nowrap gap-4 px-1 pb-4 pt-1">
          {published.slice(0, 4).map((module) => (
            <ModuleTile key={module.id} module={module} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function RisaDomainModules({
  programmes,
  modules,
}: {
  programmes: RisaProgramme[] | null;
  modules: RisaCourse[] | null;
}) {
  return (
    <section
      aria-labelledby="popular-modules-heading"
      className="min-w-0 border-t border-slate-100 bg-[#f8fbfa] py-14 sm:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <h2
          id="popular-modules-heading"
          className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
        >
          Modules from our popular domains
        </h2>
        {programmes && modules ? (
          <div className="mt-8 space-y-9">
            {programmes
              .filter((programme) => programme.is_published)
              .map((programme) => (
                <DomainRow key={programme.slug} programme={programme} modules={modules} />
              ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-600">
            Module information is temporarily unavailable.
          </p>
        )}
      </div>
    </section>
  );
}
