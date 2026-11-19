import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { updateStudentProfile } from "@/app/students/actions";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit learner profile",
  description: "Manage your RISA learner profile.",
  robots: { index: false, follow: false },
};

const messages: Record<string, string> = {
  name: "Enter your name using 2–80 characters.",
  photo: "Upload a valid JPG, PNG or WebP photo no larger than 2 MB.",
  service: "We couldn't save your changes. Please try again.",
};

export default async function StudentProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  if (!isStudentAuthConfigured()) {
    redirect("/students/login");
  }

  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }

  const user = await getStudentIdentity(token);
  if (!user) {
    redirect("/students/login");
  }

  const { error, status } = await searchParams;
  const message = error && Object.hasOwn(messages, error) ? messages[error] : null;
  const initials =
    user.fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "R";

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 sm:py-16"
    >
      <Link
        href="/students/dashboard"
        className="text-sm font-semibold text-[#286518] underline-offset-4 hover:underline"
      >
        ← Back to My Learning
      </Link>

      <section className="risa-science-glass mt-6 rounded-[2rem] p-6 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#286518]">
          RISA student portal
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-slate-950 sm:text-4xl">
          Edit your profile
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Personalize your learner profile with your preferred display name and a profile
          picture. Your account email cannot be changed here.
        </p>

        {status === "saved" && (
          <p
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-[#eefce5] p-4 text-sm font-semibold text-[#286518]"
          >
            Profile changes saved successfully.
          </p>
        )}
        {message && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {message}
          </p>
        )}

        <form action={updateStudentProfile} className="mt-8 space-y-7">
          <div className="flex flex-wrap items-center gap-5 rounded-[1.5rem] border border-white/90 bg-white/60 p-5">
            <div
              aria-label="Current profile picture"
              className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#38b6ff] via-[#155DFC] to-[#123e8a] text-3xl font-bold text-white shadow-md"
            >
              {user.avatarPath ? (
                <Image
                  src="/students/avatar"
                  alt="Your current profile picture"
                  width={96}
                  height={96}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <label
                htmlFor="student-avatar"
                className="block text-sm font-semibold text-slate-900"
              >
                Profile picture
              </label>
              <p className="mb-3 mt-1 text-xs leading-5 text-slate-600">
                Optional. JPG, PNG or WebP, up to 2 MB. Only your account can access the
                original photo.
              </p>
              <input
                id="student-avatar"
                type="file"
                name="avatar"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full min-w-0 max-w-md text-xs text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#eefce5] file:px-3 file:py-2 file:font-semibold file:text-[#286518]"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="student-display-name"
                className="text-sm font-semibold text-slate-900"
              >
                Display name
              </label>
              <input
                id="student-display-name"
                type="text"
                name="fullName"
                autoComplete="name"
                defaultValue={user.fullName}
                required
                minLength={2}
                maxLength={80}
                className="mt-2 min-h-12 w-full rounded-xl border border-white bg-white/85 px-4 py-3 text-base text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[#78eb29]"
              />
            </div>
            <div>
              <label
                htmlFor="student-email"
                className="text-sm font-semibold text-slate-900"
              >
                Registered email
              </label>
              <input
                id="student-email"
                type="email"
                value={user.email}
                readOnly
                className="mt-2 min-h-12 w-full rounded-xl border border-white bg-slate-100/85 px-4 py-3 text-base text-slate-600"
              />
              <p className="mt-2 text-xs text-slate-500">
                Email address changes are not available through this form.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white pt-6">
            <p className="max-w-sm text-xs leading-5 text-slate-500">
              Your photo and display name are profile details, not proof of enrolment or
              permission to access other learners&apos; records.
            </p>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#286518] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286518]"
            >
              Save profile changes
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
