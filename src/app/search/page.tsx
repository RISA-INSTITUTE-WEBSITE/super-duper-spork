import type { Metadata } from "next";
import Link from "next/link";

import { pathways } from "@/lib/pathways";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the public RISA website and proposed learning pathways.",
};

const pages = [
  {
    href: "/",
    title: "RISA homepage",
    description: "Learn the science and discover applied learning at RISA.",
    keywords: "home learn applied education",
    category: "Page",
  },
  {
    href: "/programmes",
    title: "Programmes",
    description: "Explore proposed science, mathematics and computing pathways.",
    keywords: "programmes courses pathways",
    category: "Page",
  },
  {
    href: "/about",
    title: "About RISA",
    description: "Learn about RISA's vision for practical education.",
    keywords: "about institute mission vision",
    category: "Page",
  },
  {
    href: "/contact",
    title: "Contact RISA",
    description: "Find information about contacting the RISA team.",
    keywords: "contact team help",
    category: "Page",
  },
] as const;

const entries = [
  ...pages,
  ...pathways.map((pathway) => ({
    href: "/programmes",
    title: pathway.title,
    description: pathway.description,
    keywords: "proposed learning pathway programme",
    category: "Proposed pathway",
  })),
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = entries.filter((entry) => {
    const content = [entry.title, entry.description, entry.keywords].join(" ");
    return terms.length > 0 && terms.every((term) => content.toLowerCase().includes(term));
  });

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
        {query ? "Results for: " + query : "Use the search bar above to explore RISA."}
      </p>
      {results.length > 0 && (
        <ul className="mt-8 grid gap-4">
          {results.map((entry) => (
            <li key={entry.category + entry.title}>
              <Link
                href={entry.href}
                className="block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-[#78eb29] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-[#286518]"
              >
                <p className="text-xs font-semibold uppercase text-[#286518]">
                  {entry.category}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  {entry.title}
                </h2>
                <p className="mt-2 text-slate-600">{entry.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {query && results.length === 0 && (
        <p role="status" className="mt-8 rounded-xl bg-white p-6 text-slate-700">
          No matching pages found. Try another keyword.
        </p>
      )}
    </main>
  );
}
