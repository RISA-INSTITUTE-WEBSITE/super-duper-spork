"use client";

import { YouTubeLessonThumbnail } from "@/components/risa-video-media";
import type { CourseTopic, TopicVideo } from "@/lib/risa-course-curriculum";

type RisaTopicCardProps = {
  topic: CourseTopic;
  order: number;
  videos: TopicVideo[];
  quizCount?: number;
  locked?: boolean;
  onSelect: () => void;
};

function TopicQuizCount({ locked, quizCount }: { locked: boolean; quizCount?: number }) {
  if (locked || !quizCount) {
    return null;
  }
  return (
    <span className="font-medium text-slate-500">
      · {quizCount} {quizCount === 1 ? "quiz" : "quizzes"}
    </span>
  );
}

/**
 * Edu-ca-te-inspired Crystal Glass topic card, styled with RISA branding.
 * The caller supplies only the curriculum permitted by the course access gate.
 */
export function RisaTopicCard({
  topic,
  order,
  videos,
  quizCount,
  locked = false,
  onSelect,
}: RisaTopicCardProps) {
  const firstVideo = videos[0];
  const lessonLabel = videos.length === 1 ? "Lesson" : "Lessons";

  return (
    <button
      type="button"
      id={"topic-card-" + topic.id}
      onClick={onSelect}
      aria-label={
        (locked ? "Request access to " : "View ") +
        topic.title +
        ": " +
        videos.length +
        " " +
        lessonLabel.toLowerCase()
      }
      className="group flex h-full w-full cursor-pointer flex-col rounded-[26px] bg-[linear-gradient(145deg,#ffffff_0%,#e3e9ed_55%,#becbd3_100%)] p-[1px] text-left shadow-[0_12px_28px_rgba(46,61,85,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(46,61,85,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="relative isolate flex h-full w-full flex-col overflow-hidden rounded-[25px] border border-white/85 bg-[linear-gradient(160deg,rgba(255,255,255,0.92)_0%,rgba(250,252,255,0.80)_42%,rgba(224,235,241,0.80)_100%)] p-3.5 shadow-[inset_0_2px_8px_rgba(255,255,255,0.95),inset_0_-14px_22px_rgba(100,135,150,0.10)] backdrop-blur-md sm:p-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-3 h-10 rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.1)_75%)]"
        />
        <div className="relative z-10 mb-3 aspect-video overflow-hidden rounded-[16px] border-[3px] border-white bg-[#e5f0ff] shadow-[0_5px_16px_rgba(46,61,85,0.12)]">
          <div
            className={
              locked
                ? "size-full scale-105 blur-[7px] brightness-75"
                : "size-full transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transform-none"
            }
          >
            {firstVideo ? (
              <YouTubeLessonThumbnail
                videoId={firstVideo.youtube_id}
                title={firstVideo.title}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#eaf1ff] via-white to-[#e3f5de] text-[#286518]">
                <svg
                  aria-hidden="true"
                  className="size-11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 5.5c3.2-1.3 5.9-1.1 8 1v13c-2.1-2.1-4.8-2.3-8-1V5.5ZM12 6.5c2.1-2.1 4.8-2.3 8-1v13c-3.2-1.3-5.9-1.1-8 1" />
                </svg>
              </div>
            )}
          </div>
          {locked && (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/25 text-white">
              <svg
                aria-hidden="true"
                className="size-7 drop-shadow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <span className="rounded-full border border-white/60 bg-slate-950/50 px-3 py-1 text-[11px] font-bold backdrop-blur-sm">
                Enrol to unlock
              </span>
            </span>
          )}
        </div>

        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white bg-white/85 text-xs font-extrabold text-[#286518] shadow-sm">
            {String(order).padStart(2, "0")}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {videos.length} {lessonLabel.toLowerCase()}
          </span>
        </div>
        <h3 className="relative z-10 mt-3 line-clamp-2 font-heading text-base font-extrabold leading-snug text-[#0a2035] transition-colors group-hover:text-[#155DFC] sm:text-lg">
          {topic.title}
        </h3>
        {topic.description && (
          <p className="relative z-10 mt-2 line-clamp-2 text-xs leading-6 text-slate-600 sm:text-sm">
            {topic.description}
          </p>
        )}

        <div className="relative z-10 mt-auto flex items-center justify-between gap-2 border-t border-white/85 pt-4 text-xs font-bold text-slate-700">
          <span className="inline-flex min-w-0 items-center gap-2">
            <svg
              aria-hidden="true"
              className="size-5 shrink-0 text-[#286518]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="2.5" y="4" width="19" height="16" rx="3" />
              <path d="m10 9 5 3-5 3V9Z" />
            </svg>
            {videos.length} {lessonLabel}
            <TopicQuizCount locked={locked} quizCount={quizCount} />
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eefce5] text-[#286518] transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none">
            <svg
              aria-hidden="true"
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7 6 6 6-6 6M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}
