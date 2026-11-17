import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/programmes", label: "Programmes" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          aria-label="RISA Institute of Applied Sciences homepage"
        >
          <span
            className="flex size-11 items-center justify-center rounded-xl bg-blue-900 text-lg font-bold text-white"
            aria-hidden="true"
          >
            R
          </span>
          <span className="max-w-48 text-sm leading-tight">
            RISA{" "}
            <span className="block font-normal text-slate-600">
              Institute of Applied Sciences
            </span>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-slate-700 sm:gap-x-7">
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
