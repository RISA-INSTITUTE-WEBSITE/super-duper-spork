import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Student account privacy notice",
  description: "How information is handled during RISA student account registration.",
};

export default function StudentPrivacyNoticePage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl flex-1 px-5 py-12 sm:px-8 lg:py-20"
    >
      <Link
        href="/students/register"
        className="text-sm font-semibold text-[#286518] hover:underline"
      >
        ← Return to student registration
      </Link>
      <div className="risa-science-glass mt-6 rounded-[1.75rem] p-7 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#286518]">
          RISA student portal
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
          Student account privacy notice
        </h1>
        <p className="mt-5 leading-7 text-slate-700">
          When you create a student account, RISA needs your name, email address and
          authentication credentials to identify you, secure sign-in and send a
          verification message. RISA does not ask for identity documents, payment
          information or academic records during account registration.
        </p>
        <h2 className="mt-8 font-heading text-xl font-semibold">
          How accounts are protected
        </h2>
        <p className="mt-3 leading-7 text-slate-700">
          The authentication provider stores and checks password credentials. The website
          uses secure, HTTP-only session cookies for sign-in. Account access is restricted
          to someone who signs in with the registered email and password. While
          email verification is disabled, the registered address may not belong to
          the account holder.
        </p>
        <h2 className="mt-8 font-heading text-xl font-semibold">
          Why we use this information
        </h2>
        <p className="mt-3 leading-7 text-slate-700">
          We use your details to create and secure your account and communicate about
          sign-in. Registration does not mean admission into a course, and it is not a
          payment or enrolment process.
        </p>
        <h2 className="mt-8 font-heading text-xl font-semibold">Questions or requests</h2>
        <p className="mt-3 leading-7 text-slate-700">
          For questions about access, correction, removal or how your information is
          handled, contact the RISA team using the{" "}
          <Link href="/contact" className="font-semibold text-[#286518] underline">
            contact page
          </Link>
          . RISA must finalise its retention, hosting-region and data-protection
          procedures before enabling public registration.
        </p>
      </div>
    </main>
  );
}
