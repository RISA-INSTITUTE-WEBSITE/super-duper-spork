import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { RisaStudyNoteMarkdown } from "@/components/risa-study-note-markdown";
import { getCourseCurriculum, uuidPattern } from "@/lib/risa-course-curriculum";
import { getTopicStudyNotes } from "@/lib/risa-study-notes";
import { getStudentIdentity } from "@/lib/student-auth-api";
import { getEnrolledCourses } from "@/lib/student-learning-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Study notes | RISA",
  robots: { index: false, follow: false },
};

export default async function StudyNotesPage({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>;
}) {
  const { id, topicId } = await params;
  if (!uuidPattern.test(id) || !uuidPattern.test(topicId)) {
    notFound();
  }
  const { token, identity } = await requireEnrolledLearner(id);
  const [curriculum, notes] = await Promise.all([
    getCourseCurriculum(token, id),
    getTopicStudyNotes(token, topicId),
  ]);
  const topic = curriculum?.topics.find((item) => item.id === topicId);
  if (!topic || !notes?.length) {
    notFound();
  }
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8">
      <Link
        href={"/students/courses/" + id + "?topic=" + topicId}
        className="font-bold text-[#286518] hover:underline"
      >
        ← {topic.title}
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Study notes</h1>
      <div className="mt-6 grid gap-6">
        {notes.map((note) => (
          <article
            key={note.id}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-9"
          >
            <h2 className="mb-5 text-2xl font-bold">{note.title}</h2>
            <RisaStudyNoteMarkdown
              key={note.id + note.updated_at}
              text={note.markdown}
              checklistStorageKey={
                "risa-study-note:" + identity.id + ":" + note.id + ":" + note.updated_at
              }
            />
          </article>
        ))}
      </div>
    </main>
  );
}

async function requireEnrolledLearner(id: string) {
  const token = (await cookies()).get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const identity = await getStudentIdentity(token);
  if (!identity) {
    redirect("/students/login");
  }
  const enrolled = await getEnrolledCourses(token, identity.id);
  if (!enrolled?.some((course) => course.id === id)) {
    notFound();
  }
  return { token, identity };
}
