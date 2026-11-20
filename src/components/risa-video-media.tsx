"use client";

import Image from "next/image";
import { useState } from "react";

import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/risa-youtube-media";

/** A thumbnail is never an external navigation link. */
export function YouTubeLessonThumbnail({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [broken, setBroken] = useState(false);
  const imageUrl = getYouTubeThumbnailUrl(videoId);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[0.85rem] bg-gradient-to-br from-[#e7f4ff] via-[#dae9fb] to-[#bcdbd0]">
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-3xl text-[#286518]/65"
      >
        ▶
      </div>
      {imageUrl && !broken && (
        <Image
          key={videoId}
          src={imageUrl}
          alt={"Thumbnail: " + title}
          fill
          sizes="(max-width: 640px) 95vw, (max-width: 1024px) 45vw, 400px"
          unoptimized
          onError={() => setBroken(true)}
          className="object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/30 to-transparent"
      />
    </div>
  );
}

/** Native YouTube player and controls, embedded inside the RISA page. */
export function InlineYouTubePlayer({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const url = getYouTubeEmbedUrl(videoId);
  if (!url) {
    return (
      <div
        role="alert"
        className="flex aspect-video items-center justify-center bg-slate-900 p-5 text-center text-sm text-white"
      >
        This lesson has an invalid video reference.
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-[0_12px_28px_rgba(21,50,90,0.18)]">
      <iframe
        key={videoId}
        src={url}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="block size-full border-0"
      />
    </div>
  );
}
