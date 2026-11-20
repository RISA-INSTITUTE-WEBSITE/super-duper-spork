import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { signInStudent } from "@/app/students/actions";
import { isStudentAuthConfigured } from "@/lib/student-auth-api";
import { studentCsrfCookieName } from "@/lib/student-csrf";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student sign in",
  description: "Sign in securely to your RISA student account.",
};

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus-visible:border-[#286518] focus-visible:ring-2 focus-visible:ring-[#78eb29]/30";

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const { error, status } = await searchParams;
  const enabled = isStudentAuthConfigured();
  const csrfToken = (await cookies()).get(studentCsrfCookieName)?.value ?? "";

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-5 py-12 sm:px-8 lg:py-20"
    >
      <div className="w-full max-w-xl">
        <Link href="/" className="text-sm font-semibold text-[#286518] hover:underline">
          ← Back to RISA
        </Link>
        <div className="risa-science-glass mt-6 rounded-[1.75rem] p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#286518]">
            RISA student portal
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Sign in with your RISA account. Verified administrators are directed to the
            administration centre; learners continue to My Learning.
          </p>

          {!enabled && (
            <p
              role="status"
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              Student sign-in is not active yet. RISA is preparing its authentication
              service.
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              {error === "setup"
                ? "Student sign-in is not active yet."
                : error === "csrf"
                  ? "This form has expired. Reload the page and try again."
                  : error === "verify"
                    ? "Please verify your email address before signing in."
                    : error === "confirmation"
                      ? "We could not confirm your email. Please request a new confirmation email through the RISA team."
                      : "Unable to sign in. Check your credentials and try again."}
            </p>
          )}
          {status === "signed-out" && (
            <p
              role="status"
              className="mt-6 rounded-xl bg-[#eefce5] p-4 text-sm text-[#286518]"
            >
              You have signed out.
            </p>
          )}

          <form action={signInStudent} className="mt-8 space-y-5">
            <input type="hidden" name="csrf_token" value={csrfToken} />
            <fieldset disabled={!enabled} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="text-sm font-semibold text-slate-800"
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="text-sm font-semibold text-slate-800"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#286518] px-5 py-3 font-heading text-base font-semibold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sign in
              </button>
            </fieldset>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            New student?{" "}
            <Link
              href="/students/register"
              className="font-bold text-[#286518] underline underline-offset-2"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
