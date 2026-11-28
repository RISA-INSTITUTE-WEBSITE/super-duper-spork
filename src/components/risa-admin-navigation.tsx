"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  {
    href: "/admin",
    label: "Overview",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  },
  {
    href: "/admin/courses",
    label: "Courses & modules",
    icon: "M4 19V5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 1 0-4h14",
  },
  {
    href: "/admin/study-notes",
    label: "Study Notes Studio",
    icon: "M12 6C9 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2zm0 0v15",
  },
  {
    href: "/admin/lecturers",
    label: "Lecturers",
    icon: "M4 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m8 4 3 3-3 3",
  },
  {
    href: "/admin/enrolment-requests",
    label: "Enrolment requests",
    icon: "M9 11l3 3 7-7M20 12v7H4V3h12",
  },
  {
    href: "/admin/policies",
    label: "Institutional policies",
    icon: "M6 2h8l5 5v15H6zM14 2v6h5M9 13h7m-7 4h7",
  },
  {
    href: "/admin/labs",
    label: "Labs (private)",
    icon: "M9 3h6m-5 0v7L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2l-6-9V3M7 15h10",
  },
  {
    href: "/students/profile",
    label: "Account",
    icon: "M20 21v-2a7 7 0 0 0-7-7h-2a7 7 0 0 0-7 7v2M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  },
] as const;

export function RisaAdminNavigation() {
  const pathname = usePathname();
  return (
    <div className="mx-auto w-full max-w-7xl px-5 pt-6 sm:px-8">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <Link href="/" className="hover:text-[#286518]">
          Home
        </Link>
        <span aria-hidden="true">›</span>
        <Link href="/admin" className="font-heading text-base font-bold text-[#286518]">
          Administration Centre
        </Link>
      </div>
      <nav aria-label="Administration navigation" className="mt-4 overflow-x-auto pb-2">
        <ul className="flex w-max min-w-full items-center gap-1">
          {tabs.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== "/admin" && pathname.startsWith(tab.href + "/"));
            return (
              <li key={tab.href} className="shrink-0">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-[#286518] " +
                    (active
                      ? "bg-[#286518] text-white"
                      : "text-slate-700 hover:bg-[#eefce5] hover:text-[#286518]")
                  }
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4 shrink-0"
                  >
                    <path d={tab.icon} />
                  </svg>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function RefreshAdminButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        <path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7" />
      </svg>
      Refresh portal
    </button>
  );
}
