import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>RISA Institute of Applied Sciences · Website in development</p>
        <Link href="/about" className="font-medium text-blue-800 hover:underline">
          About this project
        </Link>
      </div>
    </footer>
  );
}
