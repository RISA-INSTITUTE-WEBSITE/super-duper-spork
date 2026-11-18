import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#071936] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.6fr_0.8fr_1fr]">
        <div>
          <p className="text-xl font-extrabold tracking-tight">RISA<span className="text-cyan-300">.</span></p>
          <p className="mt-2 max-w-sm text-sm leading-7 text-slate-300">
            Institute of Applied Sciences. Exploring the connection between
            scientific understanding and practical application.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Explore</h2>
          <nav aria-label="Footer navigation" className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-300">
            <Link href="/programmes" className="hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Programmes</Link>
            <Link href="/about" className="hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">About RISA</Link>
            <Link href="/contact" className="hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Contact</Link>
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Development status</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            This website is under development. Student accounts, course
            enrollment and applications are not available yet.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-5 text-xs text-slate-400 sm:px-8">
          RISA Institute of Applied Sciences · Website in development
        </div>
      </div>
    </footer>
  );
}
