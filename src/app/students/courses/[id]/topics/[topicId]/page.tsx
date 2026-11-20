import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StudentPracticeQuiz } from "@/components/student-practice-quiz";
import { TopicVideoPlayer } from "@/components/topic-video-player";
import type { CourseCurriculum } from "@/lib/risa-course-curriculum";
import { getVerifiedStudentCourse } from "@/lib/verified-student-course";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Topic lessons | My Learning",
  description: "Watch RISA video lessons and complete topic practice quizzes.",
  robots: { index: false, follow: false },
};

function TopicQuizzes({
  curriculum,
  topicId,
}: {
  curriculum: CourseCurriculum;
  topicId: string;
}) {
  const quizzes = curriculum.quizzes.filter((quiz) => quiz.topic_id === topicId);
  if (quizzes.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="topic-quizzes-heading" className="mt-12 space-y-5">
      <h2
        id="topic-quizzes-heading"
        className="font-heading text-2xl font-bold text-slate-950"
      >
        Practice quizzes
      </h2>
      {quizzes.map((quiz) => (
        <StudentPracticeQuiz
          key={quiz.id}
          quiz={quiz}
          questions={curriculum.questions.filter((question) => question.quiz_id === quiz.id)}
        />
      ))}
    </section>
  );
}

export default async function StudentTopicPage({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>;
}) {
  const { id, topicId } = await params;
  const { course, curriculum } = await getVerifiedStudentCourse(id);
  const courseHref = "/students/courses/" + course.id;

  if (!curriculum) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8">
        <Link href={courseHref} className="text-sm font-semibold text-[#286518] hover:underline">
          ← Back to course topics
        </Link>
        <p role="alert" className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Topic lessons are temporarily unavailable. Please try again.
        </p>
      </main>
    );
  }

  const topic = curriculum.topics.find((item) => item.id === topicId);
  if (!topic) {
    notFound();
  }
  const videos = curriculum.videos.filter((item) => item.topic_id === topicId);

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 lg:py-16"
    >
      <nav aria-label="Course breadcrumbs" className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/students/dashboard" className="font-semibold text-[#286518] hover:underline">
          My Learning
        </Link>
        <span aria-hidden="true" className="text-slate-400">/</span>
        <Link href={courseHref} className="font-semibold text-[#286518] hover:underline">
          {course.code} topics
        </Link>
        <span aria-hidden="true" className="text-slate-400">/</span>
        <span className="text-slate-600">{topic.title}</span>
      </nav>

      <header className="risa-science-glass mt-6 rounded-[2rem] p-7 sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#286518]">
          {course.code} / Topic lessons
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-slate-950 sm:text-4xl">
          {topic.title}
        </h1>
        {topic.description && (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            {topic.description}
          </p>
        )}
        <p className="mt-5 text-xs font-semibold text-[#286518]">
          {videos.length} {videos.length === 1 ? "Video lesson" : "Video lessons"} ·
          Watch directly on RISA
        </p>
      </header>

      <section aria-labelledby="topic-videos-heading" className="mt-10">
        <h2
          id="topic-videos-heading"
          className="mb-6 font-heading text-2xl font-bold text-slate-950"
        >
          Video lessons
        </h2>
        <TopicVideoPlayer videos={videos} topicTitle={topic.title} />
      </section>

      <TopicQuizzes curriculum={curriculum} topicId={topic.id} />

      <Link
        href={courseHref}
        className="mt-12 inline-flex min-h-11 items-center rounded-xl border border-[#78eb29]/50 bg-[#eefce5] px-5 py-2 text-sm font-bold text-[#286518] transition hover:bg-white"
      >
        ← Browse other topics
      </Link>
    </main>
  );
}
