import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getPolicy } from "@/lib/risa-policies";

export const dynamic = "force-dynamic";

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = await getPolicy(slug);
  if (policy === undefined) {
    notFound();
  }
  if (policy === null) {
    return (
      <main id="main-content" className="mx-auto max-w-5xl flex-1 px-5 py-12">
        <p role="status">Policy information is temporarily unavailable.</p>
      </main>
    );
  }
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-12">
      <Link href="/policies" className="font-bold text-[#286518]">
        ← All policies
      </Link>
      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-7">
        <p className="text-sm font-bold text-[#286518]">{policy.category}</p>
        <h1 className="mt-3 text-4xl font-bold">{policy.title}</h1>
        <p className="mt-4 text-sm text-slate-600">
          Version {policy.version}
          {policy.effective_date && " · Effective " + policy.effective_date}
        </p>
        <div className="mt-7 border-t border-slate-200 pt-6 text-base leading-8">
          <div className="space-y-4 break-words [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-6 [&_a]:underline [&_table]:w-full [&_td]:border [&_th]:border [&_td]:p-2 [&_th]:p-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              skipHtml
              disallowedElements={["img"]}
            >
              {policy.body}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </main>
  );
}
