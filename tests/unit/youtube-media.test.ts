import { describe, expect, it } from "vitest";

import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "../../src/lib/youtube-media";

describe("validated RISA video artwork and embedded player URLs", () => {
  const id = "dQw4w9WgXcQ";

  it("uses the official YouTube thumbnail for the first lesson in a topic", () => {
    expect(getYouTubeThumbnailUrl(id)).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    );
  });

  it("uses the privacy-enhanced on-page YouTube player", () => {
    expect(getYouTubeEmbedUrl(id)).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it.each([
    "",
    "too-short",
    "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "dQw4w9WgXcQ?autoplay=1",
    "<script>xss",
    "https://evil.example",
  ])("rejects invalid or untrusted IDs: %s", (value) => {
    expect(getYouTubeThumbnailUrl(value)).toBeNull();
    expect(getYouTubeEmbedUrl(value)).toBeNull();
  });
});
