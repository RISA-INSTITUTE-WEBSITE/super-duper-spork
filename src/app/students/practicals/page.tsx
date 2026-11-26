import Link from "next/link";

import { submitPracticalAction } from "./actions";
import { requireLearningSession } from "@/lib/risa-staff-session";
import { getPracticalSubmissions } from "@/lib/risa-lecturers";
import { getEnrolledCourses } from "@/lib/student-learning-api";
import { workspaceActivities } from "@/lib/risa-workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "My practicals | RISA", robots: { index: false, follow: false } };

const field = "mt-2 w-full rounded-xl border border-slate-300 p-3";

export default async function StudentPracticalsPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const { token, identity } = await requireLearningSession();
  const [courses, submissions, { result }] = await Promise.all([
    getEnrolledCourses(token, identity.id),
    getPracticalSubmissions(token, { studentId: identity.id }),
    searchParams,
  ]);
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-5 py-10">
      <Link href="/workspace" className="font-bold text-[#286518]">← Practical Workspace</Link>
      <h1 className="text-3xl font-bold">My practical submissions</h1>
      {result && <p role="status">{result === "saved" ? "Evidence submitted." : "Submission could not be saved. Check your enrolment and input."}</p>}
      <form action={submitPracticalAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <label className="block font-semibold">Module
          <select name="courseId" required className={field}>
            {(courses ?? []).map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </label>
        <label className="block font-semibold">Activity
          <select name="activity" className={field}>{workspaceActivities.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        </label>
        <label className="block font-semibold">Code, output and explanation
          <textarea name="evidence" required maxLength={6000} rows={8} className={field} />
        </label>
        <p className="text-sm text-slate-600">Submit only your own work; do not include credentials or personal data. Practice scores are not formal module grades.</p>
        <button disabled={!courses?.length} className="rounded-xl bg-[#286518] px-5 py-3 font-bold text-white disabled:opacity-50">Submit evidence</button>
        {!courses?.length && <p>Module enrolment is required before submission.</p>}
      </form>
      <h2 className="text-xl font-bold">Recent submissions</h2>
      {submissions === null && <p role="alert">Submissions could not be loaded.</p>}
      {submissions?.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold capitalize">{item.activity} — {courses?.find((course) => course.id === item.course_id)?.title ?? "Module"}</h3>
        <pre className="mt-3 whitespace-pre-wrap break-words text-sm">{item.evidence}</pre>
        <p className="mt-3 font-semibold">{item.score === null ? "Awaiting review" : "Practice score: " + item.score + "/100"}</p>
        {item.feedback && <p className="mt-2 whitespace-pre-wrap">{item.feedback}</p>}
      </article>)}
    </main>
  );
}
