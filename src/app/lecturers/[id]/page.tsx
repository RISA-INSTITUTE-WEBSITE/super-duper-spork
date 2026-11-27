import Link from "next/link";
import { notFound } from "next/navigation";

import { reviewPracticalAction } from "../actions";
import { requireLearningSession } from "@/lib/risa-staff-session";
import {
  getLecturerAssignments,
  getModuleLearnerCount,
  getPracticalSubmissions,
  type PracticalSubmission,
} from "@/lib/risa-lecturers";
import { getRisaCourseById } from "@/lib/risa-course-admin";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import { uuidPattern } from "@/lib/risa-course-curriculum";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Module practical review | RISA",
  robots: { index: false, follow: false },
};

async function requireModuleReviewer(id: string) {
  if (!uuidPattern.test(id)) {
    notFound();
  }
  const session = await requireLearningSession();
  const [assignments, admin] = await Promise.all([
    getLecturerAssignments(session.token, session.identity.id),
    isRisaAdministrator(session.token, session.identity.id),
  ]);
  if (!admin && !assignments?.some((item) => item.course_id === id)) {
    notFound();
  }
  return session;
}

function ReviewCard({
  item,
  reviewerId,
}: {
  item: PracticalSubmission;
  reviewerId: string;
}) {
  return (
    <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-bold capitalize">
        {item.activity} — {item.score === null ? "Awaiting review" : "Reviewed"}
      </h2>
      <p className="break-all font-mono text-xs text-slate-600">
        Learner ID: {item.student_id}
      </p>
      <pre className="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-sm">
        {item.evidence}
      </pre>
      {item.student_id === reviewerId ? (
        <p>You cannot mark your own submission.</p>
      ) : (
        <form action={reviewPracticalAction} className="space-y-3">
          <input type="hidden" name="courseId" value={item.course_id} />
          <input type="hidden" name="id" value={item.id} />
          <label className="block font-semibold">
            Practice score / 100
            <input
              name="score"
              type="number"
              required
              min={0}
              max={100}
              defaultValue={item.score ?? undefined}
              className="ml-3 w-24 rounded-lg border border-slate-300 p-2"
            />
          </label>
          <label className="block font-semibold">
            Feedback
            <textarea
              name="feedback"
              required
              maxLength={2000}
              rows={4}
              defaultValue={item.feedback ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            />
          </label>
          <button className="rounded-xl bg-[#286518] px-5 py-3 font-bold text-white">
            Save review
          </button>
        </form>
      )}
    </article>
  );
}

export default async function ModuleReviews({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { id } = await params;
  const { token, identity } = await requireModuleReviewer(id);
  const [course, submissions, count, { result }] = await Promise.all([
    getRisaCourseById(token, id),
    getPracticalSubmissions(token, { courseId: id }),
    getModuleLearnerCount(token, id),
    searchParams,
  ]);
  if (!course) {
    notFound();
  }
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-5 py-10"
    >
      <Link href="/lecturers" className="font-bold text-[#286518]">
        ← Assigned modules
      </Link>
      <h1 className="text-3xl font-bold">
        {course.code} — {course.title}
      </h1>
      <p>
        {count ?? "—"} enrolled learners · {submissions?.length ?? "—"} recent submissions
        (up to 100)
      </p>
      <p className="text-sm text-slate-600">
        Practice reviews are formative feedback, not official grades.
      </p>
      {result && (
        <p role="status">
          {result === "saved" ? "Review saved." : "Review could not be saved."}
        </p>
      )}
      {submissions === null && <p role="alert">Submissions unavailable.</p>}
      {submissions?.map((item) => (
        <ReviewCard key={item.id} item={item} reviewerId={identity.id} />
      ))}
    </main>
  );
}
