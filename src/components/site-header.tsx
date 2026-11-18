import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/programmes", label: "Programmes" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between md:py-5">
        <Link
          href="/"
          className="flex w-fit items-center gap-3 rounded-md text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          aria-label="RISA Institute of Applied Sciences homepage"
        >
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0b2450] text-xl font-black text-white shadow-sm"
            aria-hidden="true"
          >
            R<span className="text-cyan-300">.</span>
          </span>
          <span className="text-base font-extrabold leading-tight tracking-tight">
            RISA
            <span className="block text-xs font-medium tracking-normal text-slate-500">
              Institute of Applied Sciences
            </span>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-slate-700 sm:gap-x-8">
            {navigation.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="rounded-sm transition hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
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
