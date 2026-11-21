"use client";

import { useEffect, useState, type ReactNode } from "react";

import { RisaCourseBreadcrumb } from "@/components/risa-course-breadcrumb";
import { RisaTopicCard } from "@/components/risa-topic-card";
import {
  InlineYouTubePlayer,
  YouTubeLessonThumbnail,
} from "@/components/risa-video-media";
import { StudentPracticeQuiz } from "@/components/student-practice-quiz";
import type {
  CourseCurriculum,
  CourseTopic,
  TopicVideo,
} from "@/lib/risa-course-curriculum";

function topicVideos(curriculum: CourseCurriculum, topicId: string): TopicVideo[] {
  return curriculum.videos.filter((video) => video.topic_id === topicId);
}

/**
 * Only accept topic/video query parameters that are present in the learner's
 * already-authorized curriculum. URL state never grants access to content.
 */
export function resolveCourseNavigation(
  curriculum: CourseCurriculum,
  search: URLSearchParams,
): { topicId: string | null; videoId: string | null } {
  const topic = curriculum.topics.find((item) => item.id === search.get("topic"));
  const video = topic
    ? curriculum.videos.find(
        (item) => item.topic_id === topic.id && item.id === search.get("video"),
      )
    : undefined;
  return { topicId: topic?.id ?? null, videoId: video?.id ?? null };
}

function LessonSelector({
  video,
  order,
  isActive,
  onSelect,
}: {
  video: TopicVideo;
  order: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      id={"lesson-item-" + video.id}
      className="edu-topic-lesson-card group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[26px] p-4 sm:p-5"
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isActive}
        aria-label={"Open lesson " + order + ": " + video.title}
        className="relative flex flex-1 min-w-0 items-start gap-4 rounded-lg text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
      >
        <div className="relative w-28 sm:w-36 h-18 sm:h-22 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-200">
          <YouTubeLessonThumbnail videoId={video.youtube_id} title={video.title} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="w-8 h-8 rounded-full bg-[#155DFC] text-white flex items-center justify-center shadow-md">
              <svg
                aria-hidden="true"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m10 8 6 4-6 4V8Z" />
              </svg>
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full border border-[#DCE9F6] bg-[#EAF1FF] px-2.5 py-1 font-heading text-[11px] font-bold uppercase tracking-[0.075em] text-[#5274C3]">
              Lesson {order}
            </span>
            {isActive && (
              <span className="text-[11px] font-bold text-[#0D9488]">Now playing</span>
            )}
          </div>
          <h3 className="font-heading text-[17px] font-extrabold leading-[1.28] tracking-[-0.025em] text-[#0A0F1D] transition-colors group-hover:text-[#2814D1] sm:text-[19px]">
            {video.title}
          </h3>
        </div>
      </button>
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCE9F6] bg-white/70 text-[#2814D1]">
          <svg
            aria-hidden="true"
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 5 7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function TopicBanner({
  topic,
  lessonCount,
  quizCount,
}: {
  topic: CourseTopic;
  lessonCount: number;
  quizCount: number;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[26px] p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
      style={{ backgroundColor: "#5274C3" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.13),transparent_56%,rgba(0,0,0,0.12))]"
      />
      <div className="relative z-10 flex min-w-0 items-start sm:items-center gap-4">
        <div className="w-16 h-16 shrink-0 rounded-2xl border border-white/20 backdrop-blur-md flex items-center justify-center bg-white/15 text-white">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 7v14M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1h-5a4 4 0 0 0-4 4 4 4 0 0 0-4-4H4a1 1 0 0 1-1-1Z" />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-black/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white/90">
            RISA · Course Topic
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">
            {topic.title}
          </h2>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-white/85">
            {topic.description || "Explore the lesson playlist for this topic."}
          </p>
        </div>
      </div>
      <div className="relative z-10 flex flex-wrap items-center gap-2.5 md:justify-end">
        <div className="shrink-0 rounded-2xl border border-white/20 bg-black/20 px-4 py-2.5 text-center backdrop-blur-md">
          <p className="text-2xl font-black text-white">{lessonCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/85">
            Video Lessons
          </p>
        </div>
        {quizCount > 0 && (
          <div className="shrink-0 rounded-2xl border border-white/20 bg-black/20 px-4 py-2.5 text-center backdrop-blur-md">
            <p className="text-2xl font-black text-white">{quizCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/85">
              Practice Quizzes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicDetails({
  topic,
  curriculum,
  selectedVideoId,
  onSelectVideo,
}: {
  topic: CourseTopic;
  curriculum: CourseCurriculum;
  selectedVideoId: string | null;
  onSelectVideo: (videoId: string) => void;
}) {
  const videos = topicVideos(curriculum, topic.id);
  const quizzes = curriculum.quizzes.filter((quiz) => quiz.topic_id === topic.id);
  const currentVideo = videos.find((video) => video.id === selectedVideoId);

  return (
    <div className="space-y-6">
      <TopicBanner topic={topic} lessonCount={videos.length} quizCount={quizzes.length} />

      <section aria-labelledby="risa-topic-playlist-heading" className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#286518]"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m10 8 6 4-6 4V8Z" />
            </svg>
          </span>
          <h3
            id="risa-topic-playlist-heading"
            className="flex items-center gap-2 font-heading text-xl font-extrabold leading-snug tracking-[-0.02em] text-[#0A0F1D] sm:text-2xl"
          >
            Lesson Video Playlist ({videos.length})
          </h3>
        </div>
        {videos.length === 0 ? (
          <div className="rounded-[24px] border border-[#e0e7ef] bg-white p-8 text-center text-sm text-slate-600">
            Video lessons for this topic have not been published yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {videos.map((video, index) => (
              <LessonSelector
                key={video.id}
                video={video}
                order={index + 1}
                isActive={currentVideo?.id === video.id}
                onSelect={() => onSelectVideo(video.id)}
              />
            ))}
          </div>
        )}
      </section>

      {currentVideo && (
        <section
          id="risa-topic-player"
          aria-labelledby="playing-heading"
          className="scroll-mt-24 overflow-hidden rounded-[26px] border border-[#dce9f6] bg-[#f8fcff] shadow-[0_12px_28px_rgba(46,61,85,0.10)]"
        >
          <div
            aria-hidden="true"
            className="h-1 bg-gradient-to-r from-[#155DFC] via-[#38b6ff] to-[#286518]"
          />
          <div className="p-4 sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#286518]">
              Now playing on RISA
            </p>
            <h3
              id="playing-heading"
              className="mb-4 mt-2 font-heading text-xl font-extrabold text-[#0a2035] sm:text-2xl"
            >
              {currentVideo.title}
            </h3>
            <InlineYouTubePlayer
              videoId={currentVideo.youtube_id}
              title={currentVideo.title}
            />
            <p className="mt-3 text-xs text-slate-600">
              Lessons play here using YouTube&apos;s embedded player and native controls.
            </p>
          </div>
        </section>
      )}

      {quizzes.length > 0 && (
        <section aria-labelledby="topic-quiz-heading" className="space-y-5">
          <h3
            id="topic-quiz-heading"
            className="font-heading text-xl font-extrabold text-[#0a2035] sm:text-2xl"
          >
            Practice quizzes
          </h3>
          {quizzes.map((quiz) => (
            <StudentPracticeQuiz
              key={quiz.id}
              quiz={quiz}
              questions={curriculum.questions.filter((q) => q.quiz_id === quiz.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export function StudentCourseContent({
  curriculum,
  courseName,
  courseBanner,
}: {
  curriculum: CourseCurriculum;
  courseName: string;
  courseBanner: ReactNode;
}) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const selectedTopic = curriculum.topics.find((topic) => topic.id === selectedTopicId);
  const currentVideo = selectedTopic
    ? topicVideos(curriculum, selectedTopic.id).find(
        (video) => video.id === selectedVideoId,
      )
    : undefined;

  // Match Edu-ca-te's browser-history navigation while validating IDs against
  // the approved course curriculum returned by RISA's server.
  useEffect(() => {
    const syncFromUrl = () => {
      const navigation = resolveCourseNavigation(
        curriculum,
        new URLSearchParams(window.location.search),
      );
      setSelectedTopicId(navigation.topicId);
      setSelectedVideoId(navigation.videoId);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [curriculum]);

  const navigateTo = (topicId: string | null, videoId: string | null) => {
    const url = new URL(window.location.href);
    if (topicId) {
      url.searchParams.set("topic", topicId);
    } else {
      url.searchParams.delete("topic");
    }
    if (topicId && videoId) {
      url.searchParams.set("video", videoId);
    } else {
      url.searchParams.delete("video");
    }
    window.history.pushState(null, "", url.pathname + url.search + url.hash);
    setSelectedTopicId(topicId);
    setSelectedVideoId(videoId);
  };

  const showTopic = (topicId: string) => {
    navigateTo(topicId, null);
    document.getElementById("course-topic-content")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const selectVideo = (videoId: string) => {
    if (!selectedTopicId) {
      return;
    }
    navigateTo(selectedTopicId, videoId);
    requestAnimationFrame(() => {
      document.getElementById("risa-topic-player")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const showAllTopics = () => {
    navigateTo(null, null);
  };

  return (
    <>
      <RisaCourseBreadcrumb
        items={[
          { label: courseName, onClick: selectedTopic ? showAllTopics : undefined },
          ...(selectedTopic
            ? [
                {
                  label: selectedTopic.title,
                  onClick: currentVideo
                    ? () => navigateTo(selectedTopic.id, null)
                    : undefined,
                },
              ]
            : []),
          ...(currentVideo ? [{ label: currentVideo.title }] : []),
        ]}
      />
      {courseBanner}
      <section id="course-topic-content" className="mt-9 scroll-mt-24">
        {selectedTopic ? (
          <TopicDetails
            topic={selectedTopic}
            curriculum={curriculum}
            selectedVideoId={selectedVideoId}
            onSelectVideo={selectVideo}
          />
        ) : (
          <>
            <div className="mb-7">
              <h2 className="font-heading text-2xl font-extrabold text-[#0a2035] sm:text-3xl">
                Choose a topic
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {curriculum.topics.map((topic, index) => (
                <RisaTopicCard
                  key={topic.id}
                  topic={topic}
                  order={index + 1}
                  videos={topicVideos(curriculum, topic.id)}
                  quizCount={
                    curriculum.quizzes.filter((quiz) => quiz.topic_id === topic.id).length
                  }
                  onSelect={() => showTopic(topic.id)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
