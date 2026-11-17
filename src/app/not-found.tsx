import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-5 py-20 sm:px-8">
      <p className="text-sm font-bold uppercase tracking-wider text-blue-800">404</p>
      <h1 className="mt-3 text-4xl font-bold">Page not found</h1>
      <p className="mt-5 text-slate-600">That page is not available on the RISA website.</p>
      <Link href="/" className="mt-8 inline-flex rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800">
        Return home
      </Link>
    </main>
  );
}
