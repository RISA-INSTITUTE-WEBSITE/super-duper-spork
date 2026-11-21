"use client";

import { useState } from "react";

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
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      aria-label={"Play lesson " + order + ": " + video.title}
      className={
        "group flex w-full min-w-0 items-center gap-3 rounded-[22px] border p-3 text-left shadow-[0_6px_18px_rgba(46,61,85,0.06)] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] sm:gap-5 sm:p-4 " +
        (isActive
          ? "border-[#91cba7] bg-[#edf8ed] shadow-[0_8px_24px_rgba(40,101,24,0.10)]"
          : "border-[#e0e7ef] bg-white hover:border-[#91cba7] hover:bg-[#f8fcff]")
      }
    >
      <span className="relative w-28 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-slate-100 shadow-sm sm:w-40">
        <YouTubeLessonThumbnail videoId={video.youtube_id} title={video.title} />
        <span className="absolute inset-0 flex items-center justify-center bg-slate-950/20">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#155DFC] text-white shadow-lg">
            <svg
              aria-hidden="true"
              className="size-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="m7 4 14 8-14 8V4Z" />
            </svg>
          </span>
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="inline-flex rounded-full border border-[#d9e6f7] bg-[#eaf1ff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#155DFC]">
          Lesson {String(order).padStart(2, "0")}
        </span>
        <span className="mt-2 block text-sm font-extrabold leading-snug text-[#0a2035] transition-colors group-hover:text-[#155DFC] sm:text-lg">
          {video.title}
        </span>
        <span className="mt-1 block text-xs font-semibold text-[#286518]">
          {isActive ? "Now playing" : "Watch lesson"}
        </span>
      </span>
      <svg
        aria-hidden="true"
        className="hidden size-5 shrink-0 text-[#286518] sm:block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 5 7 7-7 7" />
      </svg>
    </button>
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
    <header className="relative isolate overflow-hidden rounded-[26px] bg-[linear-gradient(120deg,#123550_0%,#155DFC_64%,#286518_130%)] p-6 text-white shadow-[0_14px_35px_rgba(24,68,112,0.17)] sm:p-8">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full border-[32px] border-white/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-32 size-56 rounded-full bg-[#78eb29]/15 blur-3xl"
      />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 max-w-2xl">
          <span className="inline-flex rounded-full border border-white/20 bg-black/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white/95">
            RISA · Course topic
          </span>
          <h2 className="mt-3 font-heading text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            {topic.title}
          </h2>
          {topic.description && (
            <p className="mt-3 text-sm leading-7 text-white/85">{topic.description}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-3">
          <div className="min-w-24 rounded-2xl border border-white/25 bg-black/15 px-4 py-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-extrabold">{lessonCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/85">
              Video lessons
            </p>
          </div>
          <div className="min-w-24 rounded-2xl border border-white/25 bg-black/15 px-4 py-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-extrabold">{quizCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/85">
              Practice quizzes
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function TopicDetails({
  topic,
  curriculum,
  selectedVideoId,
  onSelectVideo,
  onBack,
}: {
  topic: CourseTopic;
  curriculum: CourseCurriculum;
  selectedVideoId: string | null;
  onSelectVideo: (videoId: string) => void;
  onBack: () => void;
}) {
  const videos = topicVideos(curriculum, topic.id);
  const quizzes = curriculum.quizzes.filter((quiz) => quiz.topic_id === topic.id);
  const currentVideo = videos.find((video) => video.id === selectedVideoId) ?? videos[0];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#286518] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
      >
        <span aria-hidden="true">←</span> All course topics
      </button>

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
            className="font-heading text-xl font-extrabold text-[#0a2035] sm:text-2xl"
          >
            Lesson video playlist ({videos.length})
          </h3>
        </div>
        {videos.length === 0 ? (
          <div className="rounded-[24px] border border-[#e0e7ef] bg-white p-8 text-center text-sm text-slate-600">
            Video lessons for this topic have not been published yet.
          </div>
        ) : (
          <div className="grid gap-3">
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

export function StudentCourseContent({ curriculum }: { curriculum: CourseCurriculum }) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const selectedTopic = curriculum.topics.find((topic) => topic.id === selectedTopicId);

  const showTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setSelectedVideoId(topicVideos(curriculum, topicId)[0]?.id ?? null);
    document.getElementById("course-topic-content")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const selectVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
    document.getElementById("risa-topic-player")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const showAllTopics = () => {
    setSelectedTopicId(null);
    setSelectedVideoId(null);
  };

  return (
    <section id="course-topic-content" className="mt-9 scroll-mt-24">
      {selectedTopic ? (
        <TopicDetails
          topic={selectedTopic}
          curriculum={curriculum}
          selectedVideoId={selectedVideoId}
          onSelectVideo={selectVideo}
          onBack={showAllTopics}
        />
      ) : (
        <>
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#286518]">
              RISA curriculum
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold text-[#0a2035] sm:text-3xl">
              Choose a topic
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Select a topic to explore its ordered video lessons and practice quizzes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
