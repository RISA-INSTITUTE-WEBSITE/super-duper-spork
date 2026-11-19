import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutStudent } from "@/app/students/actions";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student dashboard",
  description: "Your private RISA student account.",
  robots: { index: false, follow: false },
};

export default async function StudentDashboardPage() {
  if (!isStudentAuthConfigured()) {
    redirect("/students/login");
  }

  const jar = await cookies();
  const accessToken = jar.get(studentCookieNames.access)?.value;
  if (!accessToken) {
    redirect("/students/login");
  }

  // Never authorize from an unverified cookie/JWT or user-editable metadata.
  const user = await getStudentIdentity(accessToken);
  if (!user) {
    redirect("/students/login");
  }

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 lg:py-20"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#286518]">
            RISA student portal
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
            Welcome, {user.fullName}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Your student account is ready to use.
          </p>
        </div>
        <form action={signOutStudent}>
          <button
            type="submit"
            className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#78eb29] hover:text-[#286518] focus-visible:outline-2 focus-visible:outline-[#286518]"
          >
            Sign out
          </button>
        </form>
      </div>

      <section className="risa-science-glass mt-10 rounded-[1.75rem] p-6 sm:p-9">
        <h2 className="font-heading text-xl font-semibold text-slate-950">
          Your account
        </h2>
        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Registered email
            </dt>
            <dd className="mt-1 break-all text-base text-slate-800">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Account status
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[#286518]">Active</dd>
          </div>
        </dl>
        <div className="mt-8 rounded-xl bg-white/80 p-5 text-sm leading-7 text-slate-600">
          Course enrolment, assessments and progress tracking are still being developed.
          Creating a student account does not enrol you in a programme.
        </div>
        <Link
          href="/programmes"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4f11]"
        >
          Explore proposed learning pathways
        </Link>
      </section>
    </main>
  );
}
