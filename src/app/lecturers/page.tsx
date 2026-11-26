import Link from "next/link";

import { requireLearningSession } from "@/lib/risa-staff-session";
import { getLecturerAssignments } from "@/lib/risa-lecturers";
import { getRisaAdminCourses } from "@/lib/risa-course-admin";
import { isRisaAdministrator } from "@/lib/risa-admin-api";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lecturer dashboard | RISA", robots: { index: false, follow: false } };

export default async function LecturerPage() {
  const { token, identity } = await requireLearningSession();
  const [assignments, admin] = await Promise.all([
    getLecturerAssignments(token, identity.id),
    isRisaAdministrator(token, identity.id),
  ]);
  const courses = await getRisaAdminCourses(token);
  const assigned = courses?.filter((course) => admin || assignments?.some((item) => item.course_id === course.id));
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-5 py-10">
      <Link href="/students/dashboard" className="font-bold text-[#286518]">← My Learning</Link>
      <h1 className="text-3xl font-bold">Lecturer dashboard</h1>
      <p className="text-slate-600">Review practical submissions and monitor the modules you teach.</p>
      {assignments === null || courses === null ? <p role="alert">Teaching assignments unavailable.</p> : !assigned?.length ? <p>No modules assigned. Contact RISA administration.</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {assigned?.map((course) => <Link key={course.id} href={"/lecturers/" + course.id} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-[#286518]">
          <p className="font-mono text-xs font-bold text-[#286518]">{course.code}</p>
          <h2 className="mt-2 text-xl font-bold">{course.title}</h2>
          <p className="mt-3 text-sm font-semibold text-[#286518]">Review practicals →</p>
        </Link>)}
      </div>
    </main>
  );
}
