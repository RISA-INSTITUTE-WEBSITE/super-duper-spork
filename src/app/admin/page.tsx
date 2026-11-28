import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOutStudent } from "@/app/students/actions";
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
}: {
  label: string;
  value: number | null;
}) {
  return (
    <article className="risa-glass-card rounded-[1.5rem] p-5 sm:p-6">
      <p className="text-sm font-semibold text-[#286518]">{label}</p>
      <p className="mt-3 font-heading text-4xl font-bold tabular-nums text-slate-950">
        {value ?? "—"}
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
      className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 lg:py-10"
    >
      <section className="risa-science-glass relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#78eb29]/20 blur-3xl"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#286518]">
              RISA / Administration
            </p>
            <h1 className="mt-3 font-heading text-3xl font-bold text-slate-950 sm:text-4xl">
              Administration Centre
            </h1>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#eefce5] px-4 py-2 text-xs font-bold text-[#286518]">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#286518]" />
              Administrator access verified
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/students/dashboard"
              className="inline-flex min-h-11 items-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4f11]"
            >
              My Learning
            </Link>
            <form action={signOutStudent}>
              <button
                type="submit"
                className="min-h-11 rounded-xl border border-white bg-white/85 px-5 py-2 text-sm font-semibold text-[#286518] hover:bg-white focus-visible:outline-2 focus-visible:outline-[#286518]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </section>

      <section aria-labelledby="admin-overview-heading" className="mt-8">
        <h2
          id="admin-overview-heading"
          className="font-heading text-2xl font-bold text-slate-950 sm:text-3xl"
        >
          Learning platform overview
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetric
            label="Courses"
            value={overview.courses}
          />
          <AdminMetric
            label="Modules"
            value={overview.modules}
          />
          <AdminMetric
            label="Enrolments"
            value={overview.enrolments}
          />
          <AdminMetric
            label="Course files"
            value={overview.materials}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <article className="risa-glass-card rounded-[1.5rem] p-5 sm:p-6">
          <h2 className="text-xl font-bold">Study Notes Studio</h2>
          <Link
            href="/admin/study-notes"
            className="mt-3 inline-flex font-bold text-[#286518]"
          >
            Open Study Notes Studio →
          </Link>
        </article>
        <article className="risa-glass-card rounded-[1.5rem] p-5 sm:p-6">
          <h2 className="text-xl font-bold">Institutional policies</h2>
          <Link
            href="/admin/policies"
            className="mt-3 inline-flex font-bold text-[#286518]"
          >
            Manage policies →
          </Link>
        </article>
        <article className="risa-glass-card rounded-[1.5rem] p-5 sm:p-6">
          <h2 className="text-xl font-bold">Labs — private preview</h2>
          <Link href="/admin/labs" className="mt-3 inline-flex font-bold text-[#286518]">
            Open lab preview →
          </Link>
        </article>
        <article className="risa-glass-card rounded-[1.5rem] p-5 sm:p-6">
          <h2 className="text-xl font-bold">Lecturer management</h2>
          <Link
            href="/admin/lecturers"
            className="mt-3 inline-flex font-bold text-[#286518]"
          >
            Manage lecturers →
          </Link>
        </article>
        <article className="risa-science-glass rounded-[1.5rem] p-5 sm:p-6">
          <h2 className="font-heading text-xl font-bold text-slate-950">
            Course administration
          </h2>
          <Link
            href="/admin/courses"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4f11]"
          >
            Manage courses →
          </Link>
        </article>
        <article className="risa-glass-card rounded-[1.5rem] p-5 sm:p-6">
          <h2 className="font-heading text-xl font-bold text-slate-950">
            Enrolment requests
          </h2>
          <Link
            href="/admin/enrolment-requests"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4f11]"
          >
            Review enrolment requests →
          </Link>
        </article>
        <article className="risa-glass-card rounded-[1.5rem] p-5 sm:p-6">
          <h2 className="font-heading text-xl font-bold text-slate-950">
            Account and permissions
          </h2>
          <Link
            href="/students/profile"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4f11]"
          >
            Edit my profile
          </Link>
        </article>
      </section>
    </main>
  );
}
