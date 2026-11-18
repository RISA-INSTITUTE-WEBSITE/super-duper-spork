import Image from "next/image";
import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/programmes", label: "Programmes" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="risa-navbar relative z-20 border-b border-[#cdddf5]/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between md:py-5">
        <Link
          href="/"
          className="flex w-fit items-center gap-3 rounded-md text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          aria-label="RISA Institute of Applied Sciences homepage"
        >
          <Image
            src="/risa-logo.svg"
            alt=""
            width={64}
            height={64}
            className="size-14 shrink-0 rounded-full object-contain"
            priority
          />
          <span className="text-base font-extrabold leading-tight tracking-tight text-[#0A0F1D]">
            RISA
            <span className="block text-xs font-medium tracking-normal text-slate-500">
              Institute of Applied Sciences
            </span>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-semibold text-slate-700 sm:gap-x-3">
            {navigation.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex min-h-10 items-center rounded-xl px-3 py-2 transition hover:bg-white/70 hover:text-[#155DFC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
