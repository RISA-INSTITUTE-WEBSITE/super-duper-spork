import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { StudentPracticeQuiz } from "@/components/student-practice-quiz";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import {
  getCourseCurriculum,
  type CourseCurriculum,
  type CourseTopic,
} from "@/lib/risa-course-curriculum";
import { getRisaCourseById } from "@/lib/risa-course-admin";
import { getEnrolledCourses } from "@/lib/student-learning-api";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Course lessons | My Learning",
  robots: { index: false, follow: false },
};

function StudentTopic({
  topic,
  curriculum,
}: {
  topic: CourseTopic;
  curriculum: CourseCurriculum;
}) {
  const videos = curriculum.videos.filter((item) => item.topic_id === topic.id);
  const quizzes = curriculum.quizzes.filter((item) => item.topic_id === topic.id);

  return (
    <section className="risa-glass-card rounded-[1.75rem] p-6 sm:p-8">
      <h2 className="font-heading text-2xl font-bold text-slate-950">{topic.title}</h2>
      {topic.description && (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{topic.description}</p>
      )}
      {videos.length > 0 && (
        <div className="mt-7 space-y-6">
          <h3 className="font-heading text-lg font-bold text-slate-950">Video lessons</h3>
          {videos.map((video) => (
            <article key={video.id} className="overflow-hidden rounded-[1.3rem] border border-white bg-white/90">
              <div className="aspect-video w-full bg-slate-950">
                <iframe
                  src={"https://www.youtube-nocookie.com/embed/" + video.youtube_id}
                  title={video.title}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="size-full border-0"
                />
              </div>
              <h4 className="p-4 text-sm font-bold text-slate-900 sm:px-6">{video.title}</h4>
            </article>
          ))}
        </div>
      )}
      {quizzes.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="font-heading text-lg font-bold text-slate-950">Practice quizzes</h3>
          {quizzes.map((quiz) => (
            <StudentPracticeQuiz
              key={quiz.id}
              quiz={quiz}
              questions={curriculum.questions.filter((item) => item.quiz_id === quiz.id)}
            />
          ))}
        </div>
      )}
      {!videos.length && !quizzes.length && (
        <p className="mt-5 rounded-xl border border-white bg-white/75 p-5 text-sm text-slate-600">
          Lessons and quizzes for this topic have not been published yet.
        </p>
      )}
    </section>
  );
}

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isStudentAuthConfigured()) {
    redirect("/students/login");
  }
  const jar = await cookies();
  const token = jar.get(studentCookieNames.access)?.value;
  if (!token) {
    redirect("/students/login");
  }
  const identity = await getStudentIdentity(token);
  if (!identity) {
    redirect("/students/login");
  }

  const { id } = await params;
  const enrolled = await getEnrolledCourses(token, identity.id);
  if (!enrolled?.some((course) => course.id === id)) {
    notFound();
  }
  const course = await getRisaCourseById(token, id);
  if (!course) {
    notFound();
  }
  const curriculum = await getCourseCurriculum(token, course.id);

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 lg:py-16"
    >
      <Link
        href="/students/dashboard"
        className="text-sm font-semibold text-[#286518] hover:underline"
      >
        ← Back to My Learning
      </Link>
      <header className="risa-science-glass mt-6 rounded-[2rem] p-7 sm:p-10">
        <span className="rounded-lg bg-[#eefce5] px-3 py-1 font-mono text-sm font-bold text-[#286518]">
          {course.code}
        </span>
        <h1 className="mt-5 font-heading text-3xl font-bold text-slate-950 sm:text-4xl">
          {course.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          {course.description || "Your enrolled RISA course."}
        </p>
        <p className="mt-4 text-xs font-semibold text-[#286518]">
          Private learning content · Available to enrolled learners
        </p>
      </header>

      <div className="mt-9 space-y-6">
        {!curriculum ? (
          <p role="alert" className="rounded-xl bg-amber-50 p-5 text-sm text-amber-900">
            Course content is currently unavailable. Please try again.
          </p>
        ) : curriculum.topics.length === 0 ? (
          <div className="risa-glass-card rounded-[1.5rem] p-7">
            <h2 className="font-heading text-xl font-bold text-slate-950">
              Lessons are coming soon
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              RISA has not yet published topics for this course.
            </p>
          </div>
        ) : (
          curriculum.topics.map((topic) => (
            <StudentTopic key={topic.id} topic={topic} curriculum={curriculum} />
          ))
        )}
      </div>
    </main>
  );
}
