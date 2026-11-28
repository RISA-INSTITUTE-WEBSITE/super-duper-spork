import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOutStudent } from "@/app/students/actions";
import { RefreshAdminButton } from "@/components/risa-admin-navigation";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import { getRisaAdminOverview, isRisaAdministrator } from "@/lib/risa-admin-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RISA Administration",
  description: "Protected RISA administrator portal.",
  robots: { index: false, follow: false },
};

function AdminMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | null;
  icon: string;
}) {
  return (
    <article className="risa-glass-card min-w-0 rounded-2xl p-5">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 text-[#286518]"
      >
        <path d={icon} />
      </svg>
      <p
        className="mt-4 font-heading text-3xl font-bold tabular-nums text-slate-950"
        title={value === null ? "Count unavailable" : undefined}
      >
        {value ?? "—"}
      </p>
      <p className="mt-1 text-xs font-bold tracking-wide text-slate-600 uppercase">
        {label}
      </p>
    </article>
  );
}

export default async function RisaAdminPage() {
  if (!isStudentAuthConfigured()) {
    redirect("/students/login");
  }
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }

  const identity = await getStudentIdentity(token);
  if (!identity) {
    redirect("/students/login");
  }

  // Authorization is checked against current database membership on every request.
  if (!(await isRisaAdministrator(token, identity.id))) {
    notFound();
  }

  const overview = await getRisaAdminOverview(token);

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-7xl flex-1 px-5 pt-4 pb-12 sm:px-8"
    >
      <section className="rounded-2xl bg-gradient-to-br from-[#0a1610] to-[#102b1a] p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#a6ed87] uppercase">
              RISA Management CMS
            </p>
            <h1 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
              Administration Centre
            </h1>
            <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#d6f4c7]">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#78eb29]" />
              Administrator access verified
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RefreshAdminButton />
            <Link
              href="/students/dashboard"
              className="inline-flex min-h-10 items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            >
              My Learning
            </Link>
            <form action={signOutStudent}>
              <button
                type="submit"
                className="min-h-10 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </section>

      <section aria-labelledby="admin-overview-heading" className="mt-7">
        <h2
          id="admin-overview-heading"
          className="flex items-center gap-2 font-heading text-lg font-bold text-slate-950"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 text-[#286518]"
          >
            <path d="m3 17 6-6 4 4 8-9m-6 0h6v6" />
          </svg>
          Live platform statistics
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AdminMetric
            label="Courses"
            value={overview.courses}
            icon="M4 19V5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 1 0-4h14"
          />
          <AdminMetric
            label="Modules"
            value={overview.modules}
            icon="m12 2 10 5-10 5L2 7zm-10 10 10 5 10-5M2 17l10 5 10-5"
          />
          <AdminMetric
            label="Enrolments"
            value={overview.enrolments}
            icon="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m11 2v6m-3-3h6"
          />
          <AdminMetric
            label="Course files"
            value={overview.materials}
            icon="M6 2h8l5 5v15H6zM14 2v6h5M9 13h7m-7 4h7"
          />
        </div>
      </section>
    </main>
  );
}
