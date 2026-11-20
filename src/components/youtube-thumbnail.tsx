"use client";

import Image from "next/image";
import { useState } from "react";

import { getYouTubeThumbnailUrl } from "@/lib/youtube-media";

type YouTubeThumbnailProps = {
  videoId?: string | null;
  alt: string;
};

/** First lesson artwork, matching Edu-ca-te topic tiles. */
export function YouTubeThumbnail({ videoId, alt }: YouTubeThumbnailProps) {
  const [failedId, setFailedId] = useState<string | null>(null);
  const url = videoId ? getYouTubeThumbnailUrl(videoId) : null;
  const showThumbnail = url && failedId !== videoId;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[15px] bg-gradient-to-br from-[#EAF1FF] via-[#DCEBFF] to-[#C3DDF6]">
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-[#5274C3]"
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="size-12 opacity-60"
        >
          <rect x="9" y="14" width="46" height="36" rx="6" />
          <path d="m27 24 15 8-15 8z" fill="currentColor" stroke="none" />
        </svg>
      </div>
      {showThumbnail && (
        <Image
          src={url}
          alt={alt}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          unoptimized
          onError={() => setFailedId(videoId ?? null)}
          className="absolute inset-0 object-cover transition-transform duration-300 group-hover:scale-[1.035]"
        />
      )}
      {showThumbnail && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-black/10"
        >
          <span className="grid size-12 place-items-center rounded-full border border-white/80 bg-white/90 text-[#155DFC] shadow-xl">
            <svg viewBox="0 0 24 24" className="ml-0.5 size-5 fill-current">
              <path d="M7 4.8c0-.8.9-1.3 1.6-.9l11 7.2c.7.4.7 1.4 0 1.8l-11 7.2c-.7.4-1.6-.1-1.6-.9V4.8Z" />
            </svg>
          </span>
        </span>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/20 to-transparent"
      />
    </div>
  );
}
