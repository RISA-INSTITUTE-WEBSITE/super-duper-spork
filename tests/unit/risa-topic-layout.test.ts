import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { RisaCourseBreadcrumb } from "@/components/risa-course-breadcrumb";
import { RisaTopicCard } from "@/components/risa-topic-card";
import {
  resolveCourseNavigation,
  StudentCourseContent,
  TopicDetails,
} from "@/components/student-course-content";
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
    expect(html).toContain("i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg");
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
      createElement(StudentCourseContent, {
        curriculum,
        courseName: "Mechanics 1",
        courseBanner: createElement("header", null, "PHY101 - Mechanics 1"),
      }),
    );

    expect(html).toContain('aria-label="Course breadcrumb"');
    expect(html).toContain("PHY101 - Mechanics 1");
    expect(html).toContain("Choose a topic");
    expect(html).not.toContain("RISA curriculum");
    expect(html).not.toContain("Select a topic to explore");
    expect(html).toContain("Mechanics");
    expect(html).toContain("1 Lesson");
    expect(html).toContain("subject-chevron-action");
    expect(html).not.toContain("data-player");
  });

  it("uses Edu-ca-te's clickable course/topic/video breadcrumb hierarchy", () => {
    const html = renderToStaticMarkup(
      createElement(RisaCourseBreadcrumb, {
        items: [
          { label: "Mechanics 1", onClick: () => {} },
          { label: "Physics and Measurement", onClick: () => {} },
          { label: "Introduction to forces" },
        ],
      }),
    );

    expect(html).toContain('aria-label="Course breadcrumb"');
    expect(html).toContain("Mechanics 1");
    expect(html).toContain("Physics and Measurement");
    expect(html).toContain("Introduction to forces");
    expect(html).toContain('aria-current="page"');
    expect(html.match(/<button/g)).toHaveLength(2);
    expect(html).not.toContain("Back to My Learning");
  });

  it("shows only the selected video and title in the lesson view", () => {
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
      createElement(TopicDetails, {
        topic,
        curriculum,
        selectedVideoId: video.id,
        onSelectVideo: () => {},
      }),
    );
    expect(html).toContain("Introduction to forces");
    expect(html).toContain('data-player="true"');
    expect(html).toContain('id="risa-topic-player"');
    expect(html).not.toContain("Lesson Video Playlist");
    expect(html).not.toContain("RISA · Course Topic");
    expect(html).not.toContain("Video Lessons");
    expect(html).not.toContain("Practice quizzes");
    expect(html).not.toContain("Lesson 1");
  });

  it("retains the topic banner and lesson list before a video is selected", () => {
    const curriculum: CourseCurriculum = {
      topics: [topic],
      videos: [video],
      quizzes: [],
      questions: [],
    };
    const html = renderToStaticMarkup(
      createElement(TopicDetails, {
        topic,
        curriculum,
        selectedVideoId: null,
        onSelectVideo: () => {},
      }),
    );

    expect(html).toContain("RISA · Course Topic");
    expect(html).toContain("Lesson Video Playlist (1)");
    expect(html).toContain("Introduction to forces");
    expect(html).not.toContain('data-player="true"');
  });

  it("rejects unknown topic or video URLs outside the authorized curriculum", () => {
    const curriculum: CourseCurriculum = {
      topics: [topic],
      videos: [video],
      quizzes: [],
      questions: [],
    };
    expect(
      resolveCourseNavigation(
        curriculum,
        new URLSearchParams("topic=" + topic.id + "&video=" + video.id),
      ),
    ).toEqual({ topicId: topic.id, videoId: video.id });
    expect(
      resolveCourseNavigation(
        curriculum,
        new URLSearchParams("topic=" + topic.id + "&video=unknown-video"),
      ),
    ).toEqual({ topicId: topic.id, videoId: null });
    expect(
      resolveCourseNavigation(
        curriculum,
        new URLSearchParams("topic=unknown-topic&video=" + video.id),
      ),
    ).toEqual({ topicId: null, videoId: null });
  });
});
