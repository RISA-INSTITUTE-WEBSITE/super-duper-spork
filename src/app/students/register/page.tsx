import type { Metadata } from "next";
import Link from "next/link";

import { StudentRegistrationForm } from "@/components/student-registration-form";
import { isStudentAuthConfigured } from "@/lib/student-auth-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create student account",
  description: "Register for a RISA student account using your email address.",
};

const errors: Record<string, string> = {
  name: "Enter your full name (2–80 characters).",
  email: "Enter a valid email address.",
  password: "Choose a password with at least 10 characters, a letter, a number and a special character.",
  confirmation: "The two passwords must match.",
  consent: "Please review and acknowledge the student account privacy notice.",
  service: "Registration is currently unavailable. Please try again later.",
  setup: "Student registration has not been activated yet.",
};

export default async function StudentRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const { error, status } = await searchParams;
  const enabled = isStudentAuthConfigured();
  const message = error && Object.hasOwn(errors, error) ? errors[error] : null;
  const submitted = status === "check-email";

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
            Create your account
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Set up your student sign-in. An account does not constitute admission or
            enrolment in any programme.
          </p>

          {!enabled && (
            <p role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Student registration is being prepared. The secure authentication service
              must be connected before accounts can be created.
            </p>
          )}
          {message && (
            <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {message}
            </p>
          )}
          {submitted ? (
            <div role="status" className="mt-6 rounded-xl border border-[#78eb29]/50 bg-[#eefce5] p-5 text-sm leading-7 text-[#286518]">
              If this email address is eligible for registration, a confirmation link
              will arrive shortly. Check your inbox and spam folder, then sign in.
              <p className="mt-3">
                <Link href="/students/login" className="font-bold underline">
                  Go to student sign in
                </Link>
              </p>
            </div>
          ) : (
            <StudentRegistrationForm enabled={enabled} />
          )}
        </div>
      </div>
    </main>
  );
}
