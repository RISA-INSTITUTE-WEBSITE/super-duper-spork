import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { RisaTopicCard } from "@/components/risa-topic-card";
import { StudentCourseContent } from "@/components/student-course-content";
import type { CourseCurriculum } from "@/lib/risa-course-curriculum";

vi.mock("@/components/risa-video-media", () => ({
  YouTubeLessonThumbnail: ({ title }: { title: string }) =>
    createElement("span", { "data-thumbnail": "true" }, title),
  InlineYouTubePlayer: () => createElement("span", { "data-player": "true" }),
}));

const topic = {
  id: "11111111-1111-4111-8111-111111111111",
  course_id: "22222222-2222-4222-8222-222222222222",
  title: "Mechanics",
  description: "Newton's laws and motion",
  is_published: true,
};

const video = {
  id: "33333333-3333-4333-8333-333333333333",
  topic_id: topic.id,
  title: "Introduction to forces",
  youtube_id: "M7lc1UVf-VE",
  is_published: true,
};

describe("RISA Edu-style topic cards", () => {
  it("renders the first lesson thumbnail, order and accurate lesson counts", () => {
    const html = renderToStaticMarkup(
      createElement(RisaTopicCard, {
        topic,
        order: 2,
        videos: [video],
        quizCount: 1,
        onSelect: () => {},
      }),
    );

    expect(html).toContain("Mechanics");
    expect(html).toContain("Introduction to forces");
    expect(html).toContain(">2</span>");
    expect(html).toContain("1 Lesson");
    expect(html).toContain("subject-chevron-action");
    expect(html).toContain("text-[#800000]");
    expect(html).toContain("View Mechanics");
    expect(html).toContain("topic-card-" + topic.id);
  });

  it("keeps unapproved topics locked without rendering a video player", () => {
    const html = renderToStaticMarkup(
      createElement(RisaTopicCard, {
        topic,
        order: 1,
        videos: [video],
        locked: true,
        onSelect: () => {},
      }),
    );

    expect(html).toContain("Request access to Mechanics");
    expect(html).toContain("Enrol to unlock");
    expect(html).toContain("blur-[7px]");
    expect(html).not.toContain("data-player");
    expect(html).not.toContain("1 quiz");
  });

  it("does not fabricate progress or lessons for empty topics", () => {
    const html = renderToStaticMarkup(
      createElement(RisaTopicCard, {
        topic,
        order: 1,
        videos: [],
        onSelect: () => {},
      }),
    );

    expect(html).toContain("0 Lessons");
    expect(html).not.toContain("Completed");
    expect(html).not.toContain("0 / 0 Done");
  });

  it("preserves enrolled topic listing and quiz metadata without preloading players", () => {
    const curriculum: CourseCurriculum = {
      topics: [topic],
      videos: [video],
      quizzes: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          topic_id: topic.id,
          title: "Practice quiz",
          description: "",
          is_published: true,
        },
      ],
      questions: [],
    };
    const html = renderToStaticMarkup(
      createElement(StudentCourseContent, { curriculum }),
    );

    expect(html).toContain("Choose a topic");
    expect(html).toContain("Mechanics");
    expect(html).toContain("1 Lesson");
    expect(html).toContain("subject-chevron-action");
    expect(html).not.toContain("data-player");
  });
});
