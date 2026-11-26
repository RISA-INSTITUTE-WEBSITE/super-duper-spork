import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";

import { HeaderProfileLink, type HeaderUser } from "@/components/header-profile-link";
import { MobileNavigation } from "@/components/mobile-navigation";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import { studentCookieNames } from "@/lib/student-session";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/programmes", label: "Programmes" },
  { href: "/computing-lab", label: "Labs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

async function getHeaderUser(): Promise<HeaderUser | null> {
  if (!isStudentAuthConfigured()) {
    return null;
  }

  const token = (await cookies()).get(studentCookieNames.access)?.value;
  if (!token) {
    return null;
  }

  // A valid cookie alone is not sufficient; Supabase verifies the active session.
  const identity = await getStudentIdentity(token);
  if (!identity) {
    return null;
  }

  const initials =
    identity.fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "R";

  return {
    fullName: identity.fullName,
    initials,
    isAdmin: await isRisaAdministrator(token, identity.id),
    avatarUrl: identity.avatarPath
      ? "/students/avatar?updated=" + encodeURIComponent(identity.updatedAt ?? "")
      : null,
  };
}

export async function SiteHeader() {
  const user = await getHeaderUser();

  return (
    <header className="risa-navbar relative z-20 border-b border-[#78eb29]">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:gap-4 lg:py-4">
        <Link
          href="/"
          className="flex w-fit shrink-0 items-center gap-2 rounded-md text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
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
            <span className="hidden text-xs font-medium tracking-normal text-slate-500 2xl:block">
              Institute of Applied Sciences
            </span>
          </span>
        </Link>
        <MobileNavigation user={user} />
        <form
          id="risa-desktop-search-form"
          role="search"
          action="/search"
          method="get"
          className="relative hidden min-w-0 max-w-[17rem] flex-1 lg:block"
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
        <nav aria-label="Primary navigation" className="hidden shrink-0 lg:block">
          <ul className="flex items-center gap-0.5 whitespace-nowrap font-heading text-base font-semibold text-slate-700 xl:gap-1">
            {navigation.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex min-h-11 items-center rounded-xl px-2.5 py-2 transition hover:bg-[#eefce5] hover:text-[#286518] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518] xl:px-3"
                >
                  {label}
                </Link>
              </li>
            ))}
            {user ? (
              <>
                {user.isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      className="inline-flex min-h-11 items-center rounded-xl bg-[#eefce5] px-3 py-2 text-sm font-bold text-[#286518] transition hover:bg-[#daf4c6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518]"
                    >
                      Admin
                    </Link>
                  </li>
                )}
                <li className="ml-2 flex items-center">
                  <HeaderProfileLink user={user} />
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/students/login"
                    className="inline-flex min-h-11 items-center rounded-xl px-2.5 py-2 text-[#286518] transition hover:bg-[#eefce5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518] xl:px-3"
                  >
                    Sign In
                  </Link>
                </li>
                <li className="ml-1">
                  <Link
                    href="/students/register"
                    className="inline-flex min-h-11 items-center rounded-full bg-[#286518] px-4 py-2 text-white shadow-sm transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518]"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
