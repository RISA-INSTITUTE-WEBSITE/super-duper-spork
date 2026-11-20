/**
 * Video IDs are written by the RISA admin API after domain validation.
 * Revalidate here too before constructing a provider URL.
 */
export function getYouTubeThumbnailUrl(videoId: string): string | null {
  return /^[A-Za-z0-9_-]{11}$/.test(videoId)
    ? "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg"
    : null;
}

export function getYouTubeEmbedUrl(videoId: string): string | null {
  return /^[A-Za-z0-9_-]{11}$/.test(videoId)
    ? "https://www.youtube-nocookie.com/embed/" + videoId
    : null;
}
