"use client";

import { useRef, useState } from "react";

import { YouTubeThumbnail } from "@/components/youtube-thumbnail";
import type { TopicVideo } from "@/lib/risa-course-curriculum";
import { getYouTubeEmbedUrl } from "@/lib/youtube-media";

type TopicVideoPlayerProps = {
  videos: TopicVideo[];
  topicTitle: string;
};

/**
 * Switches the embedded YouTube lesson in place, without external redirects.
 * The provider's native player controls are retained.
 */
export function TopicVideoPlayer({ videos, topicTitle }: TopicVideoPlayerProps) {
  const [selectedId, setSelectedId] = useState(videos[0]?.id ?? "");
  const playerRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    0,
    videos.findIndex((video) => video.id === selectedId),
  );
  const selected = videos[selectedIndex];
  const embedUrl = selected ? getYouTubeEmbedUrl(selected.youtube_id) : null;

  if (!selected) {
    return (
      <p className="rounded-xl bg-white/85 p-5 text-sm text-slate-600">
        No video lessons have been published for this topic yet.
      </p>
    );
  }

  function selectLesson(id: string) {
    setSelectedId(id);
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section aria-label={"Video lessons for " + topicTitle} className="space-y-6">
      <div
        ref={playerRef}
        className="scroll-mt-24 overflow-hidden rounded-[1.6rem] border border-[#DCE9F6] bg-[#F8FCFF] shadow-[0_12px_28px_rgba(46,61,85,0.10)]"
      >
        <div
          aria-hidden="true"
          className="h-1 bg-gradient-to-r from-[#155DFC] via-[#5274C3] to-[#78eb29]"
        />
        <div className="bg-gradient-to-br from-white via-[#F8FCFF] to-[#EDF7FF] px-5 py-5 sm:px-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#5274C3]">
            Now playing · Lesson {selectedIndex + 1} of {videos.length}
          </p>
          <h3 className="mt-2 font-heading text-xl font-extrabold text-[#0A0F1D] sm:text-2xl">
            {selected.title}
          </h3>
        </div>
        <div className="bg-black p-1.5 sm:p-3">
          <div className="aspect-video overflow-hidden rounded-lg bg-black sm:rounded-xl">
            {embedUrl ? (
              <iframe
                key={selected.id}
                src={embedUrl}
                title={selected.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="block size-full border-0"
              />
            ) : (
              <div className="flex size-full items-center justify-center p-5 text-center text-sm text-white">
                This lesson does not have a valid YouTube video ID.
              </div>
            )}
          </div>
        </div>
        <nav
          aria-label="Lesson navigation"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE9F6] bg-white/90 px-5 py-4 sm:px-7"
        >
          <p className="text-xs font-semibold text-slate-600">
            Watch here on RISA using YouTube&apos;s embedded player.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={selectedIndex === 0}
              onClick={() => selectLesson(videos[selectedIndex - 1].id)}
              className="min-h-10 rounded-xl border border-[#DCE9F6] bg-white px-4 py-2 text-xs font-bold text-[#204472] hover:bg-[#EAF1FF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={selectedIndex === videos.length - 1}
              onClick={() => selectLesson(videos[selectedIndex + 1].id)}
              className="min-h-10 rounded-xl bg-[#155DFC] px-4 py-2 text-xs font-bold text-white hover:bg-[#164CD4] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next lesson →
            </button>
          </div>
        </nav>
      </div>

      <div>
        <h4 className="font-heading text-lg font-bold text-slate-950">
          Lessons in this topic
        </h4>
        <p className="mt-1 text-xs text-slate-600">
          Select a thumbnail to change the video above.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video, index) => (
            <button
              key={video.id}
              type="button"
              onClick={() => selectLesson(video.id)}
              aria-pressed={selected.id === video.id}
              className={
                "group min-w-0 overflow-hidden rounded-[1.3rem] border-2 bg-white/85 p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] " +
                (selected.id === video.id
                  ? "border-[#155DFC]"
                  : "border-white/90 hover:border-[#C3DDF6]")
              }
            >
              <YouTubeThumbnail
                videoId={video.youtube_id}
                alt={"Thumbnail for " + video.title}
              />
              <div className="flex items-start gap-2 px-1 pt-3 pb-1">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#EAF1FF] text-xs font-extrabold text-[#155DFC]">
                  {index + 1}
                </span>
                <span className="min-w-0 text-sm font-bold leading-5 text-slate-900">
                  {video.title}
                </span>
              </div>
              {selected.id === video.id && (
                <p className="px-1 pb-2 text-xs font-semibold text-[#155DFC]">
                  Now playing
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
