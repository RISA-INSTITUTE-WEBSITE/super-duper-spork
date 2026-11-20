"use client";

import { useState } from "react";

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

type TopicTileProps = {
  topic: CourseTopic;
  order: number;
  curriculum: CourseCurriculum;
  onOpen: (topicId: string, videoId?: string) => void;
};

function TopicTile({ topic, order, curriculum, onOpen }: TopicTileProps) {
  const videos = topicVideos(curriculum, topic.id);
  const quizzes = curriculum.quizzes.filter((quiz) => quiz.topic_id === topic.id);
  const firstVideo = videos[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-white/90 bg-[linear-gradient(155deg,rgba(255,255,255,0.94),rgba(230,235,242,0.84))] p-3.5 shadow-[0_12px_28px_rgba(46,61,85,0.09)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-4">
      <button
        type="button"
        onClick={() => onOpen(topic.id)}
        aria-label={"Open topic " + topic.title}
        className="flex flex-1 cursor-pointer flex-col rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518]"
      >
        <div className="w-full overflow-hidden rounded-[1.1rem] border-2 border-white bg-[#e8f1ff] shadow-sm">
          {firstVideo ? (
            <YouTubeLessonThumbnail
              key={firstVideo.id}
              videoId={firstVideo.youtube_id}
              title={firstVideo.title}
            />
          ) : (
            <div
              className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#e9f2ff] via-white to-[#e0f2d3] text-5xl text-[#286518]/60"
              aria-hidden="true"
            >
              ◇
            </div>
          )}
        </div>
        <div className="mt-4 flex w-full items-center justify-between gap-3">
          <span className="rounded-lg border border-white bg-white/80 px-2.5 py-1 text-xs font-extrabold text-[#286518]">
            {String(order).padStart(2, "0")}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {videos.length} {videos.length === 1 ? "lesson" : "lessons"}
          </span>
        </div>
        <h3 className="mt-3 font-heading text-lg font-extrabold text-slate-950 transition-colors group-hover:text-[#286518]">
          {topic.title}
        </h3>
        {topic.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {topic.description}
          </p>
        )}
        <div className="mt-auto flex w-full items-center justify-between gap-3 border-t border-white/90 pt-4 text-sm">
          <span className="font-semibold text-slate-600">
            {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
          </span>
          <span className="font-bold text-[#286518]">View topic ›</span>
        </div>
      </button>

      {videos.length > 0 && (
        <div className="mt-4 border-t border-white/90 pt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Lesson previews
          </p>
          <div className="grid grid-cols-3 gap-2">
            {videos.slice(0, 3).map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() => onOpen(topic.id, video.id)}
                aria-label={"Play " + video.title + " inside RISA"}
                title={video.title}
                className="overflow-hidden rounded-xl border border-white bg-white p-1 transition hover:border-[#78eb29] focus-visible:outline-2 focus-visible:outline-[#286518]"
              >
                <YouTubeLessonThumbnail videoId={video.youtube_id} title={video.title} />
              </button>
            ))}
          </div>
          {videos.length > 3 && (
            <p className="mt-2 text-xs text-slate-500">
              +{videos.length - 3} more lessons inside this topic
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function LessonSelector({
  video,
  isActive,
  onSelect,
}: {
  video: TopicVideo;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={
        "flex min-w-0 items-center gap-3 rounded-[1.15rem] border p-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-[#286518] " +
        (isActive
          ? "border-[#78eb29] bg-[#eefce5]"
          : "border-white bg-white/85 hover:border-[#a0d987]")
      }
    >
      <div className="w-24 shrink-0 overflow-hidden rounded-lg sm:w-32">
        <YouTubeLessonThumbnail videoId={video.youtube_id} title={video.title} />
      </div>
      <span className="min-w-0">
        <span className="block text-xs font-bold text-slate-900 sm:text-sm">
          {video.title}
        </span>
        <span className="mt-1 block text-xs font-semibold text-[#286518]">
          {isActive ? "Now playing" : "Play on RISA"}
        </span>
      </span>
    </button>
  );
}

type TopicDetailsProps = {
  topic: CourseTopic;
  curriculum: CourseCurriculum;
  selectedVideoId: string | null;
  onSelectVideo: (videoId: string) => void;
  onBack: () => void;
};

function TopicDetails({
  topic,
  curriculum,
  selectedVideoId,
  onSelectVideo,
  onBack,
}: TopicDetailsProps) {
  const videos = topicVideos(curriculum, topic.id);
  const quizzes = curriculum.quizzes.filter((quiz) => quiz.topic_id === topic.id);
  const currentVideo = videos.find((video) => video.id === selectedVideoId) ?? videos[0];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center text-sm font-bold text-[#286518] hover:underline focus-visible:outline-2 focus-visible:outline-[#286518]"
      >
        ← All course topics
      </button>
      <header className="risa-glass-card rounded-[1.5rem] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#286518]">
          Course topic
        </p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-slate-950 sm:text-3xl">
          {topic.title}
        </h2>
        {topic.description && (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            {topic.description}
          </p>
        )}
      </header>
      {currentVideo ? (
        <section
          aria-labelledby="playing-heading"
          className="risa-science-glass rounded-[1.6rem] p-4 sm:p-7"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#286518]">
            Now playing on RISA
          </p>
          <h3
            id="playing-heading"
            className="mb-4 mt-2 font-heading text-xl font-bold text-slate-950"
          >
            {currentVideo.title}
          </h3>
          <InlineYouTubePlayer
            videoId={currentVideo.youtube_id}
            title={currentVideo.title}
          />
          <p className="mt-3 text-xs text-slate-600">
            This lesson plays here using YouTube&apos;s embedded player and controls.
          </p>
        </section>
      ) : (
        <div className="risa-science-glass rounded-[1.5rem] p-6 text-sm text-slate-600">
          Video lessons for this topic have not been published yet.
        </div>
      )}
      {videos.length > 0 && (
        <section
          aria-label="Videos in this topic"
          className="risa-glass-card rounded-[1.5rem] p-5 sm:p-7"
        >
          <h3 className="font-heading text-xl font-bold text-slate-950">Video lessons</h3>
          <p className="mt-2 text-sm text-slate-600">
            Choose a thumbnail to switch lessons without leaving this page.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {videos.map((video) => (
              <LessonSelector
                key={video.id}
                video={video}
                isActive={currentVideo?.id === video.id}
                onSelect={() => onSelectVideo(video.id)}
              />
            ))}
          </div>
        </section>
      )}
      {quizzes.length > 0 && (
        <section aria-labelledby="topic-quiz-heading" className="space-y-5">
          <h3
            id="topic-quiz-heading"
            className="font-heading text-xl font-bold text-slate-950"
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

  const showTopic = (topicId: string, videoId?: string) => {
    setSelectedTopicId(topicId);
    setSelectedVideoId(videoId ?? topicVideos(curriculum, topicId)[0]?.id ?? null);
    document.getElementById("course-topic-content")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section id="course-topic-content" className="mt-9 scroll-mt-24">
      {selectedTopic ? (
        <TopicDetails
          topic={selectedTopic}
          curriculum={curriculum}
          selectedVideoId={selectedVideoId}
          onSelectVideo={setSelectedVideoId}
          onBack={() => {
            setSelectedTopicId(null);
            setSelectedVideoId(null);
          }}
        />
      ) : (
        <>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#286518]">
              Curriculum topics
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-slate-950 sm:text-3xl">
              Choose a topic
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Each topic shows the thumbnail of its first published video, with lesson
              previews below.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {curriculum.topics.map((topic, index) => (
              <TopicTile
                key={topic.id}
                topic={topic}
                order={index + 1}
                curriculum={curriculum}
                onOpen={showTopic}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
