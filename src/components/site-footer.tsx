import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="risa-footer mt-auto border-t border-[#DBEAFE] text-slate-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.6fr_0.8fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/risa-logo.svg"
              alt="RISA Institute official logo"
              width={56}
              height={56}
              className="size-14 rounded-full object-contain"
            />
            <p className="text-xl font-extrabold tracking-tight text-[#0A0F1D]">
              RISA Institute
            </p>
          </div>
          <p className="mt-2 max-w-sm text-sm leading-7 text-slate-600">
            Institute of Applied Sciences. Exploring the connection between scientific
            understanding and practical application.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#0A0F1D]">Explore</h2>
          <nav
            aria-label="Footer navigation"
            className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-600"
          >
            <Link
              href="/programmes"
              className="hover:text-[#155DFC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#155DFC]"
            >
              Programmes
            </Link>
            <Link
              href="/about"
              className="hover:text-[#155DFC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#155DFC]"
            >
              About RISA
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#155DFC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#155DFC]"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#0A0F1D]">Development status</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This website is under development. Student accounts, course enrollment and
            applications are not available yet.
          </p>
        </div>
      </div>
      <div className="border-t border-[#d7e5fa]">
        <div className="mx-auto max-w-7xl px-5 py-5 text-xs text-slate-500 sm:px-8">
          RISA Institute of Applied Sciences · Website in development
        </div>
      </div>
    </footer>
  );
}
