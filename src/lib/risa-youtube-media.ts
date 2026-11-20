/** RISA only renders fixed YouTube hosts for stored 11-character IDs. */
const youtubeIdPattern = /^[a-zA-Z0-9_-]{11}$/;

export function getYouTubeThumbnailUrl(videoId: string): string | null {
  return youtubeIdPattern.test(videoId)
    ? "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg"
    : null;
}

export function getYouTubeEmbedUrl(videoId: string): string | null {
  return youtubeIdPattern.test(videoId)
    ? "https://www.youtube-nocookie.com/embed/" + videoId + "?rel=0"
    : null;
}
