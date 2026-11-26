"use client";

import Image from "next/image";
import { useState } from "react";

import { getYouTubeThumbnailUrl } from "@/lib/risa-youtube-media";
import type { CourseTopic, TopicVideo } from "@/lib/risa-course-curriculum";

type TopicCardProps = {
  topic: CourseTopic;
  order: number;
  videos: TopicVideo[];
  quizCount?: number;
  locked?: boolean;
  onSelect: () => void;
};

// Exact Lucide-style icon outlines used by Edu-ca-te's topic cards,
// without requiring a new dependency in the RISA application.
function BookIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-9 w-9 opacity-60"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 7v14M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1h-5a4 4 0 0 0-4 4 4 4 0 0 0-4-4H4a1 1 0 0 1-1-1Z" />
    </svg>
  );
}

function MonitorPlayIcon() {
  return (
    <svg
      aria-hidden="true"
      className="relative h-4.5 w-4.5 text-[#800000] drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="m10 7 5 3-5 3V7ZM8 21h8M12 17v4" />
    </svg>
  );
}

function DoubleChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 17 5-5-5-5M13 17l5-5-5-5" />
    </svg>
  );
}

function TopicArtwork({
  topic,
  firstVideo,
  locked,
}: {
  topic: CourseTopic;
  firstVideo?: TopicVideo;
  locked: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const url = firstVideo ? getYouTubeThumbnailUrl(firstVideo.youtube_id) : null;
  return (
    <div
      className="relative mb-3 aspect-video overflow-hidden rounded-[16px] p-[2px]"
      style={{
        background:
          "linear-gradient(150deg, rgba(255,255,255,0.98), rgba(185,198,217,0.85))",
        boxShadow:
          "0 5px 16px rgba(46,61,85,0.12), inset 0 1px 3px rgba(255,255,255,0.92)",
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,#EAF1FF,#DCEBFF)]">
        <div className="absolute inset-0 flex items-center justify-center text-[#5274C3]">
          <BookIcon />
        </div>
        {url && !imageFailed && (
          <div
            className={
              locked
                ? "absolute inset-0 scale-105 blur-[7px] brightness-75"
                : "absolute inset-0"
            }
          >
            <Image
              key={url}
              src={url}
              alt={locked ? "" : "Thumbnail for " + topic.title + "'s first lesson"}
              fill
              unoptimized
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
              onError={() => setImageFailed(true)}
              className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            />
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent"
        />
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/45 text-white">
            <svg
              aria-hidden="true"
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <span className="rounded-full border border-white/60 bg-black/45 px-3 py-1 text-[11px] font-bold">
              Enrol to unlock
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicFooter({ totalLessons }: { totalLessons: number }) {
  return (
    <div
      className="relative z-10 mt-4 flex items-center justify-between gap-2 pt-3"
      style={{ borderTop: "1px solid rgba(255,255,255,0.6)" }}
    >
      <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-bold text-slate-700">
        <span className="relative isolate inline-flex h-5 w-5 shrink-0 items-center justify-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1.5 -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.98)_0%,rgba(255,221,226,0.55)_50%,rgba(255,255,255,0)_80%)] blur-[2px]"
          />
          <MonitorPlayIcon />
        </span>
        <span
          style={{ fontFamily: "var(--font-sora), 'Sora', sans-serif", fontWeight: 800 }}
        >
          {totalLessons} {totalLessons === 1 ? "Lesson" : "Lessons"}
        </span>
      </span>
      <span className="subject-chevron-action flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#800000]">
        <DoubleChevronIcon />
      </span>
    </div>
  );
}

function TopicHeading({
  topic,
  order,
  totalLessons,
}: {
  topic: CourseTopic;
  order: number;
  totalLessons: number;
}) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg px-1.5 text-xs font-extrabold text-[#5274C3]"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.82), rgba(232,236,241,0.86))",
            border: "1px solid rgba(255,255,255,0.85)",
            boxShadow: "inset 0 1px 3px rgba(255,255,255,0.85)",
          }}
        >
          {order}
        </span>
        <span className="text-[11px] font-semibold text-slate-600">
          {totalLessons} {totalLessons === 1 ? "Lesson" : "Lessons"}
        </span>
      </div>
      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#0A0F1D] transition-colors group-hover:text-[#2814D1] sm:text-base">
        {topic.title}
      </h3>
    </>
  );
}

/** Ported from Edu-ca-te's TopicCard.tsx: identical card layers, sizing,
 * highlights and footer; RISA keeps its existing protected preview controls.
 * Progress is intentionally not fabricated from unavailable RISA data.
 */
export function RisaTopicCard({
  topic,
  order,
  videos,
  locked = false,
  onSelect,
}: TopicCardProps) {
  const totalLessons = videos.length;
  return (
    <button
      id={"topic-card-" + topic.id}
      type="button"
      onClick={onSelect}
      aria-label={
        (locked ? "Request access to " : "View ") +
        topic.title +
        ": " +
        totalLessons +
        " " +
        (totalLessons === 1 ? "lesson" : "lessons")
      }
      className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[26px] p-[1px] text-left transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(228,232,238,0.95) 52%, rgba(188,196,207,0.95) 100%)",
        boxShadow: "0 12px 28px rgba(46,61,85,0.10), 0 3px 10px rgba(90,102,120,0.08)",
      }}
    >
      <div
        className="relative isolate flex h-full w-full flex-col justify-between overflow-hidden rounded-[25px] p-3.5 sm:p-4"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.44) 42%, rgba(224,228,234,0.36) 100%)",
          backdropFilter: "blur(8px) saturate(155%)",
          WebkitBackdropFilter: "blur(8px) saturate(155%)",
          boxShadow:
            "inset 0 2px 8px rgba(255,255,255,0.95), inset 0 -14px 22px rgba(140,148,160,0.10)",
          border: "1px solid rgba(255,255,255,0.82)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-3 -z-10 h-10 rounded-full opacity-80"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 100%)",
          }}
        />
        <div className="relative z-10">
          <TopicArtwork topic={topic} firstVideo={videos[0]} locked={locked} />
          <TopicHeading topic={topic} order={order} totalLessons={totalLessons} />
        </div>
        <TopicFooter totalLessons={totalLessons} />
      </div>
    </button>
  );
}
