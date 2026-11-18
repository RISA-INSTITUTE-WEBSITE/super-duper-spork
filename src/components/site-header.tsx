import Image from "next/image";
import Link from "next/link";

import { MobileNavigation } from "@/components/mobile-navigation";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/programmes", label: "Programmes" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="risa-navbar relative z-20 border-b border-[#78eb29]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 md:grid md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-8 md:py-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,21rem)_minmax(0,1fr)] lg:gap-x-6">
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
        <MobileNavigation />
        <form
          role="search"
          action="/search"
          method="get"
          className="relative hidden w-full md:block md:max-w-md md:justify-self-end lg:max-w-none lg:justify-self-center"
        >
          <label htmlFor="risa-site-search" className="sr-only">
            Search RISA website
          </label>
          <input
            id="risa-site-search"
            name="q"
            type="search"
            placeholder="Search RISA..."
            required
            maxLength={100}
            className="min-h-11 w-full rounded-full border border-slate-200 bg-[#f8fafc] py-2.5 pr-12 pl-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 hover:border-slate-300 focus-visible:border-[#78eb29] focus-visible:ring-2 focus-visible:ring-[#78eb29]/30"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute inset-y-1 right-1 flex w-10 items-center justify-center rounded-full text-[#286518] transition hover:bg-[#eafbdc] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#286518]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>
        </form>
        <nav
          aria-label="Primary navigation"
          className="hidden md:col-span-2 md:block lg:col-span-1 lg:justify-self-end"
        >
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-semibold text-slate-700 sm:gap-x-3">
            {navigation.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex min-h-10 items-center rounded-xl px-3 py-2 transition hover:bg-[#eefce5] hover:text-[#286518] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518]"
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
