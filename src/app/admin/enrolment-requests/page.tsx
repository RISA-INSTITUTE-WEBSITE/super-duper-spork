import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { reviewEnrolmentAction } from "@/app/admin/enrolment-requests/actions";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import { getRisaAdminCourses } from "@/lib/risa-course-admin";
import { getPendingCourseEnrolmentRequests } from "@/lib/risa-course-enrolment";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Enrolment requests | RISA Administration",
  robots: { index: false, follow: false },
};

export default async function AdminEnrolmentRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  if (!isStudentAuthConfigured()) {
    redirect("/students/login");
  }
  const token = (await cookies()).get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const identity = await getStudentIdentity(token);
  if (!identity || !(await isRisaAdministrator(token, identity.id))) {
    notFound();
  }

  const [requests, courses] = await Promise.all([
    getPendingCourseEnrolmentRequests(token),
    getRisaAdminCourses(token),
  ]);
  const { result } = await searchParams;

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8"
    >
      <Link
        href="/admin"
        className="text-sm font-semibold text-[#286518] hover:underline"
      >
        ← Administration Centre
      </Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[#286518]">
        RISA / Administration / Enrolment
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold text-slate-950 sm:text-4xl">
        Course enrolment requests
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
        Review requests submitted by registered learners. Approval adds the learner to the
        selected course and unlocks its lessons, quizzes and authorised materials.
      </p>

      {result && (
        <p
          role="status"
          className={
            "mt-6 rounded-xl border p-4 text-sm " +
            (result === "approved" || result === "declined"
              ? "border-[#78eb29]/40 bg-[#eefce5] text-[#286518]"
              : "border-amber-200 bg-amber-50 text-amber-900")
          }
        >
          {result === "approved"
            ? "The learner has been enrolled successfully."
            : result === "declined"
              ? "The enrolment request has been declined."
              : "The request could not be processed. Please check the record and retry."}
        </p>
      )}

      {requests === null || courses === null ? (
        <p role="alert" className="mt-8 rounded-xl bg-amber-50 p-6 text-amber-900">
          The enrolment request list is temporarily unavailable.
        </p>
      ) : requests.length === 0 ? (
        <p className="risa-science-glass mt-8 rounded-2xl p-8 text-slate-600">
          No pending course enrolment requests.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {requests.map((request) => {
            const course = courses.find((item) => item.id === request.courseId);
            return (
              <article
                key={request.courseId + request.studentId}
                className="risa-glass-card rounded-[1.6rem] p-6"
              >
                <span className="rounded-full bg-[#eefce5] px-3 py-1.5 text-xs font-bold text-[#286518]">
                  Pending approval
                </span>
                <h2 className="mt-5 font-heading text-lg font-bold text-slate-950">
                  {course ? course.code + " — " + course.title : request.courseId}
                </h2>
                <p className="mt-3 break-all text-sm text-slate-700">
                  <strong>Registered email:</strong> {request.email}
                </p>
                <p className="mt-2 break-all text-xs text-slate-500">
                  Learner ID: {request.studentId}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Requested: {new Date(request.createdAt).toLocaleDateString("en-ZA")}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <form action={reviewEnrolmentAction}>
                    <input type="hidden" name="courseId" value={request.courseId} />
                    <input type="hidden" name="studentId" value={request.studentId} />
                    <input type="hidden" name="decision" value="approved" />
                    <button
                      type="submit"
                      className="min-h-11 rounded-xl bg-[#286518] px-5 py-2 text-sm font-bold text-white hover:bg-[#1d4f11]"
                    >
                      Approve &amp; enrol
                    </button>
                  </form>
                  <form action={reviewEnrolmentAction}>
                    <input type="hidden" name="courseId" value={request.courseId} />
                    <input type="hidden" name="studentId" value={request.studentId} />
                    <input type="hidden" name="decision" value="declined" />
                    <button
                      type="submit"
                      className="min-h-11 rounded-xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
                    >
                      Decline
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
