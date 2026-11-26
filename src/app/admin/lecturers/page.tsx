import Link from "next/link";

import { changeLecturerAction } from "./actions";
import { requireAdminSession } from "@/lib/risa-staff-session";
import { getLecturerAssignments } from "@/lib/risa-lecturers";
import { getRisaAdminCourses } from "@/lib/risa-course-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lecturer management | RISA", robots: { index: false, follow: false } };

export default async function ManageLecturersPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const { token } = await requireAdminSession();
  const [assignments, modules, { result }] = await Promise.all([
    getLecturerAssignments(token), getRisaAdminCourses(token), searchParams,
  ]);
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-5 py-10">
      <Link href="/admin" className="font-bold text-[#286518]">← Administration</Link>
      <h1 className="text-3xl font-bold">Lecturer management</h1>
      <p className="text-slate-600">Assign registered accounts to specific teaching modules. Lecturers never receive administrator privileges.</p>
      {result && <p role="status">{result === "saved" ? "Assignment updated." : "Could not update assignment. Check the account and module."}</p>}
      <form action={changeLecturerAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <label className="block font-semibold">Registered account UUID
          <input name="lecturerId" required maxLength={36} className="mt-2 w-full rounded-xl border border-slate-300 p-3" />
        </label>
        <p className="text-sm text-slate-600">Use the existing user ID from the Supabase Authentication user directory. Do not enter a password or token.</p>
        <label className="block font-semibold">Module
          <select name="courseId" required className="mt-2 w-full rounded-xl border border-slate-300 p-3">
            {modules?.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.title}</option>)}
          </select>
        </label>
        <button disabled={!modules?.length} className="rounded-xl bg-[#286518] px-5 py-3 font-bold text-white disabled:opacity-50">Assign lecturer</button>
      </form>
      <h2 className="text-xl font-bold">Current assignments</h2>
      {assignments === null && <p role="alert">Assignments unavailable.</p>}
      {assignments?.map((item) => (
        <form key={item.lecturer_id + item.course_id} action={changeLecturerAction} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <input type="hidden" name="lecturerId" value={item.lecturer_id} />
          <input type="hidden" name="courseId" value={item.course_id} />
          <input type="hidden" name="operation" value="remove" />
          <div className="min-w-0">
            <p className="font-bold">{modules?.find((module) => module.id === item.course_id)?.title ?? item.course_id}</p>
            <p className="break-all font-mono text-xs text-slate-600">{item.lecturer_id}</p>
          </div>
          <button className="rounded-xl border border-red-200 px-4 py-2 font-semibold text-red-800">Revoke assignment</button>
        </form>
      ))}
      <Link href="/lecturers" className="font-bold text-[#286518]">Lecturer dashboard →</Link>
    </main>
  );
}
