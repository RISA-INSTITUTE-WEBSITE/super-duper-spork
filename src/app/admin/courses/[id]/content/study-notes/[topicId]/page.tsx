import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { RisaStudyNotesStudio } from "@/components/risa-study-notes-studio";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import { getRisaCourseById } from "@/lib/risa-course-admin";
import { getCourseCurriculum, uuidPattern } from "@/lib/risa-course-curriculum";
import { getTopicStudyNotes } from "@/lib/risa-study-notes";
import { getStudentIdentity } from "@/lib/student-auth-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Study Notes Studio | RISA", robots: { index: false, follow: false } };

export default async function StudyNotesStudioPage({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>;
}) {
  const { id, topicId } = await params;
  if (!uuidPattern.test(id) || !uuidPattern.test(topicId)) {
    notFound();
  }
  const token = (await cookies()).get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const identity = await getStudentIdentity(token);
  if (!identity || !(await isRisaAdministrator(token, identity.id))) {
    notFound();
  }
  const [course, curriculum, notes] = await Promise.all([
    getRisaCourseById(token, id),
    getCourseCurriculum(token, id, true),
    getTopicStudyNotes(token, topicId, true),
  ]);
  const topic = curriculum?.topics.find((item) => item.id === topicId);
  if (!course || !topic || !notes) {
    notFound();
  }
  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
      <Link href={"/admin/courses/" + id + "/content"} className="font-bold text-[#286518] hover:underline">
        ← Module content
      </Link>
      <RisaStudyNotesStudio
        courseId={id}
        topicId={topicId}
        topicTitle={course.code + " · " + topic.title}
        notes={notes}
      />
    </main>
  );
}
