import Link from "next/link";
import { notFound } from "next/navigation";

import { DomainLab } from "@/components/risa-domain-lab";
import { requireAdminSession } from "@/lib/risa-staff-session";
import { labDomains } from "@/lib/risa-virtual-labs";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function DomainLabPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  await requireAdminSession();
  const { domain } = await params;
  if (domain !== "physics" && domain !== "devops" && domain !== "security") {
    notFound();
  }
  const lab = labDomains.find((item) => item.slug === domain);
  if (!lab) {
    notFound();
  }
  return (
    <main id="main-content" className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <Link href="/admin/labs" className="font-bold text-[#286518] hover:underline">
          ← All laboratories
        </Link>
        <header className="my-6 rounded-2xl border border-blue-100 bg-white p-6">
          <p className="font-mono text-sm font-bold text-blue-700">{lab.code}</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{lab.title}</h1>
          <p className="mt-3 text-slate-600">{lab.description}</p>
        </header>
        <DomainLab domain={domain} />
      </div>
    </main>
  );
}
