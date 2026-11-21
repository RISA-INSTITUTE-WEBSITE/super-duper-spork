"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { registerStudent } from "@/app/students/actions";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus-visible:border-[#286518] focus-visible:ring-2 focus-visible:ring-[#78eb29]/30";

function SubmitButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!enabled || pending}
      className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#286518] px-5 py-3 font-heading text-base font-semibold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Creating your account..." : "Create student account"}
    </button>
  );
}

export function StudentRegistrationForm({
  enabled,
  csrfToken,
}: {
  enabled: boolean;
  csrfToken: string;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const rules = [
    { label: "At least 10 characters", met: password.length >= 10 },
    { label: "Contains a letter", met: /[a-zA-Z]/.test(password) },
    { label: "Contains a number", met: /[0-9]/.test(password) },
    { label: "Contains a special character", met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <form action={registerStudent} className="mt-8 space-y-5">
      <input type="hidden" name="csrf_token" value={csrfToken} />
      <fieldset disabled={!enabled} className="space-y-5">
        <div>
          <label htmlFor="student-name" className="text-sm font-semibold text-slate-800">
            Full name
          </label>
          <input
            id="student-name"
            name="fullName"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={80}
            placeholder="Your full name"
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="student-email" className="text-sm font-semibold text-slate-800">
            Email address
          </label>
          <input
            id="student-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="you@example.com"
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label
            htmlFor="student-password"
            className="text-sm font-semibold text-slate-800"
          >
            Create a password
          </label>
          <input
            id="student-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={128}
            required
            className={fieldClass}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby="student-password-rules"
          />
          {password.length > 0 && (
            <div
              id="student-password-rules"
              className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs"
              aria-live="polite"
            >
              <p className="mb-2 font-semibold text-slate-600">Password requirements</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {rules.map(({ label, met }) => (
                  <li
                    key={label}
                    className={met ? "font-medium text-[#286518]" : "text-red-700"}
                  >
                    {met ? "✓" : "○"} {label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <label
            htmlFor="student-confirm"
            className="text-sm font-semibold text-slate-800"
          >
            Confirm password
          </label>
          <input
            id="student-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={128}
            required
            className={fieldClass}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
          {confirmation && (
            <p
              role="status"
              className={
                "mt-2 text-xs font-medium " +
                (confirmation === password ? "text-[#286518]" : "text-red-700")
              }
            >
              {confirmation === password ? "Passwords match" : "Passwords do not match"}
            </p>
          )}
        </div>
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
          <input
            name="acceptedPrivacy"
            type="checkbox"
            required
            className="mt-1 size-4 accent-[#286518]"
          />
          <span>
            I have read the{" "}
            <Link
              href="/students/privacy"
              className="font-semibold text-[#286518] underline underline-offset-2"
            >
              student account privacy notice
            </Link>{" "}
            and understand how my information will be used.
          </span>
        </label>
      </fieldset>
      <SubmitButton enabled={enabled} />
      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/students/login" className="font-bold text-[#286518] underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
