import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  createQuestionAction,
  createQuizAction,
  createTopicAction,
  createVideoAction,
} from "@/app/admin/courses/[id]/content/actions";
import { getStudentIdentity, isStudentAuthConfigured } from "@/lib/student-auth-api";
import { isRisaAdministrator } from "@/lib/risa-admin-api";
import {
  getCourseCurriculum,
  type CourseCurriculum,
  type CourseTopic,
  type TopicQuiz,
} from "@/lib/risa-course-curriculum";
import { getRisaCourseById } from "@/lib/risa-course-admin";
import { studentCookieNames } from "@/lib/student-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Course content | RISA Administration",
  robots: { index: false, follow: false },
};

const field =
  "mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-[#78eb29]";
const button =
  "mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-[#286518]";

function StatusNotice({ status }: { status?: string }) {
  if (!status) {
    return null;
  }
  const messages: Record<string, string> = {
    topic: "Topic created successfully.",
    video: "YouTube lesson saved.",
    quiz: "Quiz created. You can now add its questions.",
    question: "Multiple-choice question added.",
    invalid: "Please check the fields and try again.",
    failed: "The changes could not be saved. Please try again.",
  };
  const message = messages[status];
  if (!message) {
    return null;
  }
  const error = ["invalid", "failed"].includes(status);
  return (
    <p
      role={error ? "alert" : "status"}
      className={
        "my-6 rounded-xl border px-5 py-4 text-sm font-semibold " +
        (error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-green-200 bg-[#eefce5] text-[#286518]")
      }
    >
      {message}
    </p>
  );
}

function VisibilityCheckbox() {
  return (
    <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
      <input type="checkbox" name="published" defaultChecked className="accent-[#286518]" />
      Visible when the course is published and the learner is enrolled
    </label>
  );
}

function AddTopicForm({ courseId }: { courseId: string }) {
  return (
    <form action={createTopicAction} className="risa-science-glass rounded-[1.6rem] p-6 sm:p-8">
      <input type="hidden" name="courseId" value={courseId} />
      <h2 className="font-heading text-xl font-bold text-slate-950">Add a topic</h2>
      <p className="mt-2 text-sm text-slate-600">
        Organize lessons, exercises and quizzes under a course topic.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-800">
          Topic title
          <input name="title" className={field} minLength={2} maxLength={140} required placeholder="e.g. Introduction to Linux" />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Summary (optional)
          <textarea name="description" className={field} rows={2} maxLength={1500} placeholder="Learning outcomes and key ideas" />
        </label>
      </div>
      <div className="mt-4">
        <VisibilityCheckbox />
      </div>
      <button type="submit" className={button}>Create topic</button>
    </form>
  );
}

function AddVideoForm({ courseId, topicId }: { courseId: string; topicId: string }) {
  return (
    <form action={createVideoAction} className="rounded-xl border border-white bg-white/70 p-4">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="topicId" value={topicId} />
      <h4 className="text-sm font-bold text-slate-950">Embed YouTube lesson</h4>
      <label className="mt-3 block text-xs font-semibold text-slate-700">
        Video title
        <input name="title" className={field} maxLength={160} minLength={2} required placeholder="e.g. Linux command line basics" />
      </label>
      <label className="mt-3 block text-xs font-semibold text-slate-700">
        YouTube link
        <input name="youtubeUrl" type="text" className={field} required placeholder="https://www.youtube.com/watch?v=..." />
      </label>
      <p className="mt-2 text-xs text-slate-500">
        Supports YouTube watch, shorts, live, embed and youtu.be links.
      </p>
      <div className="mt-3"><VisibilityCheckbox /></div>
      <button type="submit" className={button}>Add video</button>
    </form>
  );
}

function AddQuizForm({ courseId, topicId }: { courseId: string; topicId: string }) {
  return (
    <form action={createQuizAction} className="rounded-xl border border-white bg-white/70 p-4">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="topicId" value={topicId} />
      <h4 className="text-sm font-bold text-slate-950">Create a quiz</h4>
      <label className="mt-3 block text-xs font-semibold text-slate-700">
        Quiz title
        <input name="title" className={field} minLength={2} maxLength={160} required placeholder="e.g. Linux knowledge checkpoint 1" />
      </label>
      <label className="mt-3 block text-xs font-semibold text-slate-700">
        Instructions (optional)
        <textarea name="description" className={field} rows={2} maxLength={800} placeholder="Answer the four-option questions." />
      </label>
      <div className="mt-3"><VisibilityCheckbox /></div>
      <button type="submit" className={button}>Create quiz</button>
    </form>
  );
}

function AddQuestionForm({
  courseId,
  topicId,
  quizId,
}: {
  courseId: string;
  topicId: string;
  quizId: string;
}) {
  return (
    <form action={createQuestionAction} className="mt-4 rounded-xl border border-[#78eb29]/40 bg-white/80 p-4">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="quizId" value={quizId} />
      <h5 className="text-sm font-bold text-slate-900">Add multiple-choice question</h5>
      <label className="mt-3 block text-xs font-semibold text-slate-700">
        Question
        <textarea name="prompt" className={field} rows={2} minLength={5} maxLength={500} required placeholder="What is the purpose of the Linux pwd command?" />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {["A", "B", "C", "D"].map((label, index) => (
          <label key={label} className="block text-xs font-semibold text-slate-700">
            Option {label}
            <input name={"choice" + index} className={field} maxLength={250} required placeholder={"Answer " + label} />
          </label>
        ))}
      </div>
      <label className="mt-3 block text-xs font-semibold text-slate-700">
        Correct answer
        <select name="correctIndex" className={field} defaultValue="0">
          <option value="0">Option A</option>
          <option value="1">Option B</option>
          <option value="2">Option C</option>
          <option value="3">Option D</option>
        </select>
      </label>
      <p className="mt-2 text-xs text-slate-500">
        Correct answers are kept in an administrator-only database table.
      </p>
      <button type="submit" className={button}>Save question</button>
    </form>
  );
}

function QuizCard({
  quiz,
  courseId,
  topicId,
  curriculum,
}: {
  quiz: TopicQuiz;
  courseId: string;
  topicId: string;
  curriculum: CourseCurriculum;
}) {
  const questions = curriculum.questions.filter((q) => q.quiz_id === quiz.id);
  return (
    <article className="rounded-xl border border-[#78eb29]/50 bg-[#eefce5]/65 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-heading text-lg font-bold text-slate-950">{quiz.title}</h4>
        <span className="text-xs font-bold text-[#286518]">
          {quiz.is_published ? "Visible" : "Draft"} · {questions.length} questions
        </span>
      </div>
      {quiz.description && <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>}
      {questions.map((question, index) => (
        <div key={question.id} className="mt-3 rounded-lg bg-white/85 p-4">
          <p className="text-sm font-semibold text-slate-900">
            {index + 1}. {question.prompt}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {question.choices.join(" · ")}
          </p>
        </div>
      ))}
      <AddQuestionForm courseId={courseId} topicId={topicId} quizId={quiz.id} />
    </article>
  );
}

function TopicCard({
  topic,
  courseId,
  curriculum,
}: {
  topic: CourseTopic;
  courseId: string;
  curriculum: CourseCurriculum;
}) {
  const videos = curriculum.videos.filter((video) => video.topic_id === topic.id);
  const quizzes = curriculum.quizzes.filter((quiz) => quiz.topic_id === topic.id);
  return (
    <section className="risa-glass-card rounded-[1.6rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-xl font-bold text-slate-950">{topic.title}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#286518]">
          {topic.is_published ? "Visible" : "Draft"}
        </span>
      </div>
      {topic.description && <p className="mt-3 text-sm text-slate-600">{topic.description}</p>}
      {videos.length > 0 && (
        <div className="my-5 space-y-2">
          <h4 className="text-sm font-bold text-slate-900">YouTube lessons</h4>
          {videos.map((video) => (
            <p key={video.id} className="rounded-lg bg-white/80 px-4 py-3 text-sm text-slate-700">
              <a href={"https://www.youtube.com/watch?v=" + video.youtube_id} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#155DFC] underline-offset-4 hover:underline">
                {video.title}
              </a>
              <span className="ml-2 text-xs text-slate-500">{video.is_published ? "Visible" : "Draft"}</span>
            </p>
          ))}
        </div>
      )}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <AddVideoForm courseId={courseId} topicId={topic.id} />
        <AddQuizForm courseId={courseId} topicId={topic.id} />
      </div>
      {quizzes.length > 0 && (
        <div className="mt-6 grid gap-4">
          <h4 className="text-sm font-bold text-slate-900">Quizzes and questions</h4>
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} courseId={courseId} topicId={topic.id} curriculum={curriculum} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function AdminCourseContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ result?: string }>;
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
  if (!(await isRisaAdministrator(token, identity.id))) {
    notFound();
  }

  const { id } = await params;
  const course = await getRisaCourseById(token, id);
  if (!course) {
    notFound();
  }
  const curriculum = await getCourseCurriculum(token, course.id, true);
  const { result } = await searchParams;

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 lg:py-16">
      <Link href="/admin/courses" className="text-sm font-semibold text-[#286518] hover:underline">
        ← Back to course management
      </Link>
      <div className="mt-6 mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#286518]">
          RISA / Admin / Course content
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-slate-950 sm:text-4xl">
          {course.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg bg-[#eefce5] px-3 py-1 font-mono font-bold text-[#286518]">{course.code}</span>
          <span className="rounded-lg bg-white px-3 py-1 font-semibold text-slate-700">
            {course.is_published ? "Course published" : "Course draft"}
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Build topics, embed YouTube lessons and write multiple-choice quizzes. Only enrolled
          learners can see published content within a published course.
        </p>
      </div>
      <StatusNotice status={result} />
      <AddTopicForm courseId={course.id} />
      <section aria-labelledby="topics-heading" className="mt-12">
        <h2 id="topics-heading" className="font-heading text-2xl font-bold text-slate-950">
          Course topics
        </h2>
        {!curriculum ? (
          <p role="alert" className="mt-5 rounded-xl bg-amber-50 p-5 text-sm text-amber-900">
            Course content could not be loaded. Please try again.
          </p>
        ) : curriculum.topics.length === 0 ? (
          <p className="risa-science-glass mt-5 rounded-xl p-6 text-sm text-slate-600">
            No topics yet. Create a topic above to start adding lessons and quizzes.
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            {curriculum.topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} courseId={course.id} curriculum={curriculum} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
