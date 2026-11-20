import { describe, expect, it } from "vitest";

import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from "../../src/lib/risa-youtube-media";

describe("RISA inline YouTube video media URLs", () => {
  it("builds thumbnail and iframe sources for a validated YouTube ID", () => {
    expect(getYouTubeThumbnailUrl("dQw4w9WgXcQ")).toBe(
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    );
    expect(getYouTubeEmbedUrl("dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
    );
  });

  it.each([
    "https://evil.test/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "javascript:alert(1)",
    "short",
    "dQw4w9WgXcQ?autoplay=1",
    "",
  ])("never embeds an unvalidated video reference: %s", (input) => {
    expect(getYouTubeEmbedUrl(input)).toBeNull();
    expect(getYouTubeThumbnailUrl(input)).toBeNull();
  });

  it("supports permitted letters, digits, hyphens and underscores", () => {
    expect(getYouTubeThumbnailUrl("ABCdef-_123")).toContain(
      "/ABCdef-_123/",
    );
    expect(getYouTubeEmbedUrl("ABCdef-_123")).toContain(
      "/embed/ABCdef-_123?",
    );
  });
});
