import type { Metadata } from "next";
import Link from "next/link";

import { pathways } from "@/lib/pathways";

export const metadata: Metadata = {
  title: "Search",
  description: "Search public pages and proposed learning pathways on the RISA website.",
};

const sitePages = [
  {
    href: "/",
    title: "RISA homepage",
    description: "Learn the science. Shape what comes next. Explore applied learning at RISA.",
    keywords: "home science applied learning RISA",
    category: "Page",
  },
  {
    href: "/programmes",
    title: "Programmes",
    description: "Explore proposed learning pathways in science, mathematics and computing.",
    keywords: "programmes courses pathways learning",
    category: "Page",
  },
  {
    href: "/about",
    title: "About RISA",
    description: "Learn about RISA's vision for practical, application-oriented education.",
    keywords: "about institute mission vision",
    category: "Page",
  },
  {
    href: "/contact",
    title: "Contact RISA",
    description: "Find information about contacting the RISA team.",
    keywords: "contact help team information",
    category: "Page",
  },
] as const;

const searchItems = [
  ...sitePages,
  ...pathways.map((pathway) => ({
    href: "/programmes",
    title: pathway.title,
    description: pathway.description,
    keywords: "proposed learning pathway science programme planned",
    category: "Proposed pathway",
  })),
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = words.length
    ? searchItems.filter((item) =>
        words.every((word) =>
          (item.title + " " + item.description + " " + item.keywords)
            .toLowerCase()
            .includes(word),
        ),
      )
    : [];

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-5xl flex-1 px-5 py-14 sm:px-8"
    >
      <p className="font-semibold uppercase tracking-widest text-blue-800">
        Explore RISA
      </p>
      <h1 className="mt-3 text-4xl font-bold">Search RISA</h1>
      <p className="mt-5 text-slate-600">
        {query ? (
          <>
            Results for <strong className="text-slate-900">{query}</strong>
          </>
        ) : (
          "Use the search bar above to find RISA pages and proposed learning pathways."
        )}
      </p>
      {results.length > 0 ? (
        <ul className="mt-8 grid gap-4">
          {results.map((result) => (
            <li key={result.category + result.title}>
              <Link
                href={result.href}
                className="block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-[#78eb29] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286518]"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-[#286518]">
                  {result.category}
                </span>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  {result.title}
                </h2>
                <p className="mt-2 text-slate-600">{result.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : query ? (
        <p role="status" className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-slate-700">
          No matching pages found. Try another keyword, such as physics or programmes.
        </p>
      ) : null}
    </main>
  );
}
