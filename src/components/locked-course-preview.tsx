"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  requestEnrolmentAction,
  type EnrolmentActionState,
} from "@/app/students/courses/[id]/actions";
import { ModuleTopicGroups } from "@/components/risa-module-topic-groups";
import type { CoursePreviewCurriculum } from "@/lib/risa-course-curriculum";
import type { EnrolmentRequestStatus } from "@/lib/risa-course-enrolment";

const initialState: EnrolmentActionState = { status: "idle", message: "" };

type CoursePreviewProps = {
  courseId: string;
  courseName: string;
  curriculum: CoursePreviewCurriculum;
  requestStatus: EnrolmentRequestStatus | null;
};

function PromptStatus({
  state,
  requestStatus,
}: {
  state: EnrolmentActionState;
  requestStatus: EnrolmentRequestStatus | null;
}) {
  if (state.status === "idle" && !requestStatus) {
    return null;
  }
  const message =
    state.status !== "idle"
      ? state.message
      : requestStatus === "pending"
        ? "Your existing enrolment request is awaiting RISA approval."
        : "This course request has already been reviewed. Contact RISA for assistance.";
  return (
    <p
      role="status"
      className={
        "mt-5 rounded-xl border p-4 text-sm leading-6 " +
        (state.status === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-[#78eb29]/40 bg-[#eefce5] text-[#286518]")
      }
    >
      {message}
    </p>
  );
}

function EnrolmentPrompt({
  courseId,
  courseName,
  selectedTitle,
  requestStatus,
  state,
  pending,
  formAction,
  onClose,
}: {
  courseId: string;
  courseName: string;
  selectedTitle: string | null;
  requestStatus: EnrolmentRequestStatus | null;
  state: EnrolmentActionState;
  pending: boolean;
  formAction: (formData: FormData) => void;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeButton.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [onClose]);

  const canRequest =
    !requestStatus && state.status !== "success" && state.status !== "existing";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
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
          <span
            className="flex size-12 items-center justify-center rounded-xl bg-[#eefce5] text-2xl"
            aria-hidden="true"
          >
            🔒
          </span>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close enrolment prompt"
            className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-700 focus-visible:outline-2 focus-visible:outline-[#286518]"
          >
            ×
          </button>
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#286518]">
          RISA course access
        </p>
        <h2
          id="risa-enrolment-title"
          className="mt-2 font-heading text-2xl font-bold text-slate-950"
        >
          Enrol to unlock this course
        </h2>
        <p
          id="risa-enrolment-description"
          className="mt-3 text-sm leading-7 text-slate-700"
        >
          Your RISA account lets you preview <strong>{courseName}</strong>. Request
          enrolment to access the complete lessons, quizzes and study resources after RISA
          approves your registration.
        </p>
        {selectedTitle && (
          <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm text-slate-700">
            Selected: <strong>{selectedTitle}</strong>
          </p>
        )}
        <PromptStatus state={state} requestStatus={requestStatus} />
        {canRequest && (
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
          onClick={onClose}
          className="mt-3 min-h-11 w-full rounded-xl border border-white bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
        >
          Continue previewing topics
        </button>
      </div>
    </div>
  );
}

export function LockedCoursePreview({
  courseId,
  courseName,
  curriculum,
  requestStatus,
}: CoursePreviewProps) {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    requestEnrolmentAction,
    initialState,
  );

  const openPrompt = (title: string) => setSelectedTitle(title);
  const closePrompt = () => setSelectedTitle(null);

  return (
    <section aria-labelledby="preview-topics-heading" className="mt-10">
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
        Topic titles and descriptions are visible to registered learners. Video previews
        are blurred until your enrolment is approved. Select a topic or locked lesson to
        request access.
      </p>
      <button
        type="button"
        onClick={() => openPrompt("Course enrolment")}
        className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#286518] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-[#286518]"
      >
        {requestStatus === "pending" ? "View enrolment request" : "Request enrolment"}
      </button>
      <ModuleTopicGroups
        curriculum={curriculum}
        locked
        onSelect={(_id, title) => openPrompt(title)}
      />
      {selectedTitle && (
        <EnrolmentPrompt
          courseId={courseId}
          courseName={courseName}
          selectedTitle={selectedTitle}
          requestStatus={requestStatus}
          state={state}
          pending={pending}
          formAction={formAction}
          onClose={closePrompt}
        />
      )}
    </section>
  );
}
