"use client";

import { useState } from "react";

import {
  InlineYouTubePlayer,
  YouTubeLessonThumbnail,
} from "@/components/risa-video-media";
import type { TopicVideo } from "@/lib/risa-course-curriculum";

/** Administrators can preview saved videos in place, without external navigation. */
export function AdminTopicVideoPreviews({ videos }: { videos: TopicVideo[] }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const activeVideo = videos.find((item) => item.id === activeVideoId) ?? videos[0];

  if (!activeVideo) {
    return null;
  }

  return (
    <section aria-label="Preview uploaded YouTube lessons" className="my-5 space-y-4">
      <h4 className="font-heading text-lg font-bold text-slate-950">
        YouTube lessons · preview inside RISA
      </h4>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(240px,1fr)]">
        <div className="min-w-0 rounded-[1.35rem] border border-white bg-white/75 p-3 sm:p-4">
          <InlineYouTubePlayer videoId={activeVideo.youtube_id} title={activeVideo.title} />
          <p className="mt-3 text-sm font-bold text-slate-900">{activeVideo.title}</p>
          <span className="mt-1 inline-block text-xs font-medium text-[#286518]">
            {activeVideo.is_published ? "Published lesson" : "Unpublished draft"}
          </span>
        </div>
        <div className="grid content-start gap-2">
          {videos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setActiveVideoId(video.id)}
              aria-pressed={video.id === activeVideo.id}
              aria-label={"Preview " + video.title}
              className={
                "flex min-w-0 items-center gap-3 rounded-xl border p-2 text-left transition focus-visible:outline-2 focus-visible:outline-[#286518] " +
                (video.id === activeVideo.id
                  ? "border-[#78eb29] bg-[#eefce5]"
                  : "border-white bg-white/80 hover:border-[#78eb29]")
              }
            >
              <div className="w-24 shrink-0 sm:w-28">
                <YouTubeLessonThumbnail videoId={video.youtube_id} title={video.title} />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-xs font-semibold text-slate-900 sm:text-sm">
                  {video.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {video.is_published ? "Published" : "Draft"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
