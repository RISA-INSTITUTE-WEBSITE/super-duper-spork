import Link from "next/link";

import { YouTubeThumbnail } from "@/components/youtube-thumbnail";
import type { CourseTopic, TopicQuiz, TopicVideo } from "@/lib/risa-course-curriculum";

type StudentTopicCardProps = {
  courseId: string;
  topic: CourseTopic;
  videos: TopicVideo[];
  quizzes: TopicQuiz[];
  index: number;
};

/** Mirrors Edu-ca-te's first-video thumbnail topic-card layout without fake progress. */
export function StudentTopicCard({
  courseId,
  topic,
  videos,
  quizzes,
  index,
}: StudentTopicCardProps) {
  const firstVideo = videos[0];
  const lessonCount = videos.length;
  const quizCount = quizzes.length;

  return (
    <Link
      href={"/students/courses/" + courseId + "/topics/" + topic.id}
      aria-label={
        "Open " +
        topic.title +
        ": " +
        lessonCount +
        " video lessons, " +
        quizCount +
        " quizzes"
      }
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[26px] border border-white/95 bg-gradient-to-br from-white/95 via-[#F5FAFF] to-[#DFEBFA] p-3.5 shadow-[0_12px_28px_rgba(46,61,85,0.10)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_17px_35px_rgba(37,87,149,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] sm:p-4"
    >
      <div className="rounded-[18px] border border-white/95 bg-white/65 p-0.5 shadow-[0_5px_16px_rgba(46,61,85,0.12)]">
        <YouTubeThumbnail
          videoId={firstVideo?.youtube_id}
          alt={
            firstVideo
              ? "First lesson thumbnail: " + firstVideo.title
              : "Topic awaiting its first video lesson"
          }
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white bg-[#EAF1FF] text-xs font-extrabold text-[#5274C3] shadow-sm">
          {index + 1}
        </span>
        <span className="text-xs font-semibold text-[#526480]">
          {lessonCount > 0 ? "Ready to watch" : "Videos coming soon"}
        </span>
      </div>

      <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-[#0A0F1D] transition group-hover:text-[#155DFC]">
        {topic.title}
      </h3>
      {topic.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {topic.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/90 pt-5">
        <span className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-700">
          <span aria-hidden="true" className="text-[#800000]">
            ▣
          </span>
          {lessonCount} {lessonCount === 1 ? "Lesson" : "Lessons"}
          {quizCount > 0 && (
            <span className="font-semibold text-slate-500">
              · {quizCount} {quizCount === 1 ? "Quiz" : "Quizzes"}
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[#EAF1FF] text-xl font-bold text-[#800000] transition group-hover:bg-[#155DFC] group-hover:text-white"
        >
          »
        </span>
      </div>
    </Link>
  );
}
