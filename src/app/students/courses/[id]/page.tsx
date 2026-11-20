import type { Metadata } from "next";
import Link from "next/link";

import { StudentTopicCard } from "@/components/student-topic-card";
import { getVerifiedStudentCourse } from "@/lib/verified-student-course";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Course topics | My Learning",
  description: "Your enrolled RISA course topics and lessons.",
  robots: { index: false, follow: false },
};

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { course, curriculum } = await getVerifiedStudentCourse(id);

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 lg:py-16"
    >
      <Link
        href="/students/dashboard"
        className="inline-flex min-h-10 items-center text-sm font-semibold text-[#286518] underline-offset-4 hover:underline"
      >
        ← Back to My Learning
      </Link>

      <header className="risa-science-glass mt-6 rounded-[2rem] p-7 sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#286518]">
          My Learning / Enrolled course
        </p>
        <span className="mt-4 inline-flex rounded-lg bg-[#eefce5] px-3 py-1 font-mono text-sm font-bold text-[#286518]">
          {course.code}
        </span>
        <h1 className="mt-5 font-heading text-3xl font-bold text-slate-950 sm:text-4xl">
          {course.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          {course.description || "Explore your RISA course topics, lessons and quizzes."}
        </p>
        <p className="mt-5 text-xs font-semibold text-[#286518]">
          Private course content · Available to enrolled learners
        </p>
      </header>

      <section aria-labelledby="course-topics-heading" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#286518]">
              Learning pathways
            </p>
            <h2
              id="course-topics-heading"
              className="mt-2 font-heading text-2xl font-bold text-slate-950 sm:text-3xl"
            >
              Choose a topic
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Each card shows the first video lesson&apos;s thumbnail. Select a topic
              to watch its videos here on RISA and access practice quizzes.
            </p>
          </div>
          {curriculum && (
            <span className="rounded-full border border-white bg-[#eefce5] px-4 py-2 text-sm font-bold text-[#286518]">
              {curriculum.topics.length}{" "}
              {curriculum.topics.length === 1 ? "Topic" : "Topics"}
            </span>
          )}
        </div>
        {!curriculum ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
          >
            Course topics are temporarily unavailable. Please try again.
          </p>
        ) : curriculum.topics.length === 0 ? (
          <div className="risa-glass-card mt-6 rounded-[1.5rem] p-7">
            <h3 className="font-heading text-xl font-bold text-slate-950">
              Topics are coming soon
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              RISA has not yet published topics for this course.
            </p>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {curriculum.topics.map((topic, index) => (
              <StudentTopicCard
                key={topic.id}
                index={index}
                courseId={course.id}
                topic={topic}
                videos={curriculum.videos.filter((video) => video.topic_id === topic.id)}
                quizzes={curriculum.quizzes.filter((quiz) => quiz.topic_id === topic.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
