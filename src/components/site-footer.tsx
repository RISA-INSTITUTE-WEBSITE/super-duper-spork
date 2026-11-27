import Image from "next/image";
import Link from "next/link";

const footerLinkClass =
  "inline-flex min-h-11 items-center rounded-sm text-[#D4E5EF] transition-colors hover:text-[#78eb29] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#78eb29]";

export function SiteFooter() {
  return (
    <footer className="risa-footer mt-auto border-t border-[#78eb29]/50 text-[#E9F2F8]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="risa-footer-columns grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr] lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/risa-logo.svg"
                alt="RISA Institute official logo"
                width={56}
                height={56}
                className="size-14 shrink-0 rounded-full object-contain"
              />
              <p className="font-heading text-xl font-extrabold text-white">
                RISA Institute
              </p>
            </div>
            <div
              className="mt-5 h-0.5 w-16 rounded-full bg-[#78eb29]"
              aria-hidden="true"
            />
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#CADDE9]">
              Institute of Applied Sciences. Exploring the connection between scientific
              understanding and practical application.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-sm font-bold uppercase text-white">
              Explore
            </h2>
            <nav
              aria-label="Footer navigation"
              className="mt-3 flex flex-col items-start gap-1 text-sm"
            >
              <Link href="/programmes" className={footerLinkClass}>
                Programmes
              </Link>
              <Link href="/about" className={footerLinkClass}>
                About RISA
              </Link>
              <Link href="/policies" className={footerLinkClass}>
                Policies
              </Link>
              <Link href="/contact" className={footerLinkClass}>
                Contact
              </Link>
            </nav>
          </div>

          <div>
            <h2 className="font-heading text-sm font-bold uppercase text-white">
              Development status
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#CADDE9]">
              RISA continues to expand its programmes, learning resources and student
              services as the platform develops.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#35516B]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs leading-6 text-[#B6CBD9] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 RISA Institute of Applied Sciences. All rights reserved.</p>
          <p>Website in development</p>
        </div>
      </div>
    </footer>
  );
}
