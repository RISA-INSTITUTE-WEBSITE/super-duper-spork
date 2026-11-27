import Link from "next/link";

import { MarkdownPresenter } from "@/components/risa-markdown-presenter";
import { requireAdminSession } from "@/lib/risa-staff-session";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Markdown Presenter | RISA",
  robots: { index: false, follow: false },
};

export default async function MarkdownPresenterPage() {
  await requireAdminSession();
  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <Link href="/admin/labs" className="font-bold text-[#286518] hover:underline">
        ← Lab preview
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Markdown Presenter</h1>
      <p className="my-4 text-sm text-slate-600">
        Present notes or assessments from any module with interactive Python blocks. This
        private preview does not save, publish or grade your content.
      </p>
      <MarkdownPresenter />
    </main>
  );
}
