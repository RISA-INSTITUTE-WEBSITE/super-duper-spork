"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  requestEnrolmentAction,
  type EnrolmentActionState,
} from "@/app/students/courses/[id]/actions";
import { YouTubeLessonThumbnail } from "@/components/risa-video-media";
import type { CoursePreviewCurriculum } from "@/lib/risa-course-curriculum";
import type { EnrolmentRequestStatus } from "@/lib/risa-course-enrolment";

const initialState: EnrolmentActionState = { status: "idle", message: "" };

type CoursePreviewProps = {
  courseId: string;
  courseName: string;
  curriculum: CoursePreviewCurriculum;
  requestStatus: EnrolmentRequestStatus | null;
};

export function LockedCoursePreview({
  courseId,
  courseName,
  curriculum,
  requestStatus,
}: CoursePreviewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    requestEnrolmentAction,
    initialState,
  );
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }
    closeButton.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDialogOpen(false);
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [dialogOpen]);

  const openPrompt = (title: string) => {
    setSelectedTitle(title);
    setDialogOpen(true);
  };

  return (
    <section aria-labelledby="preview-topics-heading" className="mt-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#286518]">
          Preview curriculum
        </p>
        <h2
          id="preview-topics-heading"
          className="mt-2 font-heading text-2xl font-bold text-slate-950 sm:text-3xl"
        >
          Explore course topics
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Topic titles and descriptions are visible to registered learners.
          Video previews are blurred until your enrolment is approved.
          Select a topic or locked lesson to request access.
        </p>
      </div>

      {curriculum.topics.length === 0 ? (
        <p className="risa-glass-card mt-7 rounded-2xl p-7 text-sm text-slate-600">
          RISA has not published any topics for this course yet.
        </p>
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {curriculum.topics.map((topic, index) => {
            const videos = curriculum.videos.filter(
              (video) => video.topic_id === topic.id,
            );
            return (
              <article
                key={topic.id}
                className="risa-glass-card flex flex-col overflow-hidden rounded-[1.6rem] p-4 sm:p-5"
              >
                <button
                  type="button"
                  onClick={() => openPrompt(topic.title)}
                  aria-label={"Request access to topic " + topic.title}
                  className="group relative w-full overflow-hidden rounded-xl border border-white bg-[#dbeafe] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286518]"
                >
                  <div className="pointer-events-none aspect-video overflow-hidden blur-[9px] brightness-75">
                    {videos.length ? (
                      <YouTubeLessonThumbnail
                        videoId={videos[0].youtube_id}
                        title={videos[0].title}
                      />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-[#155DFC] via-[#dbeafe] to-[#286518]" />
                    )}
                  </div>
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/25 text-white">
                    <span aria-hidden="true" className="text-3xl">🔒</span>
                    <span className="rounded-full border border-white/70 bg-black/40 px-4 py-1.5 text-xs font-bold backdrop-blur-sm">
                      Enrol to unlock lessons
                    </span>
                  </span>
                </button>

                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-lg bg-[#eefce5] px-3 py-1 text-xs font-bold text-[#286518]">
                    Topic {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {videos.length} {videos.length === 1 ? "video" : "videos"}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-xl font-bold text-slate-950">
                  {topic.title}
                </h3>
                {topic.description && (
                  <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">
                    {topic.description}
                  </p>
                )}

                {videos.length > 0 && (
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {videos.slice(0, 3).map((video) => (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() => openPrompt(video.title)}
                        aria-label={"Request enrolment to view " + video.title}
                        className="group relative overflow-hidden rounded-lg border border-white bg-white p-1 focus-visible:outline-2 focus-visible:outline-[#286518]"
                      >
                        <div className="pointer-events-none blur-[6px] brightness-75">
                          <YouTubeLessonThumbnail
                            videoId={video.youtube_id}
                            title={video.title}
                          />
                        </div>
                        <span className="absolute inset-0 flex items-center justify-center text-lg text-white drop-shadow" aria-hidden="true">
                          🔒
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => openPrompt(topic.title)}
                  className="mt-5 min-h-11 rounded-xl border border-[#286518]/20 bg-[#eefce5] px-4 py-2 text-sm font-bold text-[#286518] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-[#286518]"
                >
                  View topic · Enrol first
                </button>
              </article>
            );
          })}
        </div>
      )}

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 py-8 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDialogOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="risa-enrolment-title"
            aria-describedby="risa-enrolment-description"
            className="risa-science-glass w-full max-w-md rounded-[1.8rem] border border-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex justify-between gap-4">
              <span className="flex size-12 items-center justify-center rounded-xl bg-[#eefce5] text-2xl" aria-hidden="true">
                🔒
              </span>
              <button
                ref={closeButton}
                type="button"
                onClick={() => setDialogOpen(false)}
                aria-label="Close enrolment prompt"
                className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-700 focus-visible:outline-2 focus-visible:outline-[#286518]"
              >
                ×
              </button>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#286518]">
              RISA course access
            </p>
            <h2 id="risa-enrolment-title" className="mt-2 font-heading text-2xl font-bold text-slate-950">
              Enrol to unlock this course
            </h2>
            <p id="risa-enrolment-description" className="mt-3 text-sm leading-7 text-slate-700">
              Your RISA account lets you preview <strong>{courseName}</strong>.
              Request enrolment to access the complete lessons, quizzes and study resources
              after RISA approves your registration.
            </p>
            {selectedTitle && (
              <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm text-slate-700">
                Selected: <strong>{selectedTitle}</strong>
              </p>
            )}
            {(state.status !== "idle" || requestStatus) && (
              <p
                role="status"
                className={
                  "mt-5 rounded-xl border p-4 text-sm leading-6 " +
                  (state.status === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-[#78eb29]/40 bg-[#eefce5] text-[#286518]")
                }
              >
                {state.status !== "idle"
                  ? state.message
                  : requestStatus === "pending"
                    ? "Your existing enrolment request is awaiting RISA approval."
                    : "This course request has already been reviewed. Contact RISA for assistance."}
              </p>
            )}

            {!requestStatus && state.status !== "success" && state.status !== "existing" && (
              <form action={formAction} className="mt-6">
                <input type="hidden" name="courseId" value={courseId} />
                <button
                  type="submit"
                  disabled={pending}
                  className="min-h-12 w-full rounded-xl bg-[#286518] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-[#286518] disabled:opacity-60"
                >
                  {pending ? "Sending request..." : "Request course enrolment"}
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="mt-3 min-h-11 w-full rounded-xl border border-white bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              Continue previewing topics
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
